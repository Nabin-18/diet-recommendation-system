import { Outlet, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Bell,
  User,
  // MessageCircle,
  Utensils,
  NotebookPen,
  Activity,
  // Settings,
} from "lucide-react";
import { useState } from "react";

const MainPage = () => {
  const [notifications] = useState({
    userInput: 0,
    profile: 0,
    virtualDoctor: 0,
  });

  const notificationCount = 7; // Total notifications for notification page

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
      to: "dashboard",
      label: "Profile",
      icon: <User className="w-5 h-5" />,
      gradient: "from-blue-500 to-indigo-600",
      notifications: notifications.profile,
      description: "Health metrics",
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
    // {
    //   to: "chat-bot",
    //   label: "Chat Bot",
    //   icon: <MessageCircle className="w-5 h-5" />,
    //   gradient: "from-violet-500 to-purple-600",
    //   notifications: notifications.virtualDoctor,
    //   description: "AI consultation",
    // },
  ];

  // const totalNotifications = notificationCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Navigation */}
      <div className="sm:flex lg:hidden bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="flex justify-around items-center p-4">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className="relative">
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
        </div>
      </div>

      {/* Mobile Content */}
      <div className="block lg:hidden p-4">
        <Outlet />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r shadow-lg relative">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Health Dashboard
                </h1>
                <p className="text-sm text-slate-600">Manage your wellness</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="p-6 space-y-4 pb-20 flex flex-col gap-1">
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

          {/* Settings */}
          {/* <div className="absolute bottom-6 left-6 right-6">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 bg-slate-50 hover:bg-slate-100 border-slate-200">
              <Settings className="w-5 h-5 text-slate-600" />
              <span className="font-medium text-slate-700">Settings</span>
            </Button>
          </div> */}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-50">
          <div className="h-full p-6">
            <div className="bg-white rounded-xl shadow-sm border h-full p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
