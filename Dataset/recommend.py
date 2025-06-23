import pandas as pd
import re
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from scipy.optimize import minimize



nutrient=pd.read_csv('nutrient_cleaned.csv')
calorie_lookup = dict(zip(nutrient['food'].str.lower(), nutrient['calories']))

# -------------------------------------------
# Helper Functions
# -------------------------------------------
def get_activity_multiplier(a):
    return {
        'walking': 1.2, 'yoga': 1.3, 'dancing': 1.45, 'weight training': 1.55,
        'cycling': 1.6, 'basketball': 1.7, 'swimming': 1.75,
        'tennis': 1.75, 'running': 1.8, 'hiit': 1.9
    }.get(a.lower(), 1.2)

def calculate_bmr(w, h, age, gender):
    return 10 * w + 6.25 * h - 5 * age + (5 if gender else -161)

def calorie_target(bmr, goal):
    return bmr - 500 if goal == 'weight_loss' else bmr + 500 if goal == 'weight_gain' else bmr

def calculate_bmi(w, h):
    h /= 100
    return round(w / (h * h), 2)

def get_image_url(x):
    if isinstance(x, list) and x:
        return x[0]
    if isinstance(x, str) and x.startswith('http'):
        return x
    return "Image not found"

def optimize_ingredient_weights(ingredients, target_macros, recipe_name=""):
    """
    🎯 KEY FUNCTION: Optimizes ingredient quantities to match target calories/macros
    Uses realistic portion sizes and cooking ratios
    """
    if len(ingredients) == 0:
        return {}

    # Define realistic portion ranges for different ingredient types
    portion_guidelines = {
        
    # Proteins - based on actual nutrient data ranges
    'chicken': (100, 180),
    'beef': (100, 180),
    'fish': (120, 180),
    'salmon': (100, 150),
    'tuna': (100, 150),
    'shrimp': (80, 120),
    'egg': (50, 100),
    'tofu': (80, 150),
    'tempeh': (80, 120),
    'turkey': (100, 180),
    'pork': (100, 150),
    'lamb': (100, 150),
    'duck': (100, 150),
    'cod': (120, 180),
    'tilapia': (120, 180),
    'mackerel': (100, 150),
    'sardines': (80, 120),
    'crab': (80, 120),
    'lobster': (80, 120),
    'scallops': (80, 120),
    'mussels': (100, 150),
    'oysters': (80, 120),
    'cottage cheese': (100, 200),
    'greek yogurt': (100, 200),
    'protein powder': (25, 50),
    'seitan': (80, 120),
    
    # Legumes/Beans - higher protein, moderate calories
    'lentils': (60, 100),
    'chickpeas': (60, 100),
    'beans': (60, 100),
    'kidney beans': (60, 100),
    'black beans': (60, 100),
    'navy beans': (60, 100),
    'lima beans': (60, 100),
    'pinto beans': (60, 100),
    'garbanzo beans': (60, 100),
    'edamame': (80, 120),
    'split peas': (60, 100),
    'black-eyed peas': (60, 100),
    'fava beans': (60, 100),
    
    # Grains - based on dry weight from nutrient data
    'rice': (50, 100),
    'brown rice': (50, 100),
    'quinoa': (40, 80),
    'pasta': (60, 120),
    'bread': (30, 60),
    'oats': (40, 80),
    'barley': (50, 100),
    'bulgur': (40, 80),
    'wheat': (50, 100),
    'buckwheat': (40, 80),
    'millet': (40, 80),
    'amaranth': (40, 80),
    'couscous': (50, 100),
    'farro': (50, 100),
    'wild rice': (50, 100),
    'corn': (100, 150),
    'polenta': (50, 100),
    'tortilla': (30, 60),
    'bagel': (80, 120),
    'cereal': (30, 60),
    'crackers': (20, 40),
    'noodles': (60, 120),
    
    # Vegetables - low calorie, can have larger portions
    'broccoli': (100, 200),
    'spinach': (50, 150),
    'kale': (50, 150),
    'carrot': (80, 150),
    'tomato': (100, 200),
    'onion': (50, 100),
    'potato': (150, 250),
    'sweet potato': (150, 250),
    'bell pepper': (100, 200),
    'cucumber': (100, 200),
    'zucchini': (100, 200),
    'cauliflower': (100, 200),
    'cabbage': (100, 200),
    'lettuce': (50, 150),
    'mushrooms': (100, 200),
    'asparagus': (100, 200),
    'green beans': (100, 200),
    'peas': (80, 150),
    'celery': (100, 200),
    'radish': (50, 100),
    'beets': (100, 150),
    'turnip': (100, 150),
    'parsnip': (100, 150),
    'leek': (80, 150),
    'artichoke': (100, 200),
    'brussels sprouts': (100, 200),
    'eggplant': (100, 200),
    'okra': (100, 200),
    'squash': (100, 200),
    'pumpkin': (100, 200),
    'garlic': (5, 15),
    'ginger': (5, 15),
    'herbs': (5, 20),
    'avocado': (80, 150),
    
    # Fruits - moderate calories
    'apple': (150, 250),
    'banana': (120, 200),
    'orange': (150, 250),
    'berries': (80, 150),
    'grapes': (100, 150),
    'strawberries': (100, 200),
    'blueberries': (80, 150),
    'raspberries': (80, 150),
    'blackberries': (80, 150),
    'pear': (150, 250),
    'peach': (150, 250),
    'plum': (100, 200),
    'apricot': (100, 200),
    'kiwi': (100, 150),
    'mango': (150, 250),
    'pineapple': (150, 250),
    'watermelon': (200, 300),
    'cantaloupe': (200, 300),
    'honeydew': (200, 300),
    'cherries': (100, 150),
    'grapefruit': (200, 300),
    'lemon': (50, 100),
    'lime': (30, 80),
    'coconut': (30, 80),
    'dates': (30, 60),
    'figs': (50, 100),
    'raisins': (30, 60),
    'cranberries': (30, 60),
    'pomegranate': (100, 150),
    'papaya': (150, 250),
    
    # Fats/Oils - very high calorie density
    'oil': (5, 15),
    'olive oil': (5, 15),
    'coconut oil': (5, 15),
    'butter': (5, 20),
    'ghee': (5, 15),
    'avocado oil': (5, 15),
    'canola oil': (5, 15),
    'sunflower oil': (5, 15),
    'sesame oil': (5, 15),
    'vegetable oil': (5, 15),
    'margarine': (5, 20),
    'lard': (5, 15),
    'coconut butter': (10, 25),
    
    # Nuts/Seeds - high calorie density
    'almonds': (15, 30),
    'peanuts': (15, 30),
    'cashews': (15, 30),
    'seeds': (10, 25),
    'sesame seeds': (10, 20),
    'walnuts': (15, 30),
    'pecans': (15, 30),
    'pistachios': (15, 30),
    'hazelnuts': (15, 30),
    'brazil nuts': (15, 30),
    'macadamia nuts': (15, 30),
    'pine nuts': (10, 25),
    'sunflower seeds': (15, 30),
    'pumpkin seeds': (15, 30),
    'flax seeds': (10, 25),
    'chia seeds': (10, 25),
    'hemp seeds': (15, 30),
    'poppy seeds': (10, 20),
    'peanut butter': (15, 30),
    'almond butter': (15, 30),
    'tahini': (15, 30),
    'nutella': (15, 30),
    
    # Dairy
    'milk': (200, 300),
    'yogurt': (100, 200),
    'cheese': (20, 50),
    'cream cheese': (15, 30),
    'sour cream': (15, 30),
    'heavy cream': (15, 30),
    'mozzarella': (20, 50),
    'cheddar': (20, 50),
    'parmesan': (10, 30),
    'feta': (20, 50),
    'goat cheese': (20, 50),
    'ricotta': (50, 100),
    'cream': (30, 60),
    'buttermilk': (200, 300),
    'kefir': (200, 300),
    'ice cream': (50, 120),
    
    # Beverages
    'water': (200, 500),
    'tea': (200, 400),
    'coffee': (200, 400),
    'juice': (150, 250),
    'soda': (150, 300),
    'coconut water': (200, 400),
    'almond milk': (200, 300),
    'soy milk': (200, 300),
    'oat milk': (200, 300),
    'rice milk': (200, 300),
    'wine': (100, 150),
    'beer': (300, 500),
    'spirits': (30, 60),
    
    # Condiments & Seasonings
    'salt': (1, 5),
    'pepper': (1, 3),
    'vinegar': (5, 15),
    'soy sauce': (5, 15),
    'hot sauce': (2, 10),
    'mustard': (5, 15),
    'ketchup': (10, 20),
    'mayonnaise': (10, 20),
    'honey': (10, 25),
    'maple syrup': (10, 25),
    'sugar': (5, 15),
    'brown sugar': (5, 15),
    'vanilla': (2, 5),
    'cinnamon': (1, 5),
    'paprika': (1, 5),
    'turmeric': (1, 5),
    'cumin': (1, 5),
    'oregano': (1, 5),
    'basil': (2, 10),
    'thyme': (1, 5),
    'rosemary': (1, 5),
    'parsley': (5, 15),
    'cilantro': (5, 15),
    'dill': (2, 10),
    'mint': (2, 10),
    'lemon juice': (5, 15),
    'lime juice': (5, 15),
    'balsamic vinegar': (5, 15),
    'worcestershire sauce': (2, 10),
    'fish sauce': (2, 10),
    'coconut milk': (50, 100),
    'tomato paste': (10, 25),
    'tomato sauce': (50, 100),
    'pesto': (10, 25),
    'salsa': (30, 60),
    'hummus': (30, 60),
    'guacamole': (30, 60),
    
    # Snacks & Processed Foods
    'chips': (20, 50),
    'pretzels': (20, 50),
    'popcorn': (20, 50),
    'chocolate': (20, 50),
    'cookies': (20, 50),
    'cake': (50, 100),
    'pie': (80, 150),
    'candy': (20, 50),
    'granola': (30, 60),
    'energy bar': (30, 60),
    'protein bar': (40, 80),
    'trail mix': (30, 60),
    'jerky': (20, 40),
    'pizza': (100, 200),
    'sandwich': (150, 300),
    'burrito': (200, 400),
    'taco': (80, 150),
    'soup': (200, 400),
    'salad': (100, 300),
}
    
    
    def get_realistic_portions(ing_name):
        ing_lower = ing_name.lower()
        for key, (min_g, max_g) in portion_guidelines.items():
            if key in ing_lower or ing_lower in key:
                return min_g, max_g
        return portion_guidelines['default']

    # Build nutrition matrix with realistic constraints
    valid_ingredients = []
    bounds = []
    base_portions = []
    
    for ing in ingredients:
        row = nutrient[nutrient['food'].str.lower() == ing.lower()]
        if not row.empty:
            valid_ingredients.append(ing)
            min_g, max_g = get_realistic_portions(ing)
            bounds.append((min_g/100, max_g/100))  # Convert to 100g units
            base_portions.append((min_g + max_g) / 200)  # Average as starting point

    if len(valid_ingredients) == 0:
        return {}

    # Create nutrition matrix (per 100g)
    nutrition_matrix = []
    macros = ['calories', 'protein', 'fat', 'carbs', 'fiber']
    
    for ing in valid_ingredients:
        row = nutrient[nutrient['food'].str.lower() == ing.lower()]
        nutrition_row = []
        for macro in macros:
            value = row[macro].values[0] if macro in row.columns else 0
            nutrition_row.append(value)
        nutrition_matrix.append(nutrition_row)
    
    nutrition_matrix = np.array(nutrition_matrix)
    target = np.array(target_macros)

    def objective_function(portions):
        # Calculate predicted nutrition
        predicted = nutrition_matrix.T @ portions
        
        # Weighted error (calories most important, then protein)
        weights = np.array([2.0, 1.5, 1.0, 1.0, 0.5])  # calories, protein, fat, carbs, fiber
        errors = np.abs(predicted - target) / (target + 1e-6)  # Relative error
        
        # Penalty for unrealistic total portion size
        total_weight = sum(portions) * 100  # Convert back to grams
        if total_weight > 800:  # Penalty if meal > 800g
            size_penalty = (total_weight - 800) / 100
        else:
            size_penalty = 0
            
        return np.sum(weights * errors**2) + size_penalty

    try:
        # Use realistic starting portions
        initial_portions = np.array(base_portions)
        
        # Optimize with realistic bounds
        result = minimize(
            objective_function, 
            initial_portions, 
            bounds=bounds, 
            method='SLSQP',
            options={'maxiter': 1000}
        )
        
        if result.success:
            optimized_portions = result.x
        else:
            # Fallback to proportional scaling
            target_calories = target_macros[0]
            total_base_calories = sum(
                nutrition_matrix[i][0] * base_portions[i] 
                for i in range(len(valid_ingredients))
            )
            if total_base_calories > 0:
                scale_factor = min(2.0, target_calories / total_base_calories)
                optimized_portions = [p * scale_factor for p in base_portions]
            else:
                optimized_portions = base_portions
        
        # Convert to readable format
        quantities = {}
        total_cals = 0
        
        for i, ing in enumerate(valid_ingredients):
            grams = round(optimized_portions[i] * 100)
            if grams >= 5:  # Only include meaningful amounts
                quantities[ing] = f"{grams}g {ing}"
                # Calculate calories for this ingredient
                ing_cals = nutrition_matrix[i][0] * optimized_portions[i]
                total_cals += ing_cals
        
      
        
        return quantities
        
    except Exception as e:
        print(f"❌ Optimization failed for {recipe_name}: {e}")
        # Simple fallback: reasonable portions
        fallback_quantities = {}
        for ing in valid_ingredients[:3]:  # Limit to 3 main ingredients
            min_g, max_g = get_realistic_portions(ing)
            avg_g = (min_g + max_g) // 2
            fallback_quantities[ing] = f"{avg_g}g {ing}"
        return fallback_quantities

