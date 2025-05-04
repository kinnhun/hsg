import {
  Link,
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router";
import GradientText from "./GradientText";
import { Button } from "./ui/button";

const ErrorRouteComponent = () => {
  const navigate = useNavigate();
  const error = useRouteError();

  // Xác định thông báo lỗi phù hợp
  const getErrorMessage = () => {
    if (isRouteErrorResponse(error)) {
      return (
        error.error?.message ||
        error.statusText ||
        `Không tìm thấy trang ${error.status}`
      );
    }
    return error instanceof Error ? error.message : "Đã có lỗi xảy ra";
  };

  return (
    <div className="font-montserrat flex min-h-screen w-full items-center bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto flex flex-col items-center justify-between px-5 text-gray-700 md:flex-row dark:text-gray-300">
        <div className="mx-8 w-full lg:w-1/2">
          <div className="mb-8">
            <GradientText content="Oops!" />
            <h1 className="mt-4 mb-2 text-4xl font-bold">
              404 - Không tìm thấy trang
            </h1>
          </div>

          <p className="mb-8 text-xl leading-normal font-light md:text-2xl">
            {getErrorMessage()}
          </p>

          <div className="flex flex-col gap-4">
            <p className="text-gray-500 dark:text-gray-400">
              Trang bạn đang truy cập không tồn tại
            </p>

            <div className="mt-4 flex gap-4">
              <Button
                onClick={() => navigate(-1)}
                className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-white shadow-md transition-all duration-300 hover:shadow-lg"
              >
                Quay lại
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorRouteComponent;
