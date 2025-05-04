import * as React from "react"
import { cn } from "@/lib/utils"

const Descriptions = React.forwardRef(({ children, bordered, column = 3, className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "w-full",
                bordered && "border border-border rounded-lg overflow-hidden",
                className
            )}
            {...props}
        >
            <div
                className={cn(
                    "grid",
                    column === 1 && "grid-cols-1",
                    column === 2 && "grid-cols-1 md:grid-cols-2",
                    column === 3 && "grid-cols-1 md:grid-cols-3",
                    column === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                )}
            >
                {children}
            </div>
        </div>
    )
})

const DescriptionsItem = React.forwardRef(({ children, label, span = 1, className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "border-border p-4",
                "md:col-span-1",
                span === 2 && "md:col-span-2",
                span === 3 && "md:col-span-3",
                span === 4 && "md:col-span-4",
                className
            )}
            {...props}
        >
            <div className="text-sm font-medium text-muted-foreground mb-1">{label}</div>
            <div className="text-sm">{children}</div>
        </div>
    )
})

Descriptions.displayName = "Descriptions"
DescriptionsItem.displayName = "DescriptionsItem"

export { Descriptions, DescriptionsItem }