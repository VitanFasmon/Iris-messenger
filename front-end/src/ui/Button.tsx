import React from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed";
const variants: Record<Variant, string> = {
  primary: "bg-indigo-600 hover:bg-indigo-500 text-white",
  secondary:
    "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100",
  ghost:
    "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-indigo-600",
  destructive: "bg-red-600 hover:bg-red-500 text-white",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  loading,
  className,
  children,
  disabled,
  ...rest
}) => (
  <button
    className={clsx(base, variants[variant], className)}
    disabled={disabled || loading}
    {...rest}
  >
    {loading ? <span className="animate-pulse">…</span> : children}
  </button>
);
