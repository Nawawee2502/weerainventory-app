import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// Add new detail record
export const addKt_powdt = createAsyncThunk(
    "kt_powdt/add",
    async (data, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_powdt", {
                refno: data.refno,
                product_code: data.product_code,
                qty: data.qty,
                unit_code: data.unit_code,
                uprice: data.uprice,
                tax1: data.tax1,
                amt: data.amt
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

// Update existing detail record
export const updateKt_powdt = createAsyncThunk(
    "kt_powdt/update",
    async (data, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_powdt", {
                refno: data.refno,
                product_code: data.product_code,
                qty: data.qty,
                unit_code: data.unit_code,
                uprice: data.uprice,
                tax1: data.tax1,
                amt: data.amt
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

// Delete detail record
export const deleteKt_powdt = createAsyncThunk(
    "kt_powdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteKt_powdt", {
                refno,
                product_code
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

// Get all detail records with inner join
export const Kt_powdtAllinnerjoin = createAsyncThunk(
    "kt_powdt/readAllInnerJoin",
    async ({ offset = 0, limit = 5 }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_powdtAllinnerjoin", {
                offset,
                limit
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

// Count detail records by refno
export const countKt_powdt = createAsyncThunk(
    "kt_powdt/count",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countKt_powdt", {
                refno
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

// Get detail records with joins
export const Kt_powdtAlljoindt = createAsyncThunk(
    "kt_powdt/readAllJoinDt",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_powdtAlljoindt", {
                refno
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);