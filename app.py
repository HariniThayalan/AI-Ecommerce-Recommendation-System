from cleaning_data import process_data
from content_based import build_content_model, recommend_content_based
from collaborative_based import build_collaborative_model, recommend_collaborative
from rating_based import recommend_top_rated


# Load and clean data
data = process_data("cleaned_data.csv")

print("Data loaded successfully ✅")


# ------------------------
# CONTENT-BASED
# ------------------------
similarity_matrix = build_content_model(data)

print("\nContent-Based Recommendation:")
print(recommend_content_based(101, data, similarity_matrix))


# ------------------------
# COLLABORATIVE
# ------------------------
user_item_matrix, similarity_df = build_collaborative_model(data)

print("\nCollaborative Recommendation:")
print(recommend_collaborative(1, user_item_matrix, similarity_df))


# ------------------------
# RATING BASED
# ------------------------
print("\nTop Rated Products:")
print(recommend_top_rated(data))