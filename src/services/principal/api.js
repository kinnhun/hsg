import { axiosInstance } from "../axios";

export const addGradeBatch = async (data) => {
  return (await axiosInstance.post(`GradeBatch/create`, data)).data;
};

export const updateGradeBatch = async (id, data) => {
  return (await axiosInstance.put(`GradeBatch/${id}`, data)).data;
};

export const getGradeBatches = async (academicYearId) => {
  return (
    await axiosInstance.get(`GradeBatch/by-academicyear/${academicYearId}`)
  ).data;
};

export const getGradeBatch = async (id) => {
  return (await axiosInstance.get(`GradeBatch/${id}`)).data;
};

export const getUsers = async () => {
  const token = JSON.parse(localStorage.getItem("token"));

  return (
    await axiosInstance.get(`user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).data;
};

export const changeUserStatus = async (userId, status) => {
  return (await axiosInstance.post(`user/${userId}/change-status`, { status }))
    .data;
};

export const resetUserPassword = async (userId, newPassword) => {
  return await axiosInstance.post(`user/${userId}/admin-change-password`, {
    newPassword,
  });
};

export const createSubject = async (data) => {
  return (await axiosInstance.post(`Subjects`, data)).data;
};

export const configueSubject = async (data) => {
  return (await axiosInstance.post(`GradeLevelSubjects`, data)).data;
};

export const getSubjectDetail = async (id) => {
  return (await axiosInstance.get(`Subjects/${id}`)).data;
};

export const getSubjectConfigues = async () => {
  return (await axiosInstance.get(`GradeLevelSubjects`)).data;
};

export const getSubjectConfigueDetail = async (id) => {
  return (await axiosInstance.get(`GradeLevelSubjects/subject/${id}`)).data;
};

export const updateSubject = async (id, data) => {
  return (await axiosInstance.put(`Subjects/${id}`, data)).data;
};

export const updateSubjectConfigue = async (id, data) => {
  return (await axiosInstance.put(`GradeLevelSubjects/${id}`, data)).data;
};

export const deleteSubject = async (id) => {
  return (await axiosInstance.delete(`Subjects/${id}`)).data;
};

export const deleteSubjectConfigue = async (id) => {
  return (await axiosInstance.delete(`GradeLevelSubjects/${id}`)).data;
};

//teaching assignment

export const getTeacherSubjects = async () => {
  return (await axiosInstance.get(`TeachingAssignment/filter-data`)).data;
};

export const deleteTeacherSubjects = async (id) => {
  return (await axiosInstance.delete(`TeacherSubject/by-teacher/${id}`)).data;
};

export const getTeachingAssignments = async (semesterID) => {
  return (
    await axiosInstance.get(`TeachingAssignment/all?semesterId=${semesterID}`)
  ).data;
};

export const assignTeaching = async (data) => {
  return (await axiosInstance.post(`TeachingAssignment/create`, data)).data;
};

export const getTeachingAssignmentsByTeacher = async (
  teacherId,
  semesterId,
) => {
  return (
    await axiosInstance.get(
      `TeachingAssignment/teacher/${teacherId}/semester/${semesterId}`,
    )
  ).data;
};

export const updateTeachingAssignment = async (data) => {
  return (
    await axiosInstance.put(
      `TeachingAssignment/teacher/${data[0].teacherId}/semester/${data[0].semesterId}`,
      data,
    )
  ).data;
};

export const deleteTeachingAssignment = async (teacherId, semesterId) => {
  return (
    await axiosInstance.delete(
      `TeachingAssignment/teacher/${teacherId}/semester/${semesterId}`,
    )
  ).data;
};

//
export const getClassesWithStudentCount = async (academicYearId) => {
  return (
    await axiosInstance.get(
      `StudentClass/classes-with-student-count?academicYearId=${academicYearId}`,
    )
  ).data;
};

export const getHomeroomTeachers = async () => {
  return (await axiosInstance.get(`AssignHomeRoom/all`)).data;
};

export const createAcademicYear = async (data) => {
  return (await axiosInstance.post(`AcademicYear`, data)).data;
};

export const updateAcademicYear = async (id, data) => {
  return (await axiosInstance.put(`AcademicYear/${id}`, data)).data;
};

export const getAllSemesters = async () => {
  return (await axiosInstance.get(`Semester/all`)).data;
};

//class
export const createClass = async (data) => {
  return (await axiosInstance.post(`Classes`, data)).data;
};

export const updateClass = async (id, data) => {
  return (await axiosInstance.put(`Classes/${id}`, data)).data;
};

export const createHomeroom = async (data) => {
  return (await axiosInstance.post(`AssignHomeRoom/assign`, data)).data;
};

export const updateHomeroom = async (data) => {
  return (await axiosInstance.put(`AssignHomeRoom/update`, data)).data;
};

export const getClassById = async (id) => {
  return (await axiosInstance.get(`Classes/${id}`)).data;
};

//teacher Subjects
export const getTeacherSubjectsByTeacherId = async (teacherId) => {
  return (await axiosInstance.get(`TeacherSubject/by-teacher/${teacherId}`))
    .data;
};

export const updateTeacherSubjectByTeacherId = async (id, data) => {
  return (await axiosInstance.put(`TeacherSubject/by-teacher/${id}`, data))
    .data;
};

export const changeUserRole = async (data) => {
  return (await axiosInstance.post(`auth/assign-role`, data)).data;
};

//exam
export const getAllExams = async () => {
  return (await axiosInstance.get(`ExamProposals/exam-proposals`)).data;
};

export const updateExamStatus = async (id, data) => {
  return (
    await axiosInstance.put(`ExamProposals/exam-proposal/${id}/status`, data)
  ).data;
};

//data transfer
export const getStudentPreviousYear = async (id) => {
  return (
    await axiosInstance.get(
      `StudentClass/last-academic-year?currentAcademicYearId=${id}`,
    )
  ).data;
};

//transfer data
export const transferClassData = async (data) => {
  return (await axiosInstance.post(`StudentClass/bulk-transfer`, data)).data;
};

export const transferStudentData = async (data) => {
  return (await axiosInstance.put(`StudentClass`, data)).data;
};

export const getNonEligibleStudents = async (id) => {
  return (
    await axiosInstance.get(
      `StudentClass/non-eligible-students?currentAcademicYearId=${id}`,
    )
  ).data;
};

export const getStats = async () => {
  return (await axiosInstance.get(`Statistics/school`)).data;
};
