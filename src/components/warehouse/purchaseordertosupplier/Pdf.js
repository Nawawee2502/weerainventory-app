import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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
});

// Main PDF Component
export const PurchaseOrderPDF = ({ supplier, refNo, date, branch, productArray, total }) => (
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
          <Text>Supplier: {supplier}</Text>
          <Text>Branch: {branch}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text>Ref No.: {refNo}</Text>
          <Text>Date: {date}</Text>
        </View>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.cell, { flex: 0.5 }]}>Item</Text>
        <Text style={styles.cell}>Description</Text>
        <Text style={styles.cell}>QTY</Text>
        <Text style={styles.cell}>UPrice</Text>
        <Text style={styles.cell}>Unit</Text>
        <Text style={styles.cell}>Amount</Text>
      </View>

      {/* Table Rows */}
      {productArray.map((item, index) => (
        <View style={styles.row} key={index}>
          <Text style={[styles.cell, { flex: 0.5 }]}>{index + 1}</Text>
          <Text style={styles.cell}>Product Description</Text>
          <Text style={styles.cell}>{item.qty}</Text>
          <Text style={styles.cell}>{item.unit_code}</Text>
          <Text style={styles.cell}>{item.uprice}</Text>
          <Text style={styles.cell}>{item.amt}</Text>
        </View>
      ))}

      {/* Grand Total */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
        <Text>Grand Total: {total}</Text>
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
  
  const pdfContent = (
    <PurchaseOrderPDF 
      supplier={data.supplier_code}
      refNo={data.refno}
      date={data.rdate}
      branch={data.branch_code}
      productArray={data.wh_posdts}
      total={data.total}
    />
  );
  
  return pdfContent;
};