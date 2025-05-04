import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Select, Button, message, Input, Checkbox } from 'antd';
import dayjs from 'dayjs';
import { useScheduleTeacher } from '../../../services/schedule/queries';
import { useTeachers } from '../../../services/teacher/queries';
import { useGetSubstituteTeachings, useCreateSubstituteTeaching } from '../../../services/schedule/queries';
import toast from "react-hot-toast";
import { getSubstituteTeachings } from "../../../services/schedule/api";
import { sendMailLeaveRequest } from './sendMailLeaveRequest'; // đường dẫn đúng

const { Option } = Select;

const getWeekdayName = (date) => {
  const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return weekdays[dayjs(date).day()];
};

const SubstituteTeacherAssignment = ({ leaveRequest }) => {
  const [loading, setLoading] = useState(false);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [form] = Form.useForm();
  const { data: teacherSchedule, isLoading: scheduleLoading } = useScheduleTeacher(leaveRequest?.teacherId);
  const { data: teachersData, isLoading: teachersLoading } = useTeachers();
  const [assignedTeachers, setAssignedTeachers] = useState({});


  const checkAssignedTeacher = async (timetableDetailId, originalTeacherId, date) => {
    try {
      const data = await getSubstituteTeachings(timetableDetailId, originalTeacherId, date);

      if (Array.isArray(data) && data.length > 0) {
        setAssignedTeachers(prev => ({
          ...prev,
          [timetableDetailId]: {
            substituteTeacherId: data[0].substituteTeacherId,
            note: data[0].note,
            isAssigned: true,
          },
        }));
      }
    } catch (error) {
      console.error('Error checking assigned teacher:', error);
    }
  };

  const { mutateAsync: createSubstitute } = useCreateSubstituteTeaching();

  // Thêm useEffect để kiểm tra giáo viên dạy thay cho mỗi lịch học
  useEffect(() => {
    if (!filteredSchedules.length || !leaveRequest?.teacherId) return;

    filteredSchedules.forEach(schedule => {
      checkAssignedTeacher(
        schedule.timetableDetailId,
        leaveRequest.teacherId,
        schedule.date
      );
    });
  }, [filteredSchedules, leaveRequest]);

  // Validate and create payload for API
  const createPayload = (record, teacherId, note) => ({
    timetableDetailId: Number(record.timetableDetailId),
    originalTeacherId: Number(leaveRequest.teacherId),
    substituteTeacherId: Number(teacherId),
    date: record.date,
    note: note || '',
  });

  // Save assignment via API
  const handleSaveAssignment = async (record, teacherId, note) => {
    try {
      const payload = createPayload(record, teacherId, note);

      // Validate payload
      const missingFields = Object.entries(payload).filter(([key, value]) => !value && key !== 'note');
      if (missingFields.length) {
        console.error('Missing required fields:', missingFields);
        message.error('Dữ liệu không hợp lệ, vui lòng kiểm tra lại!');
        return;
      }

      // Validate date
      const currentDate = dayjs().startOf('day');
      const assignmentDate = dayjs(payload.date);
      if (assignmentDate.isBefore(currentDate)) {
        console.error('Invalid date:', payload.date);
        message.error('Ngày dạy thay không thể là ngày trong quá khứ!');
        return;
      }

      await createSubstitute(payload);




      // Fetch lại dữ liệu sau khi lưu thành công
      await checkAssignedTeacher(
        record.timetableDetailId,
        leaveRequest.teacherId,
        record.date
      );
      console.log("checkAssignedTeacher", checkAssignedTeacher)

      toast.success('Phân công giáo viên dạy thay thành công!')
      message.success('Phân công giáo viên dạy thay thành công!');





      // sendmailLeaverequest




    } catch (error) {
      toast.error(`Giáo viên dạy thay không được trùng với giáo viên xin nghỉ`)
      console.error('Error saving assignment:', error);
      message.error(`Có lỗi khi lưu phân công: ${error.message}`);
    }



    await sendMailLeaveRequest(record, teacherId, note, schedule);

  };

  // Process schedules for display
  useEffect(() => {
    if (!teacherSchedule?.[0]?.details || !leaveRequest) return;

    const scheduleDetails = teacherSchedule[0].details;
    const startDate = dayjs(leaveRequest.leaveFromDate);
    const endDate = dayjs(leaveRequest.leaveToDate);
    const currentDate = dayjs().startOf('day');
    const schedules = [];

    let currentDateIterator = startDate;
    while (currentDateIterator.isSame(endDate, 'day') || currentDateIterator.isBefore(endDate, 'day')) {
      if (currentDateIterator.isBefore(currentDate)) {
        currentDateIterator = currentDateIterator.add(1, 'day');
        continue;
      }

      const weekday = getWeekdayName(currentDateIterator);
      const daySchedules = scheduleDetails.filter((schedule) => schedule.dayOfWeek === weekday);

      daySchedules.forEach((schedule) => {
        schedules.push({
          scheduleId: `${currentDateIterator.format('YYYY-MM-DD')}-${schedule.timetableDetailId}`,
          date: currentDateIterator.format('YYYY-MM-DD'),
          dayOfWeek: weekday,
          period: schedule.periodName,
          className: schedule.className,
          subject: schedule.subjectName,
          timetableDetailId: schedule.timetableDetailId,
        });
      });

      currentDateIterator = currentDateIterator.add(1, 'day');
    }

    setFilteredSchedules(schedules);
  }, [teacherSchedule, leaveRequest]);

  // Handle bulk assignment submission
  const handleAssignSubstitute = async (values) => {
    setLoading(true);
    try {
      const assignments = values.assignments || {};
      const notes = values.notes || {};

      await Promise.all(
        filteredSchedules.map(async (schedule) => {
          const teacherId = assignments[schedule.scheduleId];
          const note = notes[schedule.scheduleId];
          if (teacherId) {
            await handleSaveAssignment(schedule, teacherId, note);
          }
        })
      );

      // Fetch lại tất cả dữ liệu sau khi lưu hàng loạt thành công
      await Promise.all(
        filteredSchedules.map(schedule =>
          checkAssignedTeacher(
            schedule.timetableDetailId,
            leaveRequest.teacherId,
            schedule.date
          )
        )
      );

      toast.success('Lưu thành công')
      message.success('Đã lưu tất cả phân công thành công!');
      form.resetFields(['assignments', 'notes']);
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu phân công');
    } finally {
      setLoading(false);
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Đã phân công',
      key: 'assigned',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const isAssigned = assignedTeachers[record.timetableDetailId]?.isAssigned || false;
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px', // Tăng padding để checkbox nổi bật
              backgroundColor: isAssigned ? '#e6f4ff' : '#ffffff', // Nền xanh nhạt khi checked, trắng khi không checked
              borderRadius: '6px', // Bo góc container
              boxShadow: isAssigned ? '0 0 4px rgba(0, 80, 179, 0.2)' : 'none', // Bóng nhẹ khi checked
            }}
          >
            <Checkbox
              checked={isAssigned}
              disabled={true}
              style={{
                transform: 'scale(1.5)', // Phóng to checkbox để rõ hơn
                fontSize: '18px', // Tăng kích thước để phù hợp
                // Style cho toàn bộ checkbox
                ...(isAssigned
                  ? {
                    // Khi checked
                    border: 'none', // Loại bỏ viền mặc định
                    '--ant-checkbox-bg': '#0050b3', // Xanh dương đậm khi checked
                    '--ant-checkbox-border': '#0050b3',
                    '--ant-checkbox-shadow': '0 0 8px rgba(0, 80, 179, 0.5)', // Bóng nổi bật
                    // Nhắm vào .ant-checkbox-inner khi checked
                    '& .ant-checkbox-checked .ant-checkbox-inner': {
                      backgroundColor: 'var(--ant-checkbox-bg)', // Màu nền xanh dương
                      border: '2px solid var(--ant-checkbox-border)', // Viền đậm
                      boxShadow: 'var(--ant-checkbox-shadow)', // Bóng
                      borderRadius: '4px', // Bo góc nhẹ
                    },
                    '& .ant-checkbox-inner': {
                      border: '2px solid var(--ant-checkbox-border)', // Viền đậm khi checked
                    },
                    '& .ant-checkbox-disabled .ant-checkbox-inner': {
                      opacity: 1, // Đảm bảo không mờ khi disabled
                    },
                  }
                  : {
                    // Khi không checked
                    border: 'none',
                    '--ant-checkbox-bg': '#ffffff', // Nền trắng
                    '--ant-checkbox-border': '#bfbfbf', // Viền xám nhạt
                    '--ant-checkbox-shadow': 'none',
                    // Nhắm vào .ant-checkbox-inner khi không checked
                    '& .ant-checkbox-inner': {
                      backgroundColor: 'var(--ant-checkbox-bg)', // Nền trắng
                      border: '1px solid var(--ant-checkbox-border)', // Viền mỏng
                      borderRadius: '4px',
                    },
                    '& .ant-checkbox-disabled .ant-checkbox-inner': {
                      opacity: 0.7, // Mờ nhẹ khi disabled và không checked
                    },
                  }),
              }}
            />
          </div>
        );
      },
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (text, record) => `${dayjs(text).format('DD/MM/YYYY')} (${record.dayOfWeek})`,
    },
    { title: 'Tiết học', dataIndex: 'period', key: 'period' },
    { title: 'Lớp', dataIndex: 'className', key: 'className' },
    { title: 'Môn học', dataIndex: 'subject', key: 'subject' },
    {
      title: 'Giáo viên dạy thay',
      key: 'substituteTeacher',
      render: (_, record) => {
        const isAssigned = assignedTeachers[record.timetableDetailId]?.isAssigned;
        const assignedTeacherId = assignedTeachers[record.timetableDetailId]?.substituteTeacherId;

        if (isAssigned && assignedTeacherId) {
          const assignedTeacher = teachersData?.teachers?.find(
            teacher => teacher.teacherId === assignedTeacherId
          );
          return (
            <div>

              <Form.Item
                name={['assignments', record.scheduleId]}
                style={{ margin: 0 }}
                rules={[{ required: true, message: 'Vui lòng chọn giáo viên!' }]}
                initialValue={assignedTeacherId}
              >
                <Select
                  placeholder="Chọn giáo viên dạy thay"
                  loading={teachersLoading}
                  defaultValue={assignedTeacherId}
                >
                  {teachersData?.teachers?.map((teacher) => (
                    <Option key={teacher.teacherId} value={teacher.teacherId}>
                      {teacher.fullName} - {teacher.teacherId}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          );
        }

        return (
          <Form.Item
            name={['assignments', record.scheduleId]}
            style={{ margin: 0 }}
            rules={[{ required: true, message: 'Vui lòng chọn giáo viên!' }]}
          >
            <Select
              placeholder="Chọn giáo viên dạy thay"
              loading={teachersLoading}
            >
              {teachersData?.teachers?.map((teacher) => (
                <Option key={teacher.teacherId} value={teacher.teacherId}>
                  {teacher.fullName} - {teacher.teacherId}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );
      },
    },
    {
      title: 'Ghi chú',
      key: 'note',
      render: (_, record) => {
        const isAssigned = assignedTeachers[record.timetableDetailId]?.isAssigned;
        const assignedNote = assignedTeachers[record.timetableDetailId]?.note;

        if (isAssigned && assignedNote) {
          return (
            <div>
              <Form.Item
                name={['notes', record.scheduleId]}
                style={{ margin: 0 }}
                initialValue={assignedNote}
              >
                <Input.TextArea
                  placeholder="Nhập ghi chú"
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  defaultValue={assignedNote}
                />
              </Form.Item>
            </div>
          );
        }

        return (
          <Form.Item
            name={['notes', record.scheduleId]}
            style={{ margin: 0 }}
          >
            <Input.TextArea
              placeholder="Nhập ghi chú"
              autoSize={{ minRows: 1, maxRows: 3 }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: 'Lưu',
      key: 'save',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          loading={loading}
          onClick={async () => {
            const teacherId = form.getFieldValue(['assignments', record.scheduleId]);
            const note = form.getFieldValue(['notes', record.scheduleId]);
            if (!teacherId) {
              message.error('Vui lòng chọn giáo viên trước khi lưu!');
              return;
            }
            await handleSaveAssignment(record, teacherId, note);
          }}
        >
          Lưu
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card title="Thông tin lịch dạy cần thay thế" style={{ marginBottom: 16 }}>
        <p>
          <strong>Thời gian nghỉ: </strong>
          {dayjs(leaveRequest?.leaveFromDate).format('DD/MM/YYYY')} ({getWeekdayName(leaveRequest?.leaveFromDate)}) -{' '}
          {dayjs(leaveRequest?.leaveToDate).format('DD/MM/YYYY')} ({getWeekdayName(leaveRequest?.leaveToDate)})
        </p>
        {dayjs(leaveRequest?.leaveFromDate).isBefore(dayjs().startOf('day')) && (
          <p style={{ color: 'red' }}>
            <strong>Lưu ý:</strong> Một số ngày trong thời gian nghỉ đã qua, chỉ có thể phân công từ hôm nay trở đi.
          </p>
        )}
      </Card>

      <Card title="Phân công giáo viên dạy thay">
        <Form form={form} onFinish={handleAssignSubstitute}>
          <Table
            dataSource={filteredSchedules}
            columns={columns}
            rowKey="scheduleId"
            pagination={false}
            loading={scheduleLoading}
          />
        </Form>
      </Card>
    </div>
  );
};

export default SubstituteTeacherAssignment;
