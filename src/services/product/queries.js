import { useQuery } from "@tanstack/react-query";
import { getTodos } from "./api";

export function useTodos() {
  return useQuery({
    queryKey: ["todos"],
    queryFn: getTodos,
  });
}

// export function useTodos(ids) {
//   return useQueries({
//     queries: (ids ?? [])?.map((id) => {
//       return {
//         queryKey: ["todo", { id }],
//         queryFn: () => getTodo(id),
//       };
//     }),
//   });
// }
