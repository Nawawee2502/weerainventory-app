import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addKt_trwdt = createAsyncThunk(
    "kt_trwdt/add",
    async ({ refno, product_code, qty, unit_code, uprice, amt, expire_date, texpire_date, temperature1 }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_trwdt", {
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

export const updateKt_trwdt = createAsyncThunk(
    "kt_trwdt/update",
    async (productData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_trwdt", {
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

export const deleteKt_trwdt = createAsyncThunk(
    "kt_trwdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteKt_trwdt", {
                refno,
                product_code
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_trwdtAllinnerjoin = createAsyncThunk(
    "kt_trwdt/readAll",
    async ({ offset, limit }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_trwdtAllinnerjoin", {
                offset,
                limit
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const countKt_trwdt = createAsyncThunk(
    "kt_trwdt/count",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countKt_trwdt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_trwdtAlljoindt = createAsyncThunk(
    "kt_trwdt/readAllJoin",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_trwdtAlljoindt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);