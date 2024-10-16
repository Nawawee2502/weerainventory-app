import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";


const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addTypeproduct = createAsyncThunk(
  "typeproduct/add",
  async ({ typeproduct_code, typeproduct_name }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/addTypeproduct", {
        typeproduct_code,
        typeproduct_name,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const updateTypeproduct = createAsyncThunk(
  "typeproduct/update",
  async ({ typeproduct_code, typeproduct_name }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/updateTypeproduct", {
        typeproduct_code,
        typeproduct_name,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);


export const deleteTypeproduct = createAsyncThunk(
  "typeproduct/delete",
  async ({ typeproduct_code }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/deleteTypeproduct", {
        typeproduct_code,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);


export const fetchAllTypeproducts = createAsyncThunk(
  "typeproduct/read",
  async ({ offset, limit }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/typeproductall", { offset: offset, limit: limit });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const lastTypeproductCode = createAsyncThunk(
  "typeproduct/code",
  async ( { test },{ dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/typeproductcode", { test: test });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const countProduct = createAsyncThunk(
  "typeproduct/count",
  async ({ test }, { dispatch }) => {
    try {
      console.log("____TETS____");
      const res = await axios.post(BASE_URL + "/api/counttypeproduct", { test: test });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);



export const searchTypeproduct = createAsyncThunk(
  "typeproduct/search",
  async ({ typeproduct_name }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/searchtypeproductname", {
        typeproduct_name,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);
