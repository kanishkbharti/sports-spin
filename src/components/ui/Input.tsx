"use client";

import { Search } from "lucide-react";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon = false, className = "", ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        )}
        <input
          ref={ref}
          className={`
            w-full bg-surface-elevated border border-border rounded-[12px]
            text-text-primary placeholder:text-text-muted text-sm
            focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
            transition-all duration-200
            ${icon ? "pl-10 pr-4 py-2.5" : "px-4 py-2.5"}
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
