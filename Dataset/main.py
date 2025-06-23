from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import pandas as pd

from recommend import suggest_diet


# Load recipe data
recipe = pd.read_csv("cleaned_recipes.csv")

# Clean and cluster recipes

nutrient_cols = ['Calories', 'FatContent', 'CarbohydrateContent', 'ProteinContent', 'FiberContent']


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

@app.post("/recommend")
def get_diet_plan(user_input: UserInput):
    plan = suggest_diet(user_input.dict(), recipe)
    if not plan or not plan.get("diet_plan"):
        return {"message": "No suitable diet plan found."}
    return plan
