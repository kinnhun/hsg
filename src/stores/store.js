import { create } from "zustand";
import { createCartSlice } from "./slices/cartSlice";
import { createUserSlice } from "./slices/userSlice";
import { immer } from "zustand/middleware/immer";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { createEmployeeSlice } from "./slices/EmployeeSlice";

export const useStore = create()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((...a) => ({
          ...createUserSlice(...a),
          ...createCartSlice(...a),
          ...createEmployeeSlice(...a),
        })),
      ),
      {
        name: "local-storage",
      },
    ),
  ),
);
