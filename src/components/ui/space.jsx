import * as React from "react"
import { cn } from "@/lib/utils"

const Space = React.forwardRef(({
    children,
    className,
    direction = "horizontal", // horizontal | vertical
    size = "small", // small | medium | large
    align = "center", // start | center | end | baseline
    wrap = false,
    ...props
}, ref) => {
    const sizeMap = {
        small: "gap-2",
        medium: "gap-4",
        large: "gap-6"
    }

    const alignMap = {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        baseline: "items-baseline"
    }

    return (
        <div
            ref={ref}
            className={cn(
                "flex",
                direction === "vertical" && "flex-col",
                sizeMap[size],
                alignMap[align],
                wrap && "flex-wrap",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
})

Space.displayName = "Space"

export { Space }