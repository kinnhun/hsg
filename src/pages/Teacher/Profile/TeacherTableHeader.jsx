import { useState } from "react";
import ExcelImportModal from "@/components/excel/ExcelImportModal";
import ExportExcelByColumn from "@/components/excel/ExportExcelByColumn";
import PropTypes from "prop-types";
import TeacherFilter from "./TeacherFilter";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import ColumnConfigModal from "../../../components/ColumnConfigModal";
import { useNavigate } from "react-router";

const TeacherTableHeader = ({
  type = "teachers",
  setFilter,
  setVisibleColumns,
  visibleColumns,
  columns,
  data,
}) => {
  const navigate = useNavigate();
  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState(false);

  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-2xl font-semibold">Danh sách cán bộ</h2>
      <div className="flex gap-2">
        <TeacherFilter setFilter={setFilter} />
        <ExcelImportModal type="teachers" />
        <ExportExcelByColumn
          fileName="Danh sách giáo viên.xlsx"
          allData={data} // Truyền toàn bộ dữ liệu
          visibleColumns={columns}
        />

        <Button
          variant="outline"
          onClick={() => navigate("/teacher/profile/create-teacher")}
        >
          Thêm mới
        </Button>

        <Button
          variant="outline"
          onClick={() => setIsColumnConfigOpen(true)}
          className="flex items-center gap-1"
        >
          <Settings className="h-4 w-4" />
          Cấu hình cột hiển thị
        </Button>

        <ColumnConfigModal
          isOpen={isColumnConfigOpen}
          onClose={() => setIsColumnConfigOpen(false)}
          columns={columns}
          selectedColumns={visibleColumns}
          onSave={setVisibleColumns}
        />
      </div>
    </div>
  );
};

TeacherTableHeader.propTypes = {
  type: PropTypes.string.isRequired,
  setFilter: PropTypes.func.isRequired,
  setVisibleColumns: PropTypes.func.isRequired,
  visibleColumns: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
};

export default TeacherTableHeader;
