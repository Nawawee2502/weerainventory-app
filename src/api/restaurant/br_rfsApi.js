import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

// br_rfs API actions
export const addBr_rfs = createAsyncThunk(
    "br_rfs/add",
    async (req, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addBr_rfs", {
                headerData: req.headerData,
                productArrayData: req.productArrayData,
                footerData: req.footerData,
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

// export const updateBr_rfs = createAsyncThunk(
//     "br_rfs/update",
//     async (orderData, { dispatch }) => {
//         try {
//             // ปัญหาอยู่ตรงนี้ มีการแตกข้อมูลออกมาแล้วส่งเฉพาะ headerData
//             const { headerData, productArrayData, footerData } = orderData;

//             // ส่งเฉพาะข้อมูล headerData ไม่ได้ส่ง productArrayData ไปด้วย
//             const res = await axios.post(BASE_URL + "/api/updateBr_rfs", {
//                 refno: headerData.refno,
//                 rdate: headerData.rdate,
//                 trdate: headerData.trdate,
//                 myear: headerData.myear,
//                 monthh: headerData.monthh,
//                 branch_code: headerData.branch_code,
//                 supplier_code: headerData.supplier_code,
//                 taxable: headerData.taxable || 0,
//                 nontaxable: headerData.nontaxable || 0,
//                 total: headerData.total || 0,
//                 instant_saving: headerData.instant_saving || 0,
//                 delivery_surcharge: headerData.delivery_surcharge || 0,
//                 sale_tax: headerData.sale_tax || 0,
//                 total_due: headerData.total_due || 0,
//                 user_code: headerData.user_code
//             });
//             return res.data;
//         } catch (error) {
//             throw error;
//         }
//     }
// );

export const updateBr_rfs = createAsyncThunk(
    "br_rfs/update",
    async (orderData, { dispatch }) => {
        try {
            // ส่ง orderData ทั้งหมดโดยไม่ต้องแตกโครงสร้าง
            const res = await axios.post(BASE_URL + "/api/updateBr_rfs", orderData);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const deleteBr_rfs = createAsyncThunk(
    "br_rfs/delete",
    async ({ refno }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteBr_rfs", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfsAllrdate = createAsyncThunk(
    "br_rfs/readByDate",
    async ({ rdate1, rdate2, supplier_name, branch_name }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rfsAllrdate", {
                rdate1,
                rdate2,
                supplier_name,
                branch_name
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfsAlljoindt = createAsyncThunk(
    "br_rfs/readAll",
    async ({ offset = 0, limit = 5, rdate, rdate1, rdate2, supplier_code, branch_code, product_code }, { dispatch }) => {
        try {
            const payload = {
                offset,
                limit
            };

            if (rdate) payload.rdate = rdate;
            if (rdate1) payload.rdate1 = rdate1;
            if (rdate2) payload.rdate2 = rdate2;
            if (supplier_code) payload.supplier_code = supplier_code;
            if (branch_code) payload.branch_code = branch_code;
            if (product_code) payload.product_code = product_code;

            const res = await axios.post(BASE_URL + "/api/Br_rfsAlljoindt", payload);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfsByRefno = createAsyncThunk(
    "br_rfs/readByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rfsByRefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchBr_rfsrefno = createAsyncThunk(
    "br_rfs/searchRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchBr_rfsrefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const Br_rfsrefno = createAsyncThunk(
    "br_rfs/getRefno",
    async (_, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Br_rfsrefno");
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const searchBr_rfsRunno = createAsyncThunk(
    "br_rfs/searchRunno",
    async ({ myear, monthh }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchBr_rfsRunno", {
                myear,
                monthh
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const getRfsByRefno = createAsyncThunk(
    "br_rfs/getByRefno",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/getRfsByRefno", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);