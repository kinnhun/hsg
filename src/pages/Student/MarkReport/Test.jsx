import React, { useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './ListMarkTeacher.scss';

// Hàm ánh xạ assessmentType
const mapAssessmentType = (field) => ({
    TX1: 'ĐĐG TX 1',
    TX2: 'ĐĐG TX 2',
    TX3: 'ĐĐG TX 3',
    GK: 'ĐĐG GK',
    CK: 'ĐĐG CK',
}[field] || '');

const ListMarkTeacher = () => {
    const [semester, setSemester] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [grades, setGrades] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedGrades, setEditedGrades] = useState({});
    const [editingRows, setEditingRows] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Lấy và kiểm tra token
    const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
    const decoded = useMemo(() => {
        try {
            return token ? jwtDecode(token) : {};
        } catch (e) {
            console.error('Invalid token:', e);
            return {};
        }
    }, [token]);
    const teacherId = decoded?.teacherId;

    // Hàm xử lý thay đổi học kỳ
    const handleSemesterChange = useCallback(
        async (e) => {
            const selectedSemester = e.target.value;
            setSemester(selectedSemester);
            setError('');

            if (!teacherId || !selectedSemester) return;

            setLoading(true);
            try {
                const semesterId = selectedSemester === '1' ? 1 : 2;
                const response = await axios.get(
                    `https://localhost:8386/api/TeachingAssignment/teacher/${teacherId}/semester/${semesterId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setAssignments(response.data);
                setSelectedAssignment('');
                setGrades([]);
            } catch (error) {
                console.error('Error fetching assignments:', error);
                setError('Không thể tải danh sách phân công giảng dạy.');
                setAssignments([]);
            } finally {
                setLoading(false);
            }
        },
        [teacherId, token]
    );

    // Hàm xử lý thay đổi phân công
    const handleAssignmentChange = useCallback((e) => {
        setSelectedAssignment(e.target.value);
        setError('');
    }, []);

    // Hàm tìm kiếm điểm
    const handleSearchGrades = useCallback(async () => {
        const assignment = assignments.find((a) => a.assignmentId === parseInt(selectedAssignment));
        if (!assignment || !semester) return;

        setLoading(true);
        setError('');
        try {
            const { subjectId, classId } = assignment;
            const semesterId = semester === '1' ? 1 : 2;
            const response = await axios.get(`https://localhost:8386/api/Grades/teacher`, {
                params: { teacherId, classId, subjectId, semesterId },
                headers: { Authorization: `Bearer ${token}` },
            });
            setGrades(response.data);
        } catch (error) {
            console.error('Error fetching grades:', error);
            setError('Không thể tải danh sách điểm.');
            setGrades([]);
        } finally {
            setLoading(false);
        }
    }, [assignments, selectedAssignment, semester, teacherId, token]);

    // Hàm xử lý thay đổi input
    const handleInputChange = useCallback((studentId, field, value) => {
        const numericValue = value === '' ? '' : parseFloat(value);
        if (numericValue !== '' && (numericValue < 0 || numericValue > 10)) return;

        setEditedGrades((prev) => ({
            ...prev,
            [studentId]: { ...prev[studentId], [field]: value },
        }));
    }, []);

    // Hàm lưu điểm chung
    const saveGrades = useCallback(
        async (gradesToSave, studentId = null) => {
            if (!gradesToSave || Object.keys(gradesToSave).length === 0) return;

            setLoading(true);
            setError('');
            try {
                const gradesPayload = {
                    grades: Object.entries(gradesToSave).flatMap(([sId, fields]) =>
                        Object.entries(fields)
                            .filter(([_, value]) => value !== '')
                            .map(([field, value]) => {
                                const gradeInfo = grades.find(
                                    (g) =>
                                        g.studentId === parseInt(sId) &&
                                        g.assessmentType === mapAssessmentType(field)
                                );
                                return {
                                    gradeID: gradeInfo?.gradeId,
                                    score: value.toString(),
                                    teacherComment: 'nhập điểm',
                                };
                            })
                    ),
                };

                await axios.put(
                    'https://localhost:8386/api/Grades/update-multiple-scores',
                    gradesPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json;odata.metadata=minimal;odata.streaming=true',
                            accept: '*/*',
                        },
                    }
                );

                await handleSearchGrades();
                if (studentId) {
                    setEditingRows((prev) => ({ ...prev, [studentId]: false }));
                    setEditedGrades((prev) => {
                        const newGrades = { ...prev };
                        delete newGrades[studentId];
                        return newGrades;
                    });
                } else {
                    setIsEditing(false);
                    setEditedGrades({});
                }
            } catch (error) {
                console.error('Error saving grades:', error);
                setError('Không thể lưu điểm. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        },
        [grades, token, handleSearchGrades]
    );

    // Hàm lưu điểm toàn bộ
    const handleSaveGrades = useCallback(() => saveGrades(editedGrades), [editedGrades, saveGrades]);

    // Hàm lưu điểm từng hàng
    const handleSaveRow = useCallback(
        (studentId) => saveGrades({ [studentId]: editedGrades[studentId] }, studentId),
        [editedGrades, saveGrades]
    );

    // Hàm chỉnh sửa hàng
    const handleEditRow = useCallback(
        async (studentId) => {
            setLoading(true);
            setError('');
            try {
                const studentGrades = grades.filter((g) => g.studentId === studentId);
                const gradesPayload = {
                    grades: studentGrades.map((grade) => ({
                        gradeID: grade.gradeId,
                        score: grade.score ? grade.score.toString() : '0',
                        teacherComment: 'nhập điểm',
                    })),
                };

                await axios.put(
                    'https://localhost:8386/api/Grades/update-multiple-scores',
                    gradesPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json;odata.metadata=minimal;odata.streaming=true',
                            accept: '*/*',
                        },
                    }
                );

                await handleSearchGrades();
                setEditingRows((prev) => ({ ...prev, [studentId]: true }));
            } catch (error) {
                console.error('Error updating grades:', error);
                setError('Không thể cập nhật điểm. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        },
        [grades, token, handleSearchGrades]
    );

    // Nhóm điểm theo học sinh
    const groupedGrades = useMemo(
        () =>
            Object.values(
                grades.reduce((acc, grade) => {
                    if (!acc[grade.studentId]) {
                        acc[grade.studentId] = {
                            studentId: grade.studentId,
                            studentName: grade.studentName,
                            TX1: null,
                            TX2: null,
                            TX3: null,
                            GK: null,
                            CK: null,
                            teacherComment: grade.teacherComment,
                        };
                    }
                    switch (grade.assessmentType) {
                        case 'ĐĐG TX 1':
                            acc[grade.studentId].TX1 = grade.score;
                            break;
                        case 'ĐĐG TX 2':
                            acc[grade.studentId].TX2 = grade.score;
                            break;
                        case 'ĐĐG TX 3':
                            acc[grade.studentId].TX3 = grade.score;
                            break;
                        case 'ĐĐG GK':
                            acc[grade.studentId].GK = grade.score;
                            break;
                        case 'ĐĐG CK':
                            acc[grade.studentId].CK = grade.score;
                            break;
                        default:
                            break;
                    }
                    return acc;
                }, {})
            ),
        [grades]
    );

    return (
        <div className="mark-report-container">
            <h2 className="text-xl font-bold mb-4">Chọn học kỳ</h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <select
                value={semester}
                onChange={handleSemesterChange}
                className="w-full p-2 border rounded mb-4"
                disabled={loading}
            >
                <option value="">-- Chọn học kỳ --</option>
                <option value="1">Học kỳ 1</option>
                <option value="2">Học kỳ 2</option>
            </select>

            <h3 className="text-lg font-semibold mb-2">Chọn lớp và môn học</h3>
            <select
                value={selectedAssignment}
                onChange={handleAssignmentChange}
                className="w-full p-2 border rounded mb-4"
                disabled={loading}
            >
                <option value="">-- Chọn lớp và môn học --</option>
                {assignments.map((a) => (
                    <option key={a.assignmentId} value={a.assignmentId}>
                        {a.subjectName} ({a.subjectId}) - {a.className} ({a.classId})
                    </option>
                ))}
            </select>

            <button
                onClick={handleSearchGrades}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-6 disabled:bg-gray-400"
                disabled={!selectedAssignment || loading}
            >
                {loading ? 'Đang tải...' : 'Tìm kiếm'}
            </button>

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Danh sách điểm học sinh</h3>
                {grades.length > 0 && (
                    <div>
                        {isEditing ? (
                            <button
                                onClick={handleSaveGrades}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-2 disabled:bg-gray-400"
                                disabled={loading}
                            >
                                {loading ? 'Đang lưu...' : 'Lưu điểm'}
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
                                disabled={loading}
                            >
                                Nhập điểm
                            </button>
                        )}
                    </div>
                )}
            </div>

            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border p-2" rowSpan="2">Stt</th>
                        <th className="border p-2" rowSpan="2">Tên học sinh</th>
                        <th className="border p-2" colSpan="3">Điểm thường xuyên</th>
                        <th className="border p-2" rowSpan="2">Điểm giữa kỳ</th>
                        <th className="border p-2" rowSpan="2">Điểm cuối kỳ</th>
                        <th className="border p-2" rowSpan="2">Nhận xét của giáo viên</th>
                        <th className="border p-2" rowSpan="2">Hành động</th>
                    </tr>
                    <tr>
                        <th className="border p-2">TX1</th>
                        <th className="border p-2">TX2</th>
                        <th className="border p-2">TX3</th>
                    </tr>
                </thead>
                <tbody>
                    {groupedGrades.length > 0 ? (
                        groupedGrades.map((student, index) => (
                            <tr key={student.studentId}>
                                <td className="border p-2">{index + 1}</td>
                                <td className="border p-2">{student.studentName}</td>
                                {['TX1', 'TX2', 'TX3', 'GK', 'CK'].map((field) => (
                                    <td className="border p-2" key={field}>
                                        {isEditing || editingRows[student.studentId] ? (
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="10"
                                                value={editedGrades[student.studentId]?.[field] ?? student[field] ?? ''}
                                                onChange={(e) => handleInputChange(student.studentId, field, e.target.value)}
                                                className="w-20 p-1 border rounded"
                                                disabled={loading}
                                            />
                                        ) : student[field] !== null ? (
                                            student[field]
                                        ) : (
                                            'Chưa có điểm'
                                        )}
                                    </td>
                                ))}
                                <td className="border p-2">{student.teacherComment || 'Chưa có nhận xét'}</td>
                                <td className="border p-2">
                                    {editingRows[student.studentId] ? (
                                        <button
                                            onClick={() => handleSaveRow(student.studentId)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:bg-gray-400"
                                            disabled={loading}
                                        >
                                            Lưu
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleEditRow(student.studentId)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:bg-gray-400"
                                            disabled={loading}
                                        >
                                            Cập nhật
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" className="border p-2 text-center">
                                Không có dữ liệu điểm.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ListMarkTeacher;