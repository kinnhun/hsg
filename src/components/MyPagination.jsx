import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import PropTypes from "prop-types";
import clsx from "clsx";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const MyPagination = ({ totalPages, currentPage, onPageChange }) => {
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    onPageChange((options) => ({ ...options, page }));
  };

  const pageNumbers = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    if (currentPage > 3) pageNumbers.push(1);
    if (currentPage > 4) pageNumbers.push("ellipsis-start");

    for (
      let i = Math.max(1, currentPage - 2);
      i <= Math.min(totalPages, currentPage + 2);
      i++
    ) {
      pageNumbers.push(i);
    }

    if (currentPage < totalPages - 3) pageNumbers.push("ellipsis-end");
    if (currentPage < totalPages - 2) pageNumbers.push(totalPages);
  }

  return (
    <Pagination>
      <PaginationContent>
        {/* First Page */}
        <PaginationItem>
          <PaginationFirst
            className={clsx(
              "flex cursor-pointer items-center justify-center",
              currentPage === 1 && "pointer-events-none opacity-50",
            )}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
          >
            <ChevronsLeft size={18} />
          </PaginationFirst>
        </PaginationItem>

        {/* Previous Page */}
        <PaginationItem>
          <PaginationPrevious
            className={clsx(
              "flex cursor-pointer items-center justify-center",
              currentPage === 1 && "pointer-events-none opacity-50",
            )}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }}
          >
            <ChevronLeft size={18} />
          </PaginationPrevious>
        </PaginationItem>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) =>
          typeof page === "number" ? (
            <PaginationItem key={index}>
              <PaginationLink
                className={clsx(
                  "cursor-pointer",
                  page === currentPage
                    ? "pointer-events-none bg-blue-500 text-white"
                    : "hover:bg-gray-200",
                )}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(page);
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={index}>
              <PaginationEllipsis />
            </PaginationItem>
          ),
        )}

        {/* Next Page */}
        <PaginationItem>
          <PaginationNext
            className={clsx(
              "flex cursor-pointer items-center justify-center",
              currentPage === totalPages && "pointer-events-none opacity-50",
            )}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }}
          >
            <ChevronRight size={18} />
          </PaginationNext>
        </PaginationItem>

        {/* Last Page */}
        <PaginationItem>
          <PaginationLast
            className={clsx(
              "flex cursor-pointer items-center justify-center",
              currentPage === totalPages && "pointer-events-none opacity-50",
            )}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }}
          >
            <ChevronsRight size={18} />
          </PaginationLast>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

MyPagination.propTypes = {
  totalPages: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default MyPagination;
