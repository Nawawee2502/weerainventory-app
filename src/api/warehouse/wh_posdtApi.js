import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";


const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addWh_posdt = createAsyncThunk(
    "branch/add",
    async ({ refno, product_code, qty, unit_code, uprice, amt }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addWh_posdt", {
                refno,
                product_code,
                qty,
                unit_code,
                uprice,
                amt,
            });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const updateWh_posdt = createAsyncThunk(
    "branch/update",
    async ({ refno, product_code, qty, unit_code, uprice, amt }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updatewh_posdt", {
                refno,
                product_code,
                qty,
                unit_code,
                uprice,
                amt,
            });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);


export const deleteWh_posdt = createAsyncThunk(
    "branch/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deletewh_posdt", {
                refno,
            });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);


export const Wh_posdtAlljoindt = createAsyncThunk(
    "branch/read",
    async ({ offset, limit }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Wh_posdtAlljoindt", { offset: offset, limit: limit });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const countWh_posdt = createAsyncThunk(
    "branch/count",
    async ({ test }, { dispatch }) => {
        try {
            console.log("____TETS____");
            const res = await axios.post(BASE_URL + "/api/countWh_posdt", { test: test });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const refno = createAsyncThunk(
    "refno/code",
    async ({ test }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/refno", { test: test });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);