def recommend_top_rated(data, top_n=5):

    top_rated = (
        data.groupby("ProdID")["Rating"]
        .mean()
        .sort_values(ascending=False)
        .head(top_n)
        .reset_index()
    )

    # Merge to get product details
    product_details = data[["ProdID", "Name", "Category", "Brand"]].drop_duplicates("ProdID")
    result = top_rated.merge(product_details, on="ProdID", how="left")

    # Reorder columns for a cleaner display
    result = result[["ProdID", "Name", "Category", "Brand", "Rating"]]

    return result