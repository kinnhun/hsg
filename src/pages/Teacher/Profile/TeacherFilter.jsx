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
import { cleanString } from "@/helpers/removeWhiteSpace";

// const departments = [
//   { value: "natural_science", label: "Khoa học tự nhiên" },
//   { value: "social_science", label: "Khoa học xã hội" },
//   { value: "whole_school", label: "Toàn trường" },
// ];

// const contracts = [
//   { value: "less_than_1_year", label: "Hợp đồng dưới 1 năm" },
//   { value: "more_than_1_year", label: "Hợp đồng trên 1 năm" },
//   { value: "permanent", label: "Viên chức HĐLV không xác định thời hạn" },
// ];
const contracts = [
  {
    value: "Hợp đồng lao động dưới 1 năm",
    label: "Hợp đồng lao động dưới 1 năm",
  },
  {
    value: "Viên chức HĐLV không xác định thời hạn",
    label: "Viên chức HĐLV không xác định thời hạn",
  },
  { value: "Hợp đồng thuê khoán", label: "Hợp đồng thuê khoán" },
];

const subjects = [
  {
    value: "Khoa học tự nhiên",
    label: "Khoa học tự nhiên",
  },
  {
    value: "Khoa học xã hội",
    label: "Khoa học xã hội",
  },
  {
    value: "Toàn trường",
    label: "Toàn trường",
  },
];

TeacherFilter.propTypes = {
  setFilter: PropTypes.func.isRequired,
};

export default function TeacherFilter({ setFilter }) {
  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [contract, setContract] = useState("");

  // const subjectsQuery = useSubjects();

  const handleSubmit = (e) => {
    e.preventDefault();
    setFilter((options) => ({
      ...options,
      page: 1,

      search: cleanString(search.trim()),
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
      <Button
        onClick={() => setOpen(true)}
        className="cursor-pointer bg-blue-600 font-semibold hover:bg-blue-700"
      >
        Lọc
      </Button>
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
                {subjects.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
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
                Đặt lại
              </Button>
              <Button
                type="submit"
                className="cursor-pointer bg-blue-600 font-semibold hover:bg-blue-700"
              >
                Xác nhận
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
