import { jwtDecode } from "jwt-decode";

/**
 * Checks if the user is logged in by verifying the token in localStorage
 * @returns {boolean} Authentication status
 */
export const checkLogin = () => {
  try {
    const token = JSON.parse(localStorage.getItem("token"));

    if (!token) {
      return false;
    }

    // Decode the token to check if it's valid and not expired
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp && decodedToken.exp > currentTime) {
      // Token is valid and not expired
      return true;
    } else {
      // Token is expired
      localStorage.removeItem("token");
      return false;
    }
  } catch (error) {
    // Error decoding token or other issues
    console.error("Authentication error:", error);
    localStorage.removeItem("token");
    return false;
  }
};

/**
 * Gets the decoded user data from the token
 * @returns {object|null} User data or null if not authenticated
 */
export const getUserData = () => {
  try {
    const token = JSON.parse(localStorage.getItem("token"));

    if (!token) {
      return null;
    }

    const decodedToken = jwtDecode(token);
    return decodedToken;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

/**
 * Logs out the user by removing the token
 */
export const logout = () => {
  localStorage.removeItem("token");
};
