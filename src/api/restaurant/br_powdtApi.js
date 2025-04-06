import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addBr_powdt = createAsyncThunk(
    "br_powdt/add",
    async ({ refno, product_code, qty, unit_code, uprice, tax1, amt }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_powdt", {
                refno,
                product_code,
                qty,
                unit_code,
                uprice,
                tax1,
                amt
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const updateBr_powdt = createAsyncThunk(
    "br_powdt/update",
    async (productData, { dispatch }) => {
        try {
            // Create a payload with all provided fields
            const payload = {
                refno: productData.refno,
                product_code: productData.product_code
            };
            
            // Only add fields that exist in productData
            if (productData.qty !== undefined) payload.qty = productData.qty;
            if (productData.unit_code !== undefined) payload.unit_code = productData.unit_code;
            if (productData.uprice !== undefined) payload.uprice = productData.uprice;
            if (productData.tax1 !== undefined) payload.tax1 = productData.tax1;
            if (productData.amt !== undefined) payload.amt = productData.amt;
            if (productData.qty_send !== undefined) payload.qty_send = productData.qty_send;
            
            console.log("Updating br_powdt with payload:", payload);
            
            const res = await axios.post(BASE_URL + "/api/updateBr_powdt", payload);
            return res.data;
        } catch (error) {
            console.error("Error in updateBr_powdt:", error);
            throw error;
        }
    }
);

export const deleteBr_powdt = createAsyncThunk(
    "br_powdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteBr_powdt", {
                refno,
                product_code
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_powdtAllinnerjoin = createAsyncThunk(
    "br_powdt/readAllInner",
    async ({ offset, limit }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_powdtAllinnerjoin", {
                offset,
                limit
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_powdtAlljoindt = createAsyncThunk(
    "br_pow/readDetails",
    async (refno, { dispatch }) => {
        try {
            // Make sure refno is always sent as a simple string parameter
            const payload = {
                refno: typeof refno === 'object' ? refno.refno : refno
            };

            const res = await axios.post(BASE_URL + "/api/Br_powdtAlljoindt", payload);
            return res.data;
        } catch (error) {
            console.error("Error in Br_powdtAlljoindt:", error);
            throw error;
        }
    }
);

export const countBr_powdt = createAsyncThunk(
    "br_powdt/count",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countBr_powdt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);