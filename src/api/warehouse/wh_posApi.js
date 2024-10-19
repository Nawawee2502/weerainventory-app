import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";


const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addWh_pos = createAsyncThunk(
    "branch/add",
    async ({ rdate, trdate, myear, monthh, supplier_code, branch_code, total, user_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addWh_pos", {
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

export const updateWh_pos = createAsyncThunk(
    "branch/update",
    async ({ rdate, trdate, myear, monthh, supplier_code, branch_code, total, user_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateWh_pos", {
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


export const branchAll = createAsyncThunk(
    "branch/read",
    async ({ offset, limit }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/branchall", { offset: offset, limit: limit });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const countBranch = createAsyncThunk(
    "branch/count",
    async ({ test }, { dispatch }) => {
        try {
            console.log("____TETS____");
            const res = await axios.post(BASE_URL + "/api/countbranch", { test: test });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);


export const searchBranch = createAsyncThunk(
    "productbranch/search",
    async ({ branch_name }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/searchbranchname", {
                branch_name,
            });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const lastBranchCode = createAsyncThunk(
    "branch/code",
    async ({ test }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/branchcode", { test: test });
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);