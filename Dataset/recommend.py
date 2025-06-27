import pandas as pd
import re
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from scipy.optimize import minimize

# Load nutrient data
nutrient = pd.read_csv('nutrient_cleaned.csv')
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

def validate_user_input(user_input):
    """Validate user input parameters"""
    required_fields = ['gender', 'age', 'height_cm', 'weight_kg', 'goal', 'Type', 'meal_type']
    for field in required_fields:
        if field not in user_input:
            raise ValueError(f"Missing required field: {field}")
    
    if user_input['age'] <= 0 or user_input['age'] > 120:
        raise ValueError("Age must be between 1-120")
    if user_input['height_cm'] <= 0 or user_input['height_cm'] > 250:
        raise ValueError("Height must be between 1-250 cm")
    if user_input['weight_kg'] <= 0 or user_input['weight_kg'] > 500:
        raise ValueError("Weight must be between 1-500 kg")

# Enhanced portion guidelines
portion_guidelines = {
    'default': (50, 150),
    
    # Proteins - moderate to high portions
    'chicken': (80, 150),
    'beef': (80, 150),
    'fish': (100, 150),
    'salmon': (80, 120),
    'tuna': (80, 120),
    'shrimp': (60, 100),
    'egg': (50, 100),
    'tofu': (60, 120),
    'tempeh': (60, 100),
    'turkey': (80, 150),
    'pork': (80, 120),
    'lamb': (80, 120),
    'duck': (80, 120),
    'cod': (100, 150),
    'tilapia': (100, 150),
    'mackerel': (80, 120),
    'sardines': (60, 100),
    'crab': (60, 100),
    'lobster': (60, 100),
    'scallops': (60, 100),
    'mussels': (80, 120),
    'oysters': (60, 100),
    'cottage cheese': (80, 150),
    'greek yogurt': (80, 150),
    'protein powder': (20, 40),
    'seitan': (60, 100),
    
    # Legumes/Beans - moderate portions
    'lentils': (40, 80),
    'chickpeas': (40, 80),
    'beans': (40, 80),
    'kidney beans': (40, 80),
    'black beans': (40, 80),
    'navy beans': (40, 80),
    'lima beans': (40, 80),
    'pinto beans': (40, 80),
    'garbanzo beans': (40, 80),
    'edamame': (60, 100),
    'split peas': (40, 80),
    'black-eyed peas': (40, 80),
    'fava beans': (40, 80),
    
    # Grains - based on dry weight
    'rice': (40, 80),
    'brown rice': (40, 80),
    'quinoa': (30, 60),
    'pasta': (50, 100),
    'bread': (25, 50),
    'oats': (30, 60),
    'barley': (40, 80),
    'bulgur': (30, 60),
    'wheat': (40, 80),
    'buckwheat': (30, 60),
    'millet': (30, 60),
    'amaranth': (30, 60),
    'couscous': (40, 80),
    'farro': (40, 80),
    'wild rice': (40, 80),
    'corn': (80, 120),
    'polenta': (40, 80),
    'tortilla': (25, 50),
    'bagel': (60, 100),
    'cereal': (25, 50),
    'crackers': (15, 30),
    'noodles': (50, 100),
    
    # Vegetables - larger portions allowed
    'broccoli': (80, 150),
    'spinach': (40, 100),
    'kale': (40, 100),
    'carrot': (60, 120),
    'tomato': (80, 150),
    'onion': (30, 80),
    'potato': (120, 200),
    'sweet potato': (120, 200),
    'bell pepper': (50, 100),
    'pepper': (50, 100),
    'cucumber': (80, 150),
    'zucchini': (80, 150),
    'cauliflower': (80, 150),
    'cabbage': (80, 150),
    'lettuce': (40, 100),
    'mushrooms': (80, 150),
    'asparagus': (80, 150),
    'green beans': (80, 150),
    'peas': (60, 120),
    'celery': (80, 150),
    'radish': (40, 80),
    'beets': (80, 120),
    'turnip': (80, 120),
    'parsnip': (80, 120),
    'leek': (60, 120),
    'artichoke': (80, 150),
    'brussels sprouts': (80, 150),
    'eggplant': (80, 150),
    'okra': (80, 150),
    'squash': (80, 150),
    'pumpkin': (80, 150),
    'garlic': (3, 10),
    'ginger': (3, 10),
    'herbs': (3, 15),
    'avocado': (60, 120),
    
    # Fruits - moderate portions
    'apple': (120, 200),
    'banana': (100, 150),
    'orange': (120, 200),
    'berries': (60, 120),
    'grapes': (80, 120),
    'strawberries': (80, 150),
    'blueberries': (60, 120),
    'raspberries': (60, 120),
    'blackberries': (60, 120),
    'pear': (120, 200),
    'peach': (120, 200),
    'plum': (80, 150),
    'apricot': (80, 150),
    'kiwi': (80, 120),
    'mango': (120, 200),
    'pineapple': (120, 200),
    'watermelon': (150, 250),
    'cantaloupe': (150, 250),
    'honeydew': (150, 250),
    'cherries': (80, 120),
    'grapefruit': (150, 250),
    'lemon': (30, 80),
    'lime': (20, 60),
    'coconut': (25, 60),
    'dates': (25, 50),
    'figs': (40, 80),
    'raisins': (25, 50),
    'cranberries': (25, 50),
    'pomegranate': (80, 120),
    'papaya': (120, 200),
    
    # Fats/Oils - small portions
    'oil': (3, 10),
    'olive oil': (3, 10),
    'coconut oil': (3, 10),
    'butter': (3, 15),
    'ghee': (3, 10),
    'avocado oil': (3, 10),
    'canola oil': (3, 10),
    'sunflower oil': (3, 10),
    'sesame oil': (3, 10),
    'vegetable oil': (3, 10),
    'margarine': (3, 15),
    'lard': (3, 10),
    'coconut butter': (8, 20),
    
    # Nuts/Seeds - small portions due to high calories
    'almonds': (10, 25),
    'peanuts': (10, 25),
    'cashews': (10, 25),
    'seeds': (8, 20),
    'sesame seeds': (8, 15),
    'walnuts': (10, 25),
    'pecans': (10, 25),
    'pistachios': (10, 25),
    'hazelnuts': (10, 25),
    'brazil nuts': (10, 25),
    'macadamia nuts': (10, 25),
    'pine nuts': (8, 20),
    'sunflower seeds': (10, 25),
    'pumpkin seeds': (10, 25),
    'flax seeds': (8, 20),
    'chia seeds': (8, 20),
    'hemp seeds': (10, 25),
    'poppy seeds': (8, 15),
    'peanut butter': (10, 25),
    'almond butter': (10, 25),
    'tahini': (10, 25),
    'nutella': (10, 25),
    
    # Dairy
    'milk': (150, 250),
    'yogurt': (80, 150),
    'cheese': (15, 40),
    'cream cheese': (10, 25),
    'sour cream': (10, 25),
    'heavy cream': (10, 25),
    'mozzarella': (15, 40),
    'cheddar': (15, 40),
    'parmesan': (8, 25),
    'feta': (15, 40),
    'goat cheese': (15, 40),
    'ricotta': (40, 80),
    'cream': (25, 50),
    'buttermilk': (150, 250),
    'kefir': (150, 250),
    'ice cream': (40, 100),
    
    # Condiments & Seasonings
    'salt': (1, 3),
    'pepper': (1, 2),
    'vinegar': (3, 10),
    'soy sauce': (3, 10),
    'hot sauce': (2, 8),
    'mustard': (3, 10),
    'ketchup': (8, 15),
    'mayonnaise': (8, 15),
    'honey': (8, 20),
    'maple syrup': (8, 20),
    'sugar': (3, 10),
    'brown sugar': (3, 10),
    'vanilla': (1, 3),
    'cinnamon': (1, 3),
    'paprika': (1, 3),
    'turmeric': (1, 3),
    'cumin': (1, 3),
    'oregano': (1, 3),
    'basil': (2, 8),
    'thyme': (1, 3),
    'rosemary': (1, 3),
    'parsley': (3, 10),
    'cilantro': (3, 10),
    'dill': (2, 8),
    'mint': (2, 8),
    'lemon juice': (3, 10),
    'lime juice': (3, 10),
    'balsamic vinegar': (3, 10),
    'worcestershire sauce': (2, 8),
    'fish sauce': (2, 8),
    'coconut milk': (40, 80),
    'tomato paste': (8, 20),
    'tomato sauce': (40, 80),
    'pesto': (8, 20),
    'salsa': (25, 50),
    'hummus': (25, 50),
    'guacamole': (25, 50),
}

