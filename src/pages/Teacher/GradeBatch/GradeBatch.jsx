import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AddGradeBatch from "./AddGradeBatch";
import GradeBatchDetail from "./GradeBatchDetail";
import { cn } from "@/lib/utils";
import { useSemestersByAcademicYear } from "@/services/common/queries";
import { useGradeBatchs } from "@/services/principal/queries";
import { formatDate, formatDateString } from "@/helpers/formatDate";
import { useLayout } from "@/layouts/DefaultLayout/DefaultLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function GradeBatch() {
  const { currentYear } = useLayout();
  const [semester, setSemester] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gradeBatchId, setGradeBatchId] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const gradeBatchs = useGradeBatchs(currentYear?.academicYearID);
  const semesterQuery = useSemestersByAcademicYear(currentYear?.academicYearID);
  const semesters = semesterQuery.data || [];
  const currentGradeBatchs = gradeBatchs?.data?.filter(
    (batch) => batch.semesterId === semester?.semesterID,
  );
  const getStatusBadge = (status) => {
    const newStatus = status.toLowerCase();
    switch (newStatus) {
      case "hoạt động":
        return <Badge className="bg-green-500">Đang mở</Badge>;
      case "không hoạt động":
        return <Badge className="bg-gray-500">Đã đóng</Badge>;

      default:
        return <Badge>{status}</Badge>;
    }
  };
  useEffect(() => {
    if (semesters?.length > 0) {
      setSemester(semesters[0]);
    }
  }, [semesters, currentYear]);

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Quản lý đợt nhập điểm</h1>
              <p className="text-muted-foreground text-sm">
                Quản lý các đợt nhập điểm trong học kỳ
              </p>
            </div>
            <div className="bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-lg p-1">
              {semesters?.map((sem) => (
                <button
                  key={sem.semesterID}
                  className={cn(
                    "ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-8 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                    semester?.semesterID === sem.semesterID
                      ? "bg-blue-600 text-white shadow-sm" // Active: blue background, white text
                      : "bg-gray-200 text-gray-700 hover:bg-blue-100", // Inactive: gray background, blue hover
                  )}
                  onClick={() => setSemester(sem)}
                >
                  {sem.semesterName}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-md bg-blue-600 text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
            >
              <PlusCircle size={18} />
              <span>Thêm đợt nhập điểm</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentGradeBatchs?.map((batch) => (
          <Card key={batch.batchID} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="line-clamp-1 text-lg font-semibold">
                  {batch.batchName}
                </CardTitle>
                {getStatusBadge(batch.status)}
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div className="mb-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Thời gian:</span>
                  <span>
                    {formatDateString(formatDate(batch.startDate))} -{" "}
                    {formatDateString(formatDate(batch.endDate))}
                  </span>
                </div>
              </div>

              {/* <div className="mb-3">
                <p className="mb-2 text-sm text-gray-500">Cột điểm:</p>
                <div className="flex flex-wrap gap-2">
                  {batch.scoreTypes.frequent.enabled && (
                    <Badge variant="outline">
                      Thường xuyên ({batch.scoreTypes.frequent.count})
                    </Badge>
                  )}
                  {batch.scoreTypes.midterm.enabled && (
                    <Badge variant="outline">ĐĐG GK</Badge>
                  )}
                  {batch.scoreTypes.final.enabled && (
                    <Badge variant="outline">ĐĐG CK</Badge>
                  )}
                </div>
              </div> */}

              <div className="mt-4 flex justify-end">
                <Button
                  className="flex items-center gap-2 rounded-md bg-blue-600 text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
                  onClick={() => {
                    setGradeBatchId(batch.batchID);
                    setIsUpdateModalOpen(true);
                  }}
                >
                  Xem chi tiết
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <AddGradeBatch
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        semester={semester}
      />

      <GradeBatchDetail
        isModalOpen={isUpdateModalOpen}
        setIsModalOpen={(open) => {
          setIsUpdateModalOpen(open);
          if (!isUpdateModalOpen) setGradeBatchId(null);
        }}
        gradeBatchId={gradeBatchId}
        semester={semester}
        currentYear={currentYear}
      />
      {/* Detail Modal Component */}
    </div>
  );
}
