import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addWh_dpb = createAsyncThunk(
    "wh_dpb/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addWh_dpb", {
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

export const updateWh_dpb = createAsyncThunk(
    "wh_dpb/update",
    async (orderData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateWh_dpb", orderData);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteWh_dpb = createAsyncThunk(
    "wh_dpb/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteWh_dpb", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Wh_dpbByRefno = createAsyncThunk(
    "wh_dpb/read",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/wh_dpbbyrefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const wh_dpbAlljoindt = createAsyncThunk(
    "wh_dpb/read",
    async ({ offset = 0, limit = 5, rdate1, rdate2, branch_code, product_code }, { dispatch }) => {
        try {
            const payload = {
                offset,
                limit
            };

            // Add optional parameters if they exist
            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (branch_code) payload.branch_code = branch_code;
            if (product_code) payload.product_code = product_code;

            const res = await axios.post(BASE_URL + "/api/wh_dpbAlljoindt", payload);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const wh_dpbrefno = createAsyncThunk(
    "wh_dpk/code",
    async ({ test, month, year }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/wh_dpbrefno", {
                test: test,
                month: month,
                year: year
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);