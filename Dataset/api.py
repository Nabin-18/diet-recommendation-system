import requests
import time
import csv

API_KEY = 'rh16KKtt1JYHxXcdayOidiNBuXXbNAW7o93oIKNI'

# List of your food items
foods = [
    "rice", "brown rice", "basmati rice", "quinoa", "oats", "wheat flour", "semolina",
    "barley", "cornmeal", "millet", "bulgur", "bread", "white bread", "whole wheat bread",
    "pasta", "noodles", "rice noodles", "vermicelli", "broccoli", "mushroom", "pepper",
    "onion", "tomato", "eggplant", "spinach", "carrot", "potato", "sweet potato", "cabbage",
    "cauliflower", "green peas", "zucchini", "beetroot", "turnip", "radish", "okra",
    "lettuce", "kale", "cucumber", "pumpkin", "corn", "sweet corn", "asparagus",
    "brussels sprouts", "yam", "bottle gourd", "bitter gourd", "ridge gourd", "apple",
    "banana", "orange", "mango", "pineapple", "peach", "pear", "grapes", "kiwi",
    "watermelon", "strawberries", "raspberries", "blueberries", "blackberries", "papaya",
    "guava", "lemon", "lime", "figs", "dates", "avocado", "coconut", "dragon fruit",
    "lychee", "jackfruit", "pomegranate", "chicken breast", "chicken", "chicken thigh",
    "turkey", "beef", "beef steak", "pork", "duck", "bacon", "lamb", "salmon", "tuna",
    "shrimp", "sea bass", "sardines", "mutton", "crab", "lobster", "anchovies", "octopus",
    "egg", "egg yolk", "egg white", "milk", "whole milk", "skim milk", "yogurt",
    "greek yogurt", "cheese", "cottage cheese", "cream cheese", "butter", "ghee",
    "milk chocolate", "paneer", "evaporated milk", "condensed milk", "oil", "olive oil",
    "sunflower oil", "coconut oil", "mustard oil", "canola oil", "vegetable oil",
    "sesame oil", "lentils", "black beans", "kidney beans", "chickpeas", "green gram",
    "soybeans", "tofu", "tempeh", "white beans", "pigeon peas", "navy beans", "mung beans",
    "split peas", "almonds", "peanut butter", "peanuts", "cashews", "walnuts", "hazelnuts",
    "pistachios", "sesame seeds", "sunflower seeds", "pumpkin seeds", "chia seeds",
    "flaxseeds", "honey", "sugar", "jaggery", "molasses", "maple syrup", "jam", "mayonnaise",
    "ketchup", "soy sauce", "mustard", "vinegar", "barbecue sauce", "sriracha", "hot sauce",
    "tamarind paste", "garlic", "ginger", "turmeric", "coriander powder", "cumin",
    "mustard seeds", "cardamom", "cinnamon", "clove", "black pepper", "nutmeg", "fenugreek",
    "fennel", "bay leaf", "chili powder", "red chili", "mint leaves", "curry leaves", "idli",
    "dosa", "samosa", "puri", "paratha", "naan", "biryani", "dal", "khichdi", "poha",
    "upma", "kheer", "halwa", "pakora", "rajma", "chole", "roti", "black coffee",
    "coffee with milk", "tea without milk", "milk tea", "orange juice", "apple juice",
    "soft drink", "cola", "energy drink", "beer", "red wine", "whiskey", "salami",
    "sausages", "biscuit", "crackers", "pizza", "burger", "ice cream", "chips", "popcorn",
    "chocolate", "granola bar", "instant noodles", "french fries", "nachos"
]



def get_food_data(food_name):
    url = f"https://api.nal.usda.gov/fdc/v1/foods/search"
    params = {
        'api_key': API_KEY,
        'query': food_name,
        'pageSize': 1
    }
    response = requests.get(url, params=params)
    data = response.json()
    if data.get('foods'):
        food = data['foods'][0]
        nutrients = {n['nutrientName']: n['value'] for n in food['foodNutrients']}
        # Extract calories, protein, fat, carbs, fiber
        calories = nutrients.get('Energy', None) or nutrients.get('Energy (kcal)', None)
        protein = nutrients.get('Protein', None)
        fat = nutrients.get('Total lipid (fat)', None)
        carbs = nutrients.get('Carbohydrate, by difference', None)
        fiber = nutrients.get('Fiber, total dietary', None)
        sugar = nutrients.get('Sugars, total including NLEA', None)
        sodium = nutrients.get('Sodium, Na', None)
        return {
            'food': food_name,
            'calories': calories,
            'protein': protein,
            'fat': fat,
            'carbs': carbs,
            'fiber': fiber,
            'sugar':sugar,
            'sodium': sodium

        }
    return None

with open('nutrient_lookup.csv', 'w', newline='') as csvfile:
    fieldnames = ['food', 'calories', 'protein', 'fat', 'carbs', 'fiber','sugar', 'sodium']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    
    for food in foods:
        result = get_food_data(food)
        if result:
            writer.writerow(result)
        else:
            print(f"No data found for {food}")
        time.sleep(1)  
