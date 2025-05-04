import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { vi } from "date-fns/locale";
import PropTypes from "prop-types";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

const DatePicker = ({ value, onSelect, locale = vi, disabled = true }) => {
  const [month, setMonth] = useState(
    value ? value.getMonth() : new Date().getMonth(),
  );
  const [year, setYear] = useState(
    value ? value.getFullYear() : new Date().getFullYear(),
  );

  useEffect(() => {
    if (value) {
      setMonth(value.getMonth());
      setYear(value.getFullYear());
    }
  }, [value]);

  // Generate years from 1950 to current year + 5
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1950 + 6 },
    (_, i) => currentYear - (currentYear - 1950) + i,
  );

  // Month names in Vietnamese
  const months = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  // Handle navigation
  const goToPreviousYear = () => setYear(year - 1);
  const goToNextYear = () => setYear(year + 1);
  const goToPreviousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };
  const goToNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Handle direct year/month selection
  const handleYearChange = (selectedYear) => {
    setYear(parseInt(selectedYear));
  };

  const handleMonthChange = (selectedMonth) => {
    setMonth(parseInt(selectedMonth));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-gray-400",
          )}
        >
          {value ? format(value, "dd/MM/yyyy") : "dd/mm/yyyy"}
          <CalendarIcon className="h-4 w-4 text-gray-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="border-b p-2">
          <div className="mb-2 flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={goToPreviousYear}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Select value={year.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue>{year}</SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={goToNextYear}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Select value={month.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue>{months[month]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {months.map((m, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={value}
          onSelect={onSelect}
          month={new Date(year, month)}
          onMonthChange={(date) => {
            setMonth(date.getMonth());
            setYear(date.getFullYear());
          }}
          locale={locale}
          disabled={
            disabled &&
            ((date) => date > new Date() || date < new Date("1900-01-01"))
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

DatePicker.propTypes = {
  value: PropTypes.instanceOf(Date),
  onSelect: PropTypes.func,
  locale: PropTypes.object,
  disabled: PropTypes.bool,
};

export default DatePicker;
