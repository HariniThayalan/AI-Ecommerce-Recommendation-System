"""
Data Preprocessing Module for Recommendation System
This module contains functions to clean and preprocess the dataset.
"""

import pandas as pd
import numpy as np


def preprocess_data(df):
    """
    Clean the dataset by applying all preprocessing steps.
    
    Parameters:
    -----------
    df : pandas.DataFrame
        The raw dataframe to be cleaned
        
    Returns:
    --------
    pandas.DataFrame
        The cleaned dataframe
    """
    # Make a copy to avoid modifying the original
    data = df.copy()
    
    # Step 1: Replace invalid values with NaN
    data = replace_invalid_values(data)
    
    # Step 2: Convert ID column to numeric and remove rows with NaN
    data = clean_user_id(data)
    
    # Step 3: Clean ProdID by dropping rows with NaN
    data = clean_product_id(data)
    
    # Step 4: Remove rows where ID or ProdID is 0
    data = remove_zero_ids(data)
    
    # Step 5: Drop unwanted columns
    data = drop_unwanted_columns(data)
    
    # Step 6: Fill text columns with empty strings
    data = fill_text_columns(data)
    
    # Step 7: Clean image links by removing | character
    data = clean_image_urls(data)
    
    # Step 8: Reset index
    data.reset_index(drop=True, inplace=True)
    
    return data


def replace_invalid_values(data):
    """
    Replace invalid values like '-2147483648' with NaN.
    
    Parameters:
    -----------
    data : pandas.DataFrame
        The dataframe to process
        
    Returns:
    --------
    pandas.DataFrame
        Dataframe with invalid values replaced
    """
    # Replace invalid ID values with NaN
    data["User's ID"] = data["User's ID"].replace('-2147483648', np.nan)
    
    # Replace invalid ProdID values with NaN
    data['ProdID'] = data['ProdID'].replace('-2147483648', np.nan)
    
    return data


def clean_user_id(data):
    """
    Convert User's ID to numeric and remove rows with NaN values.
    
    Parameters:
    -----------
    data : pandas.DataFrame
        The dataframe to process
        
    Returns:
    --------
    pandas.DataFrame
        Dataframe with cleaned User's ID column
    """
    # Convert all ID values to numeric and force invalid ones to NaN
    data["User's ID"] = pd.to_numeric(data["User's ID"], errors='coerce')
    
    # Drop rows where ID is missing after conversion
    data = data.dropna(subset=["User's ID"])
    
    # Convert to integer
    data["User's ID"] = data["User's ID"].astype('int64')
    
    return data


def clean_product_id(data):
    """
    Clean ProdID by dropping rows with NaN values.
    
    Parameters:
    -----------
    data : pandas.DataFrame
        The dataframe to process
        
    Returns:
    --------
    pandas.DataFrame
        Dataframe with cleaned ProdID column
    """
    # Convert ProdID to numeric and force invalid ones to NaN
    data['ProdID'] = pd.to_numeric(data['ProdID'], errors='coerce')
    
    # Drop rows where ProdID is missing after conversion
    data = data.dropna(subset=['ProdID'])
    
    # Convert to integer
    data['ProdID'] = data['ProdID'].astype('int64')
    
    return data


def remove_zero_ids(data):
    """
    Remove rows where User's ID or ProdID is 0.
    
    Parameters:
    -----------
    data : pandas.DataFrame
        The dataframe to process
        
    Returns:
    --------
    pandas.DataFrame
        Dataframe without zero IDs
    """
    # Remove rows where User's ID is 0
    data = data[data["User's ID"] != 0]
    
    # Remove rows where ProdID is 0
    data = data[data['ProdID'] != 0]
    
    return data


def drop_unwanted_columns(data):
    """
    Drop unwanted columns like 'Unnamed: 0' and other unnamed columns.
    
    Parameters:
    -----------
    data : pandas.DataFrame
        The dataframe to process
        
    Returns:
    --------
    pandas.DataFrame
        Dataframe without unwanted columns
    """
    # List of columns to drop if they exist
    columns_to_drop = ['Unnamed: 0', 'Unnamed: 10', 'Unnamed: 11', 
                       'Unnamed: 12', 'Unnamed: 13', 'Unnamed: 14']
    
    # Drop columns that exist in the dataframe
    columns_to_drop = [col for col in columns_to_drop if col in data.columns]
    
    if columns_to_drop:
        data = data.drop(columns=columns_to_drop)
    
    return data


