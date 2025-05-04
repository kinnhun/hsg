import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

const spinnerVariants = cva(
  "absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 transition-opacity z-10", // Thêm nền mờ
  {
    variants: {
      show: {
        true: "flex opacity-100",
        false: "hidden opacity-0",
      },
    },
    defaultVariants: {
      show: true,
    },
  },
);

const loaderVariants = cva("animate-spin text-primary", {
  variants: {
    size: {
      small: "w-6 h-6",
      medium: "w-8 h-8",
      large: "w-12 h-12",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

export function Spinner({ size = "medium", show = true, className, children }) {
  return (
    <span className={cn(spinnerVariants({ show }), className)}>
      <Loader2 className={cn(loaderVariants({ size }))} />
      {children}
    </span>
  );
}
