import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';

// Define fonts for a more professional look
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 }
  ]
});

// Define styles with a more professional look
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Roboto',
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  headerBox: {
    borderWidth: 1,
    borderColor: '#000000',
    padding: 10,
    marginBottom: 15,
    borderRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  logo: {
    height: 60,
    width: 100,
    marginBottom: 10,
  },
  companyDetails: {
    width: '60%',
  },
  documentDetails: {
    width: '35%',
    borderLeft: 1,
    borderColor: '#000000',
    paddingLeft: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyAddress: {
    fontSize: 8,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    textTransform: 'uppercase',
  },
  infoTable: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 15,
    borderRadius: 3,
  },
  infoColumn: {
    flex: 1,
    padding: 5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    width: '40%',
    fontWeight: 'bold',
    fontSize: 8,
  },
  infoValue: {
    width: '60%',
    fontSize: 8,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#E4E4E4',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000000',
    minHeight: 20,
    alignItems: 'center',
  },
  tableColHeader: {
    borderRightWidth: 1,
    borderColor: '#000000',
    padding: 5,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 8,
  },
  tableColNoHeader: {
    width: '5%',
    borderRightWidth: 1,
    borderColor: '#000000',
    padding: 5,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 8,
  },
  tableColProductHeader: {
    width: '25%',
    borderRightWidth: 1,
    borderColor: '#000000',
    padding: 5,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 8,
  },
  tableColKitchenHeader: {
    width: '20%',
    borderRightWidth: 1,
    borderColor: '#000000',
    padding: 5,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 8,
  },
  tableColUnitHeader: {
    width: '10%',
    borderRightWidth: 1,
    borderColor: '#000000',
    padding: 5,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 8,
  },
  tableColAmountHeader: {
    width: '8%',
    borderRightWidth: 1,
    borderColor: '#000000',
    padding: 5,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 8,
  },
  tableColLast: {
    width: '8%',
    padding: 5,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 8,
  },
  tableCol: {
    borderRightWidth: 1,
    borderColor: '#000000',
    padding: 5,
    fontSize: 8,
  },
  tableColNo: {
    width: '5%',
    borderRightWidth: 1,
    borderColor: '#000000',
    padding: 5,
    fontSize: 8,
    textAlign: 'center',
  },
  tableColProduct: {
    width: '25%',
    borderRightWidth: 1,
    borderColor: '#000000',
    padding: 5,
    fontSize: 8,
    textAlign: 'left',
  },
  tableColKitchen: {
    width: '20%',
    borderRightWidth: 1,
    borderColor: '#000000',
    padding: 5,
    fontSize: 8,
    textAlign: 'left',
  },
  tableColUnit: {
    width: '10%',
    borderRightWidth: 1,
    borderColor: '#000000',
    padding: 5,
    fontSize: 8,
    textAlign: 'left',
  },
  tableColAmount: {
    width: '8%',
    borderRightWidth: 1,
    borderColor: '#000000',
    padding: 5,
    fontSize: 8,
    textAlign: 'right',
  },
  tableColLast: {
    width: '8%',
    padding: 5,
    fontSize: 8,
    textAlign: 'right',
  },
  signatureSection: {
    flexDirection: 'row',
    marginTop: 30,
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '30%',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderColor: '#000000',
    marginTop: 40,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 8,
    textAlign: 'center',
  },
  notesSection: {
    marginTop: 15,
    borderTopWidth: 1,
    borderColor: '#AAAAAA',
    paddingTop: 5,
  },
  notesTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  notesText: {
    fontSize: 7,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 20,
    right: 40,
    textAlign: 'center',
    color: '#555555',
  },
  footerText: {
    position: 'absolute',
    fontSize: 7,
    bottom: 20,
    left: 40,
    color: '#555555',
  },
});

const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  return Number(num).toLocaleString();
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
};

