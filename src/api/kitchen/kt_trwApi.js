import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// kt_trw API actions
export const addKt_trw = createAsyncThunk(
    "kt_trw/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_trw", {
                headerData: req.headerData,
                productArrayData: req.productArrayData,
                footerData: req.footerData,
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const updateKt_trw = createAsyncThunk(
    "kt_trw/update",
    async (orderData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_trw", orderData);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteKt_trw = createAsyncThunk(
    "kt_trw/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteKt_trw", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_trwAllrdate = createAsyncThunk(
    "kt_trw/readByDate",
    async ({ rdate1, rdate2, kitchen_name }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_trwAllrdate", {
                rdate1,
                rdate2,
                kitchen_name
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_trwAlljoindt = createAsyncThunk(
    "kt_trw/readAll",
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

            const res = await axios.post(BASE_URL + "/api/Kt_trwAlljoindt", payload);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_trwByRefno = createAsyncThunk(
    "kt_trw/readByRefno",
    async (refno, { dispatch }) => {
        try {
            // แปลง refno ให้อยู่ในรูปแบบที่ถูกต้อง
            const payload = typeof refno === 'object' ? refno : { refno };
            console.log('Sending payload to Kt_trwByRefno:', payload);
            
            const res = await axios.post(BASE_URL + "/api/Kt_trwByRefno", payload);
            return res.data;
        } catch (error) {
            console.error('Error in Kt_trwByRefno:', error);
            throw error;
        }
    }
);

export const countKt_trw = createAsyncThunk(
    "kt_trw/count",
    async (_, { dispatch }) => {
        try {
            const res = await axios.get(BASE_URL + "/api/countKt_trw");
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchKt_trwrefno = createAsyncThunk(
    "kt_trw/search",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchKt_trwrefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_trwrefno = createAsyncThunk(
    "kt_trw/getRefno",
    async ({ month, year, kitchen_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_trwrefno", {
                month,
                year,
                kitchen_code  // Make sure this parameter is included
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchKt_trwRunno = createAsyncThunk(
    "kt_trw/searchRunno",
    async ({ myear, monthh }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchKt_trwRunno", {
                myear,
                monthh
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const getKtTrwByRefno = createAsyncThunk(
    "kt_trw/getByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/getKtTrwByRefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

