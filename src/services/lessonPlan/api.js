import { axiosInstance } from "../axios";
import axios from "axios";

export const createLessonPlan = async (data) => {
  return await axiosInstance.post("/LessonPlan/create", data);
};

export const getLessonPlanByTeacher = async (
  teacherId,
  pageNumber,
  pageSize,
) => {
  try {
    const response = await axiosInstance.get(
      `/LessonPlan/teacher/${teacherId}`,
      {
        params: { pageNumber, pageSize },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách kế hoạch:", error);
    throw error;
  }
};

export const getLessonPlanById = async (planId) => {
  const response = await axiosInstance.get(`/LessonPlan/${planId}`);
  return response.data;
};

export const updateLessonPlan = async (planId, data) => {
  const response = await axiosInstance.put(
    `/LessonPlan/${planId}/update`,
    data,
  );
  return response.data;
};
