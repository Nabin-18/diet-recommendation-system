import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";

type FeedbackFormData = {
  weightChange: number;
  note?: string;
};

const Feedback = () => {
  const { inputDetailId } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FeedbackFormData>();

  const [submitted, setSubmitted] = useState(false);
  const [expectedWeight, setExpectedWeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpectedWeight = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/latest-prediction", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setExpectedWeight(res.data.latestPrediction.expectedWeight);
      } catch (err) {
        console.error("Failed to fetch expected weight", err);
        setError("Failed to load expected weight data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpectedWeight();
  }, []);

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      // Calculate if goal was achieved (with 0.5kg tolerance)
      const achieved = expectedWeight !== null && 
                      Math.abs(data.weightChange - expectedWeight) <= 0.5;

      await axios.post(
        "http://localhost:5000/api/feedback",
        {
          ...data,
          achieved,
          inputDetailId: Number(inputDetailId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSubmitted(true);
    } catch (err) {
      console.error("Feedback submission failed", err);
      setError("Failed to submit feedback, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateDiet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      const res = await axios.post(
        "http://localhost:5000/api/feedback",
        {
          inputDetailId: Number(inputDetailId),
          weightChange: expectedWeight || 0,
          achieved: true,
          note: "Regenerate requested",
          regenerate: true,
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.data?.newDiet) {
        throw new Error("No diet data received");
      }

      navigate("/main-page/diet-plan", { 
        state: { 
          dietPlanData: res.data.newDiet,
          message: "New diet plan generated successfully" 
        } 
      });
    } catch (error) {
      console.error("Failed to regenerate diet", error);
      setError("Something went wrong while generating a new plan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToMain = () => {
    navigate("/main-page");
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Progress Report</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {!submitted ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-blue-50 p-3 rounded">
            <p>
              Expected Weight:{" "}
              {expectedWeight !== null ? (
                <span className="font-bold">{expectedWeight} kg</span>
              ) : (
                <span className="text-gray-500">Loading...</span>
              )}
            </p>
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Your current weight (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              {...register("weightChange", { 
                required: "Current weight is required",
                min: { value: 30, message: "Minimum weight is 30kg" },
                max: { value: 300, message: "Maximum weight is 300kg" }
              })}
              className={`w-full p-2 border rounded ${errors.weightChange ? "border-red-500" : "border-gray-300"}`}
              disabled={isLoading}
            />
            {errors.weightChange && (
              <p className="mt-1 text-sm text-red-600">{errors.weightChange.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Additional Notes</label>
            <textarea
              {...register("note")}
              className="w-full p-2 border border-gray-300 rounded"
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleReturnToMain}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-400"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 text-center">
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <p className="text-lg font-medium text-green-800">
              Thank you for your feedback!
            </p>
            <p className="mt-2">
              Do you want to regenerate a new diet plan?
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRegenerateDiet}
              className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-green-400"
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Yes"}
            </button>
            <button
              onClick={handleReturnToMain}
              className="bg-gray-600 text-white px-4 py-2 rounded"
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;