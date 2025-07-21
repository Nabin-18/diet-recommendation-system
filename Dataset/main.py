from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd

from recommend import suggest_diet

# Load recipe data
recipe = pd.read_csv("cleaned_recipes.csv")

app = FastAPI()

class UserInput(BaseModel):
    gender: int  # 0 for female, 1 for male
    age: int
    height_cm: float
    weight_kg: float
    goal: str
    Type: str
    meal_type: str
    health_conditions: List[str]
    activity_type: str
    
    exclude_recipe_names: Optional[List[str]] = []  # Optional list to exclude recipes

@app.post("/recommend")
def get_diet_plan(user_input: UserInput):
    input_data = user_input.dict()
    exclude_list = input_data.pop("exclude_recipe_names", [])
    
    plan = suggest_diet(input_data, recipe, exclude_recipe_names=exclude_list)
    
    if not plan or not plan.get("diet_plan"):
        return {"message": "No suitable diet plan found."}
    return plan
