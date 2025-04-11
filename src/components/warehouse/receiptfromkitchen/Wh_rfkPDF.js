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

// Define styles for kitchen receipt format
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
    descCell: { width: '30%' }, // Reduced from 35% to accommodate temperature column
    tempCell: { width: '10%', textAlign: 'center' }, // Added temperature cell
    qtyCell: { width: '10%', textAlign: 'center' },
    unitCell: { width: '10%', textAlign: 'center' },
    priceCell: { width: '10%', textAlign: 'right' },
    amountCell: { width: '10%', textAlign: 'right' }, // Reduced from 15% to balance the layout
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

// Main PDF Component for Kitchen Receipt
export const KitchenReceiptPDF = ({ refno, date, kitchen, kitchenName, productArray, total, username, data, includePrices = true }) => {
    return (
        <Document>
            <Page style={styles.page} size="A4">
                {/* Header with company info and receipt number */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.companyName}>Weera Thai Restaurant</Text>
                        <Text style={styles.companyInfo}>Kitchen Receipt</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.companyInfo}>Receipt#: {refno}</Text>
                        <Text style={styles.companyInfo}>Date: {date}</Text>
                        <Text style={styles.companyInfo}>Created By: {username}</Text>
                    </View>
                </View>

                {/* Document Title */}
                <Text style={styles.poTitle}>RECEIPT FROM KITCHEN</Text>

                {/* Kitchen Info */}
                <View style={styles.infoSection}>
                    <View style={styles.infoBox}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Kitchen:</Text>
                            <Text style={styles.infoValue}>{kitchenName}</Text>
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
                            includePrices ? styles.descCell : { width: '45%' }
                        ]}>Description</Text>
                        <Text style={[styles.tableHeaderCell, styles.tempCell]}>Temp (°C)</Text>
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
                                        includePrices ? styles.descCell : { width: '45%' }
                                    ]}>
                                        {item.tbl_product ? item.tbl_product.product_name : 'Product Description'}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.tempCell]}>
                                        {item.temperature1 || '38'}°C
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

                {/* Notes Section - Updated to include temperature checking */}
                <View style={styles.notesSection}>
                    <Text style={styles.notesTitle}>Notes:</Text>
                    <Text style={styles.notesText}>1. All items have been verified upon receipt.</Text>
                    <Text style={styles.notesText}>2. Items have been checked for quality, quantity and temperature.</Text>
                    <Text style={styles.notesText}>3. Any defects or discrepancies have been noted on the receipt.</Text>
                    <Text style={styles.notesText}>4. Maintain temperature levels as indicated for each item.</Text>
                </View>

                {/* Signature Section */}
                <View style={styles.signatureSection}>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLine}></Text>
                        <Text style={styles.signatureText}>Warehouse Manager</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLine}></Text>
                        <Text style={styles.signatureText}>Kitchen Manager</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLine}></Text>
                        <Text style={styles.signatureText}>Received By</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>This is an official receipt document for Kitchen. Receipt# {refno}</Text>
                </View>
            </Page>
        </Document>
    );
};

// Function to generate PDF content
export const generateKitchenReceiptPDF = async (refno, data, includePrices = true) => {
    if (!data) return null;

    console.log("Kitchen Receipt PDF Generation - Data received:", data);
    console.log("Kitchen Receipt PDF Generation - Include prices:", includePrices);
    console.log("WH_RFKDTS data:", data.wh_rfkdts);

    if (data.wh_rfkdts) {
        console.log("WH_RFKDTS type:", typeof data.wh_rfkdts);
        console.log("WH_RFKDTS is array:", Array.isArray(data.wh_rfkdts));
        console.log("WH_RFKDTS length:", data.wh_rfkdts?.length);

        // If wh_rfkdts is an object but not an array, let's convert it to an array
        if (typeof data.wh_rfkdts === 'object' && !Array.isArray(data.wh_rfkdts)) {
            console.log("Converting wh_rfkdts object to array");
            data.wh_rfkdts = Object.values(data.wh_rfkdts);
            console.log("After conversion, WH_RFKDTS length:", data.wh_rfkdts?.length);
        }
    }

    // Process the product array
    let productItems = [];

    // Use enhanced logging and error handling for wh_rfkdts
    try {
        if (data.wh_rfkdts && Array.isArray(data.wh_rfkdts)) {
            console.log("Processing wh_rfkdts array with length:", data.wh_rfkdts.length);

            productItems = data.wh_rfkdts.map((item, index) => {
                console.log(`Processing product ${index + 1}:`, item.product_code);
                // Calculate amount from qty * uprice (if available)
                const qty = parseFloat(item.qty || 0);
                const uprice = parseFloat(item.uprice || 0);
                const amt = qty * uprice;

                // Log temperature1 value for debugging
                console.log(`Product ${item.product_code} temperature1:`, item.temperature1 || 38);

                return {
                    ...item,
                    amt: amt,
                    temperature1: item.temperature1 || '38',  // Add default temperature if not present
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
            console.log("WH_RFKDTS is not available or not an array");
        }
    } catch (error) {
        console.error("Error processing wh_rfkdts:", error);
        productItems = [];
    }

    const pdfContent = (
        <KitchenReceiptPDF
            refno={data.refno || ''}
            date={data.rdate || ''}
            kitchen={data.kitchen_code || ''}
            kitchenName={data.tbl_kitchen?.kitchen_name || data.kitchen_code || ''}
            productArray={productItems}
            total={data.total || 0}
            username={data.user?.username || data.user_code || ''}
            data={data}
            includePrices={includePrices}
        />
    );

    return pdfContent;
};