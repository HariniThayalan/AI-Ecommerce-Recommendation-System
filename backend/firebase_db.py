import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter
import os
import json

# Initialize Firebase
# On Render, we'll use an environment variable 'FIREBASE_CREDENTIALS' (JSON string)
# Locally, we'll fall back to 'firebase_key.json'
firebase_creds_json = os.environ.get("FIREBASE_CREDENTIALS")

if firebase_creds_json:
    # Use the JSON string from Environment Variable
    try:
        creds_dict = json.loads(firebase_creds_json)
        cred = credentials.Certificate(creds_dict)
    except Exception as e:
        print(f"❌ Error parsing FIREBASE_CREDENTIALS env var: {e}")
        # Fallback to file search if env var is malformed
        cred_path = os.path.join(os.path.dirname(__file__), "firebase_key.json")
        cred = credentials.Certificate(cred_path)
else:
    # Fallback to local file for development
    cred_path = os.path.join(os.path.dirname(__file__), "firebase_key.json")
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
    else:
        # If no file and no env var, this will intentionally fail with a better error
        raise FileNotFoundError("Firebase credentials not found (env 'FIREBASE_CREDENTIALS' or 'firebase_key.json' file missing)")

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ── Cart ──────────────────────────────────────────────────────
def get_cart(user_id: str) -> list:
    doc = db.collection("carts").document(user_id).get()
    return doc.to_dict().get("items", []) if doc.exists else []

def add_to_cart(user_id: str, product: dict, quantity: int) -> list:
    ref = db.collection("carts").document(user_id)
    doc = ref.get()
    items = doc.to_dict().get("items", []) if doc.exists else []
    for item in items:
        if item["product"]["id"] == product["id"]:
            item["quantity"] += quantity
            ref.set({"items": items})
            return items
    items.append({"product": product, "quantity": quantity})
    ref.set({"items": items})
    return items

def update_cart_qty(user_id: str, product_id: str, quantity: int) -> list:
    ref = db.collection("carts").document(user_id)
    doc = ref.get()
    items = doc.to_dict().get("items", []) if doc.exists else []
    if quantity <= 0:
        items = [i for i in items if i["product"]["id"] != product_id]
    else:
        for item in items:
            if item["product"]["id"] == product_id:
                item["quantity"] = quantity
    ref.set({"items": items})
    return items

def remove_from_cart(user_id: str, product_id: str) -> list:
    ref = db.collection("carts").document(user_id)
    doc = ref.get()
    items = doc.to_dict().get("items", []) if doc.exists else []
    items = [i for i in items if i["product"]["id"] != product_id]
    ref.set({"items": items})
    return items

def clear_cart(user_id: str):
    db.collection("carts").document(user_id).set({"items": []})

# ── Orders ────────────────────────────────────────────────────
def save_order(order_id: str, order_data: dict):
    db.collection("orders").document(order_id).set(order_data)

def get_orders(user_id: str) -> list:
    docs = db.collection("orders").where(filter=FieldFilter("user_id", "==", user_id)).stream()
    return [doc.to_dict() for doc in docs]

# ── Wishlist ──────────────────────────────────────────────────
def get_wishlist(user_id: str) -> list:
    doc = db.collection("wishlists").document(user_id).get()
    return doc.to_dict().get("product_ids", []) if doc.exists else []

def toggle_wishlist(user_id: str, product_id: str) -> str:
    ref = db.collection("wishlists").document(user_id)
    doc = ref.get()
    ids = doc.to_dict().get("product_ids", []) if doc.exists else []
    if product_id in ids:
        ids.remove(product_id)
        ref.set({"product_ids": ids})
        return "removed"
    ids.append(product_id)
    ref.set({"product_ids": ids})
    return "added"
