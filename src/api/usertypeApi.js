import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";


const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addTypeuser = createAsyncThunk(
  "usertype/add",
  async ({ typeuser_code, typeuser_name }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/addtypeuser", {
        typeuser_code,
        typeuser_name,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const updateTypeuser = createAsyncThunk(
  "typeuser/update",
  async ({ typeuser_code, typeuser_name }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/updatetypeuser", {
        typeuser_code,
        typeuser_name,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);


export const deletetypeuser = createAsyncThunk(
  "typeuser/delete",
  async ({ typeuser_code }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/deletetypeuser", {
        typeuser_code,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);


export const fetchAlltypeuser = createAsyncThunk(
  "typeuser/read",
  async ({ offset, limit }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/typeuserall", { offset: offset, limit: limit });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const lastTypeuserCode = createAsyncThunk(
  "typeuser/code",
  async ( { test },{ dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/typeusercode", { test: test });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const countTypeuser = createAsyncThunk(
  "typeuser/count",
  async ({ test }, { dispatch }) => {
    try {
      console.log("____TETS____");
      const res = await axios.post(BASE_URL + "/api/counttypeuser", { test: test });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const searchtypeuser = createAsyncThunk(
  "typeuser/search",
  async ({ typeuser_name }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/searchtypeusername", {
        typeuser_name,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);
