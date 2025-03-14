import React from 'react';

const PrintPreviewMonthlyStockBalance = ({ data, excludePrice = false, startDate, endDate }) => {
    const formatDate = (date) => {
        if (!date) return "";
        const newDate = new Date(date);
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        const day = String(newDate.getDate()).padStart(2, '0');
        const year = newDate.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const styles = {
        container: {
            padding: '2rem',
        },
        header: {
            textAlign: 'center',
            marginBottom: '2rem',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '1rem',
        },
        th: {
            border: '1px solid #000',
            padding: '0.5rem',
            backgroundColor: '#f8f9fa',
            color: '#754C27'
        },
        td: {
            border: '1px solid #000',
            padding: '0.5rem',
        },
        total: {
            fontWeight: 'bold',
            color: '#754C27'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>Weera Group Inventory</h2>
                <p>Monthly Stock Balance Report</p>
                <p>Date: {formatDate(startDate)} - {formatDate(endDate)}</p>
                <p>Print Date: {new Date().toLocaleDateString()} Time: {new Date().toLocaleTimeString()}</p>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>No</th>
                        <th style={styles.th}>Product</th>
                        <th style={styles.th}>Unit</th>
                        <th style={styles.th}>Beg</th>
                        <th style={styles.th}>In</th>
                        <th style={styles.th}>Out</th>
                        <th style={styles.th}>Update</th>
                        <th style={styles.th}>Balance</th>
                        {!excludePrice && <th style={styles.th}>Total</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => {
                        const balance = ((item.beg1 || 0) + (item.in1 || 0) - (item.out1 || 0)) + (item.upd1 || 0);
                        const balanceAmount = ((item.beg1_amt || 0) + (item.in1_amt || 0) - (item.out1_amt || 0)) + (item.upd1_amt || 0);

                        return (
                            <tr key={index}>
                                <td style={styles.td}>{index + 1}</td>
                                <td style={styles.td}>{item.tbl_product?.product_name}</td>
                                <td style={styles.td}>{item.tbl_unit?.unit_name}</td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>{(item.beg1 || 0).toLocaleString()}</td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>{(item.in1 || 0).toLocaleString()}</td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>{(item.out1 || 0).toLocaleString()}</td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>{(item.upd1 || 0).toLocaleString()}</td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>{balance.toLocaleString()}</td>
                                {!excludePrice && (
                                    <td style={{ ...styles.td, textAlign: 'right' }}>
                                        {balanceAmount.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="3" style={{ ...styles.td, ...styles.total }}>Total:</td>
                        <td style={{ ...styles.td, ...styles.total, textAlign: 'right' }}>
                            {data.reduce((sum, item) => sum + (item.beg1 || 0), 0).toLocaleString()}
                        </td>
                        <td style={{ ...styles.td, ...styles.total, textAlign: 'right' }}>
                            {data.reduce((sum, item) => sum + (item.in1 || 0), 0).toLocaleString()}
                        </td>
                        <td style={{ ...styles.td, ...styles.total, textAlign: 'right' }}>
                            {data.reduce((sum, item) => sum + (item.out1 || 0), 0).toLocaleString()}
                        </td>
                        <td style={{ ...styles.td, ...styles.total, textAlign: 'right' }}>
                            {data.reduce((sum, item) => sum + (item.upd1 || 0), 0).toLocaleString()}
                        </td>
                        <td style={{ ...styles.td, ...styles.total, textAlign: 'right' }}>
                            {data.reduce((sum, item) => {
                                const balance = ((item.beg1 || 0) + (item.in1 || 0) - (item.out1 || 0)) + (item.upd1 || 0);
                                return sum + balance;
                            }, 0).toLocaleString()}
                        </td>
                        {!excludePrice && (
                            <td style={{ ...styles.td, ...styles.total, textAlign: 'right' }}>
                                {data.reduce((sum, item) => {
                                    const balanceAmount = ((item.beg1_amt || 0) + (item.in1_amt || 0) - (item.out1_amt || 0)) + (item.upd1_amt || 0);
                                    return sum + balanceAmount;
                                }, 0).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </td>
                        )}
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default PrintPreviewMonthlyStockBalance;