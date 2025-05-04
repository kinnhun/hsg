const initialState = {
  employees: [],
};

export const createEmployeeSlice = (set) => ({
  ...initialState,
  setEmployees: (employees) =>
    set((state) => {
      state.employees = [...state.employees, employees];
    }),
});
