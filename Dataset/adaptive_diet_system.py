user_input = {
    'gender': 1,  # 1 = Male, 0 = Female
    'age': 30,
    'height_cm': 175,
    'weight_kg': 60,
    'goal': 'maintain',  # maintain | weight_gain | weight_loss
    'Type': 'vegetarian',
    'meal_type': 'dinner',
    'health_conditions': ['hypertension'],
    'activity_type': 'cycling',
}
def calculate_bmr(gender, weight, height, age):
    return 10 * weight + 6.25 * height - 5 * age + (5 if gender == 1 else -161)

def get_activity_multiplier(activity):
    multipliers = {
        'sedentary': 1.2,
        'walking': 1.3,
        'yoga': 1.3,
        'dancing': 1.45,
        'weight training': 1.55,
        'cycling': 1.6,
        'athlete': 1.75
    }
    return multipliers.get(activity.lower(), 1.2)

def adjust_calorie_target(prev_target, result):
    adjustment = 200  # kcal adjustment
    if result == "under":
        return prev_target + adjustment
    elif result == "over":
        return max(prev_target - adjustment, 1200)  # prevent extreme drop
    return prev_target

def mock_generate_meal_plan(calorie_target, meal_type="dinner", diet_type="vegetarian"):
    # This is just a placeholder. Replace with real recipe filtering later.
    return {
        "meals": [
            {
                "name": "Spinach Tofu Stir Fry",
                "calories": round(calorie_target / 3, 1),
                "protein": "25g",
                "carbs": "40g",
                "fat": "15g",
                "ingredients": ["100g tofu", "60g spinach", "olive oil", "garlic"],
                "instructions": "Stir fry tofu and spinach with garlic and olive oil."
            },
            {
                "name": "Quinoa Veg Bowl",
                "calories": round(calorie_target / 3, 1),
                "protein": "20g",
                "carbs": "50g",
                "fat": "10g",
                "ingredients": ["100g quinoa", "vegetables", "lemon dressing"],
                "instructions": "Cook quinoa, mix with veggies and dressing."
            },
            {
                "name": "Chickpea Salad",
                "calories": round(calorie_target / 3, 1),
                "protein": "18g",
                "carbs": "30g",
                "fat": "12g",
                "ingredients": ["100g chickpeas", "lettuce", "cucumber", "olive oil"],
                "instructions": "Mix everything in a bowl. Serve fresh."
            }
        ]
    }
# Calculate
bmr = calculate_bmr(user_input['gender'], user_input['weight_kg'], user_input['height_cm'], user_input['age'])
tdee = bmr * get_activity_multiplier(user_input['activity_type'])

# Set calorie target
goal = user_input['goal']
if goal == 'weight_loss':
    calorie_target = tdee - 500
elif goal == 'weight_gain':
    calorie_target = tdee + 500
else:
    calorie_target = tdee

# Generate Day 1 Meal Plan
day_1_plan = mock_generate_meal_plan(calorie_target, user_input['meal_type'], user_input['Type'])

# Display results
print("==================================================")
print("📊 DIET OPTIMIZATION RESULTS (DAY 1)")
print("==================================================")
print(f"BMR: {bmr:.2f} kcal/day")
print(f"TDEE: {tdee:.2f} kcal/day")
print(f"Calorie Target: {calorie_target:.2f} kcal/day")
for i, meal in enumerate(day_1_plan['meals'], 1):
    print(f"\nMeal {i}: {meal['name']}")
    print(f"  Calories: {meal['calories']}")
    print(f"  Protein: {meal['protein']}, Carbs: {meal['carbs']}, Fat: {meal['fat']}")
    print(f"  Ingredients: {', '.join(meal['ingredients'])}")
    print(f"  Instructions: {meal['instructions']}")
# Assume user feedback after Day 1
actual_calories = float(input(f"\nHow many calories did you consume today? Target was {calorie_target:.2f} kcal: "))

# Define margin for 'achieved' status
margin = 100
if actual_calories < calorie_target - margin:
    user_feedback = "under"
elif actual_calories > calorie_target + margin:
    user_feedback = "over"
else:
    user_feedback = "achieved"


# Adjust target based on feedback
updated_calorie_target = adjust_calorie_target(calorie_target, user_feedback)

# Send notification
if user_feedback == "under":
    print("\n📢 You consumed fewer calories than your target. We'll add more calories to tomorrow's plan.")
elif user_feedback == "over":
    print("\n📢 You exceeded your calorie target. We'll reduce calories to stay on track.")
else:
    print("\n✅ Great! You hit your target. Let's keep going!")

# Generate Day 2 Plan
day_2_plan = mock_generate_meal_plan(updated_calorie_target)

print("\n==================================================")
print("📊 DIET OPTIMIZATION RESULTS (DAY 2 - Adaptive)")
print("==================================================")
print(f"Adjusted Calorie Target: {updated_calorie_target:.2f} kcal/day")
for i, meal in enumerate(day_2_plan['meals'], 1):
    print(f"\nMeal {i}: {meal['name']}")
    print(f"  Calories: {meal['calories']}")
    print(f"  Protein: {meal['protein']}, Carbs: {meal['carbs']}, Fat: {meal['fat']}")
    print(f"  Ingredients: {', '.join(meal['ingredients'])}")
    print(f"  Instructions: {meal['instructions']}")
