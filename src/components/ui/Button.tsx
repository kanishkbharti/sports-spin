"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
  glow?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-accent to-accent-dim text-bg font-semibold hover:brightness-110",
  secondary:
    "bg-surface-elevated text-text-primary border border-border-strong hover:bg-surface-hover",
  ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5",
  outline:
    "bg-transparent text-text-primary border border-border-strong hover:border-accent/40 hover:bg-accent/5",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm rounded-[10px]",
  md: "px-5 py-2.5 text-sm rounded-[12px]",
  lg: "px-7 py-3.5 text-base rounded-[14px]",
  xl: "px-10 py-4 text-lg rounded-[16px]",
};

export function Button({
  variant = "primary",
  size = "md",
  glow = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-200 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variants[variant]} ${sizes[size]}
        ${glow && variant === "primary" ? "btn-glow" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
}
