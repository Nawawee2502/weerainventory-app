import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// br_rfk API actions
export const addBr_rfk = createAsyncThunk(
    "br_rfk/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_rfk", {
                headerData: req.headerData,
                productArrayData: req.productArrayData,
                footerData: req.footerData,
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const updateBr_rfk = createAsyncThunk(
    "br_rfk/update",
    async (orderData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateBr_rfk", orderData);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteBr_rfk = createAsyncThunk(
    "br_rfk/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteBr_rfk", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfkAllrdate = createAsyncThunk(
    "br_rfk/readByDate",
    async ({ rdate1, rdate2, kitchen_name, branch_name }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rfkAllrdate", {
                rdate1,
                rdate2,
                kitchen_name,
                branch_name
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfkAlljoindt = createAsyncThunk(
    "br_rfk/readAll",
    async ({ offset = 0, limit = 5, rdate, rdate1, rdate2, kitchen_code, branch_code, product_code }, { dispatch }) => {
        try {
            const payload = {
                offset,
                limit
            };

            if (rdate) payload.rdate = rdate;
            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (kitchen_code) payload.kitchen_code = kitchen_code;
            if (branch_code) payload.branch_code = branch_code;
            if (product_code) payload.product_code = product_code;

            const res = await axios.post(BASE_URL + "/api/Br_rfkAlljoindt", payload);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfkByRefno = createAsyncThunk(
    "br_rfk/readByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rfkByRefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchBr_rfkrefno = createAsyncThunk(
    "br_rfk/searchRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchBr_rfkrefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfkrefno = createAsyncThunk(
    "br_rfk/getRefno",
    async (_, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rfkrefno");
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchBr_rfkRunno = createAsyncThunk(
    "br_rfk/searchRunno",
    async ({ myear, monthh }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchBr_rfkRunno", {
                myear,
                monthh
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfkUsedRefnos = createAsyncThunk(
    "br_rfk/usedRefnos",
    async (_, thunkAPI) => {
        try {
            const response = await axios.post(BASE_URL + "/api/used-refnos");
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response ? error.response.data : error.message
            );
        }
    }
);

export const getRfkByRefno = createAsyncThunk(
    "br_rfk/getByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/getRfkByRefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);