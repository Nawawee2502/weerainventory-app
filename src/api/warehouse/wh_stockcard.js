import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addWh_stockcard = createAsyncThunk(
    "wh_stockcard/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addWh_stockcard", {
                myear: req.myear,
                monthh: req.monthh,
                product_code: req.product_code,
                unit_code: req.unit_code,
                refno: req.refno,
                rdate: req.rdate,
                trdate: req.trdate,
                beg1: req.beg1,
                in1: req.in1,
                out1: req.out1,
                upd1: req.upd1,
                uprice: req.uprice,
                beg1_amt: req.beg1_amt,
                in1_amt: req.in1_amt,
                out1_amt: req.out1_amt,
                upd1_amt: req.upd1_amt
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const updateWh_stockcard = createAsyncThunk(
    "wh_stockcard/update",
    async (stockData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateWh_stockcard", {
                refno: stockData.refno,
                myear: stockData.myear,
                monthh: stockData.monthh,
                product_code: stockData.product_code,
                unit_code: stockData.unit_code,
                rdate: stockData.rdate,
                trdate: stockData.trdate,
                beg1: stockData.beg1,
                in1: stockData.in1,
                out1: stockData.out1,
                upd1: stockData.upd1,
                uprice: stockData.uprice,
                beg1_amt: stockData.beg1_amt,
                in1_amt: stockData.in1_amt,
                out1_amt: stockData.out1_amt,
                upd1_amt: stockData.upd1_amt
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const deleteWh_stockcard = createAsyncThunk(
    "wh_stockcard/delete",
    async ({ refno, myear, monthh }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteWh_stockcard", {
                refno,
                myear,
                monthh
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const queryWh_stockcard = createAsyncThunk(
    "wh_stockcard/query",
    async ({ offset = 0, limit = 5, myear, monthh, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Query_Wh_stockcard", {
                offset,
                limit,
                myear,
                monthh,
                product_code
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const countWh_stockcard = createAsyncThunk(
    "wh_stockcard/count",
    async (_, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countWh_stockcard");
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);