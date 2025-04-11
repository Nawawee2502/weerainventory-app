import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Grid2, Button, MenuItem, FormControl, InputAdornment, Select } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Divider } from '@mui/material';
import { useDispatch } from 'react-redux';
import { Kt_stockcardAll } from '../../../../api/kitchen/kt_stockcardApi';
import { kitchenAll } from '../../../../api/kitchenApi';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { exportToExcelKitchenStockBalance } from './ExportToExcelKitchenStockBalance';
import { exportToPdfKitchenStockBalance } from './KitchenStockBalancePDF';
import PrintLayout from './PrintPreviewKitchenStockBalance';
import { createRoot } from 'react-dom/client';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const convertToLasVegasTime = (date) => {
    if (!date) return new Date();
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
};

export default function ReportKitchenStockBalance() {
    const dispatch = useDispatch();
    const today = new Date();

    // States
    const [startDate, setStartDate] = useState(() => convertToLasVegasTime(today));
    const [endDate, setEndDate] = useState(() => convertToLasVegasTime(today));
    const [stockBalanceData, setStockBalanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [kitchens, setKitchens] = useState([]);
    const [selectedKitchen, setSelectedKitchen] = useState('');
    const [loadingKitchens, setLoadingKitchens] = useState(false);

    useEffect(() => {
        // Fetch kitchens when component mounts
        fetchKitchens();
    }, []);

    const fetchKitchens = async () => {
        try {
            setLoadingKitchens(true);
            const response = await dispatch(kitchenAll({
                offset: 0,
                limit: 99999 // ดึงข้อมูลทั้งหมด
            })).unwrap();

            if (response.result) {
                setKitchens(response.data || []);
            } else {
                console.error('Failed to fetch kitchens');
            }
        } catch (err) {
            console.error('Error fetching kitchens:', err);
        } finally {
            setLoadingKitchens(false);
        }
    };

    const formatDateForApi = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    };

    const formatDateForDisplay = (date) => {
        if (!date) return "";
        try {
            if (typeof date === 'string') {
                date = new Date(date);
            }
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();
            return `${month}/${day}/${year}`;
        } catch (error) {
            console.error("Error formatting date:", error);
            return String(date);
        }
    };

    const fetchStockBalance = async () => {
        if (!startDate || !endDate) {
            Swal.fire({
                icon: 'warning',
                title: 'Please select dates',
                text: 'Both start and end dates must be selected',
                confirmButtonColor: '#754C27'
            });
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const params = {
                rdate1: formatDateForApi(startDate),
                rdate2: formatDateForApi(endDate),
                limit: 99999,
                offset: 0
            };

            // Add kitchen_code to params if a kitchen is selected
            if (selectedKitchen) {
                params.kitchen_code = selectedKitchen;
            }

            const response = await dispatch(Kt_stockcardAll(params)).unwrap();

            if (response.result) {
                if (response.data.length === 0) {
                    setStockBalanceData([]);
                    Swal.fire({
                        icon: 'warning',
                        title: 'No Data Found',
                        text: 'No records found for the selected criteria',
                        confirmButtonColor: '#754C27'
                    });
                    return;
                }

                // Group data by product
                const productGroups = response.data.reduce((acc, item) => {
                    const key = item.product_code;

                    if (!acc[key]) {
                        acc[key] = {
                            ...item,
                            beg1: 0,
                            in1: 0,
                            out1: 0,
                            upd1: 0,
                            balance: 0
                        };
                    }

                    // Update running totals
                    acc[key].beg1 += Number(item.beg1 || 0);
                    acc[key].in1 += Number(item.in1 || 0);
                    acc[key].out1 += Number(item.out1 || 0);
                    acc[key].upd1 += Number(item.upd1 || 0);

                    // Update balance with the latest values
                    const currentTransaction = response.data.filter(
                        transaction => transaction.product_code === key
                    ).sort((a, b) => new Date(b.trdate) - new Date(a.trdate))[0];

                    if (currentTransaction) {
                        acc[key].balance = Number(currentTransaction.balance || 0);
                    }

                    return acc;
                }, {});

                // Convert the grouped data back to an array and sort by product name
                const processedData = Object.values(productGroups).sort((a, b) => {
                    const nameA = a.tbl_product?.product_name || '';
                    const nameB = b.tbl_product?.product_name || '';
                    return nameA.localeCompare(nameB);
                });

                setStockBalanceData(processedData);

            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (err) {
            console.error('Error in fetchStockBalance:', err);
            setError(err.message || 'Failed to fetch data');
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to fetch data',
                confirmButtonColor: '#754C27'
            });
            setStockBalanceData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (stockBalanceData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data',
                text: 'No data available to export',
                confirmButtonColor: '#754C27'
            });
            return;
        }
        exportToExcelKitchenStockBalance(stockBalanceData, true, startDate, endDate);
    };

    const handleExportPdf = () => {
        if (stockBalanceData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data',
                text: 'No data available to export',
                confirmButtonColor: '#754C27'
            });
            return;
        }
        exportToPdfKitchenStockBalance(stockBalanceData, true, startDate, endDate);
    };

    const handlePrint = () => {
        if (stockBalanceData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data',
                text: 'No data available to print',
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
                data={stockBalanceData}
                excludePrice={true}
                startDate={startDate}
                endDate={endDate}
                kitchen={kitchens.find(k => k.kitchen_code === selectedKitchen)?.kitchen_name || ''}
            />
        );

        printWindow.setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 1000);
    };

    const formatNumber = (num) => {
        return Number(num || 0).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
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
                                    dateFormat="MM/dd/yyyy"
                                    placeholderText="MM/DD/YYYY"
                                    customInput={
                                        <TextField
                                            size="small"
                                            fullWidth
                                            sx={{
                                                mt: '8px',
                                                width: '100%',
                                                '& .MuiInputBase-root': { width: '100%' },
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '10px',
                                                    bgcolor: 'white'
                                                },
                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <CalendarTodayIcon sx={{ color: '#754C27', cursor: 'pointer' }} />
                                                    </InputAdornment>
                                                ),
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
                                    dateFormat="MM/dd/yyyy"
                                    placeholderText="MM/DD/YYYY"
                                    customInput={
                                        <TextField
                                            size="small"
                                            fullWidth
                                            sx={{
                                                mt: '8px',
                                                width: '100%',
                                                '& .MuiInputBase-root': { width: '100%' },
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '10px',
                                                    bgcolor: 'white'
                                                },
                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <CalendarTodayIcon sx={{ color: '#754C27', cursor: 'pointer' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    }
                                />
                            </Grid2>

                            {/* Kitchen Selection */}
                            <Grid2 item size={{ xs: 12, md: 12 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Kitchen
                                </Typography>
                                <FormControl
                                    fullWidth
                                    size="small"
                                    sx={{
                                        mt: '8px',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            bgcolor: 'white',
                                            height: '38px',
                                        },
                                    }}
                                >
                                    <Select
                                        value={selectedKitchen}
                                        onChange={(e) => setSelectedKitchen(e.target.value)}
                                        displayEmpty
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <RestaurantIcon sx={{ color: '#754C27' }} />
                                            </InputAdornment>
                                        }
                                    >
                                        <MenuItem value="">
                                            <em>All Kitchens</em>
                                        </MenuItem>
                                        {loadingKitchens ? (
                                            <MenuItem disabled>Loading Kitchens...</MenuItem>
                                        ) : (
                                            kitchens.map((kitchen) => (
                                                <MenuItem key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                                                    {kitchen.kitchen_name}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid2>

                            <Grid2 item size={{ xs: 12, md: 12 }} sx={{ mt: 2 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={fetchStockBalance}
                                    sx={{
                                        bgcolor: '#754C27',
                                        color: 'white',
                                        height: '48px',
                                        '&:hover': {
                                            bgcolor: '#5c3c1f'
                                        }
                                    }}
                                >
                                    Show
                                </Button>
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
                        Kitchen Stock Balance Report
                    </Typography>
                </Box>

                <Box sx={{ width: '100%' }}>
                    {/* Controls */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', mb: 0.5 }}>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C', width: '100px' }}>Date:</Typography>
                                <Typography>
                                    {startDate && endDate
                                        ? `${format(startDate, 'MM/dd/yyyy')} - ${format(endDate, 'MM/dd/yyyy')}`
                                        : "Not specified"}
                                </Typography>
                            </Box>
                            {selectedKitchen && (
                                <Box sx={{ display: 'flex' }}>
                                    <Typography sx={{ fontWeight: '700', color: '#AD7A2C', width: '100px' }}>Kitchen:</Typography>
                                    <Typography>
                                        {kitchens.find(k => k.kitchen_code === selectedKitchen)?.kitchen_name || ''}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                onClick={handlePrint}
                                variant="outlined"
                                sx={{
                                    color: '#754C27',
                                    borderColor: '#754C27',
                                    '&:hover': { borderColor: '#5c3c1f' }
                                }}
                            >
                                Print
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleExportExcel}
                                sx={{
                                    color: '#754C27',
                                    borderColor: '#754C27',
                                    '&:hover': { borderColor: '#5c3c1f' }
                                }}
                            >
                                Excel
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleExportPdf}
                                sx={{
                                    color: '#754C27',
                                    borderColor: '#754C27',
                                    '&:hover': { borderColor: '#5c3c1f' }
                                }}
                            >
                                PDF
                            </Button>
                        </Box>
                    </Box>

                    {/* Table */}
                    <Box sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        mb: '12px',
                        mt: 3,
                        overflow: 'hidden',
                    }}>
                        <Box sx={{
                            width: '100%',
                            overflowX: 'auto',
                            pb: 2,
                        }}>
                            <table style={{
                                width: '100%',
                                marginTop: '24px',
                                minWidth: '800px',
                                borderCollapse: 'separate',
                                borderSpacing: 0,
                            }}>
                                <thead>
                                    <tr>
                                        <th style={{
                                            padding: '12px 16px',
                                            textAlign: 'center',
                                            color: '#754C27',
                                            backgroundColor: 'white',
                                            position: 'sticky',
                                            left: 0,
                                            zIndex: 3,
                                            minWidth: '60px',
                                            boxShadow: '2px 0px 3px rgba(0,0,0,0.1)'
                                        }}>No</th>
                                        <th style={{
                                            padding: '12px 16px',
                                            textAlign: 'left',
                                            color: '#754C27',
                                            backgroundColor: 'white',
                                            position: 'sticky',
                                            left: '60px',
                                            zIndex: 3,
                                            minWidth: '200px',
                                            boxShadow: '2px 0px 3px rgba(0,0,0,0.1)'
                                        }}>Product</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27', minWidth: '120px' }}>Kitchen</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27', minWidth: '100px' }}>Unit</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27', minWidth: '80px' }}>Beg</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27', minWidth: '80px' }}>In</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27', minWidth: '80px' }}>Out</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27', minWidth: '80px' }}>Update</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27', minWidth: '80px' }}>Balance</th>
                                    </tr>
                                    <tr>
                                        <td colSpan={9}>
                                            <Divider sx={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                        </td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan={9} style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</td>
                                        </tr>
                                    ) : stockBalanceData.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>No data found</td>
                                        </tr>
                                    ) : (
                                        stockBalanceData.map((item, index) => {
                                            const balance = ((item.beg1 || 0) + (item.in1 || 0) - (item.out1 || 0)) + (item.upd1 || 0);

                                            return (
                                                <tr key={`${item.product_code}-${index}`}>
                                                    <td style={{
                                                        padding: '8px 16px',
                                                        textAlign: 'center',
                                                        backgroundColor: 'white',
                                                        position: 'sticky',
                                                        left: 0,
                                                        zIndex: 2,
                                                        boxShadow: '2px 0px 3px rgba(0,0,0,0.1)'
                                                    }}>{index + 1}</td>
                                                    <td style={{
                                                        padding: '8px 16px',
                                                        textAlign: 'left',
                                                        backgroundColor: 'white',
                                                        position: 'sticky',
                                                        left: '60px',
                                                        zIndex: 2,
                                                        boxShadow: '2px 0px 3px rgba(0,0,0,0.1)'
                                                    }}>{item.tbl_product?.product_name}</td>
                                                    <td style={{ padding: '8px 16px' }}>{item.tbl_kitchen?.kitchen_name}</td>
                                                    <td style={{ padding: '8px 16px' }}>{item.tbl_unit?.unit_name}</td>
                                                    <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                                                        {formatNumber(item.beg1)}
                                                    </td>
                                                    <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                                                        {formatNumber(item.in1)}
                                                    </td>
                                                    <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                                                        {formatNumber(item.out1)}
                                                    </td>
                                                    <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                                                        {formatNumber(item.upd1)}
                                                    </td>
                                                    <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                                                        {formatNumber(balance)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                                {stockBalanceData.length > 0 && (
                                    <tfoot>
                                        <tr>
                                            <td colSpan={9}>
                                                <Divider sx={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}