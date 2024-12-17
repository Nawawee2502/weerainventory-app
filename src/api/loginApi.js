import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { addToken, getToken, addUserData, getUserData } from "../store/reducers/authentication";

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
      localStorage.setItem("userData2", JSON.stringify(res.data.data));
      dispatch(addToken(res.data.tokenKey));
      dispatch(addUserData(res.data.data));
      // if (res.data.result === true) {
      // }
      return res.data;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
);

export const addUser = createAsyncThunk(
  "",
  async ({ user_code, username, password }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/addUser", {
        user_code: user_code,
        username: username,
        password: password,
      });

      console.log(res.data);

      return res.data;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
);

export const updateUser = createAsyncThunk(
  "",
  async ({ user_code, username, password, email, typeuser_code, line_uid }, { dispatch }) => {
    try {
      const updateData = {
        user_code,
        username,
        email,
        typeuser_code,
        line_uid,
      };

      // เพิ่ม password เฉพาะเมื่อมีค่า
      if (password) {
        updateData.password = password;
      }

      const res = await axios.post(BASE_URL + "/api/updateUser", updateData);
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
);

export const deleteUser = createAsyncThunk(
  "",
  async ({ user_code }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/deleteUser", {
        user_code: user_code,
      });

      console.log(res.data);
      return res.data;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
);

export const checkAuth = createAsyncThunk(
  "",
  async ({ username, password }, { dispatch }) => {
    try {

      const tokenKey = store.getState().authentication.token;
      console.log('----------Middle Token-----');
      console.log(tokenKey);

      const headers = { headers: { "Authorization": `Bearer ${tokenKey}` } }
      const res = await axios.post(BASE_URL + "/api/user/checkAuth", {
        test: "----------"
      }, headers);

      console.log(res.data);
      return res.data;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
);

export const register = createAsyncThunk(
  "user/register",
  async (userData, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/addUser", {
        user_code: userData.user_code,
        username: userData.username,
        typeuser_code: userData.typeuser_code,
        password: userData.password,
        email: userData.email,
        line_uid: userData.line_uid
      });
      return res.data;
    } catch (error) {
      console.error("Registration error:", error.message);
      throw error;
    }
  }
);

// เพิ่ม API สำหรับดึงข้อมูล users ทั้งหมด
export const showUser = createAsyncThunk(
  "user/getAll",
  async ({ offset = 0, limit = 10 }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/userAll", {
        offset,
        limit
      });
      console.log('API Response:', res.data); // เพิ่ม log เพื่อดูข้อมูลที่ได้
      return res.data;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
);

// เพิ่ม API สำหรับค้นหา user
export const searchUser = createAsyncThunk(
  "user/search",
  async ({ username }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/searchUserName", {
        username
      });
      return res.data;
    } catch (error) {
      console.error("Search error:", error.message);
      throw error;
    }
  }
);

export const getLastUserCode = createAsyncThunk(
  "user/getLastCode",
  async () => {
    try {
      const res = await axios.post(BASE_URL + "/api/getlastusercode");
      return res.data;
    } catch (error) {
      console.error("Error fetching last user code:", error.message);
      throw error;
    }
  }
);