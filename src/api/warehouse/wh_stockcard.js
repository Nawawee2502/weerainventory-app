import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addWh_stockcard = createAsyncThunk(
    "wh_stockcard/add",
    async (req, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addWh_stockcard", req);
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

export const updateWh_stockcard = createAsyncThunk(
    "wh_stockcard/update",
    async (stockData, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateWh_stockcard", stockData);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || {
                message: error.message,
                type: 'ERROR'
            });
        }
    }
);

export const deleteWh_stockcard = createAsyncThunk(
    "wh_stockcard/delete",
    async ({ refno, myear, monthh, product_code }, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteWh_stockcard", {
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

export const queryWh_stockcard = createAsyncThunk(
    "wh_stockcard/query",
    async ({
        offset = 0,
        limit = 5,
        rdate,
        rdate1,
        rdate2,
        product_code,
        product_name,
        trdate,
        refno
    }, { rejectWithValue }) => {
        try {
            const payload = {
                offset,
                limit,
                ...(rdate && { rdate }),
                ...(rdate1 && rdate2 && { rdate1, rdate2 }),
                ...(product_code && { product_code }),
                ...(product_name && { product_name }),
                ...(trdate && { trdate }),
                ...(refno && { refno })
            };

            const res = await axios.post(BASE_URL + "/api/Query_Wh_stockcard", payload);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || {
                message: error.message || 'Failed to fetch stockcard data',
                type: 'ERROR'
            });
        }
    }
);

export const countWh_stockcard = createAsyncThunk(
    "wh_stockcard/count",
    async ({
        rdate,
        trdate,
        rdate1,
        rdate2,
        product_name,
        refno
    }, { rejectWithValue }) => {
        try {
            const payload = {
                ...(rdate && { rdate }),
                ...(rdate1 && rdate2 && { rdate1, rdate2 }),
                ...(trdate && { trdate }),
                ...(product_name && { product_name }),
                ...(refno && { refno })
            };

            const res = await axios.post(BASE_URL + "/api/countWh_stockcard", payload);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || {
                message: error.message || 'Failed to count stockcard records',
                type: 'ERROR'
            });
        }
    }
);