import React, { useState, useEffect } from 'react'
import axios from 'axios';

const ContactTeacher = () => {
  const [message, setMessage] = useState('');
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [filters, setFilters] = useState({
    department: '',
    gender: ''
  });

  // Lấy danh sách unique các tổ bộ môn
  const departments = [...new Set(teachers.map(t => t.department))].filter(Boolean);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        // Lấy token từ localStorage (hoặc nơi bạn lưu trữ)
        const token = localStorage.getItem('token');

        if (!token) {
          console.error("Không tìm thấy token trong localStorage.");
          setTeachers([]);
          return;
        }

        const cleanedToken = token.replace(/^"|"$/g, '');
        console.log("Cleaned Token:", cleanedToken);
        if (!token) {
          console.error('Không tìm thấy token xác thực.');
          // Có thể xử lý chuyển hướng người dùng về trang đăng nhập ở đây
          return;
        }

        const response = await axios.get('https://localhost:8386/api/Teachers', {
          headers: {
            // Thêm token vào header Authorization
            Authorization: `Bearer ${cleanedToken}`
          }
        });
        setTeachers(response.data.teachers);
        console.log(response.data.teachers);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu giáo viên:', error);
        // Xử lý lỗi, ví dụ: nếu lỗi là 401 Unauthorized, có thể token đã hết hạn
        if (error.response && error.response.status === 401) {
          console.error('Token không hợp lệ hoặc đã hết hạn.');
          // Xử lý đăng xuất hoặc yêu cầu đăng nhập lại
        }
      }
    };

    fetchTeachers();
  }, []);

  // Lọc giáo viên theo điều kiện
  const filteredTeachers = teachers.filter(teacher => {
    const matchDepartment = !filters.department || teacher.department === filters.department;
    const matchGender = !filters.gender || teacher.gender === filters.gender;
    return matchDepartment && matchGender;
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Tổ bộ môn</label>
            <select
              className="w-full border rounded p-2 text-sm"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
            >
              <option value="">Tất cả</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Giới tính</label>
            <select
              className="w-full border rounded p-2 text-sm"
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg">
        <div className="flex items-center justify-between p-2 bg-gray-50">
          <h2 className="text-sm font-medium">Danh sách giáo viên</h2>
          <span className="text-sm">Toàn trường: {filteredTeachers.length} Giáo viên</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#7DB6AD] text-white">
                <th className="w-8 p-2"><input type="checkbox" /></th>
                <th className="p-2 text-left">Họ và tên giáo viên</th>
                <th className="p-2 text-left">Mã cán bộ</th>
                <th className="p-2 text-left">Tổ bộ môn</th>
                <th className="p-2 text-left">Số ĐTDĐ</th>
                <th className="p-2 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.teacherId} className="border-b hover:bg-gray-50">
                  <td className="p-2"><input type="checkbox" /></td>
                  <td className="p-2">{teacher.fullName}</td>
                  <td className="p-2">{teacher.teacherId}</td>
                  <td className="p-2">{teacher.department}</td>
                  <td className="p-2">{teacher.phoneNumber || 'Chưa cập nhật'}</td>
                  <td className="p-2">{teacher.email || 'Chưa cập nhật'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-2 border-t">
          <div className="flex items-center gap-2">
            <select className="border p-1 rounded text-sm">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
            <span className="text-sm">Tổng số: {filteredTeachers.length} mẫu tin</span>
          </div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border rounded hover:bg-gray-100">1</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-100">2</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-100">3</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 mt-4">
        <div className="text-sm font-medium mb-2">
          Người nhận: {filteredTeachers.length} giáo viên
        </div>
        <div className="mb-2">
          <textarea
            className="w-full border rounded-lg p-2 min-h-[100px] resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nhập nội dung tin nhắn..."
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isFirstMessage}
            onChange={(e) => setIsFirstMessage(e.target.checked)}
            id="firstMessage"
          />
          <label htmlFor="firstMessage" className="text-sm">
            Gửi tin nhắn đầu tiên
          </label>
        </div>
        <div className="flex justify-end mt-2">
          <button className="px-4 py-1 bg-[#7DB6AD] text-white rounded-lg text-sm hover:bg-[#6ca599]">
            Gửi
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContactTeacher
