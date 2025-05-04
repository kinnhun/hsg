export const cleanString = (str) => {
  return typeof str === "string" ? str.trim().replace(/\s+/g, " ") : str;
};
