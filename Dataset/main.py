from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import os
from recommend import suggest_diet

# === Safe dataset loading ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "cleaned_recipes.csv")

try:
    recipe = pd.read_csv(DATA_PATH)
    print(f"✅ Loaded dataset with {len(recipe)} recipes")
except Exception as e:
    print(f"❌ Error loading dataset: {e}")
    recipe = pd.DataFrame()

app = FastAPI(title="AI Diet Recommendation API")

class UserInput(BaseModel):
    gender: int
    age: int
    height_cm: float
    weight_kg: float
    goal: str
    Type: str
    meal_type: str
    health_conditions: List[str]
    activity_type: str
    exclude_recipe_names: Optional[List[str]] = []

@app.post("/recommend")
def get_diet_plan(user_input: UserInput):
    input_data = user_input.dict()
    exclude_list = input_data.pop("exclude_recipe_names", [])
    try:
        plan = suggest_diet(input_data, recipe, exclude_recipe_names=exclude_list)
        if not plan or not plan.get("diet_plan"):
            return {"diet_plan": {"meals": []}, "message": "No suitable diet plan found."}
        if isinstance(plan["diet_plan"], list):
            plan["diet_plan"] = {"meals": plan["diet_plan"]}
        if "meals" not in plan["diet_plan"] or not isinstance(plan["diet_plan"]["meals"], list):
            plan["diet_plan"]["meals"] = []
        return plan
    except Exception as e:
        return {"diet_plan": {"meals": []}, "message": f"Error: {str(e)}"}

@app.get("/")
def home():
    return {"message": "AI Diet Recommendation API is running 🚀"}
