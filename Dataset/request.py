import requests

user_input = {
    'gender': 0,  # 0 for female, 1 for male
    'age': 40,
    'height_cm': 150,
    'weight_kg': 70,
    'goal': 'maintain',
    'Type': 'vegetarian',
    'meal_type': 'general',
    'health_conditions': ['hypertension'],
    'meal_frequency': 3,
    'activity_type': 'yoga'
}

response = requests.post("http://127.0.0.1:8000/recommend", json=user_input)
print(response.json())
# Output the response from the API
if response.status_code == 200:
    print("Diet Plan:", response.json())
else:
    print("Error:", response.status_code, response.text)