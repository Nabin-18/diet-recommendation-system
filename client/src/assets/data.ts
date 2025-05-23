interface FoodData {
  name: string;
  calories: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  instruction: string;
  image: string;
}

const dataFromModel: FoodData[] = [
  {
    name: "Chicken Curry",
    calories: 100,
    carbs: 23,
    fat: 10,
    fiber: 34,
    sugar: 0.2,
    sodium: 2.3,
    instruction: "Hello world",
    image: "hee"

  },
  {
    name: "Chicken Curry",
    calories: 100,
    carbs: 23,
    fat: 10,
    fiber: 34,
    sugar: 0.2,
    sodium: 2.3,
    instruction: "Hello world",
    image: "https://www.allrecipes.com/thmb/FL-xnyAllLyHcKdkjUZkotVlHR8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/46822-indian-chicken-curry-ii-DDMFS-4x3-39160aaa95674ee395b9d4609e3b0988.jpg"

  },
  {
    name: "Chicken Curry",
    calories: 100,
    carbs: 23,
    fat: 10,
    fiber: 34,
    sugar: 0.2,
    sodium: 2.3,
    instruction: "Hello world",
    image: "hee"

  },
]
export default dataFromModel