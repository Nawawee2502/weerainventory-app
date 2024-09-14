import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: '',
};

export const authenticationSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {
    addToken: (state , action) => {
      state.token = action.payload;
    },
    removeToken: (state) => {
      state.token = '';
    },
    getToken:(state) =>{
      return state.token;
    }
  },
});

export const {addToken,removeToken,getToken} = authenticationSlice.actions;

export default authenticationSlice.reducer;

