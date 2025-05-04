import { useState } from "react";
import { Button } from "@/components/ui/button";

import { Settings } from "lucide-react";
import CreateAcademicYearModal from "./CreateAcademicYearModal";
import { useAcademicYears } from "@/services/common/queries";
import { useAllSemesters } from "@/services/principal/queries";
import { formatDateString } from "@/helpers/formatDate";
import UpdateAcedemicYearModal from "./UpdateAcademicYearModal";
import PaginationControls from "@/components/PaginationControls";
import MyPagination from "@/components/MyPagination";

const AcademicYearManagement = () => {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);

  const [filter, setFilter] = useState({
    page: 1,
    pageSize: 5,
  });

  const academicYearQuery = useAcademicYears();
  const semesterQuery = useAllSemesters();

  const combinedData = (academicYearQuery?.data || [])
    .map((year) => {
      const semesters = (semesterQuery?.data || []).filter(
        (s) => s.academicYearID === year.academicYearID,
      );
      // Find semester 1 and semester 2
      const semester1 = semesters.find((s) => s.semesterName === "Học kỳ 1");
      const semester2 = semesters.find((s) => s.semesterName === "Học kỳ 2");
      return {
        ...year,
        startHK1: formatDateString(semester1?.startDate) || "",
        endHK1: formatDateString(semester1?.endDate) || "",
        startHK2: formatDateString(semester2?.startDate) || "",
        endHK2: formatDateString(semester2?.endDate) || "",
      };
    })
    .sort((a, b) => {
      // Sort by yearName descending, e.g. "2024-2025" > "2023-2024"
      const aYear = parseInt(a.yearName?.split("-")[0] || 0, 10);
      const bYear = parseInt(b.yearName?.split("-")[0] || 0, 10);
      return bYear - aYear;
    });

  const { page, pageSize } = filter;

  const totalPages = Math.ceil(combinedData.length / pageSize);
  const paginatedData = combinedData?.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const startIndex = combinedData.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, combinedData.length);

  return (
    <div className="py-6">
      <div>
        <h1 className="text-2xl font-bold"></h1>
        <div className="flex items-center justify-end gap-x-3">
          <Button
            onClick={() => setOpenCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Thêm mới năm học
          </Button>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="sticky top-0 z-10 bg-slate-100">
              <th className="border px-2 py-2 text-center">STT</th>
              <th className="border px-2 py-2 text-center">Năm học</th>
              <th className="border px-2 py-2 text-center">
                Ngày bắt đầu học kì I
              </th>
              <th className="border px-2 py-2 text-center">
                Ngày kết thúc học kì I
              </th>
              <th className="border px-2 py-2 text-center">
                Ngày bắt đầu học kì II
              </th>
              <th className="border px-2 py-2 text-center">
                Ngày kết thúc học kì II
              </th>
              <th className="border px-2 py-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr key={row.id}>
                <td className="border px-2 py-2 text-center">
                  {(page - 1) * pageSize + idx + 1}
                </td>
                <td className="border px-2 py-2 text-center">{row.yearName}</td>
                <td className="border px-2 py-2 text-center">{row.startHK1}</td>
                <td className="border px-2 py-2 text-center">{row.endHK1}</td>
                <td className="border px-2 py-2 text-center">{row.startHK2}</td>
                <td className="border px-2 py-2 text-center">{row.endHK2}</td>
                <td className="border px-2 py-2 text-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setOpenUpdateModal(true);
                      setSelectedYear(row);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <CreateAcademicYearModal
          open={openCreateModal}
          onCancel={setOpenCreateModal}
        />
        <UpdateAcedemicYearModal
          open={openUpdateModal}
          onCancel={() => {
            setOpenUpdateModal(false);
            setSelectedYear(null);
          }}
          academicYearId={selectedYear?.academicYearID}
        />
      </div>
      <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <PaginationControls
          pageSize={pageSize}
          setFilter={setFilter}
          totalItems={combinedData.length || 0}
          startIndex={startIndex}
          endIndex={endIndex}
        />

        <MyPagination
          totalPages={totalPages}
          currentPage={page}
          onPageChange={setFilter}
        />
      </div>
    </div>
  );
};

export default AcademicYearManagement;
