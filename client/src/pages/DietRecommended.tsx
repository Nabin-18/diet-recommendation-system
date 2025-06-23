/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import type { DashboardData } from "@/types";
import FormField from "@/components/FormField";
import FormSelect from "@/components/FormSelect";


//options for form
const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "others", label: "Others" },
];
const GOAL_OPTIONS = [
  { value: "weight_gain", label: "Weight Gain" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "maintain", label: "Maintain Weight" },
];
const DIET_PREFERENCE_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "non-vegetarian", label: "Non-Vegetarian" },
];
const HEALTH_ISSUES_OPTIONS = [
  { value: "normal", label: "Normal/Healthy" },
  { value: "diabetes", label: "Diabetes" },
  { value: "hypertension", label: "Hypertension" },
  { value: "asthama", label: "Asthma" },
];
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

// form input schema (strings from form inputs)
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

// processed schematransformations for api
const dietFormSchema = dietFormInputSchema.transform((data) => {
  const height = parseFloat(data.height);
  const weight = parseFloat(data.weight);
  const age = parseInt(data.age, 10);

  // validate ranges after transformation
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
      mealFrequency: 3,
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (dashboardData?.inputDetails) {
      const details = dashboardData.inputDetails;

      // only prefill if form hasn't been submitted yet
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
      const data = dietFormSchema.parse(inputData);

      const response = await axios.post(
        "http://localhost:5000/api/user/user-input",
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.data?.userId) {
        throw new Error("Server response incomplete - missing user ID");
      }

      const latestRes = await axios.get(
        "http://localhost:5000/api/latest-prediction",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { latestPrediction, latestUserInput } = latestRes.data;

      const dietPlanData = {
        userInput: latestUserInput,
        recommendations: {
          bmi: latestPrediction.bmi,
          bmr: latestPrediction.bmr,
          tdee: latestPrediction.tdee,
          calorie_target: latestPrediction.calorie_target,
          meals: Array.isArray(latestPrediction.meals)
            ? latestPrediction.meals
            : [],
        },
        metadata: {
          formSubmittedAt:
            latestPrediction.predictionDate || new Date().toISOString(),
        },
      };

      navigate("/main-page/diet-plan", {
        state: { dietPlanData },
        replace: false, // back navigation
      });

      // refresh dashboard data
      if (onRefresh) onRefresh();
    } catch (err: any) {
      if (err.name === "ZodError") {
        setError(err.errors?.[0]?.message || "Please check your input values");
      } else if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Server/network error. Please try again."
        );
      } else {
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
    setError(null);
    setHasSubmitted(false);
  };

  const isFormLoading = loading || isSubmitting || externalLoading;

  return (
    <>
      {/* external error display */}
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
              <FormField
                label="Height (cm)"
                error={errors.height?.message}
                inputProps={{
                  ...register("height"),
                  placeholder: "Height (cm) e.g. 170",
                  disabled: isFormLoading,
                }}
              />
              <FormField
                label="Weight (kg)"
                error={errors.weight?.message}
                inputProps={{
                  ...register("weight"),
                  placeholder: "Weight (kg) e.g. 65",
                  disabled: isFormLoading,
                }}
              />

              <FormField
                label="Age (years)"
                error={errors.age?.message}
                inputProps={{
                  ...register("age"),
                  placeholder: "Age (years) e.g. 25",
                  disabled: isFormLoading,
                }}
              />

              <div>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <FormSelect
                      label="Gender"
                      error={errors.gender?.message}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={GENDER_OPTIONS}
                      placeholder="Select Gender"
                      disabled={isFormLoading}
                    />
                  )}
                />
              </div>
            </div>

            <h2 className="font-bold text-xl text-gray-800 mt-4">
              Health & Fitness Preferences
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Controller
                  control={control}
                  name="goal"
                  render={({ field }) => (
                    <FormSelect
                      label="Fitness Goal"
                      error={errors.goal?.message}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={GOAL_OPTIONS}
                      placeholder="Fitness Goal"
                      disabled={isFormLoading}
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  control={control}
                  name="activityType"
                  render={({ field }) => (
                    <FormSelect
                      label="Primary Activity"
                      error={errors.activityType?.message}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={ACTIVITY_OPTIONS}
                      placeholder="Primary Activity"
                      disabled={isFormLoading}
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  control={control}
                  name="preferences"
                  render={({ field }) => (
                    <FormSelect
                      label="Diet Preference"
                      error={errors.preferences?.message}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={DIET_PREFERENCE_OPTIONS}
                      placeholder="Diet Preference"
                      disabled={isFormLoading}
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  control={control}
                  name="healthIssues"
                  render={({ field }) => (
                    <FormSelect
                      label="Health Condition"
                      error={errors.healthIssues?.message}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={HEALTH_ISSUES_OPTIONS}
                      placeholder="Health Condition"
                      disabled={isFormLoading}
                    />
                  )}
                />
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
