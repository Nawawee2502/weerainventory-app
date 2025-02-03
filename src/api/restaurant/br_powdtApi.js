import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addBr_powdt = createAsyncThunk(
    "br_powdt/add",
    async ({ refno, product_code, qty, unit_code, uprice, tax1, amt }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_powdt", {
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

export const updateBr_powdt = createAsyncThunk(
    "br_powdt/update",
    async (productData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateBr_powdt", {
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

export const deleteBr_powdt = createAsyncThunk(
    "br_powdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteBr_powdt", {
                refno,
                product_code
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_powdtAllinnerjoin = createAsyncThunk(
    "br_powdt/readAllInner",
    async ({ offset, limit }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_powdtAllinnerjoin", {
                offset,
                limit
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_powdtAlljoindt = createAsyncThunk(
    "br_powdt/readAll",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_powdtAlljoindt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const countBr_powdt = createAsyncThunk(
    "br_powdt/count",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countBr_powdt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);