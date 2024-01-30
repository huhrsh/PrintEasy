import { createSlice, configureStore } from '@reduxjs/toolkit';

let initialUserState = { user: null };
const userSlice = createSlice({
  name: "user",
  initialState: initialUserState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

let initialShopState = { shop: null };
const shopSlice = createSlice({
  name: "shop",
  initialState: initialShopState,
  reducers: {
    setShop: (state, action) => {
      state.shop = action.payload;
    },
    clearShop: (state) => {
      state.shop = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export const { setShop, clearShop } = shopSlice.actions;

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    shop: shopSlice.reducer,
  },
});
