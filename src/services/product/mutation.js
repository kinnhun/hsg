import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTodo, deleteTodo, updateTodo } from "./api";

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,

    // onMutate: async (newTodo) => {
    //   console.log("Mutate");

    //   // Hủy các queries đang chạy để tránh conflict
    //   await queryClient.cancelQueries({ queryKey: ["todos"] });

    //   // Lưu lại dữ liệu cũ để rollback nếu có lỗi
    //   const previousTodos = queryClient.getQueryData(["todos"]);

    //   // Cập nhật cache ngay lập tức
    //   queryClient.setQueryData(["todos"], (old = []) => [
    //     ...old,
    //     { id: "mutate", ...newTodo }, // Thêm tạm todo vào cache
    //   ]);

    //   return { previousTodos };
    // },

    // onError: (error, newTodo, context) => {
    //   console.log("Error:", error);

    //   // Rollback dữ liệu cũ nếu mutation thất bại
    //   if (context?.previousTodos) {
    //     queryClient.setQueryData(["todos"], context.previousTodos);
    //   }
    // },

    // onSuccess: (data) => {
    //   console.log("Success:", data);
    // },

    onSettled: async () => {
      console.log("Settle");

      // Revalidate từ server để đảm bảo dữ liệu đúng
      await queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updateTodo(data),
    onSettled: async (data, error) => {
      if (error) {
        console.log(error);
      } else {
        await queryClient.setQueryData(["todos"], (oldData) => {
          const newData = oldData.map((todo) =>
            todo.id === data.id ? data : todo,
          );
          return newData;
        });
        // await queryClient.invalidateQueries({ queryKey: ["todos"] });

        // await queryClient.invalidateQueries({
        //   queryKey: ["todo", { id: variables.id }],
        // });
      }
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteTodo(id),
    onSuccess: () => {
      console.log("delete successfully");
    },
    onSettled: async (_, error, variable) => {
      if (error) {
        console.log(error);
      } else {
        await queryClient.setQueryData(["todos"], (oldData) => {
          console.log(variable);
          const newData = oldData.filter((todo) => todo.id !== variable);
          return newData;
        });
        // await queryClient.invalidateQueries({ queryKey: ["todos"] });
      }
    },
  });
}
