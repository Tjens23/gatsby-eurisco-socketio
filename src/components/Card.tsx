import React from "react";

interface CardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: "default" | "success" | "error" | "warning";
  className?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  variant = "default",
  className = "",
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          borderLeft: "4px solid #10b981",
          backgroundColor: "#ecfdf5",
        };
      case "error":
        return {
          borderLeft: "4px solid #ef4444",
          backgroundColor: "#fef2f2",
        };
      case "warning":
        return {
          borderLeft: "4px solid #f59e0b",
          backgroundColor: "#fffbeb",
        };
      default:
        return {
          borderLeft: "4px solid #6366f1",
          backgroundColor: "#f8fafc",
        };
    }
  };

  const baseStyles = {
    padding: "20px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
    ...getVariantStyles(),
  };

  const titleStyles = {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: subtitle ? "4px" : "12px",
    color: "#1f2937",
  };

  const subtitleStyles = {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "12px",
  };

  return (
    <div style={baseStyles} className={className}>
      <h3 style={titleStyles}>{title}</h3>
      {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
      <div>{children}</div>
    </div>
  );
};

export default Card;