def inject_quantities_into_instructions(instructions, quantities):
    """
    🔄 Injects calculated quantities into recipe instructions
    """
    if isinstance(instructions, str):
        instructions = [instructions]

    updated_steps = []
    for step in instructions:
        original_step = step
        for ing, qty in quantities.items():
            # Match the whole word, case insensitive, and replace only once per step
            pattern = rf'\b{re.escape(ing)}\b'
            step, count = re.subn(pattern, qty, step, count=1, flags=re.IGNORECASE)
            if count > 0:
                continue

        # Clean up leading numbers/symbols and capitalize first letter
        clean_step = re.sub(r'^[0-9. )-]+', '', step).strip()
        if clean_step:
            clean_step = clean_step[0].upper() + clean_step[1:]

        updated_steps.append(clean_step if clean_step else original_step)

    # Number the steps
    return '\n'.join(f"{i+1}. {line}" for i, line in enumerate(updated_steps))

# -------------------------------------------
# Main Function
# -------------------------------------------
def suggest_diet(user_input: dict, recipe_df: pd.DataFrame, max_meals: int = 6, tolerance: float = 0.05):
    """
    🍽️ Main function that suggests optimized diet plan
    """
    nutrient_cols = ['Calories', 'FatContent', 'CarbohydrateContent', 'ProteinContent', 'FiberContent']
    df = recipe_df.copy()

    # ---------------- Filters ----------------
    df = df[df['Type'].str.lower() == user_input['Type'].lower()]
    df = df[df['MealType'].str.lower() == user_input['meal_type'].lower()]
    
    # Apply health condition filters
    for cond in [c.lower() for c in user_input.get('health_conditions', [])]:
        if cond == 'diabetes':
            df = df[df['SugarContent'] <= 10]
        elif cond == 'hypertension':
            df = df[df['SodiumContent'] <= 400]
        elif cond == 'asthma':
            df = df[~df['RecipeInstructions'].astype(str).str.contains('dairy', na=False, case=False)]
        elif cond == 'allergy':
            for allergen in [a.lower() for a in user_input.get('allergies', [])]:
                df = df[~df['RecipeInstructions'].astype(str).str.contains(allergen, na=False, case=False)]
                if 'RecipeIngredientParts' in df.columns:
                    df = df[~df['RecipeIngredientParts'].astype(str).str.contains(allergen, na=False, case=False)]

    if df.empty:
        return {
            "bmr": None, "bmi": None, "tdee": None,
            "calorie_target": None, "actual_calories": 0, "diet_plan": []
        }

    # ---------------- Calculations ----------------
    bmr = calculate_bmr(user_input['weight_kg'], user_input['height_cm'], user_input['age'], user_input['gender'])
    tdee = round(bmr * get_activity_multiplier(user_input['activity_type']), 2)
    
    goal = re.sub(r'[^a-z]', '_', user_input['goal'].lower())
    goal_key = {
        'wt_loss': 'weight_loss', 'weight_loss': 'weight_loss',
        'wt_gain': 'weight_gain', 'weight_gain': 'weight_gain',
        'maintain': 'maintain'
    }.get(goal, 'maintain')
    
    cal_target = round(calorie_target(tdee, goal_key), 2)
    bmi = calculate_bmi(user_input['weight_kg'], user_input['height_cm'])

    # ---------------- Nutrition Vector ----------------
    df = df.dropna(subset=nutrient_cols)
    df[nutrient_cols] = df[nutrient_cols].apply(pd.to_numeric, errors='coerce')
    df = df.dropna(subset=nutrient_cols)

    target_vec = [
        cal_target,
        cal_target * 0.25 / 9,  # fat
        cal_target * 0.5 / 4,   # carbs
        cal_target * 0.25 / 4,  # protein
        10                     # fiber
    ]

    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(df[nutrient_cols])
    sim = cosine_similarity([scaler.transform([target_vec])[0]], scaled)[0]
    df['similarity'] = sim

    # ---------------- Meal Selection & Optimization ----------------
    diet, kcal_sum = [], 0
    for _, row in df.sort_values('similarity', ascending=False).iterrows():
        if len(diet) >= max_meals or kcal_sum >= cal_target * (1 - tolerance):
            break

        # Extract ingredients from recipe
        instr = row.get('RecipeInstructions', '')
        ingredient_text = row.get('RecipeIngredientParts', '')
        
        # Combine instruction and ingredient text for ingredient extraction
        combined_text = ' '.join(instr if isinstance(instr, list) else [str(instr)]) + ' ' + str(ingredient_text)
        
        # Find ingredients that exist in our nutrient database
        found_ings = []
        for ingredient in nutrient['food'].str.lower():
            if re.search(rf'\b{re.escape(ingredient)}\b', combined_text.lower()):
                found_ings.append(ingredient)
        
        found_ings = list(set(found_ings))
        # print(f"🔍 Found ingredients for {row['Name']}: {found_ings}")

        # Target macros for this specific meal
        target_macros = [
            row['Calories'],
            row['ProteinContent'],
            row['FatContent'],
            row['CarbohydrateContent'],
            row['FiberContent']
        ]

        # 🎯 OPTIMIZE INGREDIENT QUANTITIES
        optimized_quantities = optimize_ingredient_weights(found_ings, target_macros, row['Name'])
        # print(f"⚖️ Optimized quantities: {optimized_quantities}")
        
        # Inject quantities into instructions
        instructions_with_quantities = inject_quantities_into_instructions(instr, optimized_quantities)

        # Calculate actual nutritional values based on optimized quantities
        actual_calories = 0
        actual_protein = 0
        actual_fat = 0
        actual_carbs = 0
        actual_fiber = 0
        
        for ing, qty_str in optimized_quantities.items():
            # Extract grams from string like "150g broccoli"
            grams_match = re.search(r'(\d+)g', qty_str)
            if grams_match:
                grams = int(grams_match.group(1))
                ing_data = nutrient[nutrient['food'].str.lower() == ing.lower()]
                if not ing_data.empty:
                    multiplier = grams / 100  # per 100g
                    actual_calories += ing_data['calories'].values[0] * multiplier
                    actual_protein += ing_data['protein'].values[0] * multiplier
                    actual_fat += ing_data['fat'].values[0] * multiplier
                    actual_carbs += ing_data['carbs'].values[0] * multiplier
                    actual_fiber += ing_data['fiber'].values[0] * multiplier
        
        # If no ingredients were optimized, use original recipe values
        if actual_calories == 0:
            actual_calories = row['Calories']
            actual_protein = row['ProteinContent']
            actual_fat = row['FatContent']
            actual_carbs = row['CarbohydrateContent']
            actual_fiber = row['FiberContent']

        # Add meal to diet plan
        diet.append({
            'Name': row['Name'],
            'Target Calories': round(row['Calories'], 1),
            'Optimized Calories': round(actual_calories, 1),
            'Calories (kcal)': round(actual_calories, 1),
            'Fat (g)': round(actual_fat, 1),
            'Carbs (g)': round(actual_carbs, 1),
            'Protein (g)': round(actual_protein, 1),
            'Fiber (g)': round(actual_fiber, 1),
            'Sugar (g)': round(row.get('SugarContent', 0), 1),
            'Sodium (mg)': round(row.get('SodiumContent', 0), 1),
            'Image': get_image_url(row.get('Images')),
            'Optimized Ingredients': list(optimized_quantities.values()),
            'Instructions': instructions_with_quantities,
            'Calorie Match %': round((actual_calories / row['Calories']) * 100, 1) if row['Calories'] > 0 else 0
        })

        kcal_sum += actual_calories

    return {
        "bmr": round(bmr, 2),
        "bmi": bmi,
        "tdee": tdee,
        "calorie_target": cal_target,
        "actual_calories": round(kcal_sum, 1),
        "diet_plan": diet,
        "calorie_accuracy": round((kcal_sum / cal_target) * 100, 1) if cal_target > 0 else 0
    }

