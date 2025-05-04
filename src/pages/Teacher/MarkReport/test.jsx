import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import MarkReportHeader from "./MarkReportHeader";
import { Card } from "@/components/ui/card";
import { data as hk1_data } from "./HK1";
import { data as hk2_data } from "./HK2";
import { useState } from "react";

export default function MarkReportTable() {
    const [semester, setSemester] = useState(1);
    const [data, setData] = useState(hk1_data);

    return (
        <Card className="relative mt-6 p-4">
            <MarkReportHeader
                setSemester={setSemester}
                setData={setData}
                HK1={hk1_data}
                HK2={hk2_data}
            />
            {/* Container chính không có overflow-x-auto */}
            <div className="max-h-[400px] overflow-auto">
                {/* Container cho bảng với overflow-x-auto */}
                <div className="min-w-max">
                    <Table className="w-full border border-gray-300 text-center">
                        <TableHeader className="bg-gray-100">
                            {/* Hàng đầu tiên: Gộp tiêu đề "ĐGDTX" */}
                            <TableRow className="h-[0px]">
                                <TableHead
                                    rowSpan={2}
                                    className="h-5 w-5 border border-gray-300 text-center"
                                >
                                    STT
                                </TableHead>
                                <TableHead
                                    rowSpan={2}
                                    className="h-5 w-60 border border-gray-300 text-center"
                                >
                                    Họ và tên
                                </TableHead>

                                {/* Gộp cột tiêu đề DGDTX */}
                                <TableHead
                                    colSpan={data[0]?.DGDTX.length}
                                    className="h-5 w-40 border border-gray-300 text-center"
                                >
                                    ĐGDTX
                                </TableHead>

                                {/* Các cột khác */}
                                <TableHead
                                    rowSpan={2}
                                    className="h-5 border border-gray-300 text-center"
                                >
                                    DDGGK
                                </TableHead>
                                <TableHead
                                    rowSpan={2}
                                    className="h-5 border border-gray-300 text-center"
                                >
                                    DDGCK
                                </TableHead>
                                <TableHead
                                    rowSpan={2}
                                    className="h-5 border border-gray-300 text-center"
                                >
                                    TBM
                                </TableHead>
                                {semester == 2 && (
                                    <TableHead
                                        rowSpan={2}
                                        className="h-5 border border-gray-300 text-center"
                                    >
                                        TBMCN
                                    </TableHead>
                                )}
                                <TableHead
                                    rowSpan={2}
                                    className="h-5 border border-gray-300 text-center"
                                >
                                    Nhận xét
                                </TableHead>
                                {semester == 2 && (
                                    <TableHead
                                        rowSpan={2}
                                        className="h-5 border border-gray-300 text-center"
                                    >
                                        Nhận xét cả năm
                                    </TableHead>
                                )}
                            </TableRow>

                            {/* Hàng thứ 2: Hiển thị số thứ tự của DGDTX */}
                            <TableRow>
                                {data[0]?.DGDTX.map((_, index) => (
                                    <TableHead
                                        key={index}
                                        className="h-5 w-10 border border-gray-300 text-center"
                                    >
                                        {index + 1}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length > 0 ? (
                                data.map((student) => (
                                    <TableRow
                                        key={student.STT}
                                        className="divide-x divide-gray-300"
                                    >
                                        <TableCell className="h-6 border border-gray-300 text-center">
                                            {student.STT}
                                        </TableCell>
                                        <TableCell className="h-6 border border-gray-300 text-center">
                                            {student.name}
                                        </TableCell>
                                        {student.DGDTX.map((grade, index) => (
                                            <TableCell
                                                key={index}
                                                className="h-6 border border-gray-300 text-center"
                                            >
                                                {grade}
                                            </TableCell>
                                        ))}
                                        <TableCell className="h-6 border border-gray-300 text-center">
                                            {student.DDGGK}
                                        </TableCell>
                                        <TableCell className="h-6 border border-gray-300 text-center">
                                            {student.DDGCK}
                                        </TableCell>
                                        <TableCell className="h-6 border border-gray-300 text-center">
                                            {student.TBM}
                                        </TableCell>
                                        {semester == 2 && (
                                            <TableCell className="h-6 border border-gray-300 text-center">
                                                {student.TBMCN}
                                            </TableCell>
                                        )}
                                        <TableCell className="h-6 max-w-40 border border-gray-300 text-left">
                                            {student.review}
                                        </TableCell>
                                        {semester == 2 && (
                                            <TableCell className="h-6 max-w-40 border border-gray-300 text-left">
                                                {student.reviewCN}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-xl">
                                        Không có dữ liệu
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </Card>
    );
}
