import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addBr_rtkdt = createAsyncThunk(
    "br_rtkdt/add",
    async ({ refno, product_code, qty, unit_code, uprice, tax1, amt }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_rtkdt", {
                refno,
                product_code,
                qty,
                unit_code,
                uprice,
                tax1,
                amt
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const updateBr_rtkdt = createAsyncThunk(
    "br_rtkdt/update",
    async (productData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateBr_rtkdt", {
                refno: productData.refno,
                product_code: productData.product_code,
                qty: productData.qty,
                unit_code: productData.unit_code,
                uprice: productData.uprice,
                tax1: productData.tax1,
                amt: productData.amt
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteBr_rtkdt = createAsyncThunk(
    "br_rtkdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteBr_rtkdt", {
                refno,
                product_code
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rtkdtAllinnerjoin = createAsyncThunk(
    "br_rtkdt/readAllInner",
    async ({ offset, limit }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rtkdtAllinnerjoin", {
                offset,
                limit
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rtkdtAlljoindt = createAsyncThunk(
    "br_rtkdt/readAll",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rtkdtAlljoindt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const countBr_rtkdt = createAsyncThunk(
    "br_rtkdt/count",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countBr_rtkdt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);