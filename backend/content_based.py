import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def content_based_recommendation(data, item_name, top_n=5):

    data['Tags'] = data['Tags'].fillna("")

    if item_name not in data['Name'].values:
        print("Item not found")
        return pd.DataFrame()

    tfidf = TfidfVectorizer(stop_words='english')

    tfidf_matrix = tfidf.fit_transform(data['Tags'])

    similarity = cosine_similarity(tfidf_matrix, tfidf_matrix)

    item_index = data[data['Name'] == item_name].index[0]

    similarity_scores = list(enumerate(similarity[item_index]))

    similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)

    similarity_scores = similarity_scores[1:top_n+1]

    product_indices = [i[0] for i in similarity_scores]

    return data.iloc[product_indices][['Name', 'Brand', 'Review Count']]