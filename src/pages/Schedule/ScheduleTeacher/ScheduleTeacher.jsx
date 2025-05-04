import React, { useState, useEffect } from 'react';
import { useScheduleTeacher, useGetTimetiableSubstituteSubstituteForTeacher } from '../../../services/schedule/queries';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import './ScheduleTeacher.scss';

const ScheduleTeacher = () => {
    const [teacherId, setTeacherId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs());

    useEffect(() => {
        const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
        if (token) {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                setTeacherId(payload.teacherId);
            }
        }
    }, []);

    const { data: scheduleData, isLoading } = useScheduleTeacher(teacherId);
    const { data: substituteData = [] } = useGetTimetiableSubstituteSubstituteForTeacher(teacherId, selectedDate);

    const daysOfWeek = [
        'Thứ Hai',
        'Thứ Ba',
        'Thứ Tư',
        'Thứ Năm',
        'Thứ Sáu',
        'Thứ Bảy',
        'Chủ Nhật',
    ];

    const shifts = [
        { name: 'Sáng', periods: [1, 2, 3, 4, 5] },
        { name: 'Chiều', periods: [1, 2, 3] },
    ];

    const getSchedule = (day, shift, period) => {
        if (!scheduleData?.[0]?.details) return '';

        // Kiểm tra xem có lịch dạy thay không
        const substituteClass = substituteData.find(
            sub => sub.dayOfWeek === day && sub.periodId === period
        );

        if (substituteClass) {
            return {
                content: `${substituteClass.className} - ${substituteClass.subjectName}\n(Dạy thay)`,
                isSubstitute: true
            };
        }

        const schedule = scheduleData[0].details.find(
            (item) =>
                item.dayOfWeek === day &&
                item.periodId === period
        );

        if (schedule) {
            return {
                content: `${schedule.className} - ${schedule.subjectName}`,
                isSubstitute: false
            };
        }
        return '';
    };

    if (isLoading) {
        return <div>Đang tải...</div>;
    }

    const currentSchedule = scheduleData?.[0];

    return (
        <div className="schedule-teacher-container">
            <div className="schedule-header">
                <div className="date-picker-section">
                    <label>Chọn ngày:</label>
                    <DatePicker
                        value={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày"
                    />
                </div>

                {currentSchedule && (
                    <div className="schedule-info">
                        <h2>Thời Khóa Biểu Trong Tuần</h2>
                        <p><strong>Học kỳ:</strong> {currentSchedule.semesterId}</p>
                        <p><strong>Thời gian áp dụng:</strong> {new Date(currentSchedule.effectiveDate).toLocaleDateString('vi-VN')} - {new Date(currentSchedule.endDate).toLocaleDateString('vi-VN')}</p>
                        <p><strong>Trạng thái:</strong> {currentSchedule.status}</p>
                    </div>
                )}
            </div>

            <table className="schedule-teacher-table">
                <thead>
                    <tr>
                        <th>Buổi</th>
                        <th>Tiết</th>
                        {daysOfWeek.map((day, index) => (
                            <th
                                style={{ backgroundColor: '#727cf5', color: 'white' }}
                                key={index}
                                className={index % 2 === 0 ? 'even-column' : 'odd-column'}
                            >
                                {day}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {shifts.map((shift) =>
                        shift.periods.map((period, index) => (
                            <tr key={`${shift.name}-${period}`}>
                                {index === 0 && (
                                    <td rowSpan={shift.periods.length} className="shift-cell">
                                        {shift.name}
                                    </td>
                                )}
                                <td>{period}</td>
                                {daysOfWeek.map((day, idx) => {
                                    const scheduleInfo = getSchedule(day, shift.name, period);
                                    return (
                                        <td
                                            key={idx}
                                            className={`${idx % 2 === 0 ? 'even-column' : 'odd-column'} ${scheduleInfo.isSubstitute ? 'substitute-class' : ''}`}
                                        >
                                            {scheduleInfo.content || ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ScheduleTeacher;