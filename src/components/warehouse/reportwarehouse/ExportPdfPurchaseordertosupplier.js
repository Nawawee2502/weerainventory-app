import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 12,
    },
    header: {
        marginBottom: 20,
    },
    headerText: {
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 5,
        fontWeight: 'bold',
    },
    subHeaderText: {
        textAlign: 'center',
        fontSize: 12,
        marginBottom: 5,
    },
    dateSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
    },
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        padding: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#000',
        padding: 8,
    },
    // ปรับขนาดคอลัมน์ให้เหมาะสม
    cellNo: {
        width: '5%',
        textAlign: 'center',
        fontSize: 10,
    },
    cellDate: {
        width: '10%',
        textAlign: 'center',
        fontSize: 10,
    },
    cellRef: {
        width: '16%',
        textAlign: 'center',
        fontSize: 10,
    },
    cellSupplier: {
        width: '22%',
        textAlign: 'left',
        fontSize: 10,
    },
    cellBranch: {
        width: '19%',
        textAlign: 'left',
        fontSize: 10,
    },
    cellProduct: {
        width: '10%',
        textAlign: 'left',
        fontSize: 10,
    },
    cellQuantity: {
        width: '8%',
        textAlign: 'right',
        fontSize: 10,
    },
    cellUnit: {
        width: '8%',
        textAlign: 'center',
        fontSize: 10,
    },
    cellPrice: {
        width: '8%',
        textAlign: 'right',
        fontSize: 10,
    },
    cellTotal: {
        width: '8%',
        textAlign: 'right',
        fontSize: 10,
    }
});

// PDF Document Component
const PurchaseOrderPDF = ({ data, excludePrice = false, startDate, endDate }) => {
    const headers = [
        { title: 'No.', style: styles.cellNo },
        { title: 'Date', style: styles.cellDate },
        { title: 'Ref.no', style: styles.cellRef },
        { title: 'Supplier', style: styles.cellSupplier },
        { title: 'Branch', style: styles.cellBranch },
        { title: 'Product Name', style: styles.cellProduct },
        { title: 'Quantity', style: styles.cellQuantity },
        { title: 'Unit', style: styles.cellUnit },
    ];

    if (!excludePrice) {
        headers.push(
            { title: 'Unit Price', style: styles.cellPrice },
            { title: 'Total', style: styles.cellTotal }
        );
    }

    const formatDate = (date) => {
        if (!date) return "____________";
        return new Date(date).toLocaleDateString();
    };

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>Weera Group Inventory</Text>
                    <Text style={styles.subHeaderText}>
                        Print Date: {new Date().toLocaleDateString()} Time: {new Date().toLocaleTimeString()}
                    </Text>
                    <Text style={styles.subHeaderText}>
                        Date From: {formatDate(startDate)} Date To: {formatDate(endDate)}
                    </Text>
                    <Text style={styles.headerText}>Purchase Order to Supplier</Text>
                </View>

                {/* Table Header */}
                <View style={styles.tableHeader}>
                    {headers.map((header, index) => (
                        <Text key={index} style={header.style}>{header.title}</Text>
                    ))}
                </View>

                {/* Table Body */}
                {data.map((row, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={styles.cellNo}>{index + 1}</Text>
                        <Text style={styles.cellDate}>{row.date}</Text>
                        <Text style={styles.cellRef}>{row.refno}</Text>
                        <Text style={styles.cellSupplier}>{row.supplier_code}</Text>
                        <Text style={styles.cellBranch}>{row.branch_code}</Text>
                        <Text style={styles.cellProduct}>{row.product_name}</Text>
                        <Text style={styles.cellQuantity}>{row.quantity}</Text>
                        <Text style={styles.cellUnit}>{row.unit_code}</Text>
                        {!excludePrice && (
                            <>
                                <Text style={styles.cellPrice}>{row.unit_price}</Text>
                                <Text style={styles.cellTotal}>{row.total}</Text>
                            </>
                        )}
                    </View>
                ))}
            </Page>
        </Document>
    );
};

// Main export function
export const exportToPdfWhPos = async (data, excludePrice = false, startDate, endDate) => {
    try {
        const blob = await pdf(
            <PurchaseOrderPDF
                data={data}
                excludePrice={excludePrice}
                startDate={startDate}
                endDate={endDate}
            />
        ).toBlob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `purchase_orders_${new Date().toISOString().split('T')[0]}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
};