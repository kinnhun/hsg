import React, { useState, useRef, useEffect, memo, useMemo, useCallback } from 'react';
import { useTimetableForPrincipal, useGetClasses, useTimetables } from '../../../services/schedule/queries';
import { useTeachers } from '../../../services/teacher/queries';
import { useSubjects, useAcademicYears } from '@/services/common/queries';
import { useDeleteTimeTableDetail } from '@/services/schedule/mutation';
import { getSemesterByYear } from '../../../services/schedule/api';
import './Schedule.scss';
import { Calendar, Save, Trash2, Plus } from 'lucide-react';
import ExportSchedule from './ExportSchedule';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useCreateTimeTableDetail, useUpdateTimeTableDetail } from '../../../services/schedule/mutation';
import { validateTeacherAssignment, validateSubjectAssignment } from './timetableValidation';
// Constants
const DAYS_OF_WEEK = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
const SHIFTS = [
    { name: 'Sáng', periods: [1, 2, 3, 4, 5] },
    { name: 'Chiều', periods: [6, 7, 8] },
];
const GRADES = ['6', '7', '8', '9'];

const FilterSelect = ({ label, value, onChange, options, disabled }) => (
    <div className="filter-column">
        <label>{label}</label>
        <select value={value || ''} onChange={onChange} disabled={disabled}>
            <option value="">Chọn {label.toLowerCase()}</option>
            {options.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
            ))}
        </select>
    </div>
);

const InfoRow = ({ label, value }) => (
    <div className="info-row flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
        <span className="info-label font-medium text-gray-600">{label}:</span>
        <span className="info-value font-medium text-gray-900">{value}</span>
    </div>
);

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const FilterSection = memo(({
    selectedYear, setSelectedYear, selectedSemester, setSelectedSemester, semesters,
    filters, setFilters, academicYears, teachers, subjects, getFilteredClasses,
    handleSearch, handleReset, selectedTimetable, setSelectedTimetable, timetables, timetablesLoading
}) => (
    <div className="sticky-filter">
        <div className="filter-container">
            <div className="filter-row">
                <FilterSelect
                    label="Năm học"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    options={academicYears?.map(year => ({ value: year.academicYearID, label: year.yearName }))}
                />
                <FilterSelect
                    label="Học kỳ"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                    options={semesters.map(semester => ({ value: semester.semesterID, label: semester.semesterName }))}
                    disabled={!selectedYear || !semesters.length}
                />
                <div className="filter-column">
                    <label>Ngày áp dụng</label>
                    <div className="flex gap-2">
                        <FilterSelect
                            label=""
                            value={selectedTimetable}
                            onChange={(e) => setSelectedTimetable(e.target.value)}
                            options={timetables.map(timetable => ({
                                value: timetable.timetableId,
                                label: `[${timetable.timetableId}] - ${timetable.status} (${formatDate(timetable.effectiveDate)} - ${formatDate(timetable.endDate)})`
                            }))}
                            disabled={!selectedSemester || timetablesLoading}
                        />
                    </div>
                </div>
                <FilterSelect
                    label="Giáo viên"
                    value={filters.teacher}
                    onChange={(e) => setFilters(prev => ({ ...prev, teacher: e.target.value }))}
                    options={teachers.map(teacher => ({ value: teacher.teacherId, label: teacher.fullName }))}
                />
            </div>
            <div className="filter-row">
                <FilterSelect
                    label="Khối"
                    value={filters.grade}
                    onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
                    options={GRADES.map(grade => ({ value: grade, label: `Khối ${grade}` }))}
                />
                <FilterSelect
                    label="Lớp"
                    value={filters.class}
                    onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                    options={getFilteredClasses().map(cls => ({ value: cls.className, label: cls.className }))}
                    disabled={!filters.grade}
                />
                <FilterSelect
                    label="Môn học"
                    value={filters.subject}
                    onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                    options={subjects.map(subject => ({ value: subject.subjectID, label: subject.subjectName }))}
                />
                <FilterSelect
                    label="Chọn buổi"
                    value={filters.session}
                    onChange={(e) => setFilters(prev => ({ ...prev, session: e.target.value }))}
                    options={[{ value: 'Morning', label: 'Sáng' }, { value: 'Afternoon', label: 'Chiều' }]}
                />
            </div>
            <div className="filter-row">
                <div className="filter-column search-button">
                    <button onClick={handleSearch}>Tìm kiếm</button>
                    <button onClick={handleReset} className="reset-button">Reset</button>
                </div>
            </div>
        </div>
    </div>
));

