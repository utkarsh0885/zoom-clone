import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-zoom-btn text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zoom-blue focus-visible:ring-offset-1 focus-visible:ring-offset-zoom-dark-bg disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-zoom-blue text-white hover:bg-zoom-blue-hover",
        destructive: "bg-zoom-red text-white hover:bg-red-600",
        outline: "border border-zoom-dark-border bg-transparent text-zoom-text hover:bg-zoom-dark-hover",
        secondary: "bg-zoom-dark-elevated text-zoom-text hover:bg-zoom-dark-hover",
        ghost: "text-zoom-text-muted hover:bg-zoom-dark-hover hover:text-zoom-text",
        link: "text-zoom-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3",
        sm: "h-7 px-2.5 text-[12px]",
        lg: "h-9 px-4",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
