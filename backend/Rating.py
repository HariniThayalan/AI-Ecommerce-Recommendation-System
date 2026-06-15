import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("clean_data.csv")

print("Dataset Shape:", df.shape)

print("\nRating Statistics")
print("Average Rating:", df["Rating"].mean())
print("Maximum Rating:", df["Rating"].max())
print("Minimum Rating:", df["Rating"].min())

plt.figure()
df["Rating"].hist()
plt.title("Rating Distribution")
plt.xlabel("Rating")
plt.ylabel("Number of Ratings")
plt.show()

top_products = df.groupby("ProdID")["Rating"].mean().sort_values(ascending=False).head(10)

print("\nTop Rated Products:")
print(top_products)