import { useQuery } from "@tanstack/react-query";
import { getGrades } from "./api";

export const useGetGradesQuery = (classId, subjectId, semesterId) => {
  return useQuery({
    queryKey: ["grades"],
    queryFn: () => getGrades(classId, subjectId, semesterId),
  });
};
