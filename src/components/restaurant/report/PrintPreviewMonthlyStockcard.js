import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { format } from 'date-fns';

const PrintPreviewMonthlyStockcard = ({ data, excludePrice, startDate, endDate }) => {
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();
            return `${month}/${day}/${year}`;
        } catch (error) {
            console.error("Error formatting date:", error);
            return dateString;
        }
    };

    const formatNumber = (num) => {
        return Number(num || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
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
        <Box sx={{ p: 4, bgcolor: 'white' }}>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Weera Group Inventory
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1 }}>
                    Print Date: {format(new Date(), 'MM/dd/yyyy')} Time: {new Date().toLocaleTimeString()}
                </Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>
                    Monthly Stock Card Report
                </Typography>
                <Typography>
                    Date: {formatDateForDisplay(startDate)} - {formatDateForDisplay(endDate)}
                </Typography>
            </Box>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>No.</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Ref No</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Date</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27' }}>Beg</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27' }}>In</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27' }}>Out</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27' }}>Update</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27' }}>Balance</th>
                        {!excludePrice && (
                            <>
                                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27' }}>Unit Price</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27' }}>Beg Amt</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27' }}>In Amt</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27' }}>Out Amt</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27' }}>Update Amt</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27' }}>Balance Amount</th>
                            </>
                        )}
                    </tr>
                    <tr>
                        <td colSpan={excludePrice ? 8 : 14}>
                            <Divider sx={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => {
                        const balance = ((item.beg1 || 0) + (item.in1 || 0) - (item.out1 || 0)) + (item.upd1 || 0);
                        const balanceAmount = ((item.beg1_amt || 0) + (item.in1_amt || 0) - (item.out1_amt || 0)) + (item.upd1_amt || 0);

                        return (
                            <tr key={item.refno}>
                                <td style={{ padding: '8px 16px', textAlign: 'center' }}>{index + 1}</td>
                                <td style={{ padding: '8px 16px', textAlign: 'left' }}>{item.refno}</td>
                                <td style={{ padding: '8px 16px' }}>{formatDateForDisplay(item.rdate)}</td>
                                <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.beg1)}</td>
                                <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.in1)}</td>
                                <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.out1)}</td>
                                <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.upd1)}</td>
                                <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(balance)}</td>
                                {!excludePrice && (
                                    <>
                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.uprice)}</td>
                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.beg1_amt)}</td>
                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.in1_amt)}</td>
                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.out1_amt)}</td>
                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.upd1_amt)}</td>
                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(balanceAmount)}</td>
                                    </>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
                {data.length > 0 && (
                    <tfoot>
                        <tr>
                            <td colSpan={excludePrice ? 8 : 14}>
                                <Divider sx={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="3" style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                Total:
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                {formatNumber(totals.beg)}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                {formatNumber(totals.in)}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                {formatNumber(totals.out)}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>-</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>-</td>
                            {!excludePrice && (
                                <>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>-</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                        {formatNumber(totals.beg_amt)}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                        {formatNumber(totals.in_amt)}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                        {formatNumber(totals.out_amt)}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                        {formatNumber(totals.upd_amt)}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                        {formatNumber(
                                            totals.beg_amt + totals.in_amt - totals.out_amt + totals.upd_amt
                                        )}
                                    </td>
                                </>
                            )}
                        </tr>
                    </tfoot>
                )}
            </table>
        </Box>
    );
};

export default PrintPreviewMonthlyStockcard;