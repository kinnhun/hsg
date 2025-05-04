import { useQuery } from "@tanstack/react-query";
import {
  getAcademicYearById,
  getAcademicYears,
  getClasses,
  getGradeLevels,
  getRoles,
  getSemestersByAcademicYear,
  getSubjects,
} from "./api";

export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: () => {
      return getSubjects();
    },
  });
}

export function useClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: () => {
      return getClasses();
    },
  });
}

export function useAcademicYears() {
  return useQuery({
    queryKey: ["AcademicYears"],
    queryFn: () => {
      return getAcademicYears();
    },
  });
}

export function useAcademicYear(id) {
  return useQuery({
    queryKey: ["AcademicYear", { id }],
    queryFn: () => {
      return getAcademicYearById(id);
    },
    enabled: !!id,
  });
}

export function useSemestersByAcademicYear(academicYearId) {
  return useQuery({
    queryKey: ["semesters", { academicYearId }],
    queryFn: () => {
      return getSemestersByAcademicYear(academicYearId);
    },
    enabled: !!academicYearId,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => {
      return getRoles();
    },
  });
}

export function useGradeLevels() {
  return useQuery({
    queryKey: ["gradeLevels"],
    queryFn: () => {
      return getGradeLevels();
    },
  });
}
