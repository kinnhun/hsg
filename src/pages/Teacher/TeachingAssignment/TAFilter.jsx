import { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DialogDescription } from "@radix-ui/react-dialog";

const fields = [
  { value: "name", label: "Họ tên cán bộ" },
  { value: "code", label: "Mã cán bộ" },
  { value: "phone", label: "Số ĐTDD" },
  { value: "email", label: "Địa chỉ Email" },
  { value: "dob", label: "Ngày sinh" },
  { value: "id", label: "ID" },
];

// const departments = [
//   { value: "natural_science", label: "Khoa học tự nhiên" },
//   { value: "social_science", label: "Khoa học xã hội" },
//   { value: "whole_school", label: "Toàn trường" },
// ];
const departments = [
  { value: "Physics", label: "Vật Lý" },
  { value: "Math", label: "Toán" },
];

// const contracts = [
//   { value: "less_than_1_year", label: "Hợp đồng dưới 1 năm" },
//   { value: "more_than_1_year", label: "Hợp đồng trên 1 năm" },
//   { value: "permanent", label: "Viên chức HĐLV không xác định thời hạn" },
// ];
const contracts = [
  { value: "Payroll", label: "Biên chế" },
  { value: "long term contract", label: "Hợp đồng dài hạn" },
];

TAFilter.propTypes = {
  setFilter: PropTypes.func.isRequired,
};

export default function TAFilter({ setFilter }) {
  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [contract, setContract] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setFilter((options) => ({
      ...options,
      page: 1,

      search: search.trim(),
      department,
      contract,
    }));
    setOpen(false);
  };

  const handleReset = () => {
    setSearch("");
    setDepartment("");
    setContract("");
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Lọc</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bộ lọc</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Lọc theo tổ bộ môn */}
            <Select onValueChange={setDepartment} value={department}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn tổ bộ môn" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Lọc theo hợp đồng lao động */}
            <Select onValueChange={setContract} value={contract}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại hợp đồng" />
              </SelectTrigger>
              <SelectContent>
                {contracts.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Ô tìm kiếm */}
            <Input
              placeholder="Tìm kiếm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button type="submit">Xác nhận</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
