import pandas as pd
import numpy as np


def process_data(filepath):
    data = pd.read_csv(filepath)

    # Replace invalid values
    data["User's ID"] = data["User's ID"].replace(-2147483648, np.nan)
    data["ProdID"] = data["ProdID"].replace(-2147483648, np.nan)

    # Convert to numeric
    data["User's ID"] = pd.to_numeric(data["User's ID"], errors='coerce')
    data["ProdID"] = pd.to_numeric(data["ProdID"], errors='coerce')
    data["Rating"] = pd.to_numeric(data["Rating"], errors='coerce')

    # Drop missing important values
    data.dropna(subset=["User's ID", "ProdID", "Rating"], inplace=True)

    # Remove zero IDs
    data = data[
        (data["User's ID"] != 0) &
        (data["ProdID"] != 0)
    ].copy()

    # Convert to int
    data["User's ID"] = data["User's ID"].astype(int)
    data["ProdID"] = data["ProdID"].astype(int)

    # Fill text columns
    text_columns = ["Category", "Brand", "Name", "Description", "Tags"]
    for col in text_columns:
        if col in data.columns:
            data[col] = data[col].fillna("")

    # Clean ImageURL
    if "ImageURL" in data.columns:
        data["ImageURL"] = data["ImageURL"].apply(
            lambda x: x.split("|")[0] if isinstance(x, str) else x
        )

    data.reset_index(drop=True, inplace=True)

    return data