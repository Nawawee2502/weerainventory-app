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

// Define styles for standard restaurant PO format
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Arial',
        fontSize: 9,
        lineHeight: 1.2,
    },
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
    poTitle: {
        fontSize: 14,
        fontWeight: 700,
        marginBottom: 10,
        marginTop: 5,
        textAlign: 'center',
    },
    infoSection: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#000000',
    },
    infoBox: {
        width: '100%',
        padding: 5,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    infoLabel: {
        width: '25%',
        fontWeight: 700,
        fontSize: 8,
    },
    infoValue: {
        width: '75%',
        fontSize: 8,
    },
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
    descCell: { width: '40%' },
    qtyCell: { width: '15%', textAlign: 'center' },
    unitCell: { width: '15%', textAlign: 'center' },
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
    signatureSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 'auto',
        marginBottom: '40px',
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

// Main PDF Component with standard restaurant format
export const PurchaseOrderPDF = ({ supplier, supplierName, refNo, date, branch, branchName, productArray, total, username, data, branchAddr1, branchAddr2, branchTel1 }) => {
    console.log("Rendering PDF with productArray:", productArray);
    console.log("Product count in PDF render:", productArray?.length || 0);

    return (
        <Document>
            <Page style={styles.page} size="A4">
                {/* Header with company info and PO number */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.companyName}>{branchName}</Text>
                        <Text style={styles.companyInfo}>{branchAddr1}</Text>
                        <Text style={styles.companyInfo}>{branchAddr2}</Text>
                        <Text style={styles.companyInfo}>Tel: {branchTel1}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.companyInfo}>PO#: {refNo}</Text>
                        <Text style={styles.companyInfo}>Date: {date}</Text>
                        <Text style={styles.companyInfo}>Created By: {username}</Text>
                    </View>
                </View>

                {/* PO Title */}
                <Text style={styles.poTitle}>PURCHASE ORDER TO SUPPLIER</Text>

                {/* Restaurant Info Only */}
                <View style={styles.infoSection}>
                    <View style={styles.infoBox}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Restaurant:</Text>
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
                        <Text style={[styles.tableHeaderCell, styles.unitCell, { borderRightWidth: 0 }]}>Unit</Text>
                    </View>

                    {/* Table Rows and Barcodes */}
                    {productArray && productArray.length > 0 ? (
                        productArray.map((item, index) => (
                            <React.Fragment key={index}>
                                <View style={styles.tableRow}>
                                    <Text style={[styles.tableCell, styles.itemCell]}>{index + 1}</Text>
                                    <Text style={[styles.tableCell, styles.codeCell]}>{item.product_code}</Text>
                                    <Text style={[styles.tableCell, styles.descCell]}>
                                        {item.tbl_product ? item.tbl_product.product_name : 'Product Description'}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.qtyCell]}>{formatNumber(item.qty || 0)}</Text>
                                    <Text style={[styles.tableCellLast, styles.unitCell]}>
                                        {item.tbl_unit ? item.tbl_unit.unit_name : item.unit_code || ''}
                                    </Text>
                                </View>
                            </React.Fragment>
                        ))
                    ) : (
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, { width: '100%', textAlign: 'center' }]}>No items found</Text>
                        </View>
                    )}
                </View>

                {/* Notes Section */}
                <View style={styles.notesSection}>
                    <Text style={styles.notesTitle}>Notes & Terms:</Text>
                    <Text style={styles.notesText}>1. Please mention our PO number on all documents.</Text>
                    <Text style={styles.notesText}>2. Delivery time: As per agreed terms.</Text>
                    <Text style={styles.notesText}>3. Payment terms: Net 30 days from date of invoice.</Text>
                </View>

                {/* Signature Section */}
                <View style={styles.signatureSection}>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLine}></Text>
                        <Text style={styles.signatureText}>Authorized By</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLine}></Text>
                        <Text style={styles.signatureText}>Approved By</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLine}></Text>
                        <Text style={styles.signatureText}>Received By</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>This is an official purchase order from Weera Thai Rainbow. PO# {refNo}</Text>
                </View>
            </Page>
        </Document>
    );
};

export const generatePDF = async (refno, data) => {
    if (!data) return null;

    console.log("PDF Generation - Data received:", data);
    console.log("BR_POWDTS data:", data.br_powdts);

    if (data.br_powdts) {
        console.log("BR_POWDTS type:", typeof data.br_powdts);
        console.log("BR_POWDTS is array:", Array.isArray(data.br_powdts));
        console.log("BR_POWDTS length:", data.br_powdts.length);

        // If br_powdts is an object but not an array, let's convert it to an array
        if (typeof data.br_powdts === 'object' && !Array.isArray(data.br_powdts)) {
            console.log("Converting br_powdts object to array");
            data.br_powdts = Object.values(data.br_powdts);
            console.log("After conversion, BR_POWDTS length:", data.br_powdts.length);
        }
    }

    // Process the product array
    let productItems = [];

    // Use enhanced logging and error handling for br_powdts
    try {
        if (data.br_powdts && Array.isArray(data.br_powdts)) {
            console.log("Processing br_powdts array with length:", data.br_powdts.length);

            productItems = data.br_powdts.map((item, index) => {
                console.log(`Processing product ${index + 1}:`, item.product_code);
                return {
                    ...item,
                    tbl_unit: item.tbl_unit || { unit_name: item.unit_code || '' },
                    tbl_product: item.tbl_product || { product_name: 'Product Description' }
                };
            });

            console.log("Processed productItems length:", productItems.length);
            if (productItems.length > 0) {
                console.log("First productItem:", productItems[0]);
                console.log("Last productItem:", productItems[productItems.length - 1]);
            }
        } else {
            console.log("BR_POWDTS is not available or not an array");
        }
    } catch (error) {
        console.error("Error processing br_powdts:", error);
        productItems = [];
    }

    const pdfContent = (
        <PurchaseOrderPDF
            supplier={data.supplier_code || ''}
            supplierName={data.tbl_supplier?.supplier_name || data.supplier_code || ''}
            refNo={data.refno || ''}
            date={data.rdate || ''}
            branch={data.branch_code || ''}
            branchName={data.tbl_branch?.branch_name || data.branch_code || ''}
            branchAddr1={data.tbl_branch?.addr1 || ''}
            branchAddr2={data.tbl_branch?.addr2 || ''}
            branchTel1={data.tbl_branch?.tel1 || ''}
            productArray={productItems}
            total={data.total || 0}
            username={data.user?.username || data.user_code || ''}
            data={data}
        />
    );

    return pdfContent;
};