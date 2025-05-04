import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, message, Steps, Form, Input, Select, Spin, Alert } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import SubstituteTeacherAssignment from './SubstituteTeacherAssignment';
import { useTeachers } from '../../../services/teacher/queries';
import { useGetLeaveRequestById } from '../../../services/leaveRequest/queries';
import { useUpdateLeaveRequest } from '../../../services/leaveRequest/mutation';

const { Option } = Select;

const LeaveRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const { data: teachersData, isLoading: loadingTeachers } = useTeachers();
  const { data: leaveRequest, isLoading: loading, error } = useGetLeaveRequestById(id);
  const teachers = teachersData?.teachers || [];

  useEffect(() => {
    if (leaveRequest) {
      if (leaveRequest.status === 'Đã Duyệt') {
        // Nếu đã Đã Duyệt, có thể xem chi tiết (0) hoặc phân công (2)
        // Mặc định nên ở bước chi tiết khi mới vào trang
        // setCurrentStep(2); // Hoặc để người dùng tự chuyển
      } else if (leaveRequest.status === 'Chờ Duyệt') {
        // Nếu pending, có thể xem chi tiết (0) hoặc cập nhật (1)
        // Mặc định ở bước chi tiết
      } else { // Từ Chối
        // Nếu Từ Chối, chỉ có thể xem chi tiết (0)
        setCurrentStep(0);
      }
    }
  }, [leaveRequest]);

  // Remove fetchLeaveRequestDetail function and its useEffect

  // Remove fetchTeachers function as it's replaced by useTeachers hook

  const getTeacherDisplayInfo = (teacherId) => {
    if (loadingTeachers) {
      return <Spin size="small" />;
    }
    const teacher = teachers.find(t => t.teacherId === teacherId);
    if (teacher) {
      return (
        <>
          <div><strong>{teacher.fullName}</strong> (ID: {teacherId})</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Ngày sinh: {teacher.dob ? dayjs(teacher.dob).format('DD/MM/YYYY') : 'N/A'}
          </div>
        </>
      );
    }
    // Nếu không tìm thấy giáo viên trong danh sách đã tải
    return `ID: ${teacherId} (Không tìm thấy thông tin chi tiết)`;
  };

  const updateMutation = useUpdateLeaveRequest();

  const handleUpdateStatus = async (values) => {
    try {
      const updatedRequest = {
        requestId: parseInt(id),
        comment: values.comment,
        status: values.status === 'Đã Duyệt' ? 'Đã Duyệt' : 'Từ Chối'
      };

      await updateMutation.mutateAsync({ id, data: updatedRequest });

      if (updatedRequest.status === 'Đã Duyệt') {
        setCurrentStep(2);
      } else {
        setCurrentStep(0);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật yêu cầu nghỉ phép:', error);
    }
  };

  const steps = [
    {
      title: 'Xem chi tiết',
      content: (
        <Card loading={loading && !leaveRequest}>
          {leaveRequest && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="ID Yêu cầu">{leaveRequest.requestId}</Descriptions.Item>
              <Descriptions.Item label="Giáo viên">
                {getTeacherDisplayInfo(leaveRequest.teacherId)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày yêu cầu">
                {leaveRequest.requestDate ? dayjs(leaveRequest.requestDate).format('DD/MM/YYYY') : ''}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu nghỉ">
                {leaveRequest.leaveFromDate ? dayjs(leaveRequest.leaveFromDate).format('DD/MM/YYYY') : ''}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày kết thúc nghỉ">
                {leaveRequest.leaveToDate ? dayjs(leaveRequest.leaveToDate).format('DD/MM/YYYY') : ''}
              </Descriptions.Item>
              <Descriptions.Item label="Lý do">{leaveRequest.reason}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <span style={{
                  color: leaveRequest.status === 'Chờ Duyệt' ? 'orange'
                    : leaveRequest.status === 'Đã Duyệt' ? 'green'
                      : 'red',
                  fontWeight: 'bold'
                }}>
                  {leaveRequest.status === 'Chờ Duyệt' ? 'Đang chờ duyệt'
                    : leaveRequest.status === 'Đã Duyệt' ? 'Đã phê duyệt'
                      : 'Đã từ chối'}
                </span>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Card>
      )
    },
    {
      title: 'Cập nhật trạng thái',
      disabled: leaveRequest?.status !== 'Chờ Duyệt',
      content: (
        <Card loading={loading}>
          {leaveRequest?.status === 'Chờ Duyệt' || 'Từ Chối' ? (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateStatus}
              initialValues={{
                status: 'Đã Duyệt',
                comment: leaveRequest?.comment
              }}
              key={leaveRequest?.requestId}
            >
              <Form.Item
                name="status"
                label="Hành động"
                rules={[{ required: true, message: 'Vui lòng chọn hành động!' }]}
              >
                <Select>
                  <Option value="Đã Duyệt">Phê duyệt</Option>
                  <Option value="Từ Chối">Từ chối</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="comment"
                label="Lý do / Ghi chú cập nhật"
                rules={[{ required: true, message: 'Vui lòng nhập lý do/ghi chú!' }]}
              >
                <Input.TextArea rows={4} placeholder="Nhập lý do phê duyệt hoặc từ chối..." />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Xác nhận
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <Alert
              message={`Không thể cập nhật yêu cầu này.`}
              description={`Yêu cầu đang ở trạng thái "${leaveRequest?.status}". Chỉ có thể cập nhật yêu cầu đang ở trạng thái "Chờ Duyệt".`}
              type="warning"
              showIcon
            />
          )}
        </Card>
      )
    },
    {
      title: 'Phân công dạy thay',
      disabled: leaveRequest?.status !== 'Đã Duyệt',
      content: (
        <Card loading={loading}>
          {leaveRequest?.status === 'Đã Duyệt' ? (
            <SubstituteTeacherAssignment leaveRequest={leaveRequest} allTeachers={teachers} />
          ) : (
            <Alert
              message={`Chưa thể phân công dạy thay.`}
              description={leaveRequest?.status === 'Từ Chối'
                ? 'Yêu cầu đã bị từ chối.'
                : 'Yêu cầu cần được phê duyệt trước khi phân công.'}
              type="info"
              showIcon
            />
          )}
        </Card>
      )
    }
  ];

  if (loading && !leaveRequest) {
    return <div style={{ padding: '50px', textAlign: 'center' }}><Spin size="large" tip="Đang tải chi tiết yêu cầu..." /></div>;
  }
  if (!loading && !leaveRequest) {
    return <div style={{ padding: '24px' }}><Alert message="Lỗi" description="Không tìm thấy yêu cầu nghỉ phép hoặc có lỗi xảy ra khi tải dữ liệu." type="error" showIcon /></div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>
        Chi tiết yêu cầu nghỉ phép
        {leaveRequest && teachers.find(t => t.teacherId === leaveRequest.teacherId)
          ? ` - ${teachers.find(t => t.teacherId === leaveRequest.teacherId).fullName}`
          : leaveRequest ? ` (ID: ${leaveRequest.teacherId})` : ''}
      </h1>

      <Steps
        current={currentStep}
        items={steps.map(item => ({ title: item.title, disabled: item.disabled }))}
        onChange={setCurrentStep}
        style={{ marginBottom: '24px' }}
      />

      <div style={{ marginTop: '24px' }}>
        {steps[currentStep].content}
      </div>

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
        <div>

          {/* Nút Về danh sách (Back to List) - giữ nguyên */}
          <Button style={{ marginLeft: '8px' }} onClick={() => navigate('/system/leave-request')} disabled={loading}>
            Về danh sách
          </Button>
        </div>
        <div>
          {/* Nút Tiếp theo (Next Step) */}
          {currentStep < steps.length - 1 && (
            <Button
              type="primary"
              onClick={() => setCurrentStep(currentStep + 1)}
              style={{ marginLeft: '8px' }}
            >
              Tiếp theo
            </Button>
          )}
          {/* Nút Quay lại (Previous Step) */}
          {currentStep > 0 && (
            <Button onClick={() => setCurrentStep(currentStep - 1)} disabled={loading}>
              Quay lại
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestDetail;