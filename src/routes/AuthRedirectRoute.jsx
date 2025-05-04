import ErrorRouteComponent from "@/components/ErrorRouteComponent";
import { isAuthenticated } from "@/utils/authUtils";

/**
 * A component that redirects authenticated users away from auth pages like login
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if not authenticated
 * @returns {React.ReactNode} The component or redirect
 */
const AuthRedirectRoute = ({ children }) => {
  // Check if user is already authenticated
  if (isAuthenticated()) {
    // User is already logged in, show error or redirect
    return <ErrorRouteComponent />;
  }

  // User is not authenticated, allow access to the auth page
  return children;
};

export default AuthRedirectRoute;