// PDF Document Component
const KitchenStockBalancePDF = ({ data, startDate, endDate, kitchen = '' }) => {
  const documentNumber = `KSBD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.headerBox}>
            <View style={styles.headerRow}>
              <View style={styles.companyDetails}>
                <Text style={styles.companyName}>WEERA GROUP INVENTORY</Text>
                <Text style={styles.companyAddress}>123 Business Road, Industrial District</Text>
                <Text style={styles.companyAddress}>Bangkok, Thailand 10110</Text>
                <Text style={styles.companyAddress}>Tel: +66-2-123-4567 | Email: contact@weeragroup.com</Text>
              </View>
              <View style={styles.documentDetails}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Document No:</Text>
                  <Text style={styles.infoValue}>{documentNumber}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Print Date:</Text>
                  <Text style={styles.infoValue}>{formatDate(new Date())}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Print Time:</Text>
                  <Text style={styles.infoValue}>{new Date().toLocaleTimeString()}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Page:</Text>
                  <Text style={styles.infoValue}>1</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.title}>Kitchen Stock Balance Report</Text>

          {/* Info Section */}
          <View style={styles.infoTable}>
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date Range:</Text>
                <Text style={styles.infoValue}>{formatDate(startDate)} - {formatDate(endDate)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>User:</Text>
                <Text style={styles.infoValue}>Admin</Text>
              </View>
            </View>
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kitchen:</Text>
                <Text style={styles.infoValue}>{kitchen || 'All Kitchens'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Report Type:</Text>
                <Text style={styles.infoValue}>Balance Summary</Text>
              </View>
            </View>
          </View>

          {/* Table Section */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.tableColNoHeader}>
                <Text>No.</Text>
              </View>
              <View style={styles.tableColProductHeader}>
                <Text>Product</Text>
              </View>
              <View style={styles.tableColKitchenHeader}>
                <Text>Kitchen</Text>
              </View>
              <View style={styles.tableColUnitHeader}>
                <Text>Unit</Text>
              </View>
              <View style={styles.tableColAmountHeader}>
                <Text>Begin</Text>
              </View>
              <View style={styles.tableColAmountHeader}>
                <Text>In</Text>
              </View>
              <View style={styles.tableColAmountHeader}>
                <Text>Out</Text>
              </View>
              <View style={styles.tableColAmountHeader}>
                <Text>Update</Text>
              </View>
              <View style={styles.tableColLast}>
                <Text>Balance</Text>
              </View>
            </View>

            {/* Table Body */}
            {data.map((item, index) => {
              const balance = ((item.beg1 || 0) + (item.in1 || 0) - (item.out1 || 0)) + (item.upd1 || 0);

              return (
                <View key={index} style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#F9F9F9' : '#FFFFFF' }]}>
                  <View style={styles.tableColNo}>
                    <Text>{index + 1}</Text>
                  </View>
                  <View style={styles.tableColProduct}>
                    <Text>{item.tbl_product?.product_name}</Text>
                  </View>
                  <View style={styles.tableColKitchen}>
                    <Text>{item.tbl_kitchen?.kitchen_name}</Text>
                  </View>
                  <View style={styles.tableColUnit}>
                    <Text>{item.tbl_unit?.unit_name}</Text>
                  </View>
                  <View style={styles.tableColAmount}>
                    <Text>{formatNumber(item.beg1)}</Text>
                  </View>
                  <View style={styles.tableColAmount}>
                    <Text>{formatNumber(item.in1)}</Text>
                  </View>
                  <View style={styles.tableColAmount}>
                    <Text>{formatNumber(item.out1)}</Text>
                  </View>
                  <View style={styles.tableColAmount}>
                    <Text>{formatNumber(item.upd1)}</Text>
                  </View>
                  <View style={styles.tableColLast}>
                    <Text>{formatNumber(balance)}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Signature Section */}
          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine}></View>
              <Text style={styles.signatureLabel}>Prepared By</Text>
            </View>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine}></View>
              <Text style={styles.signatureLabel}>Checked By</Text>
            </View>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine}></View>
              <Text style={styles.signatureLabel}>Approved By</Text>
            </View>
          </View>

          {/* Notes Section */}
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes:</Text>
            <Text style={styles.notesText}>
              1. This report is computer generated and does not require a signature to be valid.
            </Text>
            <Text style={styles.notesText}>
              2. All quantities are shown in their respective units and are accurate as of the print date.
            </Text>
            <Text style={styles.notesText}>
              3. Please report any discrepancies to the inventory management department within 3 business days.
            </Text>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            CONFIDENTIAL DOCUMENT - For internal use only
          </Text>
          <Text style={styles.pageNumber}>
            Page 1 of 1
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export const exportToPdfKitchenStockBalance = async (data, excludePrice = false, startDate, endDate, kitchen = '') => {
  try {
    const blob = await pdf(
      <KitchenStockBalancePDF
        data={data}
        startDate={startDate}
        endDate={endDate}
        kitchen={kitchen}
      />
    ).toBlob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kitchen_stock_balance_${new Date().toISOString().split('T')[0]}.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

export default KitchenStockBalancePDF;