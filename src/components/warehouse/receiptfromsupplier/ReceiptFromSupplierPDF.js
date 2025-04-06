import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import code128 from '../../../assets/fonts/code128.ttf';

// Register the Code128 font
Font.register({
    family: 'Code128',
    src: code128
});

// Register typical business document font
Font.register({
    family: 'Arial',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 }
    ]
});

// Define styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Arial',
        fontSize: 9,
        lineHeight: 1.2,
    },
    // Header section
    header: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        paddingBottom: 5,
    },
    headerLeft: {
        width: '50%',
    },
    headerRight: {
        width: '50%',
        textAlign: 'right',
    },
    companyName: {
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 5,
    },
    companyInfo: {
        fontSize: 8,
        lineHeight: 1.4,
    },
    receiptTitle: {
        fontSize: 14,
        fontWeight: 700,
        marginBottom: 10,
        marginTop: 5,
        textAlign: 'center',
    },
    // Info section
    infoSection: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#000000',
    },
    infoBox: {
        width: '50%',
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: '#000000',
    },
    infoBoxRight: {
        width: '50%',
        padding: 5,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    infoLabel: {
        width: '35%',
        fontWeight: 700,
        fontSize: 8,
    },
    infoValue: {
        width: '65%',
        fontSize: 8,
    },
    // Table styles
    tableContainer: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#000000',
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        backgroundColor: '#f2f2f2',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
    },
    tableHeaderCell: {
        padding: 4,
        fontWeight: 700,
        fontSize: 8,
        borderRightWidth: 1,
        borderRightColor: '#000000',
    },
    tableCell: {
        padding: 4,
        fontSize: 8,
        borderRightWidth: 1,
        borderRightColor: '#000000',
    },
    tableCellLast: {
        padding: 4,
        fontSize: 8,
    },
    itemCell: { width: '5%', textAlign: 'center' },
    codeCell: { width: '15%' },
    descCell: { width: '35%' },
    qtyCell: { width: '10%', textAlign: 'center' },
    unitCell: { width: '10%', textAlign: 'center' },
    priceCell: { width: '10%', textAlign: 'right' },
    amountCell: { width: '15%', textAlign: 'right' },
    // Barcode
    barcodeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 3,
        backgroundColor: '#f9f9f9',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
    },
    barcode: {
        fontFamily: 'Code128',
        fontSize: 24,
        marginRight: 10,
    },
    barcodeInfo: {
        fontSize: 7,
    },
    // Total section
    totalSection: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    totalTable: {
        width: '30%',
        borderWidth: 1,
        borderColor: '#000000',
    },
    totalRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
    },
    totalLabelCell: {
        width: '50%',
        padding: 4,
        fontWeight: 700,
        fontSize: 8,
        borderRightWidth: 1,
        borderRightColor: '#000000',
    },
    totalValueCell: {
        width: '50%',
        padding: 4,
        fontSize: 8,
        textAlign: 'right',
    },
    grandTotalLabel: {
        width: '50%',
        padding: 4,
        fontWeight: 700,
        fontSize: 9,
        borderRightWidth: 1,
        borderRightColor: '#000000',
        backgroundColor: '#f2f2f2',
    },
    grandTotalValue: {
        width: '50%',
        padding: 4,
        fontSize: 9,
        fontWeight: 700,
        textAlign: 'right',
        backgroundColor: '#f2f2f2',
    },
    // Signature section
    signatureSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        marginBottom: 20,
    },
    signatureBox: {
        width: '30%',
    },
    signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        marginTop: 25,
        marginBottom: 5,
    },
    signatureText: {
        fontSize: 8,
        textAlign: 'center',
    },
    // Notes section
    notesSection: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#000000',
        padding: 5,
    },
    notesTitle: {
        fontSize: 8,
        fontWeight: 700,
        marginBottom: 3,
    },
    notesText: {
        fontSize: 7,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        fontSize: 7,
        textAlign: 'center',
        color: '#666666',
        borderTopWidth: 1,
        borderTopColor: '#CCCCCC',
        paddingTop: 5,
    },
});

