import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addWh_rfs = createAsyncThunk(
    "wh_rfs/add",
    async (req, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addWh_rfs", {
                headerData: req.headerData,
                productArrayData: req.productArrayData,
                footerData: req.footerData,
            });
            return res.data;
        } catch (error) {
            console.error('API Error:', error);
            return rejectWithValue(error.response?.data || {
                message: error.message,
                result: false
            });
        }
    }
);

export const updateWh_rfs = createAsyncThunk(
    "wh_rfs/update",
    async (orderData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateWh_rfs", {
                refno: orderData.refno,
                rdate: orderData.rdate,
                trdate: orderData.trdate,
                myear: orderData.myear,
                monthh: orderData.monthh,
                supplier_code: orderData.supplier_code,
                branch_code: orderData.branch_code,
                taxable: orderData.taxable,
                nontaxable: orderData.nontaxable,
                total: orderData.total,
                instant_saving: orderData.instant_saving,
                delivery_surcharge: orderData.delivery_surcharge,
                sale_tax: orderData.sale_tax,
                total_due: orderData.total_due,
                user_code: orderData.user_code
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const Wh_rfsByRefno = createAsyncThunk(
    "wh_rfs/read",
    async (refno, { dispatch }) => {
        try {
            console.log("REFNO", refno)
            const res = await axios.post(BASE_URL + "/api/wh_rfsbyrefno", {
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

export const deleteWh_rfs = createAsyncThunk(
    "wh_rfs/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteWh_rfs", {
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

export const wh_rfsAlljoindt = createAsyncThunk(
    "wh_rfs/read",
    async ({ offset = 0, limit = 5, rdate1, rdate2, supplier_code, branch_code, product_code }, { dispatch }) => {
        try {
            const payload = {
                offset,
                limit
            };

            // เพิ่มค่าในตัวแปรที่จะส่งเฉพาะเมื่อมีค่า
            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (supplier_code) payload.supplier_code = supplier_code;
            if (branch_code) payload.branch_code = branch_code;
            if (product_code) payload.product_code = product_code;

            const res = await axios.post(BASE_URL + "/api/wh_rfsAlljoindt", payload);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const wh_rfsAllrdate = createAsyncThunk(
    "wh_rfs/read",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Wh_rfsAllrdate", {
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
    "wh_rfs/code",
    async ({ test }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Wh_rfsrefno", { test: test });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const countwh_rfs = createAsyncThunk(
    "wh_rfs/count",
    async ({ test }, { dispatch }) => {
        try {
            console.log("____TEST____");
            const res = await axios.post(BASE_URL + "/api/countWh_rfs", { test: test });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);