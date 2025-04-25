"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cn } from "@/lib/utils"
import React from "react"

export function Toaster() {
  const { toasts } = useToast()

  const CustomToastViewport = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Viewport>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
  >(({ className, ...props }, ref) => {
    return (
      <ToastPrimitives.Viewport
        ref={ref}
        className={cn(
          "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
          "left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0", // Center on mobile
          className,
        )}
        {...props}
      />
    )
  })
  CustomToastViewport.displayName = ToastPrimitives.Viewport.displayName

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <CustomToastViewport />
    </ToastProvider>
  )
}