// Format number to 2 decimal places with comma separators
const formatNumber = (number) => {
    return Number(number).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

// Function to encode text to Code128 format
const encodeToCode128 = (text) => {
    return String.fromCharCode(104) + text + String.fromCharCode(106);
};

// Main PDF Component
export const ReceiptFromSupplierPDF = ({ supplier, supplierName, refNo, date, branch, branchName, productArray, total, total_due, instant_saving, delivery_surcharge, sale_tax, username, data, branchAddr1, branchAddr2, branchTel1 }) => (
    <Document>
        <Page style={styles.page} size="A4">
            {/* Header with company info and receipt number */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.companyName}>{branchName}</Text>
                    <Text style={styles.companyInfo}>{branchAddr1}</Text>
                    <Text style={styles.companyInfo}>{branchAddr2}</Text>
                    <Text style={styles.companyInfo}>Tel: {branchTel1}</Text>
                </View>
                <View style={styles.headerRight}>
                    <Text style={styles.companyInfo}>Receipt#: {refNo}</Text>
                    <Text style={styles.companyInfo}>Date: {date}</Text>
                    <Text style={styles.companyInfo}>Created By: {username}</Text>
                </View>
            </View>

            {/* Receipt Title */}
            <Text style={styles.receiptTitle}>RECEIPT FROM SUPPLIER</Text>

            {/* Supplier and Deliver To Info */}
            <View style={styles.infoSection}>
                <View style={styles.infoBox}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Supplier:</Text>
                        <Text style={styles.infoValue}>{supplierName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Supplier ID:</Text>
                        <Text style={styles.infoValue}>{supplier}</Text>
                    </View>
                </View>
                <View style={styles.infoBoxRight}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Deliver To:</Text>
                        <Text style={styles.infoValue}>{branchName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Restaurant ID:</Text>
                        <Text style={styles.infoValue}>{branch}</Text>
                    </View>
                </View>
            </View>

            {/* Items Table */}
            <View style={styles.tableContainer}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.itemCell]}>No.</Text>
                    <Text style={[styles.tableHeaderCell, styles.codeCell]}>Item Code</Text>
                    <Text style={[styles.tableHeaderCell, styles.descCell]}>Description</Text>
                    <Text style={[styles.tableHeaderCell, styles.qtyCell]}>Qty</Text>
                    <Text style={[styles.tableHeaderCell, styles.unitCell]}>Unit</Text>
                    <Text style={[styles.tableHeaderCell, styles.priceCell]}>Unit Price</Text>
                    <Text style={[styles.tableHeaderCell, styles.amountCell, { borderRightWidth: 0 }]}>Amount</Text>
                </View>

                {/* Table Rows and Barcodes */}
                {productArray.map((item, index) => (
                    <React.Fragment key={index}>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.itemCell]}>{index + 1}</Text>
                            <Text style={[styles.tableCell, styles.codeCell]}>{item.product_code}</Text>
                            <Text style={[styles.tableCell, styles.descCell]}>{item.tbl_product?.product_name || 'Product Description'}</Text>
                            <Text style={[styles.tableCell, styles.qtyCell]}>{formatNumber(item.qty)}</Text>
                            <Text style={[styles.tableCell, styles.unitCell]}>{item.tbl_unit?.unit_name || item.unit_code}</Text>
                            <Text style={[styles.tableCell, styles.priceCell]}>{formatNumber(item.uprice)}</Text>
                            <Text style={[styles.tableCellLast, styles.amountCell]}>{formatNumber(item.amt)}</Text>
                        </View>
                        {/* Barcode row */}
                        <View style={styles.barcodeSection}>
                            <Text style={styles.barcode}>{encodeToCode128(item.product_code)}</Text>
                            <Text style={styles.barcodeInfo}>ID: {item.product_code}</Text>
                        </View>
                    </React.Fragment>
                ))}
            </View>

            {/* Totals Section */}
            <View style={styles.totalSection}>
                <View style={styles.totalTable}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabelCell}>Sub-Total:</Text>
                        <Text style={styles.totalValueCell}>{formatNumber(total)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabelCell}>Instant Saving:</Text>
                        <Text style={styles.totalValueCell}>{formatNumber(instant_saving || 0)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabelCell}>Delivery Surcharge:</Text>
                        <Text style={styles.totalValueCell}>{formatNumber(delivery_surcharge || 0)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabelCell}>Sale Tax:</Text>
                        <Text style={styles.totalValueCell}>{formatNumber(sale_tax || 0)}</Text>
                    </View>
                    <View style={[styles.totalRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.grandTotalLabel}>TOTAL DUE:</Text>
                        <Text style={styles.grandTotalValue}>{formatNumber(total_due || total)}</Text>
                    </View>
                </View>
            </View>

            {/* Notes Section */}
            <View style={styles.notesSection}>
                <Text style={styles.notesTitle}>Notes & Terms:</Text>
                <Text style={styles.notesText}>1. Please mention our receipt number on all documents.</Text>
                <Text style={styles.notesText}>2. Ensure all items have been checked for accuracy.</Text>
                <Text style={styles.notesText}>3. All returns must be made within 3 days of receipt.</Text>
            </View>

            {/* Signature Section */}
            <View style={styles.signatureSection}>
                <View style={styles.signatureBox}>
                    <Text style={styles.signatureLine}></Text>
                    <Text style={styles.signatureText}>Received By</Text>
                </View>
                <View style={styles.signatureBox}>
                    <Text style={styles.signatureLine}></Text>
                    <Text style={styles.signatureText}>Verified By</Text>
                </View>
                <View style={styles.signatureBox}>
                    <Text style={styles.signatureLine}></Text>
                    <Text style={styles.signatureText}>Approved By</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text>This is an official receipt from Weera Thai Rainbow. Receipt# {refNo}</Text>
            </View>
        </Page>
    </Document>
);

// Generate PDF function
export const generateRFSPDF = async (refno, data) => {
    if (!data) return null;

    console.log("Data for RFS PDF:", data);
    console.log("Branch data in generateRFSPDF:", {
        branchName: data.tbl_branch?.branch_name || data.branch_code,
        branchAddr1: data.tbl_branch?.addr1,
        branchAddr2: data.tbl_branch?.addr2,
        branchTel1: data.tbl_branch?.tel1
    });

    const pdfContent = (
        <ReceiptFromSupplierPDF
            supplier={data.supplier_code}
            supplierName={data.tbl_supplier?.supplier_name || data.supplier_code}
            refNo={data.refno}
            date={data.rdate}
            branch={data.branch_code}
            branchName={data.tbl_branch?.branch_name || data.branch_code}
            branchAddr1={data.tbl_branch?.addr1 || ''}
            branchAddr2={data.tbl_branch?.addr2 || ''}
            branchTel1={data.tbl_branch?.tel1 || ''}
            productArray={data.wh_rfsdts?.map(item => ({
                ...item,
                tbl_unit: item.tbl_unit || { unit_name: item.unit_code },
                tbl_product: item.tbl_product || { product_name: 'Product Description' }
            })) || []}
            total={data.total}
            total_due={data.total_due}
            instant_saving={data.instant_saving}
            delivery_surcharge={data.delivery_surcharge}
            sale_tax={data.sale_tax}
            username={data.user?.username || data.user_code}
            data={data}
        />
    );

    return pdfContent;
};