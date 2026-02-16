"""
Test script to demonstrate data cleaning validation
"""

import pandas as pd
from preprocess_data import preprocess_data, validate_cleaned_data, compare_before_after, load_and_preprocess_data


def test_with_sample_data():
    """
    Create sample data and test the cleaning process.
    """
    # Create sample data with issues
    sample_data = {
        "User's ID": [1, 2, '-2147483648', 4, 5, 0, 7],
        'ProdID': [101, 102, 103, '-2147483648', 105, 106, 0],
        'Rating': [4.5, 3.2, 5.0, 4.0, 3.5, 4.8, 2.5],
        'Review Count': [10, 5, 20, 8, 15, 12, 3],
        'Category': ['Electronics', 'Books', None, 'Clothing', '', 'Electronics', 'Books'],
        'Brand': ['BrandA', None, 'BrandC', 'BrandD', 'BrandE', '', 'BrandG'],
        'Name': ['Product1', 'Product2', 'Product3', 'Product4', 'Product5', 'Product6', 'Product7'],
        'ImageURL': ['url1|', 'url2|', 'url3', 'url4|', 'url5', 'url6|', 'url7'],
        'Description': ['Desc1', 'Desc2', None, 'Desc4', '', 'Desc6', 'Desc7'],
        'Tags': ['tag1', 'tag2', 'tag3', 'tag4', None, 'tag6', 'tag7'],
        'Unnamed: 0': [0, 1, 2, 3, 4, 5, 6],
        'Unnamed: 10': [None, None, None, None, None, None, None]
    }
    
    raw_df = pd.DataFrame(sample_data)
    
    print("\n📊 ORIGINAL DATA INFO:")
    print("-" * 60)
    raw_df.info()
    print("\n📋 Sample of original data:")
    print(raw_df.head())
    print(f"\n❌ Issues in original data: {raw_df.isnull().sum().sum()} null values")
    
    # Clean the data
    print("\n🔧 CLEANING DATA...")
    print("-" * 60)
    cleaned_df = preprocess_data(raw_df)
    
    print("\n✅ CLEANED DATA INFO:")
    print("-" * 60)
    cleaned_df.info()
    print("\n📋 Sample of cleaned data:")
    print(cleaned_df.head())
    
    # Validate the cleaned data
    print("\n🔍 VALIDATING CLEANED DATA...")
    validation_results = validate_cleaned_data(cleaned_df)
    
    # Compare before and after
    compare_before_after(raw_df, cleaned_df)
    
    return raw_df, cleaned_df, validation_results


def test_with_your_data(file_path):
    """
    Test cleaning with your actual data file.
    
    Parameters:
    -----------
    file_path : str
        Path to your CSV file
    """
    print(f"\n📂 Loading data from: {file_path}")
    print("-" * 60)
    
    # Load raw data
    raw_df = pd.read_csv(file_path)
    print("\n📊 ORIGINAL DATA INFO:")
    print("-" * 60)
    raw_df.info()
    print(f"\nNull values per column:")
    print(raw_df.isnull().sum())
    
    # Clean the data
    print("\n🔧 CLEANING DATA...")
    print("-" * 60)
    cleaned_df = preprocess_data(raw_df)
    
    print("\n✅ CLEANED DATA INFO:")
    print("-" * 60)
    cleaned_df.info()
    print(f"\nNull values per column:")
    print(cleaned_df.isnull().sum())
    
    # Validate the cleaned data
    print("\n🔍 VALIDATING CLEANED DATA...")
    validation_results = validate_cleaned_data(cleaned_df)
    
    # Compare before and after
    compare_before_after(raw_df, cleaned_df)
    
    # Optionally save cleaned data
    save = input("\n💾 Do you want to save the cleaned data? (yes/no): ").lower()
    if save in ['yes', 'y']:
        output_path = input("Enter output filename (e.g., cleaned_data.csv): ")
        cleaned_df.to_csv(output_path, index=False)
        print(f"✅ Cleaned data saved to: {output_path}")
    
    return raw_df, cleaned_df, validation_results


if __name__ == "__main__":
    print("=" * 60)
    print("DATA CLEANING VALIDATION TEST")
    print("=" * 60)
    
    print("\nChoose an option:")
    print("1. Test with sample data (demonstration)")
    print("2. Test with your actual data file")
    
    choice = input("\nEnter your choice (1 or 2): ").strip()
    
    if choice == "1":
        print("\n🧪 Running test with sample data...")
        test_with_sample_data()
    elif choice == "2":
        file_path = input("\nEnter the path to your CSV file: ").strip()
        try:
            test_with_your_data(file_path)
        except FileNotFoundError:
            print(f"\n❌ Error: File '{file_path}' not found!")
            print("Please check the file path and try again.")
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
    else:
        print("\n❌ Invalid choice!")
