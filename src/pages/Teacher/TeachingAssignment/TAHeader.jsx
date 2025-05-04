import ExcelImportModal from "@/components/excel/ExcelImportModal";
import ExportExcel from "@/components/excel/ExportExcel";
import PropTypes from "prop-types";
import TAFilter from "./TAFilter";

const TAHeader = ({ type, setFilter }) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">Danh sách cán bộ</h2>
      <div className="flex gap-2">
        <TAFilter setFilter={setFilter} />
        <ExcelImportModal type={type} />
        <ExportExcel type={type} />
      </div>
    </div>
  );
};

TAHeader.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.string.isRequired,
};

export default TAHeader;
