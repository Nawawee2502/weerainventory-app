import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// Add minimum stock
export const addBrMinStock = createAsyncThunk(
    "br_minnum_stock/add",
    async (data, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_minnum_stock", {
                product_code: data.product_code,
                branch_code: data.branch_code,
                unit_code: data.unit_code,
                min_qty: data.min_qty,
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

// Update minimum stock
export const updateBrMinStock = createAsyncThunk(
    "br_minnum_stock/update",
    async (data, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateBr_minnum_stock", {
                product_code: data.product_code,
                branch_code: data.branch_code,
                unit_code: data.unit_code,
                min_qty: data.min_qty,
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

// Delete minimum stock
export const deleteBrMinStock = createAsyncThunk(
    "br_minnum_stock/delete",
    async ({ product_code, branch_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteBr_minnum_stock", {
                product_code,
                branch_code,
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

// Query minimum stock with pagination and filters
export const queryBrMinStock = createAsyncThunk(
    "br_minnum_stock/query",
    async ({ offset = 0, limit = 10, branch_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Query_Br_minnum_stock", {
                offset,
                limit,
                branch_code
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

// Search minimum stock by product code
export const searchBrMinStock = createAsyncThunk(
    "br_minnum_stock/search",
    async ({ product_code, branch_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/SearchBr_minnum_stock", {
                product_code,
                branch_code
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

// Count total minimum stock records
export const countBrMinStock = createAsyncThunk(
    "br_minnum_stock/count",
    async (_, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countBr_minnum_stock");
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);