def fill_text_columns(data):
    """
    Fill text columns with empty strings if they contain null values.
    
    Parameters:
    -----------
    data : pandas.DataFrame
        The dataframe to process
        
    Returns:
    --------
    pandas.DataFrame
        Dataframe with text columns filled
    """
    # List of text columns to fill
    text_columns = ['Category', 'Brand', 'Name', 'Description', 'Tags']
    
    # Fill each text column with empty string if it exists
    for col in text_columns:
        if col in data.columns:
            data[col] = data[col].fillna('')
    
    return data


def clean_image_urls(data):
    """
    Remove the | character from image links to clean them.
    
    Parameters:
    -----------
    data : pandas.DataFrame
        The dataframe to process
        
    Returns:
    --------
    pandas.DataFrame
        Dataframe with cleaned image URLs
    """
    if 'ImageURL' in data.columns:
        # Remove | character from ImageURL
        data['ImageURL'] = data['ImageURL'].str.replace('|', '', regex=False)
    
    return data


def load_and_preprocess_data(file_path):
    """
    Load data from CSV file and apply all preprocessing steps.
    
    Parameters:
    -----------
    file_path : str
        Path to the CSV file
        
    Returns:
    --------
    pandas.DataFrame
        The cleaned dataframe
    """
    # Load the data
    data = pd.read_csv(file_path)
    
    # Apply preprocessing
    cleaned_data = preprocess_data(data)
    
    print(f"Data loaded and cleaned successfully!")
    print(f"Original shape: {data.shape}")
    print(f"Cleaned shape: {cleaned_data.shape}")
    print(f"Rows removed: {data.shape[0] - cleaned_data.shape[0]}")
    
    return cleaned_data


def validate_cleaned_data(data):
    """
    Validate that the data has been cleaned properly.
    
    Parameters:
    -----------
    data : pandas.DataFrame
        The cleaned dataframe to validate
        
    Returns:
    --------
    dict
        Dictionary containing validation results
    """
    validation_results = {}
    
    print("=" * 60)
    print("DATA VALIDATION REPORT")
    print("=" * 60)
    
    # Check 1: No invalid ID values
    invalid_ids = (data["User's ID"] == -2147483648).sum() if "User's ID" in data.columns else 0
    validation_results['invalid_user_ids'] = invalid_ids
    print(f"\n1. Invalid User IDs (-2147483648): {invalid_ids}")
    print(f"   ✓ PASS" if invalid_ids == 0 else f"   ✗ FAIL")
    
    # Check 2: No invalid ProdID values
    invalid_prods = (data['ProdID'] == -2147483648).sum() if 'ProdID' in data.columns else 0
    validation_results['invalid_product_ids'] = invalid_prods
    print(f"\n2. Invalid Product IDs (-2147483648): {invalid_prods}")
    print(f"   ✓ PASS" if invalid_prods == 0 else f"   ✗ FAIL")
    
    # Check 3: No NaN values in ID columns
    nan_user_ids = data["User's ID"].isna().sum() if "User's ID" in data.columns else 0
    nan_prod_ids = data['ProdID'].isna().sum() if 'ProdID' in data.columns else 0
    validation_results['nan_user_ids'] = nan_user_ids
    validation_results['nan_product_ids'] = nan_prod_ids
    print(f"\n3. NaN values in User's ID: {nan_user_ids}")
    print(f"   NaN values in ProdID: {nan_prod_ids}")
    print(f"   ✓ PASS" if (nan_user_ids == 0 and nan_prod_ids == 0) else f"   ✗ FAIL")
    
    # Check 4: No zero IDs
    zero_user_ids = (data["User's ID"] == 0).sum() if "User's ID" in data.columns else 0
    zero_prod_ids = (data['ProdID'] == 0).sum() if 'ProdID' in data.columns else 0
    validation_results['zero_user_ids'] = zero_user_ids
    validation_results['zero_product_ids'] = zero_prod_ids
    print(f"\n4. Zero User IDs: {zero_user_ids}")
    print(f"   Zero Product IDs: {zero_prod_ids}")
    print(f"   ✓ PASS" if (zero_user_ids == 0 and zero_prod_ids == 0) else f"   ✗ FAIL")
    
    # Check 5: Unwanted columns removed
    unwanted_cols = [col for col in data.columns if col.startswith('Unnamed:')]
    validation_results['unwanted_columns'] = unwanted_cols
    print(f"\n5. Unwanted columns (Unnamed:*): {len(unwanted_cols)}")
    if unwanted_cols:
        print(f"   Found: {', '.join(unwanted_cols)}")
    print(f"   ✓ PASS" if len(unwanted_cols) == 0 else f"   ✗ FAIL")
    
    # Check 6: Data types are correct
    correct_dtypes = True
    if "User's ID" in data.columns:
        user_id_dtype = data["User's ID"].dtype == 'int64'
        print(f"\n6. Data Types:")
        print(f"   User's ID is int64: {user_id_dtype}")
        correct_dtypes = correct_dtypes and user_id_dtype
    
    if 'ProdID' in data.columns:
        prod_id_dtype = data['ProdID'].dtype == 'int64'
        print(f"   ProdID is int64: {prod_id_dtype}")
        correct_dtypes = correct_dtypes and prod_id_dtype
    
    validation_results['correct_dtypes'] = correct_dtypes
    print(f"   ✓ PASS" if correct_dtypes else f"   ✗ FAIL")
    
    # Check 7: Text columns filled (no NaN in text columns)
    text_columns = ['Category', 'Brand', 'Name', 'Description', 'Tags']
    text_nans = {}
    for col in text_columns:
        if col in data.columns:
            text_nans[col] = data[col].isna().sum()
    
    validation_results['text_column_nans'] = text_nans
    print(f"\n7. NaN values in text columns:")
    for col, nan_count in text_nans.items():
        print(f"   {col}: {nan_count}")
    all_text_filled = all(count == 0 for count in text_nans.values())
    print(f"   ✓ PASS" if all_text_filled else f"   ✗ FAIL")
    
    # Check 8: ImageURL cleaned (no | character)
    if 'ImageURL' in data.columns:
        pipe_count = data['ImageURL'].str.contains('\\|', na=False).sum()
        validation_results['image_urls_with_pipe'] = pipe_count
        print(f"\n8. ImageURLs containing '|' character: {pipe_count}")
        print(f"   ✓ PASS" if pipe_count == 0 else f"   ✗ FAIL")
    
    # Check 9: Index is reset
    index_reset = data.index.equals(pd.RangeIndex(len(data)))
    validation_results['index_reset'] = index_reset
    print(f"\n9. Index properly reset: {index_reset}")
    print(f"   ✓ PASS" if index_reset else f"   ✗ FAIL")
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total rows: {len(data)}")
    print(f"Total columns: {len(data.columns)}")
    print(f"Columns: {', '.join(data.columns)}")
    
    # Overall status
    all_passed = (
        invalid_ids == 0 and invalid_prods == 0 and
        nan_user_ids == 0 and nan_prod_ids == 0 and
        zero_user_ids == 0 and zero_prod_ids == 0 and
        len(unwanted_cols) == 0 and correct_dtypes and
        all_text_filled and index_reset
    )
    
    if 'ImageURL' in data.columns:
        all_passed = all_passed and pipe_count == 0
    
    validation_results['all_checks_passed'] = all_passed
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✓ ALL CHECKS PASSED - Data is properly cleaned!")
    else:
        print("✗ SOME CHECKS FAILED - Data needs further cleaning!")
    print("=" * 60 + "\n")
    
    return validation_results


