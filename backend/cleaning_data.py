import pandas as pd
import numpy as np

def process_data(df):

    df.replace(["", " ", "NA", "null"], np.nan, inplace=True)

    df["User's ID"] = pd.to_numeric(df["User's ID"], errors="coerce")
    df["ProdID"] = pd.to_numeric(df["ProdID"], errors="coerce")
    df["Rating"] = pd.to_numeric(df["Rating"], errors="coerce")

    df.dropna(subset=["User's ID", "ProdID"], inplace=True)

    df = df[
        (df["User's ID"] > 0) &
        (df["ProdID"] > 0)
    ]

    df.loc[:, "User's ID"] = df["User's ID"].astype(int)
    df.loc[:, "ProdID"] = df["ProdID"].astype(int)

    if "ImageURL" in df.columns:
        df.loc[:, "ImageURL"] = df["ImageURL"].fillna("").apply(lambda x: str(x).split("|")[0].strip())

    df.reset_index(drop=True, inplace=True)

    return df