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
from dotenv import load_dotenv

# Load .env file
load_dotenv()

from data_loader import load_and_format, format_product
from recommendation_engine import RecommendationEngine

app = FastAPI(title="ShopSmart AI", version="3.0.0")

# Enable CORS for Vercel Frontend
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global state ───────────────────────────────────────────────────────────────
df     = None
engine: Optional[RecommendationEngine] = None

# In-memory stores (reset on restart — fine for capstone demo)
_carts:     dict = {}   # {user_id: [{product, quantity}]}
_wishlists: dict = {}   # {user_id: [product_id_str, ...]}
_orders:    dict = {}   # {order_id: order_dict}


@app.on_event("startup")
async def startup():
    global df, engine
    df     = load_and_format("cleaned_data.csv")
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
        recs = engine.get_collaborative(int(user_id), n)
        return {"recommendations": recs, "mode": "collaborative", "user_id": user_id}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/recommend/hybrid/{user_id}/{product_id}")
def hybrid_recs(user_id: str, product_id: str, n: int = Query(12, ge=1, le=50)):
    try:
        recs = engine.get_hybrid(int(user_id), int(product_id), n)
        return {"recommendations": recs, "mode": "hybrid"}
    except Exception as e:
        raise HTTPException(500, str(e))


# ── Cart ───────────────────────────────────────────────────────────────────────
class CartItemIn(BaseModel):
    product:  dict
    quantity: int = 1


@app.get("/cart/{user_id}")
def get_cart(user_id: str):
    return {"items": _carts.get(user_id, [])}


@app.post("/cart/{user_id}/add")
def add_to_cart(user_id: str, body: CartItemIn):
    cart = _carts.setdefault(user_id, [])
    pid  = body.product["id"]
    for item in cart:
        if item["product"]["id"] == pid:
            item["quantity"] += body.quantity
            return {"status": "updated", "cart": cart}
    cart.append({"product": body.product, "quantity": body.quantity})
    return {"status": "added", "cart": cart}


@app.put("/cart/{user_id}/quantity")
def update_qty(user_id: str, product_id: str, quantity: int):
    cart = _carts.get(user_id, [])
    if quantity <= 0:
        _carts[user_id] = [i for i in cart if i["product"]["id"] != product_id]
    else:
        for item in cart:
            if item["product"]["id"] == product_id:
                item["quantity"] = quantity
    return {"cart": _carts.get(user_id, [])}


@app.delete("/cart/{user_id}/remove/{product_id}")
def remove_from_cart(user_id: str, product_id: str):
    _carts[user_id] = [
        i for i in _carts.get(user_id, []) if i["product"]["id"] != product_id
    ]
    return {"cart": _carts.get(user_id, [])}


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
    oid = "ORD-" + str(uuid.uuid4())[:8].upper()
    _orders[oid] = {**order.dict(), "order_id": oid, "status": "Confirmed"}
    _carts[order.user_id] = []   # clear cart after order
    return {"order_id": oid, "status": "Confirmed"}


@app.get("/orders/{user_id}")
def get_orders(user_id: str):
    return [o for o in _orders.values() if o["user_id"] == user_id]


# ── Wishlist ───────────────────────────────────────────────────────────────────
@app.post("/wishlist/{user_id}/toggle")
def toggle_wishlist(user_id: str, product_id: str):
    wl = _wishlists.setdefault(user_id, [])
    if product_id in wl:
        _wishlists[user_id] = [i for i in wl if i != product_id]
        return {"status": "removed"}
    _wishlists[user_id].append(product_id)
    return {"status": "added"}


@app.get("/wishlist/{user_id}")
def get_wishlist(user_id: str):
    return {"product_ids": _wishlists.get(user_id, [])}


# ── Entry ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
