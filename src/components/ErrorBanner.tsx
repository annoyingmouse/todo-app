import React from "react";
interface ErrorBannerProps {
  errorMessage: string;
}
const ErrorBanner: React.FC<ErrorBannerProps> = ({ errorMessage }) => {
  return (
    <div className="p-4 bg-red-100 border border-red-300 rounded text-red-800">
      <strong>Error:</strong> {errorMessage}
    </div>
  );
};
export default ErrorBanner;
