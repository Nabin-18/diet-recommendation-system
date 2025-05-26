from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from sklearn.cluster import KMeans
import pandas as pd
import re

# --- Activity multipliers ---
activity_multipliers = {
    'walking': 1.2,
    'yoga': 1.3,
    'dancing': 1.45,
    'weight training': 1.55,
    'cycling': 1.6,
    'basketball': 1.7,
    'swimming': 1.75,
    'tennis': 1.75,
    'running': 1.8,
    'hiit': 1.9
}

# --- Utility Functions ---
def get_activity_multiplier(activity_type):
    return activity_multipliers.get(activity_type.lower(), 1.2)

def calculate_bmr(weight, height, age, gender):
    return 10 * weight + 6.25 * height - 5 * age + (5 if gender == 1 else -161)

def calorie_target(bmr, goal):
    if goal == 'weight_loss':
        return bmr - 500
    elif goal == 'weight_gain':
        return bmr + 500
    return bmr

def calculate_bmi(weight_kg, height_cm):
    height_m = height_cm / 100
    return round(weight_kg / (height_m ** 2), 2)

def bmi_category(bmi):
    if bmi < 18.5:
        return "Underweight"
    elif 18.5 <= bmi < 24.9:
        return "Normal"
    elif 25 <= bmi < 29.9:
        return "Overweight"
    return "Obese"

def format_instructions(instructions):
    if isinstance(instructions, list):
        return "\n".join(f"{i+1}. {step.strip().capitalize()}" for i, step in enumerate(instructions) if step.strip())
    elif isinstance(instructions, str) and instructions.strip():
        steps = re.split(r'(?<=[.!?])\s+|(?<=;)\s+', instructions)
        formatted = ""
        for i, step in enumerate(steps, 1):
            step = step.strip().capitalize()
            if len(step) > 3:
                formatted += f"{i}. {step}\n"
        return formatted.strip()
    return "No instructions available."

def clean_image_field(val):
    if pd.isna(val) or "character(0)" in str(val).lower():
        return None
    try:
        if isinstance(val, str) and (val.startswith("c(") or val.startswith("[") or val.startswith("(")):
            urls = re.findall(r'https?://\S+', val)
            return urls if urls else None
        elif isinstance(val, list):
            return val
        elif isinstance(val, str) and val.startswith("http"):
            return [val]
    except:
        return None
    return None

def get_image_url(images):
    base_url = "https://img.sndimg.com"
    placeholder = "Image not found"

    if isinstance(images, list) and len(images) > 0:
        image = images[0]
    elif isinstance(images, str):
        image = images
    else:
        return placeholder

    if image.startswith("/upload"):
        return f"{base_url}{image}"
    elif image.startswith("http"):
        return image
    return placeholder

def cluster_recipes(df, nutrient_cols, n_clusters=3):
    df = df.dropna(subset=nutrient_cols).copy()
    for col in nutrient_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    df = df.dropna(subset=nutrient_cols)

    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(df[nutrient_cols])

    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    df['cluster'] = kmeans.fit_predict(scaled_data)

    return df, kmeans

# --- Main Recommendation Logic ---
def suggest_diet(user_input, recipe):
    nutrient_cols = ['Calories', 'FatContent', 'CarbohydrateContent', 'ProteinContent', 'FiberContent']

    # Filter by Type (veg/non-veg)
    filtered = recipe[recipe['Type'].str.lower() == user_input['Type'].lower()]

    # Filter by meal type
    filtered = filtered[filtered['MealType'].str.lower() == user_input['meal_type'].lower()]

    # Filter by health conditions
    for condition in user_input['health_conditions']:
        cond = condition.lower()
        if cond == 'diabetes':
            filtered = filtered[filtered['SugarContent'] <= 10]
        elif cond == 'hypertension':
            filtered = filtered[filtered['SodiumContent'] <= 400]
        elif cond == 'asthma':
            filtered = filtered[~filtered['RecipeInstructions'].str.contains('dairy', na=False, case=False)]

    if filtered.empty:
        return {
            "bmr": None,
            "bmi": None,
            "calorie_target": None,
            "diet_plan": []
        }

    bmr = calculate_bmr(user_input['weight_kg'], user_input['height_cm'], user_input['age'], user_input['gender'])
    tdee = bmr * get_activity_multiplier(user_input['activity_type'])

    goal_key = user_input['goal'].lower()
    if goal_key == 'wt_loss': goal_key = 'weight_loss'
    elif goal_key == 'wt_gain': goal_key = 'weight_gain'
    elif goal_key == 'maintain': goal_key = 'maintain'

    cal_target = calorie_target(tdee, goal_key)
    bmi = calculate_bmi(user_input['weight_kg'], user_input['height_cm'])

    filtered = filtered.dropna(subset=nutrient_cols)
    for col in nutrient_cols:
        filtered[col] = pd.to_numeric(filtered[col], errors='coerce')
    filtered = filtered.dropna(subset=nutrient_cols)

    if filtered.empty:
        return {
            "bmr": round(bmr, 2),
            "bmi": bmi,
            "calorie_target": round(cal_target, 2),
            "diet_plan": []
        }

    goal_to_cluster = {
        'weight_loss': [0],
        'weight_gain': [1],
        'maintain': [2]
    }
    target_clusters = goal_to_cluster.get(goal_key, [0])
    if 'cluster' in filtered.columns:
        filtered = filtered[filtered['cluster'].isin(target_clusters)]
        if filtered.empty:
            return {
                "bmr": round(bmr, 2),
                "bmi": bmi,
                "calorie_target": round(cal_target, 2),
                "diet_plan": []
            }

    target_vector = [
        cal_target,
        cal_target * 0.25 / 9,
        cal_target * 0.50 / 4,
        cal_target * 0.25 / 4,
        10  # fiber
    ]

    scaler = MinMaxScaler()
    scaled_nutrients = scaler.fit_transform(filtered[nutrient_cols])
    target_scaled = scaler.transform([target_vector])[0]

    similarity_scores = cosine_similarity([target_scaled], scaled_nutrients).flatten()

    top_n = min(user_input['meal_frequency'], len(filtered))
    top_indices = similarity_scores.argsort()[-top_n:][::-1]
    top_recipes = filtered.iloc[top_indices].copy()

    data_min = scaler.data_min_
    data_max = scaler.data_max_
    top_recipes[nutrient_cols] = scaled_nutrients[top_indices] * (data_max - data_min) + data_min

    diet_plan = []
    for _, row in top_recipes.iterrows():
        diet_plan.append({
            'Name': row['Name'],
            'Calories (kcal)': round(row['Calories'], 2),
            'Fat (g)': round(row['FatContent'], 2),
            'Carbs (g)': round(row['CarbohydrateContent'], 2),
            'Protein (g)': round(row['ProteinContent'], 2),
            'Fiber (g)': round(row['FiberContent'], 2),
            'Sugar (g)': round(row.get('SugarContent', 0), 2),
            'Sodium (mg)': round(row.get('SodiumContent', 0), 2),
            'Image': get_image_url(row.get('Images', None)),
            'Instructions': format_instructions(row.get('RecipeInstructions', 'No instructions'))
        })

    return {
        "bmr": round(bmr, 2),
        "bmi": bmi,
        "calorie_target": round(cal_target, 2),
        "diet_plan": diet_plan
    }
