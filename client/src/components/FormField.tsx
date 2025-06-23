import React from "react";
import { Input } from "@/components/ui/input";

interface FormFieldProps {
  label: string;
  error?: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}

const FormField: React.FC<FormFieldProps> = ({ label, error, inputProps }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-800 mb-1">
      {label}
    </label>
    <Input {...inputProps} className="rounded-[8px] focus-visible:ring-0 shadow-none placeholder:text-gray-400" />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default FormField;