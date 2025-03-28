import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// br_pow API actions
export const addBr_pow = createAsyncThunk(
    "br_pow/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_pow", {
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

export const updateBr_pow = createAsyncThunk(
    "br_pow/update",
    async (orderData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateBr_pow", orderData);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteBr_pow = createAsyncThunk(
    "br_pow/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteBr_pow", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_powAllrdate = createAsyncThunk(
    "br_pow/readByDate",
    async ({ rdate1, rdate2, supplier_name, branch_name }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_powAllrdate", {
                rdate1,
                rdate2,
                supplier_name,
                branch_name
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_powAlljoindt = createAsyncThunk(
    "br_pow/readAll",
    async ({ offset = 0, limit = 5, rdate, rdate1, rdate2, supplier_code, branch_code, product_code }, { dispatch }) => {
        try {
            const payload = {
                offset,
                limit
            };

            if (rdate) payload.rdate = rdate;
            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (supplier_code) payload.supplier_code = supplier_code;
            if (branch_code) payload.branch_code = branch_code;
            if (product_code) payload.product_code = product_code;

            const res = await axios.post(BASE_URL + "/api/Br_powAlljoindt", payload);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_powByRefno = createAsyncThunk(
    "br_pow/readByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_powByRefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchBr_powrefno = createAsyncThunk(
    "br_pow/searchRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchBr_powrefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_powrefno = createAsyncThunk(
    "br_pow/getRefno",
    async ({ branch_code, supplier_code, date }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_powrefno", {
                branch_code,
                supplier_code,
                date
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchBr_powRunno = createAsyncThunk(
    "br_pow/searchRunno",
    async ({ myear, monthh }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchBr_powRunno", {
                myear,
                monthh
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const getPowByRefno = createAsyncThunk(
    "br_pow/getByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/getPowByRefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);