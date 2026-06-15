from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os

from cleaning_data import process_data
from recommender import get_recommendations

def get_fallback_image(name, prod_id):
    name_lower = name.lower()
    
    if "nail" in name_lower or "lacquer" in name_lower or "polish" in name_lower:
        return "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&auto=format&fit=crop&q=80"
    if "lipstick" in name_lower or "lip" in name_lower or "balm" in name_lower:
        return "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop&q=80"
    if "shampoo" in name_lower or "conditioner" in name_lower or "hair" in name_lower or "styling" in name_lower or "gel" in name_lower:
        return "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=80"
    if "razor" in name_lower or "shave" in name_lower or "shaving" in name_lower or "gillette" in name_lower:
        return "https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&auto=format&fit=crop&q=80"
    if "blush" in name_lower or "powder" in name_lower or "makeup" in name_lower or "cosmetic" in name_lower or "palette" in name_lower:
        return "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=80"
    if "toothpaste" in name_lower or "tooth" in name_lower or "oral" in name_lower or "colgate" in name_lower:
        return "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=500&auto=format&fit=crop&q=80"
    if "perfume" in name_lower or "cologne" in name_lower or "fragrance" in name_lower or "scent" in name_lower:
        return "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=80"
    if "lotion" in name_lower or "cream" in name_lower or "skincare" in name_lower or "moisturizer" in name_lower:
        return "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&auto=format&fit=crop&q=80"
    if "soap" in name_lower or "wash" in name_lower or "shower" in name_lower or "bath" in name_lower:
        return "https://images.unsplash.com/photo-1605264964528-06403738d6df?w=500&auto=format&fit=crop&q=80"
    if "vitamin" in name_lower or "supplement" in name_lower or "pill" in name_lower or "tablets" in name_lower:
        return "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=80"
        
    fallbacks = [
        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80"
    ]
    return fallbacks[prod_id % len(fallbacks)]

def get_deterministic_price(prod_id, category_name):
    category_lower = str(category_name).lower()
    if "wellness" in category_lower:
        return (prod_id % 15) * 100 + 499
    elif "skincare" in category_lower:
        return (prod_id % 12) * 80 + 399
    elif "hair" in category_lower:
        return (prod_id % 10) * 60 + 299
    else:  # cosmetics, etc.
        return (prod_id % 8) * 50 + 199

def get_mock_reviews(prod_id, rating, category):
    reviewer_names = [
        "Aarav Sharma", "Ananya Iyer", "Rahul Verma", "Priya Patel", 
        "Sneha Rao", "Amit Gupta", "Vikram Singh", "Neha Desai",
        "Rohan Mehta", "Divya Nair", "Karan Joshi", "Aditi Rao"
    ]
    
    comments_positive = [
        "Absolutely love this! It has completely transformed my daily routine. Highly recommend!",
        "Excellent quality. Very premium feel and works exactly as described.",
        "Best purchase I've made this year. The texture/feel is amazing and it lasts long.",
        "Super gentle on skin and has a wonderful premium scent. Will buy again!",
        "Stunning results within just a few days of use. Very satisfied.",
        "Great value for money. AuraMart delivered it super fast too!"
    ]
    
    comments_critical = [
        "Decent product, but a bit expensive for the quantity provided.",
        "Average quality. Works fine but nothing extraordinary.",
        "The performance is good, but the packaging could be improved.",
        "It's okay, but did not suit my preferences perfectly. Mild results."
    ]

    import random
    r = random.Random(prod_id)
    
    num_reviews = r.randint(2, 4)
    reviews = []
    
    for i in range(num_reviews):
        reviewer = reviewer_names[(prod_id + i) % len(reviewer_names)]
        if rating >= 4.0 or rating == 0.0:
            rev_rating = r.choice([4, 5])
            comment = r.choice(comments_positive)
        else:
            rev_rating = r.choice([3, 4])
            comment = r.choice(comments_critical)
            
        reviews.append({
            "reviewer": reviewer,
            "rating": rev_rating,
            "date": f"2026-05-{r.randint(10, 28):02d}",
            "comment": comment
        })
        
    return reviews

# CREATE FLASK APP FIRST
app = Flask(__name__)
CORS(app)

# LOAD DATASET
df = pd.read_csv(
    "clean_data.csv",
    low_memory=False,
    on_bad_lines='skip'
)
df = process_data(df)

