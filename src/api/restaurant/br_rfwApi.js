import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// br_rfw API actions
export const addBr_rfw = createAsyncThunk(
    "br_rfw/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_rfw", {
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

export const updateBr_rfw = createAsyncThunk(
    "br_rfw/update",
    async (orderData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateBr_rfw", orderData);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteBr_rfw = createAsyncThunk(
    "br_rfw/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteBr_rfw", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfwAllrdate = createAsyncThunk(
    "br_rfw/readByDate",
    async ({ rdate1, rdate2, branch_name }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rfwAllrdate", {
                rdate1,
                rdate2,
                branch_name
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfwAlljoindt = createAsyncThunk(
    "br_rfw/readAll",
    async ({ offset = 0, limit = 5, rdate, rdate1, rdate2, branch_code, product_code }, { dispatch }) => {
        try {
            const payload = {
                offset,
                limit
            };

            if (rdate) payload.rdate = rdate;
            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (branch_code) payload.branch_code = branch_code;
            if (product_code) payload.product_code = product_code;

            const res = await axios.post(BASE_URL + "/api/Br_rfwAlljoindt", payload);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfwByRefno = createAsyncThunk(
    "br_rfw/readByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rfwByRefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchBr_rfwrefno = createAsyncThunk(
    "br_rfw/searchRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchBr_rfwrefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfwrefno = createAsyncThunk(
    "br_rfw/getRefno",
    async (_, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rfwrefno");
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchBr_rfwRunno = createAsyncThunk(
    "br_rfw/searchRunno",
    async ({ myear, monthh }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchBr_rfwRunno", {
                myear,
                monthh
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);