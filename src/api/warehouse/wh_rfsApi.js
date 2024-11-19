import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// wh_rfs API functions
export const addWh_rfs = createAsyncThunk(
    "wh_rfs/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addWh_rfs", {
                headerData: req.headerData,
                productArrayData: req.productArrayData,
                footerData: req.footerData,
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const updateWh_rfs = createAsyncThunk(
    "wh_rfs/update",
    async (orderData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateWh_rfs", {
                refno: orderData.refno,
                rdate: orderData.rdate,
                trdate: orderData.trdate,
                myear: orderData.myear,
                monthh: orderData.monthh,
                supplier_code: orderData.supplier_code,
                branch_code: orderData.branch_code,
                taxable: orderData.taxable,
                nontaxable: orderData.nontaxable,
                total: orderData.total,
                instant_saving: orderData.instant_saving,
                delivery_surcharge: orderData.delivery_surcharge,
                sale_tax: orderData.sale_tax,
                total_due: orderData.total_due,
                user_code: orderData.user_code
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const deleteWh_rfs = createAsyncThunk(
    "wh_rfs/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteWh_rfs", {
                refno,
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const Wh_rfsAllrdate = createAsyncThunk(
    "wh_rfs/readByDate",
    async ({ rdate1, rdate2, supplier_name, branch_name }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Wh_rfsAllrdate", {
                rdate1,
                rdate2,
                supplier_name,
                branch_name
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const Wh_rfsAlljoindt = createAsyncThunk(
    "wh_rfs/readAll",
    async ({ offset = 0, limit = 5 }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Wh_rfsAlljoindt", {
                offset,
                limit
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const Wh_rfsByRefno = createAsyncThunk(
    "wh_rfs/readByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Wh_rfsByRefno", {
                refno,
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const countWh_rfs = createAsyncThunk(
    "wh_rfs/count",
    async (_, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countWh_rfs");
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const refno = createAsyncThunk(
    "branch/refno",
    async ({ test }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Wh_rfsrefno");
            console.log("Last refno:", res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);