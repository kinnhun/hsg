import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Button, Space, Tag, Input, Typography } from 'antd';
import { SearchOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import './ReviewList.scss';

const { Title } = Typography;

const ReviewList = () => {
    const [lessonPlans, setLessonPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();
    const pageSize = 10;

    const fetchProcessingPlans = async (page) => {
        try {
            const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
            const response = await axios.get(
                `https://localhost:8386/api/LessonPlan/filter-by-status?status=Chờ duyệt&pageNumber=${page}&pageSize=${pageSize}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            setLessonPlans(response.data.lessonPlans);
            setLoading(false);
        } catch (error) {
            console.error('Lỗi khi tải danh sách:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProcessingPlans(1);
    }, []);

    const handleReviewClick = (planId) => {
        navigate(`/system/review-detail/${planId}`);
    };

    const handlePreviewClick = (planId) => {
        // Thêm logic xem trước ở đây
        console.log('Xem trước:', planId);
    };

    const filteredPlans = lessonPlans.filter(plan =>
        plan.teacherName?.toLowerCase().includes(searchText.toLowerCase()) ||
        plan.subjectName?.toLowerCase().includes(searchText.toLowerCase()) ||
        plan.planContent?.toLowerCase().includes(searchText.toLowerCase()) ||
        plan.planId.toString().includes(searchText)
    );

    const columns = [
        {
            title: 'ID',
            dataIndex: 'planId',
            key: 'planId',
            width: 80,
        },
        {
            title: 'Giáo viên',
            dataIndex: 'teacherName',
            key: 'teacherName',
            render: (text) => (
                <Tag color="blue">{text}</Tag>
            ),
        },
        {
            title: 'Môn học',
            dataIndex: 'subjectName',
            key: 'subjectName',
            render: (text) => (
                <Tag color="cyan">{text}</Tag>
            ),
        },
        {
            title: 'Nội dung',
            dataIndex: 'planContent',
            key: 'planContent',
            width: '30%',
            render: (text) => (
                <div className="content-ellipsis">{text}</div>
            ),
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'submittedDate',
            key: 'submittedDate',
            render: (date) => (
                <span>{dayjs(date).format('DD/MM/YYYY HH:mm')}</span>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">

                    <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleReviewClick(record.planId)}
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    >
                        Phê duyệt
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="review-list-container">
            <Card className="review-list-card">
                <div className="review-list-header">
                    <Title level={2}>Danh sách kế hoạch cần phê duyệt</Title>
                    <Input
                        placeholder="Tìm kiếm..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 300, marginBottom: 16 }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredPlans}
                    rowKey="planId"
                    loading={loading}
                    pagination={{
                        pageSize: pageSize,
                        showSizeChanger: false,
                        showTotal: (total) => `Tổng số ${total} kế hoạch`,
                    }}
                    className="review-table"
                />
            </Card>
        </div>
    );
};

export default ReviewList;