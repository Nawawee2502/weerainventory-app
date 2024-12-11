import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addSupplier = createAsyncThunk(
  "supplier/add",
  async ({ supplier_code, supplier_name, addr1, addr2, tel1, contact_name, payment1 }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/addsupplier", {
        supplier_code,
        supplier_name,
        addr1,
        addr2,
        tel1,
        contact_name,
        payment1,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const updateSupplier = createAsyncThunk(
  "supplier/update",
  async ({ supplier_code, supplier_name, addr1, addr2, tel1, contact_name, payment1 }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/updatesupplier", {
        supplier_code,
        supplier_name,
        addr1,
        addr2,
        tel1,
        contact_name,
        payment1,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  "supplier/delete",
  async ({ supplier_code }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/deletesupplier", {
        supplier_code,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const supplierAll = createAsyncThunk(
  "supplier/read",
  async ({ offset, limit }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/supplierall", { offset: offset, limit: limit });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const countSupplier = createAsyncThunk(
  "supplier/count",
  async ({ test }, { dispatch }) => {
    try {
      console.log("____TETS____");
      const res = await axios.post(BASE_URL + "/api/countsupplier", { test: test });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const searchSupplier = createAsyncThunk(
  "productsupplier/search",
  async ({ supplier_name }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/searchsuppliername", {
        supplier_name,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const lastSupplierCode = createAsyncThunk(
  "supplier/code",
  async ({ test }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/suppliercode", { test: test });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);