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
        width: '42%',
    },
    cellUnit: {
        width: '15%',
    },
    cellQty: {
        width: '15%',
        textAlign: 'right',
    },
    cellAmount: {
        width: '20%',
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

// สร้าง PDF Document Component
const StockBalancePDF = ({ data, excludePrice, startDate, endDate }) => {
    // คำนวณผลรวม
    const totals = data.reduce((acc, item) => {
        const qty = (item.beg1 || 0) + (item.in1 || 0) + (item.upd1 || 0) - (item.out1 || 0);
        const amount = qty * (item.uprice || 0);
        return {
            qty: acc.qty + qty,
            amount: acc.amount + amount
        };
    }, { qty: 0, amount: 0 });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text>Monthly Stock Balance Report</Text>
                    <Text style={{ fontSize: 10, marginTop: 5 }}>
                        Date Range: {formatDate(startDate)} - {formatDate(endDate)}
                    </Text>
                </View>

                <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={styles.cellNo}>No.</Text>
                    <Text style={styles.cellProduct}>Product</Text>
                    <Text style={styles.cellUnit}>Unit</Text>
                    <Text style={styles.cellQty}>Remaining</Text>
                    {!excludePrice && <Text style={styles.cellAmount}>Total</Text>}
                </View>

                {data.map((item, index) => {
                    const qty = (item.beg1 || 0) + (item.in1 || 0) + (item.upd1 || 0) - (item.out1 || 0);
                    const amount = qty * (item.uprice || 0);

                    return (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.cellNo}>{index + 1}</Text>
                            <Text style={styles.cellProduct}>{item.tbl_product.product_name}</Text>
                            <Text style={styles.cellUnit}>{item.tbl_unit.unit_name}</Text>
                            <Text style={styles.cellQty}>{formatNumber(qty)}</Text>
                            {!excludePrice && <Text style={styles.cellAmount}>{formatNumber(amount)}</Text>}
                        </View>
                    );
                })}

                <View style={[styles.tableRow, { marginTop: 10 }]}>
                    <Text style={styles.cellNo}></Text>
                    <Text style={[styles.cellProduct, { fontWeight: 'bold' }]}>Total:</Text>
                    <Text style={styles.cellUnit}></Text>
                    <Text style={[styles.cellQty, { fontWeight: 'bold' }]}>{formatNumber(totals.qty)}</Text>
                    {!excludePrice && (
                        <Text style={[styles.cellAmount, { fontWeight: 'bold' }]}>{formatNumber(totals.amount)}</Text>
                    )}
                </View>
            </Page>
        </Document>
    );
};

// ฟังก์ชั่นสำหรับ Export PDF
export const exportToPdfStockBalance = async (data, excludePrice = false, startDate, endDate) => {
    try {
        const blob = await pdf(
            <StockBalancePDF
                data={data}
                excludePrice={excludePrice}
                startDate={startDate}
                endDate={endDate}
            />
        ).toBlob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `stock_balance_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
};