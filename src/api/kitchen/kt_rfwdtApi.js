
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addKt_rfwdt = createAsyncThunk(
    "kt_rfwdt/add",
    async ({ refno, product_code, qty, price, amount }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_rfwdt", {
                refno,
                product_code,
                qty,
                price,
                amount
            });
            return res.data;
        } catch (error) {
            console.error('Add KT RFWDT Error:', error.message);
            throw error;
        }
    }
);

export const updateKt_rfwdt = createAsyncThunk(
    "kt_rfwdt/update",
    async ({ refno, product_code, qty, price, amount }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_rfwdt", {
                refno,
                product_code,
                qty,
                price,
                amount
            });
            return res.data;
        } catch (error) {
            console.error('Update KT RFWDT Error:', error.message);
            throw error;
        }
    }
);

export const deleteKt_rfwdt = createAsyncThunk(
    "kt_rfwdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteKt_rfwdt", {
                refno,
                product_code
            });
            return res.data;
        } catch (error) {
            console.error('Delete KT RFWDT Error:', error.message);
            throw error;
        }
    }
);

export const Kt_rfwdtAllinnerjoin = createAsyncThunk(
    "kt_rfwdt/allinnerjoin",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_rfwdtAllinnerjoin", {
                refno
            });
            return res.data;
        } catch (error) {
            console.error('Get All KT RFWDT Inner Join Error:', error.message);
            throw error;
        }
    }
);

export const countKt_rfwdt = createAsyncThunk(
    "kt_rfwdt/count",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countKt_rfwdt", {
                refno
            });
            return res.data;
        } catch (error) {
            console.error('Count KT RFWDT Error:', error.message);
            throw error;
        }
    }
);

export const Kt_rfwdtAlljoindt = createAsyncThunk(
    "kt_rfwdt/alljoindt",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_rfwdtAlljoindt", {
                refno
            });
            return res.data;
        } catch (error) {
            console.error('Get All KT RFWDT Join Error:', error.message);
            throw error;
        }
    }
);