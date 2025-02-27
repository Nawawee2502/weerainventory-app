import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// kt_grf API actions
export const addKt_grf = createAsyncThunk(
    "kt_grf/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_grf", {
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

export const updateKt_grf = createAsyncThunk(
    "kt_grf/update",
    async (orderData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_grf", orderData);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteKt_grf = createAsyncThunk(
    "kt_grf/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteKt_grf", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_grfAllrdate = createAsyncThunk(
    "kt_grf/readByDate",
    async ({ rdate1, rdate2, kitchen_name }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_grfAllrdate", {
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

export const Kt_grfAlljoindt = createAsyncThunk(
    "kt_grf/readAll",
    async ({ offset = 0, limit = 5, rdate1, rdate2, kitchen_code, product_code }, { dispatch }) => {
        try {
            const payload = {
                offset,
                limit
            };

            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (kitchen_code) payload.kitchen_code = kitchen_code;
            if (product_code) payload.product_code = product_code;

            const res = await axios.post(BASE_URL + "/api/Kt_grfAlljoindt", payload);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_grfByRefno = createAsyncThunk(
    "kt_grf/readByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_grfByRefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

// Added searchKt_grfrefno to match br_grf structure
export const searchKt_grfrefno = createAsyncThunk(
    "kt_grf/searchRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchKt_grfrefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

// Modified Kt_grfrefno to match Br_grfrefno parameters
export const Kt_grfrefno = createAsyncThunk(
    "kt_grf/getRefno",
    async ({ kitchen_code, date }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_grfrefno", {
                kitchen_code,
                date
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchKt_grfRunno = createAsyncThunk(
    "kt_grf/searchRunno",
    async ({ myear, monthh }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchKt_grfRunno", {
                myear,
                monthh
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);