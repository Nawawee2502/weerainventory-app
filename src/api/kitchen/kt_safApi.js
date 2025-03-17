import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// kt_saf API actions
export const addKt_saf = createAsyncThunk(
    "kt_saf/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_saf", {
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

export const updateKt_saf = createAsyncThunk(
    "kt_saf/update",
    async (orderData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_saf", orderData);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteKt_saf = createAsyncThunk(
    "kt_saf/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteKt_saf", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_safAllrdate = createAsyncThunk(
    "kt_saf/readByDate",
    async ({ rdate1, rdate2, kitchen_name }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_safAllrdate", {
                rdate1,
                rdate2,
                kitchen_name
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_safAlljoindt = createAsyncThunk(
    "kt_saf/readAll",
    async ({ offset = 0, limit = 5, rdate, rdate1, rdate2, kitchen_code, product_code, refno }, { dispatch }) => {
        try {
            const payload = {
                offset,
                limit
            };

            if (refno) payload.refno = refno;
            if (rdate) payload.rdate = rdate;
            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (kitchen_code) payload.kitchen_code = kitchen_code;
            if (product_code) payload.product_code = product_code;

            const res = await axios.post(BASE_URL + "/api/Kt_safAlljoindt", payload);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_safByRefno = createAsyncThunk(
    "kt_saf/readByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_safbyrefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchKt_safrefno = createAsyncThunk(
    "kt_saf/searchRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchKt_safrefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_safrefno = createAsyncThunk(
    "kt_saf/getRefno",
    async ({ kitchen_code, date }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_safrefno", {
                kitchen_code,
                date
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchKt_safRunno = createAsyncThunk(
    "kt_saf/searchRunno",
    async ({ myear, monthh }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchKt_safRunno", {
                myear,
                monthh
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const countKt_saf = createAsyncThunk(
    "kt_saf/count",
    async ({ rdate }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countKt_saf", { rdate });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);