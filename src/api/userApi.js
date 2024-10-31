import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { addToken, addUserData } from "../store/reducers/authentication";
import { store } from "../store";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;
axios.defaults.withCredentials = false;

export const checkAuth = createAsyncThunk(
  "user/checkAuth",
  async ({}, { dispatch }) => {
    try {
      const tokenKey = store.getState().authentication.token;
      const headers = { 
        headers: { 
          "Authorization": `Bearer ${tokenKey}` 
        } 
      };
      
      const response = await axios.post(
        `${BASE_URL}/api/user/checkAuth`, 
        { test: "----------" }, 
        headers
      );

      return response.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);