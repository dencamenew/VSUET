import * as React from "react"
import { cn } from "@/lib/utils"
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, onWheel, ...props }, ref) => {
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    if (type === "number") {
      e.currentTarget.blur()
    }
    onWheel?.(e)
  }

  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        // Убираем стрелочки для всех числовых полей
        type === "number" &&
          "[-moz-appearance:_textfield] [appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0",
        className,
      )}
      ref={ref}
      onWheel={handleWheel}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
