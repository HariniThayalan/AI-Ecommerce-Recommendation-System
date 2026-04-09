"""
main.py — ShopSmart AI FastAPI Backend v3
Run: uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid
import os
import hmac, hashlib
import razorpay
from dotenv import load_dotenv
import firebase_db as fdb

# Load .env file
load_dotenv()

from data_loader import load_and_format, format_product
from recommendation_engine import RecommendationEngine

app = FastAPI(title="ShopSmart AI", version="3.0.0")

# Enable CORS for Frontend Development and Production
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN, "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global state ───────────────────────────────────────────────────────────────
df     = None
engine: Optional[RecommendationEngine] = None

razorpay_client = razorpay.Client(
    auth=(
        os.getenv("RAZORPAY_KEY_ID", ""),
        os.getenv("RAZORPAY_KEY_SECRET", "")
    )
)


@app.on_event("startup")
async def startup():
    global df, engine
    df = load_and_format("cleaned_data.csv")
    df = df.drop_duplicates("ProdID")
    engine = RecommendationEngine(df)
    prods  = df["ProdID"].nunique()
    users  = df["User's ID"].nunique()
    print(f"✅ Loaded {len(df)} rows | {prods} products | {users} users")


# ── Health ─────────────────────────────────────────────────────────────────────
@app.get("/")
def health():
    return {
        "status":   "ok",
        "products": int(df["ProdID"].nunique()) if df is not None else 0,
        "version":  "3.0.0",
    }


# ── Products ───────────────────────────────────────────────────────────────────
@app.get("/products")
def get_products(
    category: Optional[str] = None,
    q:        Optional[str] = None,
    rating:   Optional[float] = None,
    max_price: Optional[float] = None,
    limit:  int = Query(48, ge=1, le=200),
    offset: int = Query(0,  ge=0),
):
    if df is None:
        raise HTTPException(503, "Data not loaded")
    subset = df.drop_duplicates("ProdID").copy()

    if category and category.lower() not in ("all", ""):
        subset = subset[subset["Category"].str.contains(category, case=False, na=False)]
    if q:
        ql   = q.lower()
        mask = (
            subset["Name"].str.lower().str.contains(ql, na=False)
            | subset["Brand"].str.lower().str.contains(ql, na=False)
            | subset["Category"].str.lower().str.contains(ql, na=False)
        )
        subset = subset[mask]
        
    if rating is not None:
        # User wants "particular range of rating", so if rating=4, it means 4.0 <= r <= 5.0
        # If rating=3, it means 3.0 <= r < 4.0
        max_r = 5.1 if rating == 4 else rating + 1
        subset = subset[(subset["Rating"] >= rating) & (subset["Rating"] < max_r)]
        
    if max_price is not None:
        # Price is generated deterministically based on ProdID
        subset["seed"] = subset["ProdID"] % 1000
        subset["price"] = 199 + subset["seed"] * 9.5
        subset["discount"] = (subset["ProdID"] % 6).map({0:0, 1:0, 2:5, 3:10, 4:15, 5:20})
        subset["final_price"] = subset["price"] * (1 - subset["discount"] / 100)
        subset = subset[subset["final_price"] <= max_price]

    total = len(subset)
    page  = subset.iloc[offset: offset + limit]
    return {
        "products": [format_product(r) for _, r in page.iterrows()],
        "total":    total,
        "limit":    limit,
        "offset":   offset,
    }


@app.get("/products/{product_id}")
def get_product(product_id: str):
    if df is None:
        raise HTTPException(503, "Data not loaded")
    row = df[df["ProdID"].astype(str) == product_id].drop_duplicates("ProdID")
    if row.empty:
        raise HTTPException(404, "Product not found")
    return format_product(row.iloc[0])


# ── Recommendations ────────────────────────────────────────────────────────────
@app.get("/recommend/top-rated")
def top_rated(n: int = Query(24, ge=1, le=100)):
    return {"recommendations": engine.get_top_rated(n), "mode": "top_rated"}


@app.get("/recommend/content/{product_id}")
def content_recs(product_id: str, n: int = Query(12, ge=1, le=50)):
    try:
        recs = engine.get_content_based(int(product_id), n)
        return {"recommendations": recs, "mode": "content", "product_id": product_id}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/recommend/collaborative/{user_id}")
def collab_recs(user_id: str, n: int = Query(12, ge=1, le=50)):
    try:
        uid = int(user_id) if user_id.isdigit() else 1705
        recs = engine.get_collaborative(uid, n)
        return {"recommendations": recs, "mode": "collaborative", "user_id": user_id}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/recommend/hybrid/{user_id}/{product_id}")
def hybrid_recs(user_id: str, product_id: str, n: int = Query(12, ge=1, le=50)):
    try:
        uid = int(user_id) if user_id.isdigit() else 1705
        pid = int(product_id) if product_id.isdigit() else 1
        recs = engine.get_hybrid(uid, pid, n)
        return {"recommendations": recs, "mode": "hybrid"}
    except Exception as e:
        raise HTTPException(500, str(e))


# ── Cart ───────────────────────────────────────────────────────────────────────
class CartItemIn(BaseModel):
    product:  dict
    quantity: int = 1


@app.get("/cart/{user_id}")
def get_cart(user_id: str):
    return {"items": fdb.get_cart(user_id)}


@app.post("/cart/{user_id}/add")
def add_to_cart(user_id: str, body: CartItemIn):
    cart = fdb.add_to_cart(user_id, body.product, body.quantity)
    return {"status": "ok", "cart": cart}


@app.put("/cart/{user_id}/quantity")
def update_qty(user_id: str, product_id: str, quantity: int):
    cart = fdb.update_cart_qty(user_id, product_id, quantity)
    return {"cart": cart}


@app.delete("/cart/{user_id}/remove/{product_id}")
def remove_from_cart(user_id: str, product_id: str):
    cart = fdb.remove_from_cart(user_id, product_id)
    return {"cart": cart}


# ── Orders ─────────────────────────────────────────────────────────────────────
class OrderIn(BaseModel):
    user_id:        str
    items:          list
    subtotal:       float
    discount:       float
    gst:            float
    grand_total:    float
    payment_method: str
    address:        dict


@app.post("/orders")
def place_order(order: OrderIn):
    order_id = "ORD-" + str(uuid.uuid4())[:8].upper()
    data = {**order.dict(), "order_id": order_id, "status": "Confirmed"}
    fdb.save_order(order_id, data)
    fdb.clear_cart(order.user_id)
    return {"order_id": order_id, "status": "Confirmed"}


@app.get("/orders/{user_id}")
def get_orders(user_id: str):
    return fdb.get_orders(user_id)


# ── Razorpay Payment ──────────────────────────────────────────────────────────
class RazorpayOrderIn(BaseModel):
    amount:   float
    currency: str = "INR"
    receipt:  str


@app.post("/payment/create-order")
async def create_razorpay_order(body: RazorpayOrderIn):
    try:
        rz_order = razorpay_client.order.create({
            "amount": int(body.amount * 100),
            "currency": body.currency,
            "receipt": body.receipt,
            "payment_capture": 1
        })
        return {
            "razorpay_order_id": rz_order["id"],
            "amount": rz_order["amount"],
            "currency": rz_order["currency"],
            "key_id": os.getenv("RAZORPAY_KEY_ID"),
        }
    except Exception as e:
        raise HTTPException(500, f"Razorpay error: {e}")


class PaymentVerifyIn(BaseModel):
    razorpay_order_id:   str
    razorpay_payment_id: str
    razorpay_signature:  str
    user_id:      str
    items:        list
    grand_total:  float
    address:      dict
    payment_method: str = "razorpay"


@app.post("/payment/verify")
async def verify_payment(body: PaymentVerifyIn):
    msg = f"{body.razorpay_order_id}|{body.razorpay_payment_id}"
    # Bypass for demo/presentation with fake_sig
    if body.razorpay_signature != "fake_sig":
        expected = hmac.new(
            os.getenv("RAZORPAY_KEY_SECRET", "").encode(),
            msg.encode(),
            hashlib.sha256
        ).hexdigest()

        if expected != body.razorpay_signature:
            raise HTTPException(400, "Payment verification failed")

    order_id = "ORD-" + str(uuid.uuid4())[:8].upper()
    order_data = {
        "order_id": order_id,
        "razorpay_payment_id": body.razorpay_payment_id,
        "razorpay_order_id":   body.razorpay_order_id,
        "user_id":      body.user_id,
        "items":        body.items,
        "grand_total":  body.grand_total,
        "address":      body.address,
        "payment_method": "razorpay",
        "status": "Confirmed",
    }
    fdb.save_order(order_id, order_data)
    fdb.clear_cart(body.user_id)
    return {"order_id": order_id, "status": "Confirmed"}


# ── Wishlist ───────────────────────────────────────────────────────────────────
@app.post("/wishlist/{user_id}/toggle")
def toggle_wishlist(user_id: str, product_id: str):
    status = fdb.toggle_wishlist(user_id, product_id)
    return {"status": status}


@app.get("/wishlist/{user_id}")
def get_wishlist(user_id: str):
    return {"product_ids": fdb.get_wishlist(user_id)}

@app.get("/recommend/{user_id}")
def smart_recommend(user_id: str, product_id: int = None, n: int = 12):

    if engine is None:
        raise HTTPException(503, "Engine not ready")

    # New user
    try:
        uid = int(user_id)
    except:
        return {
            "mode": "error",
            "message": "Invalid user_id"
        }

    # Check empty first
    if engine.user_sim.empty:
        return {
            "mode": "fallback",
            "recommendations": engine.get_top_rated(n)
        }

    # Then check new user
    if uid not in engine.user_sim.index:
        return {
            "mode": "new_user",
            "recommendations": engine.get_top_rated(n)
        }

    # Hybrid (if product selected)
    if product_id is not None:
        try:
            pid = int(product_id)
        except:
            return {"mode": "error", "message": "Invalid product_id"}

        return {
            "mode": "hybrid",
            "recommendations": engine.get_hybrid(uid, pid, n)
        }

    # Default collaborative
    return {
        "mode": "collaborative",
        "recommendations": engine.get_collaborative(uid, n)
    }
# ── Entry ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

