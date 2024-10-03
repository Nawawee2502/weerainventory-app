import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";


const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addBranch = createAsyncThunk(
  "branch/add",
  async ({ branch_code, branch_name, addr1, addr2, tel1 }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/addbranch", {
        branch_code,
        branch_name,
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

export const updateBranch = createAsyncThunk(
  "branch/update",
  async ({ branch_code, branch_name, addr1, addr2, tel1 }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/updatebranch", {
        branch_code,
        branch_name,
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


export const deleteBranch = createAsyncThunk(
  "branch/delete",
  async ({ branch_code }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/deletebranch", {
        branch_code,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);


export const branchAll = createAsyncThunk(
  "branch/read",
  async ({ offset, limit }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/branchall", { offset: offset, limit: limit });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const countBranch = createAsyncThunk(
  "branch/count",
  async ({ test }, { dispatch }) => {
    try {
      console.log("____TETS____");
      const res = await axios.post(BASE_URL + "/api/countbranch", { test: test });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);


export const searchBranch = createAsyncThunk(
  "productbranch/search",
  async ({ branch_name }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/searchbranchname", {
        branch_name,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);

export const lastBranchCode = createAsyncThunk(
  "branch/code",
  async ({ test }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/branchcode", { test: test });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
);