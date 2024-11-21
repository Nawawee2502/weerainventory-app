import React from 'react';

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
      textAlign: 'center',
      marginBottom: '1.5rem',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
    },
    subtitle: {
      fontSize: '0.875rem',
      marginBottom: '0.25rem',
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Weera Group Inventory</h1>
        <p style={styles.subtitle}>
          Print Date: {new Date().toLocaleDateString()} Time: {new Date().toLocaleTimeString()}
        </p>
        <p style={styles.subtitle}>
          Date From: {formatDate(startDate)} Date To: {formatDate(endDate)}
        </p>
        <h2 style={styles.title}>Purchase Order to Supplier</h2>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, ...styles.centerText, width: '50px' }}>No.</th>
            <th style={{ ...styles.th, ...styles.centerText, width: '100px' }}>Date</th>
            <th style={{ ...styles.th, ...styles.leftText, width: '120px' }}>Ref.no</th>
            <th style={{ ...styles.th, ...styles.leftText, width: '150px' }}>Supplier</th>
            <th style={{ ...styles.th, ...styles.leftText, width: '120px' }}>Branch</th>
            <th style={{ ...styles.th, ...styles.leftText, width: '150px' }}>Product Name</th>
            <th style={{ ...styles.th, ...styles.rightText, width: '80px' }}>Quantity</th>
            <th style={{ ...styles.th, ...styles.centerText, width: '80px' }}>Unit</th>
            {!excludePrice && (
              <>
                <th style={{ ...styles.th, ...styles.rightText, width: '100px' }}>Unit Price</th>
                <th style={{ ...styles.th, ...styles.rightText, width: '100px' }}>Total</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td style={{ ...styles.td, ...styles.centerText }}>{index + 1}</td>
              <td style={{ ...styles.td, ...styles.centerText }}>{row.date}</td>
              <td style={{ ...styles.td, ...styles.leftText }}>{row.refno}</td>
              <td style={{ ...styles.td, ...styles.leftText }}>{row.supplier_code}</td>
              <td style={{ ...styles.td, ...styles.leftText }}>{row.branch_code}</td>
              <td style={{ ...styles.td, ...styles.leftText }}>{row.product_name}</td>
              <td style={{ ...styles.td, ...styles.rightText }}>{row.quantity}</td>
              <td style={{ ...styles.td, ...styles.centerText }}>{row.unit_code}</td>
              {!excludePrice && (
                <>
                  <td style={{ ...styles.td, ...styles.rightText }}>{row.unit_price}</td>
                  <td style={{ ...styles.td, ...styles.rightText }}>{row.total}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PrintLayout;