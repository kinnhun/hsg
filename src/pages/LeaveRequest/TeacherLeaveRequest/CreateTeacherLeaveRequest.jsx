import React, { useState } from 'react';
import { Form, Input, Button, DatePicker } from 'antd';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import './CreateTeacherLeaveRequest.scss';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useCreateLeaveRequest } from '../../../services/leaveRequest/mutation';
import { jwtDecode } from 'jwt-decode';
import toast from "react-hot-toast";

dayjs.extend(isSameOrAfter);

const CreateTeacherLeaveRequest = () => {
  const [form] = Form.useForm();
  const [startDate, setStartDate] = useState(null);
  const navigate = useNavigate();
  const createLeaveRequestMutation = useCreateLeaveRequest();

  const handleStartDateChange = (date) => {
    setStartDate(date);
    form.setFieldsValue({ leaveToDate: null });
  };

  const disabledStartDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  const disabledEndDate = (current) => {
    if (!startDate) {
      return true;
    }
    return current && current < startDate.startOf('day');
  };

  const onFinish = (values) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token not found');
      return;
    }
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      console.warn('Token expired');
      localStorage.removeItem('token');
      return <Navigate to="/login" replace />;
    }
    const teacherId = decoded.teacherId || decoded.id || decoded.userId || 1;

    const payload = {
      teacherId,
      leaveFromDate: values.leaveFromDate.format('YYYY-MM-DD'),
      leaveToDate: values.leaveToDate.format('YYYY-MM-DD'),
      reason: values.reason,
    };

    createLeaveRequestMutation.mutate(payload, {
      onSuccess: () => {
        form.resetFields();
        setStartDate(null);
        setTimeout(() => {
          navigate('/teacher/leave-request');
        }, 1500);
      },
    });
  };

  return (
    <div className="create-teacher-leave-request">
      <h1>Tạo yêu cầu nghỉ phép mới</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <div className="date-picker-row">
          <Form.Item
            label="Ngày bắt đầu nghỉ"
            name="leaveFromDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              disabledDate={disabledStartDate}
              onChange={handleStartDateChange}
              placeholder="Chọn ngày bắt đầu"
            />
          </Form.Item>

          <Form.Item
            label="Ngày kết thúc nghỉ"
            name="leaveToDate"
            rules={[
              { required: true, message: 'Vui lòng chọn ngày kết thúc!' },
            ]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              disabledDate={disabledEndDate}
              disabled={!startDate}
              placeholder="Chọn ngày kết thúc"
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Lý do"
          name="reason"
          rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}
        >
          <Input.TextArea rows={4} placeholder="Nhập lý do nghỉ phép" />
        </Form.Item>

        <Form.Item>
          <div className="button-row">
            <Button type="primary" htmlType="submit" loading={createLeaveRequestMutation.isPending}>
              Gửi yêu cầu
            </Button>
            <Link to="/teacher/leave-request">
              <Button type="default" disabled={createLeaveRequestMutation.isPending}>
                Quay lại
              </Button>
            </Link>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateTeacherLeaveRequest;