def compare_before_after(raw_data, cleaned_data):
    """
    Compare raw and cleaned data to show the impact of cleaning.
    
    Parameters:
    -----------
    raw_data : pandas.DataFrame
        The original raw dataframe
    cleaned_data : pandas.DataFrame
        The cleaned dataframe
    """
    print("\n" + "=" * 60)
    print("BEFORE vs AFTER CLEANING COMPARISON")
    print("=" * 60)
    
    print(f"\nShape:")
    print(f"  Before: {raw_data.shape}")
    print(f"  After:  {cleaned_data.shape}")
    print(f"  Rows removed: {raw_data.shape[0] - cleaned_data.shape[0]}")
    print(f"  Columns removed: {raw_data.shape[1] - cleaned_data.shape[1]}")
    
    print(f"\nNull values:")
    print(f"  Before: {raw_data.isnull().sum().sum()}")
    print(f"  After:  {cleaned_data.isnull().sum().sum()}")
    
    print(f"\nMemory usage:")
    print(f"  Before: {raw_data.memory_usage(deep=True).sum() / 1024:.2f} KB")
    print(f"  After:  {cleaned_data.memory_usage(deep=True).sum() / 1024:.2f} KB")
    
    print("\n" + "=" * 60 + "\n")


if __name__ == "__main__":
    # Example usage
    print("=" * 60)
    print("DATA PREPROCESSING MODULE")
    print("=" * 60)
    print("\nThis module provides functions to clean your data.")
    print("\nUsage:")
    print("  1. Load and clean data:")
    print("     cleaned_data = load_and_preprocess_data('your_file.csv')")
    print("\n  2. Validate cleaned data:")
    print("     validate_cleaned_data(cleaned_data)")
    print("\n  3. Compare before/after:")
    print("     raw_data = pd.read_csv('your_file.csv')")
    print("     cleaned_data = preprocess_data(raw_data)")
    print("     compare_before_after(raw_data, cleaned_data)")
    print("\n" + "=" * 60)
