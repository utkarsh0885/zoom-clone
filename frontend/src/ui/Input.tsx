import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-8 w-full rounded-zoom-btn border border-zoom-dark-border bg-zoom-dark-elevated px-3 py-1.5 text-xs text-zoom-text placeholder:text-zoom-text-dim focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zoom-blue focus-visible:border-zoom-blue disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
