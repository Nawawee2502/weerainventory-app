import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addKt_stockcard = createAsyncThunk(
    "kt_stockcard/add",
    async (req, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_stockcard", req);
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
    async (stockData, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_stockcard", stockData);
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

export const queryKt_stockcard = createAsyncThunk(
    "kt_stockcard/query",
    async ({
        offset = 0,
        limit = 5,
        rdate,
        rdate1,
        rdate2,
        product_code,
        product_name,
        kitchen_code,
        kitchen_name
    }, { rejectWithValue }) => {
        try {
            const payload = {
                offset,
                limit,
                ...(rdate && { rdate }),
                ...(rdate1 && rdate2 && { rdate1, rdate2 }),
                ...(product_code && { product_code }),
                ...(product_name && { product_name }),
                ...(kitchen_code && { kitchen_code }),
                ...(kitchen_name && { kitchen_name })
            };

            const res = await axios.post(BASE_URL + "/api/Kt_stockcardAll", payload);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || {
                message: error.message || 'Failed to fetch stockcard data',
                type: 'ERROR'
            });
        }
    }
);

export const countKt_stockcard = createAsyncThunk(
    "kt_stockcard/count",
    async ({
        rdate,
        product_code,
        product_name,
        kitchen_code,
        kitchen_name
    }, { rejectWithValue }) => {
        try {
            const payload = {
                ...(rdate && { rdate }),
                ...(product_code && { product_code }),
                ...(product_name && { product_name }),
                ...(kitchen_code && { kitchen_code }),
                ...(kitchen_name && { kitchen_name })
            };

            const res = await axios.post(BASE_URL + "/api/countKt_stockcard", payload);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || {
                message: error.message || 'Failed to count stockcard records',
                type: 'ERROR'
            });
        }
    }
);