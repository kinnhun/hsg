import { axiosInstance } from "../axios";

export const getSubjectByTeacher = async (teacherId) => {
  const token = localStorage.getItem("token")?.replace(/^"|"$/g, "");
  const response = await axiosInstance.get(
    `/TeacherSubject/by-teacher/${teacherId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};
