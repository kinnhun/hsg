import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAcademicYears } from "@/services/common/queries";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PropTypes from "prop-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { getSemesterByYear } from "../../services/schedule/api";

const Header = ({ setCurrentYear }) => {
  const navigate = useNavigate();
  const academicYears = useAcademicYears();
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    if (academicYears.data && academicYears.data.length > 0) {
      const storedYear = sessionStorage.getItem("currentAcademicYear");
      if (storedYear) {
        const parsedYear = JSON.parse(storedYear);
        setSelectedYear(parsedYear);
        setCurrentYear(parsedYear);
      } else {
        const now = new Date();
        let currentYear = academicYears.data.find(
          (year) =>
            new Date(year.startDate) <= now && now <= new Date(year.endDate),
        );

        if (!currentYear) {
          // Nếu không tìm được năm phù hợp, chọn năm có endDate mới nhất
          currentYear = academicYears.data
            .slice()
            .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0];
        }
        console.log(currentYear);
        setSelectedYear(currentYear);
        setCurrentYear(currentYear);
        sessionStorage.setItem(
          "currentAcademicYear",
          JSON.stringify(currentYear),
        );
      }
    }
  }, [academicYears.data]);

  // console.log(academicYears.data);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <header className="flex h-14 items-center overflow-hidden border-b">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/icon/logo.webp"
              alt="School Logo"
              className="h-12 w-12 object-cover"
            />
            <div className="">
              <h1 className="text-2xl font-bold">TRƯỜNG THCS HẢI GIANG</h1>
              <p className="text-sm">Hải Giang - Hải Hậu - Nam Định</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Select
              value={selectedYear?.academicYearID}
              onValueChange={async (value) => {
                const year = academicYears.data.find(
                  (y) => y.academicYearID === value,
                );
                setSelectedYear(year);
                setCurrentYear(year);

                // Lưu vào sessionStorage cho việc duy trì trạng thái khi refresh
                sessionStorage.setItem(
                  "currentAcademicYear",
                  JSON.stringify(year),
                );

                // Lưu thêm vào localStorage cho academicYearID và yearName
                localStorage.setItem(
                  "selectedAcademicYearID",
                  year.academicYearID,
                );
                localStorage.setItem("selectedYearName", year.yearName);

                // Gọi API để lấy thông tin học kỳ
                const semesters = await getSemesterByYear(year.academicYearID);
                localStorage.setItem("semesters", JSON.stringify(semesters));
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue>{selectedYear?.yearName}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(
                  academicYears?.data?.slice()?.sort((a, b) => {
                    const aYear = parseInt(a.yearName?.split("-")[0] || 0, 10);
                    const bYear = parseInt(b.yearName?.split("-")[0] || 0, 10);
                    return bYear - aYear;
                  }) || []
                ).map((item) => (
                  <SelectItem
                    key={item.academicYearID}
                    value={item.academicYearID}
                  >
                    {item.yearName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src="" />
                    <AvatarFallback>HG</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
Header.propTypes = {
  setCurrentYear: PropTypes.func,
};

export default Header;
