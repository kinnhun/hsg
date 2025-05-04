import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Custom tooltip component for consistent tooltip styling and behavior
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The element that triggers the tooltip
 * @param {string} props.content - The tooltip content
 * @param {string} [props.side="top"] - Tooltip position (top, right, bottom, left)
 * @param {string} [props.align="center"] - Tooltip alignment (start, center, end)
 * @param {string} [props.className] - Additional CSS classes for the tooltip content
 * @returns {React.ReactNode} The tooltip component
 */
const CustomTooltip = ({
  children,
  content,
  side = "top",
  align = "center",
  className = "",
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={`bg-slate-800 text-white ${className}`}
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CustomTooltip;
