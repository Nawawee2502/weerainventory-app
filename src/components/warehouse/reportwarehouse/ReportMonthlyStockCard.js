import * as React from 'react';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Typography, TextField, Grid2, Button } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Checkbox, Switch, Divider } from '@mui/material';
import { queryWh_stockcard, countWh_stockcard } from '../../../api/warehouse/wh_stockcard';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { createRoot } from 'react-dom/client';
import PrintLayout from './PrintPreviewMonthlyStockcard';
import { exportToExcelMonthlyStockCard } from './ExportExcelMonthlyStockcard';
import { exportToPdfMonthlyStockCard } from './ExportPdfMonthlyStockcard';

export default function ReportMonthlyStockCard() {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [productSearch, setProductSearch] = useState('');
    const [stockcardData, setStockcardData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [excludePrice, setExcludePrice] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage] = useState(10);
    const [hasSearched, setHasSearched] = useState(false);

    // Function to format date for API
    const formatDateForApi = (date) => {
        return format(date, 'yyyyMMdd');
    };

    // Format date for display
    const formatDateForDisplay = (dateString) => {
        const date = new Date(dateString);
        return format(date, 'dd/MM/yyyy');
    };

    const loadData = async () => {
        if (!productSearch.trim()) {
            setStockcardData([]);
            setHasSearched(true);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await dispatch(queryWh_stockcard({
                offset: page * rowsPerPage,
                limit: rowsPerPage,
                rdate1: formatDateForApi(startDate),
                rdate2: formatDateForApi(endDate),
                product_name: productSearch.trim()
            })).unwrap();

            if (response.result) {
                if (response.data.length === 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Product Not Found',
                        text: 'This product does not exist in stockcard',
                        confirmButtonColor: '#754C27'
                    });
                }
                setStockcardData(response.data);
            }
            setHasSearched(true);
        } catch (err) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };



    // Handle search button click
    const handleSearch = () => {
        loadData();
    };

    // Export functions
    const handleExportExcel = () => {
        if (stockcardData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data',
                text: 'There is no data to export to Excel',
                confirmButtonColor: '#754C27'
            });
            return;
        }
        exportToExcelMonthlyStockCard(stockcardData, excludePrice, startDate, endDate);
    };

    const handleExportPdf = () => {
        if (stockcardData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data',
                text: 'There is no data to export to PDF',
                confirmButtonColor: '#754C27'
            });
            return;
        }
        exportToPdfMonthlyStockCard(stockcardData, excludePrice, startDate, endDate);
    };

    const handlePrint = () => {
        if (stockcardData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data',
                text: 'There is no data to print',
                confirmButtonColor: '#754C27'
            });
            return;
        }

        const printWindow = window.open('', '_blank');
        const printDoc = printWindow.document;

        printDoc.write(`
            <html>
                <head>
                    <style>
                        @media print {
                            body { margin: 0; }
                            @page { size: landscape; }
                        }
                        table { page-break-inside: auto; }
                        tr { page-break-inside: avoid; page-break-after: auto; }
                        thead { display: table-header-group; }
                        tfoot { display: table-footer-group; }
                    </style>
                </head>
                <body>
                    <div id="print-content"></div>
                </body>
            </html>
        `);

        const root = createRoot(printDoc.getElementById('print-content'));
        root.render(
            <PrintLayout
                data={stockcardData}
                excludePrice={excludePrice}
                startDate={startDate}
                endDate={endDate}
            />
        );

        printWindow.setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 1000);
    };

    const formatNumber = (num) => {
        return Number(num || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    return (
        <Box sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: '#F8F8F8'
        }}>
            {/* Search Section */}
            <Box sx={{ width: '70%', mt: '10px', flexDirection: 'column' }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    bgcolor: '#F8F8F8',
                    height: '100%',
                    p: '16px',
                    position: 'relative',
                    zIndex: 2,
                    mb: '50px',
                }}>
                    <Box sx={{ width: '90%', mt: '24px' }}>
                        <Grid2 container spacing={2}>
                            {/* From Date */}
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    From Date
                                </Typography>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    selectsStart
                                    startDate={startDate}
                                    endDate={endDate}
                                    dateFormat="dd/MM/yyyy"
                                    isClearable
                                    placeholderText="Select start date"
                                    customInput={
                                        <TextField
                                            size="small"
                                            fullWidth
                                            sx={{
                                                mt: '8px',
                                                width: '80%',
                                                '& .MuiInputBase-root': {
                                                    width: '100%'
                                                },
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '10px',
                                                    bgcolor: 'white'
                                                },
                                            }}
                                        />
                                    }
                                />
                            </Grid2>

                            {/* To Date */}
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    To Date
                                </Typography>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    selectsEnd
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={startDate}
                                    dateFormat="dd/MM/yyyy"
                                    isClearable
                                    placeholderText="Select end date"
                                    customInput={
                                        <TextField
                                            size="small"
                                            fullWidth
                                            sx={{
                                                mt: '8px',
                                                width: '80%',
                                                '& .MuiInputBase-root': {
                                                    width: '100%'
                                                },
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '10px',
                                                    bgcolor: 'white'
                                                },
                                            }}
                                        />
                                    }
                                />
                            </Grid2>

                            {/* Product Search */}
                            <Grid2 item size={{ xs: 12, md: 12 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Product
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={productSearch}
                                        onChange={(e) => {
                                            setProductSearch(e.target.value);
                                            if (e.target.value === '') {
                                                handleSearch();
                                            }
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearch();
                                            }
                                        }}
                                        placeholder="Search product name..."
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                bgcolor: 'white'
                                            },
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleSearch}
                                        sx={{
                                            bgcolor: '#754C27',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: '#5c3c1f',
                                            },
                                            borderRadius: '10px',
                                            minWidth: '100px'
                                        }}
                                    >
                                        Show
                                    </Button>
                                </Box>
                            </Grid2>
                        </Grid2>
                    </Box>
                </Box>
            </Box>

            {/* Results Section */}
            <Box sx={{
                width: '98%',
                bgcolor: 'white',
                p: '12px',
                borderRadius: '24px',
                mb: '24px',
                position: 'relative',
                mt: '20px'
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: '#EAB86C',
                    px: 3,
                    py: 2,
                    borderRadius: '8px',
                    zIndex: 3
                }}>
                    <Typography sx={{ fontWeight: 'bold', color: '#754C27' }}>
                        Monthly Stock Card Report
                    </Typography>
                </Box>

                <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex' }}>
                            <Box>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C' }}>Date</Typography>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C' }}>Product</Typography>
                            </Box>
                            <Box sx={{ ml: '8px' }}>
                                <Typography>
                                    {startDate && endDate
                                        ? `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`
                                        : "Not specified"}
                                </Typography>
                                <Typography>
                                    {productSearch || "Not selected"}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Switch
                                    checked={excludePrice}
                                    onChange={(e) => setExcludePrice(e.target.checked)}
                                />
                                <Typography sx={{ fontWeight: '500', color: '#7E84A3' }}>
                                    Exclude price in file
                                </Typography>
                            </Box>
                            <Box>
                                <Button
                                    onClick={handlePrint}
                                    variant="outlined"
                                    sx={{
                                        color: '#754C27',
                                        borderColor: '#754C27',
                                        '&:hover': {
                                            borderColor: '#5c3c1f',
                                        }
                                    }}
                                >
                                    Print
                                </Button>
                                <Button
                                    onClick={handleExportExcel}
                                    variant="outlined"
                                    sx={{
                                        color: '#754C27',
                                        borderColor: '#754C27',
                                        '&:hover': {
                                            borderColor: '#5c3c1f',
                                        },
                                        ml: '24px'
                                    }}
                                >
                                    Excel
                                </Button>
                                <Button
                                    onClick={handleExportPdf}
                                    variant="outlined"
                                    sx={{
                                        color: '#754C27',
                                        borderColor: '#754C27',
                                        '&:hover': {
                                            borderColor: '#5c3c1f',
                                        },
                                        ml: '24px'
                                    }}
                                >
                                    PDF
                                </Button>
                            </Box>
                        </Box>
                    </Box>

                    {/* Data Table */}
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}>
                        <table style={{ width: '100%', marginTop: '24px' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>No.</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Date</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Beg</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>In</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Out</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Update</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Unit Price</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Beg Amt</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>In Amt</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Out Amt</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Update Amt</th>
                                </tr>
                                <tr>
                                    <td colSpan="11">
                                        <Divider sx={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="11" style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</td>
                                    </tr>
                                ) : !hasSearched || !productSearch.trim() ? (
                                    <tr>
                                        <td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>Please select a product</td>
                                    </tr>
                                ) : stockcardData.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>No data found</td>
                                    </tr>
                                ) : (
                                    stockcardData.map((item, index) => (
                                        <tr key={item.refno}>
                                            <td style={{ padding: '8px 16px', textAlign: 'center' }}>{index + 1}</td>
                                            <td style={{ padding: '8px 16px' }}>{formatDateForDisplay(item.rdate)}</td>
                                            <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.beg1)}</td>
                                            <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.in1)}</td>
                                            <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.out1)}</td>
                                            <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.upd1)}</td>
                                            <td style={{ padding: '8px 16px', textAlign: 'right' }}>{!excludePrice ? formatNumber(item.uprice) : '-'}</td>
                                            <td style={{ padding: '8px 16px', textAlign: 'right' }}>{!excludePrice ? formatNumber(item.beg1_amt) : '-'}</td>
                                            <td style={{ padding: '8px 16px', textAlign: 'right' }}>{!excludePrice ? formatNumber(item.in1_amt) : '-'}</td>
                                            <td style={{ padding: '8px 16px', textAlign: 'right' }}>{!excludePrice ? formatNumber(item.out1_amt) : '-'}</td>
                                            <td style={{ padding: '8px 16px', textAlign: 'right' }}>{!excludePrice ? formatNumber(item.upd1_amt) : '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {stockcardData.length > 0 && (
                                <tfoot>
                                    <tr>
                                        <td colSpan="11">
                                            <Divider sx={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 'bold', color: '#754C27' }}>
                                            Total:
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>-</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                            {!excludePrice ? formatNumber(stockcardData.reduce((sum, item) => sum + (item.beg1_amt || 0), 0)) : '-'}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                            {!excludePrice ? formatNumber(stockcardData.reduce((sum, item) => sum + (item.in1_amt || 0), 0)) : '-'}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                            {!excludePrice ? formatNumber(stockcardData.reduce((sum, item) => sum + (item.out1_amt || 0), 0)) : '-'}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                            {!excludePrice ? formatNumber(stockcardData.reduce((sum, item) => sum + (item.upd1_amt || 0), 0)) : '-'}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}