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
            restaurant: isFirstInGroup ? item.restaurant : '',
            total: isFirstInGroup ? item.total : ''
        };
    });
};

export const exportToExcelGrf = async (data, excludePrice = false, startDate, endDate) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Goods Requisition', {
        views: [{ showGridLines: false }],
        pageSetup: {
            paperSize: 9,
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            margins: {
                left: 0.7, right: 0.7,
                top: 0.75, bottom: 0.75,
                header: 0.3, footer: 0.3
            }
        }
    });

    const groupedData = groupDataByRefno(data);

    const headers = [
        'No.', 'Date', 'Ref.no', 'Restaurant', 'Product ID',
        'Product Name', 'Quantity'
    ];

    if (!excludePrice) headers.push('Unit Price');
    headers.push('Expire Date', 'Unit');
    if (!excludePrice) headers.push('Amount', 'Total');
    headers.push('Username');

    const columnWidths = {
        'No.': 8, 'Date': 15, 'Ref.no': 15, 'Restaurant': 25,
        'Product ID': 15, 'Product Name': 25, 'Quantity': 10,
        'Unit Price': 12, 'Expire Date': 15, 'Unit': 10,
        'Amount': 12, 'Total': 12, 'Username': 15
    };

    const formatDate = date => date ? new Date(date).toLocaleDateString() : "____________";

    const headerRows = [
        { text: 'Weera Group Inventory', font: { bold: true, size: 14 } },
        { text: `Print Date: ${new Date().toLocaleDateString()} Time: ${new Date().toLocaleTimeString()}`, font: { size: 11 } },
        { text: `Date From: ${formatDate(startDate)} Date To: ${formatDate(endDate)}`, font: { size: 11 } },
        { text: 'Goods Requisition', font: { bold: true, size: 12 } }
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
    headerRow.eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFBFBFBF' }
        };
        cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    groupedData.forEach((item, index) => {
        const rowData = [
            index + 1, item.date, item.refno, item.restaurant,
            item.product_id, item.product_name, item.quantity
        ];

        if (!excludePrice) rowData.push(Number(item.unit_price).toFixed(2));
        rowData.push(item.expireDate, item.unit_code);
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
                top: { style: 'thin' }, left: { style: 'thin' },
                bottom: { style: 'thin' }, right: { style: 'thin' }
            };

            cell.alignment = {
                vertical: 'middle',
                horizontal: ['No.', 'Date', 'Unit', 'Expire Date'].includes(header) ? 'center' :
                    ['Quantity', 'Unit Price', 'Amount', 'Total'].includes(header) ? 'right' : 'left'
            };
        });
    });

    const totalSum = Array.from(new Set(data.map(item => item.refno + '-' + item.total)))
        .map(item => Number(item.split('-')[1]))
        .reduce((sum, total) => sum + total, 0);

    const totalRow = worksheet.addRow([]);
    totalRow.getCell(1).value = 'Total:';
    if (!excludePrice) {
        const totalCell = totalRow.getCell(headers.indexOf('Total') + 1);
        totalCell.value = totalSum;
        totalCell.numFmt = '#,##0.00';
        totalCell.font = { bold: true };
        totalCell.alignment = { horizontal: 'right', vertical: 'middle' };
    }

    totalRow.eachCell(cell => {
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    headers.forEach((header, index) => {
        worksheet.getColumn(index + 1).width = columnWidths[header];
    });

    worksheet.eachRow(row => row.height = 18);

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `goods_requisition_${new Date().toISOString().split('T')[0]}.xlsx`);
};