import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addBr_safdt = createAsyncThunk(
    "br_safdt/add",
    async ({ refno, product_code, qty, unit_code, uprice, amt, expire_date, texpire_date }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_safdt", {
                refno,
                product_code,
                qty,
                unit_code,
                uprice,
                amt,
                expire_date,
                texpire_date
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const updateBr_safdt = createAsyncThunk(
    "br_safdt/update",
    async (productData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateBr_safdt", {
                refno: productData.refno,
                product_code: productData.product_code,
                qty: productData.qty,
                unit_code: productData.unit_code,
                uprice: productData.uprice,
                amt: productData.amt,
                expire_date: productData.expire_date,
                texpire_date: productData.texpire_date
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteBr_safdt = createAsyncThunk(
    "br_safdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteBr_safdt", {
                refno,
                product_code
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_safdtAllinnerjoin = createAsyncThunk(
    "br_safdt/readAllInner",
    async ({ offset, limit }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_safdtAllinnerjoin", {
                offset,
                limit
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_safdtAlljoindt = createAsyncThunk(
    "br_safdt/readAll",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_safdtAlljoindt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const countBr_safdt = createAsyncThunk(
    "br_safdt/count",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countBr_safdt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);