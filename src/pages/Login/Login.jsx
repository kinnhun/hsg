import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import "./Login.scss";
import {
  useGoogleLoginMutation,
  useLoginMutation,
} from "@/services/common/mutation";
import { Navigate, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { isAuthenticated } from "@/utils/authUtils";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

const formSchema = z.object({
  username: z.string().min(1, "Tên đăng nhập là bắt buộc"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

const Login = () => {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const googleLoginMutation = useGoogleLoginMutation();
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = "/school.jpg";
    img.onload = () => setBgLoaded(true);
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    // const token = JSON.parse(localStorage.getItem("token"));
    // const userRole = token ? jwtDecode(token).role : null;
    if (isAuthenticated()) {
      return <Navigate to="/home" />;
    }
  }, [navigate]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleGoogleLogin = (credentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Đăng nhập Google thất bại!");
      return;
    }
    console.log(credentialResponse);
    // const googleUser = jwtDecode(credentialResponse.credential);
    // console.log(googleUser);
    googleLoginMutation.mutate(
      { credential: credentialResponse.credential },
      {
        onSuccess: (data) => {
          localStorage.setItem("token", JSON.stringify(data.token));
          toast.success("Đăng nhập Google thành công!");
          navigate("/home");
        },
        onError: () => {
          toast.error("Đăng nhập Google thất bại!");
        },
      },
    );
  };

  const onSubmit = async (values) => {
    loginMutation.mutate(values, {
      onSuccess: (data) => {
        // Store token and user role in localStorage
        localStorage.setItem("token", JSON.stringify(data.token));
        navigate("/home");
        // const role = jwtDecode(data.token).role;

        // Redirect based on role
      },
    });
  };

  return (
    <div
      className="login-container relative"
      style={{
        backgroundImage: bgLoaded ? 'url("school.jpg")' : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {!bgLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
          <div className="h-full w-full animate-pulse bg-gray-200" />
        </div>
      )}
      <div
        className={`login-content transition-opacity duration-300 ${bgLoaded ? "opacity-100" : "opacity-0"}`}
        // style={{
        //   backgroundImage: bgLoaded ? 'url("school.jpg")' : "none",
        //   backgroundSize: "cover",
        //   backgroundPosition: "center",
        // }}
      >
        <div className="login-left">
          <div className="login-welcome">
            <div className="school-logo">
              <span>HGS</span>
            </div>
            <h1>Chào mừng đến với</h1>
            <p className="school-name">Trường THCS Hải Giang</p>
            <p className="system-description">Hệ thống quản lý giáo dục</p>
          </div>
        </div>

        <Card className="login-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold">
              Đăng nhập hệ thống
            </CardTitle>
            <CardDescription className="text-center">
              Vui lòng nhập thông tin đăng nhập của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        Tên đăng nhập
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Nhập tên đăng nhập..."
                            className="border-gray-300 py-6 pr-4 pl-4 text-base focus-visible:ring-2 focus-visible:ring-blue-500"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Mật khẩu</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="password"
                            placeholder="Nhập mật khẩu..."
                            className="border-gray-300 py-6 pr-4 pl-4 text-base focus-visible:ring-2 focus-visible:ring-blue-500"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="login-button w-full py-6 text-base font-medium"
                  disabled={
                    loginMutation.isPending || googleLoginMutation.isPending
                  }
                >
                  {loginMutation.isPending || googleLoginMutation.isPending
                    ? "Đang đăng nhập..."
                    : "Đăng nhập"}
                </Button>
                <div className="mt-2 flex flex-col items-center gap-2">
                  <span className="text-sm text-gray-500">
                    hoặc đăng nhập với Google (Chỉ dành cho giáo viên)
                  </span>
                  {googleLoginMutation.isPending ? (
                    <div className="flex w-full justify-center">
                      <div className="h-10 w-40 animate-pulse rounded bg-gray-200" />
                    </div>
                  ) : (
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={() => toast.error("Đăng nhập Google thất bại!")}
                      width="100%"
                    />
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
