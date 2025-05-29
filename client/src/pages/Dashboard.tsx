import UserDetails from "./Dashboard/UserDetails";
import NutritionDetails from "./Dashboard/NutritionDetails";
import Instructions from "./Dashboard/Instructions";

const Dashboard = () => {
  return (
    <div>
      <UserDetails />
      <hr />
      <NutritionDetails />
      <hr />
      <Instructions />
    </div>
  );
};

export default Dashboard;
