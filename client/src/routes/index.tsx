import { Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import MainPage from "@/pages/MainPage";
import DietRecommended from "@/pages/DietRecommended";
import Dashboard from "@/pages/Dashboard";
import ChatBot from "@/pages/chatbot/ChatBot";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/auth/login" element={<Login />} />

      {/* using outlet to render DietRecommended and Dashboard , we need parent route,main page */}
      <Route path="/main-page" element={<MainPage />}>
        <Route
          index
          element={
            <h1 className="text-center font-bold text-2xl mt-4 ">
              Welcome to{" "}
              <span className="text-red-500">Diet Recommendation System</span>
            </h1>
          }
        />
        <Route path="diet-recommend" element={<DietRecommended />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="chat-bot" element={<ChatBot />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
