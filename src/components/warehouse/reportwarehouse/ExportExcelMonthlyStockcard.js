import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcelMonthlyStockCard = async (data, excludePrice = false, startDate, endDate) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Monthly Stock Card', {
        views: [{
            showGridLines: false
        }],
        pageSetup: {
            paperSize: 9,
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            margins: {
                left: 0.7,
                right: 0.7,
                top: 0.75,
                bottom: 0.75,
                header: 0.3,
                footer: 0.3
            }
        }
    });

    // Set headers
    const headers = [
        'No.',
        'Date',
        'Beg',
        'In',
        'Out',
        'Update'
    ];

    if (!excludePrice) {
        headers.push(
            'Unit Price',
            'Beg Amt',
            'In Amt',
            'Out Amt',
            'Update Amt'
        );
    }

    // Define column widths
    const columnWidths = {
        'No.': 8,
        'Date': 15,
        'Beg': 12,
        'In': 12,
        'Out': 12,
        'Update': 12,
        'Unit Price': 12,
        'Beg Amt': 12,
        'In Amt': 12,
        'Out Amt': 12,
        'Update Amt': 12
    };

    const formatDate = (date) => {
        if (!date) return "____________";
        return new Date(date).toLocaleDateString();
    };

    // Add headers with proper centering
    const headerRows = [
        {
            text: 'Weera Group Inventory',
            font: { bold: true, size: 14 }
        },
        {
            text: `Print Date: ${new Date().toLocaleDateString()} Time: ${new Date().toLocaleTimeString()}`,
            font: { size: 11 }
        },
        {
            text: `Date From: ${formatDate(startDate)} Date To: ${formatDate(endDate)}`,
            font: { size: 11 }
        },
        {
            text: 'Monthly Stock Card Report',
            font: { bold: true, size: 12 }
        }
    ];

    // Add header rows
    headerRows.forEach((header, idx) => {
        const row = worksheet.addRow(['']);
        row.getCell(1).value = header.text;
        worksheet.mergeCells(`A${idx + 1}:${String.fromCharCode(64 + headers.length)}${idx + 1}`);
        row.getCell(1).font = header.font;
        row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Add empty row
    worksheet.addRow([]);

    // Add column headers
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Add data rows
    data.forEach((item, index) => {
        const rowData = [
            index + 1,
            new Date(item.rdate).toLocaleDateString(),
            item.beg1 || 0,
            item.in1 || 0,
            item.out1 || 0,
            item.upd1 || 0
        ];

        if (!excludePrice) {
            rowData.push(
                item.uprice || 0,
                item.beg1_amt || 0,
                item.in1_amt || 0,
                item.out1_amt || 0,
                item.upd1_amt || 0
            );
        }

        const row = worksheet.addRow(rowData);
        row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            
            // Format numbers
            if (['Beg', 'In', 'Out', 'Update', 'Unit Price', 'Beg Amt', 'In Amt', 'Out Amt', 'Update Amt'].includes(header)) {
                cell.numFmt = '#,##0.00';
            }

            // Add borders
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };

            // Set alignment
            cell.alignment = {
                vertical: 'middle',
                horizontal: (() => {
                    switch (header) {
                        case 'No.':
                        case 'Date':
                            return 'center';
                        case 'Product':
                            return 'left';
                        default:
                            return 'right';
                    }
                })()
            };
        });
    });

    // Calculate totals
    if (!excludePrice) {
        const totals = data.reduce((acc, item) => ({
            beg_amt: acc.beg_amt + (item.beg1_amt || 0),
            in_amt: acc.in_amt + (item.in1_amt || 0),
            out_amt: acc.out_amt + (item.out1_amt || 0),
            upd_amt: acc.upd_amt + (item.upd1_amt || 0)
        }), {
            beg_amt: 0,
            in_amt: 0,
            out_amt: 0,
            upd_amt: 0
        });

        // Add total row
        const totalRow = worksheet.addRow([
            '',
            'Total',
            '',
            '',
            '',
            '',
            '',
            totals.beg_amt,
            totals.in_amt,
            totals.out_amt,
            totals.upd_amt
        ]);

        totalRow.eachCell((cell) => {
            if (cell.value) {
                cell.font = { bold: true };
                if (typeof cell.value === 'number') {
                    cell.numFmt = '#,##0.00';
                }
            }
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
        });
    }

    // Set column widths
    headers.forEach((header, index) => {
        const column = worksheet.getColumn(index + 1);
        column.width = columnWidths[header] || 12;
    });

    // Set row heights
    worksheet.eachRow((row) => {
        row.height = 18;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `monthly_stock_card_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
};