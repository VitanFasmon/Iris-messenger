import React from "react";
import clsx from "clsx";

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={clsx(
      "animate-pulse bg-gray-200 dark:bg-gray-700 rounded",
      className
    )}
  />
);
