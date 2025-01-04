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
        position: 'relative',
    },
    headerText: {
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 5,
        fontWeight: 'bold',
    },
    dateInfo: {
        position: 'absolute',
        right: 0,
        top: 0,
        fontSize: 8,
        textAlign: 'right',
    },
    titleText: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },
    subHeaderText: {
        textAlign: 'center',
        fontSize: 8,
        marginTop: 10
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
    cellNo: {
        width: '5%',
        textAlign: 'center',
        fontSize: 10,
    },
    cellDate: {
        width: '12%',
        textAlign: 'center',
        fontSize: 10,
    },
    cellValue: {
        width: '9%',
        textAlign: 'right',
        fontSize: 10,
    }
});

// PDF Document Component
const MonthlyStockCardPDF = ({ data, excludePrice = false, startDate, endDate }) => {
    const formatDate = (date) => {
        if (!date) return "____________";
        return new Date(date).toLocaleDateString();
    };

    const formatNumber = (num) => {
        return num?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00';
    };

    // Calculate totals
    const totals = data.reduce((acc, item) => ({
        beg_amt: acc.beg_amt + (item.beg1_amt || 0),
        in_amt: acc.in_amt + (item.in1_amt || 0),
        out_amt: acc.out_amt + (item.out1_amt || 0),
        upd_amt: acc.upd_amt + (item.upd1_amt || 0)
    }), {
        beg_amt: 0,
        in_amt: 0,
        out_amt: 0,
        upd_amt: 0
    });

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Weera Group Inventory</Text>
                    <View style={styles.dateInfo}>
                        <Text>Print Date: {new Date().toLocaleDateString()} Time: {new Date().toLocaleTimeString()}</Text>
                    </View>
                    <Text style={styles.titleText}>Monthly Stock Card Report</Text>
                    <Text style={styles.subHeaderText}>
                        Date From: {formatDate(startDate)} Date To: {formatDate(endDate)}
                    </Text>
                </View>

                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={styles.cellNo}>No.</Text>
                        <Text style={styles.cellDate}>Date</Text>
                        <Text style={styles.cellValue}>Beg</Text>
                        <Text style={styles.cellValue}>In</Text>
                        <Text style={styles.cellValue}>Out</Text>
                        <Text style={styles.cellValue}>Update</Text>
                        {!excludePrice && (
                            <>
                                <Text style={styles.cellValue}>Unit Price</Text>
                                <Text style={styles.cellValue}>Beg Amt</Text>
                                <Text style={styles.cellValue}>In Amt</Text>
                                <Text style={styles.cellValue}>Out Amt</Text>
                                <Text style={styles.cellValue}>Update Amt</Text>
                            </>
                        )}
                    </View>

                    {/* Table Data */}
                    {data.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.cellNo}>{index + 1}</Text>
                            <Text style={styles.cellDate}>{formatDate(item.rdate)}</Text>
                            <Text style={styles.cellValue}>{formatNumber(item.beg1)}</Text>
                            <Text style={styles.cellValue}>{formatNumber(item.in1)}</Text>
                            <Text style={styles.cellValue}>{formatNumber(item.out1)}</Text>
                            <Text style={styles.cellValue}>{formatNumber(item.upd1)}</Text>
                            {!excludePrice && (
                                <>
                                    <Text style={styles.cellValue}>{formatNumber(item.uprice)}</Text>
                                    <Text style={styles.cellValue}>{formatNumber(item.beg1_amt)}</Text>
                                    <Text style={styles.cellValue}>{formatNumber(item.in1_amt)}</Text>
                                    <Text style={styles.cellValue}>{formatNumber(item.out1_amt)}</Text>
                                    <Text style={styles.cellValue}>{formatNumber(item.upd1_amt)}</Text>
                                </>
                            )}
                        </View>
                    ))}

                    {/* Total Row */}
                    {!excludePrice && (
                        <View style={[styles.tableRow, { borderTopWidth: 1 }]}>
                            <Text style={styles.cellNo}></Text>
                            <Text style={[styles.cellDate, { fontWeight: 'bold' }]}>Total:</Text>
                            <Text style={styles.cellValue}></Text>
                            <Text style={styles.cellValue}></Text>
                            <Text style={styles.cellValue}></Text>
                            <Text style={styles.cellValue}></Text>
                            <Text style={styles.cellValue}></Text>
                            <Text style={[styles.cellValue, { fontWeight: 'bold' }]}>{formatNumber(totals.beg_amt)}</Text>
                            <Text style={[styles.cellValue, { fontWeight: 'bold' }]}>{formatNumber(totals.in_amt)}</Text>
                            <Text style={[styles.cellValue, { fontWeight: 'bold' }]}>{formatNumber(totals.out_amt)}</Text>
                            <Text style={[styles.cellValue, { fontWeight: 'bold' }]}>{formatNumber(totals.upd_amt)}</Text>
                        </View>
                    )}
                </View>
            </Page>
        </Document>
    );
};

// Main export function
export const exportToPdfMonthlyStockCard = async (data, excludePrice = false, startDate, endDate) => {
    try {
        const blob = await pdf(
            <MonthlyStockCardPDF
                data={data}
                excludePrice={excludePrice}
                startDate={startDate}
                endDate={endDate}
            />
        ).toBlob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `monthly_stock_card_${new Date().toISOString().split('T')[0]}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
};