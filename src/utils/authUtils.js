import { jwtDecode } from "jwt-decode";

/**
 * Check if the user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp > currentTime;
  } catch (error) {
    return false;
  }
};

/**
 * Get the current user's role
 * @returns {string|null} User role or null if not authenticated
 */
export const getUserRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.role;
  } catch (error) {
    return null;
  }
};

/**
 * Check if user has required role
 * @param {string|string[]} requiredRoles - Required role(s)
 * @returns {boolean} True if user has required role, false otherwise
 */
export const hasRequiredRole = (requiredRoles) => {
  const userRole = getUserRole();
  if (!userRole) return false;

  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(userRole);
  }

  return userRole === requiredRoles;
};

/**
 * Redirect based on user role
 * @param {function} navigate - React Router navigate function
 */
export const redirectBasedOnRole = (navigate) => {
  const role = getUserRole();

  switch (role) {
    case "Principal":
      navigate("/home");
      break;
    case "Teacher":
      navigate("/teacher/profile");
      break;
    default:
      navigate("/home");
  }
};
