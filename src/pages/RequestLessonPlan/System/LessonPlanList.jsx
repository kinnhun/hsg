import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LessonPlanList.scss';
import { Table, Space, Tag, Select, Form, Card, Modal, Button, Descriptions } from 'antd';
import { Link } from 'react-router-dom';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Input } from 'antd';
import toast from 'react-hot-toast';

const { Option } = Select;

const LessonPlanList = () => {
    const [lessonPlans, setLessonPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const pageSize = 10;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
    const [reviewForm] = Form.useForm();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const fetchLessonPlans = async (page, status) => {
        try {
            const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
            const url = status === 'All'
                ? `https://localhost:8386/api/LessonPlan/all?pageNumber=${page}&pageSize=${pageSize}`
                : `https://localhost:8386/api/LessonPlan/filter-by-status?status=${status}&pageNumber=${page}&pageSize=${pageSize}`;

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setLessonPlans(response.data.lessonPlans);
            setTotalPages(Math.ceil(response.data.totalCount / pageSize));
            setLoading(false);
        } catch (error) {
            console.error('Lỗi khi tải danh sách:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLessonPlans(currentPage, selectedStatus);
    }, [currentPage, selectedStatus]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Chờ duyệt':
                return 'status-processing';
            case 'Đã duyệt':
                return 'status-approved';
            case 'Từ chối':
                return 'status-rejected';
            default:
                return '';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Chờ duyệt':
                return 'Đang xử lý';
            case 'Đã duyệt':
                return 'Đã duyệt';
            case 'Từ chối':
                return 'Từ chối';
            default:
                return status;
        }
    };
    const filteredLessonPlans = lessonPlans.filter(plan => {
        const searchStr = searchTerm.toLowerCase();
        return (
            plan.planId.toString().includes(searchStr) ||
            plan.teacherName?.toLowerCase().includes(searchStr) ||
            plan.subjectName?.toLowerCase().includes(searchStr) ||
            plan.planContent?.toLowerCase().includes(searchStr) ||
            plan.reviewerName?.toLowerCase().includes(searchStr) ||
            plan.feedback?.toLowerCase().includes(searchStr)
        );
    });

    const showDetailModal = (record) => {
        setSelectedRequest(record);
        setIsModalVisible(true);
    };

    const DetailModal = () => (
        <Modal
            title="Chi tiết giáo án"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            width={1000}
            style={{
                top: 20,
                maxHeight: 'calc(100vh - 40px)',
                overflow: 'auto'
            }}
            footer={[
                <Button key="close" onClick={() => setIsModalVisible(false)}>
                    Đóng
                </Button>
            ]}
        >
            {selectedRequest && (
                <div className="lesson-plan-detail">
                    <div className="detail-section">
                        <h2>Thông tin chi tiết </h2>
                        <Card bordered={false}>
                            <Descriptions bordered column={2}>
                                <Descriptions.Item label="ID Kế hoạch" span={2}>
                                    {selectedRequest.planId}
                                </Descriptions.Item>
                                <Descriptions.Item label="Giáo viên" span={2}>
                                    {selectedRequest.teacherName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Môn học" span={2}>
                                    {selectedRequest.subjectName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Nội dung" span={2}>
                                    {selectedRequest.planContent}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    <Tag className={`status-${selectedRequest.status.toLowerCase().replace(' ', '-')}`}>
                                        {getStatusText(selectedRequest.status)}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày nộp">
                                    {formatDate(selectedRequest.submittedDate)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Người duyệt">
                                    {selectedRequest.reviewerName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày duyệt">
                                    {formatDate(selectedRequest.reviewedDate)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Phản hồi">
                                    {selectedRequest.feedback || 'Chưa có phản hồi'}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </div>

                    {selectedRequest.attachmentUrl && (
                        <div className="attachment-section">
                            <h2>File đính kèm</h2>
                            <div className="file-preview">
                                <iframe
                                    src={getGoogleDriveEmbedUrl(selectedRequest.attachmentUrl)}
                                    title="File đính kèm"
                                    width="100%"
                                    height="600px"
                                    style={{
                                        border: '1px solid #d9d9d9',
                                        borderRadius: '4px'
                                    }}
                                    frameBorder="0"
                                    allowFullScreen
                                    allow="autoplay"
                                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );

    const columns = [
        {
            title: 'ID',
            dataIndex: 'planId',
            key: 'planId',
        },
        {
            title: 'Giáo viên',
            dataIndex: 'teacherName',
            key: 'teacherName',
        },
        {
            title: 'Môn học',
            dataIndex: 'subjectName',
            key: 'subjectName',
        },

        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span className={`status-${status.toLowerCase()} ${getStatusClass(status)}`}>
                    {getStatusText(status)}
                </span>
            ),
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'submittedDate',
            key: 'submittedDate',
            render: (date) => formatDate(date),
        },
        {
            title: 'Người duyệt',
            dataIndex: 'reviewerName',
            key: 'reviewerName',
        },
        {
            title: 'Ngày duyệt',
            dataIndex: 'reviewedDate',
            key: 'reviewedDate',
            render: (date) => formatDate(date),
        },
        {
            title: 'Phản hồi',
            dataIndex: 'feedback',
            key: 'feedback',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => showDetailModal(record)}
                    >
                        Xem chi tiết
                    </Button>

                    <Button
                        type="primary"
                        onClick={() => {
                            setSelectedPlan(record);
                            setIsReviewModalVisible(true);
                        }}
                    >
                        Phê duyệt
                    </Button>


                </Space>
            ),
        },
    ];

    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    const getGoogleDriveEmbedUrl = (url) => {
        if (!url) return '';

        if (url.includes('drive.google.com')) {
            // Handle folder URLs
            if (url.includes('/folders/')) {
                const folderId = url.match(/\/folders\/([^?/]+)/)?.[1];
                if (folderId) {
                    return `https://drive.google.com/embeddedfolderview?id=${folderId}#list`;
                }
            }
            // Handle file URLs
            else if (url.includes('/file/d/')) {
                const fileId = url.match(/\/file\/d\/([^/]+)/)?.[1];
                if (fileId) {
                    return `https://drive.google.com/file/d/${fileId}/preview`;
                }
            }
        }
        return url;
    };


    const ReviewModal = () => (
        <Modal
            title="Phê duyệt kế hoạch giáo án"
            open={isReviewModalVisible}
            onCancel={() => {
                setIsReviewModalVisible(false);
                reviewForm.resetFields();
            }}
            footer={null}
        >
            <Form
                form={reviewForm}
                onFinish={handleReview}
                layout="vertical"
            >
                <Form.Item
                    name="status"
                    label="Trạng thái"
                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                >
                    <Select>
                        <Option value="Đã duyệt">Phê duyệt</Option>
                        <Option value="Từ chối">Từ chối</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="feedback"
                    label="Phản hồi"
                    rules={[{ required: true, message: 'Vui lòng nhập phản hồi' }]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            Xác nhận
                        </Button>
                        <Button onClick={() => {
                            setIsReviewModalVisible(false);
                            reviewForm.resetFields();
                        }}>
                            Hủy
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );

    const handleReview = async (values) => {
        try {
            const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
            await axios.post('https://localhost:8386/api/LessonPlan/review', {
                planId: selectedPlan.planId,
                status: values.status,
                feedback: values.feedback
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            toast.success('Cập nhật trạng thái thành công');
            setIsReviewModalVisible(false);
            reviewForm.resetFields();
            fetchLessonPlans(currentPage, selectedStatus);
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Đã xảy ra lỗi khi cập nhật';
            toast.error(errorMessage);
        }
    };
    return (
        <div className="lesson-plan-list">

            <h2>Danh sách phân công làm giáo án</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2></h2>
                <Link to="/teacher/lesson-plan/create">
                    <Button type="primary">
                        Tạo kế hoạch mới
                    </Button>
                </Link>
            </div>
            <div className="filters-section">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-container">
                    <select
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="All">Tất cả</option>
                        <option value="Chờ duyệt">Đang xử lý</option>
                        <option value="Đã duyệt">Đã duyệt</option>
                        <option value="Từ chối">Từ chối</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                <Table
                    columns={columns}
                    dataSource={filteredLessonPlans}
                    loading={loading}
                    rowKey="planId"
                    pagination={{
                        pageSize: pageSize,
                        total: totalPages * pageSize,
                        current: currentPage,
                        onChange: (page) => {
                            setCurrentPage(page);
                        },
                    }}
                />
            </div>

            <DetailModal />
            <ReviewModal />
        </div>
    );
};

export default LessonPlanList;
