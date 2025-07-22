import requests
import json  # For pretty printing JSON

user_input = {
  "gender": 1,
  "age": 30,
  "height_cm": 170,
  "weight_kg": 70,
  "goal": "weight_loss",
  "Type": "vegetarian",
  "meal_type": "dinner",
  "health_conditions": ["asthma"],
  "activity_type": "yoga",
  "exclude_recipe_names": []
}

try:
    response = requests.post("http://127.0.0.1:8000/recommend", json=user_input)
    
    if response.status_code == 200:
        print("\n" + "="*50)
        print("SUCCESSFUL RESPONSE".center(50))
        print("="*50)
        
        # Pretty print the JSON response
        response_data = response.json()
        print(json.dumps(response_data, indent=4))
        
        # If you want to extract specific parts (assuming a certain structure)
        if 'diet_plan' in response_data:
            print("\n" + "-"*50)
            print("DIET PLAN SUMMARY".center(50))
            print("-"*50)
            
            # Example for displaying meals if they exist in the response
            if 'meals' in response_data['diet_plan']:
                for day, meals in response_data['diet_plan']['meals'].items():
                    print(f"\n{day.upper()}:")
                    for meal_type, meal_details in meals.items():
                        print(f"\n  {meal_type.capitalize()}:")
                        if isinstance(meal_details, list):
                            for item in meal_details:
                                print(f"    - {item}")
                        elif isinstance(meal_details, dict):
                            for item, details in meal_details.items():
                                print(f"    - {item}: {details}")
                        else:
                            print(f"    - {meal_details}")
            
            # Display nutritional information if available
            if 'nutritional_info' in response_data['diet_plan']:
                print("\nNUTRITIONAL INFORMATION:")
                for key, value in response_data['diet_plan']['nutritional_info'].items():
                    print(f"  {key.replace('_', ' ').title()}: {value}")
                    
    else:
        print("\n" + "="*50)
        print("ERROR RESPONSE".center(50))
        print("="*50)
        print(f"Status Code: {response.status_code}")
        print(f"Error Message: {response.text}")

except requests.exceptions.RequestException as e:
    print("\n" + "="*50)
    print("REQUEST FAILED".center(50))
    print("="*50)
    print(f"An error occurred: {e}")