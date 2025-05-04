import { axiosInstance } from "../axios";

export const getTodos = async () => {
  return (await axiosInstance.get("todos")).data;
};

export const createTodo = async (data) => {
  // await axiosInstance.post("todos", data);
  return (await axiosInstance.post("todos", data)).data;
};

export const updateTodo = async (data) => {
  const response = await axiosInstance.put(`todos/${data.id}`, data);
  return response.data;
};

export const deleteTodo = async (id) => {
  await axiosInstance.delete(`todos/${id}`);
};