def get_realistic_portions(ing_name, target_calories=400):
    """
    Get realistic portion sizes with calorie-based scaling
    """
    ing_lower = ing_name.lower()
    base_min, base_max = portion_guidelines.get('default', (50, 150))
    
    # Find specific ingredient guidelines
    for key, (min_g, max_g) in portion_guidelines.items():
        if key in ing_lower or ing_lower in key:
            base_min, base_max = min_g, max_g
            break
    
    # Scale portions based on target meal size
    if target_calories < 300:  # Small meal
        scale_factor = 0.8
    elif target_calories > 600:  # Large meal
        scale_factor = 1.2
    else:  # Normal meal
        scale_factor = 1.0
    
    return (int(base_min * scale_factor), int(base_max * scale_factor))

def extract_ingredients(row):
    """
    Extract ingredients from recipe that exist in nutrient database
    """
    instr = row.get('RecipeInstructions', '')
    ingredient_text = row.get('RecipeIngredientParts', '')
    
    # Combine instruction and ingredient text
    combined_text = ' '.join(instr if isinstance(instr, list) else [str(instr)]) + ' ' + str(ingredient_text)
    
    # Find ingredients that exist in our nutrient database
    found_ings = []
    for ingredient in nutrient['food'].str.lower():
        if re.search(rf'\b{re.escape(ingredient)}\b', combined_text.lower()):
            found_ings.append(ingredient)
    
    return list(set(found_ings))

