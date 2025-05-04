import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { vi } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  addDays,
  startOfWeek,
  startOfMonth,
  eachDayOfInterval,
  isValid,
} from "date-fns";

export default function AttendanceHeader({
  date,
  setDate,
  grade,
  setGrade,
  classroom,
  setClassroom,
  session,
  setSession,
  selectAll,
  toggleSelectAll,
  viewMode,
  setViewMode,
}) {
  const getDateRange = () => {
    if (!isValid(date)) return [new Date()];

    if (viewMode === "week") {
      const start = startOfWeek(date, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end: addDays(start, 6) });
    }

    if (viewMode === "month") {
      const start = startOfMonth(date);
      const daysInMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
      ).getDate();
      return eachDayOfInterval({ start, end: addDays(start, daysInMonth - 1) });
    }

    return [date]; // Mặc định là ngày được chọn
  };

  const dateRange = getDateRange();
  const formattedDateRange =
    dateRange.length > 1
      ? `${isValid(dateRange[0]) ? dateRange[0].toLocaleDateString("vi-VN") : "--"} - ${isValid(dateRange[dateRange.length - 1]) ? dateRange[dateRange.length - 1].toLocaleDateString("vi-VN") : "--"}`
      : isValid(date)
        ? date.toLocaleDateString("vi-VN")
        : "--";

  useEffect(() => {
    if (viewMode === "week") {
      setDate(startOfWeek(new Date(), { weekStartsOn: 1 })); // Thứ 2 đầu tuần
    } else if (viewMode === "month") {
      setDate(startOfMonth(new Date())); // Ngày 1 đầu tháng
    }
  }, [viewMode]); // Chạy khi `viewMode` thay đổi

  return (
    <Card className="mb-4 p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Chọn ngày */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">{formattedDateRange}</Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={vi}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Chọn khối */}
        <Select value={grade} onValueChange={setGrade}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn khối" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">Khối 10</SelectItem>
            <SelectItem value="11">Khối 11</SelectItem>
            <SelectItem value="12">Khối 12</SelectItem>
          </SelectContent>
        </Select>

        {/* Chọn lớp */}
        <Select value={classroom} onValueChange={setClassroom}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn lớp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A1">Lớp A1</SelectItem>
            <SelectItem value="A2">Lớp A2</SelectItem>
            <SelectItem value="B1">Lớp B1</SelectItem>
          </SelectContent>
        </Select>

        {/* Chọn buổi */}
        <Select value={session} onValueChange={setSession}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn buổi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="morning">Buổi sáng</SelectItem>
            <SelectItem value="afternoon">Buổi chiều</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
