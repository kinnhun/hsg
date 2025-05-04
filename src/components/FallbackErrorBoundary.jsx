// import { Link } from "react-router";
// import { Button } from "./ui/button";
// import GradientText from "./GradientText";

import { useNavigate } from "react-router";
import { Button } from "./ui/button";

// export function FallbackErrorBoundary({ error, resetErrorBoundary }) {
//   const errorMessage = error?.message || "Something went wrong";

//   return (
//     <div className="flex h-screen w-full items-center justify-center bg-gray-50">
//       <div className="container flex flex-col items-center justify-between gap-8 px-5 text-gray-700 md:flex-row">
//         <div className="mx-8 w-full space-y-4 lg:w-1/2">
//           <GradientText content="404" />

//           <div className="space-y-2">
//             <p className="text-2xl leading-normal font-light md:text-3xl">
//               Đã có lỗi xảy ra
//             </p>
//             <p className="text-base text-red-500">{errorMessage}</p>
//           </div>

//           <div className="flex gap-4">
//             <Button
//               onClick={resetErrorBoundary}
//               className="shadow-lg hover:shadow-xl"
//             >
//               Thử lại
//             </Button>
//           </div>
//         </div>

//         <div className="mx-5 w-full lg:w-1/2">
//           <img
//             src="https://user-images.githubusercontent.com/43953425/166269493-acd08ccb-4df3-4474-95c7-ad1034d3c070.svg"
//             alt="Page not found"
//             className="max-w-full"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

export const FallbackErrorBoundary = () => {
  const navigate = useNavigate();

  return (
    <div className="error-fallback">
      <h2>Đã xảy ra lỗi!</h2>
      <Button onClick={() => navigate("/login")}>
        Quay lại trang đăng nhập
      </Button>
    </div>
  );
};
