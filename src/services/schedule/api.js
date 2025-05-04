import { axiosInstance } from "../axios";

export const getScheduleByTeacherId = async (teacherId) => {
  const response = await axiosInstance.get(`Timetables/teacher/${teacherId}`);
  return response.data;
};

export const getScheduleByStudent = async ({ studentId, semesterId }) => {
  const response = await axiosInstance.get(
    `Timetables/student/${studentId}/semester/${semesterId}`,
  );
  return response.data;
};

export const getTimetableForPrincipal = async (timetableId, status) => {
  const response = await axiosInstance.get(
    `Timetables/TimetablesForPrincipal/${timetableId}?status=${status}`,
  );
  return response.data;
};

export const createSubstituteTeaching = async (payload) => {
  const response = await axiosInstance.post("SubstituteTeachings", payload);
  return response.data;
};

export const getSubstituteTeachings = async (
  timetableDetailId,
  originalTeacherId,
  date,
) => {
  const response = await axiosInstance.get(
    `SubstituteTeachings?timetableDetailId=${timetableDetailId}&OriginalTeacherId=${originalTeacherId}&date=${date}`,
  );
  return response.data;
};

export const getTimetiableSubstituteSubstituteForTeacher = async (
  teacherId,
  date,
) => {
  const response = await axiosInstance.get(
    `SubstituteTeachings?SubstituteTeacherId=${teacherId}&date=${date.format("YYYY-MM-DD")}`,
  );
  return response.data;
};

export const getStudentNameAndClass = async (id, academicYearId) => {
  const response = await axiosInstance.get(`Student/${id}/${academicYearId}`);
  return response.data;
};

export const getSemesterByYear = async (academicYearId) => {
  const response = await axiosInstance.get(
    `Semester/by-academic-year/${academicYearId}`,
  );
  return response.data;
};

export const deleteTimeTableDetail = async (timetableDetailId) => {
  const response = await axiosInstance.delete(
    `Timetables/detail/${timetableDetailId}`,
  );
  return response.data;
};

export const getClasses = async () => {
  const response = await axiosInstance.get("Classes");
  return response.data;
};

export const getTimetables = async (semesterId) => {
  const response = await axiosInstance.get(`Timetables/semester/${semesterId}`);
  return response.data;
};

// export const createTimeTableDetail = async (payload) => {
//   const response = await axiosInstance.post(
//     "Timetables/create-timetable-detail",
//     payload,
//   );
//   return response.data;
// };

export const updateTimeTableDetail = async (payload) => {
  const response = await axiosInstance.put("Timetables/details", payload);
  return response.data;
};

export const createTimeTableDetail = async (payload) => {
  const response = await axiosInstance.post(
    "Timetables/create-timetable-detail",
    payload,
  );
  return response.data;
};

export const updateTimetableInfo = async (timetableData) => {
  const response = await axiosInstance.put("Timetables/info", timetableData);
  return response.data;
};

export const createTimetable = async (data) => {
  const response = await axiosInstance.post(
    "Timetables/create-timetable",
    data,
  );
  return response.data;
};
