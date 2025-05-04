import { useMutation } from "@tanstack/react-query";
import {
  addGradeBatch,
  assignTeaching,
  changeUserRole,
  changeUserStatus,
  configueSubject,
  createAcademicYear,
  createClass,
  createHomeroom,
  createSubject,
  deleteSubjectConfigue,
  deleteTeacherSubjects,
  deleteTeachingAssignment,
  resetUserPassword,
  transferClassData,
  transferStudentData,
  updateAcademicYear,
  updateClass,
  updateExamStatus,
  updateGradeBatch,
  updateHomeroom,
  updateSubject,
  updateSubjectConfigue,
  updateTeacherSubjectByTeacherId,
  updateTeachingAssignment,
} from "./api";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

export function useAddGradeBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      return addGradeBatch(data);
    },
    onSettled: (data, error, variables) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        queryClient.invalidateQueries({
          queryKey: [
            "grade-batchs",
            { academicYearId: variables.academicYearId },
          ],
        });
        toast.success("Thêm đợt nhập điểm thành công");
      }
    },
  });
}

export const useUpdateGradeBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gradeBatchId, payload }) => {
      return updateGradeBatch(gradeBatchId, payload);
    },
    onSettled: (data, error, variables) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        queryClient.invalidateQueries({
          queryKey: [
            "grade-batchs",
            { academicYearId: variables.payload.academicYearId },
          ],
        });
        queryClient.invalidateQueries({
          queryKey: ["grade-batch", { id: variables.payload.gradeBatchId }],
        });
        toast.success("Cập nhật thành công");
      }
    },
  });
};

export function useChangeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }) => {
      return changeUserStatus(userId, status);
    },
    onSettled: (data, error) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        queryClient.invalidateQueries({ queryKey: ["users"] });
        // toast.success("Thay đổi trạng thái thành công");
      }
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ userId, newPassword }) => {
      return resetUserPassword(userId, newPassword);
    },
    onSettled: (data, error) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        toast.success("Đặt lại mật khẩu thành công");
      }
    },
  });
}

// export function useConfigueSubject() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (data) => {
//       data.map((item) => {
//         return configueSubject(item);
//       });
//     },
//     onSettled: (data, error) => {
//       if (error) {
//         console.log(error);
//         toast.error("Cấu hình môn học thất bại");
//       } else {
//         console.log(data);
//         queryClient.invalidateQueries({ queryKey: ["subjects"] });
//         toast.success("Cấu hình môn học thành công");
//       }
//     },
//   });
// }

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      const subjectData = {
        subjectName: data.subjectName,
        typeOfGrade: data.typeOfGrade,
        subjectCategory: data.subjectCategory,
      };
      console.log(subjectData);
      return createSubject(subjectData);
    },
    onSettled: async (data, error, variables) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        const newData = variables?.gradesData.map((item) => {
          return {
            subjectId: data.subjectID,
            ...item,
          };
        });
        for (let i = 0; i < newData.length; i++) {
          try {
            await configueSubject(newData[i]);
          } catch (error) {
            console.log(error);
            if (error.response?.data) {
              toast.error(error.response?.data);
            } else {
              toast.error("Đã có lỗi xảy ra");
            }
          }
        }
        queryClient.invalidateQueries({ queryKey: ["subjects"] });
        toast.success("Tạo môn học thành công");
      }
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      const subjectData = {
        subjectName: data.subjectName,
        typeOfGrade: data.typeOfGrade,
        subjectCategory: data.subjectCategory,
      };
      return updateSubject(data.subjectId, subjectData);
    },
    onSettled: async (data, error, variables) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        const configData = variables?.gradesData.map((item) => {
          return {
            subjectId: data.subjectId,
            ...item,
          };
        });
        for (let i = 0; i < configData.length; i++) {
          try {
            if (configData[i].status === "add") {
              const { status, ...newData } = configData[i];
              await configueSubject(newData);
            } else if (configData[i].status === "update") {
              const { status, ...newData } = configData[i];
              await updateSubjectConfigue(newData.gradeLevelSubjectId, newData);
            } else if (configData[i].status === "delete") {
              const { status, ...newData } = configData[i];
              await deleteSubjectConfigue(newData.gradeLevelSubjectId);
            }
          } catch (e) {
            console.log(e);
            toast.error("Cấu hình môn học thất bại");
          }
        }
        if (
          configData.length > 0 &&
          configData.every((item) => item.status === "delete")
        ) {
          queryClient.invalidateQueries({ queryKey: ["subjects"] });
          queryClient.invalidateQueries({ queryKey: ["subjectConfigs"] });
          queryClient.invalidateQueries({
            queryKey: ["subject", { id: variables.subjectId }],
          });
          queryClient.removeQueries({
            queryKey: ["subjectConfig", { id: variables.subjectId }],
          });
        } else {
          queryClient.invalidateQueries({ queryKey: ["subjects"] });
          queryClient.invalidateQueries({ queryKey: ["subjectConfigs"] });
          queryClient.invalidateQueries({
            queryKey: ["subject", { id: variables.subjectId }],
          });
          queryClient.invalidateQueries({
            queryKey: ["subjectConfig", { id: variables.subjectId }],
          });
        }
        toast.success("Cập nhật môn học thành công");
      }
    },
  });
}

export function useAssginTeaching() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      return assignTeaching(data);
    },
    onSettled: (data, error) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        toast.success("Phân công giảng dạy thành công");
        queryClient.invalidateQueries({ queryKey: ["teaching-assignments"] });
      }
    },
  });
}

