import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";


const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// export const addWh_pos = createAsyncThunk(
//     "branch/add",
//     async ({ refno, rdate, trdate, myear, monthh, supplier_code, branch_code, total, user_code }, { dispatch }) => {
//         try {
//             const res = await axios.post(BASE_URL + "/api/addWh_pos", {
//                 refno,
//                 rdate,
//                 trdate,
//                 myear,
//                 monthh,
//                 supplier_code,
//                 branch_code,
//                 total,
//                 user_code,
//             });
//             console.log(res.data);
//             return res.data;
//         } catch (error) {
//             console.error(error.message);
//             throw error;
//         }
//     }
// );

export const addWh_pos = createAsyncThunk(
    "wh_pos/add",
    async ( req , { dispatch }) => {
        try {
            console.log("API APP");
            console.log(req);
            // console.log(productArrayData);
            // console.log(footerData);
            const res = await axios.post(BASE_URL + "/api/addWh_pos", {
                headerData: req.headerData,
                productArrayData: req.productArrayData,
                footerData: req.footerData,
            });
            console.log("API APP");
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const updateWh_pos = createAsyncThunk(
    "branch/update",
    async ({ refno, rdate, trdate, myear, monthh, supplier_code, branch_code, total, user_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateWh_pos", {
                refno,
                rdate,
                trdate,
                myear,
                monthh,
                supplier_code,
                branch_code,
                total,
                user_code,
            });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);


export const deleteWh_pos = createAsyncThunk(
    "branch/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteWh_pos", {
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


export const wh_posAlljoindt = createAsyncThunk(
    "branch/read",
    async ({ offset, limit }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/wh_posAlljoindt", { offset: offset, limit: limit });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const wh_posAllrdate = createAsyncThunk(
    "branch/read",
    async ({ offset, limit }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Wh_posAllrdate", { offset: offset, limit: limit });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const refno = createAsyncThunk(
    "branch/code",
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