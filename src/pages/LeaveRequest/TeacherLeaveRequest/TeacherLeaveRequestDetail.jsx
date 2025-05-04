import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Spin, Alert, Space, Modal } from 'antd';
import dayjs from 'dayjs';
import { useGetLeaveRequestById } from '../../../services/leaveRequest/queries';
import { useDeleteLeaveRequest } from '../../../services/leaveRequest/mutation';

const TeacherLeaveRequestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { data: leaveRequest, isLoading, error } = useGetLeaveRequestById(id);

    const getStatusDisplay = (status) => {
        switch (status) {
            case 'Chờ Duyệt':
                return <span style={{ color: 'orange', fontWeight: 'bold' }}>Đang chờ duyệt</span>;
            case 'Đã Duyệt':
                return <span style={{ color: 'green', fontWeight: 'bold' }}>Đã phê duyệt</span>;
            case 'Từ Chối':
                return <span style={{ color: 'red', fontWeight: 'bold' }}>Đã từ chối</span>;
            default:
                return status;
        }
    };

    // Add these functions to handle modal
    const showDeleteConfirm = () => {
        setIsDeleteModalOpen(true);
    };

    const deleteLeaveRequestMutation = useDeleteLeaveRequest();

    const handleDeleteConfirm = () => {
        deleteLeaveRequestMutation.mutate(id, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                navigate('/teacher/leave-request');
            }
        });
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
    };

    if (isLoading) {
        return <div style={{ padding: '50px', textAlign: 'center' }}><Spin size="large" tip="Đang tải..." /></div>;
    }

    if (error) {
        return (
            <div style={{ padding: '24px' }}>
                <Alert
                    message="Không tìm thấy thông tin"
                    description="Không thể tải thông tin yêu cầu nghỉ phép hoặc yêu cầu không tồn tại."
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title={<h2>Chi tiết yêu cầu nghỉ phép</h2>}
                extra={
                    <Space>
                        {leaveRequest.status === 'Chờ Duyệt' && (
                            <Button
                                type="primary"
                                danger
                                onClick={showDeleteConfirm}
                            >
                                Xóa yêu cầu
                            </Button>
                        )}
                        <Button onClick={() => navigate('/teacher/leave-request')}>
                            Quay lại danh sách
                        </Button>
                    </Space>
                }
            >
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="ID Yêu cầu">{leaveRequest.requestId}</Descriptions.Item>
                    <Descriptions.Item label="Ngày yêu cầu">
                        {dayjs(leaveRequest.requestDate).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày bắt đầu nghỉ">
                        {dayjs(leaveRequest.leaveFromDate).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày kết thúc nghỉ">
                        {dayjs(leaveRequest.leaveToDate).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Lý do">
                        {leaveRequest.reason}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ghi chú của hiệu trưởng phê duyệt">
                        {leaveRequest.comment !== null && leaveRequest.comment !== undefined
                            ? leaveRequest.comment
                            : 'Không có ghi chú'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        {getStatusDisplay(leaveRequest.status)}
                    </Descriptions.Item>
                    {leaveRequest.feedback && (
                        <Descriptions.Item label="Phản hồi từ quản lý">
                            {leaveRequest.feedback}
                        </Descriptions.Item>
                    )}
                </Descriptions>
            </Card>

            <Modal
                title="Xác nhận xóa"
                open={isDeleteModalOpen}
                onOk={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <p>Bạn có chắc chắn muốn xóa yêu cầu nghỉ phép này không?</p>
            </Modal>
        </div>
    );
};

export default TeacherLeaveRequestDetail;
