import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

// Chart Colors
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
];


const sampleNutrientData = [
  { name: "Carbs", value: 150 },
  { name: "Protein", value: 90 },
  { name: "Fat", value: 60 },
  { name: "Fiber", value: 30 },
  { name: "Sugar", value: 50 },
  { name: "Sodium", value: 20 },
  { name: "Cholesterol", value: 10 },
];

const NutritionDetails: React.FC = () => {
  return (
    <div className="p-6 w-full max-w-5xl mx-auto">
      {/* Pie Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-2xl shadow mb-8"
      >
        <h2 className="text-lg font-semibold mb-4 text-center">
          Nutrient Breakdown (Pie Chart)
        </h2>
        <div className="flex justify-center">
          <PieChart width={350} height={350}>
            <Pie
              data={sampleNutrientData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {sampleNutrientData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </motion.div>

      {/* Bar Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-2xl shadow"
      >
        <h2 className="text-lg font-semibold mb-4 text-center">
          Nutrient Breakdown (Bar Chart)
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={sampleNutrientData}
            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" activeBar={false}>
              {sampleNutrientData.map((entry, index) => (
                <Cell
                  key={`bar-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default NutritionDetails;
