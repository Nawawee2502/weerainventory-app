import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   token: localStorage.getItem('token') || null,  // เปลี่ยนจาก '' เป็น null
//   userData: localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null,
//   userData2: localStorage.getItem('userData2') ? JSON.parse(localStorage.getItem('userData2')) : null,
// };
const initialState = {
  token: null,
  userData: null,
  userData2: null
};

export const authenticationSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {
    removeToken: (state) => {
      state.token = '';
      localStorage.removeItem('token');
    },
    getToken: (state) => {
      return state.token;
    },
    addToken: (state, action) => {
      if (action.payload) {
        state.token = action.payload;
        localStorage.setItem('token', action.payload);
      }
    },
    addUserData: (state, action) => {
      if (action.payload) {
        state.userData = action.payload;
        localStorage.setItem('userData', JSON.stringify(action.payload));
      }
    },
    addUserData2: (state, action) => {
      if (action.payload) {
        state.userData2 = action.payload;
        localStorage.setItem('userData2', JSON.stringify(action.payload));
      }
    },
    getUserData: (state) => {
      return state.userData;
    },
    getUserData2: (state) => {
      return state.userData2;
    },
    logout: (state) => {
      // ลบข้อมูลทั้งหมดออกจาก localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('userData2');
      localStorage.removeItem('temp_username');
      localStorage.removeItem('temp_password');

      // Reset state
      state.token = '';
      state.userData = null;
      state.userData2 = null;
    }
  },
});

export const {
  addToken,
  removeToken,
  getToken,
  addUserData,
  addUserData2,
  getUserData,
  getUserData2,
  logout
} = authenticationSlice.actions;

export default authenticationSlice.reducer;