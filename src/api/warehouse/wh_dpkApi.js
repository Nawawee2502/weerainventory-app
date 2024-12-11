import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addWh_dpk = createAsyncThunk(
    "wh_dpk/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addWh_dpk", {
                headerData: req.headerData,
                productArrayData: req.productArrayData,
                footerData: req.footerData,
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const updateWh_dpk = createAsyncThunk(
    "wh_dpk/update",
    async (orderData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateWh_dpk", {
                refno: orderData.refno,
                rdate: orderData.rdate,
                trdate: orderData.trdate,
                myear: orderData.myear,
                monthh: orderData.monthh,
                kitchen_code: orderData.kitchen_code,
                taxable: orderData.taxable,
                nontaxable: orderData.nontaxable,
                total: orderData.total,
                user_code: orderData.user_code
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const Wh_dpkByRefno = createAsyncThunk(
    "wh_dpk/read",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/wh_dpkbyrefno", { refno });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const deleteWh_dpk = createAsyncThunk(
    "wh_dpk/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteWh_dpk", { refno });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const wh_dpkAlljoindt = createAsyncThunk(
    "wh_dpk/read",
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

            const res = await axios.post(BASE_URL + "/api/wh_dpkAlljoindt", payload);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const wh_dpkrefno = createAsyncThunk(
    "wh_dpk/code",
    async ({ test, month, year }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/wh_dpkrefno", {
                test: test,
                month: month,
                year: year
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);