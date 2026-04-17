import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-700 text-white shadow-sm hover:bg-primary-800",
        secondary:
          "border-transparent bg-primary-100 text-primary-900 hover:bg-primary-200",
        destructive:
          "border-transparent bg-danger-600 text-white shadow-sm hover:bg-danger-700",
        outline: "border-primary-300 text-primary-900 hover:bg-primary-50",
        success:
          "border-transparent bg-success-600 text-white shadow-sm hover:bg-success-700",
        warning:
          "border-transparent bg-warning-600 text-white shadow-sm hover:bg-warning-700",
        info:
          "border-transparent bg-info-600 text-white shadow-sm hover:bg-info-700",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
