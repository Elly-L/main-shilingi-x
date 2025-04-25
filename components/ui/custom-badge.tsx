import * as React from "react"
import { cn } from "@/lib/utils"

interface CustomBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info"
}

export function CustomBadge({ 
  className, 
  variant = "default", 
  ...props 
}: CustomBadgeProps) {
  const baseStyle = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
  
  const variantStyles = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
  }
  
  return (
    <span className={cn(baseStyle, variantStyles[variant], className)} {...props} />
  )
} 