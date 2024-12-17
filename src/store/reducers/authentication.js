import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: '',
  userData: '',
};

export const authenticationSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {
    addToken: (state, action) => {
      state.token = action.payload;
    },
    removeToken: (state) => {
      state.token = '';
    },
    getToken: (state) => {
      return state.token;
    },
    addUserData: (state, action) => {
      state.userData = action.payload;
    },
    getUserData: (state) => {
      return state.userData;
    },
    logout: (state) => {
      localStorage.removeItem('userData2');  // ลบ userData
      state.token = '';  // ลบ token ใน redux
      state.userData = '';  // ลบ userData ใน redux
    }
  },
});

export const { addToken, removeToken, getToken, addUserData, getUserData, logout } = authenticationSlice.actions;

export default authenticationSlice.reducer;

