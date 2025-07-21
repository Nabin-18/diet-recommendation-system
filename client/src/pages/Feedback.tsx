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
  const { register, handleSubmit } = useForm<FeedbackFormData>();

  const [submitted, setSubmitted] = useState(false);
  const [expectedWeight, setExpectedWeight] = useState<number | null>(null); 

  // ✅ Fetch expected weight when component mounts
  useEffect(() => {
  const fetchExpectedWeight = async () => {
    try {
      const token = localStorage.getItem("token");
       const res = await axios.get("/api/latest-prediction", {
          headers: { Authorization: `Bearer ${token}` },
        });

      // Log response to debug:
      console.log("Latest prediction response:", res.data);

      setExpectedWeight(res.data.latestPrediction.expectedWeight);
    } catch (err) {
      console.error("Failed to fetch expected weight", err);
    }
  };

  fetchExpectedWeight();
}, []); 


  const onSubmit = async (data: FeedbackFormData) => {
    try {
      const token = localStorage.getItem("token");
      const achieved =
        expectedWeight !== null && data.weightChange === expectedWeight;

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
          },
        }
      );

      setSubmitted(true);
    } catch (err) {
      console.error("Feedback submission failed", err);
      alert("Failed to submit feedback, please try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Progress Report</h2>

      {!submitted ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p>
            Expected Weight:{" "}
            {expectedWeight !== null ? (
              <span className="font-bold">{expectedWeight} kg</span>
            ) : (
              <span className="text-gray-500">Loading...</span>
            )}
          </p>

          <div>
            <label className="block mb-1 font-medium">
              Your current weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              {...register("weightChange", { required: true })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Additional Notes</label>
            <textarea
              {...register("note")}
              className="w-full p-2 border rounded"
              rows={4}
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </form>
      ) : (
        <div className="mt-6 text-center">
          <p className="text-lg font-medium mb-4">
            Thank you for your feedback! <br /> Do you want to regenerate a new
            diet plan?
          </p>
          <button
            onClick={() => navigate("/main-page/diet-plan")}
            className="bg-green-600 text-white px-4 py-2 rounded mt-2"
          >
            Yes
          </button>
          <button
            onClick={() => navigate("/main-page")}
            className="bg-gray-600 text-white px-4 py-2 rounded mt-2 ml-2"
          >
            No
          </button>
        </div>
      )}
    </div>
  );
};

export default Feedback;