def calculate_actual_nutrition(optimized_quantities):
    """
    Calculate actual nutrition from optimized ingredient quantities
    """
    total_nutrition = {'calories': 0, 'protein': 0, 'fat': 0, 'carbs': 0, 'fiber': 0}
    
    for ing, qty_str in optimized_quantities.items():
        # Extract grams from string like "150g broccoli"
        grams_match = re.search(r'(\d+)g', qty_str)
        if grams_match:
            grams = int(grams_match.group(1))
            ing_data = nutrient[nutrient['food'].str.lower() == ing.lower()]
            if not ing_data.empty:
                multiplier = grams / 100  # per 100g
                total_nutrition['calories'] += ing_data['calories'].values[0] * multiplier
                total_nutrition['protein'] += ing_data['protein'].values[0] * multiplier
                total_nutrition['fat'] += ing_data['fat'].values[0] * multiplier
                total_nutrition['carbs'] += ing_data['carbs'].values[0] * multiplier
                total_nutrition['fiber'] += ing_data['fiber'].values[0] * multiplier
    
    return total_nutrition

def optimize_ingredient_weights(ingredients, target_macros, recipe_name="", target_calories=400):
    """
    Optimizes ingredient quantities to match target calories/macros
    Uses realistic portion sizes and cooking ratios with accuracy constraints (95-105%)
    """
    if len(ingredients) == 0:
        return {}

    # Build nutrition matrix with realistic constraints
    valid_ingredients = []
    bounds = []
    base_portions = []
    
    for ing in ingredients:
        row = nutrient[nutrient['food'].str.lower() == ing.lower()]
        if not row.empty:
            valid_ingredients.append(ing)
            min_g, max_g = get_realistic_portions(ing, target_calories)
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
        weights = np.array([3.0, 2.0, 1.0, 1.0, 0.5])  # calories, protein, fat, carbs, fiber
        errors = np.abs(predicted - target) / (target + 1e-6)  # Relative error
        
        # Penalty for unrealistic total portion size
        total_weight = sum(portions) * 100  # Convert back to grams
        if total_weight > 600:  # Penalty if meal > 600g
            size_penalty = (total_weight - 600) / 100
        elif total_weight < 150:  # Penalty if meal < 150g
            size_penalty = (150 - total_weight) / 100
        else:
          size_penalty = 0
            
        return np.sum(weights * errors**2) + size_penalty

    try:
        # Define constraints for calorie accuracy (95-105%)
        def calorie_constraint(portions):
            total_cals = nutrition_matrix[:, 0] @ portions
            return total_cals
        
        # Bounds for calories (95-105% of target)
        calorie_lower = 0.95 * target_macros[0]
        calorie_upper = 1.05 * target_macros[0]
        
        constraints = [
            {'type': 'ineq', 'fun': lambda x: calorie_constraint(x) - calorie_lower},
            {'type': 'ineq', 'fun': lambda x: calorie_upper - calorie_constraint(x)}
        ]
        
        # Use realistic starting portions
        initial_portions = np.array(base_portions)
        
        # Optimize with realistic bounds and calorie constraints
        result = minimize(
            objective_function, 
            initial_portions, 
            bounds=bounds, 
            method='SLSQP',
            constraints=constraints,
            options={'maxiter': 1000}
        )
        
        if result.success:
            optimized_portions = result.x
        else:
            # Fallback with proportional scaling within bounds
            total_base_calories = sum(
                nutrition_matrix[i][0] * base_portions[i] 
                for i in range(len(valid_ingredients))
            )
            
            if total_base_calories > 0:
                # Scale to hit target calories within bounds
                target_scale = min(1.05, max(0.95, target_macros[0] / total_base_calories))
                optimized_portions = [p * target_scale for p in base_portions]
            else:
                optimized_portions = base_portions
        
        # Convert to readable format
        quantities = {}
        total_cals = 0
        
        for i, ing in enumerate(valid_ingredients):
            grams = round(optimized_portions[i] * 100)
            if grams >= 3:  # Only include meaningful amounts
                quantities[ing] = f"{grams}g {ing}"
                # Calculate calories for this ingredient
                ing_cals = nutrition_matrix[i][0] * optimized_portions[i]
                total_cals += ing_cals
        
        return quantities
        
    except Exception as e:
        print(f"❌ Optimization failed for {recipe_name}: {e}")
        # Simple fallback: reasonable portions
        fallback_quantities = {}
        for ing in valid_ingredients[:4]:  # Limit to 4 main ingredients
            min_g, max_g = get_realistic_portions(ing, target_calories)
            avg_g = (min_g + max_g) // 2
            fallback_quantities[ing] = f"{avg_g}g {ing}"
        return fallback_quantities

