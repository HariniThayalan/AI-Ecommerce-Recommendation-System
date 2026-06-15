import pandas as pd

from cleaning_data import process_data
from collaborative_filtering import collaborative_recommendation
from content_based import content_based_recommendation

data = pd.read_csv("clean_data.csv")

data = process_data(data)

print("Dataset Loaded Successfully")
print("Shape:", data.shape)

print("\nCollaborative Filtering Test")

sample_user = data["User's ID"].iloc[0]

recommendations = collaborative_recommendation(data, sample_user, 5)

print("User:", sample_user)
print("Recommended Product IDs:", recommendations)

print("\nContent Based Filtering Test")

sample_product = data["Name"].iloc[0]

result = content_based_recommendation(data, sample_product, 5)

print("Product:", sample_product)
print(result)