import React from 'react';

const PrintLayout = ({ data, excludePrice = false, startDate, endDate }) => {
  const formatDate = (date) => {
    if (!date) return "____________";
    return new Date(date).toLocaleDateString();
  };

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
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
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerText}>Weera Group Inventory</div>
        <div style={styles.dateInfo}>
          <div>Print Date: {formatDate(new Date())} Time: {new Date().toLocaleTimeString()}</div>
        </div>
        <div style={styles.titleText}>Monthly Stock Card Report</div>
        <div style={styles.subHeaderText}>
          Date From: {formatDate(startDate)} To: {formatDate(endDate)}
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, ...styles.centerText, width: '50px' }}>No.</th>
            <th style={{ ...styles.th, ...styles.centerText, width: '100px' }}>Date</th>
            <th style={{ ...styles.th, ...styles.leftText, width: '120px' }}>Ref No</th>
            <th style={{ ...styles.th, ...styles.rightText, width: '80px' }}>Beg</th>
            <th style={{ ...styles.th, ...styles.rightText, width: '80px' }}>In</th>
            <th style={{ ...styles.th, ...styles.rightText, width: '80px' }}>Out</th>
            <th style={{ ...styles.th, ...styles.rightText, width: '80px' }}>Update</th>
            {!excludePrice && (
              <>
                <th style={{ ...styles.th, ...styles.rightText, width: '100px' }}>Unit Price</th>
                <th style={{ ...styles.th, ...styles.rightText, width: '100px' }}>Beg Amt</th>
                <th style={{ ...styles.th, ...styles.rightText, width: '100px' }}>In Amt</th>
                <th style={{ ...styles.th, ...styles.rightText, width: '100px' }}>Out Amt</th>
                <th style={{ ...styles.th, ...styles.rightText, width: '100px' }}>Update Amt</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td style={{ ...styles.td, ...styles.centerText }}>{index + 1}</td>
              <td style={{ ...styles.td, ...styles.centerText }}>{formatDate(item.rdate)}</td>
              <td style={{ ...styles.td, ...styles.leftText }}>{item.refno}</td>
              <td style={{ ...styles.td, ...styles.rightText }}>{formatNumber(item.beg1)}</td>
              <td style={{ ...styles.td, ...styles.rightText }}>{formatNumber(item.in1)}</td>
              <td style={{ ...styles.td, ...styles.rightText }}>{formatNumber(item.out1)}</td>
              <td style={{ ...styles.td, ...styles.rightText }}>{formatNumber(item.upd1)}</td>
              {!excludePrice && (
                <>
                  <td style={{ ...styles.td, ...styles.rightText }}>{formatNumber(item.uprice)}</td>
                  <td style={{ ...styles.td, ...styles.rightText }}>{formatNumber(item.beg1_amt)}</td>
                  <td style={{ ...styles.td, ...styles.rightText }}>{formatNumber(item.in1_amt)}</td>
                  <td style={{ ...styles.td, ...styles.rightText }}>{formatNumber(item.out1_amt)}</td>
                  <td style={{ ...styles.td, ...styles.rightText }}>{formatNumber(item.upd1_amt)}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
        {!excludePrice && (
          <tfoot>
            <tr>
              <td colSpan="3" style={{ ...styles.td, ...styles.leftText, fontWeight: 'bold' }}>Total:</td>
              <td style={{ ...styles.td, ...styles.rightText, fontWeight: 'bold' }}>{formatNumber(totals.beg)}</td>
              <td style={{ ...styles.td, ...styles.rightText, fontWeight: 'bold' }}>{formatNumber(totals.in)}</td>
              <td style={{ ...styles.td, ...styles.rightText, fontWeight: 'bold' }}>{formatNumber(totals.out)}</td>
              <td style={{ ...styles.td, ...styles.rightText, fontWeight: 'bold' }}>-</td>
              <td style={{ ...styles.td, ...styles.rightText, fontWeight: 'bold' }}>-</td>
              <td style={{ ...styles.td, ...styles.rightText, fontWeight: 'bold' }}>{formatNumber(totals.beg_amt)}</td>
              <td style={{ ...styles.td, ...styles.rightText, fontWeight: 'bold' }}>{formatNumber(totals.in_amt)}</td>
              <td style={{ ...styles.td, ...styles.rightText, fontWeight: 'bold' }}>{formatNumber(totals.out_amt)}</td>
              <td style={{ ...styles.td, ...styles.rightText, fontWeight: 'bold' }}>{formatNumber(totals.upd_amt)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

export default PrintLayout;