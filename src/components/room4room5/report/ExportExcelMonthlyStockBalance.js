import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcelStockBalance = async (data, excludePrice = false, startDate, endDate) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stock Balance', {
        views: [{
            showGridLines: false
        }],
        pageSetup: {
            paperSize: 9,
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
        }
    });

    // Set headers
    const headers = [
        'No.',
        'Product',
        'Unit',
        'Remaining',
    ];

    if (!excludePrice) {
        headers.push('Total');
    }

    // Define column widths
    const columnWidths = {
        'No.': 8,
        'Product': 40,
        'Unit': 15,
        'Remaining': 15,
        'Total': 15
    };

    const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString();
    };

    // Add headers rows
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
            text: 'Monthly Stock Balance Report',
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
        const remainingQty = (item.beg1 || 0) + (item.in1 || 0) + (item.upd1 || 0) - (item.out1 || 0);
        const totalAmount = remainingQty * (item.uprice || 0);

        const rowData = [
            index + 1,
            item.tbl_product.product_name,
            item.tbl_unit.unit_name,
            remainingQty,
        ];

        if (!excludePrice) {
            rowData.push(totalAmount);
        }

        const row = worksheet.addRow(rowData);
        row.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };

            // Set alignment and number format
            if (colNumber === 1) {
                cell.alignment = { horizontal: 'center' };
            } else if (colNumber >= 4) {
                cell.alignment = { horizontal: 'right' };
                cell.numFmt = '#,##0.00';
            }
        });
    });

    // Add total row
    if (data.length > 0) {
        const totalRow = worksheet.addRow([
            '',
            'Total',
            '',
            data.reduce((sum, item) => {
                const qty = (item.beg1 || 0) + (item.in1 || 0) + (item.upd1 || 0) - (item.out1 || 0);
                return sum + qty;
            }, 0),
            !excludePrice ? data.reduce((sum, item) => {
                const qty = (item.beg1 || 0) + (item.in1 || 0) + (item.upd1 || 0) - (item.out1 || 0);
                return sum + (qty * (item.uprice || 0));
            }, 0) : '-'
        ]);

        totalRow.eachCell((cell, colNumber) => {
            if (cell.value) {
                cell.font = { bold: true };
                if (typeof cell.value === 'number') {
                    cell.numFmt = '#,##0.00';
                    cell.alignment = { horizontal: 'right' };
                }
            }
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    }

    // Set column widths
    headers.forEach((header, index) => {
        worksheet.getColumn(index + 1).width = columnWidths[header] || 12;
    });

    // Generate and save file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `monthly_stock_balance_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
};