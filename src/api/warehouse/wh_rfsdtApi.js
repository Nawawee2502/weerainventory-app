import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addWh_rfsdt = createAsyncThunk(
    "wh_rfsdt/add",
    async ({ refno, product_code, qty, unit_code, uprice, tax1, expire_date, texpire_date, instant_saving1, temperature1, amt }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addWh_rfsdt", {
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
            console.error(error.message);
            throw error;
        }
    }
);

export const updateWh_rfsdt = createAsyncThunk(
    "wh_rfsdt/update",
    async (productData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateWh_rfsdt", {
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
            console.error(error.message);
            throw error;
        }
    }
);

export const deleteWh_rfsdt = createAsyncThunk(
    "wh_rfsdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteWh_rfsdt", {
                refno,
                product_code
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const Wh_rfsdtAllinnerjoin = createAsyncThunk(
    "wh_rfsdt/readAll",
    async ({ offset, limit }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Wh_rfsdtAllinnerjoin", {
                offset,
                limit
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const Wh_rfsdtAlljoindt = createAsyncThunk(
    "wh_rfsdt/readAllJoin",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Wh_rfsdtAlljoindt", {
                refno
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const countWh_rfsdt = createAsyncThunk(
    "wh_rfsdt/count",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countWh_rfsdt", {
                refno
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);