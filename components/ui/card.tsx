"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({
  className,
  elevated = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[20px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] overflow-hidden transition-all duration-200",
        elevated && "shadow-[0_4px_24px_rgba(14,15,12,0.06)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 pb-6", className)} {...props}>
      {children}
    </div>
  );
}
