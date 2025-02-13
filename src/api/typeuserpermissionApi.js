import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = `${process.env.REACT_APP_URL_API}`;

export const addTypeUserPermission = createAsyncThunk(
  "typeuserpermission/add",
  async ({
    typeuser_code,
    menu_setgeneral,
    menu_setuser,
    menu_setwarehouse,
    menu_setkitchen,
    menu_setbranch,
    menu_setgen_typeproduct,
    menu_setgen_unit,
    menu_setgen_product,
    menu_setgen_branch,
    menu_setgen_kitchen,
    menu_setgen_supplier,
    menu_setuser_typeuser,
    menu_setuser_typeuserpermission,
    menu_setuser_user,
    menu_setwh_purchase_order_to_supplier,
    menu_setwh_receipt_from_supplier,
    menu_setwh_receipt_from_kitchen,
    menu_setwh_dispatch_to_kitchen,
    menu_setwh_dispatch_to_branch,
    menu_setwh_beginninginventory,
    menu_setwh_daily_closing,
    menu_setwh_report,
    menu_setkt_purchase_order_to_wh,
    menu_setkt_receipt_from_supplier,
    menu_setkt_receipt_from_wh,
    menu_setkt_goods_requisition,
    menu_setkt_product_receipt,
    menu_setkt_transfer_to_wh,
    menu_setkt_dispatch_to_branch,
    menu_setkt_stock_adjustment,
    menu_setkt_beginninginventory,
    menu_setkt_dailyclosing,
    menu_setkt_report,
    menu_setbr_minmum_stock,
    menu_setbr_stock_adjustment,
    menu_setbr_purchase_order_to_wh,
    menu_setbr_receipt_from_warehouse,
    menu_setbr_receipt_from_kitchen,
    menu_setbr_receipt_from_supplier,
    menu_setbr_goods_requisition,
    menu_setbr_beginninginventory,
    menu_setbr_dailyclosing,
    menu_setbr_report
  }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/addtypeuserpermission", {
        typeuser_code,
        menu_setgeneral,
        menu_setuser,
        menu_setwarehouse,
        menu_setkitchen,
        menu_setbranch,
        menu_setgen_typeproduct,
        menu_setgen_unit,
        menu_setgen_product,
        menu_setgen_branch,
        menu_setgen_kitchen,
        menu_setgen_supplier,
        menu_setuser_typeuser,
        menu_setuser_typeuserpermission,
        menu_setuser_user,
        menu_setwh_purchase_order_to_supplier,
        menu_setwh_receipt_from_supplier,
        menu_setwh_receipt_from_kitchen,
        menu_setwh_dispatch_to_kitchen,
        menu_setwh_dispatch_to_branch,
        menu_setwh_beginninginventory,
        menu_setwh_daily_closing,
        menu_setwh_report,
        menu_setkt_purchase_order_to_wh,
        menu_setkt_receipt_from_supplier,
        menu_setkt_receipt_from_wh,
        menu_setkt_goods_requisition,
        menu_setkt_product_receipt,
        menu_setkt_transfer_to_wh,
        menu_setkt_dispatch_to_branch,
        menu_setkt_stock_adjustment,
        menu_setkt_beginninginventory,
        menu_setkt_dailyclosing,
        menu_setkt_report,
        menu_setbr_minmum_stock,
        menu_setbr_stock_adjustment,
        menu_setbr_purchase_order_to_wh,
        menu_setbr_receipt_from_warehouse,
        menu_setbr_receipt_from_kitchen,
        menu_setbr_receipt_from_supplier,
        menu_setbr_goods_requisition,
        menu_setbr_beginninginventory,
        menu_setbr_dailyclosing,
        menu_setbr_report
      });
      return res.data;
    } catch (error) {
      console.error("Error adding type user permission:", error.response?.data || error.message);
      throw error;
    }
  }
);

