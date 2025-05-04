import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { googleLogin, login } from "./api";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (data) => login(data),
    onSettled: (data, error) => {
      if (error) {
        console.log(error);
        toast.error(error.message);
      } else {
        toast.success("Đăng nhập thành công");
        console.log(data);
      }
    },
  });
};

export const useGoogleLoginMutation = () => {
  return useMutation({
    mutationFn: ({ credential }) => googleLogin(credential),
    onSettled: (data, error) => {
      if (error) {
        console.log(error);
        toast.error(error?.response?.data?.message);
      } else {
        toast.success("Đăng nhập thành công");
        console.log(data);
      }
    },
  });
};
