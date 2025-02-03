export const addKt_dpbdt = createAsyncThunk(
    "kt_dpbdt/add",
    async ({ refno, product_code, qty, unit_code, uprice, tax1, expire_date, texpire_date, temperature1, amt }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/addKt_dpbdt", {
                refno,
                product_code,
                qty,
                unit_code,
                uprice,
                tax1,
                expire_date,
                texpire_date,
                temperature1,
                amt
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const updateKt_dpbdt = createAsyncThunk(
    "kt_dpbdt/update",
    async (productData, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/updateKt_dpbdt", {
                refno: productData.refno,
                product_code: productData.product_code,
                qty: productData.qty,
                unit_code: productData.unit_code,
                uprice: productData.uprice,
                tax1: productData.tax1,
                expire_date: productData.expire_date,
                texpire_date: productData.texpire_date,
                temperature1: productData.temperature1,
                amt: productData.amt
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const deleteKt_dpbdt = createAsyncThunk(
    "kt_dpbdt/delete",
    async ({ refno, product_code }, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/deleteKt_dpbdt", {
                refno,
                product_code
            });
            return res.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
);

export const Kt_dpbdtAlljoindt = createAsyncThunk(
    "kt_dpbdt/read",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/Kt_dpbdtAlljoindt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);

export const countKt_dpbdt = createAsyncThunk(
    "kt_dpbdt/count",
    async (refno, { dispatch }) => {
        try {
            const res = await axios.post(BASE_URL + "/api/countKt_dpbdt", { refno });
            return res.data;
        } catch (error) {
            throw error;
        }
    }
);