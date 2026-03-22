# 🛒 ShopSmart AI — Intelligent E-Commerce Platform

> AI-powered product recommendations with **4 ML engines**, built with **React + Vite** (frontend) and **FastAPI** (backend).

![Stack](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20Tailwind-6C63FF?style=flat-square)
![Stack](https://img.shields.io/badge/Backend-FastAPI%20%2B%20scikit--learn-FF6584?style=flat-square)
![Stack](https://img.shields.io/badge/ML-TF--IDF%20%7C%20Cosine%20Similarity%20%7C%20Bayesian-43D9AD?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=flat-square)
![Node](https://img.shields.io/badge/Node-18%2B-green?style=flat-square)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Dataset](#dataset)
- [AI Recommendation Engines](#ai-recommendation-engines)
- [Features](#features)
- [Setup & Installation](#setup--installation)
- [Running the App](#running-the-app)
- [API Reference](#api-reference)
- [Pages](#pages)
- [Architecture Decisions](#architecture-decisions)

---

## Overview

ShopSmart AI is a full-stack e-commerce platform that demonstrates **4 different AI recommendation strategies** on a real-world beauty & personal care dataset. Users can switch between algorithms in real-time and see how each engine surfaces different products.

**Dataset**: 4,091 rows · 1,607 unique products · 1,666 unique users · beauty/personal care domain

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | UI framework (replaces Reflex for unrestricted JSX) |
| Styling | Tailwind CSS v3 | Utility-first dark theme design system |
| State | Zustand | Global cart, wishlist, auth, product state |
| HTTP | Axios | API calls with global error toast interceptor |
| Backend | FastAPI + Uvicorn | REST API, recommendation endpoints, write endpoints |
| ML | scikit-learn | TF-IDF vectorisation, cosine similarity, SVD |
| Data | Pandas + NumPy | CSV loading, pivot tables, Bayesian scoring |
| Routing | React Router v6 | Client-side routing with dynamic `/product/:id` |
| Notifications | react-hot-toast | Cart/wishlist/order feedback toasts |

---

## Project Structure

```
Recommendation System/
│
├── backend/                         🔴 FastAPI + ML Backend
│   ├── main.py                      # All API endpoints (products, recs, cart, orders, wishlist)
│   ├── data_loader.py               # CSV loading, cleaning, formatting
│   ├── recommendation_engine.py     # 4 AI engines in one class
│   ├── cleaning_data.py             # Raw data preprocessing
│   ├── content_based.py             # Content-based (legacy module)
│   ├── collaborative_based.py       # Collaborative (legacy module)
│   ├── rating_based.py              # Rating-based (legacy module)
│   ├── evaluation.py                # Precision/recall metrics
│   ├── seed_data.py                 # Data seeder
│   ├── cleaned_data.csv             # Main dataset (4,091 rows)
│   └── requirements-backend.txt     # Backend-only dependencies
│
├── frontend/                        🟣 React + Vite Frontend
│   ├── index.html                   # HTML entry point (Inter font)
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Custom dark theme tokens
│   ├── postcss.config.js
│   ├── package.json                 # npm dependencies
│   ├── requirements-frontend.txt    # (legacy Reflex — no longer used)
│   └── src/
│       ├── main.jsx                 # React entry point
│       ├── App.jsx                  # Router + Navbar + Footer wrapper
│       ├── index.css                # Tailwind + custom utilities (glass, grad-text)
│       ├── api/
│       │   └── client.js            # Axios instance + all API functions
│       ├── store/
│       │   └── useStore.js          # Zustand global store (auth, cart, wishlist, products)
│       ├── components/
│       │   ├── Navbar.jsx           # Sticky glassmorphism navbar with search + badges
│       │   ├── Footer.jsx           # 4-column footer
│       │   ├── ProductCard.jsx      # Card with wishlist, AI badge, add-to-cart
│       │   ├── FilterSidebar.jsx    # AI mode selector + category + rating + price filters
│       │   ├── StarRating.jsx       # Reusable star rating display
│       │   └── StepIndicator.jsx    # 3-step checkout progress indicator
│       └── pages/
│           ├── Landing.jsx          # Hero, stats, AI mode cards, categories, how-it-works
│           ├── Products.jsx         # Product grid with filter sidebar + skeleton loading
│           ├── ProductDetail.jsx    # Full product view + content-based similar products
│           ├── Cart.jsx             # Cart with qty stepper, coupons, GST summary
│           ├── Checkout.jsx         # 3-step checkout (Address → Payment → Confirmation)
│           └── Profile.jsx          # Login, orders tab, wishlist tab, settings tab
│
├── .env                             # Environment variables (shared)
├── .gitignore
├── requirements.txt                 # Combined install (backend + any shared deps)
├── setup.bat                        # One-click setup script
├── start-backend.bat                # Launches FastAPI on :8000
└── start-frontend.bat               # Launches Vite on :5173
```

---

## Dataset

File: `backend/cleaned_data.csv`

| Column | Description |
|---|---|
| `User's ID` | Integer user identifier (1,666 unique) |
| `ProdID` | Integer product identifier (1,607 unique) |
| `Rating` | Float 0.0–5.0 (0 = unrated, not a bad product) |
| `Review Count` | Integer review count (0–29,242) |
| `Category` | Comma-separated tags e.g. `"beauty, hair, care"` — first word used as display category |
| `Brand` | Brand name (opi, maybelline, covergirl, etc.) |
| `Name` | Product name |
| `ImageURL` | Pipe-separated image URLs — only the first is used |
| `Description` | Product description (truncated to 500 chars) |
| `Tags` | Keyword string used for TF-IDF content-based filtering |

**Key facts:**
- Only 1,812 of 4,091 rows have `Rating > 0` — collaborative filtering handles sparse data via fallback
- Prices are synthetically generated from `ProdID` (deterministic, no database needed)
- Demo user `1705` exists in the CSV and returns real collaborative recommendations

---

## AI Recommendation Engines

### 1. 🔥 Top Rated — Bayesian Weighted Average
```
score = (v / (v + m)) × R + (m / (v + m)) × C

v = review count for product
R = product's average rating
C = global mean rating across all products
m = 70th percentile review count (minimum threshold)
```
Prevents products with 1 review at 5★ from outranking products with thousands of reviews.

### 2. 🧠 Content-Based — TF-IDF + Cosine Similarity
- Vectorises the `Tags` column using TF-IDF (max 5,000 features, English stop words removed)
- Computes cosine similarity between products
- Returns top-N most similar products to the currently viewed product

### 3. 👥 Collaborative — User-User Cosine Similarity
- Builds a user × product rating matrix (`pivot_table` on `User's ID` × `ProdID`)
- Computes user-user cosine similarity
- Finds top-10 similar users, averages their ratings on products the target user hasn't rated
- Falls back to Top Rated if user has no rating history

### 4. ⚡ Hybrid — Weighted Combination
```
hybrid_score = 0.4 × content_rank + 0.4 × collab_rank + 0.2 × popularity
```
Each sub-score is normalised to [0, 1] by rank position. Popularity uses normalised review count.

---

## Features

| Feature | Description |
|---|---|
| 🔄 Live AI switching | Switch between 4 recommendation modes from the filter sidebar |
| 🛒 Full cart flow | Add, remove, update quantity, apply coupons (SAVE10, FIRST50) |
| 💳 3-step checkout | Address → Payment (Card/UPI/NetBanking/COD) → Confirmation |
| ❤️ Wishlist | Toggle products in/out of wishlist, view in Profile |
| 👤 Profile | Orders history, wishlist grid, settings |
| 📊 AI match badges | Cards show `"94% Match"` in content/collaborative/hybrid modes |
| 🔍 Search | Search by product name, brand, or category |
| 🏷️ Coupons | `SAVE10` = 10% off · `FIRST50` = ₹50 off |
| 📱 Responsive | Mobile-first: sidebar becomes bottom drawer, grid collapses |
| 🌙 Dark theme | Full dark mode with glassmorphism navbar |
| ⚡ Fast | Vite HMR, skeleton loaders, client-side sort/filter |

---

## Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- pip

### Option A — One-click setup (Windows)
```
Double-click setup.bat
```

### Option B — Manual
```bash
# 1. Install backend dependencies
pip install -r backend/requirements-backend.txt

# 2. Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## Running the App

### Step 1 — Start the Backend (Terminal 1)
```bash
cd backend
uvicorn main:app --reload --port 8000
```
API available at: `http://localhost:8000`
API Docs (Swagger): `http://localhost:8000/docs`

Or double-click **`start-backend.bat`**

### Step 2 — Start the Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
App available at: `http://localhost:5173`

Or double-click **`start-frontend.bat`**

> **Port map:**
> - `:8000` — FastAPI backend
> - `:5173` — React + Vite frontend

---

## API Reference

### Products
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/products` | List products. Params: `category`, `q`, `limit`, `offset` |
| `GET` | `/products/{id}` | Single product by ID |

### Recommendations
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/recommend/top-rated` | Bayesian top-rated. Param: `n` |
| `GET` | `/recommend/content/{product_id}` | Content-based. Param: `n` |
| `GET` | `/recommend/collaborative/{user_id}` | Collaborative. Param: `n` |
| `GET` | `/recommend/hybrid/{user_id}/{product_id}` | Hybrid. Param: `n` |

### Cart
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/cart/{user_id}` | Get user's cart |
| `POST` | `/cart/{user_id}/add` | Add item (body: `{product, quantity}`) |
| `PUT` | `/cart/{user_id}/quantity` | Update qty. Params: `product_id`, `quantity` |
| `DELETE` | `/cart/{user_id}/remove/{product_id}` | Remove item |

### Orders & Wishlist
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/orders` | Place order (body: full order object) |
| `GET` | `/orders/{user_id}` | Get user's order history |
| `POST` | `/wishlist/{user_id}/toggle` | Toggle wishlist item. Param: `product_id` |
| `GET` | `/wishlist/{user_id}` | Get wishlist product IDs |

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero, feature cards, AI mode showcase, category grid |
| `/products` | Products | Grid with filter sidebar, skeleton loading, sort |
| `/product/:id` | Product Detail | Full info, qty stepper, buy/cart/wishlist, similar products |
| `/cart` | Cart | Items list, coupon, GST, grand total, checkout link |
| `/checkout` | Checkout | 3-step: Address → Payment → Order confirmation |
| `/profile` | Profile | Login form, orders tab, wishlist tab, settings tab |

---

## Architecture Decisions

### Why React + Vite instead of Reflex?
Reflex (Python → Next.js compiler) has strict compilation rules:
- Cannot use Python string formatting (`f"₹{price:,}"`) on reactive variables
- Dynamic icon names (`rx.icon(variable)`) cause compile crashes
- Multiple simultaneous state updates trigger HMR failures
- Port 8000 conflict between Reflex's WebSocket backend and FastAPI

React + Vite eliminates all of these. String formatting, dynamic values, and multi-file updates all work without restriction.

### Why no database?
The dataset (4,091 rows, 1,607 products) fits entirely in memory. Cart, orders, and wishlist use Python dicts in FastAPI memory — sufficient for a capstone demo. For production, replace with SQLite or PostgreSQL.

### Deterministic pricing
Prices are calculated from `ProdID % 1000` so the same product always shows the same price across server restarts — without needing a database.

### Pre-formatted display strings
`data_loader.py` builds `price_display`, `final_price_display`, `rating_display`, and `discount_display` on the server. React uses these directly — no string construction in JSX.

---

## Development Notes

- All recommendation engines live in `backend/recommendation_engine.py` as a single `RecommendationEngine` class
- Models are built at startup (`@app.on_event("startup")`) — first request is instant
- Frontend state is managed entirely in Zustand (`src/store/useStore.js`)
- API calls are centralised in `src/api/client.js` with a global Axios error interceptor
- Coupon codes: `SAVE10` (10% off) · `FIRST50` (₹50 flat off)
- Demo user ID: `1705` (has real rating history in the CSV)

---

*Built as an AI/ML internship project — Infosys Springboard · 2026*
