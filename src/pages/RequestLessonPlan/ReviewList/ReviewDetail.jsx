import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Form,
    Input,
    Select,
    Button,
    Descriptions,
    Space,
    message,
    Divider,
    Typography,
    Empty
} from 'antd';
import {
    RollbackOutlined,
    CheckCircleOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import './ReviewDetail.scss';
import toast from "react-hot-toast";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

// Add this function at the top of the component, before the return statement
const ReviewDetail = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const getGoogleDriveEmbedUrl = (url) => {
        if (!url) return '';
        try {
            if (url.includes('drive.google.com')) {
                if (url.includes('/folders/')) {
                    const folderId = url.match(/\/folders\/([^?/]+)/)?.[1];
                    if (folderId) {
                        return `https://drive.google.com/embeddedfolderview?id=${folderId}`;
                    }
                } else if (url.includes('/file/d/')) {
                    const fileId = url.match(/\/file\/d\/([^/]+)/)?.[1];
                    if (fileId) {
                        return `https://drive.google.com/file/d/${fileId}/preview`;
                    }
                }
            }
            return url;
        } catch (error) {
            console.error('Error parsing Google Drive URL:', error);
            return '';
        }
    };

    useEffect(() => {
        fetchPlanDetail();
    }, []);


    const fetchPlanDetail = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
            const response = await axios.get(
                `https://localhost:8386/api/LessonPlan/${planId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            console.log("planId", planId)
            console.log(response.data)
            setPlan(response.data);
        } catch (error) {
            console.error('Lỗi khi tải chi tiết:', error);
            message.error('Không thể tải Thông tin chi tiết ');
        } finally {
            setLoading(false);
        }
    };



    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');

            const response = await axios.post(
                'https://localhost:8386/api/LessonPlan/review',
                {
                    planId: parseInt(planId),
                    status: values.status === 'Approved' ? 'Đã duyệt' : 'Từ chối',
                    feedback: values.feedback
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                toast.success('Phê duyệt kế hoạch thành công!', {
                    duration: 2000
                });
                // Add timeout to ensure navigation happens after toast
                setTimeout(() => {
                    navigate('/system/lesson-plan');
                }, 2100); // Slightly longer than toast duration
            }
        } catch (error) {
            console.error('Lỗi khi phê duyệt:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi phê duyệt');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="review-detail-container">
            <Card
                loading={loading}
                className="review-detail-card"
                title={
                    <Title level={2}>
                        <FileTextOutlined /> Chi tiết kế hoạch giảng dạy
                    </Title>
                }
            >
                {plan && (
                    <>
                        <div className="plan-info-section">
                            <Descriptions
                                bordered
                                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                            >
                                <Descriptions.Item label="ID kế hoạch">
                                    {plan.planId}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tiêu đề">
                                    {plan.title}
                                </Descriptions.Item>
                                <Descriptions.Item label="Giáo viên">
                                    {plan.teacherName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Môn học">
                                    {plan.subjectName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    {plan.status}
                                </Descriptions.Item>
                                <Descriptions.Item label="Người phê duyệt">
                                    {plan.reviewerName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày bắt đầu">
                                    {dayjs(plan.startDate).format('DD/MM/YYYY')}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày kết thúc">
                                    {dayjs(plan.endDate).format('DD/MM/YYYY')}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày nộp">
                                    {dayjs(plan.submittedDate).format('DD/MM/YYYY HH:mm')}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày phê duyệt">
                                    {plan.reviewedDate ? dayjs(plan.reviewedDate).format('DD/MM/YYYY HH:mm') : 'Chưa phê duyệt'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Nội dung kế hoạch" span={2}>
                                    {plan.planContent}
                                </Descriptions.Item>
                                {plan.feedback && (
                                    <Descriptions.Item label="Phản hồi trước đó" span={2}>
                                        {plan.feedback}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </div>

                        <Divider />

                        <div className="attachment-preview-section">
                            <Title level={3}>
                                <FileTextOutlined /> File đính kèm
                            </Title>
                            <div className="attachment-container">
                                {plan.attachmentUrl ? (
                                    <div className="preview-wrapper">
                                        <iframe
                                            src={getGoogleDriveEmbedUrl(plan.attachmentUrl)}
                                            title="File Preview"
                                            className="file-preview"
                                            width="100%"
                                            height="600px"
                                            frameBorder="0"
                                            allowFullScreen
                                            allow="autoplay"
                                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                        />
                                        <Button
                                            type="primary"
                                            onClick={() => window.open(plan.attachmentUrl, '_blank')}
                                            className="open-new-tab-button"
                                        >
                                            Mở trong tab mới
                                        </Button>
                                    </div>
                                ) : (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="Không có file đính kèm"
                                    />
                                )}
                            </div>
                        </div>

                        <Divider />

                        <div className="review-form-section">
                            <Title level={3}>Phê duyệt kế hoạch</Title>
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleSubmit}
                                className="review-form"
                            >
                                <Form.Item
                                    name="status"
                                    label="Trạng thái"
                                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                                >
                                    <Select placeholder="Chọn trạng thái">
                                        <Option value="Approved">Phê duyệt</Option>
                                        <Option value="Rejected">Từ chối</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="feedback"
                                    label="Phản hồi"
                                    rules={[{ required: true, message: 'Vui lòng nhập phản hồi!' }]}
                                >
                                    <TextArea
                                        rows={4}
                                        placeholder="Nhập phản hồi của bạn..."
                                    />
                                </Form.Item>

                                <Form.Item>
                                    <Space size="middle" className="form-buttons">
                                        <Button
                                            icon={<RollbackOutlined />}
                                            onClick={() => navigate(-1)}
                                        >
                                            Quay lại
                                        </Button>
                                        <Button
                                            type="primary"
                                            icon={<CheckCircleOutlined />}
                                            htmlType="submit"
                                            loading={submitting}
                                        >
                                            Xác nhận phê duyệt
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};

export default ReviewDetail;