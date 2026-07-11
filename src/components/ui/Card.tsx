"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  glass?: boolean;
  hover?: boolean;
  accent?: string;
}

export function Card({
  children,
  glass = true,
  hover = false,
  accent,
  className = "",
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={`
        rounded-[18px] overflow-hidden relative
        ${glass ? "glass" : "bg-surface border border-border"}
        ${className}
      `}
      style={accent ? { borderLeftColor: accent, borderLeftWidth: 3 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 pt-5 pb-3 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 pb-5 ${className}`}>{children}</div>;
}
