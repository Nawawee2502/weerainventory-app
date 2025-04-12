import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import code128 from '../../../../assets/fonts/code128.ttf';

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

// Define styles for standard document format
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
    documentTitle: {
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
    // Table styles - clean and simple
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
    itemCell: { width: '10%', textAlign: 'center' },
    codeCell: { width: '20%' },
    descCell: { width: '45%' },
    qtyCell: { width: '15%', textAlign: 'center' },
    unitCell: { width: '10%', textAlign: 'center' },
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
    // Signature section - standard format
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

// Function to encode text to Code128 format
const encodeToCode128 = (text) => {
    return String.fromCharCode(104) + text + String.fromCharCode(106);
};

// Main PDF Component for Dispatch to Restaurant
export const DispatchToRestaurantPDF = ({ refNo, date, kitchen, kitchenName, restaurant, restaurantName, productArray, username, data, kitchenAddr1, kitchenAddr2, kitchenTel1 }) => (
    <Document>
        <Page style={styles.page} size="A4">
            {/* Header with kitchen info and reference number */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.companyName}>{kitchenName}</Text>
                    <Text style={styles.companyInfo}>{kitchenAddr1}</Text>
                    <Text style={styles.companyInfo}>{kitchenAddr2}</Text>
                    <Text style={styles.companyInfo}>Tel: {kitchenTel1}</Text>
                </View>
                <View style={styles.headerRight}>
                    <Text style={styles.companyInfo}>Dispatch#: {refNo}</Text>
                    <Text style={styles.companyInfo}>Date: {date}</Text>
                    <Text style={styles.companyInfo}>Created By: {username}</Text>
                </View>
            </View>

            {/* Document Title */}
            <Text style={styles.documentTitle}>DISPATCH TO RESTAURANT</Text>

            {/* Kitchen and Restaurant Info */}
            <View style={styles.infoSection}>
                <View style={styles.infoBox}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Kitchen:</Text>
                        <Text style={styles.infoValue}>{kitchenName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Kitchen ID:</Text>
                        <Text style={styles.infoValue}>{kitchen}</Text>
                    </View>
                </View>
                <View style={styles.infoBoxRight}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Restaurant:</Text>
                        <Text style={styles.infoValue}>{restaurantName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Restaurant ID:</Text>
                        <Text style={styles.infoValue}>{restaurant}</Text>
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
                    <Text style={[styles.tableHeaderCell, styles.unitCell, { borderRightWidth: 0 }]}>Unit</Text>
                </View>

                {/* Table Rows */}
                {productArray.map((item, index) => (
                    <View style={styles.tableRow} key={index}>
                        <Text style={[styles.tableCell, styles.itemCell]}>{index + 1}</Text>
                        <Text style={[styles.tableCell, styles.codeCell]}>{item.product_code}</Text>
                        <Text style={[styles.tableCell, styles.descCell]}>{item.tbl_product?.product_name || 'Product Description'}</Text>
                        <Text style={[styles.tableCell, styles.qtyCell]}>{item.qty}</Text>
                        <Text style={[styles.tableCellLast, styles.unitCell]}>{item.tbl_unit?.unit_name || item.unit_code}</Text>
                    </View>
                ))}
            </View>

            {/* Notes Section */}
            <View style={styles.notesSection}>
                <Text style={styles.notesTitle}>Notes:</Text>
                <Text style={styles.notesText}>1. Please check all items received for quality and quantity.</Text>
                <Text style={styles.notesText}>2. Any discrepancies must be reported within 24 hours.</Text>
                <Text style={styles.notesText}>3. This document serves as proof of delivery.</Text>
            </View>

            {/* Signature Section */}
            <View style={styles.signatureSection}>
                <View style={styles.signatureBox}>
                    <Text style={styles.signatureLine}></Text>
                    <Text style={styles.signatureText}>Prepared By</Text>
                </View>
                <View style={styles.signatureBox}>
                    <Text style={styles.signatureLine}></Text>
                    <Text style={styles.signatureText}>Checked By</Text>
                </View>
                <View style={styles.signatureBox}>
                    <Text style={styles.signatureLine}></Text>
                    <Text style={styles.signatureText}>Received By</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text>This is an official dispatch document from {kitchenName}. Ref# {refNo}</Text>
            </View>
        </Page>
    </Document>
);

export const generatePDF = async (refno, data) => {
    if (!data) return null;

    // Create product array from kt_dpbdts
    const productArray = Array.isArray(data.kt_dpbdts)
        ? data.kt_dpbdts.map(item => ({
            ...item,
            tbl_unit: item.tbl_unit || { unit_name: item.unit_code },
            tbl_product: item.tbl_product || { product_name: 'Product Description' }
        }))
        : [];

    console.log("Product array length:", productArray.length);

    const pdfContent = (
        <DispatchToRestaurantPDF
            refNo={data.refno}
            date={data.rdate}
            kitchen={data.kitchen_code}
            kitchenName={data.tbl_kitchen?.kitchen_name || data.kitchen_code}
            restaurant={data.branch_code}
            restaurantName={data.tbl_branch?.branch_name || data.branch_code}
            kitchenAddr1={data.tbl_kitchen?.addr1 || ''}
            kitchenAddr2={data.tbl_kitchen?.addr2 || ''}
            kitchenTel1={data.tbl_kitchen?.tel1 || ''}
            productArray={productArray}
            username={data.user?.username || data.user_code}
            data={data}
        />
    );

    return pdfContent;
};