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
import { useClasses, useGradeLevels } from "@/services/common/queries";
import { cleanString } from "@/helpers/removeWhiteSpace";

StudentFilter.propTypes = {
  setFilter: PropTypes.func.isRequired,
};

export default function StudentFilter({ setFilter }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("");
  const [className, setClassname] = useState("");

  const { data } = useClasses();
  const gradeLevelQuery = useGradeLevels();
  const grades = gradeLevelQuery?.data;
  const currentClasses = data?.filter((c) => c.gradeLevelId == grade);

  const handleGradeChange = (value) => {
    setGrade(value);
    setClassname("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFilter((options) => ({
      ...options,
      page: 1,
      search: cleanString(search.trim()),
      grade,
      className,
    }));
    setOpen(false);
  };

  const handleReset = () => {
    setSearch("");
    setGrade("");
    setClassname("");
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
            {/* Lọc theo khối */}
            <Select
              onValueChange={handleGradeChange}
              value={grade?.toString() || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn khối" />
              </SelectTrigger>
              <SelectContent>
                {grades &&
                  grades.length > 0 &&
                  grades?.map((d) => (
                    <SelectItem
                      key={d.gradeLevelId}
                      value={d.gradeLevelId.toString()}
                    >
                      {d.gradeName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={setClassname}
              value={className}
              disabled={!grade}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent>
                {currentClasses &&
                  currentClasses.length > 0 &&
                  currentClasses.map((c) => (
                    <SelectItem key={c.classId} value={c.className}>
                      {c.className}
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
