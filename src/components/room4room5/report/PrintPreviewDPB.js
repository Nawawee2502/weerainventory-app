import React from 'react';

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
            restaurant: isFirstInGroup ? item.restaurant : '',
            total: isFirstInGroup ? item.total : ''
        };
    });
};

const PrintLayout = ({ data, excludePrice = false, startDate, endDate }) => {
    const formatDate = (date) => {
        if (!date) return "____________";
        return new Date(date).toLocaleDateString();
    };

    const styles = {
        container: {
            padding: '2rem',
        },
        header: {
            position: 'relative',
            marginBottom: '20px',
        },
        headerText: {
            textAlign: 'center',
            fontSize: '18px',
            marginBottom: '5px',
            fontWeight: 'bold',
        },
        titleText: {
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            marginTop: '10px',
        },
        subHeaderText: {
            textAlign: 'center',
            fontSize: '11px',
            marginTop: '10px'
        },
        dateInfo: {
            position: 'absolute',
            right: 0,
            top: 0,
            fontSize: '11px',
            textAlign: 'right',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '1rem',
        },
        th: {
            border: '1px solid #ccc',
            padding: '0.5rem',
            backgroundColor: '#f8f9fa',
            fontSize: '0.875rem',
            fontWeight: 'bold',
        },
        td: {
            border: '1px solid #ccc',
            padding: '0.5rem',
            fontSize: '0.875rem',
        },
        centerText: {
            textAlign: 'center',
        },
        rightText: {
            textAlign: 'right',
        },
        leftText: {
            textAlign: 'left',
        }
    };

    // Group data
    const groupedData = groupDataByRefno(data);

    // Calculate total
    const uniqueTotals = new Set();
    data.forEach(item => {
        if (item.total) {
            uniqueTotals.add(item.refno + '-' + item.total);
        }
    });

    const totalSum = Array.from(uniqueTotals)
        .map(item => Number(item.split('-')[1]))
        .reduce((sum, total) => sum + total, 0);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerText}>Weera Group Inventory</div>
                <div style={styles.dateInfo}>
                    <div>Print Date: {new Date().toLocaleDateString()} Time: {new Date().toLocaleTimeString()}</div>
                </div>
                <div style={styles.titleText}>Dispatch to Restaurant</div>
                <div style={styles.subHeaderText}>Date From: {formatDate(startDate)} Date To: {formatDate(endDate)}</div>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={{ ...styles.th, ...styles.centerText, width: '40px' }}>No.</th>
                        <th style={{ ...styles.th, ...styles.centerText, width: '90px' }}>Date</th>
                        <th style={{ ...styles.th, ...styles.leftText, width: '100px' }}>Ref.no</th>
                        <th style={{ ...styles.th, ...styles.leftText, width: '120px' }}>Kitchen</th>
                        <th style={{ ...styles.th, ...styles.leftText, width: '120px' }}>Restaurant</th>
                        <th style={{ ...styles.th, ...styles.leftText, width: '80px' }}>Product ID</th>
                        <th style={{ ...styles.th, ...styles.leftText, width: '140px' }}>Product Name</th>
                        <th style={{ ...styles.th, ...styles.rightText, width: '70px' }}>Quantity</th>
                        {!excludePrice && (
                            <th style={{ ...styles.th, ...styles.rightText, width: '80px' }}>Unit Price</th>
                        )}
                        <th style={{ ...styles.th, ...styles.centerText, width: '90px' }}>Expire Date</th>
                        <th style={{ ...styles.th, ...styles.centerText, width: '70px' }}>Unit</th>
                        {!excludePrice && (
                            <>
                                <th style={{ ...styles.th, ...styles.rightText, width: '90px' }}>Amount</th>
                                <th style={{ ...styles.th, ...styles.rightText, width: '90px' }}>Total</th>
                            </>
                        )}
                        <th style={{ ...styles.th, ...styles.leftText, width: '100px' }}>Username</th>
                    </tr>
                </thead>
                <tbody>
                    {groupedData.map((row, index) => (
                        <tr key={index}>
                            <td style={{ ...styles.td, ...styles.centerText }}>{index + 1}</td>
                            <td style={{ ...styles.td, ...styles.centerText }}>{row.date}</td>
                            <td style={{ ...styles.td, ...styles.leftText }}>{row.refno}</td>
                            <td style={{ ...styles.td, ...styles.leftText }}>{row.kitchen}</td>
                            <td style={{ ...styles.td, ...styles.leftText }}>{row.restaurant}</td>
                            <td style={{ ...styles.td, ...styles.leftText }}>{row.product_id}</td>
                            <td style={{ ...styles.td, ...styles.leftText }}>{row.product_name}</td>
                            <td style={{ ...styles.td, ...styles.rightText }}>{row.quantity}</td>
                            {!excludePrice && (
                                <td style={{ ...styles.td, ...styles.rightText }}>
                                    {row.unit_price ? Number(row.unit_price).toFixed(2) : ''}
                                </td>
                            )}
                            <td style={{ ...styles.td, ...styles.centerText }}>{row.expireDate}</td>
                            <td style={{ ...styles.td, ...styles.centerText }}>{row.unit_code}</td>
                            {!excludePrice && (
                                <>
                                    <td style={{ ...styles.td, ...styles.rightText }}>
                                        {row.amount ? Number(row.amount).toFixed(2) : ''}
                                    </td>
                                    <td style={{ ...styles.td, ...styles.rightText }}>
                                        {row.total ? Number(row.total).toFixed(2) : ''}
                                    </td>
                                </>
                            )}
                            <td style={{ ...styles.td, ...styles.leftText }}>{row.user_code}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={!excludePrice ? 12 : 9} style={{ ...styles.td, ...styles.rightText }}>Total:</td>
                        {!excludePrice && (
                            <td style={{ ...styles.td, ...styles.rightText, fontWeight: 'bold' }}>
                                {totalSum.toFixed(2)}
                            </td>
                        )}
                        <td style={{ ...styles.td }}></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default PrintLayout;