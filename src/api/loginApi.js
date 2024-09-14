import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { addToken ,getToken} from "../store/reducers/authentication";

import { useDispatch, useSelector } from "react-redux";

import { store } from "../store/";

axios.defaults.withCredentials = false;
const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const login = createAsyncThunk(
  "",
  async ({ username, password }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/login", {
        username: username,
        password: password,
      });

      console.log(res.data);
      console.log(res.data.tokenKey);
     
      dispatch(addToken(res.data.tokenKey));
      // if (res.data.result === true) {
      // }
      return res.data;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
);

export const checkAuth = createAsyncThunk(
  "",
  async ({ username, password  }, { dispatch }) => {
    try {

      const tokenKey = store.getState().authentication.token;
      console.log('----------Middle Token-----');
      console.log(tokenKey);

      const headers = { headers: {"Authorization" : `Bearer ${tokenKey}`} }
      const res = await axios.post(BASE_URL + "/api/user/checkAuth", {
        test: "----------"
      },headers);

      console.log(res.data);
      return res.data;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
);