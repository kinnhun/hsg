import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getTeachers,
  getHeadTeacherAssignments,
  getTeacher,
  getExamsByTeacherId,
  getStudentByClass,
  getStudentAttendances,
  getTeachersBySubject,
} from "./api";

export function useTeachers() {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: () => {
      return getTeachers();
    },
    placeholderData: keepPreviousData,
    // throwOnError: true,
  });
}

export function useTeacher(id) {
  return useQuery({
    queryKey: ["teacher", id],
    queryFn: () => {
      return getTeacher(id);
    },
    enabled: !!id,
  });
}

// export function useTA() {
//   return useQuery({
//     queryKey: ["teaching-assignments"],
//     queryFn: () => {
//       return getTeachingAssignments(
//         page,
//         pageSize,
//         department,
//         teacher,
//         semester,
//       );
//     },
//     placeholderData: keepPreviousData,
//   });
// }

export function useHTA({ page = 1, pageSize = 5, grade = "" }) {
  return useQuery({
    queryKey: ["head-teacher-assignments", { page, pageSize, grade }],
    queryFn: () => {
      return getHeadTeacherAssignments(page, pageSize, grade);
    },
    placeholderData: keepPreviousData,
  });
}

export function useExamsByTeacherId(teacherId) {
  return useQuery({
    queryKey: ["exams-by-teacher-id", { teacherId }],
    queryFn: () => {
      return getExamsByTeacherId(teacherId);
    },
    enabled: !!teacherId,
  });
}

export function useStudentByClass({ classId, semesterId }) {
  return useQuery({
    queryKey: ["student-by-class", { classId, semesterId }],
    queryFn: () => getStudentByClass(classId, semesterId),
    enabled: !!classId && !!semesterId,
  });
}

export function useStudentAttendances(data) {
  return useQuery({
    queryKey: [
      "student-attendances",
      {
        teacherId: data.teacherId,
        classId: data.classId,
        semesterId: data.semesterId,
        weekStart: data.weekStart,
      },
    ],
    queryFn: () => {
      return getStudentAttendances(data);
    },
    enabled:
      !!data.teacherId &&
      !!data.classId &&
      !!data.semesterId &&
      !!data.weekStart,
  });
}
export function useTeachersBySubject(id) {
  return useQuery({
    queryKey: ["teachersBySubject", id],
    queryFn: () => getTeachersBySubject(id),
    enabled: !!id,
  });
}
