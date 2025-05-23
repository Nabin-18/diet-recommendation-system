import pandas as pd
import category_encoders as ce 

# Sample data
df = pd.DataFrame({
    'RecipeCategory': ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']
})

# Apply BinaryEncoder
encoder = ce.BinaryEncoder(cols=['RecipeCategory'])
df_encoded = encoder.fit_transform(df)

print("Original:")
print(df)
print("\nBinary Encoded:")
print(df_encoded)