const ScheduleTable = memo(({
    selectedClass, getClassesByGrade, getUniqueClasses, getFilteredShifts,
    showTeacherName, setShowTeacherName, filteredSchedule, scheduleData,
    isViewMode, getSchedule
}) => (
    <div className="table-container">
        <table className="schedule-table">
            <thead>
                <tr>
                    <th className="sticky-header col-1" colSpan="3">Lịch học</th>
                    {!selectedClass && Object.entries(getClassesByGrade()).map(([grade, gradeClasses]) => (
                        <th key={grade} colSpan={gradeClasses.length}>Khối {grade}</th>
                    ))}
                    {selectedClass && <th>Khối {selectedClass.charAt(0)}</th>}
                </tr>
                <tr>
                    <th className="sticky-col col-1">Thứ</th>
                    <th className="sticky-col col-2">Buổi</th>
                    <th className="sticky-col col-3">Tiết</th>
                    {(selectedClass ? [selectedClass] : getUniqueClasses().map(cls => cls.className)).map(className => (
                        <th key={className}>{className}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {DAYS_OF_WEEK.map((day, dayIndex) => {
                    const shiftsToShow = getFilteredShifts();
                    const totalPeriods = shiftsToShow.reduce((sum, shift) => sum + shift.periods.length, 0);
                    return shiftsToShow.map((shift, shiftIndex) =>
                        shift.periods.map((period, periodIndex) => (
                            <tr key={`${day}-${shift.name}-${period}`} className={dayIndex % 2 === 0 ? 'even-day' : 'odd-day'}>
                                {shiftIndex === 0 && periodIndex === 0 && (
                                    <td className="sticky-col col-1" rowSpan={totalPeriods}>{day}</td>
                                )}
                                {periodIndex === 0 && (
                                    <td className="sticky-col col-2" rowSpan={shift.periods.length}>{shift.name}</td>
                                )}
                                <td className="sticky-col col-3">{scheduleData?.[0]?.details.find(item => item.periodId === period)?.periodName || `Tiết ${period}`}</td>
                                {(selectedClass ? [selectedClass] : getUniqueClasses().map(cls => cls.className)).map((className, classIndex) => (
                                    <Droppable key={`${className}`} droppableId={`${className}-${dayIndex}-${period}`}>
                                        {(provided) => (
                                            <td ref={provided.innerRef} {...provided.droppableProps}>
                                                {getSchedule(day, period, className, classIndex)}
                                                {provided.placeholder}
                                            </td>
                                        )}
                                    </Droppable>
                                ))}
                            </tr>
                        ))
                    );
                })}
            </tbody>
        </table>
    </div>
));

const EditDialog = memo(({
    showEditDialog, setShowEditDialog, selectedSchedule, selectedSubjectId,
    setSelectedSubjectId, selectedTeacherId, setSelectedTeacherId,
    subjects, teachers, handleScheduleUpdate, handleDelete
}) => (
    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="schedule-edit-content p-6">
            <DialogHeader className="schedule-edit-header mb-6">
                <DialogTitle className="schedule-edit-title text-2xl font-semibold text-center text-primary border-b pb-4">
                    Chỉnh sửa thời khóa biểu
                </DialogTitle>
            </DialogHeader>
            <div className="schedule-edit-info bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
                <InfoRow label="Thứ" value={selectedSchedule?.day} />
                <InfoRow label="Tiết" value={selectedSchedule?.periodId} />
                <InfoRow label="Lớp" value={`${selectedSchedule?.className}---${selectedSchedule?.classId}`} />
            </div>
            <div className="schedule-edit-form space-y-6">
                <FilterSelect
                    label="Môn học"
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    options={subjects.map(subject => ({ value: subject.subjectID, label: `${subject.subjectName} --${subject.subjectID}` }))}
                />
                <FilterSelect
                    label="Giáo viên"
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    options={teachers.map(teacher => ({ value: teacher.teacherId, label: `${teacher.fullName}---${teacher.teacherId}` }))}
                />
                <div className="schedule-edit-actions flex gap-4 mt-8">
                    <button onClick={handleScheduleUpdate} className="btn-save flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                        <Save size={16} /> Lưu thay đổi
                    </button>
                    <button onClick={handleDelete} className="btn-delete flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                        <Trash2 size={16} /> Xóa
                    </button>
                </div>
            </div>
        </DialogContent>
    </Dialog>
));

const AddDetailDialog = memo(({
    showAddDialog, setShowAddDialog, classes, days, periods, subjects, teachers,
    handleAddDetail
}) => {
    const [form, setForm] = useState({
        class: '', day: '', period: '', subject: '', teacher: ''
    });

    const handleSubmit = useCallback(() => {
        const { class: selectedClass, day, period, subject, teacher } = form;
        if (!selectedClass || !day || !period || !subject || !teacher) {
            toast.error('Vui lòng chọn đầy đủ thông tin');
            return;
        }
        const [className, classId] = selectedClass.split('---');
        handleAddDetail({
            classId,
            className,
            dayOfWeek: day,
            periodId: parseInt(period),
            subjectId: subject,
            teacherId: teacher
        });
        setShowAddDialog(false);
        setForm({ class: '', day: '', period: '', subject: '', teacher: '' });
    }, [form, handleAddDetail, setShowAddDialog]);

    const handleChange = useCallback((key) => (e) => {
        setForm(prev => ({ ...prev, [key]: e.target.value }));
    }, []);

    return (
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogContent className="add-dialog-content">
                <DialogHeader className="schedule-add-header mb-6">
                    <DialogTitle className="schedule-add-title text-2xl font-semibold text-center text-primary border-b pb-4">
                        Thêm tiết học mới
                    </DialogTitle>
                </DialogHeader>
                <div className="schedule-add-form space-y-6">
                    <FilterSelect
                        label="Lớp"
                        value={form.class}
                        onChange={handleChange('class')}
                        options={classes.map(cls => ({
                            value: `${cls.className}---${cls.classId}`,
                            label: cls.className
                        }))}
                    />
                    <FilterSelect
                        label="Thứ"
                        value={form.day}
                        onChange={handleChange('day')}
                        options={days.map(day => ({ value: day, label: day }))}
                    />
                    <FilterSelect
                        label="Tiết"
                        value={form.period}
                        onChange={handleChange('period')}
                        options={periods.map(period => ({ value: period, label: `Tiết ${period}` }))}
                    />
                    <FilterSelect
                        label="Môn học"
                        value={form.subject}
                        onChange={handleChange('subject')}
                        options={subjects.map(subject => ({ value: subject.subjectID, label: `${subject.subjectName} --${subject.subjectID}` }))}
                    />
                    <FilterSelect
                        label="Giáo viên"
                        value={form.teacher}
                        onChange={handleChange('teacher')}
                        options={teachers.map(teacher => ({ value: teacher.teacherId, label: `${teacher.fullName}---${teacher.teacherId}` }))}
                    />
                    <div className="schedule-add-actions flex gap-4 mt-8">
                        <button onClick={handleSubmit} className="btn-save flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                            <Save size={16} /> Thêm tiết học
                        </button>
                        <button onClick={() => setShowAddDialog(false)} className="btn-cancel flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                            Hủy
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
});

const Schedule = () => {
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSemester, setSelectedSemester] = useState(() => parseInt(localStorage.getItem('selectedSemester')) || null);
    const [selectedTimetable, setSelectedTimetable] = useState('');
    const [semesters, setSemesters] = useState([]);
    const [filters, setFilters] = useState({ teacher: '', grade: '', class: '', subject: '', session: '' });
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showTeacherName, setShowTeacherName] = useState(true);
    const [filteredSchedule, setFilteredSchedule] = useState(null);
    const [isViewMode, setIsViewMode] = useState(true);

    const topScrollRef = useRef(null);
    const bottomScrollRef = useRef(null);
    const queryClient = useQueryClient();

    const { data: academicYears = [], isLoading: academicYearsLoading } = useAcademicYears();
    const { data: teachersResponse = { teachers: [] }, isLoading: teachersLoading } = useTeachers();
    const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();
    const { data: classes = [], isLoading: classesLoading } = useGetClasses();
    const { data: timetables = [], isLoading: timetablesLoading } = useTimetables(selectedSemester);
    const teachers = useMemo(() => Array.isArray(teachersResponse) ? teachersResponse : teachersResponse.teachers || [], [teachersResponse]);
    const createTimeTableMutation = useCreateTimeTableDetail();

    const timetableStatus = useMemo(() => {
        const timetableId = parseInt(selectedTimetable);
        return isNaN(timetableId) ? '' : timetables?.find(t => t.timetableId === timetableId)?.status || '';
    }, [selectedTimetable, timetables]);

    const { data: scheduleData = [{ details: [] }], isLoading: scheduleLoading } = useTimetableForPrincipal(
        selectedTimetable,
        timetableStatus
    );

    const deleteTimeTableDetailMutation = useDeleteTimeTableDetail();
    const updateTimeTableMutation = useUpdateTimeTableDetail();

    const syncScroll = useCallback(() => {
        if (topScrollRef.current && bottomScrollRef.current) {
            bottomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
        }
    }, []);

    const getUniqueClasses = useCallback(() => {
        if (!scheduleData?.[0]?.details) return [];
        const classMap = new Map();
        scheduleData[0].details.forEach(detail => {
            if (detail.className && detail.classId) {
                classMap.set(detail.className, { className: detail.className, classId: detail.classId });
            }
        });
        return Array.from(classMap.values()).sort((a, b) => a.className.localeCompare(b.className));
    }, [scheduleData]);

    const getFilteredClasses = useCallback(() => {
        return filters.grade
            ? getUniqueClasses().filter(cls => cls.className.startsWith(filters.grade))
            : getUniqueClasses();
    }, [filters.grade, getUniqueClasses]);

    const getClassesByGrade = useCallback(() => {
        return getUniqueClasses().reduce((acc, cls) => {
            const grade = cls.className.charAt(0);
            acc[grade] = acc[grade] || [];
            acc[grade].push(cls.className);
            return acc;
        }, {});
    }, [getUniqueClasses]);

    const getFilteredShifts = useCallback(() => {
        if (!filteredSchedule?.selectedSession) return SHIFTS;
        return SHIFTS.filter(shift =>
            (filteredSchedule.selectedSession === 'Morning' && shift.name === 'Sáng') ||
            (filteredSchedule.selectedSession === 'Afternoon' && shift.name === 'Chiều')
        );
    }, [filteredSchedule]);

    const getPeriods = useCallback(() => SHIFTS.reduce((acc, shift) => [...acc, ...shift.periods], []), []);

    const handleSearch = useCallback(() => {
        if (!scheduleData?.[0]?.details) return;

        let filtered = scheduleData[0].details;

        if (filters.teacher) filtered = filtered.filter(item => parseInt(item.teacherId) === parseInt(filters.teacher));
        if (filters.grade) filtered = filtered.filter(item => item.className.charAt(0) === filters.grade);
        if (filters.class) filtered = filtered.filter(item => item.className === filters.class);
        if (filters.subject) filtered = filtered.filter(item => parseInt(item.subjectId) === parseInt(filters.subject));
        if (filters.session) {
            const periods = filters.session === 'Morning' ? [1, 2, 3, 4, 5] : [6, 7, 8];
            filtered = filtered.filter(item => periods.includes(parseInt(item.periodId)));
        }

        setFilteredSchedule(filtered.length > 0 ? { ...scheduleData[0], details: filtered, selectedSession: filters.session } : null);
    }, [filters, scheduleData]);

    const handleReset = useCallback(() => {
        setFilters({ teacher: '', grade: '', class: '', subject: '', session: '' });
        setFilteredSchedule(null);
    }, []);

    const handleCellClick = useCallback((day, periodId, className, classIndex) => {
        if (isViewMode) return;
        const scheduleToUse = filteredSchedule || scheduleData?.[0];
        const schedule = scheduleToUse.details.find(
            item => item.dayOfWeek === day && item.periodId === periodId && item.className === className
        );
        const classDetail = classes.find(cls => cls.className === className);
        const classId = classDetail?.classId || getUniqueClasses().find(cls => cls.className === className)?.classId;

        setSelectedSchedule({
            day,
            periodId,
            className,
            classId,
            currentSubject: schedule?.subjectId || '',
            currentTeacher: schedule?.teacherId || '',
            timetableDetailId: schedule?.timetableDetailId || null,
        });
        setSelectedSubjectId(schedule?.subjectId || '');
        setSelectedTeacherId(schedule?.teacherId || '');
        setShowEditDialog(true);
    }, [isViewMode, filteredSchedule, scheduleData, classes, getUniqueClasses]);

    const handleScheduleUpdate = useCallback(async () => {
        if (!selectedSchedule) {
            toast.error('Không có thời khóa biểu được chọn để cập nhật');
            return;
        }
        const scheduleToUse = filteredSchedule || scheduleData?.[0];

        if (!selectedSubjectId || !selectedTeacherId) {
            toast.error('Vui lòng chọn môn học và giáo viên');
            return;
        }

        // Find subjectName for validation
        const subject = subjects.find(s => s.subjectID === parseInt(selectedSubjectId));
        const subjectName = subject ? subject.subjectName : '';

        const newDetail = {
            timetableId: scheduleToUse.timetableId || 0,
            classId: selectedSchedule.classId,
            subjectId: parseInt(selectedSubjectId) || 0,
            teacherId: parseInt(selectedTeacherId) || 0,
            dayOfWeek: selectedSchedule.day,
            periodId: selectedSchedule.periodId,
            subjectName: subjectName,
        };

        // Validate teacher assignment
        const isTeacherValid = validateTeacherAssignment(
            newDetail,
            scheduleToUse.details,
            !!selectedSchedule.timetableDetailId,
            selectedSchedule.timetableDetailId
        );

        if (!isTeacherValid) {
            return; // Stop if validation fails
        }

        // Validate subject assignment
        const isSubjectValid = validateSubjectAssignment(
            newDetail,
            scheduleToUse.details,
            !!selectedSchedule.timetableDetailId,
            selectedSchedule.timetableDetailId
        );

        if (!isSubjectValid) {
            return; // Stop if validation fails
        }

        const payloadUpdate = {
            timetableId: parseInt(selectedTimetable),
            details: [{
                timetableDetailId: selectedSchedule.timetableDetailId,
                classId: selectedSchedule.classId,
                subjectId: parseInt(selectedSubjectId),
                teacherId: parseInt(selectedTeacherId),
                dayOfWeek: selectedSchedule.day,
                periodId: selectedSchedule.periodId
            }]
        };

        try {
            if (selectedSchedule.timetableDetailId) {
                await updateTimeTableMutation.mutateAsync(payloadUpdate);
                toast.success('Cập nhật thời khóa biểu thành công');
            } else {
                await createTimeTableMutation.mutateAsync(newDetail);
                toast.success('Thêm mới thời khóa biểu thành công');
            }
            setShowEditDialog(false);
        } catch (error) {
            console.error('Lỗi khi cập nhật thời khóa biểu:', error);
            toast.error('Có lỗi xảy ra khi cập nhật thời khóa biểu');
        }
    }, [selectedSchedule, filteredSchedule, scheduleData, selectedSubjectId, selectedTeacherId, selectedTimetable, subjects, createTimeTableMutation, updateTimeTableMutation]);
    const handleAddDetail = useCallback(async (detail) => {
        // Find subjectName for validation
        const subject = subjects.find(s => s.subjectID === parseInt(detail.subjectId));
        const subjectName = subject ? subject.subjectName : '';

        const payload = {
            timetableId: parseInt(selectedTimetable) || 0,
            classId: detail.classId,
            subjectId: parseInt(detail.subjectId) || 0,
            teacherId: parseInt(detail.teacherId) || 0,
            dayOfWeek: detail.dayOfWeek,
            periodId: detail.periodId,
            subjectName: subjectName,
        };

        // Validate teacher assignment
        const scheduleToUse = filteredSchedule || scheduleData?.[0];
        const isTeacherValid = validateTeacherAssignment(payload, scheduleToUse.details);

        if (!isTeacherValid) {
            return; // Stop if validation fails
        }

        // Validate subject assignment
        const isSubjectValid = validateSubjectAssignment(payload, scheduleToUse.details);

        if (!isSubjectValid) {
            return; // Stop if validation fails
        }

        try {
            const response = await createTimeTableMutation.mutateAsync(payload);
            if (!response.ok) throw new Error('Không thể tạo tiết học');

            toast.success('Tạo tiết học thành công');
            await queryClient.invalidateQueries(['timetable', selectedSemester]);

            if (filteredSchedule) handleSearch();
        } catch (error) {
            console.error('Lỗi khi tạo tiết học:', error);
            toast.error('Có lỗi xảy ra khi tạo tiết học');
        }
    }, [selectedTimetable, selectedSemester, queryClient, filteredSchedule, scheduleData, subjects, handleSearch]);

    const handleDelete = useCallback(async () => {
        if (!selectedSchedule?.timetableDetailId) {
            toast.error('Không có thời khóa biểu để xóa');
            return;
        }

        try {
            await deleteTimeTableDetailMutation.mutateAsync(selectedSchedule.timetableDetailId);
            toast.success('Xóa thời khóa biểu thành công');

            const updatedDetails = (filteredSchedule || scheduleData[0]).details.filter(
                item => item.timetableDetailId !== selectedSchedule.timetableDetailId
            );

            if (filteredSchedule) {
                setFilteredSchedule({ ...filteredSchedule, details: updatedDetails });
            } else {
                queryClient.setQueryData(['timetable', selectedSemester], oldData =>
                    oldData?.[0] ? [{ ...oldData[0], details: updatedDetails }] : oldData
                );
            }

            setShowEditDialog(false);
        } catch (error) {
            console.error('Lỗi khi xóa thời khóa biểu:', error);
            toast.error('Có lỗi xảy ra khi xóa thời khóa biểu');
        }
    }, [selectedSchedule, filteredSchedule, scheduleData, selectedSemester, queryClient, deleteTimeTableDetailMutation]);

    const getSchedule = useCallback((day, periodId, className, classIndex) => {
        const scheduleToUse = filteredSchedule || scheduleData?.[0];
        if (!scheduleToUse?.details) return <div className="schedule-cell"></div>;

        const schedule = scheduleToUse.details.find(
            item => item.dayOfWeek === day && item.periodId === periodId && item.className === className
        );

        const classId = classes.find(cls => cls.className === className)?.classId ||
            getUniqueClasses().find(cls => cls.className === className)?.classId || className;

        if (schedule) {
            return (
                <Draggable
                    key={`${className}-${day}-${periodId}`}
                    draggableId={`${className}-${day}-${periodId}`}
                    index={periodId}
                    isDragDisabled={isViewMode}
                >
                    {(provided) => (
                        <div
                            className="schedule-cell"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={(e) => {
                                if (!isViewMode) {
                                    e.stopPropagation();
                                    handleCellClick(day, periodId, className, classIndex);
                                }
                            }}
                        >
                            <div className="subject">{schedule.subjectName}</div>
                            {showTeacherName && <div className="teacher">{schedule.teacherName}</div>}
                        </div>
                    )}
                </Draggable>
            );
        }

        if (!isViewMode) {
            return (
                <div
                    className="schedule-cell empty-cell"
                    onClick={() => handleCellClick(day, periodId, className, classIndex)}
                >
                    <button className="add-schedule-btn">+</button>
                </div>
            );
        }

        return <div className="schedule-cell empty-cell"></div>;
    }, [filteredSchedule, scheduleData, classes, getUniqueClasses, isViewMode, showTeacherName, handleCellClick]);

    const onDragEnd = useCallback(async (result) => {
        if (!result.destination || (result.source.droppableId === result.destination.droppableId && result.source.index === result.destination.index)) {
            return;
        }

        const sourceParts = result.source.droppableId.split('-');
        const destParts = result.destination.droppableId.split('-');
        const className = sourceParts[0];
        const sourceDayIndex = parseInt(sourceParts[1]);
        const sourcePeriodId = parseInt(sourceParts[2]);
        const destDayIndex = parseInt(destParts[1]);
        const destPeriodId = parseInt(destParts[2]);

        // Only handle drag-and-drop within the same class column
        if (className !== destParts[0]) {
            return;
        }

        const scheduleToUse = filteredSchedule || scheduleData?.[0];
        if (!scheduleToUse?.details) return;

        // Create a deep copy of the current details to revert if needed
        const originalDetails = JSON.parse(JSON.stringify(scheduleToUse.details));
        const updatedDetails = JSON.parse(JSON.stringify(scheduleToUse.details));

        const sourceItem = updatedDetails.find(
            item => item.dayOfWeek === DAYS_OF_WEEK[sourceDayIndex] &&
                item.periodId === sourcePeriodId &&
                item.className === className
        );
        const destItem = updatedDetails.find(
            item => item.dayOfWeek === DAYS_OF_WEEK[destDayIndex] &&
                item.periodId === destPeriodId &&
                item.className === className
        );

        if (!sourceItem) return;

        // Update TimetableDetails
        if (sourceItem && destItem) {
            // Swap dayOfWeek and periodId between source and destination
            [sourceItem.dayOfWeek, destItem.dayOfWeek] = [destItem.dayOfWeek, sourceItem.dayOfWeek];
            [sourceItem.periodId, destItem.periodId] = [destItem.periodId, sourceItem.periodId];
        } else if (sourceItem) {
            // Move source to new day and period
            sourceItem.dayOfWeek = DAYS_OF_WEEK[destDayIndex];
            sourceItem.periodId = destPeriodId;
        }

        // Validate the updated timetable details
        const sourceValidationDetail = {
            timetableId: scheduleToUse.timetableId || 0,
            classId: sourceItem.classId,
            subjectId: sourceItem.subjectId,
            teacherId: sourceItem.teacherId,
            dayOfWeek: DAYS_OF_WEEK[destDayIndex],
            periodId: destPeriodId,
            subjectName: sourceItem.subjectName,
        };

        const isSourceTeacherValid = validateTeacherAssignment(
            sourceValidationDetail,
            updatedDetails,
            true,
            sourceItem.timetableDetailId
        );

        const isSourceSubjectValid = validateSubjectAssignment(
            sourceValidationDetail,
            updatedDetails,
            true,
            sourceItem.timetableDetailId
        );

        let isDestValid = true;
        let destValidationDetail = null;

        if (destItem) {
            destValidationDetail = {
                timetableId: scheduleToUse.timetableId || 0,
                classId: destItem.classId,
                subjectId: destItem.subjectId,
                teacherId: destItem.teacherId,
                dayOfWeek: DAYS_OF_WEEK[sourceDayIndex],
                periodId: sourcePeriodId,
                subjectName: destItem.subjectName,
            };

            const isDestTeacherValid = validateTeacherAssignment(
                destValidationDetail,
                updatedDetails,
                true,
                destItem.timetableDetailId
            );

            const isDestSubjectValid = validateSubjectAssignment(
                destValidationDetail,
                updatedDetails,
                true,
                destItem.timetableDetailId
            );

            isDestValid = isDestTeacherValid && isDestSubjectValid;
        }

        if (!isSourceTeacherValid || !isSourceSubjectValid || !isDestValid) {
            // Revert to original state if validation fails
            if (filteredSchedule) {
                setFilteredSchedule({ ...filteredSchedule, details: originalDetails });
            } else {
                queryClient.setQueryData(['timetable', selectedSemester], oldData =>
                    oldData?.[0] ? [{ ...oldData[0], details: originalDetails }] : oldData
                );
            }
            return;
        }

        // Optimistically update local state
        if (filteredSchedule) {
            setFilteredSchedule({ ...filteredSchedule, details: updatedDetails });
        } else {
            queryClient.setQueryData(['timetable', selectedSemester], oldData =>
                oldData?.[0] ? [{ ...oldData[0], details: updatedDetails }] : oldData
            );
        }

        // Construct payload for API call
        const payload = {
            timetableId: parseInt(selectedTimetable),
            details: [
                {
                    timetableDetailId: sourceItem.timetableDetailId,
                    classId: sourceItem.classId,
                    subjectId: sourceItem.subjectId,
                    teacherId: sourceItem.teacherId,
                    dayOfWeek: DAYS_OF_WEEK[destDayIndex],
                    periodId: destPeriodId
                }
            ]
        };

        if (destItem) {
            payload.details.push({
                timetableDetailId: destItem.timetableDetailId,
                classId: destItem.classId,
                subjectId: destItem.subjectId,
                teacherId: destItem.teacherId,
                dayOfWeek: DAYS_OF_WEEK[sourceDayIndex],
                periodId: sourcePeriodId
            });
        }

        try {
            // Call API to update timetable
            await updateTimeTableMutation.mutateAsync(payload);
            toast.success('Cập nhật thời khóa biểu thành công');

            // Invalidate queries to refresh data
            await queryClient.invalidateQueries(['timetable', selectedSemester]);
            if (filteredSchedule) handleSearch();
        } catch (error) {
            console.error('Lỗi khi cập nhật thời khóa biểu:', error);
            toast.error('Có lỗi xảy ra khi cập nhật thời khóa biểu');

            // Revert to original state on API failure
            if (filteredSchedule) {
                setFilteredSchedule({ ...filteredSchedule, details: originalDetails });
            } else {
                queryClient.setQueryData(['timetable', selectedSemester], oldData =>
                    oldData?.[0] ? [{ ...oldData[0], details: originalDetails }] : oldData
                );
            }
        }
    }, [filteredSchedule, scheduleData, selectedSemester, selectedTimetable, queryClient, updateTimeTableMutation, handleSearch]);

    useEffect(() => {
        if (!selectedSemester && semesters.length > 0) {
            setSelectedSemester(semesters[0].semesterID);
        }
    }, [selectedSemester, semesters]);

    useEffect(() => {
        if (selectedSemester) {
            localStorage.setItem('selectedSemester', selectedSemester);
            queryClient.invalidateQueries(['timetable', selectedSemester]);
        }
    }, [selectedSemester, queryClient]);

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

    const isLoading = scheduleLoading || teachersLoading || subjectsLoading || classesLoading || timetablesLoading || academicYearsLoading;

    if (isLoading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="schedule-container">
            <FilterSection
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                selectedSemester={selectedSemester}
                setSelectedSemester={setSelectedSemester}
                semesters={semesters}
                filters={filters}
                setFilters={setFilters}
                academicYears={academicYears}
                teachers={teachers}
                subjects={subjects}
                getFilteredClasses={getFilteredClasses}
                handleSearch={handleSearch}
                handleReset={handleReset}
                selectedTimetable={selectedTimetable}
                setSelectedTimetable={setSelectedTimetable}
                timetables={timetables}
                timetablesLoading={timetablesLoading}
            />
            <div className="filter-row-table" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={20} />
                    <span>Thời khóa biểu</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={() => setShowTeacherName(!showTeacherName)}>
                        {showTeacherName ? 'Ẩn tên giáo viên' : 'Hiển thị tên giáo viên'}
                    </button>
                    <ExportSchedule schedule={filteredSchedule || scheduleData?.[0]} showTeacherName={showTeacherName} />
                    <button className="btn-save" onClick={() => setIsViewMode(!isViewMode)}>
                        <Save size={16} /> {isViewMode ? 'Sửa' : 'Xem'}
                    </button>
                    {!isViewMode && (
                        <button className="btn-add-detail" onClick={() => setShowAddDialog(true)}>
                            <Plus size={16} /> Thêm tiết học
                        </button>
                    )}
                    <Link to="/system/timetable-manager">
                        <button className="btn-schedule">
                            <Calendar size={16} /> Quản lý thời khóa biểu
                        </button>
                    </Link>
                </div>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="table-container" ref={topScrollRef} onScroll={syncScroll}>
                    <div className="timetable-table dummy-scroll" />
                    <br />
                    <br />
                    <ScheduleTable
                        selectedClass={filters.class}
                        getClassesByGrade={getClassesByGrade}
                        getUniqueClasses={getUniqueClasses}
                        getFilteredShifts={getFilteredShifts}
                        showTeacherName={showTeacherName}
                        setShowTeacherName={setShowTeacherName}
                        filteredSchedule={filteredSchedule}
                        scheduleData={scheduleData}
                        isViewMode={isViewMode}
                        getSchedule={getSchedule}
                    />
                </div>
            </DragDropContext>
            <EditDialog
                showEditDialog={showEditDialog}
                setShowEditDialog={setShowEditDialog}
                selectedSchedule={selectedSchedule}
                selectedSubjectId={selectedSubjectId}
                setSelectedSubjectId={setSelectedSubjectId}
                selectedTeacherId={selectedTeacherId}
                setSelectedTeacherId={setSelectedTeacherId}
                subjects={subjects}
                teachers={teachers}
                bullsEye
                handleScheduleUpdate={handleScheduleUpdate}
                handleDelete={handleDelete}
            />
            <AddDetailDialog
                showAddDialog={showAddDialog}
                setShowAddDialog={setShowAddDialog}
                classes={classes}
                days={DAYS_OF_WEEK}
                periods={getPeriods()}
                subjects={subjects}
                teachers={teachers}
                handleAddDetail={handleAddDetail}
            />
        </div>
    );
};

export default Schedule;