/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import UserDetails from "./Dashboard/UserDetails";
import NutritionDetails from "./Dashboard/NutritionDetails";
// import Instructions from "./Dashboard/Instructions";
import axios from "axios";

interface DashboardData {
  user: {
    name: string;
    email: string;  
  };
  inputDetails: {
    age: number;
    gender: string;
    weight: number;
    height: number;
    activity: string;
    bmi: number;
    goal: string;
    preference: string;
    mealFrequency: number;
  };
  prediction: {
    carbs: number;
    fats: number;
    sugar: number;
    sodium: number;
    fiber: number;
    calories: number;
    protein: number;
    bmr: number;
    tdee: number;
    targetCalories: number;
    nutrients: Record<string, number>;
    recommendedDiet: string;
  };
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token not found in localStorage");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched Dashboard:", JSON.stringify(res.data, null, 2));
        setData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data found.</p>;

  return (
    <div>
      <UserDetails userData={data} />
      <hr />
     <NutritionDetails
  nutrients={{
    protein: data.prediction.protein,
    carbs: data.prediction.carbs,
    fats: data.prediction.fats,
    sugar: data.prediction.sugar,
    // sodium: data.prediction.sodium,
    fiber: data.prediction.fiber,
    // calories: data.prediction.calories,
  }}
/>


      <hr />
      {/* <Instructions recommendedRecipe={data.prediction.recommendedDiet} /> */}
    </div>
  );
};

export default Dashboard;
