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
        textAlign: 'center',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    dateInfo: {
        position: 'absolute',
        right: 0,
        top: 0,
        fontSize: 8,
    },
    subHeaderText: {
        fontSize: 10,
        marginTop: 5,
    },
    table: {
        width: '100%',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        alignItems: 'center',
        height: 24,
        fontStyle: 'bold',
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        alignItems: 'center',
        height: 24,
        backgroundColor: '#f0f0f0',
        fontStyle: 'bold',
    },
    tableCol: {
        width: '8%',
    },
    tableColNo: {
        width: '5%',
    },
    tableColDate: {
        width: '10%',
    },
    tableColRef: {
        width: '15%',
    },
    tableColAmount: {
        width: '9%',
    },
    tableCellHeader: {
        textAlign: 'center',
        fontSize: 9,
        fontWeight: 'bold',
        padding: 3,
    },
    tableCell: {
        textAlign: 'right',
        fontSize: 8,
        padding: 3,
    },
    tableCellCenter: {
        textAlign: 'center',
        fontSize: 8,
        padding: 3,
    },
    tableCellLeft: {
        textAlign: 'left',
        fontSize: 8,
        padding: 3,
    },
    totalRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#000',
        borderTopStyle: 'solid',
        alignItems: 'center',
        height: 24,
    },
    totalCell: {
        textAlign: 'right',
        fontSize: 8,
        padding: 3,
        fontWeight: 'bold',
    },
    totalLabel: {
        textAlign: 'left',
        fontSize: 8,
        padding: 3,
        fontWeight: 'bold',
    },
});

const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
};

const formatNumber = (num) => {
    if (num === null || num === undefined) return "0.00";
    return Number(num).toFixed(2);
};

