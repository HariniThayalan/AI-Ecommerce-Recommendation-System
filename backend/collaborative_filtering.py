import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

def collaborative_recommendation(df, user_id, top_n=5, user_history=None):

    user_item_matrix = df.pivot_table(
        index="User's ID",
        columns="ProdID",
        values="Rating",
        fill_value=0
    )

    # Inject user history if provided
    if user_history and len(user_history) > 0:
        import pandas as pd
        user_row = pd.Series(0.0, index=user_item_matrix.columns)
        for pid in user_history:
            if pid in user_row.index:
                user_row[pid] = 5.0  # Set high rating for interacted products
        user_item_matrix.loc[user_id] = user_row

    if user_id not in user_item_matrix.index:
        print("User not found")
        return []

    similarity = cosine_similarity(user_item_matrix)

    similarity_df = pd.DataFrame(
        similarity,
        index=user_item_matrix.index,
        columns=user_item_matrix.index
    )

    similar_users = similarity_df[user_id].sort_values(ascending=False).iloc[1:]

    user_products = user_item_matrix.loc[user_id]
    purchased_products = user_products[user_products > 0].index

    product_scores = pd.Series(dtype=float)

    for sim_user, score in similar_users.items():

        sim_user_products = user_item_matrix.loc[sim_user]

        product_scores = product_scores.add(sim_user_products * score, fill_value=0)

    product_scores = product_scores.drop(purchased_products, errors="ignore")

    recommendations = product_scores.sort_values(ascending=False).head(top_n)

    return recommendations.index.tolist()