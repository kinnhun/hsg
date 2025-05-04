export const createUserSlice = (set) => ({
  address: "",
  age: 0,
  fullName: "",
  userName: "",
  setAddress: (address) =>
    set((state) => {
      state.address = address;
    }),
  fetchUser: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({
      address: "",
      fullName: "John Doe",
      userName: "johnDoe@test.com",
      age: 30,
    });
  },
});
