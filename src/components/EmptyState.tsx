import React from "react";
interface EmptyStateProps {
  message: string;
}
const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <div className="text-center p-6 border border-dashed rounded-lg bg-gray-100">
      <p className="text-gray-600 italic">{message}</p>
    </div>
  );
};
export default EmptyState;
