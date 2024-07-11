import { createSlice, configureStore } from '@reduxjs/toolkit';
const apiUrl = process.env.NODE_ENV === 'development' ?  process.env.REACT_APP_API_URL_DEV:process.env.REACT_APP_API_URL_PROD;
const websocketUrl=process.env.NODE_ENV==='development'?process.env.REACT_APP_WEBSOCKET_URL_DEV:process.env.REACT_APP_WEBSOCKET_URL_PROD;

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
export const getApiUrl = () => apiUrl;
export const getWebsocketUrl = () => websocketUrl;

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    shop: shopSlice.reducer,
  },
});