def inject_quantities_into_instructions(instructions, quantities):
    """
    Injects calculated quantities into recipe instructions
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
# Main Function with Accuracy Constraints
# -------------------------------------------
def suggest_diet(user_input: dict, recipe_df: pd.DataFrame, max_meals: int = 5, tolerance: float = 0.05):
    """
    Main function that suggests optimized diet plan with accuracy constraints (95-105%)
    """
    # Validate input
    validate_user_input(user_input)
    
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
        cal_target * 0.035      # fiber
    ]

    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(df[nutrient_cols])
    sim = cosine_similarity([scaler.transform([target_vec])[0]], scaled)[0]
    df['similarity'] = sim

    # ---------------- Meal Selection & Optimization ----------------
    diet, kcal_sum = [], 0
    
    for meal_index, (_, row) in enumerate(df.sort_values('similarity', ascending=False).iterrows()):
        if len(diet) >= max_meals:
            break
            
        # Calculate target calories for THIS meal with accuracy bounds
        meals_remaining = max_meals - meal_index
        calories_remaining = max(0, cal_target - kcal_sum)
        
        # Stop if we've hit our target (with tolerance)
        if calories_remaining <= cal_target * tolerance:
            break
            
        # Target calories for this specific meal (with 95-105% bounds)
        if meals_remaining > 0:
            target_calories_this_meal = min(
                max(200, calories_remaining / meals_remaining),
                800
            )
        else:
            target_calories_this_meal = min(
                max(200, calories_remaining),
                800
            )
        
        # Calculate proportional macros for this meal
        target_macros = [
            target_calories_this_meal,
            target_calories_this_meal * 0.25 / 4,  # protein (25% of calories)
            target_calories_this_meal * 0.25 / 9,  # fat (25% of calories) 
            target_calories_this_meal * 0.5 / 4,   # carbs (50% of calories)
            target_calories_this_meal * 0.035      # fiber (~35g per 1000 kcal)
        ]
        
        # Extract ingredients from recipe
        found_ings = extract_ingredients(row)
        
        # Optimize with accuracy constraints
        optimized_quantities = optimize_ingredient_weights(
            found_ings, target_macros, row['Name'], target_calories_this_meal
        )
        
        # Calculate actual nutrition from optimized ingredients
        actual_nutrition = calculate_actual_nutrition(optimized_quantities)
        
        # Only add meal if it's within our accuracy bounds (95-105%)
        calorie_ratio = actual_nutrition['calories'] / target_calories_this_meal if target_calories_this_meal > 0 else 1
        if 0.95 <= calorie_ratio <= 1.05 and len(optimized_quantities) > 0:
            # Inject quantities into instructions
            instructions_with_quantities = inject_quantities_into_instructions(
                row.get('RecipeInstructions', ''), optimized_quantities
            )
            
            diet.append({
                'Name': row['Name'],
                'Target Calories': round(target_calories_this_meal, 1),
                'Actual Calories': round(actual_nutrition['calories'], 1),
                'Calories (kcal)': round(actual_nutrition['calories'], 1),
                'Protein (g)': round(actual_nutrition['protein'], 1),
                'Fat (g)': round(actual_nutrition['fat'], 1),
                'Carbs (g)': round(actual_nutrition['carbs'], 1),
                'Fiber (g)': round(actual_nutrition['fiber'], 1),
                'Sugar (g)': round(row.get('SugarContent', 0), 1),
                'Sodium (mg)': round(row.get('SodiumContent', 0), 1),
                'Image': get_image_url(row.get('Images')),
                'Optimized Ingredients': list(optimized_quantities.values()),
                'Instructions': instructions_with_quantities,
                'Calorie Match %': round(calorie_ratio * 100, 1)
            })
            
            kcal_sum += actual_nutrition['calories']
            
            # Early exit if we're close to target
            if kcal_sum >= cal_target * (1 - tolerance):
                break

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
# if __name__ == "__main__":
   
    
#     user_input = {
#         'gender': 1,  # 1 for male, 0 for female
#         'age': 20,
#         'height_cm': 170,
#         'weight_kg': 50,
#         'goal': 'weight_gain',  # e.g. 'weight_loss', 'weight_gain', 'maintain'
#         'Type': 'non-vegetarian',
#         'meal_type': 'general',
#         'health_conditions': ['diabetes'],  # e.g. ['diabetes', 'hypertension'],
#         'activity_type': 'hitt'
#     }

#     print("🔄 Generating optimized diet plan...")
#     result = suggest_diet(user_input, recipe)

#     print("\n" + "="*60)
#     print("📊 DIET OPTIMIZATION RESULTS")
#     print("="*60)
#     print(f"🔥 BMR: {result['bmr']} kcal/day")
#     print(f"📈 BMI: {result['bmi']}")
#     print(f"⚡ TDEE: {result['tdee']} kcal/day")
#     print(f"🎯 Calorie Target: {result['calorie_target']} kcal/day")
    
#     print(f"✅ Actual Calories: {result['actual_calories']} kcal/day")
#     print(f"🎪 Accuracy: {result['calorie_accuracy']}%")
#     print(f"🍽️ Number of meals: {len(result['diet_plan'])}")

#     print("\n" + "="*60)
#     print("🍽️ OPTIMIZED MEAL PLAN")
#     print("="*60)

#     for i, meal in enumerate(result['diet_plan'], 1):
#         print(f"\n🥗 Meal {i}: {meal['Name']}")
#         print(f"   Calories: {meal['Calories (kcal)']}")
#         print(f"   🥩 Protein: {meal['Protein (g)']}g")
#         print(f"   🧈 Fat: {meal['Fat (g)']}g") 
#         print(f"   🍞 Carbs: {meal['Carbs (g)']}g")
#         print(f"   🌾 Fiber: {meal['Fiber (g)']}g")
#         print(f"   📝  Ingredients:")
#         for ingredient in meal['Optimized Ingredients']:
#             print(f"      • {ingredient}")
#         print(f"   👨‍🍳 Instructions:")
#         for line in meal['Instructions'].split('\n'):
            # print(f"      {line}")