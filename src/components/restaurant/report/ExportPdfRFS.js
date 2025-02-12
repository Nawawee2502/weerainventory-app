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
    cellNo: { width: '4%', textAlign: 'center', fontSize: 10 },
    cellDate: { width: '7%', textAlign: 'center', fontSize: 10 },
    cellRef: { width: '8%', textAlign: 'left', fontSize: 10 },
    cellBranch: { width: '10%', textAlign: 'left', fontSize: 10 },
    cellSupplier: { width: '10%', textAlign: 'left', fontSize: 10 },
    cellProductId: { width: '7%', textAlign: 'left', fontSize: 10 },
    cellProduct: { width: '12%', textAlign: 'left', fontSize: 10 },
    cellQuantity: { width: '6%', textAlign: 'right', fontSize: 10 },
    cellPrice: { width: '7%', textAlign: 'right', fontSize: 10 },
    cellExpire: { width: '8%', textAlign: 'center', fontSize: 10 },
    cellUnit: { width: '6%', textAlign: 'center', fontSize: 10 },
    cellAmount: { width: '7%', textAlign: 'right', fontSize: 10 },
    cellTotal: { width: '7%', textAlign: 'right', fontSize: 10 },
    cellUser: { width: '8%', textAlign: 'left', fontSize: 10 }
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
            branch: isFirstInGroup ? item.branch : '',
            supplier: isFirstInGroup ? item.supplier : '',
            total: isFirstInGroup ? item.total : ''
        };
    });
};

const ReceiptFromSupplierPDF = ({ data, excludePrice = false, startDate, endDate }) => {
    const groupedData = groupDataByRefno(data);

    const uniqueTotals = new Set();
    data.forEach(item => {
        if (item.total) {
            uniqueTotals.add(item.refno + '-' + item.total);
        }
    });

    const totalSum = Array.from(uniqueTotals)
        .map(item => Number(item.split('-')[1]))
        .reduce((sum, total) => sum + total, 0);

    const headers = [
        { title: 'No.', style: styles.cellNo },
        { title: 'Date', style: styles.cellDate },
        { title: 'Ref.no', style: styles.cellRef },
        { title: 'Branch', style: styles.cellBranch },
        { title: 'Supplier', style: styles.cellSupplier },
        { title: 'Product ID', style: styles.cellProductId },
        { title: 'Product Name', style: styles.cellProduct },
        { title: 'Quantity', style: styles.cellQuantity }
    ];

    if (!excludePrice) {
        headers.push({ title: 'Unit Price', style: styles.cellPrice });
    }

    headers.push(
        { title: 'Expire Date', style: styles.cellExpire },
        { title: 'Unit', style: styles.cellUnit }
    );

    if (!excludePrice) {
        headers.push(
            { title: 'Amount', style: styles.cellAmount },
            { title: 'Total', style: styles.cellTotal }
        );
    }

    headers.push({ title: 'Username', style: styles.cellUser });

    const formatDate = (date) => {
        if (!date) return "____________";
        return new Date(date).toLocaleDateString();
    };

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Weera Group Inventory</Text>
                    <View style={styles.dateInfo}>
                        <Text>Print Date: {new Date().toLocaleDateString()} Time: {new Date().toLocaleTimeString()}</Text>
                    </View>
                    <Text style={styles.titleText}>Receipt From Supplier (Branch)</Text>
                    <Text style={styles.subHeaderText}>Date From: {formatDate(startDate)} Date To: {formatDate(endDate)}</Text>
                </View>

                <View style={styles.tableHeader}>
                    {headers.map((header, index) => (
                        <Text key={index} style={header.style}>{header.title}</Text>
                    ))}
                </View>

                {groupedData.map((row, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={styles.cellNo}>{index + 1}</Text>
                        <Text style={styles.cellDate}>{row.date}</Text>
                        <Text style={styles.cellRef}>{row.refno}</Text>
                        <Text style={styles.cellBranch}>{row.branch}</Text>
                        <Text style={styles.cellSupplier}>{row.supplier}</Text>
                        <Text style={styles.cellProductId}>{row.product_id}</Text>
                        <Text style={styles.cellProduct}>{row.product_name}</Text>
                        <Text style={styles.cellQuantity}>{row.quantity}</Text>
                        {!excludePrice && (
                            <Text style={styles.cellPrice}>
                                {row.unit_price ? Number(row.unit_price).toFixed(2) : ''}
                            </Text>
                        )}
                        <Text style={styles.cellExpire}>{row.expireDate}</Text>
                        <Text style={styles.cellUnit}>{row.unit_code}</Text>
                        {!excludePrice && (
                            <>
                                <Text style={styles.cellAmount}>
                                    {row.amount ? Number(row.amount).toFixed(2) : ''}
                                </Text>
                                <Text style={styles.cellTotal}>
                                    {row.total ? Number(row.total).toFixed(2) : ''}
                                </Text>
                            </>
                        )}
                        <Text style={styles.cellUser}>{row.user_code}</Text>
                    </View>
                ))}

                <View style={styles.tableRow}>
                    <Text style={styles.cellNo}></Text>
                    <Text style={styles.cellDate}></Text>
                    <Text style={styles.cellRef}></Text>
                    <Text style={styles.cellBranch}></Text>
                    <Text style={styles.cellSupplier}></Text>
                    <Text style={styles.cellProductId}></Text>
                    <Text style={styles.cellProduct}></Text>
                    <Text style={styles.cellQuantity}></Text>
                    {!excludePrice && <Text style={styles.cellPrice}></Text>}
                    <Text style={styles.cellExpire}></Text>
                    <Text style={styles.cellUnit}></Text>
                    {!excludePrice && (
                        <>
                            <Text style={styles.cellAmount}></Text>
                            <Text style={{ ...styles.cellTotal, fontWeight: 'bold' }}>
                                {totalSum.toFixed(2)}
                            </Text>
                        </>
                    )}
                    <Text style={styles.cellUser}></Text>
                </View>
            </Page>
        </Document>
    );
};

export const exportToPdfRfs = async (data, excludePrice = false, startDate, endDate) => {
    try {
        const blob = await pdf(
            <ReceiptFromSupplierPDF
                data={data}
                excludePrice={excludePrice}
                startDate={startDate}
                endDate={endDate}
            />
        ).toBlob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt_from_supplier_branch_${new Date().toISOString().split('T')[0]}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
};