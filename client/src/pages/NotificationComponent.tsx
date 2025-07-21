import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Check,
  Activity,
  Clock,
  
  CheckCircle,
  Scale,
  Target,
  TrendingUp,
  TrendingDown,
  UserPlus,
  ChefHat,
  Sparkles,
  LogIn,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  sentAt: string;
  read: boolean;
  relatedId?: number;
  hasFeedback?: boolean;
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
};

const NotificationContent = ({
  notification,
  style,
  markAsRead,
}: {
  notification: Notification;
  style: any;
  markAsRead: (id: number) => void;
}) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4 flex-1">
        <div className={`p-3 rounded-xl ${style.bgColor} ${style.color} flex-shrink-0`}>
          {style.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold ${notification.read ? "text-slate-600" : "text-slate-800"}`}>
              {notification.title}
            </h3>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
            )}
            {notification.hasFeedback && notification.relatedId && (
              <ExternalLink className="w-4 h-4 text-blue-500" />
            )}
          </div>

          <p className={`text-sm mb-3 ${notification.read ? "text-slate-500" : "text-slate-600"}`}>
            {notification.message}
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(notification.sentAt)}</span>
          </div>
        </div>
      </div>

      {!notification.read && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            markAsRead(notification.id);
          }}
          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
          title="Mark as read"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const NotificationComponent = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "ACCOUNT_CREATED":
        return { icon: <UserPlus className="w-5 h-5" />, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" };
      case "DIET_PLAN_GENERATED":
        return { icon: <ChefHat className="w-5 h-5" />, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" };
      case "PROFILE_UPDATED":
        return { icon: <Sparkles className="w-5 h-5" />, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" };
      case "USER_LOGIN":
        return { icon: <LogIn className="w-5 h-5" />, color: "text-indigo-600", bgColor: "bg-indigo-50", borderColor: "border-indigo-200" };
      case "WEIGHT_ABOVE_EXPECTED":
        return { icon: <TrendingUp className="w-5 h-5" />, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" };
      case "WEIGHT_BELOW_EXPECTED":
        return { icon: <TrendingDown className="w-5 h-5" />, color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" };
      case "WEIGHT_AT_TARGET":
        return { icon: <Target className="w-5 h-5" />, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" };
      case "WEIGHT_UPDATE_REMINDER":
        return { icon: <Scale className="w-5 h-5" />, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" };
      case "WEIGHT_GOAL_SET":
        return { icon: <CheckCircle className="w-5 h-5" />, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" };
      case "FEEDBACK_REMINDER":
        return { icon: <MessageSquare className="w-5 h-5" />, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" };
      default:
        return { icon: <Activity className="w-5 h-5" />, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" };
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    for (const n of notifications.filter((n) => !n.read)) {
      await markAsRead(n.id);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
                <p className="text-slate-600">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                    : "All notifications are read"}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchNotifications}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Mark All Read
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No notifications</h3>
              <p className="text-slate-600">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const style = getNotificationStyle(notification.type);
              const wrapperClass = `block bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                notification.read ? "opacity-75" : `border-l-4 ${style.borderColor}`
              }`;

              const content = (
                <div className="p-6">
                  <NotificationContent
                    notification={notification}
                    style={style}
                    markAsRead={markAsRead}
                  />
                </div>
              );

              return notification.hasFeedback && notification.relatedId ? (
                <Link
                  to={`/main-page/feedback-form/${notification.relatedId}`}
                  key={notification.id}
                  className={`${wrapperClass} cursor-pointer hover:bg-slate-50`}
                >
                  {content}
                </Link>
              ) : (
                <div key={notification.id} className={wrapperClass}>
                  {content}
                </div>
              );
            })
          )}
        </div>

        {notifications.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Showing {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationComponent;
