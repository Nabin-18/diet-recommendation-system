interface Props {
  recommendedRecipe: string;
}

const Instructions: React.FC<Props> = ({ recommendedRecipe }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Instructions</h1>
      <p className="mb-2">
        Name of Recipe: <span className="font-semibold">{recommendedRecipe}</span>
      </p>
      <ul className="list-disc pl-5 mb-4">
        <li>Use the navigation menu to access different sections of the dashboard.</li>
        <li>The "Nutrition Details" section provides a breakdown of your nutrient intake.</li>
        <li>You can view your daily, weekly, and monthly nutrition summaries in the "Summary" section.</li>
        <li>The "Settings" section allows you to customize your profile and preferences.</li>
      </ul>
      <p className="mb-2">
        If you have any questions or need assistance, please refer to the help section or contact support.
      </p>
    </div>
  );
};

export default Instructions;
