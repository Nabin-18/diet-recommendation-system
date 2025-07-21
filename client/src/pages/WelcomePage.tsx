import CravingImg from "@/assets/crave.jpg"; // adjust path as needed

interface WelcomePageProps {
  error?: string;
}

export default function WelcomePage({ error }: WelcomePageProps) {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
      {" "}
     
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to{" "}
          <span className="text-red-500">Diet Recommendation System</span>
        </h1>

        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

        <div className="mt-6">
          <img
            src={CravingImg}
            alt="Craving"
            className="w-full max-w-md mx-auto rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
