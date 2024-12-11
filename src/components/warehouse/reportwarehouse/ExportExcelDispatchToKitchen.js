import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const groupDataByRefno = (data) => {
    let lastRefno = null;
    return data.map(item => {
        const isFirstInGroup = item.refno !== lastRefno;
        lastRefno = item.refno;
        return {
            ...item,
            date: isFirstInGroup ? item.date : '',
            refno: isFirstInGroup ? item.refno : '',
            kitchen_code: isFirstInGroup ? item.kitchen_code : '',
            total: isFirstInGroup ? item.total : ''
        };
    });
};

export const exportToExcelWhDpk = async (data, excludePrice = false, startDate, endDate) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dispatch To Kitchen', {
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

    const groupedData = groupDataByRefno(data);

    // Set headers
    const headers = [
        'No.',
        'Date',
        'Ref.no',
        'Kitchen',
        'Product Name',
        'Quantity',
        'Unit',
    ];

    if (!excludePrice) {
        headers.push('Unit Price', 'Total');
    }

    // Define column widths
    const columnWidths = {
        'No.': 8,
        'Date': 15,
        'Ref.no': 15,
        'Kitchen': 25,
        'Product Name': 30,
        'Quantity': 10,
        'Unit': 8,
        'Unit Price': 12,
        'Total': 12
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
            text: 'Dispatch To Kitchen',
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
    groupedData.forEach((item, index) => {
        const rowData = [
            index + 1,
            item.date,
            item.refno,
            item.kitchen_code,
            item.product_name,
            item.quantity,
            item.unit_code,
        ];

        if (!excludePrice) {
            rowData.push(
                item.unit_price ? Number(item.unit_price).toFixed(2) : '',
                item.total ? Number(item.total).toFixed(2) : ''
            );
        }

        const row = worksheet.addRow(rowData);
        row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            
            // Format numbers
            if (['Unit Price', 'Total'].includes(header) && cell.value) {
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
                        case 'Unit':
                            return 'center';
                        case 'Quantity':
                        case 'Unit Price':
                        case 'Total':
                            return 'right';
                        default:
                            return 'left';
                    }
                })()
            };
        });
    });

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

    // Add total row
    const summaryRowData = headers.map(header => {
        if (header === 'Total') return totalSum.toFixed(2);
        return '';
    });

    const summaryRow = worksheet.addRow(summaryRowData);
    summaryRow.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        
        if (header === 'Total') {
            cell.font = { bold: true };
            cell.numFmt = '#,##0.00';
        }

        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        cell.alignment = {
            vertical: 'middle',
            horizontal: header === 'Total' ? 'right' : 'left'
        };
    });

    // Set column widths
    headers.forEach((header, index) => {
        const column = worksheet.getColumn(index + 1);
        column.width = columnWidths[header];
    });

    // Set row heights
    worksheet.eachRow((row) => {
        row.height = 18;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `dispatch_to_kitchen_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
};