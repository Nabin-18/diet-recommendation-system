interface RecommendedDietProps {
  name: string;
  image: string;
  calories: number;
  fat: number;
  sugar: number;
  sodium: number;
  fiber: number;
  carbs: number;
  instruction: string;
}

const RecommendedDiet = ({
  name,
  image,
  calories,
  fat,
  sugar,
  sodium,
  fiber,
  carbs,
  instruction,
}: RecommendedDietProps) => {
  return (
    <div >
      <div className="w-fit items-center border gap-4 flex flex-col rounded-2xl shadow-2xl">
        <h1 className="text-center font-semibold p-4">Name: {name}</h1>
        <img
          src={image}
          alt="image not found"
          className="w-[400px] h-[400px] rounded-2xl"
        />
        <div className="flex flex-wrap justify-between gap-4 p-4">
          <p>Calories:{calories}</p>
          <p>Carbs:{carbs}</p>
          <p>Sugar:{sugar}</p>
          <p>Fat:{fat}</p>
          <p>Sodium{sodium}</p>
          <p>Fiber:{fiber}</p>
        </div>
        <p className="">
          <span className="font-bold text-red-500">Instruction:</span>
          {instruction}
        </p>
      </div>
    </div>
  );
};

export default RecommendedDiet;
