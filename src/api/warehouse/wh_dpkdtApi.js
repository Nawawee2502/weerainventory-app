import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addWh_dpkdt = createAsyncThunk(
    "wh_dpkdt/add",
    async ({ refno, product_code, qty, unit_code, uprice, tax1, expire_date, texpire_date, temperature1, amt }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addWh_dpkdt", {
                refno,
                product_code,
                qty,
                unit_code,
                uprice,
                tax1,
                expire_date,
                texpire_date,
                temperature1,
                amt,
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const updateWh_dpkdt = createAsyncThunk(
    "wh_dpkdt/update",
    async (productData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateWh_dpkdt", {
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
            console.error(error.message);
            throw error;
        }
    }
);

export const deleteWh_dpkdt = createAsyncThunk(
    "wh_dpkdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteWh_dpkdt", {
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

export const Wh_dpkdtAlljoindt = createAsyncThunk(
    "wh_dpkdt/read",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Wh_dpkdtAlljoindt", {
                refno
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const countWh_dpkdt = createAsyncThunk(
    "wh_dpkdt/count",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countWh_dpkdt", {
                refno
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);