import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// Add minimum stock
export const addKtMinStock = createAsyncThunk(
    "kt_minimum_stock/add",
    async (data, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_minimum_stock", {
                product_code: data.product_code,
                kitchen_code: data.kitchen_code,
                unit_code: data.unit_code,
                min_qty: data.min_qty,
                max_qty: data.max_qty // Add max_qty field
            });
            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: error.message }
            );
        }
    }
);

export const updateKtMinStock = createAsyncThunk(
    "kt_minimum_stock/update",
    async (data, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_minimum_stock", {
                product_code: data.product_code,
                kitchen_code: data.kitchen_code,
                unit_code: data.unit_code,
                min_qty: data.min_qty,
                max_qty: data.max_qty // Add max_qty field
            });
            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: error.message }
            );
        }
    }
);

// Delete minimum stock
export const deleteKtMinStock = createAsyncThunk(
    "kt_minimum_stock/delete",
    async ({ product_code, kitchen_code }, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteKt_minimum_stock", {
                product_code,
                kitchen_code,
            });
            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: error.message }
            );
        }
    }
);

// Query minimum stock with pagination and filters
export const queryKtMinStock = createAsyncThunk(
    "kt_minimum_stock/query",
    async ({ offset = 0, limit = 10, kitchen_code, product_name }, { rejectWithValue }) => {
        try {
            const requestPayload = {
                offset,
                limit
            };

            // เพิ่มเฉพาะฟิลด์ที่มีค่า
            if (kitchen_code) requestPayload.kitchen_code = kitchen_code;
            if (product_name) requestPayload.product_name = product_name;

            console.log("Query API payload:", requestPayload);

            const res = await axios.post(BASE_URL + "/api/Query_Kt_minimum_stock", requestPayload);
            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: error.message }
            );
        }
    }
);

// Search minimum stock by product code or name
export const searchKtMinStock = createAsyncThunk(
    "kt_minimum_stock/search",
    async ({ product_code, product_name, kitchen_code }, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/SearchKt_minimum_stock", {
                product_code,
                product_name,
                kitchen_code
            });
            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: error.message }
            );
        }
    }
);

// Count total minimum stock records
export const countKtMinStock = createAsyncThunk(
    "kt_minimum_stock/count",
    async ({ kitchen_code, product_name } = {}, { rejectWithValue }) => {
        try {
            const requestPayload = {};

            // เพิ่มเฉพาะฟิลด์ที่มีค่า
            if (kitchen_code) requestPayload.kitchen_code = kitchen_code;
            if (product_name) requestPayload.product_name = product_name;

            console.log("Count API payload:", requestPayload);

            const res = await axios.post(BASE_URL + "/api/countKt_minimum_stock", requestPayload);
            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: error.message }
            );
        }
    }
);

// Check if product already exists in kitchen
export const checkMinStockExists = createAsyncThunk(
    "kt_minimum_stock/check",
    async ({ product_code, kitchen_code }, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/SearchKt_minimum_stock", {
                product_code,
                kitchen_code
            });
            return {
                exists: res.data.data && res.data.data.length > 0,
                data: res.data
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: error.message }
            );
        }
    }
);