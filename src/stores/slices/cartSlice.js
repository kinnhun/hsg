const initialState = {
  products: [],
  total: 0,
};
export const createCartSlice = (set, get) => ({
  ...initialState,
  incQty: (productId) =>
    set((state) => {
      const foundProduct = state.products.find(
        (product) => product.id === productId,
      );
      if (foundProduct) {
        foundProduct.qty += 1;
      }
    }),
  decQty: (productId) =>
    set((state) => {
      const foundIndex = state.products.findIndex(
        (product) => product.id === productId,
      );

      if (foundIndex !== -1) {
        if (state.products[foundIndex].qty === 1) {
          state.products.splice(foundIndex, 1);
        } else {
          state.products[foundIndex].qty -= 1;
        }
      }
    }),
  addProduct: (product) =>
    set((state) => {
      state.products.push({ ...product, qty: 1 });
    }),
  removeProduct: (productId) =>
    set((state) => {
      state.products = state.products.filter(
        (product) => product.id !== productId,
      );
    }),
  getProductById: (productId) => {
    console.log(get().products.find((product) => product.id === productId));
    return get().products.find((product) => product.id === productId);
  },
  setTotal: (total) =>
    set((state) => {
      state.total = total;
    }),

  reset: () => set(() => initialState),
});
