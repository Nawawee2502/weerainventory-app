import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

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
        display: 'table',
        width: 'auto',
        marginTop: 10,
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row'
    },
    tableColHeader: {
        width: '8%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: '#f8f9fa',
        padding: 5
    },
    tableCol: {
        width: '8%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 5
    },
    tableCellHeader: {
        margin: 'auto',
        fontSize: 10,
        fontWeight: 'bold'
    },
    tableCell: {
        margin: 'auto',
        fontSize: 10
    }
});

const groupDataByRefno = (data) => {
    let lastRefno = null;
    return data.map(item => {
        const isFirstInGroup = item.refno !== lastRefno;
        lastRefno = item.refno;
        return {
            ...item,
            date: isFirstInGroup ? item.date : '',
            refno: isFirstInGroup ? item.refno : '',
            kitchen: isFirstInGroup ? item.kitchen : '',
            total: isFirstInGroup ? item.total : ''
        };
    });
};

const GoodsRequisitionPDF = ({ data, excludePrice = false, startDate, endDate }) => {
    const groupedData = groupDataByRefno(data);

    const formatDate = (date) => {
        if (!date) return "____________";
        return new Date(date).toLocaleDateString();
    };

    const calculateTotal = () => {
        const uniqueTotals = new Set();
        data.forEach(item => {
            if (item.total) {
                uniqueTotals.add(item.refno + '-' + item.total);
            }
        });

        return Array.from(uniqueTotals)
            .map(item => Number(item.split('-')[1]))
            .reduce((sum, total) => sum + total, 0);
    };

    const renderTableHeader = () => (
        <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '4%' }]}>
                <Text style={styles.tableCellHeader}>No.</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '8%' }]}>
                <Text style={styles.tableCellHeader}>Date</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '10%' }]}>
                <Text style={styles.tableCellHeader}>Ref.no</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '12%' }]}>
                <Text style={styles.tableCellHeader}>Kitchen</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '8%' }]}>
                <Text style={styles.tableCellHeader}>Product ID</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '12%' }]}>
                <Text style={styles.tableCellHeader}>Product Name</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '6%' }]}>
                <Text style={styles.tableCellHeader}>Qty</Text>
            </View>
            {!excludePrice && (
                <View style={[styles.tableColHeader, { width: '8%' }]}>
                    <Text style={styles.tableCellHeader}>Unit Price</Text>
                </View>
            )}
            <View style={[styles.tableColHeader, { width: '8%' }]}>
                <Text style={styles.tableCellHeader}>Expire Date</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '6%' }]}>
                <Text style={styles.tableCellHeader}>Unit</Text>
            </View>
            {!excludePrice && (
                <>
                    <View style={[styles.tableColHeader, { width: '8%' }]}>
                        <Text style={styles.tableCellHeader}>Amount</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '8%' }]}>
                        <Text style={styles.tableCellHeader}>Total</Text>
                    </View>
                </>
            )}
            <View style={[styles.tableColHeader, { width: '8%' }]}>
                <Text style={styles.tableCellHeader}>Username</Text>
            </View>
        </View>
    );

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Weera Group Inventory</Text>
                    <View style={styles.dateInfo}>
                        <Text>Print Date: {new Date().toLocaleDateString()}</Text>
                        <Text>Time: {new Date().toLocaleTimeString()}</Text>
                    </View>
                    <Text style={styles.titleText}>Goods Requisition Form</Text>
                    <Text style={styles.subHeaderText}>
                        Date From: {formatDate(startDate)} Date To: {formatDate(endDate)}
                    </Text>
                </View>

                <View style={styles.table}>
                    {renderTableHeader()}
                    {groupedData.map((row, index) => (
                        <View key={index} style={styles.tableRow}>
                            <View style={[styles.tableCol, { width: '4%' }]}>
                                <Text style={styles.tableCell}>{index + 1}</Text>
                            </View>
                            <View style={[styles.tableCol, { width: '8%' }]}>
                                <Text style={styles.tableCell}>{row.date}</Text>
                            </View>
                            <View style={[styles.tableCol, { width: '10%' }]}>
                                <Text style={styles.tableCell}>{row.refno}</Text>
                            </View>
                            <View style={[styles.tableCol, { width: '12%' }]}>
                                <Text style={styles.tableCell}>{row.kitchen}</Text>
                            </View>
                            <View style={[styles.tableCol, { width: '8%' }]}>
                                <Text style={styles.tableCell}>{row.product_id}</Text>
                            </View>
                            <View style={[styles.tableCol, { width: '12%' }]}>
                                <Text style={styles.tableCell}>{row.product_name}</Text>
                            </View>
                            <View style={[styles.tableCol, { width: '6%' }]}>
                                <Text style={styles.tableCell}>{row.quantity}</Text>
                            </View>
                            {!excludePrice && (
                                <View style={[styles.tableCol, { width: '8%' }]}>
                                    <Text style={styles.tableCell}>
                                        {row.unit_price ? Number(row.unit_price).toFixed(2) : ''}
                                    </Text>
                                </View>
                            )}
                            <View style={[styles.tableCol, { width: '8%' }]}>
                                <Text style={styles.tableCell}>{row.expireDate}</Text>
                            </View>
                            <View style={[styles.tableCol, { width: '6%' }]}>
                                <Text style={styles.tableCell}>{row.unit_code}</Text>
                            </View>
                            {!excludePrice && (
                                <>
                                    <View style={[styles.tableCol, { width: '8%' }]}>
                                        <Text style={styles.tableCell}>
                                            {row.amount ? Number(row.amount).toFixed(2) : ''}
                                        </Text>
                                    </View>
                                    <View style={[styles.tableCol, { width: '8%' }]}>
                                        <Text style={styles.tableCell}>
                                            {row.total ? Number(row.total).toFixed(2) : ''}
                                        </Text>
                                    </View>
                                </>
                            )}
                            <View style={[styles.tableCol, { width: '8%' }]}>
                                <Text style={styles.tableCell}>{row.user_code}</Text>
                            </View>
                        </View>
                    ))}
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCol, { width: excludePrice ? '84%' : '68%' }]}>
                            <Text style={[styles.tableCell, { textAlign: 'right' }]}>Total:</Text>
                        </View>
                        {!excludePrice && (
                            <View style={[styles.tableCol, { width: '8%' }]}>
                                <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>
                                    {calculateTotal().toFixed(2)}
                                </Text>
                            </View>
                        )}
                        <View style={[styles.tableCol, { width: '8%' }]}>
                            <Text style={styles.tableCell}></Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export const exportToPdfGrf = async (data, excludePrice = false, startDate, endDate) => {
    try {
        const blob = await pdf(
            <GoodsRequisitionPDF
                data={data}
                excludePrice={excludePrice}
                startDate={startDate}
                endDate={endDate}
            />
        ).toBlob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `goods_requisition_${new Date().toISOString().split('T')[0]}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
};