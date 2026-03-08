import streamlit as st
import pandas as pd

from cleaning_data import process_data
from content_based import build_content_model, recommend_content_based
from collaborative_based import build_collaborative_model, recommend_collaborative
from rating_based import recommend_top_rated
from evaluation import precision_at_k, recall_at_k


# Load Data
data = process_data("cleaned_data.csv")

# Build Models
content_similarity = build_content_model(data)
user_item_matrix, similarity_df = build_collaborative_model(data)


st.title("🛒 Recommendation System")


option = st.selectbox(
    "Select Recommendation Type",
    ["Content Based", "Collaborative", "Top Rated"]
)


# --------------------------------
# CONTENT BASED
# --------------------------------
if option == "Content Based":

    product_id = st.number_input("Enter Product ID", step=1)

    if st.button("Recommend"):

        result = recommend_content_based(
            product_id,
            data,
            content_similarity
        )

        st.write("### Recommended Products")
        if isinstance(result, pd.DataFrame):
            st.dataframe(result)
        else:
            st.warning(result)


# --------------------------------
# COLLABORATIVE
# --------------------------------
elif option == "Collaborative":

    user_id = st.number_input("Enter User ID", step=1)

    if st.button("Recommend"):

        recommended_list, result = recommend_collaborative(
            user_id,
            user_item_matrix,
            similarity_df
        )

        st.write("### Recommended Products")

        if isinstance(result, str):
            st.warning(result)

        else:
            st.write(result)

            # Example evaluation (demo purpose)
            actual_items = data[data["User's ID"] == user_id]["ProdID"].tolist()

            precision = precision_at_k(recommended_list, actual_items, k=5)
            recall = recall_at_k(recommended_list, actual_items, k=5)

            st.write("### Evaluation Metrics")
            st.write("Precision@5:", precision)
            st.write("Recall@5:", recall)


# --------------------------------
# TOP RATED
# --------------------------------
elif option == "Top Rated":

    if st.button("Show Top Rated"):

        result = recommend_top_rated(data)

        st.write("### Top Rated Products")
        st.dataframe(result)