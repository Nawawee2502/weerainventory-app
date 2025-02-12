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
            branch: isFirstInGroup ? item.branch : '',
            total: isFirstInGroup ? item.total : ''
        };
    });
};

export const exportToExcelRfw = async (data, excludePrice = false, startDate, endDate) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Receipt From Warehouse', {
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

    const headers = [
        'No.',
        'Date',
        'Ref.no',
        'Branch',
        'Product ID',
        'Product Name',
        'Quantity',
    ];

    if (!excludePrice) {
        headers.push('Unit Price');
    }

    headers.push(
        'Expire Date',
        'Unit'
    );

    if (!excludePrice) {
        headers.push('Amount', 'Total');
    }

    headers.push('Username');

    const columnWidths = {
        'No.': 8,
        'Date': 15,
        'Ref.no': 15,
        'Branch': 25,
        'Product ID': 15,
        'Product Name': 25,
        'Quantity': 10,
        'Unit Price': 12,
        'Expire Date': 15,
        'Unit': 10,
        'Amount': 12,
        'Total': 12,
        'Username': 15
    };

    const formatDate = (date) => {
        if (!date) return "____________";
        return new Date(date).toLocaleDateString();
    };

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
            text: 'Receipt From Warehouse',
            font: { bold: true, size: 12 }
        }
    ];

    headerRows.forEach((header, idx) => {
        const row = worksheet.addRow(['']);
        row.getCell(1).value = header.text;
        worksheet.mergeCells(`A${idx + 1}:${String.fromCharCode(64 + headers.length)}${idx + 1}`);
        row.getCell(1).font = header.font;
        row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    });

    worksheet.addRow([]);

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

    groupedData.forEach((item, index) => {
        const rowData = [
            index + 1,
            item.date,
            item.refno,
            item.branch,
            item.product_id,
            item.product_name,
            item.quantity
        ];

        if (!excludePrice) {
            rowData.push(Number(item.unit_price).toFixed(2));
        }

        rowData.push(
            item.expireDate,
            item.unit_code
        );

        if (!excludePrice) {
            rowData.push(
                item.amount ? Number(item.amount).toFixed(2) : '',
                item.total ? Number(item.total).toFixed(2) : ''
            );
        }

        rowData.push(item.user_code);

        const row = worksheet.addRow(rowData);
        row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];

            if (['Unit Price', 'Amount', 'Total'].includes(header) && cell.value) {
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
                horizontal: (() => {
                    switch (header) {
                        case 'No.':
                        case 'Date':
                        case 'Unit':
                        case 'Expire Date':
                            return 'center';
                        case 'Quantity':
                        case 'Unit Price':
                        case 'Amount':
                        case 'Total':
                            return 'right';
                        default:
                            return 'left';
                    }
                })()
            };
        });
    });

    const uniqueTotals = new Set();
    data.forEach(item => {
        if (item.total) {
            uniqueTotals.add(item.refno + '-' + item.total);
        }
    });

    const totalSum = Array.from(uniqueTotals)
        .map(item => Number(item.split('-')[1]))
        .reduce((sum, total) => sum + total, 0);

    const summaryRowData = headers.map(header => {
        if (header === 'Total' && !excludePrice) return totalSum.toFixed(2);
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

    headers.forEach((header, index) => {
        const column = worksheet.getColumn(index + 1);
        column.width = columnWidths[header];
    });

    worksheet.eachRow((row) => {
        row.height = 18;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `receipt_from_warehouse_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
};