// PDF Document Component
const MonthlyKitchenStockCardPDF = ({ data, excludePrice = false, startDate, endDate }) => {
    // Calculate totals
    const totals = data.reduce((acc, item) => ({
        beg: acc.beg + (item.beg1 || 0),
        in: acc.in + (item.in1 || 0),
        out: acc.out + (item.out1 || 0),
        beg_amt: acc.beg_amt + (item.beg1_amt || 0),
        in_amt: acc.in_amt + (item.in1_amt || 0),
        out_amt: acc.out_amt + (item.out1_amt || 0),
        upd_amt: acc.upd_amt + (item.upd1_amt || 0)
    }), { beg: 0, in: 0, out: 0, beg_amt: 0, in_amt: 0, out_amt: 0, upd_amt: 0 });

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>Weera Group Inventory</Text>
                    <View style={styles.dateInfo}>
                        <Text>Print Date: {formatDate(new Date())}</Text>
                        <Text>Time: {new Date().toLocaleTimeString()}</Text>
                    </View>
                    <Text style={styles.headerText}>Monthly Kitchen Stock Card Report</Text>
                    <Text style={styles.subHeaderText}>
                        Date From: {formatDate(startDate)} To: {formatDate(endDate)}
                    </Text>
                </View>

                {/* Table Section */}
                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <View style={styles.tableColNo}>
                            <Text style={styles.tableCellHeader}>No.</Text>
                        </View>
                        <View style={styles.tableColDate}>
                            <Text style={styles.tableCellHeader}>Date</Text>
                        </View>
                        <View style={styles.tableColRef}>
                            <Text style={styles.tableCellHeader}>Ref No</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCellHeader}>Beg</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCellHeader}>In</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCellHeader}>Out</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCellHeader}>Update</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCellHeader}>Balance</Text>
                        </View>
                        {!excludePrice && (
                            <>
                                <View style={styles.tableColAmount}>
                                    <Text style={styles.tableCellHeader}>Unit Price</Text>
                                </View>
                                <View style={styles.tableColAmount}>
                                    <Text style={styles.tableCellHeader}>Beg Amt</Text>
                                </View>
                                <View style={styles.tableColAmount}>
                                    <Text style={styles.tableCellHeader}>In Amt</Text>
                                </View>
                                <View style={styles.tableColAmount}>
                                    <Text style={styles.tableCellHeader}>Out Amt</Text>
                                </View>
                                <View style={styles.tableColAmount}>
                                    <Text style={styles.tableCellHeader}>Update Amt</Text>
                                </View>
                                <View style={styles.tableColAmount}>
                                    <Text style={styles.tableCellHeader}>Balance Amt</Text>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Table Body */}
                    {data.map((item, index) => {
                        const balance = ((item.beg1 || 0) + (item.in1 || 0) - (item.out1 || 0)) + (item.upd1 || 0);
                        const balanceAmount = ((item.beg1_amt || 0) + (item.in1_amt || 0) - (item.out1_amt || 0)) + (item.upd1_amt || 0);

                        return (
                            <View key={index} style={styles.tableRow}>
                                <View style={styles.tableColNo}>
                                    <Text style={styles.tableCellCenter}>{index + 1}</Text>
                                </View>
                                <View style={styles.tableColDate}>
                                    <Text style={styles.tableCellCenter}>{formatDate(item.rdate)}</Text>
                                </View>
                                <View style={styles.tableColRef}>
                                    <Text style={styles.tableCellLeft}>{item.refno}</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>{formatNumber(item.beg1)}</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>{formatNumber(item.in1)}</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>{formatNumber(item.out1)}</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>{formatNumber(item.upd1)}</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>{formatNumber(balance)}</Text>
                                </View>
                                {!excludePrice && (
                                    <>
                                        <View style={styles.tableColAmount}>
                                            <Text style={styles.tableCell}>{formatNumber(item.uprice)}</Text>
                                        </View>
                                        <View style={styles.tableColAmount}>
                                            <Text style={styles.tableCell}>{formatNumber(item.beg1_amt)}</Text>
                                        </View>
                                        <View style={styles.tableColAmount}>
                                            <Text style={styles.tableCell}>{formatNumber(item.in1_amt)}</Text>
                                        </View>
                                        <View style={styles.tableColAmount}>
                                            <Text style={styles.tableCell}>{formatNumber(item.out1_amt)}</Text>
                                        </View>
                                        <View style={styles.tableColAmount}>
                                            <Text style={styles.tableCell}>{formatNumber(item.upd1_amt)}</Text>
                                        </View>
                                        <View style={styles.tableColAmount}>
                                            <Text style={styles.tableCell}>{formatNumber(balanceAmount)}</Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        );
                    })}

                    {/* Total Row */}
                    <View style={styles.totalRow}>
                        <View style={[styles.tableColNo, styles.tableColRef]}>
                            <Text style={styles.totalLabel}>Total:</Text>
                        </View>
                        <View style={styles.tableColDate}>
                            <Text style={styles.tableCell}></Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.totalCell}>{formatNumber(totals.beg)}</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.totalCell}>{formatNumber(totals.in)}</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.totalCell}>{formatNumber(totals.out)}</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.totalCell}>-</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.totalCell}>-</Text>
                        </View>
                        {!excludePrice && (
                            <>
                                <View style={styles.tableColAmount}>
                                    <Text style={styles.totalCell}>-</Text>
                                </View>
                                <View style={styles.tableColAmount}>
                                    <Text style={styles.totalCell}>{formatNumber(totals.beg_amt)}</Text>
                                </View>
                                <View style={styles.tableColAmount}>
                                    <Text style={styles.totalCell}>{formatNumber(totals.in_amt)}</Text>
                                </View>
                                <View style={styles.tableColAmount}>
                                    <Text style={styles.totalCell}>{formatNumber(totals.out_amt)}</Text>
                                </View>
                                <View style={styles.tableColAmount}>
                                    <Text style={styles.totalCell}>{formatNumber(totals.upd_amt)}</Text>
                                </View>
                                <View style={styles.tableColAmount}>
                                    <Text style={styles.totalCell}>
                                        {formatNumber(totals.beg_amt + totals.in_amt - totals.out_amt + totals.upd_amt)}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export const exportToPdfMonthlyKitchenStockCard = async (data, excludePrice = false, startDate, endDate) => {
    try {
        const blob = await pdf(
            <MonthlyKitchenStockCardPDF
                data={data}
                excludePrice={excludePrice}
                startDate={startDate}
                endDate={endDate}
            />
        ).toBlob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `monthly_kitchen_stock_card_${new Date().toISOString().split('T')[0]}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
};

export default MonthlyKitchenStockCardPDF;