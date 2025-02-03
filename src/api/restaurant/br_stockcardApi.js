import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addBr_stockcard = createAsyncThunk(
    "br_stockcard/add",
    async (stockcardData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_stockcard", stockcardData);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const updateBr_stockcard = createAsyncThunk(
    "br_stockcard/update",
    async (stockcardData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateBr_stockcard", stockcardData);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteBr_stockcard = createAsyncThunk(
    "br_stockcard/delete",
    async ({ refno, myear, monthh, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteBr_stockcard", {
                refno,
                myear,
                monthh,
                product_code
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_stockcardAll = createAsyncThunk(
    "br_stockcard/getAll",
    async ({ offset, limit, rdate, rdate1, rdate2, product_code, product_name, branch_code, branch_name }, { dispatch }) => {
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
            if (branch_code) payload.branch_code = branch_code;
            if (branch_name) payload.branch_name = branch_name;

            const res = await axios.post(BASE_URL + "/api/Br_stockcardAll", payload);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const countBr_stockcard = createAsyncThunk(
    "br_stockcard/count",
    async ({ rdate, product_code, product_name }, { dispatch }) => {
        try {
            const payload = {};

            if (rdate) payload.rdate = rdate;
            if (product_code) payload.product_code = product_code;
            if (product_name) payload.product_name = product_name;

            const res = await axios.post(BASE_URL + "/api/countBr_stockcard", payload);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);