from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd

from recommend import suggest_diet

# Load recipe data once
recipe = pd.read_csv("cleaned_recipes.csv")

app = FastAPI()

class UserInput(BaseModel):
    gender: int  # 0 female, 1 male
    age: int
    height_cm: float
    weight_kg: float
    goal: str
    Type: str  # vegetarian/non-vegetarian etc.
    meal_type: str
    health_conditions: List[str]
    activity_type: str
    exclude_recipe_names: Optional[List[str]] = []  # optional to exclude recipes

@app.post("/recommend")
def get_diet_plan(user_input: UserInput):
    input_data = user_input.dict()
    exclude_list = input_data.pop("exclude_recipe_names", [])
    try:
        plan = suggest_diet(input_data, recipe, exclude_recipe_names=exclude_list)
        # Always return a consistent structure
        # If plan is None or doesn't have 'diet_plan', return empty meals
        if not plan or not plan.get("diet_plan"):
            return {"diet_plan": {"meals": []}, "message": "No suitable diet plan found."}
        # If plan['diet_plan'] is a list (old style), wrap it
        if isinstance(plan["diet_plan"], list):
            plan["diet_plan"] = {"meals": plan["diet_plan"]}
        # If meals is missing or not a list, set to []
        if "meals" not in plan["diet_plan"] or not isinstance(plan["diet_plan"]["meals"], list):
            plan["diet_plan"]["meals"] = []
        return plan
    except Exception as e:
        return {"diet_plan": {"meals": []}, "message": f"Error: {str(e)}"}
