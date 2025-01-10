import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addWh_stockcard = createAsyncThunk(
    "wh_stockcard/add",
    async (req, { rejectWithValue }) => {
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
            // Check if the error has a response from the server
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            // If there's no response, return a generic error
            return rejectWithValue({
                message: error.message || 'An error occurred',
                type: 'ERROR'
            });
        }
    }
);

export const updateWh_stockcard = createAsyncThunk(
    "wh_stockcard/update",
    async (stockData, { dispatch }) => {
        try {
            // Log data ที่จะส่งไป
            console.log("Update Request Data:", stockData);

            const requestData = {
                // ข้อมูลสำหรับ where clause
                refno: stockData.refno,
                myear: stockData.myear,
                monthh: stockData.monthh,
                product_code: stockData.product_code, // ต้องแน่ใจว่ามีค่านี้

                // ข้อมูลที่จะอัพเดต
                rdate: stockData.rdate,
                trdate: stockData.trdate,
                unit_code: stockData.unit_code,
                beg1: stockData.beg1,
                in1: stockData.in1,
                out1: stockData.out1,
                upd1: stockData.upd1,
                uprice: stockData.uprice,
                beg1_amt: stockData.beg1_amt,
                in1_amt: stockData.in1_amt,
                out1_amt: stockData.out1_amt,
                upd1_amt: stockData.upd1_amt
            };

            const res = await axios.post(BASE_URL + "/api/updateWh_stockcard", requestData);

            // Log response
            console.log("Update Response:", res.data);

            return res.data;
        } catch (error) {
            console.error("Update Error:", error);
            throw error;
        }
    }
);

export const deleteWh_stockcard = createAsyncThunk(
    "wh_stockcard/delete",
    async ({ refno, myear, monthh, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteWh_stockcard", {
                refno,
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


export const queryWh_stockcard = createAsyncThunk(
    "wh_stockcard/query",
    async ({
        offset = 0,
        limit = 5,
        rdate,
        trdate,      // เพิ่ม trdate
        rdate1,
        rdate2,
        product_code,
        product_name,
        refno        // เพิ่ม refno
    }, { rejectWithValue }) => {
        try {
            const payload = {
                offset,
                limit
            };

            // เพิ่มเงื่อนไขวันที่
            if (rdate1 && rdate2) {
                payload.rdate1 = rdate1;
                payload.rdate2 = rdate2;
            } else if (rdate) {
                payload.rdate = rdate;
            }

            // เพิ่ม trdate ถ้ามี
            if (trdate) {
                payload.trdate = trdate;
            }

            // เพิ่มการกรอง product
            if (product_code) {
                payload.product_code = product_code;
            }
            if (product_name) {
                payload.product_name = product_name;
            }

            // เพิ่ม refno ถ้ามี
            if (refno) {
                payload.refno = refno;
            }

            console.log("Query Request Payload:", payload);

            const res = await axios.post(BASE_URL + "/api/Query_Wh_stockcard", payload);
            console.log("Query Response:", res.data);

            return res.data;
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({
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
        trdate,      // เพิ่ม trdate
        rdate1,
        rdate2,
        product_name,
        refno        // เพิ่ม refno
    }, { rejectWithValue }) => {
        try {
            const payload = {};

            // เพิ่มเงื่อนไขวันที่
            if (rdate1 && rdate2) {
                payload.rdate1 = rdate1;
                payload.rdate2 = rdate2;
            } else if (rdate) {
                payload.rdate = rdate;
            }

            // เพิ่ม trdate ถ้ามี
            if (trdate) {
                payload.trdate = trdate;
            }

            // เพิ่ม product name ถ้ามี
            if (product_name) {
                payload.product_name = product_name;
            }

            // เพิ่ม refno ถ้ามี
            if (refno) {
                payload.refno = refno;
            }

            const res = await axios.post(BASE_URL + "/api/countWh_stockcard", payload);
            return res.data;
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({
                message: error.message || 'Failed to count stockcard records',
                type: 'ERROR'
            });
        }
    }
);