import { HiUser, HiScale, HiCalendar, HiUserGroup } from "react-icons/hi";
import { GiBodyHeight } from "react-icons/gi";
import { TbTargetArrow } from "react-icons/tb";

const userProfileDetails = [
  {
    label: "Username",
    value: "Nabin Khanal",
    icon: <HiUser className="text-3xl text-blue-500 mb-2" />,
    color: "text-green-500",
    hoverColor: "hover:border-green-500 hover:text-green-500",
  },
  {
    label: "Weight",
    value: "70 kg",
    icon: <HiScale className="text-3xl text-purple-500 mb-2" />,
    color: "text-purple-500",
    hoverColor: "hover:border-purple-500 hover:text-purple-500",
  },
  {
    label: "Height",
    value: "150 cm",
    icon: <GiBodyHeight className="text-3xl text-orange-500 mb-2" />,
    color: "text-orange-500",
    hoverColor: "hover:border-orange-500 hover:text-orange-500",
  },
  {
    label: "Age",
    value: "25 years",
    icon: <HiCalendar className="text-3xl text-pink-500 mb-2" />,
    color: "text-pink-500",
    hoverColor: "hover:border-pink-500 hover:text-pink-500",
  },
  {
    label: "Gender",
    value: "Male",
    icon: <HiUserGroup className="text-3xl text-yellow-500 mb-2" />,
    color: "text-yellow-500",
    hoverColor: "hover:border-yellow-500 hover:text-yellow-500",
  },
  {
    label: "BMI",
    value: "24.5",
    icon: <HiScale className="text-3xl text-blue-500 mb-2" />,
    color: "text-blue-500",
    hoverColor: "hover:border-blue-500 hover:text-blue-500",
  },
  {
    label: "Activity ",
    value: "Cycling",
    icon: <HiUserGroup className="text-3xl text-green-500 mb-2" />,
    color: "text-green-500",
    hoverColor: "hover:border-green-500 hover:text-green-500",
  },
  {
    label: "Goal",
    value: "Weight Loss",
    icon: <TbTargetArrow className="text-3xl text-red-500 mb-2" />,
    color: "text-red-500",
    hoverColor: "hover:border-red-500 hover:text-red-500",
  },

  {
    label: "Target Calories",
    value: "2000 kcal",
    icon: <HiScale className="text-3xl text-indigo-500 mb-2" />,
    color: "text-indigo-500",
    hoverColor: "hover:border-indigo-500 hover:text-indigo-500",
  },
  {
    label: "TDEE",
    value: "2500 kcal",
    icon: <HiScale className="text-3xl text-gray-500 mb-2" />,
    color: "text-gray-500",
    hoverColor: "hover:border-gray-500 hover:text-gray-500",
  },
  {
    label: "BMR",
    value: "1800 kcal",
    icon: <HiScale className="text-3xl text-brown-500 mb-2" />,
    color: "text-brown-500",
    hoverColor: "hover:border-brown-500 hover:text-brown-500",
  },
  {
    label: "Preference",
    value: "Vegetarian",
    icon: <HiUserGroup className="text-3xl text-teal-500 mb-2" />,
    color: "text-teal-500",
    hoverColor: "hover:border-teal-500 hover:text-teal-500",
  },
  {
    label: "Health Condition",
    value: "Normal",
    icon: <HiUserGroup className="text-3xl text-teal-500 mb-2" />,
    color: "text-teal-500",
    hoverColor: "hover:border-teal-500 hover:text-teal-500",
  },
  {
    label: "Meal Frequency",
    value: 2,
    icon: <HiUserGroup className="text-3xl text-teal-500 mb-2" />,
    color: "text-teal-500",
    hoverColor: "hover:border-teal-500 hover:text-teal-500",
  }
];

const UserDetails: React.FC = () => {
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
