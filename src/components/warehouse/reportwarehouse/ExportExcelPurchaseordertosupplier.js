import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcelWhPos = async (data, excludePrice = false, startDate, endDate) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Purchase Orders', {
        views: [{
            showGridLines: false
        }],
        pageSetup: {
            paperSize: 9,
            orientation: 'portrait',
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

    // Set fixed start column
    const startColumn = 4; // เริ่มที่คอลัมน์ D

    // Set headers
    const headers = [
        'No.',
        'Date',
        'Ref.no',
        'Supplier',
        'Restaurant',
        'Product Name',
        'Quantity',
        'Unit',
    ];

    if (!excludePrice) {
        headers.push('Unit Price', 'Total');
    }

    // Calculate end column
    const endColumn = startColumn + headers.length - 1;

    // Convert to Excel column letters
    const startCol = String.fromCharCode(64 + startColumn); // D
    const endCol = String.fromCharCode(64 + endColumn);

    // Add padding columns with specific width
    for (let i = 1; i < startColumn; i++) {
        worksheet.getColumn(i).width = 4;
    }

    // Define column widths
    const columnWidths = {
        'No.': 8,
        'Date': 15,
        'Ref.no': 15,
        'Supplier': 25,
        'Restaurant': 25,
        'Product Name': 20,
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
        { text: 'Weera Group Inventory', font: { bold: true, size: 14 } },
        { text: `Print Date: ${new Date().toLocaleDateString()} Time: ${new Date().toLocaleTimeString()}`, font: { size: 11 } },
        { text: `Date From: ${formatDate(startDate)} Date To: ${formatDate(endDate)}`, font: { size: 11 } },
        { text: 'Purchase Order to Supplier', font: { bold: true, size: 12 } }
    ];

    // Add header rows
    headerRows.forEach((header, idx) => {
        const row = worksheet.addRow([]);
        row.getCell(startColumn).value = header.text;
        worksheet.mergeCells(`${startCol}${idx + 1}:${endCol}${idx + 1}`);
        row.getCell(startColumn).font = header.font;
        row.getCell(startColumn).alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Add column headers
    const headerRow = worksheet.addRow([]);
    headers.forEach((header, index) => {
        const cell = headerRow.getCell(startColumn + index);
        cell.value = header;
        cell.font = { bold: true };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // ในส่วนของการ Add data
    data.forEach((item, index) => {
        const rowData = [
            index + 1,
            item.date,
            item.refno,
            item.supplier_code,
            item.branch_code,
            item.product_name,
            item.quantity,
            item.unit_code,
        ];

        if (!excludePrice) {
            rowData.push(
                Number(item.unit_price).toFixed(2),
                Number(item.total).toFixed(2)
            );
        }

        const row = worksheet.addRow([]);
        rowData.forEach((value, colIndex) => {
            const cell = row.getCell(startColumn + colIndex);
            cell.value = value;

            // กำหนด format สำหรับคอลัมน์ที่เป็นตัวเลข
            const header = headers[colIndex];
            if (['Unit Price', 'Total'].includes(header)) {
                cell.numFmt = '#,##0.00';
            }

            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };

            // แก้ไขการจัดตำแหน่งตามประเภทของข้อมูล
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

    const totalSum = data.reduce((sum, item) => sum + Number(item.total), 0);

    const summaryRow = worksheet.addRow([]);
    headers.forEach((header, index) => {
        const cell = summaryRow.getCell(startColumn + index);
        if (header === 'Total') {
            cell.value = Number(totalSum).toFixed(2);
            cell.font = { bold: true };
            cell.numFmt = '#,##0.00';
        } else if (header === 'Product Name') {
            cell.value = 'Total';
            cell.font = { bold: true };
        } else {
            cell.value = '';
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
        const column = worksheet.getColumn(startColumn + index);
        column.width = columnWidths[header];
    });

    // Add empty column at the end for right padding
    const endPaddingColumn = worksheet.getColumn(endColumn + 1);
    endPaddingColumn.width = 4;

    // Set print area
    worksheet.pageSetup.printArea = `${startCol}1:${endCol}${data.length + 5}`;

    // Set row heights
    worksheet.eachRow((row) => {
        row.height = 18;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `purchase_orders_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
};