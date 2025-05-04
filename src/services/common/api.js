import { axiosInstance } from "../axios";

export const getSubjects = async () => {
  const response = await axiosInstance.get("/subjects");
  return response.data;
};

export const getClasses = async () => {
  const response = await axiosInstance.get("/classes");
  return response.data;
};

export const getAcademicYears = async () => {
  const response = await axiosInstance.get("/AcademicYear");
  return response.data;
};

export const getAcademicYearById = async (id) => {
  const response = await axiosInstance.get(`/AcademicYear/${id}`);
  return response.data;
};

export const getSemestersByAcademicYear = async (academicYearId) => {
  const response = await axiosInstance.get(
    `/semester/by-academic-year/${academicYearId}`,
  );
  return response.data;
};

//login
export const login = async ({ username, password }) => {
  const response = await axiosInstance.post("/auth/login", {
    username,
    password,
  });
  return response.data;
};

export const getRoles = async () => {
  const response = await axiosInstance.get("/roles");
  return response.data;
};

export const getGradeLevels = async () => {
  const response = await axiosInstance.get("/GradeLevels");
  return response.data;
};

//login
export const googleLogin = async (credential) => {
  const response = await axiosInstance.post("GoogleLogin/credential", {
    credential,
  });
  return response.data;
};
