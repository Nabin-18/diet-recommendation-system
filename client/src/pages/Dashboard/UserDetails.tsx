/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HiUser, HiScale, HiCalendar, HiUserGroup,
} from "react-icons/hi";
import { GiBodyHeight } from "react-icons/gi";
import { TbTargetArrow } from "react-icons/tb";

interface Props {
  userData: {
    user: { name: string; email: string };
    inputDetails: any;
    prediction: any;
  };
}

const UserDetails: React.FC<Props> = ({ userData }) => {
  const { user, inputDetails, prediction } = userData;

  const userProfileDetails = [
    {
      label: "Username",
      value: user.name,
      icon: <HiUser className="text-3xl text-blue-500 mb-2" />,
      color: "text-green-500",
      hoverColor: "hover:border-green-500 hover:text-green-500",
    },
    {
      label: "Weight",
      value: `${inputDetails.weight} kg`,
      icon: <HiScale className="text-3xl text-purple-500 mb-2" />,
      color: "text-purple-500",
      hoverColor: "hover:border-purple-500 hover:text-purple-500",
    },
    {
      label: "Height",
      value: `${inputDetails.height} cm`,
      icon: <GiBodyHeight className="text-3xl text-orange-500 mb-2" />,
      color: "text-orange-500",
      hoverColor: "hover:border-orange-500 hover:text-orange-500",
    },
    {
      label: "Age",
      value: `${inputDetails.age} years`,
      icon: <HiCalendar className="text-3xl text-pink-500 mb-2" />,
      color: "text-pink-500",
      hoverColor: "hover:border-pink-500 hover:text-pink-500",
    },
    {
      label: "Gender",
      value: inputDetails.gender,
      icon: <HiUserGroup className="text-3xl text-yellow-500 mb-2" />,
      color: "text-yellow-500",
      hoverColor: "hover:border-yellow-500 hover:text-yellow-500",
    },
    {
      label: "BMI",
      value: prediction.bmi,
      icon: <HiScale className="text-3xl text-blue-500 mb-2" />,
      color: "text-blue-500",
      hoverColor: "hover:border-blue-500 hover:text-blue-500",
    },
    {
      label: "Activity",
      value: inputDetails.activityType,
      icon: <HiUserGroup className="text-3xl text-green-500 mb-2" />,
      color: "text-green-500",
      hoverColor: "hover:border-green-500 hover:text-green-500",
    },
    {
      label: "Goal",
      value: inputDetails.goal,
      icon: <TbTargetArrow className="text-3xl text-red-500 mb-2" />,
      color: "text-red-500",
      hoverColor: "hover:border-red-500 hover:text-red-500",
    },
    {
      label: "Target Calories",
      value: `${prediction.calorie_target} kcal`,
      icon: <HiScale className="text-3xl text-indigo-500 mb-2" />,
      color: "text-indigo-500",
      hoverColor: "hover:border-indigo-500 hover:text-indigo-500",
    },
    {
      label: "TDEE",
      value: `${prediction.tdee} kcal`,
      icon: <HiScale className="text-3xl text-gray-500 mb-2" />,
      color: "text-gray-500",
      hoverColor: "hover:border-gray-500 hover:text-gray-500",
    },
    {
      label: "BMR",
      value: `${prediction.bmr} kcal`,
      icon: <HiScale className="text-3xl text-amber-500 mb-2" />,
      color: "text-amber-500",
      hoverColor: "hover:border-amber-500 hover:text-amber-500",
    },
    {
      label: "Preference",
      value: inputDetails.preferences,
      icon: <HiUserGroup className="text-3xl text-teal-500 mb-2" />,
      color: "text-teal-500",
      hoverColor: "hover:border-teal-500 hover:text-teal-500",
    },
    {
      label: "Meal Frequency",
      value: inputDetails.mealFrequency,
      icon: <HiUserGroup className="text-3xl text-teal-500 mb-2" />,
      color: "text-teal-500",
      hoverColor: "hover:border-teal-500 hover:text-teal-500",
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-center font-semibold text-2xl mb-4">
        User Profile Details:
      </h1>
      <div className="flex flex-wrap justify-center gap-4">
        {userProfileDetails.map((detail, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-center bg-white shadow-2xl w-[200px] h-[140px] rounded-2xl p-4 border-2 border-transparent transition duration-300 ease-in-out cursor-pointer ${detail.hoverColor}`}
          >
            {detail.icon}
            <p className="font-semibold">{detail.label}</p>
            <p className={`font-bold text-2xl ${detail.color}`}>
              {detail.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDetails;
