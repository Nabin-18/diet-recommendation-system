/* eslint-disable @typescript-eslint/no-explicit-any */
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

// Define props type
interface Props {
  nutrients: {
    protein: number;
    carbs: number;
    fats: number;
    sugar: number;
    sodium: number;
    fiber: number;
    calories: number;
  };
}

// Units mapping
const unitsMap: Record<string, string> = {
  protein: "g",
  carbs: "g",
  fats: "g",
  sugar: "g",
  fiber: "g",
  sodium: "mg",
  calories: "kcal",
};

const NutritionDetails: React.FC<Props> = ({ nutrients }) => {
  // Format data for charts with units
  const chartData = Object.entries(nutrients).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    unit: unitsMap[key] || "",
    key,
  }));

  return (
    <div className="p-6 w-full max-w-5xl mx-auto">
      {/* Pie Chart */}
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
          <PieChart width={600} height={300}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value, unit }) =>
                `${name}: ${value}${unit || ""}`
              }
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                const unit = unitsMap[props.payload.key] || "";
                return [`${value}${unit}`, name];
              }}
            />
            <Legend />
          </PieChart>
        </div>
      </motion.div>

      {/* Bar Chart */}
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
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                const unit = unitsMap[props.payload.key] || "";
                return [`${value}${unit}`, name];
              }}
            />
            <Legend />
            <Bar dataKey="value">
              {chartData.map((entry, index) => (
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
