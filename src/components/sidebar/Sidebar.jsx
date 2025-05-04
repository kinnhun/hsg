import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Menu,
  Home,
  Users,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  FileEdit,
  Mail,
  Settings,
  School,
  Upload,
  Contact,
  UserCheck,
  UserPlus,
  User,
  CalendarClock,
  LayoutDashboard,
  BarChart,
  FolderKanban,
  FileClock,
  FilePieChart,
  Book,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

const menuItems = [
  {
    label: "Trang chủ",
    icon: Home,
    path: "/home",
    roles: [
      "Hiệu trưởng",
      "Hiệu phó",
      "Trưởng bộ môn",
      "Giáo viên",
      "Cán bộ văn thư",
    ],
  },
  {
    label: "Quản lý người dùng",
    icon: UserPlus,
    path: "/system/user",
    roles: ["Hiệu trưởng", "Hiệu phó"],
  },
  {
    label: "Quản lý lớp",
    icon: Users,
    path: "/system/class",
    roles: ["Hiệu trưởng", "Hiệu phó"],
  },
  {
    label: "Phân công giảng dạy",
    icon: ClipboardList,
    path: "/system/teaching-assignment",
    roles: ["Hiệu trưởng", "Hiệu phó"],
  },
  {
    label: "Quản lý môn học",
    icon: BookOpen,
    path: "/system/subject",
    roles: ["Hiệu trưởng", "Hiệu phó"],
  },
  {
    label: "Quản lý đợt nhập điểm",
    icon: FileEdit,
    path: "/system/grade-batch",
    roles: ["Hiệu trưởng", "Hiệu phó"],
  },
  {
    label: "Quản lý lịch giảng dạy",
    icon: CalendarClock,
    path: "/system/schedule",
    roles: ["Hiệu trưởng", "Hiệu phó"],
  },
  {
    label: "Quản lý đơn xin nghỉ phép",
    icon: FileClock,
    path: "/system/leave-request",
    roles: ["Hiệu trưởng", "Hiệu phó"],
  },
  {
    label: "Liên hệ",
    icon: Contact,
    path: "/system/contact",
    roles: ["Hiệu trưởng", "Hiệu phó"],
  },
  {
    label: "Quản lý năm học",
    icon: Calendar,
    path: "/system/academic-year",
    roles: ["Hiệu trưởng", "Hiệu phó"],
  },
  {
    label: "Phân công làm giáo án",
    icon: FileText,
    path: "/system/lesson-plan",
    roles: ["Trưởng bộ môn"],
  },
  {
    label: "Quản lý đề thi",
    icon: FilePieChart,
    path: "/system/exam",
    roles: ["Hiệu trưởng", "Hiệu phó", "Trưởng bộ môn"],
  },
  {
    label: "Kết chuyển dữ liệu",
    icon: FolderKanban,
    path: "/system/transfer-data",
    roles: ["Hiệu trưởng", "Hiệu phó"],
  },
  {
    label: "Cấu hình môn học",
    icon: Settings,
    path: "/system/teacher-subject",
    roles: ["Hiệu trưởng", "Hiệu phó"],
  },

  // Giáo viên
  {
    label: "Điểm danh",
    icon: UserCheck,
    path: "/teacher/take-attendance",
    roles: ["Giáo viên", "Trưởng bộ môn", "Hiệu phó"],
  },
  {
    label: "Báo cáo điểm",
    icon: BarChart,
    path: "/teacher/mark-report",
    roles: ["Giáo viên", "Trưởng bộ môn", "Hiệu phó"],
  },

  {
    label: "Lịch giảng dạy",
    icon: Calendar,
    path: "/teacher/schedule",
    roles: ["Giáo viên", "Trưởng bộ môn", "Hiệu phó"],
  },
  {
    label: "Quản lý đơn xin nghỉ phép",
    icon: FileClock,
    path: "/teacher/leave-request",
    roles: ["Giáo viên", "Trưởng bộ môn", "Hiệu phó"],
  },
  {
    label: "Quản lý giáo án",
    icon: FileText,
    path: "/teacher/lesson-plan",
    roles: ["Trưởng bộ môn", "Hiệu phó"],
  },
  {
    label: "Danh sách được phân công làm giáo án ",
    icon: ClipboardList,
    path: "/teacher/lesson-plan-by-teacher",
    roles: ["Giáo viên", "Trưởng bộ môn", "Hiệu phó"],
  },
  {
    label: "Nộp đề thi",
    icon: Upload,
    path: "/teacher/upload-exam",
    roles: ["Giáo viên", "Trưởng bộ môn", "Hiệu phó"],
  },
  {
    label: "Phân công làm giáo án",
    path: "/teacher/lesson-plan",
  },

  // Học sinh
  {
    label: "Thời khóa biểu học sinh",
    icon: Calendar,
    path: "/student/schedule",
    roles: ["Phụ huynh", "Học Sinh"],
  },
  {
    label: "Xem điểm",
    icon: BarChart,
    path: "/student/score",
    roles: ["Phụ huynh", "Học Sinh"],
  },

  // Cán bộ văn thư
  {
    label: "Hồ sơ giáo viên",
    icon: User,
    path: "/teacher/profile",
    roles: ["Cán bộ văn thư", "Hiệu trưởng"],
  },
  {
    label: "Hồ sơ học sinh",
    icon: School,
    path: "/student/profile",
    roles: ["Cán bộ văn thư", "Hiệu trưởng"],
  },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token"));
    const storedRole = token ? jwtDecode(token).role : null;
    if (storedRole) {
      setUserRole(storedRole.replace(/^"|"$/g, ""));
    }
  }, []);

  const filteredMenuItems = menuItems.filter(
    (item) => userRole && item.roles && item.roles.includes(userRole),
  );

  const isMenuActive = (item) => {
    return currentPath === item.path;
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-sky-800 text-white ${
        isOpen ? "w-64" : "w-16"
      } sidebar-scrollbar overflow-y-auto`}
    >
      {/* Button đóng/mở menu */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`sticky top-0 z-20 flex h-12 cursor-pointer items-center border-b border-sky-700 bg-sky-800 p-2 hover:bg-sky-500 ${isOpen ? "pl-3" : "justify-center"}`}
      >
        <button className="p-2 text-white focus:outline-none">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Danh sách menu */}
      <nav className="space-y-1 p-2">
        {filteredMenuItems.map((item) => (
          <button
            key={item.label}
            className={`flex h-12 w-full cursor-pointer items-center rounded-md px-2 hover:bg-sky-600 ${
              isMenuActive(item) ? "bg-sky-500" : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            <div className="flex w-8 shrink-0 justify-center">
              {item.icon ? <item.icon className="h-5 w-5" /> : null}
            </div>
            <span className={`truncate ${isOpen ? "inline-block" : "hidden"}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
