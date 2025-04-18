import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Grid2, Button, MenuItem, FormControl, InputLabel, Select, InputAdornment } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Switch, Divider } from '@mui/material';
import { useDispatch } from 'react-redux';
import { Br_stockcardAll } from '../../../../api/restaurant/br_stockcardApi';
import { branchAll } from '../../../../api/branchApi';
import { searchProductName } from '../../../../api/productrecordApi';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { exportToExcelMonthlyStockBalance } from './ExportExcelMonthlyStockBalance';
import { exportToPdfMonthlyStockBalance } from './ExportPdfMonthlyStockBalance';
import PrintLayout from './PrintPreviewMonthlyStockBalance';
import { createRoot } from 'react-dom/client';
import SearchIcon from '@mui/icons-material/Search';
import StoreIcon from '@mui/icons-material/Store';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function ReportMonthlyStockBalance() {
    const dispatch = useDispatch();
    const today = new Date();

    // States
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [stockBalanceData, setStockBalanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [excludePrice, setExcludePrice] = useState(false);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [loadingBranches, setLoadingBranches] = useState(false);

    // Product search states
    const [productSearch, setProductSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        // Fetch branches when component mounts
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            setLoadingBranches(true);
            // ใช้ branchAll API ที่มีอยู่แล้ว
            const response = await dispatch(branchAll({
                offset: 0,
                limit: 99999 // ดึงข้อมูลทั้งหมด
            })).unwrap();

            if (response.result) {
                setBranches(response.data || []);
            } else {
                console.error('Failed to fetch branches');
            }
        } catch (err) {
            console.error('Error fetching branches:', err);
        } finally {
            setLoadingBranches(false);
        }
    };

    const handleProductSearch = (e) => {
        const value = e.target.value;
        setProductSearch(value);

        if (value.length > 0) {
            dispatch(searchProductName({ product_name: value }))
                .unwrap()
                .then((res) => {
                    if (res.data) {
                        // Sort results alphabetically by product_name (A-Z)
                        const sortedResults = [...res.data].sort((a, b) => {
                            return a.product_name.localeCompare(b.product_name);
                        });
                        setSearchResults(sortedResults);
                        setShowDropdown(true);
                    }
                })
                .catch((err) => {
                    console.log(err.message);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to search for products',
                        confirmButtonColor: '#754C27'
                    });
                });
        } else {
            setSearchResults([]);
            setShowDropdown(false);
        }
    };

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setProductSearch(product.product_name);
        setShowDropdown(false);
    };

    const formatDateForApi = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    };

    const formatDateForDisplay = (date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
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

        if (!selectedBranch) {
            Swal.fire({
                icon: 'warning',
                title: 'Please select a restaurant',
                text: 'A restaurant must be selected before showing data',
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
                branch_code: selectedBranch, // Always include branch_code since it's required
                limit: 99999,
                offset: 0
            };

            // Add product_code to params if a product is selected
            if (selectedProduct) {
                params.product_code = selectedProduct.product_code;
                params.product_name = selectedProduct.product_name;
            }

            const response = await dispatch(Br_stockcardAll(params)).unwrap();

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
                            balance: 0,
                            balance_amount: 0
                        };
                    }

                    // Update running totals
                    acc[key].beg1 += Number(item.beg1 || 0);
                    acc[key].in1 += Number(item.in1 || 0);
                    acc[key].out1 += Number(item.out1 || 0);
                    acc[key].upd1 += Number(item.upd1 || 0);

                    // Update balance and balance_amount with the latest values
                    const currentTransaction = response.data.filter(
                        transaction => transaction.product_code === key
                    ).sort((a, b) => new Date(b.trdate) - new Date(a.trdate))[0];

                    if (currentTransaction) {
                        acc[key].balance = Number(currentTransaction.balance || 0);
                        acc[key].balance_amount = Number(currentTransaction.balance_amount || 0);
                    }

                    return acc;
                }, {});

                // Convert the grouped data back to an array and sort by product name
                const processedData = Object.values(productGroups).sort((a, b) => {
                    const nameA = (a.tbl_product?.product_name || '').toLowerCase();
                    const nameB = (b.tbl_product?.product_name || '').toLowerCase();
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
        exportToExcelMonthlyStockBalance(stockBalanceData, excludePrice, startDate, endDate);
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
        exportToPdfMonthlyStockBalance(stockBalanceData, excludePrice, startDate, endDate);
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
                excludePrice={excludePrice}
                startDate={startDate}
                endDate={endDate}
                branch={branches.find(b => b.branch_code === selectedBranch)?.branch_name || ''}
                product={selectedProduct ? selectedProduct.product_name : ''}
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

    // Check if Show button should be enabled
    const isShowButtonDisabled = !selectedBranch;

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
                                                        <CalendarTodayIcon sx={{ color: '#754C27' }} />
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
                                                        <CalendarTodayIcon sx={{ color: '#754C27' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    }
                                />
                            </Grid2>

                            {/* Branch Selection */}
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Restaurant *
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
                                        value={selectedBranch}
                                        onChange={(e) => setSelectedBranch(e.target.value)}
                                        displayEmpty
                                        required
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <StoreIcon sx={{ color: '#754C27' }} />
                                            </InputAdornment>
                                        }
                                    >
                                        <MenuItem value="">
                                            <em>Select Restaurant</em>
                                        </MenuItem>
                                        {loadingBranches ? (
                                            <MenuItem disabled>Loading restaurants...</MenuItem>
                                        ) : (
                                            branches.map((branch) => (
                                                <MenuItem key={branch.branch_code} value={branch.branch_code}>
                                                    {branch.branch_name}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid2>

                            {/* Product Search */}
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Product
                                </Typography>
                                <Box sx={{ position: 'relative', width: '100%' }}>
                                    <TextField
                                        fullWidth
                                        value={productSearch}
                                        onChange={handleProductSearch}
                                        placeholder="Search product name..."
                                        sx={{
                                            mt: '8px',
                                            '& .MuiInputBase-root': {
                                                height: '38px',
                                                backgroundColor: '#fff',
                                                borderRadius: '10px',
                                            },
                                            '& .MuiOutlinedInput-input': {
                                                padding: '8.5px 14px',
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ color: '#754C27' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    {showDropdown && searchResults.length > 0 && (
                                        <Box sx={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            backgroundColor: 'white',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                            borderRadius: '4px',
                                            zIndex: 1000,
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            mt: '4px',
                                            width: '100%'
                                        }}>
                                            {searchResults.map((product) => (
                                                <Box
                                                    key={product.product_code}
                                                    onClick={() => handleProductSelect(product)}
                                                    sx={{
                                                        p: 1.5,
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            backgroundColor: '#f5f5f5'
                                                        },
                                                        borderBottom: '1px solid #eee'
                                                    }}
                                                >
                                                    <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                                                        {product.product_name}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </Grid2>

                            <Grid2 item size={{ xs: 12, md: 12 }} sx={{ mt: 2 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={fetchStockBalance}
                                    disabled={isShowButtonDisabled}
                                    sx={{
                                        bgcolor: isShowButtonDisabled ? '#cccccc' : '#754C27',
                                        color: 'white',
                                        height: '48px',
                                        '&:hover': {
                                            bgcolor: isShowButtonDisabled ? '#cccccc' : '#5c3c1f'
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
                        Monthly Stock Balance Report
                    </Typography>
                </Box>

                <Box sx={{ width: '100%' }}>
                    {/* Controls */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', mb: 0.5 }}>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C', width: '100px' }}>Date:</Typography>
                                <Typography>
                                    {`${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`}
                                </Typography>
                            </Box>
                            {selectedBranch && (
                                <Box sx={{ display: 'flex', mb: 0.5 }}>
                                    <Typography sx={{ fontWeight: '700', color: '#AD7A2C', width: '100px' }}>Restaurant:</Typography>
                                    <Typography>
                                        {branches.find(b => b.branch_code === selectedBranch)?.branch_name || ''}
                                    </Typography>
                                </Box>
                            )}
                            {selectedProduct && (
                                <Box sx={{ display: 'flex' }}>
                                    <Typography sx={{ fontWeight: '700', color: '#AD7A2C', width: '100px' }}>Product:</Typography>
                                    <Typography>
                                        {selectedProduct.product_name}
                                    </Typography>
                                </Box>
                            )}
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
                                        '&:hover': { borderColor: '#5c3c1f' },
                                        ml: '24px'
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
                                        '&:hover': { borderColor: '#5c3c1f' }, ml: '24px'
                                    }}
                                >
                                    PDF
                                </Button>
                            </Box>
                        </Box>
                    </Box>

                    {/* Table */}
                    <Box sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mb: '12px',
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
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27', minWidth: '150px' }}>Restaurant</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27', minWidth: '80px' }}>Unit</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27', minWidth: '80px' }}>Beg</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27', minWidth: '80px' }}>In</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27', minWidth: '80px' }}>Out</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27', minWidth: '80px' }}>Update</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27', minWidth: '80px' }}>Balance</th>
                                        {!excludePrice && (
                                            <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27', minWidth: '80px' }}>Total</th>
                                        )}
                                    </tr>
                                    <tr>
                                        <td colSpan={excludePrice ? 9 : 10}>
                                            <Divider sx={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                        </td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={excludePrice ? 9 : 10} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan={excludePrice ? 9 : 10} style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</td>
                                        </tr>
                                    ) : stockBalanceData.length === 0 ? (
                                        <tr>
                                            <td colSpan={excludePrice ? 9 : 10} style={{ textAlign: 'center', padding: '20px' }}>No data found</td>
                                        </tr>
                                    ) : (
                                        stockBalanceData.map((item, index) => {
                                            const balance = ((item.beg1 || 0) + (item.in1 || 0) - (item.out1 || 0)) + (item.upd1 || 0);
                                            const balanceAmount = ((item.beg1_amt || 0) + (item.in1_amt || 0) - (item.out1_amt || 0)) + (item.upd1_amt || 0);

                                            return (
                                                <tr key={`${item.refno}-${index}`}>
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
                                                    <td style={{ padding: '8px 16px' }}>{item.tbl_branch?.branch_name}</td>
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
                                                    {!excludePrice && (
                                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                                                            {formatNumber(balanceAmount)}
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                                {stockBalanceData.length > 0 && (
                                    <tfoot>
                                        <tr>
                                            <td colSpan={excludePrice ? 9 : 10}>
                                                <Divider sx={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{
                                                padding: '12px 16px',
                                                backgroundColor: 'white',
                                                position: 'sticky',
                                                left: 0,
                                                zIndex: 2,
                                                boxShadow: '2px 0px 3px rgba(0,0,0,0.1)'
                                            }}></td>
                                            <td style={{
                                                padding: '12px 16px',
                                                textAlign: 'left',
                                                fontWeight: 'bold',
                                                color: '#754C27',
                                                backgroundColor: 'white',
                                                position: 'sticky',
                                                left: '60px',
                                                zIndex: 2,
                                                boxShadow: '2px 0px 3px rgba(0,0,0,0.1)'
                                            }}>
                                                Total:
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#754C27' }}>
                                                {/* Branch column - no total */}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#754C27' }}>
                                                {/* Unit column - no total */}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                                {formatNumber(stockBalanceData.reduce((sum, item) => sum + (item.beg1 || 0), 0))}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                                {formatNumber(stockBalanceData.reduce((sum, item) => sum + (item.in1 || 0), 0))}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                                {formatNumber(stockBalanceData.reduce((sum, item) => sum + (item.out1 || 0), 0))}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                                {formatNumber(stockBalanceData.reduce((sum, item) => sum + (item.upd1 || 0), 0))}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                                {formatNumber(stockBalanceData.reduce((sum, item) => {
                                                    const balance = ((item.beg1 || 0) + (item.in1 || 0) - (item.out1 || 0)) + (item.upd1 || 0);
                                                    return sum + balance;
                                                }, 0))}
                                            </td>
                                            {!excludePrice && (
                                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                                    {formatNumber(stockBalanceData.reduce((sum, item) => {
                                                        const balanceAmount = ((item.beg1_amt || 0) + (item.in1_amt || 0) - (item.out1_amt || 0)) + (item.upd1_amt || 0);
                                                        return sum + balanceAmount;
                                                    }, 0))}
                                                </td>
                                            )}
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