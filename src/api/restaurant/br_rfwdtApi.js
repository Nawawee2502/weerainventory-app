import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addBr_rfwdt = createAsyncThunk(
    "br_rfwdt/add",
    async ({ refno, product_code, qty, unit_code, uprice, tax1, expire_date, texpire_date, temperature1, amt }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_rfwdt", {
                refno,
                product_code,
                qty,
                unit_code,
                uprice,
                tax1,
                amt,
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const updateBr_rfwdt = createAsyncThunk(
    "br_rfwdt/update",
    async (productData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateBr_rfwdt", {
                refno: productData.refno,
                product_code: productData.product_code,
                qty: productData.qty,
                unit_code: productData.unit_code,
                uprice: productData.uprice,
                tax1: productData.tax1,
                amt: productData.amt,
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteBr_rfwdt = createAsyncThunk(
    "br_rfwdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteBr_rfwdt", {
                refno,
                product_code
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfwdtAllinnerjoin = createAsyncThunk(
    "br_rfwdt/readAllInner",
    async ({ offset, limit }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rfwdtAllinnerjoin", {
                offset,
                limit
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfwdtAlljoindt = createAsyncThunk(
    "br_rfwdt/readAll",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rfwdtAlljoindt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const countBr_rfwdt = createAsyncThunk(
    "br_rfwdt/count",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countBr_rfwdt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);