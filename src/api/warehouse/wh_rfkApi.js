import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addWh_rfk = createAsyncThunk(
    "wh_rfk/add",
    async (req, { dispatch }) => {
        try {
            console.log("API APP");
            console.log(req);
            const res = await axios.post(BASE_URL + "/api/addWh_rfk", {
                headerData: req.headerData,
                productArrayData: req.productArrayData,
                footerData: req.footerData,
            });
            console.log("API APP");
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const updateWh_rfk = createAsyncThunk(
    "wh_rfk/update",
    async (orderData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateWh_rfk", {
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

export const Wh_rfkByRefno = createAsyncThunk(
    "wh_rfk/read",
    async (refno, { dispatch }) => {
        try {
            console.log("REFNO", refno)
            const res = await axios.post(BASE_URL + "/api/wh_rfkbyrefno", {
                refno,
            });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const deleteWh_rfk = createAsyncThunk(
    "wh_rfk/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteWh_rfk", {
                refno,
            });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const wh_rfkAlljoindt = createAsyncThunk(
    "wh_rfk/read",
    async ({ offset = 0, limit = 5, rdate1, rdate2, kitchen_code, product_code }, { dispatch }) => {
        try {
            const payload = {
                offset,
                limit
            };

            // เพิ่มค่าในตัวแปรที่จะส่งเฉพาะเมื่อมีค่า
            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (kitchen_code) payload.kitchen_code = kitchen_code;
            if (product_code) payload.product_code = product_code;

            const res = await axios.post(BASE_URL + "/api/wh_rfkAlljoindt", payload);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const wh_rfkAllrdate = createAsyncThunk(
    "wh_rfk/read",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Wh_rfkAllrdate", {
                refno,
            });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const refno = createAsyncThunk(
    "wh_rfk/code",
    async ({ test }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Wh_rfkrefno");
            // Return just the refno if it exists, otherwise null
            return res.data?.data?.refno || null;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const countwh_rfk = createAsyncThunk(
    "wh_rfk/count",
    async ({ test }, { dispatch }) => {
        try {
            console.log("____TEST____");
            const res = await axios.post(BASE_URL + "/api/countWh_rfk", { test: test });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);