import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium leading-none transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-zoom-blue",
  {
    variants: {
      variant: {
        default: "bg-zoom-blue/15 text-zoom-blue-light",
        secondary: "bg-zoom-dark-elevated text-zoom-text-muted",
        destructive: "bg-zoom-red/15 text-red-400",
        outline: "text-zoom-text border border-zoom-dark-border",
        success: "bg-green-500/15 text-green-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
