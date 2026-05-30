"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "text-white btn-primary-grad",
        ghost:
          "bg-surface text-ink border border-line-2 shadow-sm hover:border-line-strong hover:bg-surface-2",
        outline:
          "border border-line-2 bg-transparent text-ink hover:bg-surface-2",
        subtle: "bg-surface-2 text-ink hover:bg-surface-3",
        link: "text-brand underline-offset-4 hover:underline",
        danger: "bg-danger text-white hover:bg-danger/90",
      },
      size: {
        default: "h-10 px-[19px] py-3 text-[14.5px]",
        sm: "h-9 px-3 text-[13px]",
        lg: "h-12 px-[26px] text-[15.5px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "ghost", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
