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

// Define styles for restaurant goods requisition format
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
    poTitle: {
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

// Main PDF Component for Goods Requisition Form
export const GoodsRequisitionPDF = ({ refno, date, branch, branchName, productArray, total, username, data, branchAddr1, branchAddr2, branchTel1, includePrices = true }) => {
    return (
        <Document>
            <Page style={styles.page} size="A4">
                {/* Header with company info and requisition number */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.companyName}>Weera Thai Restaurant</Text>
                        <Text style={styles.companyInfo}>{branchName}</Text>
                        <Text style={styles.companyInfo}>{branchAddr1}</Text>
                        <Text style={styles.companyInfo}>{branchAddr2}</Text>
                        <Text style={styles.companyInfo}>Tel: {branchTel1}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.companyInfo}>Requisition#: {refno}</Text>
                        <Text style={styles.companyInfo}>Date: {date}</Text>
                        <Text style={styles.companyInfo}>Created By: {username}</Text>
                    </View>
                </View>

                {/* Document Title */}
                <Text style={styles.poTitle}>GOODS REQUISITION FORM</Text>

                {/* Restaurant Info */}
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
                        <Text style={[
                            styles.tableHeaderCell,
                            includePrices ? styles.descCell : { width: '55%' }
                        ]}>Description</Text>
                        <Text style={[styles.tableHeaderCell, styles.qtyCell]}>Qty</Text>
                        <Text style={[
                            styles.tableHeaderCell,
                            styles.unitCell,
                            !includePrices && { borderRightWidth: 0 } // Remove right border when it's the last column
                        ]}>Unit</Text>
                        {includePrices && (
                            <>
                                <Text style={[styles.tableHeaderCell, styles.priceCell]}>Unit Price</Text>
                                <Text style={[styles.tableHeaderCell, styles.amountCell, { borderRightWidth: 0 }]}>Amount</Text>
                            </>
                        )}
                    </View>

                    {/* Table Rows */}
                    {productArray && productArray.length > 0 ? (
                        productArray.map((item, index) => (
                            <React.Fragment key={index}>
                                <View style={styles.tableRow}>
                                    <Text style={[styles.tableCell, styles.itemCell]}>{index + 1}</Text>
                                    <Text style={[styles.tableCell, styles.codeCell]}>{item.product_code}</Text>
                                    <Text style={[
                                        styles.tableCell,
                                        includePrices ? styles.descCell : { width: '55%' }
                                    ]}>
                                        {item.tbl_product ? item.tbl_product.product_name : 'Product Description'}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.qtyCell]}>{formatNumber(item.qty || 0)}</Text>
                                    <Text style={[
                                        styles.tableCell,
                                        styles.unitCell,
                                        !includePrices && { borderRightWidth: 0 } // Remove right border when it's the last column
                                    ]}>
                                        {item.tbl_unit ? item.tbl_unit.unit_name : item.unit_code || ''}
                                    </Text>
                                    {includePrices && (
                                        <>
                                            <Text style={[styles.tableCell, styles.priceCell]}>
                                                {formatNumber(item.uprice || 0)}
                                            </Text>
                                            <Text style={[styles.tableCellLast, styles.amountCell]}>
                                                {formatNumber((item.qty || 0) * (item.uprice || 0))}
                                            </Text>
                                        </>
                                    )}
                                </View>
                            </React.Fragment>
                        ))
                    ) : (
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, { width: '100%', textAlign: 'center' }]}>No items found</Text>
                        </View>
                    )}
                </View>

                {/* Totals Section - Only show if prices are included */}
                {includePrices && (
                    <View style={styles.totalSection}>
                        <View style={styles.totalTable}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabelCell}>Sub-Total:</Text>
                                <Text style={styles.totalValueCell}>{formatNumber(total || 0)}</Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabelCell}>Tax:</Text>
                                <Text style={styles.totalValueCell}>0.00</Text>
                            </View>
                            <View style={[styles.totalRow, { borderBottomWidth: 0 }]}>
                                <Text style={styles.grandTotalLabel}>GRAND TOTAL:</Text>
                                <Text style={styles.grandTotalValue}>{formatNumber(total || 0)}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Notes Section */}
                <View style={styles.notesSection}>
                    <Text style={styles.notesTitle}>Notes:</Text>
                    <Text style={styles.notesText}>1. Please prepare all items for delivery to the restaurant.</Text>
                    <Text style={styles.notesText}>2. Verify quantities before dispatch.</Text>
                    <Text style={styles.notesText}>3. Report any inventory discrepancies.</Text>
                </View>

                {/* Signature Section */}
                <View style={styles.signatureSection}>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLine}></Text>
                        <Text style={styles.signatureText}>Requested By</Text>
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
                    <Text>This is an official goods requisition document. Requisition# {refno}</Text>
                </View>
            </Page>
        </Document>
    );
};

// Function to generate PDF content
export const generateGoodsRequisitionPDF = async (refno, data, includePrices = true) => {
    if (!data) return null;

    console.log("Goods Requisition PDF Generation - Data received:", data);
    console.log("Goods Requisition PDF Generation - Include prices:", includePrices);
    console.log("BR_GRFDTS data:", data.br_grfdts);

    if (data.br_grfdts) {
        console.log("BR_GRFDTS type:", typeof data.br_grfdts);
        console.log("BR_GRFDTS is array:", Array.isArray(data.br_grfdts));
        console.log("BR_GRFDTS length:", data.br_grfdts?.length);

        // If br_grfdts is an object but not an array, let's convert it to an array
        if (typeof data.br_grfdts === 'object' && !Array.isArray(data.br_grfdts)) {
            console.log("Converting br_grfdts object to array");
            data.br_grfdts = Object.values(data.br_grfdts);
            console.log("After conversion, BR_GRFDTS length:", data.br_grfdts?.length);
        }
    }

    // Process the product array
    let productItems = [];

    // Use enhanced logging and error handling for br_grfdts
    try {
        if (data.br_grfdts && Array.isArray(data.br_grfdts)) {
            console.log("Processing br_grfdts array with length:", data.br_grfdts.length);

            productItems = data.br_grfdts.map((item, index) => {
                console.log(`Processing product ${index + 1}:`, item.product_code);
                // Calculate amount from qty * uprice (if available)
                const qty = parseFloat(item.qty || 0);
                const uprice = parseFloat(item.uprice || 0);
                const amt = qty * uprice;

                return {
                    ...item,
                    amt: amt,
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
            console.log("BR_GRFDTS is not available or not an array");
        }
    } catch (error) {
        console.error("Error processing br_grfdts:", error);
        productItems = [];
    }

    const pdfContent = (
        <GoodsRequisitionPDF
            refno={data.refno || ''}
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
            includePrices={includePrices}
        />
    );

    return pdfContent;
};