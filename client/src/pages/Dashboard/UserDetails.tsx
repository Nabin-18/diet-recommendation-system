/* eslint-disable @typescript-eslint/no-explicit-any */
import { HiScale, HiCalendar, HiUserGroup } from "react-icons/hi";
import { GiBodyHeight } from "react-icons/gi";
import { TbTargetArrow } from "react-icons/tb";
import { FaFire, FaHeart, FaUtensils } from "react-icons/fa";

interface Props {
  userData: {
    user: { name: string; email: string; image?: string };
    inputDetails: any;
    prediction: any;
  };
}

const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

const UserDetails: React.FC<Props> = ({ userData }) => {
  const { user, inputDetails, prediction } = userData;

  // Show warning if inputDetails or prediction is missing
  if (!inputDetails || !prediction) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-700 font-medium mb-2">
          ⚠️ Profile Incomplete
        </div>
        <p className="text-yellow-600">
          Please enter your personal details to view your dashboard information.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Profile Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-center space-x-4">
          <img
            src={
              user.image?.startsWith("/uploads")
                ? `${baseUrl}${user.image}`
                : user.image?.startsWith("http")
                ? user.image
                : "/default-user.png"
            }
            alt="User profile"
            className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Basic Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <HiScale className="text-2xl text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Weight</p>
              <p className="font-semibold text-gray-800">{inputDetails.weight} kg</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <GiBodyHeight className="text-2xl text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">Height</p>
              <p className="font-semibold text-gray-800">{inputDetails.height} cm</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <HiCalendar className="text-2xl text-pink-500" />
            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p className="font-semibold text-gray-800">{inputDetails.age} years</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <HiUserGroup className="text-2xl text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-semibold text-gray-800">{inputDetails.gender}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <HiScale className="text-2xl text-blue-600" />
            </div>
            <p className="text-sm text-gray-500">BMI</p>
            <p className="text-2xl font-bold text-blue-600">{prediction.bmi}</p>
          </div>

          <div className="text-center">
            <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <FaFire className="text-2xl text-red-600" />
            </div>
            <p className="text-sm text-gray-500">TDEE</p>
            <p className="text-2xl font-bold text-red-600">{prediction.tdee}</p>
            <p className="text-xs text-gray-400">kcal/day</p>
          </div>

          <div className="text-center">
            <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <FaHeart className="text-2xl text-green-600" />
            </div>
            <p className="text-sm text-gray-500">BMR</p>
            <p className="text-2xl font-bold text-green-600">{prediction.bmr}</p>
            <p className="text-xs text-gray-400">kcal/day</p>
          </div>
        </div>
      </div>

      {/* Goals & Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Goals & Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <TbTargetArrow className="text-xl text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Goal</p>
                <p className="font-medium text-gray-800">{inputDetails.goal}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <HiUserGroup className="text-xl text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Activity Level</p>
                <p className="font-medium text-gray-800">{inputDetails.activityType}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaFire className="text-xl text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Target Calories</p>
                <p className="font-medium text-gray-800">{prediction.calorie_target} kcal</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FaUtensils className="text-xl text-teal-500" />
              <div>
                <p className="text-sm text-gray-500">Diet Preference</p>
                <p className="font-medium text-gray-800">{inputDetails.preferences}</p>
              </div>
            </div>
            {/* <div className="flex items-center space-x-3">
              <HiCalendar className="text-xl text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Meal Frequency</p>
                <p className="font-medium text-gray-800">{inputDetails.mealFrequency}</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;