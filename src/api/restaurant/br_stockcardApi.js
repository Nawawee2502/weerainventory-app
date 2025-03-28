import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addBr_stockcard = createAsyncThunk(
    "br_stockcard/add",
    async (stockcardData, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_stockcard", stockcardData);
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

export const updateBr_stockcard = createAsyncThunk(
    "br_stockcard/update",
    async (stockcardData, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateBr_stockcard", stockcardData);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || {
                message: error.message,
                type: 'ERROR'
            });
        }
    }
);

export const deleteBr_stockcard = createAsyncThunk(
    "br_stockcard/delete",
    async ({ refno, myear, monthh, product_code, branch_code, rdate }, { rejectWithValue }) => {
        try {
            const payload = {
                refno,
                myear,
                monthh,
                product_code
            };

            // เพิ่มเงื่อนไขถ้ามีข้อมูล
            if (branch_code) payload.branch_code = branch_code;
            if (rdate) payload.rdate = rdate;

            const res = await axios.post(BASE_URL + "/api/deleteBr_stockcard", payload);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || {
                message: error.message,
                type: 'ERROR'
            });
        }
    }
);

// Update in br_stockcardApi.js file

export const Br_stockcardAll = createAsyncThunk(
    "br_stockcard/getAll",
    async ({
        offset = 0,
        limit = 5,
        rdate,
        rdate1,
        rdate2,
        product_code,
        product_name,
        branch_code,
        branch_name,
        refno
    }, { rejectWithValue }) => {
        try {
            const payload = {
                offset,
                limit
            };

            // Add all optional parameters to payload
            if (rdate) payload.rdate = rdate;
            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (product_code) payload.product_code = product_code;
            if (product_name) payload.product_name = product_name;
            if (branch_code) payload.branch_code = branch_code;
            if (branch_name) payload.branch_name = branch_name;
            if (refno) payload.refno = refno;

            console.log("API Request payload:", payload);

            const res = await axios.post(BASE_URL + "/api/Br_stockcardAll", payload);
            console.log("API Response:", res.data);

            // No need to manipulate the data here, the backend now sends display_id
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

// Make sure this function does not try to reference a non-existent 'id' field
export const countBr_stockcard = createAsyncThunk(
    "br_stockcard/count",
    async ({
        rdate,
        rdate1,
        rdate2,
        product_code,
        product_name,
        branch_code,
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
            if (branch_code) payload.branch_code = branch_code;
            if (refno) payload.refno = refno;

            console.log("Count API payload:", payload);

            const res = await axios.post(BASE_URL + "/api/countBr_stockcard", payload);
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