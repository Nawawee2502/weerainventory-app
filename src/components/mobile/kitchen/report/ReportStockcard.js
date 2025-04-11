import * as React from 'react';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Typography, TextField, Grid2, Button, InputAdornment, FormControl, Select, MenuItem } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Divider } from '@mui/material';
import { Kt_stockcardAll } from '../../../../api/kitchen/kt_stockcardApi';
import { searchProductName } from '../../../../api/productrecordApi';
import { kitchenAll } from '../../../../api/kitchenApi';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { createRoot } from 'react-dom/client';
import PrintPreviewMonthlyKitchenStockcard from './PrintPreviewMonthlyKitchenStockCard';
import { exportToExcelMonthlyKitchenStockCard } from './ExportToExcelMonthlyKitchenStockCard';
import { exportToPdfMonthlyKitchenStockCard } from './ExportToPdfMonthlyKitchenStockCard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const CustomInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
        <TextField
            value={value}
            onClick={onClick}
            placeholder={placeholder || "MM/DD/YYYY"}
            ref={ref}
            size="small"
            sx={{
                '& .MuiInputBase-root': {
                    height: '38px',
                    width: '100%',
                    backgroundColor: '#fff',
                },
                '& .MuiOutlinedInput-input': {
                    cursor: 'pointer',
                    paddingRight: '40px',
                }
            }}
            InputProps={{
                readOnly: true,
                endAdornment: (
                    <InputAdornment position="end">
                        <CalendarTodayIcon sx={{ color: '#754C27', cursor: 'pointer' }} />
                    </InputAdornment>
                ),
            }}
        />
    </Box>
));

const convertToLasVegasTime = (date) => {
    if (!date) return new Date();
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
};

export default function ReportMonthlyKitchenStockCard() {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(() => convertToLasVegasTime(new Date()));
    const [endDate, setEndDate] = useState(() => convertToLasVegasTime(new Date()));
    const [productSearch, setProductSearch] = useState('');
    const [stockcardData, setStockcardData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Kitchen related states
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

    const handleProductSearch = (e) => {
        const value = e.target.value;
        setProductSearch(value);

        if (value.length > 0) {
            dispatch(searchProductName({ product_name: value }))
                .unwrap()
                .then((res) => {
                    if (res.data) {
                        const sortedResults = [...res.data].sort((a, b) => {
                            const aExact = a.product_name.toLowerCase() === value.toLowerCase();
                            const bExact = b.product_name.toLowerCase() === value.toLowerCase();
                            if (aExact && !bExact) return -1;
                            if (!aExact && bExact) return 1;
                            return a.product_name.length - b.product_name.length;
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
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    };

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();
            return `${month}/${day}/${year}`;
        } catch (error) {
            console.error("Error formatting date:", error);
            return dateString;
        }
    };

    const loadData = async () => {
        if (!selectedProduct) {
            Swal.fire({
                icon: 'warning',
                title: 'Please select a product',
                text: 'A product must be selected before showing data',
                confirmButtonColor: '#754C27'
            });
            setStockcardData([]);
            setHasSearched(true);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const params = {
                rdate1: formatDateForApi(startDate),
                rdate2: formatDateForApi(endDate),
                product_code: selectedProduct.product_code,
                product_name: selectedProduct.product_name,
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
                    Swal.fire({
                        icon: 'warning',
                        title: 'No Data Found',
                        text: 'No records found for the selected criteria',
                        confirmButtonColor: '#754C27'
                    });
                }
                setStockcardData(response.data);
                setHasSearched(true);
            }
        } catch (err) {
            console.error('Error in loadData:', err);
            setError(err.message || 'Failed to fetch data');
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to fetch data',
                confirmButtonColor: '#754C27'
            });
        } finally {
            setLoading(false);
        }
    };

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
        exportToExcelMonthlyKitchenStockCard(stockcardData, false, startDate, endDate);
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
        exportToPdfMonthlyKitchenStockCard(stockcardData, false, startDate, endDate);
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
            <PrintPreviewMonthlyKitchenStockcard
                data={stockcardData}
                excludePrice={false}
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
                                        />
                                    }
                                />
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

                            {/* Kitchen Selection */}
                            <Grid2 item size={{ xs: 12, md: 6 }}>
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
                                    onClick={loadData}
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
                        Monthly Kitchen Stock Card Report
                    </Typography>
                </Box>

                <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', mb: 0.5 }}>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C', width: '100px' }}>Date:</Typography>
                                <Typography>
                                    {startDate && endDate
                                        ? `${format(startDate, 'MM/dd/yyyy')} - ${format(endDate, 'MM/dd/yyyy')}`
                                        : "Not specified"}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', mb: 0.5 }}>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C', width: '100px' }}>Product:</Typography>
                                <Typography>
                                    {productSearch || "Not selected"}
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
                                    }
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
                                    }
                                }}
                            >
                                PDF
                            </Button>
                        </Box>
                    </Box>
                    {/* Data Table - Updated overflow handling */}
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
                                        }}>No.</th>
                                        <th style={{
                                            padding: '12px 16px',
                                            textAlign: 'left',
                                            color: '#754C27',
                                            backgroundColor: 'white',
                                            position: 'sticky',
                                            left: '60px',
                                            zIndex: 3,
                                            minWidth: '120px',
                                            boxShadow: '2px 0px 3px rgba(0,0,0,0.1)'
                                        }}>Ref No</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27', minWidth: '100px' }}>Date</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27', minWidth: '80px' }}>Beg</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27', minWidth: '80px' }}>In</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27', minWidth: '80px' }}>Out</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27', minWidth: '80px' }}>Update</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27', minWidth: '80px' }}>Balance</th>
                                    </tr>
                                    <tr>
                                        <td colSpan={8}>
                                            <Divider sx={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                        </td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</td>
                                        </tr>
                                    ) : !hasSearched || !productSearch.trim() ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>Please select a product</td>
                                        </tr>
                                    ) : stockcardData.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>No data found</td>
                                        </tr>
                                    ) : (
                                        (() => {
                                            // คำนวณยอดสะสม (cumulative balance)
                                            let cumulativeBalance = 0;

                                            return stockcardData.map((item, index) => {
                                                // คำนวณการเปลี่ยนแปลงของรายการนี้
                                                const currentItemChange = ((item.beg1 || 0) + (item.in1 || 0) - (item.out1 || 0)) + (item.upd1 || 0);

                                                // เพิ่มไปที่ยอดสะสม
                                                cumulativeBalance += currentItemChange;

                                                return (
                                                    <tr key={item.refno}>
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
                                                        }}>{item.refno}</td>
                                                        <td style={{ padding: '8px 16px' }}>{formatDateForDisplay(item.rdate)}</td>
                                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.beg1)}</td>
                                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.in1)}</td>
                                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.out1)}</td>
                                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.upd1)}</td>
                                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(cumulativeBalance)}</td>
                                                    </tr>
                                                );
                                            });
                                        })()
                                    )}
                                </tbody>
                                {stockcardData.length > 0 && (
                                    <tfoot>
                                        <tr>
                                            <td colSpan={8}>
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
                                                textAlign: 'right',
                                                padding: '12px 16px',
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
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                                {formatNumber(stockcardData.reduce((sum, item) => sum + (item.beg1 || 0), 0))}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                                {formatNumber(stockcardData.reduce((sum, item) => sum + (item.in1 || 0), 0))}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                                {formatNumber(stockcardData.reduce((sum, item) => sum + (item.out1 || 0), 0))}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                                {formatNumber(stockcardData.reduce((sum, item) => sum + (item.upd1 || 0), 0))}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>-</td>
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