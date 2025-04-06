import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addKt_dpb = createAsyncThunk(
    "kt_dpb/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_dpb", {
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

export const updateKt_dpb = createAsyncThunk(
    "kt_dpb/update",
    async (orderData, { dispatch }) => {
        try {
            // Log the data to help with debugging
            console.log("updateKt_dpb API called with data:", orderData);

            // Ensure we have a properly structured object with headerData containing refno
            if (!orderData || !orderData.headerData || !orderData.headerData.refno) {
                throw new Error("Missing required data: headerData or refno");
            }

            const res = await axios.post(BASE_URL + "/api/updateKt_dpb", orderData);

            // Log the response for debugging
            console.log("updateKt_dpb API response:", res.data);

            return res.data;
        } catch (error) {
            console.error("updateKt_dpb API error:", error);
            throw error;
        }
    }
);

export const deleteKt_dpb = createAsyncThunk(
    "kt_dpb/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteKt_dpb", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Kt_dpbByRefno = createAsyncThunk(
    "kt_dpb/read",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/kt_dpbbyrefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const kt_dpbAlljoindt = createAsyncThunk(
    "kt_dpb/read",
    async ({ offset = 0, limit = 5, rdate1, rdate2, branch_code, product_code, kitchen_code }, { dispatch }) => {
        try {
            const payload = {
                offset,
                limit
            };

            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (branch_code) payload.branch_code = branch_code;
            if (kitchen_code) payload.kitchen_code = kitchen_code;
            if (product_code) payload.product_code = product_code;

            const res = await axios.post(BASE_URL + "/api/kt_dpbAlljoindt", payload);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const kt_dpbrefno = createAsyncThunk(
    "kt_dpb/code",
    async ({ kitchen_code, date }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/kt_dpbrefno", {
                kitchen_code: kitchen_code,
                date: date
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const getKtDpbByRefno = createAsyncThunk(
    "kt_dpb/getByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/getKtDpbByRefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);