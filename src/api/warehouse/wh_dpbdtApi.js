import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// แก้ไข addWh_dpbdt ให้เหมือน dpk 
export const addWh_dpbdt = createAsyncThunk(
    "wh_dpbdt/add",
    async ({ refno, product_code, qty, unit_code, uprice, tax1, expire_date, texpire_date, amt }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addWh_dpbdt", {
                refno,
                product_code,
                qty,
                unit_code,
                uprice,
                tax1,
                expire_date,
                texpire_date,
                amt
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

// แก้ไข updateWh_dpbdt ให้เหมือน dpk
export const updateWh_dpbdt = createAsyncThunk(
    "wh_dpbdt/update",
    async (productData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateWh_dpbdt", {
                refno: productData.refno,
                product_code: productData.product_code,
                qty: productData.qty,
                unit_code: productData.unit_code,
                uprice: productData.uprice,
                tax1: productData.tax1,
                expire_date: productData.expire_date,
                texpire_date: productData.texpire_date,
                amt: productData.amt
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

// แก้ไข deleteWh_dpbdt ให้เหมือน dpk
export const deleteWh_dpbdt = createAsyncThunk(
    "wh_dpbdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteWh_dpbdt", {
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

// wh_dpbdtApi.js - update the Wh_dpbdtAlljoindt function
export const Wh_dpbdtAlljoindt = createAsyncThunk(
    "wh_dpbdt/read",
    async (refno, { dispatch }) => {
        try {
            // Make sure we're sending refno as an object property
            const payload = typeof refno === 'object' ? refno : { refno };
            const res = await axios.post(BASE_URL + "/api/Wh_dpbdtAlljoindt", payload);
            return res.data;
        } catch (error) {
            console.error("Error in Wh_dpbdtAlljoindt:", error);
            throw error;
        }
    }
);

export const countWh_dpbdt = createAsyncThunk(
    "wh_dpbdt/count",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countWh_dpbdt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);