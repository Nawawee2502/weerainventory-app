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
    async (req, { dispatch }) => {
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
    "wh_pos/update",
    async (orderData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateWh_pos", {
                refno: orderData.refno,
                rdate: orderData.rdate,
                trdate: orderData.trdate,
                myear: orderData.myear,
                monthh: orderData.monthh,
                supplier_code: orderData.supplier_code,
                branch_code: orderData.branch_code,
                taxable: orderData.taxable,
                nontaxable: orderData.nontaxable,
                total: orderData.total
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const Wh_posByRefno = createAsyncThunk(
    "branch/read",
    async (refno, { dispatch }) => {
        try {
            console.log("REFNO", refno)
            const res = await axios.post(BASE_URL + "/api/wh_posbyrefno", {
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
    async ({ offset = 0, limit = 5 }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/wh_posAlljoindt", {
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

export const wh_posAllrdate = createAsyncThunk(
    "branch/read",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Wh_posAllrdate", {
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

export const countwh_pos = createAsyncThunk(
    "whpos/count",
    async ({ test }, { dispatch }) => {
        try {
            console.log("____TETS____");
            const res = await axios.post(BASE_URL + "/api/countwh_pos", { test: test });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);