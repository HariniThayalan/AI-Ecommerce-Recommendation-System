import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def content_based_recommendation(cleaned_data, product_name, n_recommendations=10):
    """
    Content-based recommendation system that recommends similar products.
    
    Parameters:
    -----------
    cleaned_data : pd.DataFrame
        The preprocessed dataset containing product information
    product_name : str
        The name of the product to find recommendations for
    n_recommendations : int, optional (default=10)
        Number of recommendations to return
    
    Returns:
    --------
    pd.DataFrame
        DataFrame containing recommended products, or empty DataFrame if product not found
    """
    
    # ===============================================================
    # STEP 1: CHECK IF THE PRODUCT EXISTS
    # ===============================================================
    # First, the system checks whether the product name entered by the user exists in the dataset.
    # If the product is not found:
    # • It prints a message saying the item is not found
    # • It returns an empty result
    # • The process stops there
    # If the product exists, then it continues.
    
    if product_name not in cleaned_data['Name'].values:
        print(f"Item '{product_name}' is not found in the dataset.")
        return pd.DataFrame()  # Return empty result
    
    # If product exists, continue with recommendation logic
    print(f"Product '{product_name}' found. Generating recommendations...")
    
    
    # ===============================================================
    # STEP 2: CONVERT TEXT (TAGS) INTO NUMBERS
    # ===============================================================
    # Computers cannot understand text directly.
    # So the "Tags" column (which contains text like "wireless bluetooth headphones") 
    # is converted into numbers using a method called TF-IDF.
    # What happens here?
    # 1. All product tags are taken
    # 2. Sentences are broken into individual words
    # 3. Common words like "the", "is", etc. are removed
    # 4. Each word is converted into a numeric value
    # 5. A matrix is created where:
    #    • Rows = products
    #    • Columns = words
    #    • Values = importance of that word in that product
    # Now each product becomes a numeric vector.
    
    # Create a combined feature column from Category, Brand, Description, and Tags
    cleaned_data['combined_features'] = (
        cleaned_data['Category'].astype(str) + ' ' +
        cleaned_data['Brand'].astype(str) + ' ' +
        cleaned_data['Description'].astype(str) + ' ' +
        cleaned_data['Tags'].astype(str)
    )
    
    # Initialize TF-IDF Vectorizer
    # stop_words='english' removes common words like "the", "is", etc.
    # max_features=5000 limits to the 5000 most important words
    tfidf = TfidfVectorizer(stop_words='english', max_features=5000)
    
    # Transform the text into a TF-IDF matrix
    # This creates a matrix where each row is a product and each column is a word
    tfidf_matrix = tfidf.fit_transform(cleaned_data['combined_features'])
    print(f"TF-IDF Matrix created with shape: {tfidf_matrix.shape}")
    
    
    # ===============================================================
    # STEP 3: CALCULATE SIMILARITY BETWEEN PRODUCTS
    # ===============================================================
    # After converting text into numbers, the system calculates similarity between all products.
    # This is done using cosine similarity.
    # Cosine similarity measures how close two products are based on their tag vectors.
    # If similarity score is:
    # • Close to 1 → very similar
    # • Close to 0 → not similar
    # A similarity matrix is created where:
    # Each product is compared with every other product
    
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    print(f"Cosine similarity matrix created with shape: {cosine_sim.shape}")
    
    
    # ===============================================================
    # STEP 4: FIND THE SELECTED PRODUCT INDEX
    # ===============================================================
    # The system finds the row number (index) of the product selected by the user.
    # For example:
    # If the selected product is at row 5,
    # Then index = 5.
    # This index helps the system know which product to compare with others.
    
    idx = cleaned_data[cleaned_data['Name'] == product_name].index[0]
    print(f"Product index: {idx}")
    
    
    # ===============================================================
    # STEP 5: GET SIMILARITY SCORES FOR THAT PRODUCT
    # ===============================================================
    # Now the system looks at the similarity matrix and extracts similarity scores 
    # of the selected product with all other products.
    # It creates a list like this conceptually:
    # (Product 0, similarity score)
    # (Product 1, similarity score)
    # (Product 2, similarity score)
    # and so on
    
    # Get pairwise similarity scores of all products with the input product
    # enumerate() creates tuples of (index, similarity_score)
    sim_scores = list(enumerate(cosine_sim[idx]))
    
    # Sort products based on similarity scores in descending order (highest first)
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    # Get the indices of the top n most similar products
    # We skip index 0 because that's the product itself (similarity = 1.0)
    sim_scores = sim_scores[1:n_recommendations+1]
    
    # Extract just the product indices from the sorted list
    product_indices = [i[0] for i in sim_scores]
    
    # Return the top n most similar products with their details
    recommendations = cleaned_data.iloc[product_indices][['Name', 'Category', 'Brand', 'Description', 'Tags', 'Review Count']].copy()
    recommendations['Similarity_Score'] = [score[1] for score in sim_scores]
    
    print(f"\nTop {n_recommendations} recommendations generated successfully!")
    
    return recommendations


# Example usage:
if __name__ == "__main__":
    # Load the preprocessed data
    data = pd.read_csv('preprocessed_data.csv')
    
    # Test the function with a product name
    product_name = input("Enter product name: ")
    recommendations = content_based_recommendation(data, product_name, n_recommendations=10)
    
    if not recommendations.empty:
        print("\nTop Recommendations:")
        print(recommendations.to_string(index=False))
