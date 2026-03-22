"""
data_loader.py — Loads cleaned_data.csv and formats product dicts for the API.
"""
import pandas as pd
import numpy as np


def load_and_format(filepath: str = "cleaned_data.csv") -> pd.DataFrame:
    df = pd.read_csv(filepath)

    # Fix sentinel int values pandas reads as -2147483648
    for col in ["User's ID", "ProdID"]:
        if col in df.columns:
            df[col] = df[col].replace(-2147483648, np.nan)
            df[col] = pd.to_numeric(df[col], errors="coerce")

    df["Rating"]       = pd.to_numeric(df.get("Rating", 0),        errors="coerce").fillna(0)
    df["Review Count"] = pd.to_numeric(df.get("Review Count", 0),  errors="coerce").fillna(0)

    df.dropna(subset=["ProdID"], inplace=True)
    df = df[df["ProdID"] != 0].copy()

    for col in ["Category", "Brand", "Name", "Description", "Tags", "ImageURL"]:
        if col in df.columns:
            df[col] = df[col].fillna("")

    df["ProdID"] = df["ProdID"].astype(int)
    df.reset_index(drop=True, inplace=True)
    return df


def format_product(row) -> dict:
    """
    Convert a DataFrame row → clean JSON-safe product dict.
    All display strings pre-built so React never constructs them.
    """
    prod_id = int(row.get("ProdID", 0))

    # Deterministic price — same product always gets same price (no DB needed)
    seed         = prod_id % 1000
    price        = round(199 + seed * 9.5, 2)            # ₹199 – ₹9,699
    discount     = [0, 0, 5, 10, 15, 20][prod_id % 6]   # 0–20%
    final_price  = round(price * (1 - discount / 100), 2)

    # Image: first URL only (multiple separated by |)
    raw_img   = str(row.get("ImageURL", ""))
    image_url = raw_img.split("|")[0].strip()
    if not image_url or image_url == "nan":
        image_url = f"https://picsum.photos/seed/prod{prod_id}/400/400"

    # Category: first comma-separated token, title-cased
    raw_cat          = str(row.get("Category", "General"))
    display_category = raw_cat.split(",")[0].strip().title() or "General"

    avg_rating   = round(float(row.get("Rating", 0)), 1)
    review_count = int(row.get("Review Count", 0))

    return {
        "id":            str(prod_id),
        "name":          str(row.get("Name", "Unknown Product")),
        "brand":         str(row.get("Brand", "")).strip().title(),
        "category":      display_category,
        "description":   str(row.get("Description", ""))[:500],
        "tags":          str(row.get("Tags", "")),
        "price":         price,
        "discount_percent": discount,
        "final_price":   final_price,
        "avg_rating":    avg_rating,
        "review_count":  review_count,
        "image_url":     image_url,
        # Pre-formatted display strings — use in React directly
        "price_display":       f"₹{int(price):,}",
        "final_price_display": f"₹{int(final_price):,}",
        "rating_display":      f"{avg_rating} ★",
        "discount_display":    f"{discount}% off" if discount > 0 else "",
    }