# PRODUCT LIST
products = []
seen_ids = set()

for _, row in df.iterrows():
    prod_id = int(row["ProdID"])
    if prod_id in seen_ids:
        continue

    prod_name = str(row.get("Name", "Product"))
    category_name = str(row.get("Category", "Cosmetics"))

    img_url = row.get("ImageURL")
    if not isinstance(img_url, str) or img_url.strip() == "" or img_url.lower() == "nan":
        img_url = get_fallback_image(prod_name, prod_id)

    prod_rating = row.get("Rating", 4.0)
    try:
        import math
        prod_rating = 4.0 if (pd.isna(prod_rating) or math.isnan(float(prod_rating))) else round(float(prod_rating), 1)
    except Exception:
        prod_rating = 4.0

    brand = str(row.get("Brand", "AuraMart")).title()

    prod_desc = row.get("Description")
    if not isinstance(prod_desc, str) or pd.isna(prod_desc) or prod_desc.strip() == "" or prod_desc.lower() == "nan":
        prod_desc = f"Experience the ultimate luxury with {prod_name}. Formulated with high-quality ingredients, this premium product delivers outstanding results for your daily routine. Enjoy the elegance and performance of {category_name} curated by {brand}."
    else:
        if ',' in prod_desc and len(prod_desc.split(',')) > 10:
            words = prod_desc.replace(',', ' ').split()
            seen = set()
            cleaned_words = [x.lower() for x in words if not (x.lower() in seen or seen.add(x.lower()))]
            prod_desc = " ".join(cleaned_words).capitalize()
            if len(prod_desc) > 200:
                prod_desc = prod_desc[:200] + "..."
            prod_desc = f"This high-performance product features: {prod_desc}. Perfect for standard daily use and professionally recommended."

    product = {
        "id": prod_id,
        "name": prod_name,
        "price": get_deterministic_price(prod_id, category_name),
        "image": img_url,
        "rating": prod_rating,
        "brand": brand,
        "category": category_name,
        "description": prod_desc,
        "reviews": get_mock_reviews(prod_id, prod_rating, category_name)
    }

    products.append(product)
    seen_ids.add(prod_id)

# HOME ROUTE
@app.route("/")
def home():
    return jsonify({
        "message": "Backend Running Successfully"
    })

# PRODUCTS API
@app.route("/products")
def get_products():
    return jsonify(products[:50])

# GET SINGLE PRODUCT API
@app.route("/products/<int:product_id>")
def get_product(product_id):
    for p in products:
        if p["id"] == product_id:
            return jsonify(p)

    # Fallback search in df
    prod_rows = df[df["ProdID"] == product_id]
    if not prod_rows.empty:
        row = prod_rows.iloc[0]
        prod_name = str(row.get("Name", "Product"))
        category_name = str(row.get("Category", "Cosmetics"))
        img_url = row.get("ImageURL")
        if not isinstance(img_url, str) or img_url.strip() == "" or img_url.lower() == "nan":
            img_url = get_fallback_image(prod_name, product_id)

        prod_rating = row.get("Rating", 4.0)
        try:
            import math
            prod_rating = 4.0 if (pd.isna(prod_rating) or math.isnan(float(prod_rating))) else round(float(prod_rating), 1)
        except Exception:
            prod_rating = 4.0

        brand = str(row.get("Brand", "AuraMart")).title()

        prod_desc = row.get("Description")
        if not isinstance(prod_desc, str) or pd.isna(prod_desc) or prod_desc.strip() == "" or prod_desc.lower() == "nan":
            prod_desc = f"Experience the ultimate luxury with {prod_name}. Formulated with high-quality ingredients, this premium product delivers outstanding results for your daily routine. Enjoy the elegance and performance of {category_name} curated by {brand}."
        else:
            if ',' in prod_desc and len(prod_desc.split(',')) > 10:
                words = prod_desc.replace(',', ' ').split()
                seen = set()
                cleaned_words = [x.lower() for x in words if not (x.lower() in seen or seen.add(x.lower()))]
                prod_desc = " ".join(cleaned_words).capitalize()
                if len(prod_desc) > 200:
                    prod_desc = prod_desc[:200] + "..."
                prod_desc = f"This high-performance product features: {prod_desc}. Perfect for standard daily use and professionally recommended."

        p_obj = {
            "id": product_id,
            "name": prod_name,
            "price": get_deterministic_price(product_id, category_name),
            "image": img_url,
            "rating": prod_rating,
            "brand": brand,
            "category": category_name,
            "description": prod_desc,
            "reviews": get_mock_reviews(product_id, prod_rating, category_name)
        }
        return jsonify(p_obj)

    return jsonify({"error": "Product not found"}), 404

