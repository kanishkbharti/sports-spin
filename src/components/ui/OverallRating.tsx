import { getRatingColor } from "@/lib/football/ratings";

interface OverallRatingProps {
  overall: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}

const sizeClasses = {
  xs: "text-[8px]",
  sm: "text-xs",
  md: "text-sm font-bold",
};

export function OverallRating({ overall, size = "sm", className = "" }: OverallRatingProps) {
  return (
    <span
      className={`font-bold tabular-nums ${sizeClasses[size]} ${className}`}
      style={{ color: getRatingColor(overall) }}
    >
      {overall}
    </span>
  );
}
