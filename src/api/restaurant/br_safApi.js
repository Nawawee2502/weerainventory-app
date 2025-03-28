import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// br_saf API actions
export const addBr_saf = createAsyncThunk(
    "br_saf/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_saf", {
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

export const updateBr_saf = createAsyncThunk(
    "br_saf/update",
    async (orderData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateBr_saf", orderData);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteBr_saf = createAsyncThunk(
    "br_saf/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteBr_saf", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_safAllrdate = createAsyncThunk(
    "br_saf/readByDate",
    async ({ rdate1, rdate2, branch_name }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_safAllrdate", {
                rdate1,
                rdate2,
                branch_name
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_safAlljoindt = createAsyncThunk(
    "br_saf/readAll",
    async ({ offset = 0, limit = 5, rdate, rdate1, rdate2, branch_code, product_code }, { dispatch }) => {
        try {
            const payload = {
                offset,
                limit
            };

            if (rdate) payload.rdate = rdate;
            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (branch_code) payload.branch_code = branch_code;
            if (product_code) payload.product_code = product_code;

            const res = await axios.post(BASE_URL + "/api/Br_safAlljoindt", payload);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_safByRefno = createAsyncThunk(
    "br_saf/readByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_safByRefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchBr_safrefno = createAsyncThunk(
    "br_saf/searchRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchBr_safrefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_safrefno = createAsyncThunk(
    "br_saf/getRefno",
    async ({ branch_code, date }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_safrefno", {
                branch_code,
                date
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchBr_safRunno = createAsyncThunk(
    "br_saf/searchRunno",
    async ({ myear, monthh }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchBr_safRunno", {
                myear,
                monthh
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const countBr_saf = createAsyncThunk(
    "br_saf/count",
    async ({ rdate }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countBr_saf", { rdate });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const getSafByRefno = createAsyncThunk(
    "br_saf/getByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/getSafByRefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);