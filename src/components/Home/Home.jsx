// ... existing code ...
import { AgCharts } from "ag-charts-react";
import { useStats } from "@/services/principal/queries";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { User, Users, School, GraduationCap } from "lucide-react";

const userRole = "Hiệu trưởng";
const barColors = {
  "Có phép": "dodgerblue",
  "Không phép": "mediumseagreen",
  "Chưa rõ": "gold",
};

export default function Home() {
  const statsQuery = useStats();
  const stats = statsQuery.data;
  console.log(stats);

  if (userRole !== "Hiệu trưởng" && userRole !== "Hiệu phó") {
    return null;
  }

  // Dữ liệu cho biểu đồ tròn giới tính học sinh
  const studentGenderData = [
    { label: "Nam", value: stats?.maleStudents || 0 },
    { label: "Nữ", value: stats?.femaleStudents || 0 },
  ];
  // Dữ liệu cho biểu đồ tròn giới tính giáo viên
  const teacherGenderData = [
    { label: "Nam", value: stats?.maleTeachers || 0 },
    { label: "Nữ", value: stats?.femaleTeachers || 0 },
  ];
  // Dữ liệu cho biểu đồ cột tổng hợp

  // Dữ liệu cho biểu đồ cột điểm danh
  const absentBarData = [
    {
      label: "Có phép",
      value: stats?.attendanceSummary?.permissionAbsent || 4,
    },
    {
      label: "Không phép",
      value: stats?.attendanceSummary?.absentWithoutPermission || 4,
    },
    { label: "Chưa rõ", value: stats?.attendanceSummary?.unknownAbsent || 3 },
  ];

  // Cấu hình ag-charts
  const pieOptions = (data, title) => ({
    data,
    title: { text: title, fontSize: 16 },
    series: [
      {
        type: "pie",
        angleKey: "value",
        labelKey: "label",
        innerRadiusRatio: 0.5,
        calloutLabel: { enabled: true },
        sectorLabelKey: "value",
        tooltip: {
          renderer: ({ datum }) => ({
            title: datum.label,
            // content: `${datum.label}: ${datum.value}`,
          }),
        },
      },
    ],
    legend: { position: "bottom" },
    height: 220,
    width: "100%",
    padding: { top: 20, bottom: 20, left: 0, right: 0 },
  });

  const barOptions = (data, title) => ({
    data,
    title: { text: title, fontSize: 16 },
    series: [
      {
        type: "bar",
        xKey: "label",
        yKey: "value",
        label: { enabled: true },
        itemStyler: (params) => {
          return {
            fill: barColors[params.datumIndex % barColors.length],
          };
        },
      },
    ],
    legend: { enabled: false },
    height: 220,
    width: "100%",
    padding: { top: 20, bottom: 20, left: 0, right: 0 },
    axes: [
      { type: "category", position: "bottom" },
      { type: "number", position: "left", nice: true, min: 0 },
    ],
  });

  return (
    <>
      <Card className="my-6 border shadow-lg">
        <CardHeader>
          <CardTitle>Thống kê</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-10 md:flex-row">
            {/* Box Lớp */}
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-violet-100 p-4">
                <School className="h-8 w-8 text-violet-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats?.activeClasses ?? (
                    <Skeleton className="inline-block h-6 w-10" />
                  )}
                </div>
                <div className="text-sm text-gray-500">Lớp</div>
              </div>
            </div>
            {/* Box Giáo viên */}
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-cyan-100 p-4">
                <User className="h-8 w-8 text-cyan-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats?.totalTeachers ?? (
                    <Skeleton className="inline-block h-6 w-10" />
                  )}
                </div>
                <div className="text-sm text-gray-500">Giáo viên</div>
              </div>
            </div>
            {/* Box Học sinh */}
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-100 p-4">
                <GraduationCap className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats?.totalStudents ?? (
                    <Skeleton className="inline-block h-6 w-10" />
                  )}
                </div>
                <div className="text-sm text-gray-500">Học sinh</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border shadow-lg">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Users className="text-blue-500" /> Học sinh
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsQuery.isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <div className="flex w-full justify-center">
                <div style={{ width: "100%", maxWidth: 350 }}>
                  <AgCharts
                    options={pieOptions(
                      studentGenderData,
                      "Tỉ lệ học sinh Nam/Nữ",
                    )}
                  />
                </div>
              </div>
            )}
            <div className="mt-4 text-center font-semibold">
              Tổng số học sinh:{" "}
              {stats?.totalStudents ?? (
                <Skeleton className="inline-block h-4 w-16" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-lg">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <User className="text-green-500" /> Giáo viên
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsQuery.isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <div className="flex w-full justify-center">
                <div style={{ width: "100%", maxWidth: 350 }}>
                  <AgCharts
                    options={pieOptions(
                      teacherGenderData,
                      "Tỉ lệ giáo viên Nam/Nữ",
                    )}
                  />
                </div>
              </div>
            )}
            <div className="mt-4 text-center font-semibold">
              Tổng số giáo viên:{" "}
              {stats?.totalTeachers ?? (
                <Skeleton className="inline-block h-4 w-16" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border shadow-lg md:col-span-2">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <School className="text-yellow-500" /> Thống kê điểm danh
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsQuery.isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <div className="flex w-full justify-center">
                <div style={{ width: "100%", maxWidth: 500 }}>
                  <AgCharts
                    options={barOptions(absentBarData, "Thống kê điểm danh")}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
// ... existing code ...
