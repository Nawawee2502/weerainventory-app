import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addKt_rfwdt = createAsyncThunk(
    "kt_rfwdt/add",
    async ({ refno, product_code, qty, unit_code, uprice, tax1, amt, expire_date, texpire_date, temperature1 }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_rfwdt", {
                refno,
                product_code,
                qty,
                unit_code,
                uprice,
                tax1,
                amt,
                expire_date,
                texpire_date,
                temperature1
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
    async (productData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_rfwdt", {
                refno: productData.refno,
                product_code: productData.product_code,
                qty: productData.qty,
                unit_code: productData.unit_code,
                uprice: productData.uprice,
                tax1: productData.tax1,
                amt: productData.amt,
                expire_date: productData.expire_date,
                texpire_date: productData.texpire_date,
                temperature1: productData.temperature1
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
    "kt_rfwdt/readAllInner",
    async ({ offset, limit }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_rfwdtAllinnerjoin", {
                offset,
                limit
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
    "kt_rfwdt/readAll",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_rfwdtAlljoindt", { refno });
            return res.data;
        } catch (error) {
            console.error('Get All KT RFWDT Join Error:', error.message);
            throw error;
        }
    }
);