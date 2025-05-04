import { useQuery } from "@tanstack/react-query";
import { getSubjectByTeacher } from "./api";

export const useSubjectByTeacher = (teacherId) => {
  const query = useQuery({
    queryKey: ["subjects", teacherId],
    queryFn: () => getSubjectByTeacher(teacherId),
    enabled: !!teacherId,
  });

  return {
    ...query,
    subjects: query.data || [],
  };
};
