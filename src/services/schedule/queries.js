import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getScheduleByTeacherId,
  getScheduleByStudent,
  getTimetableForPrincipal,
  createSubstituteTeaching,
  getSubstituteTeachings,
  getTimetiableSubstituteSubstituteForTeacher,
  getStudentNameAndClass,
  getClasses,
  getTimetables,
} from "./api";

export function useScheduleTeacher(teacherId) {
  return useQuery({
    queryKey: ["schedule", teacherId],
    queryFn: () => getScheduleByTeacherId(teacherId),
    enabled: !!teacherId,
  });
}
export function useScheduleStudent(studentId, semesterId) {
  return useQuery({
    queryKey: ["schedule", "student", studentId, semesterId],
    queryFn: () => getScheduleByStudent({ studentId, semesterId }),
    enabled: !!studentId && !!semesterId,
  });
}
export function useTimetableForPrincipal(timetableId, status) {
  const apiStatus =
    status === "Không hoạt động" ? "Không hoạt động" : "Hoạt động";
  return useQuery({
    queryKey: ["schedule", "principal", timetableId],
    queryFn: () => getTimetableForPrincipal(timetableId, apiStatus),
    enabled: !!timetableId,
  });
}

export function useCreateSubstituteTeaching() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubstituteTeaching,
    onSuccess: () => {
      queryClient.invalidateQueries("assignedTeacher");
    },
  });
}

export function useGetSubstituteTeachings(
  timetableDetailId,
  originalTeacherId,
  date,
) {
  return useQuery({
    queryKey: [
      "substituteTeachings",
      timetableDetailId,
      originalTeacherId,
      date,
    ],
    queryFn: () =>
      getSubstituteTeachings(timetableDetailId, originalTeacherId, date),
    enabled: !!timetableDetailId && !!originalTeacherId && !!date,
  });
}

export function useGetTimetiableSubstituteSubstituteForTeacher(
  teacherId,
  date,
) {
  return useQuery({
    queryKey: ["substituteTeachings", teacherId, date],
    queryFn: () => getTimetiableSubstituteSubstituteForTeacher(teacherId, date),
    enabled: !!teacherId && !!date,
  });
}

export function useGetStudentNameAndClass(id, academicYearId) {
  return useQuery({
    queryKey: ["student", id, academicYearId],
    queryFn: () => getStudentNameAndClass(id, academicYearId),
    enabled: !!id && !!academicYearId,
  });
}

export function useGetClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: getClasses,
  });
}

export function useTimetables(semesterId) {
  return useQuery({
    queryKey: ["timetables", semesterId],
    queryFn: () => getTimetables(semesterId),
    enabled: !!semesterId,
  });
}
