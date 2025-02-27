import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// br_grf API actions
export const addBr_grf = createAsyncThunk(
    "br_grf/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_grf", {
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

export const updateBr_grf = createAsyncThunk(
    "br_grf/update",
    async (orderData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateBr_grf", orderData);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteBr_grf = createAsyncThunk(
    "br_grf/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteBr_grf", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_grfAllrdate = createAsyncThunk(
    "br_grf/readByDate",
    async ({ rdate1, rdate2, branch_name }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_grfAllrdate", {
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

export const Br_grfAlljoindt = createAsyncThunk(
    "br_grf/readAll",
    async ({ offset = 0, limit = 5, rdate1, rdate2, branch_code, product_code }, { dispatch }) => {
        try {
            const payload = {
                offset,
                limit
            };

            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (branch_code) payload.branch_code = branch_code;
            if (product_code) payload.product_code = product_code;

            const res = await axios.post(BASE_URL + "/api/Br_grfAlljoindt", payload);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_grfByRefno = createAsyncThunk(
    "br_grf/readByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_grfByRefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchBr_grfrefno = createAsyncThunk(
    "br_grf/searchRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchBr_grfrefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_grfrefno = createAsyncThunk(
    "br_grf/getRefno",
    async ({ branch_code, date }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_grfrefno", {
                branch_code,
                date
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchBr_grfRunno = createAsyncThunk(
    "br_grf/searchRunno",
    async ({ myear, monthh }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchBr_grfRunno", {
                myear,
                monthh
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);