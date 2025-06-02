

type Props = {
  Name: string;
  image: string;
  calories: number;
  fats: number;
  sugar: number;
  sodium: number;
  carbs: number;
  fiber: number;
  protein: number;
  Instructions: string;
  bmr: number;
  tdee: number;
  calorie_target: number;
  bmi: number;
};

const RecommendedDiet = ({
  Name,
  image,
  calories,
  fats,
  sugar,
  sodium,
  carbs,
  fiber,
  protein,
  Instructions,
  bmr,
  tdee,
  calorie_target,
  bmi,
}: Props) => {
  return (
    <div className="p-4 border rounded-md shadow-md my-4">
      <h2 className="text-xl font-bold mb-2">{Name}</h2>
      <img src={image} alt={Name} className="w-full h-48 object-cover mb-4 rounded" />
      <p><strong>Calories:</strong> {calories}</p>
      <p><strong>Fats:</strong> {fats}</p>
      <p><strong>Sugar:</strong> {sugar}</p>
      <p><strong>Sodium:</strong> {sodium}</p>
      <p><strong>Carbs:</strong> {carbs}</p>
      <p><strong>Fiber:</strong> {fiber}</p>
      <p><strong>Protein:</strong> {protein}</p>
      <p className="mt-2"><strong>Instructions:</strong> {Instructions}</p>
      <div className="mt-4 bg-gray-100 p-2 rounded">
        <p><strong>BMR:</strong> {bmr}</p>
        <p><strong>TDEE:</strong> {tdee}</p>
        <p><strong>Calorie Target:</strong> {calorie_target}</p>
        <p><strong>BMI:</strong> {bmi}</p>
      </div>
    </div>
  );
};

export default RecommendedDiet;
