import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addKt_safdt = createAsyncThunk(
    "kt_safdt/add",
    async ({ refno, product_code, qty, unit_code, uprice, amt, expire_date, texpire_date, beg1, bal1 }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_safdt", {
                refno,
                product_code,
                qty,
                unit_code,
                uprice,
                amt,
                expire_date,
                texpire_date,
                beg1,
                bal1
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const updateKt_safdt = createAsyncThunk(
    "kt_safdt/update",
    async (productData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_safdt", {
                refno: productData.refno,
                product_code: productData.product_code,
                qty: productData.qty,
                unit_code: productData.unit_code,
                uprice: productData.uprice,
                amt: productData.amt,
                expire_date: productData.expire_date,
                texpire_date: productData.texpire_date,
                beg1: productData.beg1,
                bal1: productData.bal1
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteKt_safdt = createAsyncThunk(
    "kt_safdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteKt_safdt", {
                refno,
                product_code
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_safdtAllinnerjoin = createAsyncThunk(
    "kt_safdt/readAllInner",
    async ({ offset, limit }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_safdtAllinnerjoin", {
                offset,
                limit
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_safdtAlljoindt = createAsyncThunk(
    "kt_safdt/readAll",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_safdtAlljoindt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const countKt_safdt = createAsyncThunk(
    "kt_safdt/count",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countKt_safdt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);