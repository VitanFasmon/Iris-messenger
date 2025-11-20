import React from "react";
import clsx from "clsx";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback: string; // usually first letter
  size?: number;
  statusColor?: string; // presence indicator color class
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 32,
  statusColor,
  className,
}) => (
  <div
    className={clsx(
      "relative rounded-full bg-muted overflow-hidden flex items-center justify-center text-sm font-medium select-none shadow-sm",
      className
    )}
    style={{ width: size, height: size }}
  >
    {src ? (
      <img
        src={src}
        alt={alt || fallback}
        className="w-full h-full object-cover"
      />
    ) : (
      <span className="text-muted-foreground">{fallback}</span>
    )}
    {statusColor && (
      <span
        className={clsx(
          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
          statusColor
        )}
      />
    )}
  </div>
);
