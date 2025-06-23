/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
// import RecommendedDiet from "./RecommendedDiet";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import type { DashboardData } from "@/types";
// import { Label } from "recharts";

// Form input schema (strings from form inputs)
const dietFormInputSchema = z.object({
  height: z
    .string()
    .min(1, "Height is required")
    .regex(/^\d+(\.\d+)?$/, "Height must be a valid number"),
  weight: z
    .string()
    .min(1, "Weight is required")
    .regex(/^\d+(\.\d+)?$/, "Weight must be a valid number"),
  age: z
    .string()
    .min(1, "Age is required")
    .regex(/^\d+$/, "Age must be a whole number"),
  gender: z.enum(["male", "female", "others"], {
    required_error: "Please select your gender",
  }),
  goal: z.enum(["weight_gain", "weight_loss", "maintain"], {
    required_error: "Please select your fitness goal",
  }),
  activityType: z.enum(
    [
      "walking",
      "swimming",
      "tennis",
      "basketball",
      "cycling",
      "yoga",
      "hiit",
      "weight training",
      "running",
      "dancing",
    ],
    {
      required_error: "Please select your activity type",
    }
  ),
  preferences: z.enum(["vegetarian", "non-vegetarian"], {
    required_error: "Please select your dietary preference",
  }),
  healthIssues: z.enum(["asthama", "hypertension", "diabetes", "normal"], {
    required_error: "Please select your health condition",
  }),
  mealPlan: z.enum(["general", "breakfast", "lunch", "dinner"], {
    required_error: "Please select meal type",
  }),
  mealFrequency: z
    .number()
    .int()
    .min(1, "Meal frequency must be between 1 and 4")
    .max(4, "Meal frequency must be between 1 and 4"),
});

// Processed schema with transformations for API
const dietFormSchema = dietFormInputSchema.transform((data) => {
  const height = parseFloat(data.height);
  const weight = parseFloat(data.weight);
  const age = parseInt(data.age, 10);

  // Validate ranges after transformation
  if (height < 50 || height > 300) {
    throw new Error("Height must be between 50-300 cm");
  }
  if (weight < 10 || weight > 500) {
    throw new Error("Weight must be between 10-500 kg");
  }
  if (age < 10 || age > 120) {
    throw new Error("Age must be between 10-120 years");
  }

  return {
    ...data,
    height,
    weight,
    age,
  };
});

export type DietFormInputData = z.infer<typeof dietFormInputSchema>;
export type DietFormData = z.infer<typeof dietFormSchema>;

