import { Outlet, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Bell,
  User,
  // MessageCircle,
  Utensils,
  NotebookPen,
  Activity,
  LogOut,
  // Settings,
} from "lucide-react";
import { useState, useEffect } from "react";

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  sentAt: string;
  createdAt?: string;
  updatedAt?: string;
}

const MainPage = () => {
  const [notifications] = useState({
    userInput: 0,
    profile: 0,
    virtualDoctor: 0,
  });

  const [notificationCount, setNotificationCount] = useState(0);

  const fetchUnreadNotificationCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const notifications: Notification[] = await response.json();
        const unreadCount = notifications.filter((n: Notification) => !n.read).length;
        setNotificationCount(unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  // Fetch notification count on component mount
  useEffect(() => {
    fetchUnreadNotificationCount();

    // Optional: Set up interval to refresh count every 30 seconds
    const interval = setInterval(fetchUnreadNotificationCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      to: "diet-recommend",
      label: "User Input",
      icon: <Utensils className="w-5 h-5" />,
      gradient: "from-emerald-500 to-teal-600",
      notifications: notifications.userInput,
      description: "Personalized nutrition",
    },
    {
      to: "diet-plan",
      label: "Diet Plan",
      icon: <NotebookPen className="w-5 h-5" />,
      gradient: "from-blue-500 to-indigo-600",
      notifications: notifications.profile,
      description: "Your personalized diet plan",
    },

    {
      to: "notification",
      label: "Notification",
      icon: <Bell className="w-5 h-5" />,
      gradient: "from-orange-500 to-red-600",
      notifications: notificationCount,
      description: "View all notifications",
    },
    {
      to: "profile",
      label: "Profile",
      icon: <User className="w-5 h-5" />,
      gradient: "from-blue-500 to-indigo-600",
      notifications: notifications.profile,
      description: "Health metrics",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* mobile Navigation */}
      <div className="flex lg:hidden bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between sm:justify-around items-center p-4 px-6 sm:px-4 w-full">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className="relative flex-shrink-0">
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${item.gradient} text-white shadow-md hover:shadow-lg transition-shadow duration-200`}>
                {item.icon}
                {item.notifications > 0 && item.to === "notification" && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {item.notifications > 9 ? "9+" : item.notifications}
                  </div>
                )}
              </div>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="relative flex-shrink-0 p-3 rounded-xl bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-md hover:shadow-lg transition-shadow duration-200">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* mobile Content */}
      <div className="block lg:hidden p-4">
        <Outlet />
      </div>

      {/* desktop Layout */}
      <div className="hidden lg:flex h-screen">
        {/* sidebar */}
        <div className="w-80 bg-white border-r shadow-lg flex flex-col">
          {/* Header */}
          {/* when click on header naviage to main-page */}
          <Link to={"/main-page"}>
            <div className="p-6 border-b bg-gradient-to-r from-slate-50 to-blue-50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    Diet Dashboard
                  </h1>
                  <p className="text-sm text-slate-600">Manage your wellness</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex-1 p-6 space-y-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                <Button className="w-full h-auto p-0 bg-transparent hover:bg-transparent border-0 shadow-none">
                  <div className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-4 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-r ${item.gradient} text-white`}>
                          {item.icon}
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-slate-800">
                            {item.label}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {item.notifications > 0 && item.to === "notification" && (
                        <div className="bg-red-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                          {item.notifications > 9 ? "9+" : item.notifications}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              </Link>
            ))}
          </div>

          {/* log out */}
          <div className="p-6 flex-shrink-0">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start gap-3 h-14 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border-2 border-slate-200 hover:border-slate-300 rounded-2xl transition-all duration-300 hover:shadow-lg group">
              <LogOut className="w-5 h-5 text-slate-600 group-hover:text-slate-700 transition-colors" />
              <span className="font-bold text-slate-700 group-hover:text-slate-800 transition-colors">
                Logout
              </span>
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50 overflow-hidden">
          <div className="h-full p-6 overflow-auto">
            <div className="bg-white rounded-xl shadow-sm border min-h-full p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
