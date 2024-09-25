import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";


const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addUnit = createAsyncThunk(
  "unit/add",
  async ({ unit_code, unit_name }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/addunit", {
        unit_code,
        unit_name,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const updateUnit = createAsyncThunk(
  "unit/update",
  async ({ unit_code, unit_name }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/updateunit", {
        unit_code,
        unit_name,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);


export const deleteUnit = createAsyncThunk(
  "unit/delete",
  async ({ unit_code }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/deleteunit", {
        unit_code,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);


export const unitAll = createAsyncThunk(
  "unit/read",
  async ({ offset, limit }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/unitall", { offset: offset, limit: limit });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const countUnit = createAsyncThunk(
  "unit/count",
  async ({ test }, { dispatch }) => {
    try {
      console.log("____TETS____");
      const res = await axios.post(BASE_URL + "/api/countunit", { test: test });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);