export const updateTypeUserPermission = createAsyncThunk(
  "typeuserpermission/update",
  async ({
    typeuser_code,
    menu_setgeneral,
    menu_setuser,
    menu_setwarehouse,
    menu_setkitchen,
    menu_setbranch,
    menu_setgen_typeproduct,
    menu_setgen_unit,
    menu_setgen_product,
    menu_setgen_branch,
    menu_setgen_kitchen,
    menu_setgen_supplier,
    menu_setuser_typeuser,
    menu_setuser_typeuserpermission,
    menu_setuser_user,
    menu_setwh_purchase_order_to_supplier,
    menu_setwh_receipt_from_supplier,
    menu_setwh_receipt_from_kitchen,
    menu_setwh_dispatch_to_kitchen,
    menu_setwh_dispatch_to_branch,
    menu_setwh_beginninginventory,
    menu_setwh_daily_closing,
    menu_setwh_report,
    menu_setkt_purchase_order_to_wh,
    menu_setkt_receipt_from_supplier,
    menu_setkt_receipt_from_wh,
    menu_setkt_goods_requisition,
    menu_setkt_product_receipt,
    menu_setkt_transfer_to_wh,
    menu_setkt_dispatch_to_branch,
    menu_setkt_stock_adjustment,
    menu_setkt_beginninginventory,
    menu_setkt_dailyclosing,
    menu_setkt_report,
    menu_setbr_minmum_stock,
    menu_setbr_stock_adjustment,
    menu_setbr_purchase_order_to_wh,
    menu_setbr_receipt_from_warehouse,
    menu_setbr_receipt_from_kitchen,
    menu_setbr_receipt_from_supplier,
    menu_setbr_goods_requisition,
    menu_setbr_beginninginventory,
    menu_setbr_dailyclosing,
    menu_setbr_report
  }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/updatetypeuserpermission", {
        typeuser_code,
        menu_setgeneral,
        menu_setuser,
        menu_setwarehouse,
        menu_setkitchen,
        menu_setbranch,
        menu_setgen_typeproduct,
        menu_setgen_unit,
        menu_setgen_product,
        menu_setgen_branch,
        menu_setgen_kitchen,
        menu_setgen_supplier,
        menu_setuser_typeuser,
        menu_setuser_typeuserpermission,
        menu_setuser_user,
        menu_setwh_purchase_order_to_supplier,
        menu_setwh_receipt_from_supplier,
        menu_setwh_receipt_from_kitchen,
        menu_setwh_dispatch_to_kitchen,
        menu_setwh_dispatch_to_branch,
        menu_setwh_beginninginventory,
        menu_setwh_daily_closing,
        menu_setwh_report,
        menu_setkt_purchase_order_to_wh,
        menu_setkt_receipt_from_supplier,
        menu_setkt_receipt_from_wh,
        menu_setkt_goods_requisition,
        menu_setkt_product_receipt,
        menu_setkt_transfer_to_wh,
        menu_setkt_dispatch_to_branch,
        menu_setkt_stock_adjustment,
        menu_setkt_beginninginventory,
        menu_setkt_dailyclosing,
        menu_setkt_report,
        menu_setbr_minmum_stock,
        menu_setbr_stock_adjustment,
        menu_setbr_purchase_order_to_wh,
        menu_setbr_receipt_from_warehouse,
        menu_setbr_receipt_from_kitchen,
        menu_setbr_receipt_from_supplier,
        menu_setbr_goods_requisition,
        menu_setbr_beginninginventory,
        menu_setbr_dailyclosing,
        menu_setbr_report
      });
      return res.data;
    } catch (error) {
      console.error("Error updating type user permission:", error.response?.data || error.message);
      throw error;
    }
  }
);

export const deleteTypeUserPermission = createAsyncThunk(
  "typeuserpermission/delete",
  async ({ typeuser_code }, { dispatch }) => {
    try {
      const res = await axios.post(BASE_URL + "/api/deletetypeuserpermission", {
        typeuser_code
      });
      return res.data;
    } catch (error) {
      console.error("Error deleting type user permission:", error.response?.data || error.message);
      throw error;
    }
  }
);

export const getAllTypeUserPermissions = createAsyncThunk(
  "typeuserpermission/getAll",
  async ({ offset = 0, limit = 5 }) => {
    try {
      // Ensure offset and limit are numbers
      const parsedOffset = parseInt(offset);
      const parsedLimit = parseInt(limit);

      console.log('API call with offset:', parsedOffset, 'limit:', parsedLimit);

      const res = await axios.post(BASE_URL + "/api/typeuserpermissionAll", {
        offset: parsedOffset,
        limit: parsedLimit
      });

      console.log('API response:', res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching permissions:", error.response?.data || error.message);
      throw error;
    }
  }
);

export const countTypeUserPermissions = createAsyncThunk(
  "typeuserpermission/count",
  async ({ test }, { dispatch }) => { // เพิ่ม parameter test ตามที่ backend ต้องการ
    try {
      const res = await axios.post(BASE_URL + "/api/countTypeuserpermissionall", { test: test }); // แก้เป็น countTypeuserpermissionall
      return res.data;
    } catch (error) {
      console.error("Error counting type user permissions:", error.response?.data || error.message);
      throw error;
    }
  }
);