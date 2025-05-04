import ErrorAuthComponent from "@/components/ErrorAuthComponent";
import ErrorRouteComponent from "@/components/ErrorRouteComponent";
import { hasRequiredRole, isAuthenticated } from "@/utils/authUtils";
import { Navigate } from "react-router";

/**
 * A component that protects routes based on authentication and role requirements
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string|string[]} [props.requiredRoles] - Required role(s) to access the route
 * @returns {React.ReactNode} The protected component or redirect
 */
const ProtectedRoute = ({ children, requiredRoles }) => {
  // First check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  // If roles are specified, check if user has required role
  if (requiredRoles && !hasRequiredRole(requiredRoles)) {
    // Redirect to appropriate page based on user's role
    return <ErrorRouteComponent />;
  }

  // User is authenticated and has required role (if specified)
  return children;
};

export default ProtectedRoute;