interface Props {
  dashboardData: DashboardData | null;
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

interface Recommendation {
  fats: number;
  protein: number;
  Instructions: string;
  bmr: number;
  tdee: number;
  calorie_target: number;
  bmi: number;
  Name: string;
  image: string;
  calories: number;
  fat: number;
  sugar: number;
  sodium: number;
  fiber: number;
  carbs: number;
  instruction: string;
}

// Data structure to pass to DietPlan component
export interface DietPlanData {
  userInput: DietFormData;
  recommendations: {
    meals: Recommendation[];
  };
  userId: string;
  metadata: {
    timestamp: string;
    formSubmittedAt: string;
  };
}

// Activity options for better maintainability
const ACTIVITY_OPTIONS = [
  { value: "walking", label: "Walking" },
  { value: "cycling", label: "Cycling" },
  { value: "hiit", label: "HIIT" },
  { value: "yoga", label: "Yoga" },
  { value: "dancing", label: "Dancing" },
  { value: "basketball", label: "Basketball" },
  { value: "swimming", label: "Swimming" },
  { value: "tennis", label: "Tennis" },
  { value: "running", label: "Running" },
  { value: "weight training", label: "Weight Training" },
];

const DietRecommended: React.FC<Props> = ({
  dashboardData,
  loading: externalLoading,
  error: externalError,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DietFormInputData>({
    resolver: zodResolver(dietFormInputSchema),
    defaultValues: {
      mealFrequency: 3, // Set default meal frequency
    },
  });

  // const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Prefill form fields from dashboardData when available
  useEffect(() => {
    if (dashboardData?.inputDetails) {
      const details = dashboardData.inputDetails;

      // Only prefill if form hasn't been submitted yet
      if (!hasSubmitted) {
        setValue("height", details.height?.toString() || "");
        setValue("weight", details.weight?.toString() || "");
        setValue("age", details.age?.toString() || "");
        const allowedGenders = ["male", "female", "others"] as const;
        if (
          allowedGenders.includes(
            details.gender as (typeof allowedGenders)[number]
          )
        ) {
          setValue("gender", details.gender as (typeof allowedGenders)[number]);
        } else {
          setValue("gender", "male");
        }
        // Ensure goal is one of the allowed values
        const allowedGoals = [
          "weight_gain",
          "weight_loss",
          "maintain",
        ] as const;
        if (
          allowedGoals.includes(details.goal as (typeof allowedGoals)[number])
        ) {
          setValue("goal", details.goal as (typeof allowedGoals)[number]);
        } else {
          setValue("goal", "maintain");
        }
        // Only set if value is one of the allowed activity types
        const allowedActivities = [
          "walking",
          "swimming",
          "tennis",
          "basketball",
          "cycling",
          "yoga",
          "hiit",
          "weight training",
          "running",
          "dancing",
        ] as const;
        if (
          allowedActivities.includes(
            details.activity as (typeof allowedActivities)[number]
          )
        ) {
          setValue(
            "activityType",
            details.activity as (typeof allowedActivities)[number]
          );
        } else {
          setValue("activityType", "walking");
        }
        setValue(
          "preferences",
          details.preference === "vegetarian" ||
            details.preference === "non-vegetarian"
            ? details.preference
            : "vegetarian"
        );
        setValue("mealFrequency", details.mealFrequency || 3);
        // Set defaults for fields not in dashboard data
        setValue("healthIssues", "normal");
        setValue("mealPlan", "general");
      }
    }
  }, [dashboardData, setValue, hasSubmitted]);

  const onSubmit = async (inputData: DietFormInputData) => {
    setError(null);
    setLoading(true);
    setHasSubmitted(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required. Please login again.");
      setLoading(false);
      return;
    }

    try {
      // transform and validate the data
      const data = dietFormSchema.parse(inputData);

      // send user input to backend
      const response = await axios.post(
        "http://localhost:5000/api/user/user-input",
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Better response validation
      console.log("User input response:", response.data); // Debug logging

      if (!response.data) {
        throw new Error("No data received from server");
      }

      if (!response.data.userId) {
        console.error("Server response missing userId:", response.data);
        throw new Error("Server response incomplete - missing user ID");
      }

      const userId = response.data.userId;

      // Fetch diet recommendations
      const recommendationsResponse = await axios.get(
        `http://localhost:5000/api/prediction/${userId}?mealFrequency=${data.mealFrequency}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Recommendations response:", recommendationsResponse.data);

      if (!recommendationsResponse.data) {
        throw new Error("No recommendations data received from server");
      }

      if (!recommendationsResponse.data.predictions) {
        console.error(
          "Server response missing predictions:",
          recommendationsResponse.data
        );
        throw new Error("No recommendations available - please try again");
      }

      // setRecommendations([recommendationsResponse.data.predictions]);

      // Prepare data for DietPlan component

      const recommendationsArray = recommendationsResponse.data.predictions;

      const allMeals = Array.isArray(recommendationsArray)
        ? recommendationsArray
        : [recommendationsArray];
      // Only keep the latest meals according to mealFrequency
      const mealFrequency = data.mealFrequency;
      const latestMeals = allMeals.slice(-mealFrequency); // get last N meals

      const dietPlanData: DietPlanData = {
        userInput: data,
        recommendations: {
          meals: latestMeals, // Only pass the latest meals
        },
        userId: userId,
        metadata: {
          timestamp: new Date().toISOString(),
          formSubmittedAt: new Date().toLocaleString(),
        },
      };
      console.log("DietPlanData according to freq:", dietPlanData);

      // Navigate to DietPlan component with data
      navigate("/main-page/diet-plan", {
        state: { dietPlanData },
        replace: false, // Allow back navigation
      });

      console.log("DietplanData Sending:", dietPlanData);

      // Refresh dashboard data if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      console.error("Error getting recommendations:", err);

      // Handle Zod validation errors
      if (err.name === "ZodError") {
        setError(err.errors?.[0]?.message || "Please check your input values");
        setLoading(false);
        return;
      }

      // Handle network/axios errors
      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const serverMessage =
          err.response.data?.message || err.response.data?.error;

        if (status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("token");
        } else if (status === 429) {
          setError("Too many requests. Please try again later.");
        } else if (status === 404) {
          setError("Service not found. Please contact support.");
        } else if (status >= 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(serverMessage || `Request failed with status ${status}`);
        }
      } else if (err.request) {
        // Network error - no response received
        setError("Network error. Please check your connection and try again.");
      } else {
        // Other errors (including our custom validation errors)
        setError(
          err.message || "An unexpected error occurred. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };
  const handleReset = () => {
    reset();
    // setRecommendations([]);
    setError(null);
    setHasSubmitted(false);
  };

  const isFormLoading = loading || isSubmitting || externalLoading;

  return (
    <>
      {/* External error display */}
      {externalError && (
        <div className="m-auto mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-center">{externalError}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-2 mx-auto block text-red-600 underline hover:text-red-800">
              Try Again
            </button>
          )}
        </div>
      )}

      <div className="m-auto flex flex-col items-center shadow-2xl rounded-2xl bg-white">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full p-8">
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <h1 className="font-bold p-4 text-2xl">
                Get Your Personalized Diet Plan
              </h1>
              <p className="text-gray-600 mb-4">
                Fill in your details to receive customized nutrition
                recommendations
              </p>
            </div>

            <h2 className="font-bold text-xl text-gray-800">
              Personal Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="height"
                  className="block text-sm font-semibold text-gray-800 mb-1">
                  Height (cm)
                </label>
                <Input
                  {...register("height")}
                  placeholder="Height (cm) e.g. 170"
                  className="rounded-[8px] focus-visible:ring-0 shadow-none placeholder:text-gray-400"
                  disabled={isFormLoading}
                />
                {errors.height && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.height.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="weight"
                  className="block text-sm font-bold text-gray-800 mb-1">
                  Weight (kg)
                </label>
                <Input
                  {...register("weight")}
                  placeholder="Weight (kg) e.g. 65"
                  className="rounded-[8px] focus-visible:ring-0 shadow-none placeholder:text-gray-400"
                  disabled={isFormLoading}
                />
                {errors.weight && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.weight.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-semibold text-gray-800 mb-1">
                  Age (years)
                </label>
                <Input
                  {...register("age")}
                  placeholder="Age (years) e.g. 25"
                  className="rounded-[8px] focus-visible:ring-0 shadow-none placeholder:text-gray-400"
                  disabled={isFormLoading}
                />
                {errors.age && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.age.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-semibold text-gray-800 mb-1">
                  Gender
                </label>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                      disabled={isFormLoading}>
                      <SelectTrigger className="rounded-[8px] focus-visible:ring-0 shadow-none">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.gender.message}
                  </p>
                )}
              </div>
            </div>

            <h2 className="font-bold text-xl text-gray-800 mt-4">
              Health & Fitness Preferences
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="goal"
                  className="block text-sm font-semibold text-gray-800 mb-1">
                  Fitness Goal
                </label>
                <Controller
                  control={control}
                  name="goal"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                      disabled={isFormLoading}>
                      <SelectTrigger className="rounded-[8px]">
                        <SelectValue placeholder="Fitness Goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight_gain">Weight Gain</SelectItem>
                        <SelectItem value="weight_loss">Weight Loss</SelectItem>
                        <SelectItem value="maintain">
                          Maintain Weight
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.goal && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.goal.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="activityType"
                  className="block text-sm font-semibold text-gray-800 mb-1">
                  Primary Activity
                </label>
                <Controller
                  control={control}
                  name="activityType"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                      disabled={isFormLoading}>
                      <SelectTrigger className="rounded-[8px]">
                        <SelectValue placeholder="Primary Activity" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTIVITY_OPTIONS.map((activity) => (
                          <SelectItem
                            key={activity.value}
                            value={activity.value}>
                            {activity.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.activityType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.activityType.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="preferences"
                  className="block text-sm font-semibold text-gray-800 mb-1">
                  Diet Preference
                </label>

                <Controller
                  control={control}
                  name="preferences"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                      disabled={isFormLoading}>
                      <SelectTrigger className="rounded-[8px]">
                        <SelectValue placeholder="Diet Preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="non-vegetarian">
                          Non-Vegetarian
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.preferences && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.preferences.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="healthIssues"
                  className="block text-sm font-semibold text-gray-800 mb-1">
                  Health Condition
                </label>
                <Controller
                  control={control}
                  name="healthIssues"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                      disabled={isFormLoading}>
                      <SelectTrigger className="rounded-[8px]">
                        <SelectValue placeholder="Health Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal/Healthy</SelectItem>
                        <SelectItem value="diabetes">Diabetes</SelectItem>
                        <SelectItem value="hypertension">
                          Hypertension
                        </SelectItem>
                        <SelectItem value="asthama">Asthma</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.healthIssues && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.healthIssues.message}
                  </p>
                )}
              </div>
            </div>

            <h2 className="font-bold text-xl text-gray-800 mt-4">
              Meal Planning
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Controller
                  control={control}
                  name="mealPlan"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                      disabled={isFormLoading}>
                      <SelectTrigger className="rounded-[8px]">
                        <SelectValue placeholder="Meal Type Focus" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">
                          General (All Meals)
                        </SelectItem>
                        <SelectItem value="breakfast">
                          Breakfast Focus
                        </SelectItem>
                        <SelectItem value="lunch">Lunch Focus</SelectItem>
                        <SelectItem value="dinner">Dinner Focus</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.mealPlan && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.mealPlan.message}
                  </p>
                )}
              </div>

              <div>
                <Controller
                  control={control}
                  name="mealFrequency"
                  render={({ field }) => (
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value?.toString() || ""}
                      disabled={isFormLoading}>
                      <SelectTrigger className="rounded-[8px]">
                        <SelectValue placeholder="Meals Per Day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Meal</SelectItem>
                        <SelectItem value="2">2 Meals</SelectItem>
                        <SelectItem value="3">3 Meals</SelectItem>
                        <SelectItem value="4">4 Meals</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.mealFrequency && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.mealFrequency.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4 justify-center mt-6">
              <Button
                type="submit"
                className="px-8 py-2 rounded-[8px] font-semibold"
                disabled={isFormLoading}>
                {isFormLoading ? "Generating..." : "Get My Diet Plan"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="px-8 py-2 rounded-[8px] font-semibold"
                disabled={isFormLoading}>
                Reset Form
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-center font-medium">{error}</p>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Recommendations Section */}
      {/* <div className="m-auto items-center shadow-2xl rounded-2xl flex flex-col gap-6 mt-6 p-8 bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Your Personalized Diet Recommendations
          </h2>
          {recommendations.length > 0 && (
            <p className="text-gray-600">
              Based on your profile, here are your customized nutrition
              recommendations
            </p>
          )}
        </div>

        <div className="w-full">
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {recommendations.map((item, index) => (
                <RecommendedDiet
                  key={index}
                  Name={item.name}
                  image={item.image}
                  calories={item.calories}
                  fats={item.fats}
                  sugar={item.sugar}
                  sodium={item.sodium}
                  carbs={item.carbs}
                  fiber={item.fiber}
                  protein={item.protein}
                  Instructions={item.Instructions}
                  bmr={item.bmr}
                  tdee={item.tdee}
                  calorie_target={item.calorie_target}
                  bmi={item.bmi}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">
                {hasSubmitted
                  ? "Processing your recommendations..."
                  : "Complete the form above to get your personalized diet recommendations"}
              </p>
            </div>
          )}
        </div>
      </div> */}

      {isFormLoading && (
        <div className="m-auto mt-6 p-8 bg-white shadow-2xl rounded-2xl">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">
              Generating your personalized diet plan...
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default DietRecommended;
