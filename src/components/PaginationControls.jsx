import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PropTypes from "prop-types";

const PaginationControls = ({
  pageSize,
  setFilter,
  totalItems,
  startIndex,
  endIndex,
}) => {
  return (
    <div className="flex items-center gap-4">
      {/* Chọn số lượng hiển thị */}
      <Select
        value={pageSize.toString()} // Đảm bảo giá trị là string
        onValueChange={(value) => {
          setFilter((prev) => ({
            ...prev,
            page: 1, // Reset về trang 1 khi thay đổi pageSize
            pageSize: Number(value), // Chuyển thành số trước khi cập nhật
          }));
        }}
      >
        <SelectTrigger className="w-20">
          <SelectValue defaultValue={pageSize.toString()} />{" "}
          {/* Hiển thị giá trị hiện tại */}
        </SelectTrigger>
        <SelectContent>
          {[5, 10, 20, 50].map((size) => (
            <SelectItem key={size} value={size.toString()}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Hiển thị tổng số nhân viên & phạm vi */}
      <span>
        Tổng số: {totalItems}. Hiển thị {startIndex} - {endIndex}
      </span>
    </div>
  );
};

PaginationControls.propTypes = {
  pageSize: PropTypes.number.isRequired,
  setFilter: PropTypes.func.isRequired,
  totalItems: PropTypes.number.isRequired,
  startIndex: PropTypes.number.isRequired,
  endIndex: PropTypes.number.isRequired,
};

export default PaginationControls;
