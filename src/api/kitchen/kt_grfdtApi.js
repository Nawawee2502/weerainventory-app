import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addKt_grfdt = createAsyncThunk(
    "kt_grfdt/add",
    async ({ refno, product_code, qty, unit_code, uprice, amt, expire_date, texpire_date, temperature1 }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_grfdt", {
                refno,
                product_code,
                qty,
                unit_code,
                uprice,
                amt,
                expire_date,
                texpire_date,
                temperature1
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const updateKt_grfdt = createAsyncThunk(
    "kt_grfdt/update",
    async (productData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_grfdt", {
                refno: productData.refno,
                product_code: productData.product_code,
                qty: productData.qty,
                unit_code: productData.unit_code,
                uprice: productData.uprice,
                amt: productData.amt,
                expire_date: productData.expire_date,
                texpire_date: productData.texpire_date,
                temperature1: productData.temperature1
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteKt_grfdt = createAsyncThunk(
    "kt_grfdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteKt_grfdt", {
                refno,
                product_code
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_grfdtAlljoindt = createAsyncThunk(
    "kt_grfdt/readAll",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_grfdtAlljoindt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const countKt_grfdt = createAsyncThunk(
    "kt_grfdt/count",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countKt_grfdt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);