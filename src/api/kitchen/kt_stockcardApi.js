import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addKt_stockcard = createAsyncThunk(
    "kt_stockcard/add",
    async (stockcardData, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_stockcard", stockcardData);
            return res.data;
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({
                message: error.message || 'An error occurred',
                type: 'ERROR'
            });
        }
    }
);

export const updateKt_stockcard = createAsyncThunk(
    "kt_stockcard/update",
    async (stockcardData, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_stockcard", stockcardData);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || {
                message: error.message,
                type: 'ERROR'
            });
        }
    }
);

export const deleteKt_stockcard = createAsyncThunk(
    "kt_stockcard/delete",
    async ({ refno, myear, monthh, product_code }, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteKt_stockcard", {
                refno,
                myear,
                monthh,
                product_code
            });
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || {
                message: error.message,
                type: 'ERROR'
            });
        }
    }
);

// Updated to match the Br_stockcardAll function
export const Kt_stockcardAll = createAsyncThunk(
    "kt_stockcard/getAll",
    async ({
        offset = 0,
        limit = 5,
        rdate,
        rdate1,
        rdate2,
        product_code,
        product_name,
        kitchen_code,
        kitchen_name,
        refno
    }, { rejectWithValue }) => {
        try {
            const payload = {
                offset,
                limit
            };

            if (rdate) payload.rdate = rdate;
            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (product_code) payload.product_code = product_code;
            if (product_name) payload.product_name = product_name;
            if (kitchen_code) payload.kitchen_code = kitchen_code;
            if (kitchen_name) payload.kitchen_name = kitchen_name;
            if (refno) payload.refno = refno;

            console.log("API Request payload:", payload);

            const res = await axios.post(BASE_URL + "/api/Kt_stockcardAll", payload);
            console.log("API Response:", res.data);

            return res.data;
        } catch (error) {
            console.error("API Error:", error);
            return rejectWithValue(error.response?.data || {
                message: error.message || 'Failed to fetch stockcard data',
                type: 'ERROR'
            });
        }
    }
);

// Updated to match the countBr_stockcard function
export const countKt_stockcard = createAsyncThunk(
    "kt_stockcard/count",
    async ({
        rdate,
        rdate1,
        rdate2,
        product_code,
        product_name,
        kitchen_code,
        refno
    }, { rejectWithValue }) => {
        try {
            const payload = {};

            // Add all optional parameters to payload
            if (rdate) payload.rdate = rdate;
            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (product_code) payload.product_code = product_code;
            if (product_name) payload.product_name = product_name;
            if (kitchen_code) payload.kitchen_code = kitchen_code;
            if (refno) payload.refno = refno;

            console.log("Count API payload:", payload);

            const res = await axios.post(BASE_URL + "/api/countKt_stockcard", payload);
            console.log("Count API response:", res.data);

            return res.data;
        } catch (error) {
            console.error("Count API error:", error);
            return rejectWithValue(error.response?.data || {
                message: error.message || 'Failed to count stockcard records',
                type: 'ERROR'
            });
        }
    }
);