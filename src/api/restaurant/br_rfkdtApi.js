import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addBr_rfkdt = createAsyncThunk(
    "br_rfkdt/add",
    async ({ refno, product_code, qty, unit_code, uprice, tax1, expire_date, texpire_date, temperature1, amt }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_rfkdt", {
                refno,
                product_code,
                qty,
                unit_code,
                uprice,
                tax1,
                expire_date,
                texpire_date,
                temperature1,
                amt
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const updateBr_rfkdt = createAsyncThunk(
    "br_rfkdt/update",
    async (productData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateBr_rfkdt", {
                refno: productData.refno,
                product_code: productData.product_code,
                qty: productData.qty,
                unit_code: productData.unit_code,
                uprice: productData.uprice,
                tax1: productData.tax1,
                expire_date: productData.expire_date,
                texpire_date: productData.texpire_date,
                temperature1: productData.temperature1,
                amt: productData.amt
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteBr_rfkdt = createAsyncThunk(
    "br_rfkdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteBr_rfkdt", {
                refno,
                product_code
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfkdtAllinnerjoin = createAsyncThunk(
    "br_rfkdt/readAllInner",
    async ({ offset, limit }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rfkdtAllinnerjoin", {
                offset,
                limit
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfkdtAlljoindt = createAsyncThunk(
    "br_rfkdt/readAll",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rfkdtAlljoindt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const countBr_rfkdt = createAsyncThunk(
    "br_rfkdt/count",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countBr_rfkdt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);