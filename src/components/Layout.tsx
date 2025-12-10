import React from "react";
import type { LayoutProps } from "../types/LayoutProps.ts";

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        {children}
      </div>
    </div>
  );
};
export default Layout;
