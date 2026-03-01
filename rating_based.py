def recommend_top_rated(data, top_n=5):

    top_rated = (
        data.groupby("ProdID")["Rating"]
        .mean()
        .sort_values(ascending=False)
        .head(top_n)
    )

    return top_rated