# RECOMMENDATION API
@app.route("/recommend", methods=["POST"])
def recommend():

    try:
        data = request.get_json()
        user_id = data.get("user_id")
        product_name = data.get("product_name")
        cart_items = data.get("cart_items", [])

        result = get_recommendations(
            df,
            user_id=user_id,
            product_name=product_name,
            user_history=cart_items
        )

        # Helper function to find a product's details by ID
        def find_product_by_id(pid):
            for p in products:
                if p["id"] == pid:
                    return p
            prod_rows = df[df["ProdID"] == pid]
            if not prod_rows.empty:
                row = prod_rows.iloc[0]
                prod_name = str(row.get("Name", "Product"))
                category_name = str(row.get("Category", "Cosmetics"))
                img_url = row.get("ImageURL")
                if not isinstance(img_url, str) or img_url.strip() == "" or img_url.lower() == "nan":
                    img_url = get_fallback_image(prod_name, pid)
                
                prod_rating = row.get("Rating", 4.0)
                try:
                    import math
                    prod_rating = 4.0 if (pd.isna(prod_rating) or math.isnan(float(prod_rating))) else round(float(prod_rating), 1)
                except Exception:
                    prod_rating = 4.0

                brand = str(row.get("Brand", "AuraMart")).title()

                prod_desc = row.get("Description")
                if not isinstance(prod_desc, str) or pd.isna(prod_desc) or prod_desc.strip() == "" or prod_desc.lower() == "nan":
                    prod_desc = f"Experience the ultimate luxury with {prod_name}. Formulated with high-quality ingredients, this premium product delivers outstanding results for your daily routine. Enjoy the elegance and performance of {category_name} curated by {brand}."
                else:
                    if ',' in prod_desc and len(prod_desc.split(',')) > 10:
                        words = prod_desc.replace(',', ' ').split()
                        seen = set()
                        cleaned_words = [x.lower() for x in words if not (x.lower() in seen or seen.add(x.lower()))]
                        prod_desc = " ".join(cleaned_words).capitalize()
                        if len(prod_desc) > 200:
                            prod_desc = prod_desc[:200] + "..."
                        prod_desc = f"This high-performance product features: {prod_desc}. Perfect for standard daily use and professionally recommended."

                return {
                    "id": pid,
                    "name": prod_name,
                    "price": get_deterministic_price(pid, category_name),
                    "image": img_url,
                    "rating": prod_rating,
                    "brand": brand,
                    "category": category_name,
                    "description": prod_desc,
                    "reviews": get_mock_reviews(pid, prod_rating, category_name)
                }
            return {
                "id": pid,
                "name": f"Premium Product #{pid}",
                "price": get_deterministic_price(pid, "Cosmetics"),
                "image": get_fallback_image(f"Product #{pid}", pid),
                "rating": 4.0,
                "brand": "AuraMart",
                "category": "Cosmetics",
                "description": f"Experience the premium formulation of our standard Product #{pid}.",
                "reviews": get_mock_reviews(pid, 4.0, "Cosmetics")
            }

        # Helper function to find a product's details by Name
        def find_product_by_name(name):
            for p in products:
                if p["name"] == name:
                    return p
            prod_rows = df[df["Name"] == name]
            if not prod_rows.empty:
                row = prod_rows.iloc[0]
                pid = int(row["ProdID"])
                category_name = str(row.get("Category", "Cosmetics"))
                img_url = row.get("ImageURL")
                if not isinstance(img_url, str) or img_url.strip() == "" or img_url.lower() == "nan":
                    img_url = get_fallback_image(name, pid)
                
                prod_rating = row.get("Rating", 4.0)
                try:
                    import math
                    prod_rating = 4.0 if (pd.isna(prod_rating) or math.isnan(float(prod_rating))) else round(float(prod_rating), 1)
                except Exception:
                    prod_rating = 4.0

                brand = str(row.get("Brand", "AuraMart")).title()

                prod_desc = row.get("Description")
                if not isinstance(prod_desc, str) or pd.isna(prod_desc) or prod_desc.strip() == "" or prod_desc.lower() == "nan":
                    prod_desc = f"Experience the ultimate luxury with {name}. Formulated with high-quality ingredients, this premium product delivers outstanding results for your daily routine. Enjoy the elegance and performance of {category_name} curated by {brand}."
                else:
                    if ',' in prod_desc and len(prod_desc.split(',')) > 10:
                        words = prod_desc.replace(',', ' ').split()
                        seen = set()
                        cleaned_words = [x.lower() for x in words if not (x.lower() in seen or seen.add(x.lower()))]
                        prod_desc = " ".join(cleaned_words).capitalize()
                        if len(prod_desc) > 200:
                            prod_desc = prod_desc[:200] + "..."
                        prod_desc = f"This high-performance product features: {prod_desc}. Perfect for standard daily use and professionally recommended."

                return {
                    "id": pid,
                    "name": name,
                    "price": get_deterministic_price(pid, category_name),
                    "image": img_url,
                    "rating": prod_rating,
                    "brand": brand,
                    "category": category_name,
                    "description": prod_desc,
                    "reviews": get_mock_reviews(pid, prod_rating, category_name)
                }
            h_id = abs(hash(name)) % 100000
            return {
                "id": h_id,
                "name": name,
                "price": get_deterministic_price(h_id, "Cosmetics"),
                "image": get_fallback_image(name, h_id),
                "rating": 4.0,
                "brand": "AuraMart",
                "category": "Cosmetics",
                "description": f"Discover the benefits of {name}, designed specifically for high-fidelity personal care.",
                "reviews": get_mock_reviews(h_id, 4.0, "Cosmetics")
            }

        # Map list of IDs / Names to complete product objects
        mapped_collab = [find_product_by_id(pid) for pid in result.get("collaborative", [])]
        
        # Parse Price and Rating Range parameters for Ranking-Based Filtering
        price_range = data.get("price_range", "all")
        rating_range = data.get("rating_range", "all")
        
        p_min, p_max = 0.0, float('inf')
        if price_range != "all":
            if "-" in price_range:
                try:
                    parts = price_range.split("-")
                    p_min = float(parts[0])
                    p_max = float(parts[1])
                except ValueError:
                    pass
            elif price_range == "custom":
                try:
                    p_min = float(data.get("price_min", 0.0))
                except (ValueError, TypeError):
                    p_min = 0.0
                try:
                    p_max = float(data.get("price_max", float('inf')))
                except (ValueError, TypeError):
                    p_max = float('inf')
            else:
                try:
                    p_max = float(price_range)
                except ValueError:
                    pass

        r_min, r_max = 0.0, 5.0
        if rating_range != "all":
            if "-" in rating_range:
                try:
                    parts = rating_range.split("-")
                    r_min = float(parts[0])
                    r_max = float(parts[1])
                except ValueError:
                    pass
            elif rating_range == "custom":
                try:
                    r_min = float(data.get("rating_min", 0.0))
                except (ValueError, TypeError):
                    r_min = 0.0
                try:
                    r_max = float(data.get("rating_max", 5.0))
                except (ValueError, TypeError):
                    r_max = 5.0
            else:
                try:
                    r_min = float(rating_range)
                except ValueError:
                    pass

        # Filter the global product catalog dynamically for ranking recommendations
        filtered_ranking = []
        for p in products:
            rating_val = p.get("rating", 4.0)
            price_val = p.get("price", 0.0)
            if r_min <= rating_val <= r_max and p_min <= price_val <= p_max:
                filtered_ranking.append(p)

        # Sort filtered products by rating descending, and select with rating diversity
        filtered_ranking.sort(key=lambda x: x.get("rating", 0.0), reverse=True)
        
        diverse_ranking = []
        rating_counts = {}
        for p in filtered_ranking:
            r = p.get("rating", 4.0)
            rating_counts[r] = rating_counts.get(r, 0) + 1
            if rating_counts[r] <= 3:  # Limit to max 3 items per rating value to ensure diversity
                diverse_ranking.append(p)
            if len(diverse_ranking) >= 30:
                break
                
        # If we need more items to fill the top 30, append the remaining ones
        if len(diverse_ranking) < 30 and len(filtered_ranking) > len(diverse_ranking):
            for p in filtered_ranking:
                if p not in diverse_ranking:
                    diverse_ranking.append(p)
                if len(diverse_ranking) >= 30:
                    break

        mapped_ranking = diverse_ranking

        mapped_content = [find_product_by_name(name) for name in result.get("content", [])]

        return jsonify({
            "collaborative": mapped_collab,
            "ranking": mapped_ranking,
            "content": mapped_content,
            "selected_product": result.get("selected_product")
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": str(e)
        })

