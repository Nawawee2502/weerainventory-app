import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import code128 from '../../../assets/fonts/code128.ttf';

// Register the Code128 font
Font.register({
  family: 'Code128',
  src: code128
});

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
  },
  header: {
    textAlign: 'center',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    padding: 5,
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  footer: {
    marginTop: 20,
    fontSize: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barcode: {
    fontFamily: 'Code128',
    fontSize: 30,
  },
  barcodeContainer: {
    alignItems: 'center',
    marginTop: 2,
  },
  barcodeText: {
    fontSize: 8,
    marginTop: 2,
  }
});

// Format number to 2 decimal places
const formatNumber = (number) => {
  return Number(number).toFixed(2);
};

// Function to encode text to Code128 format
const encodeToCode128 = (text) => {
  return String.fromCharCode(104) + text + String.fromCharCode(106);
};

// Main PDF Component
export const PurchaseOrderPDF = ({ supplier, supplierName, refNo, date, branch, branchName, productArray, total, username }) => (
  <Document>
    <Page style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text>WEERA THAI RAINBOW</Text>
        <Text>3111 Valley Blvd S-10 Las Vegas NV 8910</Text>
        <Text>โทร ......</Text>
      </View>

      {/* Supplier Info */}
      <View style={{ flexDirection: 'row', marginVertical: 10 }}>
        <View style={{ flex: 1 }}>
          <Text>Supplier: {supplierName}</Text>
          <Text>Branch: {branchName}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text>Ref No.: {refNo}</Text>
          <Text>Date: {date}</Text>
          <Text>Created By: {username}</Text>
        </View>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.cell, { flex: 0.5 }]}>Item</Text>
        <Text style={styles.cell}>Description</Text>
        <Text style={styles.cell}>QTY</Text>
        <Text style={styles.cell}>Unit</Text>
        <Text style={styles.cell}>UPrice</Text>
        <Text style={styles.cell}>Amount</Text>
      </View>

      {/* Table Rows */}
      {productArray.map((item, index) => (
        <View key={index}>
          <View style={styles.row}>
            <Text style={[styles.cell, { flex: 0.5 }]}>{index + 1}</Text>
            <Text style={styles.cell}>{item.tbl_product?.product_name || 'Product Description'}</Text>
            <Text style={styles.cell}>{formatNumber(item.qty)}</Text>
            <Text style={styles.cell}>{item.tbl_unit?.unit_name || item.unit_code}</Text>
            <Text style={styles.cell}>{formatNumber(item.uprice)}</Text>
            <Text style={styles.cell}>{formatNumber(item.amt)}</Text>
          </View>
          {/* Barcode section under each product row */}
          <View style={styles.barcodeContainer}>
            <Text style={styles.barcode}>
              {encodeToCode128(item.product_code)}
            </Text>
            <Text style={styles.barcodeText}>{item.product_code}</Text>
            <Text style={styles.barcodeText}>{item.tbl_product?.product_name}</Text>
          </View>
        </View>
      ))}

      {/* Grand Total */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
        <Text>Grand Total: {formatNumber(total)}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text>Authorized Signature: </Text>
          <Text>_________________________</Text>
        </View>
        <View>
          <Text>Quoted By:</Text>
          <Text>Sale:</Text>
          <Text>Mobile:</Text>
        </View>
        <View>
          <Text>Approved By:</Text>
          <Text>Date:</Text>
        </View>
      </View>
    </Page>
  </Document>
);

// Helper function to generate PDF
export const generatePDF = async (refno, data) => {
  if (!data) return null;

  console.log("Data for PDF:", data); // For debugging

  // ดึงข้อมูลชื่อแทนรหัส
  const pdfContent = (
    <PurchaseOrderPDF
      supplier={data.supplier_code}
      supplierName={data.tbl_supplier?.supplier_name || data.supplier_code}
      refNo={data.refno}
      date={data.rdate}
      branch={data.branch_code}
      branchName={data.tbl_branch?.branch_name || data.branch_code}
      productArray={data.wh_posdts.map(item => ({
        ...item,
        tbl_unit: item.tbl_unit || { unit_name: item.unit_code },
        tbl_product: item.tbl_product || { product_name: 'Product Description' }
      }))}
      total={data.total}
      username={data.user?.username || data.user_code}
    />
  );

  return pdfContent;
};