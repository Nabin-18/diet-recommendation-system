import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

interface FeedbackFormData {
  weightChange: number;
  achieved: string;
  note?: string;
}

const Feedback = () => {
  const { inputDetailId } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<FeedbackFormData>();

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/feedback",
        { ...data, inputDetailId:Number(inputDetailId) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Thank you for your feedback!");
      navigate("/main-page"); // Redirect after successful submission
    } catch (err) {
      console.error("Feedback submission failed", err);
      alert("Failed to submit feedback, please try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Feedback Form</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Weight Change (kg)</label>
          <input
            type="number"
            step="0.1"
            {...register("weightChange", { required: true })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Did you achieve your goal?</label>
          <select {...register("achieved", { required: true })} className="w-full p-2 border rounded">
            <option value="">Select</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Additional Notes</label>
          <textarea
            {...register("note")}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default Feedback;
