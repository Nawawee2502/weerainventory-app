import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import { usePagination } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 12,
        paddingBottom: 65, // Add space for the footer
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        marginTop: 10,
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
    tableColNo: {
        width: '5%',
    },
    tableColName: {
        width: '20%',
    },
    tableColID: {
        width: '10%',
    },
    tableColType: {
        width: '15%',
    },
    tableColUnit: {
        width: '10%',
    },
    tableColOther: {
        width: '10%',
    },
    tableCellHeader: {
        textAlign: 'center',
        fontSize: 9,
        fontWeight: 'bold',
        padding: 3,
    },
    tableCell: {
        textAlign: 'center',
        fontSize: 8,
        padding: 3,
    },
    tableCellLeft: {
        textAlign: 'left',
        fontSize: 8,
        padding: 3,
    },
    tableCellRight: {
        textAlign: 'right',
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

// Table header component that will be reused on each page
const TableHeader = () => (
    <View style={styles.tableHeader} fixed>
        <View style={styles.tableColNo}>
            <Text style={styles.tableCellHeader}>No.</Text>
        </View>
        <View style={styles.tableColType}>
            <Text style={styles.tableCellHeader}>Type Product</Text>
        </View>
        <View style={styles.tableColID}>
            <Text style={styles.tableCellHeader}>Product ID</Text>
        </View>
        <View style={styles.tableColName}>
            <Text style={styles.tableCellHeader}>Product Name</Text>
        </View>
        <View style={styles.tableColOther}>
            <Text style={styles.tableCellHeader}>Tax</Text>
        </View>
        <View style={styles.tableColUnit}>
            <Text style={styles.tableCellHeader}>Large Unit</Text>
        </View>
        <View style={styles.tableColUnit}>
            <Text style={styles.tableCellHeader}>Small Unit</Text>
        </View>
        <View style={styles.tableColOther}>
            <Text style={styles.tableCellHeader}>Conversion Qty</Text>
        </View>
    </View>
);

// PDF Document Component
const ProductReportPDF = ({ data, selectedTypeProduct }) => {
    // Get the type name if a type was selected
    const typeName = selectedTypeProduct ? 
        (data.find(item => item.typeproduct_code === selectedTypeProduct)?.tbl_typeproduct?.typeproduct_name || 'Selected Type') : 
        'All Types';
    
    return (
        <Document>
            <Page 
                size="A4" 
                orientation="landscape" 
                style={styles.page}
            >
                {/* Header Section */}
                <View style={styles.header} fixed>
                    <Text style={styles.headerText}>Weera Group Inventory</Text>
                    <View style={styles.dateInfo}>
                        <Text>Print Date: {new Date().toLocaleDateString()}</Text>
                        <Text>Time: {new Date().toLocaleTimeString()}</Text>
                    </View>
                    <Text style={styles.headerText}>Product Report</Text>
                    <Text style={styles.subHeaderText}>
                        Type Product: {typeName}
                    </Text>
                </View>

                {/* Table Section */}
                <View style={styles.table}>
                    {/* Table Header - will appear on each page */}
                    <TableHeader />

                    {/* Table Body */}
                    {data.map((item, index) => (
                        <View key={index} style={styles.tableRow} wrap={false}>
                            <View style={styles.tableColNo}>
                                <Text style={styles.tableCell}>{item.id}</Text>
                            </View>
                            <View style={styles.tableColType}>
                                <Text style={styles.tableCellLeft}>{item.tbl_typeproduct?.typeproduct_name || '-'}</Text>
                            </View>
                            <View style={styles.tableColID}>
                                <Text style={styles.tableCell}>{item.product_code}</Text>
                            </View>
                            <View style={styles.tableColName}>
                                <Text style={styles.tableCellLeft}>{item.product_name}</Text>
                            </View>
                            <View style={styles.tableColOther}>
                                <Text style={styles.tableCell}>{item.tax1 === 'Y' ? 'Yes' : 'No'}</Text>
                            </View>
                            <View style={styles.tableColUnit}>
                                <Text style={styles.tableCell}>{item.productUnit1?.unit_name || '-'}</Text>
                            </View>
                            <View style={styles.tableColUnit}>
                                <Text style={styles.tableCell}>{item.productUnit2?.unit_name || '-'}</Text>
                            </View>
                            <View style={styles.tableColOther}>
                                <Text style={styles.tableCellRight}>{item.unit_conversion_factor}</Text>
                            </View>
                        </View>
                    ))}

                    {/* Total Row */}
                    <View style={styles.totalRow} wrap={false}>
                        <View style={styles.tableColNo}>
                            <Text style={styles.totalLabel}>Total:</Text>
                        </View>
                        <View style={{ width: '45%' }}>
                            <Text style={styles.totalCell}>{data.length} Products</Text>
                        </View>
                    </View>
                </View>

                {/* Footer with page numbers */}
                <Text
                    style={styles.footer}
                    render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                    fixed
                />
            </Page>
        </Document>
    );
};

// Export function
export const exportToPdfProduct = async (data, selectedTypeProduct) => {
    try {
        // Sort the data alphabetically by product_name (A-Z)
        const sortedData = [...data].sort((a, b) => {
            // Compare product names in a case-insensitive manner
            return a.product_name.toLowerCase().localeCompare(b.product_name.toLowerCase());
        });
        
        // Update IDs to match the new sorted order
        const sortedDataWithUpdatedIds = sortedData.map((item, index) => ({
            ...item,
            id: index + 1
        }));

        const blob = await pdf(
            <ProductReportPDF
                data={sortedDataWithUpdatedIds}
                selectedTypeProduct={selectedTypeProduct}
            />
        ).toBlob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `product_record_${selectedTypeProduct || 'all'}_${new Date().toISOString().split('T')[0]}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
};