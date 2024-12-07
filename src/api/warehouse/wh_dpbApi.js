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

export const Wh_dpbAlljoindt = createAsyncThunk(
    "wh_dpb/read",
    async (filters, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/wh_dpbAlljoindt", filters);
            return res.data;
        } catch (error) {
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