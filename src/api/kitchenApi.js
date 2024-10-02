import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";


const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addKitchen = createAsyncThunk(
  "kitchen/add",
  async ({ kitchen_code, kitchen_name, addr1, addr2, tel1 }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/addkitchen", {
        kitchen_code,
        kitchen_name,
        addr1,
        addr2,
        tel1,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const updateKitchen = createAsyncThunk(
  "kitchen/update",
  async ({ kitchen_code, kitchen_name, addr1, addr2, tel1 }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/updatekitchen", {
        kitchen_code,
        kitchen_name,
        addr1,
        addr2,
        tel1,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);


export const deleteKitchen = createAsyncThunk(
  "kitchen/delete",
  async ({ kitchen_code }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/deletekitchen", {
        kitchen_code,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);


export const kitchenAll = createAsyncThunk(
  "kitchen/read",
  async ({ offset, limit }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/kitchenall", { offset: offset, limit: limit });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const countKitchen = createAsyncThunk(
  "kitchen/count",
  async ({ test }, { dispatch }) => {
    try {
      console.log("____TETS____");
      const res = await axios.post(BASE_URL + "/api/countkitchen", { test: test });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);


