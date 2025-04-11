import React from 'react';
import { Box, Typography } from '@mui/material';

const PrintPreviewKitchenStockBalance = ({ data, startDate, endDate, kitchen }) => {
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
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    const documentNumber = `KSBD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`;

    return (
        <Box sx={{ 
            p: 4, 
            bgcolor: 'white',
            '@media print': {
                padding: '20px',
                margin: 0
            }
        }}>
            {/* Page Layout */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    body, html { 
                        margin: 0 !important; 
                        padding: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                    }
                    @page { 
                        size: landscape; 
                        margin: 0.5cm;
                    }
                }
                .report-container {
                    font-family: Arial, sans-serif;
                }
                .header-section {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    border: 1px solid #000;
                    padding: 10px;
                    border-radius: 3px;
                }
                .company-details {
                    width: 60%;
                }
                .document-details {
                    width: 35%;
                    padding-left: 15px;
                    border-left: 1px solid #000;
                }
                .company-name {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .company-address {
                    font-size: 12px;
                    margin-bottom: 2px;
                }
                .doc-line {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                    font-size: 12px;
                }
                .doc-label {
                    font-weight: bold;
                }
                .title {
                    font-size: 16px;
                    font-weight: bold;
                    text-align: center;
                    margin: 15px 0;
                    text-transform: uppercase;
                }
                .info-section {
                    display: flex;
                    margin-bottom: 20px;
                    border: 1px solid #000;
                    padding: 10px;
                    border-radius: 3px;
                }
                .info-column {
                    width: 50%;
                }
                .info-line {
                    display: flex;
                    margin-bottom: 5px;
                    font-size: 12px;
                }
                .info-label {
                    width: 100px;
                    font-weight: bold;
                }
                .stock-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                    border: 1px solid #000;
                    border-radius: 3px;
                }
                .stock-table th, .stock-table td {
                    border: 1px solid #000;
                    padding: 6px;
                    font-size: 12px;
                }
                .stock-table th {
                    background-color: #E4E4E4;
                    font-weight: bold;
                    text-align: center;
                }
                .stock-table tr:nth-child(even) {
                    background-color: #F9F9F9;
                }
                .stock-table td.number-cell {
                    text-align: right;
                }
                .stock-table td.text-cell {
                    text-align: left;
                }
                .stock-table td.center-cell {
                    text-align: center;
                }
                .signatures {
                    display: flex;
                    justify-content: space-between;
                    margin: 40px 0 30px;
                }
                .signature-box {
                    width: 30%;
                    text-align: center;
                }
                .signature-line {
                    border-top: 1px solid #000;
                    margin-bottom: 5px;
                }
                .signature-title {
                    font-size: 12px;
                }
                .notes {
                    margin-top: 20px;
                    border-top: 1px solid #AAA;
                    padding-top: 10px;
                }
                .notes-title {
                    font-size: 12px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .note-item {
                    font-size: 11px;
                    margin-bottom: 3px;
                }
                .footer {
                    margin-top: 20px;
                    position: relative;
                    height: 20px;
                }
                .footer-left {
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    font-size: 11px;
                    color: #555;
                }
                .footer-right {
                    position: absolute;
                    right: 0;
                    bottom: 0;
                    font-size: 11px;
                    color: #555;
                }
            `}} />

            <div className="report-container">
                {/* Header Section */}
                <div className="header-section">
                    <div className="company-details">
                        <div className="company-name">WEERA GROUP INVENTORY</div>
                        <div className="company-address">123 Business Road, Industrial District</div>
                        <div className="company-address">Bangkok, Thailand 10110</div>
                        <div className="company-address">Tel: +66-2-123-4567 | Email: contact@weeragroup.com</div>
                    </div>
                    <div className="document-details">
                        <div className="doc-line">
                            <span className="doc-label">Document No:</span>
                            <span>{documentNumber}</span>
                        </div>
                        <div className="doc-line">
                            <span className="doc-label">Print Date:</span>
                            <span>{formatDateForDisplay(new Date())}</span>
                        </div>
                        <div className="doc-line">
                            <span className="doc-label">Print Time:</span>
                            <span>{new Date().toLocaleTimeString()}</span>
                        </div>
                        <div className="doc-line">
                            <span className="doc-label">Page:</span>
                            <span>1</span>
                        </div>
                    </div>
                </div>

                <div className="title">Kitchen Stock Balance Report</div>

                {/* Info Section */}
                <div className="info-section">
                    <div className="info-column">
                        <div className="info-line">
                            <div className="info-label">Date Range:</div>
                            <div>{formatDateForDisplay(startDate)} - {formatDateForDisplay(endDate)}</div>
                        </div>
                        <div className="info-line">
                            <div className="info-label">User:</div>
                            <div>Admin</div>
                        </div>
                    </div>
                    <div className="info-column">
                        <div className="info-line">
                            <div className="info-label">Kitchen:</div>
                            <div>{kitchen || 'All Kitchens'}</div>
                        </div>
                        <div className="info-line">
                            <div className="info-label">Report Type:</div>
                            <div>Balance Summary</div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <table className="stock-table">
                    <thead>
                        <tr>
                            <th style={{width: '5%'}}>No.</th>
                            <th style={{width: '25%'}}>Product</th>
                            <th style={{width: '20%'}}>Kitchen</th>
                            <th style={{width: '10%'}}>Unit</th>
                            <th style={{width: '8%'}}>Begin</th>
                            <th style={{width: '8%'}}>In</th>
                            <th style={{width: '8%'}}>Out</th>
                            <th style={{width: '8%'}}>Update</th>
                            <th style={{width: '8%'}}>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => {
                            const balance = ((item.beg1 || 0) + (item.in1 || 0) - (item.out1 || 0)) + (item.upd1 || 0);

                            return (
                                <tr key={index}>
                                    <td className="center-cell">{index + 1}</td>
                                    <td className="text-cell">{item.tbl_product?.product_name}</td>
                                    <td className="text-cell">{item.tbl_kitchen?.kitchen_name}</td>
                                    <td className="text-cell">{item.tbl_unit?.unit_name}</td>
                                    <td className="number-cell">{formatNumber(item.beg1)}</td>
                                    <td className="number-cell">{formatNumber(item.in1)}</td>
                                    <td className="number-cell">{formatNumber(item.out1)}</td>
                                    <td className="number-cell">{formatNumber(item.upd1)}</td>
                                    <td className="number-cell">{formatNumber(balance)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Signature Section */}
                <div className="signatures">
                    <div className="signature-box">
                        <div className="signature-line"></div>
                        <div className="signature-title">Prepared By</div>
                    </div>
                    <div className="signature-box">
                        <div className="signature-line"></div>
                        <div className="signature-title">Checked By</div>
                    </div>
                    <div className="signature-box">
                        <div className="signature-line"></div>
                        <div className="signature-title">Approved By</div>
                    </div>
                </div>

                {/* Notes Section */}
                <div className="notes">
                    <div className="notes-title">Notes:</div>
                    <div className="note-item">1. This report is computer generated and does not require a signature to be valid.</div>
                    <div className="note-item">2. All quantities are shown in their respective units and are accurate as of the print date.</div>
                    <div className="note-item">3. Please report any discrepancies to the inventory management department within 3 business days.</div>
                </div>

                {/* Footer */}
                <div className="footer">
                    <div className="footer-left">CONFIDENTIAL DOCUMENT - For internal use only</div>
                    <div className="footer-right">Page 1 of 1</div>
                </div>
            </div>
        </Box>
    );
};

export default PrintPreviewKitchenStockBalance;