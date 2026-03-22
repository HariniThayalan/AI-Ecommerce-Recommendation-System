import firebase_admin
from firebase_admin import credentials, firestore
import random
import uuid
import tqdm

import os
import sys

# Constants
FIREBASE_KEY_PATH = "firebase_key.json"

# Initialize Firebase
if not os.path.exists(FIREBASE_KEY_PATH):
    print("❌ ERROR: 'firebase_key.json' not found in the project root!")
    print("\n💡 SOLUTION:")
    print("1. Go to Firebase Console -> Project Settings -> Service Accounts")
    print("2. Click 'Generate new private key'")
    print("3. Rename the downloaded file to 'firebase_key.json'")
    print(f"4. Move it to: {os.getcwd()}")
    print("\nOR: If you are testing without Firebase, you can't run this seeder yet.")
    sys.exit(1)

try:
    cred = credentials.Certificate(FIREBASE_KEY_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    print(f"❌ ERROR initializing Firebase: {e}")
    sys.exit(1)

CATEGORIES = ["Electronics", "Fashion", "Home", "Sports"]
BRANDS = ["Sony", "Nike", "Apple", "Adidas", "Samsung", "IKEA", "Bose", "Puma"]

def seed_products(count=50):
    """Generate and seed products to Firestore."""
    print(f"🌱 Seeding {count} products...")
    products_ref = db.collection("products")
    
    for i in tqdm.tqdm(range(count)):
        p_id = f"prod_{i:03d}"
        category = random.choice(CATEGORIES)
        brand = random.choice(BRANDS)
        price = random.randint(500, 50000)
        discount = random.randint(5, 30)
        final_price = price * (1 - discount/100)
        
        product_data = {
            "id": p_id,
            "name": f"{brand} {category} Spec-{i}",
            "brand": brand,
            "category": category,
            "description": f"High quality {category} product from {brand}. Advanced features and premium build.",
            "price": float(price),
            "discount_percent": float(discount),
            "final_price": float(final_price),
            "avg_rating": round(random.uniform(3.5, 5.0), 1),
            "rating_count": random.randint(10, 500),
            "image_url": f"https://picsum.photos/seed/{p_id}/400/400",
            "tags": [category.lower(), brand.lower(), "premium", "trending"],
            "created_at": firestore.SERVER_TIMESTAMP
        }
        products_ref.document(p_id).set(product_data)

def seed_ratings(count=200):
    """Generate and seed random ratings for collaborative filtering."""
    print(f"⭐ Seeding {count} ratings...")
    ratings_ref = db.collection("ratings")
    user_ids = [f"user_{i:02d}" for i in range(20)]
    product_ids = [f"prod_{i:03d}" for i in range(50)]
    
    for _ in tqdm.tqdm(range(count)):
        r_id = str(uuid.uuid4())
        u_id = random.choice(user_ids)
        p_id = random.choice(product_ids)
        
        rating_data = {
            "user_id": u_id,
            "product_id": p_id,
            "rating": float(random.randint(3, 5)),
            "timestamp": firestore.SERVER_TIMESTAMP
        }
        ratings_ref.document(r_id).set(rating_data, merge=True)

if __name__ == "__main__":
    seed_products(50)
    seed_ratings(200)
    print("✅ Seeding complete!")
