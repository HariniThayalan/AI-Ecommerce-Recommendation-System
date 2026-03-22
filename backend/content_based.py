import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def build_content_model(data):
    tfidf = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf.fit_transform(data["Tags"])
    similarity_matrix = cosine_similarity(tfidf_matrix)
    return similarity_matrix


def recommend_content_based(product_id, data, similarity_matrix, top_n=5):

    if product_id not in data["ProdID"].values:
        return "Product not found"

    product_index = data.index[data["ProdID"] == product_id][0]

    similarity_scores = list(enumerate(similarity_matrix[product_index]))

    similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)

    top_products = similarity_scores[1:top_n+1]

    product_indices = [i[0] for i in top_products]

    return data.iloc[product_indices][["ProdID", "Name", "Category", "Brand"]]