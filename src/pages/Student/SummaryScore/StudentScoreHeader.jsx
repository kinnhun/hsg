import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";

export default function StudentScoreHeader({ setSemester, setData }) {
  // Nếu `semester` chưa có giá trị, đặt mặc định là "1"
  const [selectedSemester, setSelectedSemester] = useState(1);

  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold">Báo cáo điểm</h2>

      <ToggleGroup
        type="single"
        defaultValue={1}
        value={selectedSemester}
        onValueChange={(value) => {
          if (value) {
            setSelectedSemester(value);
            setSemester(value);
          }
        }}
        className="rounded-lg bg-gray-100 p-1"
      >
        <ToggleGroupItem
          value={1}
          className="rounded-md px-4 py-2 data-[state=on]:bg-blue-500 data-[state=on]:text-white"
        >
          Học kỳ 1
        </ToggleGroupItem>
        <ToggleGroupItem
          value={2}
          className="rounded-md px-4 py-2 data-[state=on]:bg-blue-500 data-[state=on]:text-white"
        >
          Học kỳ 2
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
