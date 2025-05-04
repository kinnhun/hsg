import React, { useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="container mx-auto py-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">Quản lý điểm học sinh</h1>
            <p className="text-muted-foreground text-sm">
              Quản lý điểm số của học sinh theo học kỳ
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Select
              value={semester}
              onValueChange={(value) => {
                setSemester(value);
                handleSemesterChange({ target: { value } });
              }}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="-- Chọn học kỳ --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default" disabled>-- Chọn học kỳ --</SelectItem>
                <SelectItem value="1">Học kỳ 1</SelectItem>
                <SelectItem value="2">Học kỳ 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={selectedAssignment}
              onValueChange={(value) => {
                setSelectedAssignment(value);
                handleAssignmentChange({ target: { value } });
              }}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="-- Chọn lớp và môn học --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default" disabled>-- Chọn lớp và môn học --</SelectItem>
                {assignments.map((a) => (
                  <SelectItem key={a.assignmentId} value={a.assignmentId}>
                    {a.subjectName} ({a.subjectId}) - {a.className} ({a.classId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSearchGrades}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!selectedAssignment || loading}
          >
            {loading ? 'Đang tải...' : 'Tìm kiếm'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Danh sách điểm học sinh</h2>
          {grades.length > 0 && (
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
              disabled={loading}
            >
              {isEditing ? 'Lưu điểm' : 'Nhập điểm'}
            </Button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead rowSpan="2" className="border text-center">Stt</TableHead>
              <TableHead rowSpan="2" className="border text-center">Tên học sinh</TableHead>
              <TableHead colSpan="3" className="border text-center">Điểm thường xuyên</TableHead>
              <TableHead rowSpan="2" className="border text-center">Điểm giữa kỳ</TableHead>
              <TableHead rowSpan="2" className="border text-center">Điểm cuối kỳ</TableHead>
              <TableHead rowSpan="2" className="border text-center">Nhận xét</TableHead>
              <TableHead rowSpan="2" className="border text-center">Hành động</TableHead>
            </TableRow>
            <TableRow>
              <TableHead className="border text-center">TX1</TableHead>
              <TableHead className="border text-center">TX2</TableHead>
              <TableHead className="border text-center">TX3</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedGrades.length > 0 ? (
              groupedGrades.map((student, index) => (
                <TableRow key={student.studentId}>
                  <TableCell className="border text-center">{index + 1}</TableCell>
                  <TableCell className="border">{student.studentName}</TableCell>
                  {['TX1', 'TX2', 'TX3', 'GK', 'CK'].map((field) => (
                    <TableCell key={field} className="border text-center">
                      {isEditing || editingRows[student.studentId] ? (
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={editedGrades[student.studentId]?.[field] ?? student[field] ?? ''}
                          onChange={(e) => handleInputChange(student.studentId, field, e.target.value)}
                          className="w-20 text-center"
                          disabled={loading}
                        />
                      ) : (
                        student[field] !== null ? student[field] : 'Chưa có điểm'
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="border">{student.teacherComment || 'Chưa có nhận xét'}</TableCell>
                  <TableCell className="border text-center">
                    <Button
                      onClick={() => editingRows[student.studentId] ? handleSaveRow(student.studentId) : handleEditRow(student.studentId)}
                      className={editingRows[student.studentId] ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
                      disabled={loading}
                    >
                      {editingRows[student.studentId] ? 'Lưu' : 'Cập nhật'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="9" className="text-center">
                  Không có dữ liệu điểm.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ListMarkTeacher;