import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAcademicYears } from '@/services/common/queries';
import { getSemesterByYear } from '../../../services/schedule/api';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import './TimetableManagement.scss';
import { useUpdateTimetableInfo, useCreateTimetable } from '../../../services/schedule/mutation';
import { useTimetables } from '../../../services/schedule/queries';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

// Hàm định dạng ngày
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Component FilterSelect
const FilterSelect = ({ label, value, onChange, options, disabled }) => (
    <div className="filter-column">
        <label>{label}</label>
        <select value={value || ''} onChange={onChange} disabled={disabled}>
            <option value="">Chọn {label.toLowerCase()}</option>
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);

const TimetableManagement = () => {
    const queryClient = useQueryClient();
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [semesters, setSemesters] = useState([]);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [selectedTimetable, setSelectedTimetable] = useState(null);
    const [newTimetable, setNewTimetable] = useState({
        semesterId: '',
        effectiveDate: '',
        endDate: '',
        status: 'Không hoạt động',
        details: [{ classId: 1, subjectId: 1, teacherId: 1, dayOfWeek: 'Thứ Hai', periodId: 1 }],
    });
    const [createYear, setCreateYear] = useState('');
    const [createSemesters, setCreateSemesters] = useState([]);

    const { data: academicYears, isLoading: academicYearsLoading } = useAcademicYears();
    const { data: timetables = [], isLoading: timetablesLoading, error } = useTimetables(selectedSemester);
    const updateTimetableMutation = useUpdateTimetableInfo();
    const createTimetableMutation = useCreateTimetable();

    // Effect để lấy học kỳ khi năm học thay đổi (cho filter)
    useEffect(() => {
        const handleYearChange = async () => {
            if (selectedYear) {
                try {
                    const semesterData = await getSemesterByYear(selectedYear);
                    setSemesters(semesterData || []);
                    setSelectedSemester('');
                } catch (error) {
                    console.error('Lỗi khi lấy dữ liệu học kỳ:', error);
                    toast.error('Không thể lấy danh sách học kỳ');
                }
            } else {
                setSemesters([]);
                setSelectedSemester('');
            }
        };
        handleYearChange();
    }, [selectedYear]);

    // Effect để lấy học kỳ khi năm học thay đổi (cho modal tạo mới)
    useEffect(() => {
        const handleCreateYearChange = async () => {
            if (createYear) {
                try {
                    const semesterData = await getSemesterByYear(createYear);
                    setCreateSemesters(semesterData || []);
                    setNewTimetable({ ...newTimetable, semesterId: '' });
                } catch (error) {
                    console.error('Lỗi khi lấy dữ liệu học kỳ:', error);
                    toast.error('Không thể lấy danh sách học kỳ');
                }
            } else {
                setCreateSemesters([]);
                setNewTimetable({ ...newTimetable, semesterId: '' });
            }
        };
        handleCreateYearChange();
    }, [createYear]);

    // Effect để hiển thị lỗi từ API timetables
    useEffect(() => {
        if (error) {
            toast.error('Có lỗi xảy ra khi lấy danh sách thời khóa biểu');
        }
    }, [error]);

    const handleUpdate = async (timetableData) => {
        try {
            await updateTimetableMutation.mutateAsync(timetableData);
            queryClient.invalidateQueries(['timetables', selectedSemester]);
            setOpenUpdateModal(false);
            toast.success('Cập nhật thời khóa biểu thành công');
        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
            toast.error('Cập nhật thất bại');
        }
    };

    const handleCreate = async () => {
        if (!newTimetable.semesterId || !newTimetable.effectiveDate || !newTimetable.endDate) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        try {
            await createTimetableMutation.mutateAsync(newTimetable);
            queryClient.invalidateQueries(['timetables', selectedSemester]);
            setOpenCreateModal(false);
            setNewTimetable({
                semesterId: '',
                effectiveDate: '',
                endDate: '',
                status: 'Không hoạt động',
                details: [{ classId: 1, subjectId: 1, teacherId: 1, dayOfWeek: 'Thứ Hai', periodId: 1 }],
            });
            setCreateYear('');
            toast.success('Tạo thời khóa biểu thành công');
        } catch (error) {
            console.error('Lỗi khi tạo:', error);
            toast.error('Tạo thời khóa biểu thất bại');
        }
    };

    const handleAddDetail = () => {
        setNewTimetable({
            ...newTimetable,
            details: [...newTimetable.details, { classId: 1, subjectId: 1, teacherId: 1, dayOfWeek: 'Thứ Hai', periodId: 1 }],
        });
    };

    const handleRemoveDetail = (index) => {
        setNewTimetable({
            ...newTimetable,
            details: newTimetable.details.filter((_, i) => i !== index),
        });
    };

    const handleDetailChange = (index, field, value) => {
        const updatedDetails = newTimetable.details.map((detail, i) =>
            i === index ? { ...detail, [field]: value } : detail
        );
        setNewTimetable({ ...newTimetable, details: updatedDetails });
    };

    return (
        <div className="timetable-management-container p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý thời khóa biểu</h1>
                <Button
                    variant="outline"
                    className="bg-blue-500 text-white hover:bg-blue-600"
                    onClick={() => setOpenCreateModal(true)}
                >
                    Thêm mới
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <FilterSelect
                        label="Năm học"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        options={academicYears?.map(year => ({
                            value: year.academicYearID,
                            label: `${year.yearName} -- ${year.academicYearID}`
                        })) || []}
                        disabled={academicYearsLoading}
                    />
                    <FilterSelect
                        label="Học kỳ"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                        options={semesters.map(semester => ({
                            value: semester.semesterID,
                            label: `${semester.semesterName} -- ${semester.semesterID}`
                        }))}
                        disabled={!selectedYear || !semesters.length}
                    />
                </div>

                {timetablesLoading && (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {!timetablesLoading && selectedSemester && (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">TKB ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Kỳ ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Ngày bắt đầu</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Ngày kết thúc </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Trạng thái</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Hoạt động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timetables.length > 0 ? (
                                    timetables.map(timetable => (
                                        <tr key={timetable.timetableId} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-700 border-b">{timetable.timetableId}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 border-b">
                                                {timetable.semesterId} - {
                                                    semesters.find(sem => sem.semesterID === timetable.semesterId)?.semesterName || ''
                                                }
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 border-b">{formatDate(timetable.effectiveDate)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 border-b">{formatDate(timetable.endDate)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 border-b">
                                                <span className={`px-2 py-1 rounded-full text-xs ${timetable.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {timetable.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm border-b">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-blue-500 hover:text-blue-700"
                                                        onClick={() => {
                                                            setSelectedTimetable(timetable);
                                                            setOpenUpdateModal(true);
                                                        }}
                                                    >
                                                        Sửa
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                            Không có thời khóa biểu nào cho học kỳ này.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Cập nhật */}
            <Dialog open={openUpdateModal} onOpenChange={setOpenUpdateModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cập nhật thời khóa biểu</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid gap-2">
                                <label>TKB ID</label>
                                <input
                                    type="text"
                                    value={selectedTimetable?.timetableId || ''}
                                    disabled
                                    className="border rounded p-2 bg-gray-100"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label>Kỳ ID</label>
                                <input
                                    type="text"
                                    value={`${selectedTimetable?.semesterId || ''} - ${semesters.find(sem => sem.semesterID === selectedTimetable?.semesterId)?.semesterName || ''
                                        }`}
                                    disabled
                                    className="border rounded p-2 bg-gray-100"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label>Ngày bắt đầu</label>
                                <input
                                    type="date"
                                    value={selectedTimetable?.effectiveDate ? format(new Date(selectedTimetable.effectiveDate), 'yyyy-MM-dd') : ''}
                                    onChange={(e) => setSelectedTimetable({
                                        ...selectedTimetable,
                                        effectiveDate: e.target.value
                                    })}
                                    className="border rounded p-2"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label>Ngày kết thúc</label>
                                <input
                                    type="date"
                                    value={selectedTimetable?.endDate ? format(new Date(selectedTimetable.endDate), 'yyyy-MM-dd') : ''}
                                    onChange={(e) => setSelectedTimetable({
                                        ...selectedTimetable,
                                        endDate: e.target.value
                                    })}
                                    className="border rounded p-2"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label>Trạng thái</label>
                                <select
                                    value={selectedTimetable?.status || ''}
                                    onChange={(e) => setSelectedTimetable({
                                        ...selectedTimetable,
                                        status: e.target.value
                                    })}
                                    className="border rounded p-2"
                                >
                                    <option value="Hoạt động">Hoạt động</option>
                                    <option value="Không hoạt động">Không hoạt động</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setOpenUpdateModal(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={() => handleUpdate(selectedTimetable)}
                                className="bg-blue-500 text-white hover:bg-blue-600"
                            >
                                Cập nhật
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal Tạo mới */}
            <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tạo thời khóa biểu mới</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid gap-2">
                                <label>Năm học</label>
                                <select
                                    value={createYear}
                                    onChange={(e) => setCreateYear(parseInt(e.target.value))}
                                    className="border rounded p-2"
                                >
                                    <option value="">Chọn năm học</option>
                                    {academicYears?.map(year => (
                                        <option key={year.academicYearID} value={year.academicYearID}>
                                            {year.yearName} -- {year.academicYearID}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <label>Học kỳ</label>
                                <select
                                    value={newTimetable.semesterId}
                                    onChange={(e) => setNewTimetable({ ...newTimetable, semesterId: parseInt(e.target.value) })}
                                    className="border rounded p-2"
                                    disabled={!createYear || !createSemesters.length}
                                >
                                    <option value="">Chọn học kỳ</option>
                                    {createSemesters.map(semester => (
                                        <option key={semester.semesterID} value={semester.semesterID}>
                                            {semester.semesterName} -- {semester.semesterID}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <label>Ngày bắt đầu</label>
                                <input
                                    type="date"
                                    value={newTimetable.effectiveDate}
                                    onChange={(e) => setNewTimetable({ ...newTimetable, effectiveDate: e.target.value })}
                                    className="border rounded p-2"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label>Ngày kết thúc</label>
                                <input
                                    type="date"
                                    value={newTimetable.endDate}
                                    onChange={(e) => setNewTimetable({ ...newTimetable, endDate: e.target.value })}
                                    className="border rounded p-2"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label>Trạng thái</label>
                                <select
                                    value={newTimetable.status}
                                    onChange={(e) => setNewTimetable({ ...newTimetable, status: e.target.value })}
                                    className="border rounded p-2"
                                >
                                    <option value="Hoạt động">Hoạt động</option>
                                    <option value="Không hoạt động">Không hoạt động</option>
                                </select>
                            </div>

                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setOpenCreateModal(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleCreate}
                                className="bg-blue-500 text-white hover:bg-blue-600"
                            >
                                Tạo
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TimetableManagement;