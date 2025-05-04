import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Pagination({ className, ...props }) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("ml-auto flex justify-center justify-end", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }) {
  return <li data-slot="pagination-item" {...props} />;
}

function PaginationLink({
  className,
  isActive,
  size = "icon",
  disabled,
  ...props
}) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function PaginationFirst({ className, disabled, ...props }) {
  return (
    <PaginationLink
      aria-label="Go to first page"
      size="default"
      disabled={disabled}
      className={cn(
        "gap-1 px-2.5",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      <ChevronsLeft />
    </PaginationLink>
  );
}

function PaginationPrevious({ className, disabled, ...props }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      disabled={disabled}
      className={cn(
        "gap-1 px-2.5",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      <ChevronLeftIcon />
    </PaginationLink>
  );
}

function PaginationNext({ className, disabled, ...props }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      disabled={disabled}
      className={cn(
        "gap-1 px-2.5",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationLast({ className, disabled, ...props }) {
  return (
    <PaginationLink
      aria-label="Go to last page"
      size="default"
      disabled={disabled}
      className={cn(
        "gap-1 px-2.5",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      <ChevronsRight />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationFirst,
  PaginationPrevious,
  PaginationNext,
  PaginationLast,
  PaginationEllipsis,
};
