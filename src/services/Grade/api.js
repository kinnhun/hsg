import { axiosInstance } from "../axios";

export const getGrades = async (classId, subjectId, semesterId) => {
  const response = await axiosInstance.get("/grades", {
    params: { classId, subjectId, semesterId },
  });
  return response.data;
};
