import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcelKitchenStockBalance = async (data, excludePrice = false, startDate, endDate, kitchen = '') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Kitchen Stock Balance', {
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
        'Product',
        'Kitchen',
        'Unit',
        'Beg',
        'In',
        'Out',
        'Update',
        'Balance'
    ];

    // Define column widths
    const columnWidths = {
        'No.': 8,
        'Product': 40,
        'Kitchen': 25,
        'Unit': 15,
        'Beg': 12,
        'In': 12,
        'Out': 12,
        'Update': 12,
        'Balance': 12
    };

    const formatDate = (date) => {
        if (!date) return "";
        try {
            if (typeof date === 'string') {
                date = new Date(date);
            }
            return date.toLocaleDateString();
        } catch (error) {
            console.error("Error formatting date:", error);
            return String(date);
        }
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
            text: 'Kitchen Stock Balance Report',
            font: { bold: true, size: 12 }
        },
        {
            text: `Date From: ${formatDate(startDate)} Date To: ${formatDate(endDate)}`,
            font: { size: 11 }
        }
    ];

    if (kitchen) {
        headerRows.push({
            text: `Kitchen: ${kitchen}`,
            font: { size: 11 }
        });
    }

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
        const balance = ((item.beg1 || 0) + (item.in1 || 0) - (item.out1 || 0)) + (item.upd1 || 0);

        const rowData = [
            index + 1,
            item.tbl_product?.product_name,
            item.tbl_kitchen?.kitchen_name,
            item.tbl_unit?.unit_name,
            item.beg1 || 0,
            item.in1 || 0,
            item.out1 || 0,
            item.upd1 || 0,
            balance
        ];

        const row = worksheet.addRow(rowData);
        row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];

            // Format numbers
            if (['Beg', 'In', 'Out', 'Update', 'Balance'].includes(header)) {
                cell.numFmt = '#,##0';
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
                        case 'Product':
                        case 'Kitchen':
                        case 'Unit':
                            return 'left';
                        default:
                            return 'right';
                    }
                })()
            };
        });
    });

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
    const fileName = `kitchen_stock_balance_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
};