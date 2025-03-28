import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addKt_rfsdt = createAsyncThunk(
    "kt_rfsdt/add",
    async ({ refno, product_code, qty, price, amount }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_rfsdt", {
                refno,
                product_code,
                qty,
                price,
                amount
            });
            return res.data;
        } catch (error) {
            console.error('Add KT RFSDT Error:', error.message);
            throw error;
        }
    }
);

export const updateKt_rfsdt = createAsyncThunk(
    "kt_rfsdt/update",
    async ({ refno, product_code, qty, price, amount }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_rfsdt", {
                refno,
                product_code,
                qty,
                price,
                amount
            });
            return res.data;
        } catch (error) {
            console.error('Update KT RFSDT Error:', error.message);
            throw error;
        }
    }
);

export const deleteKt_rfsdt = createAsyncThunk(
    "kt_rfsdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteKt_rfsdt", {
                refno,
                product_code
            });
            return res.data;
        } catch (error) {
            console.error('Delete KT RFSDT Error:', error.message);
            throw error;
        }
    }
);

export const Kt_rfsdtAllinnerjoin = createAsyncThunk(
    "kt_rfsdt/allinnerjoin",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_rfsdtAllinnerjoin", {
                refno
            });
            return res.data;
        } catch (error) {
            console.error('Get All KT RFSDT Inner Join Error:', error.message);
            throw error;
        }
    }
);

export const countKt_rfsdt = createAsyncThunk(
    "kt_rfsdt/count",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countKt_rfsdt", {
                refno
            });
            return res.data;
        } catch (error) {
            console.error('Count KT RFSDT Error:', error.message);
            throw error;
        }
    }
);

export const Kt_rfsdtAlljoindt = createAsyncThunk(
    "kt_rfsdt/alljoindt",
    async ({ refno }, { dispatch }) => {
        try {
            console.log("Fetching product details for refno:", refno);

            const res = await axios.post(BASE_URL + "/api/Kt_rfsdtAlljoindt", {
                refno // ส่ง refno ไปที่ API
            });
            return res.data;
        } catch (error) {
            console.error('Get All KT RFSDT Join Error:', error.message);
            throw error;
        }
    }
);