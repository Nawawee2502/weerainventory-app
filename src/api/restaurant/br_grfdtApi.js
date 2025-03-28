import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addBr_grfdt = createAsyncThunk(
    "br_grfdt/add",
    async ({ refno, product_code, qty, unit_code, uprice, amt, expire_date, texpire_date }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_grfdt", {
                refno,
                product_code,
                qty,
                unit_code,
                uprice,
                amt,
                expire_date,
                texpire_date
            });
            return res.data;
        } catch (error) {
            console.error("Error in addBr_grfdt:", error);
            throw error;
        }
    }
);

export const updateBr_grfdt = createAsyncThunk(
    "br_grfdt/update",
    async (productData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateBr_grfdt", {
                refno: productData.refno,
                product_code: productData.product_code,
                qty: productData.qty,
                unit_code: productData.unit_code,
                uprice: productData.uprice,
                amt: productData.amt,
                expire_date: productData.expire_date,
                texpire_date: productData.texpire_date
            });
            return res.data;
        } catch (error) {
            console.error("Error in updateBr_grfdt:", error);
            throw error;
        }
    }
);

export const deleteBr_grfdt = createAsyncThunk(
    "br_grfdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteBr_grfdt", {
                refno,
                product_code
            });
            return res.data;
        } catch (error) {
            console.error("Error in deleteBr_grfdt:", error);
            throw error;
        }
    }
);

export const Br_grfdtAllinnerjoin = createAsyncThunk(
    "br_grfdt/readAllInner",
    async ({ offset, limit }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_grfdtAllinnerjoin", {
                offset,
                limit
            });
            return res.data;
        } catch (error) {
            console.error("Error in Br_grfdtAllinnerjoin:", error);
            throw error;
        }
    }
);

export const Br_grfdtAlljoindt = createAsyncThunk(
    "br_grfdt/readAll",
    async (param, { dispatch }) => {
        try {
            // Handle both string and object parameters for backward compatibility
            const refno = typeof param === 'string' ? param : param.refno;
            
            if (!refno) {
                throw new Error("Missing required parameter: refno");
            }
            
            console.log("Calling Br_grfdtAlljoindt with refno:", refno);
            const res = await axios.post(BASE_URL + "/api/Br_grfdtAlljoindt", { refno });
            return res.data;
        } catch (error) {
            console.error("Error in Br_grfdtAlljoindt:", error);
            throw error;
        }
    }
);

export const countBr_grfdt = createAsyncThunk(
    "br_grfdt/count",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countBr_grfdt", { refno });
            return res.data;
        } catch (error) {
            console.error("Error in countBr_grfdt:", error);
            throw error;
        }
    }
);