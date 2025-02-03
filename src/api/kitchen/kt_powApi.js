import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// Add new purchase order
export const addKt_pow = createAsyncThunk(
    "kt_pow/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_pow", {
                headerData: req.headerData,
                productArrayData: req.productArrayData,
                footerData: req.footerData,
            });
            return res.data;
        } catch (error) {
            console.error('Add KT POW Error:', error.message);
            throw error;
        }
    }
);

// Update purchase order
export const updateKt_pow = createAsyncThunk(
    "kt_pow/update",
    async (orderData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_pow", {
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
            console.error('Update KT POW Error:', error.message);
            throw error;
        }
    }
);

// Get purchase order by refno
export const Kt_powByRefno = createAsyncThunk(
    "kt_pow/read",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_powbyrefno", {
                refno,
            });
            return res.data;
        } catch (error) {
            console.error('Get KT POW By Refno Error:', error.message);
            throw error;
        }
    }
);

// Delete purchase order
export const deleteKt_pow = createAsyncThunk(
    "kt_pow/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteKt_pow", {
                refno,
            });
            return res.data;
        } catch (error) {
            console.error('Delete KT POW Error:', error.message);
            throw error;
        }
    }
);

// Get all purchase orders with join details
export const kt_powAlljoindt = createAsyncThunk(
    "kt_pow/readAll",
    async ({ offset = 0, limit = 5, rdate, rdate1, rdate2, kitchen_code, product_code }, { dispatch }) => {
        try {
            const payload = {
                offset,
                limit
            };

            if (rdate) payload.rdate = rdate;
            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (kitchen_code) payload.kitchen_code = kitchen_code;
            if (product_code) payload.product_code = product_code;

            const res = await axios.post(BASE_URL + "/api/Kt_powAlljoindt", payload);
            return res.data;
        } catch (error) {
            console.error('Get All KT POW Join Error:', error.message);
            throw error;
        }
    }
);

// Get purchase orders by date range
export const kt_powAllrdate = createAsyncThunk(
    "kt_pow/readByDate",
    async ({ rdate1, rdate2, kitchen_name }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_powAllrdate", {
                rdate1,
                rdate2,
                kitchen_name
            });
            return res.data;
        } catch (error) {
            console.error('Get KT POW By Date Range Error:', error.message);
            throw error;
        }
    }
);

// Get next reference number
export const kt_powRefno = createAsyncThunk(
    "kt_pow/getRefno",
    async (_, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_powrefno");
            return res.data;
        } catch (error) {
            console.error('Get KT POW Refno Error:', error.message);
            throw error;
        }
    }
);

export const countkt_pow = createAsyncThunk(
    "kt_pow/count",
    async ({ rdate }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countkt_pow", {
                rdate
            });
            return res.data;
        } catch (error) {
            console.error('Count KT POW Error:', error.message);
            throw error;
        }
    }
);

// Search by running number
export const searchKt_powRunno = createAsyncThunk(
    "kt_pow/searchRunno",
    async ({ myear, monthh }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchKt_powRunno", {
                myear,
                monthh
            });
            return res.data;
        } catch (error) {
            console.error('Search KT POW Runno Error:', error.message);
            throw error;
        }
    }
);