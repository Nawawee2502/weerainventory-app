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
    async ({ offset = 0, limit = 5, rdate, rdate1, rdate2, supplier_code, branch_code, product_code }, { dispatch }) => {
        try {
            const payload = {
                offset,
                limit
            };

            // เพิ่มค่าในตัวแปรที่จะส่งเฉพาะเมื่อมีค่า
            if (rdate) payload.rdate = rdate;
            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (supplier_code) payload.supplier_code = supplier_code;
            if (branch_code) payload.branch_code = branch_code;
            if (product_code) payload.product_code = product_code;

            const res = await axios.post(BASE_URL + "/api/wh_posAlljoindt", payload);
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
    async ({ test, month, year }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/refno", {
                test: test,
                month: month,
                year: year
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const countwh_pos = createAsyncThunk(
    "whpos/count",
    async ({ rdate }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countwh_pos", {
                rdate: rdate
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const getWhPosByRefno = createAsyncThunk(
    "wh_pos/getByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/getWhPosByRefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);