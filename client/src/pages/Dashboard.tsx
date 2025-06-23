import React from "react";
import UserDetails from "./Dashboard/UserDetails";
import type { DashboardData } from "@/types";

interface Props {
  dashboardData: DashboardData | null;
  loading: boolean;
  onRefresh: () => void;
  error?: string | null;
}

const Dashboard: React.FC<Props> = ({
  dashboardData,
  loading,
  onRefresh,
  error,
}) => {
  // Error state
  if (error) {
    return (
      <div className="text-center mt-8">
        <div className="text-red-500 mb-4">⚠️ {error}</div>
        <button
          onClick={onRefresh}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Try Again
        </button>
      </div>
    );
  }

  // loading state
  if (loading) {
    return (
      <div className="text-center mt-8">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // no data state
  if (!dashboardData) {
    return (
      <div className="text-center mt-8">
        <p className="text-gray-500 mb-4">No dashboard data available.</p>
        <button
          onClick={onRefresh}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* User Details */}
      <div className="mb-6">
        <UserDetails userData={dashboardData} />
      </div>

      <hr className="my-6" />
    </div>
  );
};

export default Dashboard;
