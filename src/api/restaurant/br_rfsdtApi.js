import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addBr_rfsdt = createAsyncThunk(
    "br_rfsdt/add",
    async ({ refno, product_code, qty, unit_code, uprice, tax1, expire_date, texpire_date, instant_saving1, temperature1, amt }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_rfsdt", {
                refno,
                product_code,
                qty,
                unit_code,
                uprice,
                tax1,
                expire_date,
                texpire_date,
                instant_saving1,
                temperature1,
                amt
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const updateBr_rfsdt = createAsyncThunk(
    "br_rfsdt/update",
    async (productData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateBr_rfsdt", {
                refno: productData.refno,
                product_code: productData.product_code,
                qty: productData.qty,
                unit_code: productData.unit_code,
                uprice: productData.uprice,
                tax1: productData.tax1,
                expire_date: productData.expire_date,
                texpire_date: productData.texpire_date,
                instant_saving1: productData.instant_saving1,
                temperature1: productData.temperature1,
                amt: productData.amt
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteBr_rfsdt = createAsyncThunk(
    "br_rfsdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteBr_rfsdt", {
                refno,
                product_code
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfsdtAllinnerjoin = createAsyncThunk(
    "br_rfsdt/readAllInner",
    async ({ offset, limit }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rfsdtAllinnerjoin", {
                offset,
                limit
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfsdtAlljoindt = createAsyncThunk(
    "br_rfsdt/readAll",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rfsdtAlljoindt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const countBr_rfsdt = createAsyncThunk(
    "br_rfsdt/count",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countBr_rfsdt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);