import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity


def build_collaborative_model(data):

    user_item_matrix = data.pivot_table(
        index="User's ID",
        columns="ProdID",
        values="Rating",
        fill_value=0
    )

    user_similarity = cosine_similarity(user_item_matrix)

    similarity_df = pd.DataFrame(
        user_similarity,
        index=user_item_matrix.index,
        columns=user_item_matrix.index
    )

    return user_item_matrix, similarity_df


def recommend_collaborative(user_id, user_item_matrix, similarity_df, top_n=5):

    if user_id not in user_item_matrix.index:
        return "User not found"

    similar_users = similarity_df[user_id].sort_values(ascending=False)[1:21]

    similar_users_ratings = user_item_matrix.loc[similar_users.index]

    recommended_products = similar_users_ratings.mean().sort_values(ascending=False)

    user_rated_products = user_item_matrix.loc[user_id]

    recommended_products = recommended_products[user_rated_products == 0]

    return recommended_products.head(top_n)