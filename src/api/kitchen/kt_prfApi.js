import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addKt_prf = createAsyncThunk(
    "kt_prf/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_prf", {
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

export const updateKt_prf = createAsyncThunk(
    "kt_prf/update",
    async (orderData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_prf", orderData);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteKt_prf = createAsyncThunk(
    "kt_prf/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteKt_prf", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_prfAllrdate = createAsyncThunk(
    "kt_prf/readByDate",
    async ({ rdate1, rdate2, kitchen_name }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_prfAllrdate", {
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

export const Kt_prfAlljoindt = createAsyncThunk(
    "kt_prf/readAll",
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

            const res = await axios.post(BASE_URL + "/api/Kt_prfAlljoindt", payload);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_prfByRefno = createAsyncThunk(
    "kt_prf/readByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_prfByRefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_prfrefno = createAsyncThunk(
    "kt_prf/getRefno",
    async ({ kitchen_code, month, year }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_prfrefno", {
                kitchen_code,
                month,
                year
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchKt_prfRunno = createAsyncThunk(
    "kt_prf/searchRunno",
    async ({ myear, monthh }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchKt_prfRunno", {
                myear,
                monthh
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const getKtPrfByRefno = createAsyncThunk(
    "kt_prf/getByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/getKtPrfByRefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);