export function useUpdateTeachingAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      console.log(data);
      return updateTeachingAssignment(data);
    },
    onSettled: (data, error, variables) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        toast.success("Cập nhật phân công giảng dạy thành công");
        queryClient.invalidateQueries({ queryKey: ["teaching-assignments"] });
        queryClient.invalidateQueries({
          queryKey: [
            "teaching-assignments-by-teacher",
            {
              teacherId: variables[0].teacherId,
              semesterId: variables[0]?.semesterId,
            },
          ],
        });
      }
    },
  });
}

export function useDeleteTeachingAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teacherId, semesterId }) => {
      return deleteTeachingAssignment(teacherId, semesterId);
    },
    onSettled: (data, error, variables) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        toast.success("Xóa phân công giảng dạy thành công");
        queryClient.invalidateQueries({ queryKey: ["teaching-assignments"] });
      }
    },
  });
}

//academicYear
export function useCreateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      return createAcademicYear(data);
    },
    onSettled: (data, error) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        toast.success("Tạo năm học thành công");
        queryClient.invalidateQueries({ queryKey: ["AcademicYears"] });
        queryClient.invalidateQueries({
          queryKey: ["all-semesters"],
        });
      }
    },
  });
}

export function useUpdateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ academicYearId, data }) => {
      return updateAcademicYear(academicYearId, data);
    },
    onSettled: (data, error, variables) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        toast.success("Cập nhật năm học thành công");
        queryClient.invalidateQueries({ queryKey: ["AcademicYears"] });
        queryClient.invalidateQueries({
          queryKey: ["AcademicYear", { id: variables.academicYearId }],
        });
        queryClient.invalidateQueries({
          queryKey: ["semesters", { academicYearId: variables.academicYearId }],
        });
        queryClient.invalidateQueries({
          queryKey: ["all-semesters"],
        });
      }
    },
  });
}

//class
export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      const { homerooms, ...classData } = data;
      return createClass(classData);
    },
    onSettled: async (data, error, variables) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        const homerooms = variables?.homerooms.map((item) => {
          return {
            classId: data.classId,
            ...item,
          };
        });
        if (homerooms.length > 0) {
          for (let i = 0; i < homerooms.length; i++) {
            try {
              await createHomeroom(homerooms[i]);
            } catch (e) {
              console.log(e);
              if (error.response?.data) {
                toast.error(error.response?.data);
              } else {
                toast.error("Đã có lỗi xảy ra");
              }
            }
          }
        }

        toast.success("Tạo lớp thành công");
        queryClient.invalidateQueries({
          queryKey: [
            "classes-with-student-count",
            { academicYearId: variables.academicYearId },
          ],
        });

        queryClient.invalidateQueries({ queryKey: ["classes"] });
        queryClient.invalidateQueries({ queryKey: ["hoomroom-teachers"] });
      }
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      const { homerooms, ...classData } = data;
      return updateClass(data.classId, classData);
    },
    onSettled: async (data, error, variables) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        try {
          await updateHomeroom(variables.homerooms);
        } catch (e) {
          console.log(e);
          if (error.response?.data) {
            toast.error(error.response?.data);
          } else {
            toast.error("Đã có lỗi xảy ra");
          }
        }
        toast.success("Cập nhật lớp thành công");
        queryClient.invalidateQueries({
          queryKey: ["classes-with-student-count"],
        });
        queryClient.invalidateQueries({ queryKey: ["classes"] });
        queryClient.invalidateQueries({ queryKey: ["hoomroom-teachers"] });
        queryClient.invalidateQueries({
          queryKey: ["class", { id: variables.classId }],
        });
      }
    },
  });
}

//teacher subject
export function useUpdateTeacherSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teacherId, data }) => {
      return updateTeacherSubjectByTeacherId(teacherId, data);
    },
    onSettled: (data, error, variables) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        toast.success("Cập nhật môn học thành công");
        queryClient.invalidateQueries({
          queryKey: ["teacher-subject", { teacherId: variables.teacherId }],
        });
        queryClient.invalidateQueries({ queryKey: ["teacherSubjects"] });
      }
    },
  });
}

export function useDeleteTeacherSubject(teacherId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teacherId) => {
      return deleteTeacherSubjects(teacherId);
    },
    onSettled: (data, error) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        toast.success("Xóa môn học của giáo viên thành công");
        queryClient.removeQueries({
          queryKey: ["teacher-subject", { teacherId }],
        });
        queryClient.invalidateQueries({ queryKey: ["teacherSubjects"] });
      }
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      return changeUserRole(data);
    },
    onSettled: (data, error) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        toast.success("Đổi vai trò thành công");
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    },
  });
}

export function useUpdateExamStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, data }) => {
      return updateExamStatus(examId, data);
    },
    onSettled: (data, error) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        toast.success("Cập nhật trạng thái thành công");
        queryClient.invalidateQueries({ queryKey: ["exams"] });
      }
    },
  });
}

//transfer dataa
export function useTransferClassData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      return transferClassData(data);
    },
    onSettled: (data, error, variables) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        toast.success("Chuyển dữ liệu thành công");
        queryClient.invalidateQueries({
          queryKey: [
            "previous-year-students",
            { academicYearId: variables[0].targetAcademicYearId },
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            "non-eligible-students",
            { academicYearId: variables[0].targetAcademicYearId },
          ],
        });
      }
    },
  });
}

export function useTransferStudentData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      return transferStudentData(data);
    },
    onSettled: (data, error, variables) => {
      if (error) {
        console.log(error);
        if (error.response?.data) {
          toast.error(error.response?.data);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        console.log(data);
        toast.success("Chuyển dữ liệu thành công");
        queryClient.invalidateQueries({
          queryKey: [
            "previous-year-students",
            { academicYearId: variables[0].academicYearId },
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            "non-eligible-students",
            { academicYearId: variables[0].academicYearId },
          ],
        });
      }
    },
  });
}
