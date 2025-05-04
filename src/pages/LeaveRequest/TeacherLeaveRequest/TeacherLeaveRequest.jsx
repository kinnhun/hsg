import React, { useState } from 'react';
import { Table, Tag, Button, Input, Select } from 'antd';
import dayjs from 'dayjs';
import { Link, Navigate } from 'react-router-dom';
import { useGetLeaveRequestByTeacherId } from '../../../services/leaveRequest/queries';
import { jwtDecode } from 'jwt-decode';

const statusOptions = [
  { value: 'All', label: 'Tất cả trạng thái' },
  { value: 'Chờ Duyệt', label: 'Đang chờ duyệt' },
  { value: 'Đã Duyệt', label: 'Đã phê duyệt' },
  { value: 'Từ Chối', label: 'Đã từ chối' },
];

const TeacherLeaveRequest = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // const teacherId = 1;

  let teacherId;
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  const decoded = jwtDecode(token);
  if (decoded.exp * 1000 < Date.now()) {
    console.warn('Token expired');
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
  teacherId = decoded.teacherId || decoded.id || decoded.userId || 1;






  const { data: leaveRequestsData, isLoading, error } = useGetLeaveRequestByTeacherId(teacherId);

  if (error) {
    console.error('Error fetching leave requests:', error);
  }

  const filteredRequests = (leaveRequestsData || []).filter(request => {
    const statusMatch = statusFilter === 'All' || request.status === statusFilter;
    const searchTermMatch = !searchTerm || [
      request.reason,
      request.requestId?.toString(),
      request.requestDate && dayjs(request.requestDate).format('DD/MM/YYYY'),
      request.leaveFromDate && dayjs(request.leaveFromDate).format('DD/MM/YYYY'),
      request.leaveToDate && dayjs(request.leaveToDate).format('DD/MM/YYYY')
    ].some(field => field?.toLowerCase?.()?.includes?.(searchTerm.toLowerCase()));

    return statusMatch && searchTermMatch;
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'requestId',
      key: 'requestId',
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'requestDate',
      key: 'requestDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày bắt đầu nghỉ',
      dataIndex: 'leaveFromDate',
      key: 'leaveFromDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày kết thúc nghỉ',
      dataIndex: 'leaveToDate',
      key: 'leaveToDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        let text = status;
        if (status === 'Chờ Duyệt') {
          color = 'gold';
          text = 'Đang chờ duyệt';
        } else if (status === 'Đã Duyệt') {
          color = 'green';
          text = 'Đã phê duyệt';
        } else if (status === 'Từ chối') {
          color = 'red';
          text = 'Đã từ chối';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    }, {
      title: 'Xem chi tiết',
      key: 'action',
      render: (_, record) => (
        <Link to={`/teacher/leave-request/${record.requestId}`}>
          <Button type="primary" size="small">
            Xem chi tiết
          </Button>
        </Link>
      ),
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ margin: 0 }}>Yêu cầu nghỉ phép của giáo viên</h1>
        <Link to="/teacher/leave-request/create">
          <Button type="primary">
            Tạo yêu cầu nghỉ phép mới
          </Button>
        </Link>
      </div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <Select
          value={statusFilter}
          style={{ width: 200 }}
          onChange={(value) => setStatusFilter(value)}
          options={statusOptions}
        />
        <Input.Search
          placeholder="Tìm kiếm theo ID, lý do, ngày..."
          allowClear
          onSearch={(value) => setSearchTerm(value)}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
          value={searchTerm}
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredRequests}
        loading={isLoading}
        rowKey="requestId"
        pagination={{
          pageSize: 10,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`,
        }}
      />
    </div>
  );
};

export default TeacherLeaveRequest;
