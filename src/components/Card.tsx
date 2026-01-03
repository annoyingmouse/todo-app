import React from "react";
import type { CardProps } from "../types/CardProps";

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`p-4 border rounded bg-white shadow ${className}`}>
      {children}
    </div>
  );
};
export default Card;
