import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcelWhPos = async (data, excludePrice = false) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Purchase Orders');

    // Set column headers
    const headers = [
        'No.',
        'Date',
        'Ref.no',
        'Supplier',
        'Branch',
        'ID',
        'Product Name',
        'Quantity',
        'Unit',
    ];

    // Add price-related headers if not excluded
    if (!excludePrice) {
        headers.push('Unit Price', 'Total');
    }
    headers.push('Username');

    // Border styles
    const borderStyle = {
        top: { style: 'thin', color: { argb: '754C27' } },
        left: { style: 'thin', color: { argb: '754C27' } },
        bottom: { style: 'thin', color: { argb: '754C27' } },
        right: { style: 'thin', color: { argb: '754C27' } }
    };

    const thickBorderStyle = {
        top: { style: 'medium', color: { argb: '754C27' } },
        left: { style: 'medium', color: { argb: '754C27' } },
        bottom: { style: 'medium', color: { argb: '754C27' } },
        right: { style: 'medium', color: { argb: '754C27' } }
    };

    // Style for headers
    const headerStyle = {
        font: { bold: true, color: { argb: '754C27' } },
        fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEAB86C' }
        },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: thickBorderStyle
    };

    // Add title
    worksheet.insertRow(1, ['Purchase Order to Supplier']);
    const titleRow = worksheet.getRow(1);
    titleRow.font = { bold: true, size: 16, color: { argb: '754C27' } };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells('A1:' + String.fromCharCode(65 + headers.length - 1) + '1');
    
    // Add headers
    worksheet.addRow(headers);
    const headerRow = worksheet.getRow(2);
    headerRow.eachCell(cell => {
        cell.style = headerStyle;
        cell.border = thickBorderStyle;
    });

    // Add data
    data.forEach((item, index) => {
        const row = [
            index + 1,
            item.date,
            item.refno,
            item.supplier_code,
            item.branch_code,
            item.product_code,
            item.product_name,
            item.quantity,
            item.unit_code,
        ];

        if (!excludePrice) {
            row.push(
                item.unit_price,
                item.total
            );
        }
        row.push(item.user_code);

        worksheet.addRow(row);
    });

    // Style the data rows
    const dataStyle = {
        alignment: { horizontal: 'left', vertical: 'middle' },
        font: { color: { argb: '000000' } },
        border: borderStyle
    };

    // Apply styles to data rows
    for (let i = 3; i <= data.length + 2; i++) {
        const row = worksheet.getRow(i);
        row.height = 25;
        row.eachCell(cell => {
            cell.style = dataStyle;
            cell.border = borderStyle;
        });

        // ถ้าเป็นแถวสุดท้าย ใช้เส้นล่างแบบหนา
        if (i === data.length + 2) {
            row.eachCell(cell => {
                cell.border = {
                    ...borderStyle,
                    bottom: { style: 'medium', color: { argb: '754C27' } }
                };
            });
        }
    }

    // Set column widths
    worksheet.columns.forEach((column, index) => {
        if (index === 6) { // Product Name
            column.width = 25;
        } else if (index === 3 || index === 4) { // Supplier, Branch
            column.width = 20;
        } else {
            column.width = 15;
        }
        column.alignment = { wrapText: true };
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `purchase_orders_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Save file
    saveAs(new Blob([buffer]), fileName);
};