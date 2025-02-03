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
        'Ref No',
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
        'Ref No': 20,
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
            text: 'Monthly Stock Card Report',
            font: { bold: true, size: 12 }
        },
        {
            text: `Date From: ${formatDate(startDate)} Date To: ${formatDate(endDate)}`,
            font: { size: 11 }
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
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFBFBFBF' }
        };
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
            item.refno,
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
                            return 'center';
                        case 'Date':
                            return 'center';
                        case 'Ref No':
                            return 'left';
                        default:
                            return 'right';
                    }
                })()
            };
        });
    });

    // Add total row
    if (!excludePrice) {
        const totals = {
            beg: data.reduce((sum, item) => sum + (item.beg1 || 0), 0),
            in: data.reduce((sum, item) => sum + (item.in1 || 0), 0),
            out: data.reduce((sum, item) => sum + (item.out1 || 0), 0),
            beg_amt: data.reduce((sum, item) => sum + (item.beg1_amt || 0), 0),
            in_amt: data.reduce((sum, item) => sum + (item.in1_amt || 0), 0),
            out_amt: data.reduce((sum, item) => sum + (item.out1_amt || 0), 0),
            upd_amt: data.reduce((sum, item) => sum + (item.upd1_amt || 0), 0)
        };

        const totalRowData = [
            'Total',
            '',
            '',
            totals.beg,
            totals.in,
            totals.out,
            '',
            '',
            totals.beg_amt,
            totals.in_amt,
            totals.out_amt,
            totals.upd_amt
        ];

        const totalRow = worksheet.addRow(totalRowData);

        totalRow.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };

            if (cell.value !== '') {
                cell.font = { bold: true };
                if (typeof cell.value === 'number') {
                    cell.numFmt = '#,##0.00';
                    cell.alignment = { vertical: 'middle', horizontal: 'right' };
                } else {
                    cell.alignment = { vertical: 'middle', horizontal: 'left' };
                }
            }
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

    // Generate and save file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `monthly_stock_card_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
};