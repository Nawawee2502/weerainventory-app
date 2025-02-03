import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addKt_prfdt = createAsyncThunk(
    "kt_prfdt/add",
    async ({ refno, product_code, qty, unit_code, uprice, amt, expire_date, texpire_date, temperature1 }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_prfdt", {
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

export const updateKt_prfdt = createAsyncThunk(
    "kt_prfdt/update",
    async (productData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_prfdt", {
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

export const deleteKt_prfdt = createAsyncThunk(
    "kt_prfdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteKt_prfdt", {
                refno,
                product_code
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_prfdtAlljoindt = createAsyncThunk(
    "kt_prfdt/readAll",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_prfdtAlljoindt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_prfdtAllinnerjoin = createAsyncThunk(
    "kt_prfdt/readAllInner",
    async ({ offset, limit }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_prfdtAllinnerjoin", {
                offset,
                limit
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const countKt_prfdt = createAsyncThunk(
    "kt_prfdt/count",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countKt_prfdt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);