import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import MainPage from "@/pages/MainPage";
import UserInput from "@/pages/UserInput";
import History from "@/pages/History";
import DietPlan from "@/pages/DietPlan";
import axios from "axios";
import type { DashboardData } from "@/types";
import NotificationComponent from "@/pages/NotificationComponent";
import WelcomePage from "@/pages/WelcomePage";
import Profile from "@/pages/Profile";
import Feedback from "@/pages/Feedback";
import NewDiet from "@/pages/NewDiet";

const AppRoutes = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");

      // Only fetch if we're on a protected route and have a token
      const protectedRoutes = ["/main-page"];
      const isProtectedRoute = protectedRoutes.some((route) =>
        location.pathname.startsWith(route)
      );

      if (!token || !isProtectedRoute) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await axios.get("http://localhost:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // console.log("Fetch Dashboard", JSON.stringify(res.data));
        setData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to fetch dashboard data");

        // If token is invalid, clear it
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("token");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [location.pathname]); // Re-fetch when route changes

  // Optional: Add a method to refresh data
  const refreshDashboard = () => {
    const token = localStorage.getItem("token");
    if (token) {
      // Trigger re-fetch by updating a dependency or call fetchDashboard directly
      setLoading(true);
      // You could extract fetchDashboard to a separate function and call it here
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/auth/login" element={<Login />} />

      {/* Protected routes under main-page */}
      <Route path="/main-page" element={<MainPage />}>
        <Route index element={<WelcomePage error={error ?? undefined} />} />
        <Route
          path="diet-recommend"
          element={
            <UserInput
              dashboardData={data}
              loading={loading}
              error={error}
              onRefresh={refreshDashboard}
            />
          }
        />
        <Route
          path="profile"
          element={
            <Profile
              profileData={data}
              loading={loading}
              error={error}
              onRefresh={refreshDashboard}
            />
          }
        />
        <Route path="notification" element={<NotificationComponent />} />
        <Route path="history" element={<History />} />
        {/* Add the DietPlan route */}
        <Route path="diet-plan" element={<DietPlan />} />
        <Route path="new-diet-plan" element={<NewDiet />} />

        <Route path="feedback-form/:inputDetailId" element={<Feedback />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