# CHATBOT API
@app.route("/chat", methods=["POST"])
def chat():
    try:
        import os
        import requests

        message = request.json.get("message", "")
        if not message:
            return jsonify({"reply": "How can I help you shop today?"})

        # 1. Attempt Groq API
        env_keys = {}
        for env_path in [".env", "../.env", "backend/.env"]:
            if os.path.exists(env_path):
                try:
                    with open(env_path, "r") as f:
                        for line in f:
                            if "=" in line and not line.strip().startswith("#"):
                                k, v = line.strip().split("=", 1)
                                env_keys[k.strip()] = v.strip().strip('"').strip("'")
                except Exception:
                    pass

        api_key = os.environ.get("GROQ_API_KEY") or env_keys.get("GROQ_API_KEY")
        
        if api_key:
            try:
                # Include a few products in system prompt to guide it
                prod_names = [p["name"] for p in products[:15]]
                product_list_str = ", ".join(prod_names)
                
                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {
                            "role": "system",
                            "content": f"You are Aura AI, the intelligent shopping assistant for AuraMart. The store sells items like: {product_list_str}. Help the user shop, recommend items, and answer questions politely and concisely."
                        },
                        {"role": "user", "content": message}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 256
                }
                response = requests.post(url, headers=headers, json=payload, timeout=6)
                if response.status_code == 200:
                    reply = response.json()["choices"][0]["message"]["content"]
                    return jsonify({"reply": reply})
            except Exception as e:
                print("Groq API Call Error:", e)

        # 2. Local Fallback Chatbot
        msg = message.lower().strip()
        
        # Greetings
        if any(greet in msg for greet in ["hi", "hello", "hey", "greetings", "wasup", "yo"]):
            reply = "Hello! Welcome to AuraMart. I am Aura AI, your virtual shopping assistant. How can I help you find products or navigate the store today?"
        
        # About AI
        elif any(q in msg for q in ["who are you", "what are you", "your name", "about yourself"]):
            reply = "I am Aura AI, your personalized shopping assistant. I can recommend products, search the store inventory, and help you checkout!"
            
        # Cart
        elif any(term in msg for term in ["cart", "basket", "added product", "my items"]):
            reply = "You can view the items you have added by clicking on the 'Cart' link in the navigation bar. You can remove items there, or proceed to checkout."
            
        # Checkout & payment
        elif any(term in msg for term in ["checkout", "payment", "pay", "buy", "purchase", "order"]):
            reply = "To buy your items, go to the 'Cart' page, click 'Proceed to Checkout', and click 'Pay with Razorpay (Demo)' to complete your purchase securely. Once paid, the cart will clear."
            
        # Recommendations
        elif any(term in msg for term in ["recommend", "best product", "suggestion", "what to buy", "popular"]):
            items_str = "\n".join([f"✨ {p['name']} - ₹{p['price']} (Rating: {p['rating']} ⭐)" for p in products[:5]])
            reply = f"Based on your profile, here are some top recommendations for you:\n\n{items_str}\n\nGo to the 'Recommendations' tab for more personalized recommendations!"

        # Specific product search
        else:
            words = [w for w in msg.split() if len(w) > 2]
            matching = []
            for p in products:
                p_name = p["name"].lower()
                if any(w in p_name for w in words):
                    matching.append(p)
                    if len(matching) >= 5:
                        break
                        
            if matching:
                items_str = "\n".join([f"🛍️ {p['name']} - ₹{p['price']} (Rating: {p['rating']} ⭐)" for p in matching])
                reply = f"I found these products matching your query:\n\n{items_str}"
            else:
                reply = "I'm here to help you shop! You can ask about product availability (e.g. 'shampoo', 'lipstick'), ask for recommendations, or get help with checkout and payments."

        return jsonify({"reply": reply})

    except Exception as err:
        import traceback
        traceback.print_exc()
        return jsonify({"reply": "Sorry, I encountered an issue processing your query."})

# DUMMY PAYMENT API
@app.route("/payment", methods=["POST"])
def payment():

    return jsonify({
        "status": "success",
        "message": "Payment Successful"
    }) 

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )