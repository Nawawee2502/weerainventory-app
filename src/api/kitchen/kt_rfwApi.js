

import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// RFW Actions
export const addKt_rfw = createAsyncThunk(
    "kt_rfw/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_rfw", {
                headerData: req.headerData,
                productArrayData: req.productArrayData,
                footerData: req.footerData,
            });
            return res.data;
        } catch (error) {
            console.error('Add KT RFW Error:', error.message);
            throw error;
        }
    }
);

export const updateKt_rfw = createAsyncThunk(
    "kt_rfw/update",
    async ({ refno, rdate, trdate, myear, monthh, kitchen_code, taxable, nontaxable, total, user_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_rfw", {
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
            console.error('Update KT RFW Error:', error.message);
            throw error;
        }
    }
);

export const deleteKt_rfw = createAsyncThunk(
    "kt_rfw/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteKt_rfw", {
                refno,
            });
            return res.data;
        } catch (error) {
            console.error('Delete KT RFW Error:', error.message);
            throw error;
        }
    }
);

export const Kt_rfwAllrdate = createAsyncThunk(
    "kt_rfw/readByDate",
    async ({ rdate1, rdate2, kitchen_name }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_rfwAllrdate", {
                rdate1,
                rdate2,
                kitchen_name
            });
            return res.data;
        } catch (error) {
            console.error('Get KT RFW By Date Range Error:', error.message);
            throw error;
        }
    }
);

export const Kt_rfwAlljoindt = createAsyncThunk(
    "kt_rfw/readAll",
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

            const res = await axios.post(BASE_URL + "/api/Kt_rfwAlljoindt", payload);
            return res.data;
        } catch (error) {
            console.error('Get All KT RFW Join Error:', error.message);
            throw error;
        }
    }
);

export const Kt_rfwByRefno = createAsyncThunk(
    "kt_rfw/read",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_rfwByrefno", {
                refno,
            });
            return res.data;
        } catch (error) {
            console.error('Get KT RFW By Refno Error:', error.message);
            throw error;
        }
    }
);

export const countKt_rfw = createAsyncThunk(
    "kt_rfw/count",
    async ({ rdate }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countKt_rfw", {
                rdate
            });
            return res.data;
        } catch (error) {
            console.error('Count KT RFW Error:', error.message);
            throw error;
        }
    }
);

export const searchKt_rfwrefno = createAsyncThunk(
    "kt_rfw/searchRefno",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchKt_rfwrefno", {
                refno
            });
            return res.data;
        } catch (error) {
            console.error('Search KT RFW Refno Error:', error.message);
            throw error;
        }
    }
);

export const Kt_rfwrefno = createAsyncThunk(
    "kt_rfw/getRefno",
    async (_, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_rfwrefno");
            return res.data;
        } catch (error) {
            console.error('Get KT RFW Refno Error:', error.message);
            throw error;
        }
    }
);

export const searchKt_rfwRunno = createAsyncThunk(
    "kt_rfw/searchRunno",
    async ({ myear, monthh }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchKt_rfwRunno", {
                myear,
                monthh
            });
            return res.data;
        } catch (error) {
            console.error('Search KT RFW Runno Error:', error.message);
            throw error;
        }
    }
);