import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,50%),rgba(255,255,255,0.35),transparent_45%)] before:opacity-0 before:transition-opacity hover:before:opacity-100",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-950 shadow-glow hover:brightness-110 hover:shadow-glow-lg",
        secondary:
          "bg-secondary/80 text-secondary-foreground border border-white/10 hover:bg-secondary hover:border-teal-400/30",
        outline:
          "border border-teal-400/25 bg-white/[0.03] hover:bg-teal-400/10 hover:border-teal-400/45 hover:text-teal-100",
        ghost: "hover:bg-white/5 hover:text-teal-100",
        destructive:
          "bg-destructive text-destructive-foreground hover:opacity-90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onMouseMove, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onMouseMove={
          asChild
            ? onMouseMove
            : (e) => {
                const el = e.currentTarget;
                const rect = el.getBoundingClientRect();
                el.style.setProperty("--x", `${e.clientX - rect.left}px`);
                el.style.setProperty("--y", `${e.clientY - rect.top}px`);
                onMouseMove?.(e);
              }
        }
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
