import toast from "react-hot-toast";

// Validates that a teacher is not assigned to multiple classes in the same period and day,
// and that a teacher does not exceed 19 periods in total
export const validateTeacherAssignment = (
  newDetail,
  existingDetails,
  isUpdate = false,
  timetableDetailId = null,
) => {
  const { dayOfWeek, periodId, teacherId } = newDetail;

  // Skip validation for the same timetable detail during update
  const filteredDetails = isUpdate
    ? existingDetails.filter(
        (detail) => detail.timetableDetailId !== timetableDetailId,
      )
    : existingDetails;

  // Check for teacher conflicts in the same day and period
  const conflict = filteredDetails.find(
    (detail) =>
      detail.dayOfWeek === dayOfWeek &&
      detail.periodId === periodId &&
      detail.teacherId === teacherId,
  );

  if (conflict) {
    toast.error(
      `Giáo viên đã được phân công cho lớp ${conflict.className} vào ${dayOfWeek}, tiết ${periodId}`,
    );
    return false;
  }

  // Check if teacher exceeds 19 periods
  const teacherPeriods = filteredDetails.filter(
    (detail) => detail.teacherId === teacherId,
  ).length;
  const totalPeriods = isUpdate ? teacherPeriods : teacherPeriods + 1;

  if (totalPeriods > 19) {
    toast.error(
      `Giáo viên không được phân công quá 19 tiết. Hiện tại đã có ${teacherPeriods} tiết.`,
    );
    return false;
  }

  return true;
};

// Validates that a subject has at most one period per day for a class,
// except for "Ngữ văn" which can have up to two consecutive periods in the same session,
// and "Thể dục" cannot be assigned to period 5
export const validateSubjectAssignment = (
  newDetail,
  existingDetails,
  isUpdate = false,
  timetableDetailId = null,
) => {
  const { dayOfWeek, periodId, subjectId, classId, subjectName } = newDetail;

  // Prevent "Thể dục" from being assigned to period 5
  if (subjectName === "Thể dục" && periodId === 5) {
    toast.error(`Môn Thể dục không được phép xếp ở tiết 5 vào ${dayOfWeek}`);
    return false;
  }

  // Skip validation for the same timetable detail during update
  const filteredDetails = isUpdate
    ? existingDetails.filter(
        (detail) => detail.timetableDetailId !== timetableDetailId,
      )
    : existingDetails;

  // Define session periods
  const morningPeriods = [1, 2, 3, 4, 5];
  const afternoonPeriods = [6, 7, 8];
  const isMorning = morningPeriods.includes(periodId);
  const sessionPeriods = isMorning ? morningPeriods : afternoonPeriods;

  // Get existing periods for the same class, day, and subject
  const sameClassDaySubjectDetails = filteredDetails.filter(
    (detail) =>
      detail.classId === classId &&
      detail.dayOfWeek === dayOfWeek &&
      detail.subjectId === subjectId,
  );

  if (subjectName === "Ngữ văn") {
    // Allow up to two periods for Ngữ văn in the same session, and they must be consecutive
    if (sameClassDaySubjectDetails.length >= 2) {
      toast.error(
        `Môn Ngữ văn chỉ được phép có tối đa 2 tiết trong một ngày cho lớp này vào ${dayOfWeek}`,
      );
      return false;
    }

    if (sameClassDaySubjectDetails.length === 1) {
      const existingPeriod = sameClassDaySubjectDetails[0].periodId;
      // Check if periods are in the same session
      const existingIsMorning = morningPeriods.includes(existingPeriod);
      if (existingIsMorning !== isMorning) {
        toast.error(
          `Môn Ngữ văn phải có 2 tiết trong cùng một buổi (Sáng hoặc Chiều) vào ${dayOfWeek}`,
        );
        return false;
      }
      // Check if periods are consecutive
      if (Math.abs(existingPeriod - periodId) !== 1) {
        toast.error(`Môn Ngữ văn phải có 2 tiết liên tục vào ${dayOfWeek}`);
        return false;
      }
    }
  } else {
    // Other subjects can have at most one period per day
    if (sameClassDaySubjectDetails.length > 0) {
      toast.error(
        `Môn ${subjectName} chỉ được phép có 1 tiết trong một ngày cho lớp này vào ${dayOfWeek}`,
      );
      return false;
    }
  }

  return true;
};