# -------------------------------------------
# Example Usage
# -------------------------------------------
if __name__ == "__main__":
    user_input = {
        'gender': 0,  # 1 for male, 0 for female
        'age': 20,
        'height_cm': 150,
        'weight_kg': 50,
        'goal': 'maintain',
        'Type': 'non-vegetarian',
        'meal_type': 'general',
        'health_conditions': ['hypertension'],  # e.g. ['diabetes', 'hypertension'],
        'activity_type': 'yoga'
    }

    print("🔄 Generating optimized diet plan...")
    result = suggest_diet(user_input,recipe)

    print("\n" + "="*60)
    print("📊 DIET OPTIMIZATION RESULTS")
    print("="*60)
    print(f"🔥 BMR: {result['bmr']} kcal/day")
    print(f"📈 BMI: {result['bmi']}")
    print(f"⚡ TDEE: {result['tdee']} kcal/day")
    print(f"🎯 Calorie Target: {result['calorie_target']} kcal/day")
    print(f"✅ Actual Calories: {result['actual_calories']} kcal/day")
    print(f"🎪 Accuracy: {result['calorie_accuracy']}%")
    print(f"🍽️ Number of meals: {len(result['diet_plan'])}")

    print("\n" + "="*60)
    print("🍽️ OPTIMIZED MEAL PLAN")
    print("="*60)

    for i, meal in enumerate(result['diet_plan'], 1):
        print(f"\n🥗 Meal {i}: {meal['Name']}")
        print(f"   Calories: {meal['Calories (kcal)']}")
        

        print(f"   🥩 Protein: {meal['Protein (g)']}g")
        print(f"   🧈 Fat: {meal['Fat (g)']}g") 
        print(f"   🍞 Carbs: {meal['Carbs (g)']}g")
        print(f"   🌾 Fiber: {meal['Fiber (g)']}g")
        print(f"   📝  Ingredients:")
        for ingredient in meal['Optimized Ingredients']:
            print(f"      • {ingredient}")
        print(f"   👨‍🍳 Instructions:")
        for line in meal['Instructions'].split('\n'):
            print(f"      {line}")