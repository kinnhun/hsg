import { useQuery } from "@tanstack/react-query";
import {
  getAllExams,
  getAllSemesters,
  getClassById,
  getClassesWithStudentCount,
  getGradeBatch,
  getGradeBatches,
  getHomeroomTeachers,
  getNonEligibleStudents,
  getStats,
  getStudentPreviousYear,
  getSubjectConfigueDetail,
  getSubjectConfigues,
  getSubjectDetail,
  getTeacherSubjects,
  getTeacherSubjectsByTeacherId,
  getTeachingAssignments,
  getTeachingAssignmentsByTeacher,
  getUsers,
} from "./api";

export function useGradeBatchs(academicYearId) {
  return useQuery({
    queryKey: [
      "grade-batchs",
      {
        academicYearId,
      },
    ],
    queryFn: () => getGradeBatches(academicYearId),
    enabled: !!academicYearId,
  });
}

export function useGradeBatch(id) {
  return useQuery({
    queryKey: ["grade-batch", id],
    queryFn: () => getGradeBatch(id),
    enabled: !!id,
  });
}

// getUser
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
}

export function useSubjectDetail(id) {
  return useQuery({
    queryKey: ["subject", { id }],
    queryFn: () => getSubjectDetail(id),
    enabled: !!id,
  });
}

export function useSubjectConfigue() {
  return useQuery({
    queryKey: ["subjectConfigs"],
    queryFn: getSubjectConfigues,
  });
}

export function useSubjectConfigueDetail(id, options) {
  return useQuery({
    queryKey: ["subjectConfig", { id }],
    queryFn: () => getSubjectConfigueDetail(id),
    ...options,
    enabled: !!id && options?.enabled,
  });
}

//teaching assignment

export function useTeacherSubjects() {
  return useQuery({
    queryKey: ["teacherSubjects"],
    queryFn: getTeacherSubjects,
  });
}

export function useTA(semesterID) {
  return useQuery({
    queryKey: ["teaching-assignments", { semesterID }],
    queryFn: () => {
      return getTeachingAssignments(semesterID);
    },
    enabled: !!semesterID,
  });
}

export function useTeachingAssignmentsByTeacher({ teacherId, semesterId }) {
  return useQuery({
    queryKey: ["teaching-assignments-by-teacher", { teacherId, semesterId }],
    queryFn: () => {
      return getTeachingAssignmentsByTeacher(teacherId, semesterId);
    },
    enabled: !!teacherId && !!semesterId,
  });
}

export function useHomeroomTeachers() {
  return useQuery({
    queryKey: ["hoomroom-teachers"],
    queryFn: getHomeroomTeachers,
  });
}

export function useClassesWithStudentCount(academicYearId) {
  return useQuery({
    queryKey: ["classes-with-student-count", { academicYearId }],
    queryFn: () => {
      return getClassesWithStudentCount(academicYearId);
    },
    enabled: !!academicYearId,
  });
}

export function useAllSemesters() {
  return useQuery({
    queryKey: ["all-semesters"],
    queryFn: () => {
      return getAllSemesters();
    },
  });
}

//class
export function useClass(id) {
  return useQuery({
    queryKey: ["class", id],
    queryFn: () => getClassById(id),
    enabled: !!id,
  });
}

//teacher subject
export function useTeacherSubject(teacherId) {
  return useQuery({
    queryKey: ["teacher-subject", { teacherId }],
    queryFn: () => {
      return getTeacherSubjectsByTeacherId(teacherId);
    },
    enabled: !!teacherId,
  });
}

//exam
export function useExams() {
  return useQuery({
    queryKey: ["exams"],
    queryFn: () => {
      return getAllExams();
    },
  });
}

//transfer data
export function usePreviousYearStudents(academicYearId) {
  return useQuery({
    queryKey: ["previous-year-students", { academicYearId }],
    queryFn: () => {
      return getStudentPreviousYear(academicYearId);
    },
    enabled: !!academicYearId,
  });
}

export function useNonEligibleStudents(academicYearId) {
  return useQuery({
    queryKey: ["non-eligible-students", { academicYearId }],
    queryFn: () => {
      return getNonEligibleStudents(academicYearId);
    },
    enabled: !!academicYearId,
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => {
      return getStats();
    },
  });
}
