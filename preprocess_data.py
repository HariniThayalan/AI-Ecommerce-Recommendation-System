import pandas as pd
import numpy as np

data = pd.read_csv("clean_data.csv")

data['prodID'] = data['ProdID'].replace('-2147483648', np.nan)
data["User's ID"] = data["User's ID"].replace('-2147483648', np.nan)

data = data.dropna(subset=["User's ID"])

data["User's ID"] = data["User's ID"].astype('int64')

data = data.dropna(subset=['prodID'])
data['prodID'] = data['prodID'].astype('int64')

data['Review Count'] = data['Review Count'].astype('int64')

data['Category'] = data['Category'].fillna('')
data['Brand'] = data['Brand'].fillna('')
data['Description'] = data['Description'].fillna('')
data['Tags'] = data['Tags'].fillna('')

data.to_csv('preprocessed_data.csv', index=False)
print(f"Preprocessing complete. Shape: {data.shape}")
