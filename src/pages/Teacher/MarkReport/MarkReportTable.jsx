import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import '@/pages/Teacher/MarkReport/styles/toast.scss';
import '@/pages/Teacher/MarkReport/styles/markReport.scss';

import { getGrades } from '@/services/Grade/api';

const EditGradeDialog = ({ grade, onClose, onSave }) => {
  const [score, setScore] = useState(grade.score);
  const [comment, setComment] = useState(grade.teacherComment || '');
  const [error, setError] = useState('');

  const showToast = (message, type = 'error') => {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type === 'success' ? 'toast-success' : 'toast-error'}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!score.trim()) {
      setError('Vui lòng nhập điểm hợp lệ');
      showToast('Vui lòng nhập điểm hợp lệ');
      return;
    }

    const scoreNum = parseFloat(score);

    if (isNaN(scoreNum)) {
      setError('Điểm phải là một số hợp lệ');
      showToast('Điểm phải là một số hợp lệ');
      return;
    }

    if (scoreNum < 0 || scoreNum > 10) {
      setError('Điểm phải từ 0 đến 10');
      showToast('Điểm phải từ 0 đến 10');
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(score)) {
      setError('Điểm chỉ được có tối đa 2 chữ số thập phân');
      showToast('Điểm chỉ được có tối đa 2 chữ số thập phân');
      return;
    }

    if (!comment.trim()) {
      setComment('Tiếp tục phát huy');
    }

    if (comment.length > 200) {
      setError('Bình luận không được vượt quá 200 ký tự');
      showToast('Bình luận không được vượt quá 200 ký tự');
      return;
    }

    if (/[^a-zA-Z0-9\s,.!?À-Ỹà-ỹ]/.test(comment)) {
      setError('Bình luận chứa ký tự không hợp lệ');
      showToast('Bình luận chứa ký tự không hợp lệ');
      return;
    }

    const finalComment = comment.trim() || 'Tiếp tục phát huy';

    onSave({
      gradeID: grade.gradeId,
      score: score,
      teacherComment: finalComment
    });
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white/90 p-6 rounded-xl w-[450px] shadow-2xl border border-gray-100">
        <h3 className="text-xl font-bold mb-6 text-gray-800">Sửa điểm</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-gray-700">
              Học sinh: <span className="font-medium">{grade.fullName}</span>
            </label>
          </div>
          <div>
            <label className="block mb-2 text-gray-700">Điểm:</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-700">Nhận xét:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              rows="3"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Lưu
            </button>
          </div>
        </form>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const MarkReportTable = () => {
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(1);
  const [selectedClass, setSelectedClass] = useState(1);
  const [editingGrade, setEditingGrade] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const semesterId = 4;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [gradesResponse, subjectsResponse, classesResponse] = await Promise.all([
          axios.get(`https://localhost:8386/api/Grades`, {
            params: {
              classId: selectedClass,
              subjectId: selectedSubject,
              semesterId
            },
            headers: { Accept: "*/*" }
          }),
          axios.get(`https://localhost:8386/api/Subjects`),
          axios.get(`https://localhost:8386/api/Classes`)
        ]);

        setGrades(gradesResponse.data);
        setSubjects(subjectsResponse.data);
        setClasses(classesResponse.data);
        setError(null);
      } catch (error) {
        setError('Có lỗi xảy ra khi tải dữ liệu!');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedClass, selectedSubject, semesterId]);

  const handleSubjectChange = (event) => {
    setSelectedSubject(Number(event.target.value));
  };

  const handleClassChange = (event) => {
    setSelectedClass(Number(event.target.value));
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.subjectId === subjectId);
    return subject ? subject.subjectName : '';
  };

  const handleEditClick = (grade) => {
    setEditingGrade(grade);
  };

  const showNotification = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleSaveGrade = async (updatedGrade) => {
    try {
      await axios.put('https://localhost:8386/api/Grades/update-multiple-scores', {
        grades: [updatedGrade]
      });

      const updatedGrades = grades.map(g =>
        g.gradeId === updatedGrade.gradeID
          ? { ...g, score: updatedGrade.score, teacherComment: updatedGrade.teacherComment }
          : g
      );
      setGrades(updatedGrades);
      setEditingGrade(null);
      showNotification('Cập nhật điểm thành công!', 'success');
    } catch (error) {
      showNotification('Cập nhật điểm thất bại!', 'error');
    }
  };

  return (
    <div className="mark-report-container">
      <div className="mark-report-header">
        <h2>Bảng điểm</h2>
      </div>

      {loading && <p className="text-center text-gray-600">Đang tải dữ liệu...</p>}
      {error && <p className="text-red-500 p-4 bg-red-50 rounded">{error}</p>}

      {!loading && !error && (
        <div className="space-y-4">
          <div className="mark-report-filters flex gap-4 items-center">
            <div>
              <label className="mr-2">Lớp:</label>
              <select
                className="border p-2 rounded"
                value={selectedClass}
                onChange={handleClassChange}
              >
                <option value="">-- Chọn lớp --</option>
                {classes.map((cls) => (
                  <option key={cls.classId} value={cls.classId}>
                    {cls.className} - Khối {cls.grade}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mr-2">Môn học:</label>
              <select
                className="border p-2 rounded"
                value={selectedSubject}
                onChange={handleSubjectChange}
              >
                <option value="">-- Chọn môn học --</option>
                {subjects.map((subject) => (
                  <option key={subject.subjectId} value={subject.subjectId}>
                    {subject.subjectName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <div className="table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="column-id">ID</TableHead>
                    <TableHead className="column-name">Tên học sinh</TableHead>
                    <TableHead className="column-subject">Môn học</TableHead>
                    <TableHead className="column-type">Loại bài kiểm tra</TableHead>
                    <TableHead className="column-score">Điểm</TableHead>
                    <TableHead className="column-comment">Nhận xét</TableHead>
                    <TableHead className="column-action">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.length > 0 ? (
                    grades.map((grade) => (
                      <TableRow key={grade.gradeId}>
                        <TableCell className="column-id">{grade.studentID}</TableCell>
                        <TableCell className="column-name">{grade.fullName}</TableCell>
                        <TableCell className="column-subject">{getSubjectName(selectedSubject)}</TableCell>
                        <TableCell className="column-type">{grade.assessmentsTypeName}</TableCell>
                        <TableCell className="column-score">{grade.score}</TableCell>
                        <TableCell className="column-comment">{grade.teacherComment}</TableCell>
                        <TableCell className="column-action">
                          <button
                            onClick={() => handleEditClick(grade)}
                            className="edit-btn"
                          >
                            Sửa
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {editingGrade && (
        <EditGradeDialog
          grade={editingGrade}
          onClose={() => setEditingGrade(null)}
          onSave={handleSaveGrade}
        />
      )}

      {toast.show && (
        <div className={`toast-notification ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default MarkReportTable;