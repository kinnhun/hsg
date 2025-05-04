import axios from "axios";
import { message } from "antd";

export const sendMailLeaveRequest = async (
  record,
  teacherId,
  note,
  schedule,
) => {
  const token = localStorage.getItem("token")?.replace(/^"|"$/g, "");
  console.log("schedule", schedule);

  if (!token) {
    message.error("Không tìm thấy token đăng nhập!");
    return;
  }

  const payload = {
    teacherIds: [teacherId],
    subject: "Thông báo phân công dạy thay - Trường THCS Hải Giang",
    body: `
      <p>Kính gửi Quý Thầy/Cô,</p>

      <p>Nhà trường xin trân trọng thông báo:</p>

      <p>Thầy/Cô đã được phân công dạy thay cho lớp: <strong>${record.className}</strong>.</p>

      <p><strong>Thời gian giảng dạy:</strong> ${record.date}</p>
      <p><strong>Tiết học:</strong> ${record.lesson || "Chưa rõ"}</p>
      <p><strong>Phòng học:</strong> ${record.room || "Chưa rõ"}</p>

      <p>Đề nghị Thầy/Cô chuẩn bị bài giảng phù hợp với nội dung chương trình và có mặt đúng giờ.</p>

      <p><strong>Ghi chú từ nhà trường:</strong> ${note || "Không có ghi chú thêm."}</p>

      <br/>
      <p>Thầy/Cô vui lòng đăng nhập vào hệ thống quản lý giảng dạy của Trường THCS Hải Giang để xem chi tiết lịch dạy thay và xác nhận phân công.</p>

      <br/>
      <p>Trân trọng kính chào,</p>
      <p><strong>Ban Giám Hiệu</strong><br/>Trường THCS Hải Giang</p>
    `,
    isHtml: true,
  };

  try {
    await axios.post("https://localhost:8386/api/Notification/send", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    message.success("Email thông báo đã được gửi thành công!");
  } catch (error) {
    console.error("Gửi email thất bại:", error);
    message.error("Gửi email thất bại!");
  }
};
