import pandas as pd
from collaborative_filtering import collaborative_recommendation
from content_based import content_based_recommendation

def rating_based_recommendation(df, top_n=30):
    top_products = (
        df.groupby("ProdID")["Rating"]
        .mean()
        .sort_values(ascending=False)
        .head(top_n)
    )
    return top_products.index.tolist()


def get_recommendations(df, user_id=None, product_name=None, user_history=None):
    # Ensure we have a valid user_id
    uid = user_id if user_id is not None else 1

    # 1. Collaborative Filtering
    collab = collaborative_recommendation(df, uid, user_history=user_history)

    # 2. Ranking-Based Filtering (Rating / Popularity)
    ranking = rating_based_recommendation(df)

    # 3. Content-Based Filtering
    # If no product selected, use the first product in the dataframe
    if not product_name and not df.empty:
        product_name = df.iloc[0].get("Name", "")

    content = []
    if product_name:
        try:
            content_df = content_based_recommendation(df, product_name)
            if not content_df.empty:
                content = content_df["Name"].tolist()
        except Exception as e:
            print("Content-based filtering failed:", e)

    return {
        "collaborative": collab,
        "ranking": ranking,
        "content": content,
        "selected_product": product_name
    }