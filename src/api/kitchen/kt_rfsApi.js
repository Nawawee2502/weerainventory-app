import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// RFS Actions
export const addKt_rfs = createAsyncThunk(
    "kt_rfs/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_rfs", {
                headerData: req.headerData,
                productArrayData: req.productArrayData,
                footerData: req.footerData,
            });
            return res.data;
        } catch (error) {
            console.error('Add KT RFS Error:', error.message);
            throw error;
        }
    }
);

export const updateKt_rfs = createAsyncThunk(
    "kt_rfs/update",
    async ({ refno, rdate, trdate, myear, monthh, kitchen_code, taxable, nontaxable, total, user_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_rfs", {
                refno,
                rdate,
                trdate,
                myear,
                monthh,
                kitchen_code,
                taxable,
                nontaxable,
                total,
                user_code
            });
            return res.data;
        } catch (error) {
            console.error('Update KT RFS Error:', error.message);
            throw error;
        }
    }
);

export const deleteKt_rfs = createAsyncThunk(
    "kt_rfs/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteKt_rfs", {
                refno,
            });
            return res.data;
        } catch (error) {
            console.error('Delete KT RFS Error:', error.message);
            throw error;
        }
    }
);

export const Kt_rfsAllrdate = createAsyncThunk(
    "kt_rfs/readByDate",
    async ({ rdate1, rdate2, kitchen_name }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_rfsAllrdate", {
                rdate1,
                rdate2,
                kitchen_name
            });
            return res.data;
        } catch (error) {
            console.error('Get KT RFS By Date Range Error:', error.message);
            throw error;
        }
    }
);

export const Kt_rfsAlljoindt = createAsyncThunk(
    "kt_rfs/readAll",
    async ({ offset = 0, limit = 5, rdate, rdate1, rdate2, kitchen_code, supplier_code, product_code }, { dispatch }) => {
        try {
            const payload = {
                offset,
                limit
            };

            if (rdate) payload.rdate = rdate;
            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (kitchen_code) payload.kitchen_code = kitchen_code;
            if (supplier_code) payload.supplier_code = supplier_code;
            if (product_code) payload.product_code = product_code;

            const res = await axios.post(BASE_URL + "/api/Kt_rfsAlljoindt", payload);
            return res.data;
        } catch (error) {
            console.error('Get All KT RFS Join Error:', error.message);
            throw error;
        }
    }
);

export const Kt_rfsByRefno = createAsyncThunk(
    "kt_rfs/read",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_rfsByrefno", {
                refno,
            });
            return res.data;
        } catch (error) {
            console.error('Get KT RFS By Refno Error:', error.message);
            throw error;
        }
    }
);

export const countKt_rfs = createAsyncThunk(
    "kt_rfs/count",
    async ({ rdate }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countKt_rfs", {
                rdate
            });
            return res.data;
        } catch (error) {
            console.error('Count KT RFS Error:', error.message);
            throw error;
        }
    }
);

export const searchKt_rfsrefno = createAsyncThunk(
    "kt_rfs/searchRefno",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchKt_rfsrefno", {
                refno
            });
            return res.data;
        } catch (error) {
            console.error('Search KT RFS Refno Error:', error.message);
            throw error;
        }
    }
);

export const Kt_rfsrefno = createAsyncThunk(
    "kt_rfs/getRefno",
    async (_, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_rfsrefno");
            return res.data;
        } catch (error) {
            console.error('Get KT RFS Refno Error:', error.message);
            throw error;
        }
    }
);

export const searchKt_rfsRunno = createAsyncThunk(
    "kt_rfs/searchRunno",
    async ({ myear, monthh }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchKt_rfsRunno", {
                myear,
                monthh
            });
            return res.data;
        } catch (error) {
            console.error('Search KT RFS Runno Error:', error.message);
            throw error;
        }
    }
);