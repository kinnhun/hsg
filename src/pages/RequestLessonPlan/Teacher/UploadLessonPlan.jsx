import React, { useState, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './UploadLessonPlan.scss';
import { useSubjects, useSemestersByAcademicYear } from '../../../services/common/queries';
import { useTeachersBySubject } from '../../../services/teacher/queries';
import { useCreateLessonPlan } from '../../../services/lessonPlan/mutations';

const INITIAL_FORM = {
    subjectId: '',
    semesterId: '',
    teacherId: '',
    title: '',
    planContent: '',
    startDate: '',
    endDate: '',
};

const FORM_FIELDS = [
    { name: 'title', label: 'Tiêu đề', type: 'text' },
    { name: 'planContent', label: 'Nội dung  ', type: 'textarea', rows: 4 },
];

const UploadLessonPlan = () => {
    const [form, setForm] = useState(INITIAL_FORM);
    const navigate = useNavigate();

    // Get teacherId from token
    const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
    const decodedTeacherId = useMemo(() => token && jwtDecode(token)?.teacherId, [token]);

    // Queries
    const { data: semesters, isLoading: semestersLoading } = useSemestersByAcademicYear(1);
    const { data: subjects, isLoading: subjectsLoading } = useSubjects();

    // Direct API call for teachers by subject
    const [teachersBySubject, setTeachersBySubject] = useState(null);
    const [teachersLoading, setTeachersLoading] = useState(false);

    const fetchTeachersBySubject = async (subjectId) => {
        if (!subjectId) return;

        setTeachersLoading(true);
        try {
            const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
            const response = await fetch(`https://localhost:8386/api/TeacherSubject/${subjectId}`, {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setTeachersBySubject([data]); // Wrap in array since the API returns a single object
        } catch (error) {
            console.error('Error fetching teachers:', error);
            toast.error('Không thể tải danh sách giáo viên');
        } finally {
            setTeachersLoading(false);
        }
    };

    // Event Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'subjectId') {
            const numericValue = parseInt(value);
            setForm(prev => ({
                ...prev,
                [name]: numericValue,
                teacherId: '' // Reset teacherId when subject changes
            }));
            fetchTeachersBySubject(numericValue);
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const createLessonPlanMutation = useCreateLessonPlan();



    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token || !decodedTeacherId) {
            toast.error('Vui lòng đăng nhập để tiếp tục!');
            return;
        }

        // Validate dates
        const startDate = new Date(form.startDate);
        const endDate = new Date(form.endDate);
        if (startDate >= endDate) {
            toast.error('Ngày kết thúc phải sau ngày bắt đầu');
            return;
        }

        const payload = {
            teacherId: parseInt(form.teacherId), // Use the selected teacherId from form
            subjectId: parseInt(form.subjectId),
            semesterId: parseInt(form.semesterId),
            title: form.title.trim(),
            planContent: form.planContent.trim(),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        };


        try {
            await createLessonPlanMutation.mutateAsync(payload);
            setForm(INITIAL_FORM);
            const toastId = toast.success('Tạo lịch phân công giáo án thành công!');
            setTimeout(() => {
                toast.dismiss(toastId);
                navigate(-1);
            }, 2100);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo giáo án');
        }
    };

    // Reusable Select Component
    const RenderSelect = ({ name, value, options, loading, placeholder, disabled }) => (
        <select
            name={name}
            value={value}
            onChange={handleChange}
            required
            disabled={loading || disabled}
        >
            <option value="">{placeholder}</option>
            {options?.map((option) => (
                <option key={option.id} value={option.id}>
                    {option.name}
                </option>
            ))}
        </select>
    );


    return (
        <div className="upload-lesson-plan">
            <h1>Phân công làm giáo án</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <div className="form-field">
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label>Môn học:</label>
                                <select
                                    name="subjectId"
                                    value={form.subjectId}
                                    onChange={handleChange}
                                    required
                                    disabled={subjectsLoading}
                                >
                                    <option value="">Chọn môn học</option>
                                    {subjects?.map(subject => (
                                        <option key={subject.subjectID} value={subject.subjectID}>
                                            {subject.subjectName}--{subject.subjectID}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label>Chọn giáo viên làm giáo án:</label>
                                <select
                                    name="teacherId"
                                    value={form.teacherId}
                                    onChange={handleChange}
                                    required
                                    disabled={!form.subjectId || teachersLoading}
                                >
                                    <option value="">Chọn giáo viên</option>
                                    {teachersBySubject?.map(teacher => (
                                        <option key={teacher.teacherId} value={teacher.teacherId}>
                                            {teacher.teacherName}--{teacher.teacherId}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="form-field">
                        <label>Học kỳ:</label>
                        <select
                            name="semesterId"
                            value={form.semesterId}
                            onChange={handleChange}
                            required
                            disabled={semestersLoading}
                        >
                            <option value="">Chọn học kỳ</option>
                            {semesters?.map(semester => (
                                <option key={semester.semesterID} value={semester.semesterID}>
                                    {semester.semesterName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-field">
                        <label>Ngày bắt đầu:</label>
                        <input
                            type="datetime-local"
                            name="startDate"
                            value={form.startDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label>Ngày kết thúc:</label>
                        <input
                            type="datetime-local"
                            name="endDate"
                            value={form.endDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {FORM_FIELDS.map(({ name, label, type, rows }) => (
                    <div className="form-group" key={name}>
                        <div className="form-field">
                            <label>{label}:</label>
                            {type === 'textarea' ? (
                                <textarea
                                    name={name}
                                    value={form[name]}
                                    onChange={handleChange}
                                    required
                                    rows={rows}
                                />
                            ) : (
                                <input
                                    type="text"
                                    name={name}
                                    value={form[name]}
                                    onChange={handleChange}
                                    required
                                />
                            )}
                        </div>
                    </div>
                ))}

                <div className="buttons-container">
                    <button
                        type="button"
                        className="btn-back"
                        onClick={() => navigate(-1)}
                    >
                        Trở lại danh sách
                    </button>
                    <button type="submit">Phân công làm giáo án</button>
                </div>
            </form>
        </div>
    );
};

export default UploadLessonPlan;