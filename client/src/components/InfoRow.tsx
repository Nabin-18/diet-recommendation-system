import React from "react";

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, valueClassName }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}</span>
    <span className={`font-medium ${valueClassName || ""}`}>{value}</span>
  </div>
);

export default InfoRow;