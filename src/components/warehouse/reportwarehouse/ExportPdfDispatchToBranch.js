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
        width: '10%',
        textAlign: 'center',
        fontSize: 10,
    },
    cellRef: {
        width: '12%',
        textAlign: 'center',
        fontSize: 10,
    },
    cellBranch: {
        width: '15%',
        textAlign: 'left',
        fontSize: 10,
    },
    cellProduct: {
        width: '20%',
        textAlign: 'left',
        fontSize: 10,
    },
    cellTemp: {
        width: '8%',
        textAlign: 'center',
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

const groupDataByRefno = (data) => {
    let lastRefno = null;
    return data.map(item => {
        const isFirstInGroup = item.refno !== lastRefno;
        lastRefno = item.refno;
        return {
            ...item,
            date: isFirstInGroup ? item.date : '',
            refno: isFirstInGroup ? item.refno : '',
            branch_code: isFirstInGroup ? item.branch_code : '',
            total: isFirstInGroup ? item.total : ''
        };
    });
};

// PDF Document Component
const DispatchToBranchPDF = ({ data, excludePrice = false, startDate, endDate }) => {
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
        { title: 'Product Name', style: styles.cellProduct },
        { title: 'Temp (°C)', style: styles.cellTemp }, // Added temperature column
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
                <View style={styles.header}>
                    <Text style={styles.headerText}>Weera Group Inventory</Text>
                    <View style={styles.dateInfo}>
                        <Text>Print Date: {new Date().toLocaleDateString()} Time: {new Date().toLocaleTimeString()}</Text>
                    </View>
                    <Text style={styles.titleText}>Dispatch To Branch</Text>
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
                        <Text style={styles.cellBranch}>{row.branch_code}</Text>
                        <Text style={styles.cellProduct}>{row.product_name}</Text>
                        <Text style={styles.cellTemp}>{row.temperature1 ? `${row.temperature1}°C` : '38°C'}</Text>
                        <Text style={styles.cellQuantity}>{row.quantity}</Text>
                        <Text style={styles.cellUnit}>{row.unit_code}</Text>
                        {!excludePrice && (
                            <>
                                <Text style={styles.cellPrice}>
                                    {Number(row.unit_price).toFixed(2)}
                                </Text>
                                <Text style={styles.cellTotal}>
                                    {row.total ? Number(row.total).toFixed(2) : ''}
                                </Text>
                            </>
                        )}
                    </View>
                ))}

                <View style={styles.tableRow}>
                    <Text style={styles.cellNo}></Text>
                    <Text style={styles.cellDate}></Text>
                    <Text style={styles.cellRef}></Text>
                    <Text style={styles.cellBranch}></Text>
                    <Text style={styles.cellProduct}></Text>
                    <Text style={styles.cellTemp}></Text>
                    <Text style={styles.cellQuantity}></Text>
                    <Text style={styles.cellUnit}></Text>
                    {!excludePrice && (
                        <>
                            <Text style={styles.cellPrice}></Text>
                            <Text style={{ ...styles.cellTotal, fontWeight: 'bold' }}>
                                {totalSum.toFixed(2)}
                            </Text>
                        </>
                    )}
                </View>
            </Page>
        </Document>
    );
};

// Main export function
export const exportToPdfWhDpb = async (data, excludePrice = false, startDate, endDate) => {
    try {
        const blob = await pdf(
            <DispatchToBranchPDF
                data={data}
                excludePrice={excludePrice}
                startDate={startDate}
                endDate={endDate}
            />
        ).toBlob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dispatch_to_branch_${new Date().toISOString().split('T')[0]}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
};