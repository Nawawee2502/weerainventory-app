import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// Add minimum stock
export const addBrMinStock = createAsyncThunk(
    "br_minnum_stock/add",
    async (data, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_minnum_stock", {
                product_code: data.product_code,
                branch_code: data.branch_code,
                unit_code: data.unit_code,
                min_qty: data.min_qty
            });
            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: error.message }
            );
        }
    }
);

export const updateBrMinStock = createAsyncThunk(
    "br_minnum_stock/update",
    async (data, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateBr_minnum_stock", {
                product_code: data.product_code,
                branch_code: data.branch_code,
                unit_code: data.unit_code,
                min_qty: data.min_qty
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
export const deleteBrMinStock = createAsyncThunk(
    "br_minnum_stock/delete",
    async ({ product_code, branch_code }, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteBr_minnum_stock", {
                product_code,
                branch_code,
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
export const queryBrMinStock = createAsyncThunk(
    "br_minnum_stock/query",
    async ({ offset = 0, limit = 10, branch_code }, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Query_Br_minnum_stock", {
                offset,
                limit,
                branch_code
            });
            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: error.message }
            );
        }
    }
);

// Search minimum stock by product code or name
export const searchBrMinStock = createAsyncThunk(
    "br_minnum_stock/search",
    async ({ product_code, product_name, branch_code }, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/SearchBr_minnum_stock", {
                product_code,
                product_name,
                branch_code
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
export const countBrMinStock = createAsyncThunk(
    "br_minnum_stock/count",
    async ({ branch_code } = {}, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countBr_minnum_stock", {
                branch_code
            });
            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: error.message }
            );
        }
    }
);

// Check if product already exists in branch
export const checkMinStockExists = createAsyncThunk(
    "br_minnum_stock/check",
    async ({ product_code, branch_code }, { rejectWithValue }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/SearchBr_minnum_stock", {
                product_code,
                branch_code
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