import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// br_rtk API actions
export const addBr_rtk = createAsyncThunk(
    "br_rtk/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_rtk", {
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

export const updateBr_rtk = createAsyncThunk(
    "br_rtk/update",
    async (orderData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateBr_rtk", orderData);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteBr_rtk = createAsyncThunk(
    "br_rtk/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteBr_rtk", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rtkAllrdate = createAsyncThunk(
    "br_rtk/readByDate",
    async ({ rdate1, rdate2, kitchen_name, branch_name }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rtkAllrdate", {
                rdate1,
                rdate2,
                kitchen_name,
                branch_name
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rtkAlljoindt = createAsyncThunk(
    "br_rtk/readAll",
    async ({ offset = 0, limit = 5, rdate, rdate1, rdate2, kitchen_code, branch_code, product_code }, { dispatch }) => {
        try {
            const payload = {
                offset,
                limit
            };

            if (rdate) payload.rdate = rdate;
            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (kitchen_code) payload.kitchen_code = kitchen_code;
            if (branch_code) payload.branch_code = branch_code;
            if (product_code) payload.product_code = product_code;

            const res = await axios.post(BASE_URL + "/api/Br_rtkAlljoindt", payload);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rtkByRefno = createAsyncThunk(
    "br_rtk/readByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rtkbyrefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchBr_rtkrefno = createAsyncThunk(
    "br_rtk/searchRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchBr_rtkrefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rtkrefno = createAsyncThunk(
    "br_rtk/getRefno",
    async ({ branch_code, kitchen_code, date }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rtkrefno", {
                branch_code,
                kitchen_code,
                date
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchBr_rtkRunno = createAsyncThunk(
    "br_rtk/searchRunno",
    async ({ myear, monthh }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchBr_rtkRunno", {
                myear,
                monthh
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const countBr_rtk = createAsyncThunk(
    "br_rtk/count",
    async ({ rdate }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countBr_rtk", { rdate });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);