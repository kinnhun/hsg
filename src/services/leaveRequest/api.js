import { axiosInstance } from "../axios";

export const getLeaveRequestByTeacherId = async (teacherId, status) => {
  const token = JSON.parse(localStorage.getItem("token"));
  const url = status
    ? `LeaveRequest?teacherId=${teacherId}&status=${status}`
    : `LeaveRequest?teacherId=${teacherId}`;

  return (
    await axiosInstance.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  ).data;
};

export const createLeaveRequest = async (data) => {
  const token = JSON.parse(localStorage.getItem("token"));

  return (
    await axiosInstance.post(`LeaveRequest`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  ).data;
};

export const getLeaveRequestByAdmin = async () => {
  const token = JSON.parse(localStorage.getItem("token"));

  return (
    await axiosInstance.get(`LeaveRequest`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  ).data;
};

export const getLeaveRequestById = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"));

  return (
    await axiosInstance.get(`LeaveRequest/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  ).data;
};

export const deleteLeaverRequestById = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"));

  return (
    await axiosInstance.delete(`/LeaveRequest/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  ).data;
};

export const updateLeaveRequestById = async (id, data) => {
  const token = JSON.parse(localStorage.getItem("token"));

  return (
    await axiosInstance.put(`LeaveRequest/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type":
          "application/json;odata.metadata=minimal;odata.streaming=true",
      },
    })
  ).data;
};

export const substituteTeacher = async (payload) => {
  const token = JSON.parse(localStorage.getItem("token"));

  return (
    await axiosInstance.post(`SubstituteTeachings`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
  ).data;
};
