import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContactParents = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [message, setMessage] = useState('');
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const normalizeString = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  const isMatchingSearch = (text, searchTerm) => {
    if (!text || !searchTerm) return false;

    const normalizedText = normalizeString(text);
    const normalizedSearch = normalizeString(searchTerm);

    const searchWords = normalizedSearch.split(/\s+/).filter(word => word.length > 0);

    return searchWords.every(word => {
      if (normalizedText.includes(word)) return true;
      return false;
    });
  };

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const response = await axios.get('https://localhost:8386/api/AcademicYear');
        if (response.data && response.data.length > 0) {
          const sortedYears = response.data.sort((a, b) => b.yearName.localeCompare(a.yearName));
          setAcademicYears(sortedYears);
          handleYearChange(sortedYears[0].academicYearID);
        } else {
          setAcademicYears([]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách năm học:', error);
        setAcademicYears([]);
      }
    };
    fetchAcademicYears();
  }, []);

  const handleYearChange = async (value) => {
    setSelectedYear(value);
    setSelectedClass('');
    setSearchText('');
    if (!value) {
      setStudents([]);
      setFilteredStudents([]);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const cleanedToken = token ? token.replace(/^"|"$/g, '') : null;
      const headers = cleanedToken ? { Authorization: `Bearer ${cleanedToken}` } : {};

      const response = await axios.get(`https://localhost:8386/api/Student/${value}`, { headers });
      const studentData = response.data.students || [];
      setStudents(studentData);
      setFilteredStudents(studentData);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách học sinh:', error);
      setStudents([]);
      setFilteredStudents([]);
    }
  };

  const getUniqueClasses = () => {
    const classes = [...new Set(students.map(student => student.className))].filter(Boolean);
    return classes.sort();
  };
  const uniqueClasses = getUniqueClasses();

  useEffect(() => {
    let result = [...students];

    if (selectedClass) {
      result = result.filter(student => student.className === selectedClass);
    }

    if (searchText) {
      const normalizedSearch = normalizeString(searchText);
      result = result.filter(student => {
        const nameMatch = normalizeString(student.fullName).includes(normalizedSearch);
        const fatherPhoneMatch = normalizeString(student.parent?.phoneNumberFather).includes(normalizedSearch);
        const motherPhoneMatch = normalizeString(student.parent?.phoneNumberMother).includes(normalizedSearch);
        const fatherNameMatch = normalizeString(student.parent?.fullNameFather).includes(normalizedSearch);
        const motherNameMatch = normalizeString(student.parent?.fullNameMother).includes(normalizedSearch);
        const studentIdMatch = normalizeString(student.studentId).includes(normalizedSearch);

        return nameMatch || fatherPhoneMatch || motherPhoneMatch || fatherNameMatch || motherNameMatch || studentIdMatch;
      });
    }

    setFilteredStudents(result);
    setCurrentPage(1);
  }, [selectedClass, searchText, students]);

  const handleSendMessage = () => {
    console.log('Gửi tin nhắn:', message);
    console.log('Người nhận:', filteredStudents);
    console.log('Gửi tin đầu tiên:', isFirstMessage);
  };

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredStudents.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      endPage = Math.min(totalPages, 5);
    }
    if (currentPage > totalPages - 3) {
      startPage = Math.max(1, totalPages - 4);
    }

    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-3 py-1 border rounded hover:bg-gray-100 ${1 === currentPage ? 'bg-gray-200' : ''}`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(<span key="start-ellipsis" className="px-3 py-1">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 border rounded hover:bg-gray-100 ${i === currentPage ? 'bg-gray-200 font-semibold' : ''}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(<span key="end-ellipsis" className="px-3 py-1">...</span>);
      }
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-3 py-1 border rounded hover:bg-gray-100 ${totalPages === currentPage ? 'bg-gray-200' : ''}`}
        >
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Năm học</label>
            <select
              className="w-full border rounded p-2 text-sm"
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
            >
              <option value="">-- Chọn năm học --</option>
              {academicYears.map((year) => (
                <option key={year.academicYearID} value={year.academicYearID}>
                  {year.yearName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Lớp</label>
            <select
              className="w-full border rounded p-2 text-sm"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={!selectedYear || uniqueClasses.length === 0}
            >
              <option value="">Tất cả lớp</option>
              {uniqueClasses.map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tên HS, SĐT, Tên PH, Mã HS..."
              className="w-full border rounded p-2 text-sm"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              disabled={!selectedYear}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg">
        <div className="flex items-center justify-between p-2 bg-gray-50 border-b">
          <h2 className="text-sm font-medium">Danh sách học sinh</h2>
          <span className="text-sm">Tổng số: {filteredStudents.length} học sinh</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#7DB6AD] text-white">
                <th className="w-8 p-2"><input type="checkbox" /></th>
                <th className="p-2 text-left">Họ và tên</th>
                <th className="p-2 text-left">Mã học sinh</th>
                <th className="p-2 text-left">Lớp</th>
                <th className="p-2 text-left">Ngày sinh</th>
                <th className="p-2 text-left">SĐT Bố</th>
                <th className="p-2 text-left">SĐT Mẹ</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((student) => (
                  <tr key={student.studentId} className="border-b hover:bg-gray-50">
                    <td className="p-2"><input type="checkbox" /></td>
                    <td className="p-2">{student.fullName}</td>
                    <td className="p-2">{student.studentId}</td>
                    <td className="p-2">{student.className}</td>
                    <td className="p-2">{student.dob ? new Date(student.dob).toLocaleDateString('vi-VN') : 'N/A'}</td>
                    <td className="p-2">{student.parent?.phoneNumberFather || 'Chưa cập nhật'}</td>
                    <td className="p-2">{student.parent?.phoneNumberMother || 'Chưa cập nhật'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-4 text-gray-500">
                    {selectedYear ? 'Không tìm thấy học sinh phù hợp.' : 'Vui lòng chọn năm học để xem dữ liệu.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-2 border-t text-sm">
          <div className="flex items-center gap-2">
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border p-1 rounded"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span> dòng/trang</span>
            <span className="ml-4">
              {filteredStudents.length > 0 ? `${firstItemIndex + 1}-${Math.min(lastItemIndex, filteredStudents.length)}` : 0} trên {filteredStudents.length} mẫu tin
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>

              {renderPageNumbers()}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 mt-4">
        <div className="text-sm font-medium mb-2">
          Người nhận: {filteredStudents.length} phụ huynh (tạm tính theo danh sách lọc)
        </div>
        <div className="mb-2">
          <textarea
            className="w-full border rounded-lg p-2 min-h-[100px] resize-none text-sm"
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
            id="firstMessageParent"
            className="cursor-pointer"
          />
          <label htmlFor="firstMessageParent" className="text-sm cursor-pointer select-none">
            Gửi tin nhắn đầu tiên trong ngày (ZNS)
          </label>
        </div>
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSendMessage}
            className="px-4 py-1 bg-[#7DB6AD] text-white rounded-lg text-sm hover:bg-[#6ca599] disabled:opacity-50"
            disabled={!message || filteredStudents.length === 0}
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactParents;
