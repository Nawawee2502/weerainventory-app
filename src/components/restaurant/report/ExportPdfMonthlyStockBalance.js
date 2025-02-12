import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 12,
    },
    header: {
        marginBottom: 20,
        textAlign: 'center'
    },
    title: {
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center'
    },
    table: {
        width: '100%',
        marginTop: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        padding: 5,
    },
    tableHeader: {
        backgroundColor: '#f8f9fa',
    },
    cellNo: {
        width: '8%',
        textAlign: 'center',
    },
    cellProduct: {
        width: '25%',
    },
    cellUnit: {
        width: '10%',
    },
    cellAmount: {
        width: '10%',
        textAlign: 'right',
    },
    cellBalance: {
        width: '10%',
        textAlign: 'right',
    }
});

const formatNumber = (num) => {
    return num?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00';
};

const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
};

// PDF Document Component
const MonthlyStockBalancePDF = ({ data, excludePrice = false, startDate, endDate }) => {
    // Calculate totals
    const totals = data.reduce((acc, item) => {
        const balance = ((item.beg1 || 0) + (item.in1 || 0) - (item.out1 || 0)) + (item.upd1 || 0);
        const balanceAmount = ((item.beg1_amt || 0) + (item.in1_amt || 0) - (item.out1_amt || 0)) + (item.upd1_amt || 0);

        return {
            beg: acc.beg + (item.beg1 || 0),
            in: acc.in + (item.in1 || 0),
            out: acc.out + (item.out1 || 0),
            upd: acc.upd + (item.upd1 || 0),
            balance: acc.balance + balance,
            total: acc.total + balanceAmount
        };
    }, { beg: 0, in: 0, out: 0, upd: 0, balance: 0, total: 0 });

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.header}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Weera Group Inventory</Text>
                    <Text style={{ fontSize: 10, marginTop: 5 }}>
                        Monthly Stock Balance Report
                    </Text>
                    <Text style={{ fontSize: 10, marginTop: 5 }}>
                        Date Range: {formatDate(startDate)} - {formatDate(endDate)}
                    </Text>
                    <Text style={{ fontSize: 10, marginTop: 5 }}>
                        Print Date: {formatDate(new Date())} Time: {new Date().toLocaleTimeString()}
                    </Text>
                </View>

                <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={styles.cellNo}>No.</Text>
                    <Text style={styles.cellProduct}>Product</Text>
                    <Text style={styles.cellUnit}>Unit</Text>
                    <Text style={styles.cellAmount}>Beg</Text>
                    <Text style={styles.cellAmount}>In</Text>
                    <Text style={styles.cellAmount}>Out</Text>
                    <Text style={styles.cellAmount}>Update</Text>
                    <Text style={styles.cellAmount}>Balance</Text>
                    {!excludePrice && <Text style={styles.cellAmount}>Total</Text>}
                </View>

                {data.map((item, index) => {
                    const balance = ((item.beg1 || 0) + (item.in1 || 0) - (item.out1 || 0)) + (item.upd1 || 0);
                    const balanceAmount = ((item.beg1_amt || 0) + (item.in1_amt || 0) - (item.out1_amt || 0)) + (item.upd1_amt || 0);

                    return (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.cellNo}>{index + 1}</Text>
                            <Text style={styles.cellProduct}>{item.tbl_product?.product_name}</Text>
                            <Text style={styles.cellUnit}>{item.tbl_unit?.unit_name}</Text>
                            <Text style={styles.cellAmount}>{formatNumber(item.beg1)}</Text>
                            <Text style={styles.cellAmount}>{formatNumber(item.in1)}</Text>
                            <Text style={styles.cellAmount}>{formatNumber(item.out1)}</Text>
                            <Text style={styles.cellAmount}>{formatNumber(item.upd1)}</Text>
                            <Text style={styles.cellAmount}>{formatNumber(balance)}</Text>
                            {!excludePrice && (
                                <Text style={styles.cellAmount}>{formatNumber(balanceAmount)}</Text>
                            )}
                        </View>
                    );
                })}

                <View style={[styles.tableRow, { marginTop: 10, borderTopWidth: 1 }]}>
                    <Text style={[styles.cellNo, { fontWeight: 'bold' }]}>Total</Text>
                    <Text style={styles.cellProduct}></Text>
                    <Text style={styles.cellUnit}></Text>
                    <Text style={[styles.cellAmount, { fontWeight: 'bold' }]}>{formatNumber(totals.beg)}</Text>
                    <Text style={[styles.cellAmount, { fontWeight: 'bold' }]}>{formatNumber(totals.in)}</Text>
                    <Text style={[styles.cellAmount, { fontWeight: 'bold' }]}>{formatNumber(totals.out)}</Text>
                    <Text style={[styles.cellAmount, { fontWeight: 'bold' }]}>{formatNumber(totals.upd)}</Text>
                    <Text style={[styles.cellAmount, { fontWeight: 'bold' }]}>{formatNumber(totals.balance)}</Text>
                    {!excludePrice && (
                        <Text style={[styles.cellAmount, { fontWeight: 'bold' }]}>{formatNumber(totals.total)}</Text>
                    )}
                </View>
            </Page>
        </Document>
    );
};

export const exportToPdfMonthlyStockBalance = async (data, excludePrice = false, startDate, endDate) => {
    try {
        const blob = await pdf(
            <MonthlyStockBalancePDF
                data={data}
                excludePrice={excludePrice}
                startDate={startDate}
                endDate={endDate}
            />
        ).toBlob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `monthly_stock_balance_${new Date().toISOString().split('T')[0]}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
};

export default MonthlyStockBalancePDF;