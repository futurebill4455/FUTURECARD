import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-foreground shadow-inner ring-offset-background transition placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:border-teal-400/40 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";
