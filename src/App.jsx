import { useEffect } from "react";
import AppRouter from "./routes/AppRouter";
import toast, { Toaster, useToasterStore } from "react-hot-toast";
import "./App.css";

const TOAST_LIMIT = 1;

const App = () => {
  const { toasts } = useToasterStore();
  // Enforce Limit
  useEffect(() => {
    toasts
      .filter((t) => t.visible) // Only consider visible toasts
      .filter((_, i) => i >= TOAST_LIMIT) // Is toast index over limit
      .forEach((t) => toast.dismiss(t.id)); // Dismiss – Use toast.remove(t.id) removal without animation
  }, [toasts]);

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} durationn={5000} />
      <AppRouter />
    </div>
  );
};

export default App;
