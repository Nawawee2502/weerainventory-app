import * as React from 'react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Typography, TextField, Grid2, Button, InputAdornment } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Switch, Divider } from '@mui/material';
import { Br_stockcardAll } from '../../../api/restaurant/br_stockcardApi';
import { searchProductName } from '../../../api/productrecordApi';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { createRoot } from 'react-dom/client';
import PrintLayout from './PrintPreviewMonthlyStockcard';
import { exportToExcelMonthlyStockCard } from './ExportExcelMonthlyStockcard';
import { exportToPdfMonthlyStockCard } from './ExportPdfMonthlyStockcard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';

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

export default function ReportMonthlyStockCard() {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(() => convertToLasVegasTime(new Date()));
    const [endDate, setEndDate] = useState(() => convertToLasVegasTime(new Date()));
    const [productSearch, setProductSearch] = useState('');
    const [stockcardData, setStockcardData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [excludePrice, setExcludePrice] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

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

            const response = await dispatch(Br_stockcardAll(params)).unwrap();

            if (response.result) {
                if (response.data.length === 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'No Data Found',
                        text: 'No records found for the selected product and date',
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
                            <Grid2 item size={{ xs: 12, md: 12 }}>
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
                                            '& .MuiInputBase-root': {
                                                height: '38px',
                                                backgroundColor: '#fff',
                                            },
                                            '& .MuiOutlinedInput-input': {
                                                padding: '8.5px 14px',
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ color: '#5A607F' }} />
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
                                        ? `${format(startDate, 'MM/dd/yyyy')} - ${format(endDate, 'MM/dd/yyyy')}`
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
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Ref No</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Date</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Beg</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>In</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Out</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Update</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Balance</th>
                                    {!excludePrice && (
                                        <>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Unit Price</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Beg Amt</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>In Amt</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Out Amt</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Update Amt</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Balance Amount</th>
                                        </>
                                    )}
                                </tr>
                                <tr>
                                    <td colSpan={excludePrice ? 8 : 14}>
                                        <Divider sx={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={excludePrice ? 8 : 14} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={excludePrice ? 8 : 14} style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</td>
                                    </tr>
                                ) : !hasSearched || !productSearch.trim() ? (
                                    <tr>
                                        <td colSpan={excludePrice ? 8 : 14} style={{ textAlign: 'center', padding: '20px' }}>Please select a product</td>
                                    </tr>
                                ) : stockcardData.length === 0 ? (
                                    <tr>
                                        <td colSpan={excludePrice ? 8 : 14} style={{ textAlign: 'center', padding: '20px' }}>No data found</td>
                                    </tr>
                                ) : (
                                    stockcardData.map((item, index) => {
                                        const balance = ((item.beg1 || 0) + (item.in1 || 0) - (item.out1 || 0)) + (item.upd1 || 0);
                                        const balanceAmount = ((item.beg1_amt || 0) + (item.in1_amt || 0) - (item.out1_amt || 0)) + (item.upd1_amt || 0);

                                        return (
                                            <tr key={item.refno}>
                                                <td style={{ padding: '8px 16px', textAlign: 'center' }}>{index + 1}</td>
                                                <td style={{ padding: '8px 16px', textAlign: 'left' }}>{item.refno}</td>
                                                <td style={{ padding: '8px 16px' }}>{formatDateForDisplay(item.rdate)}</td>
                                                <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.beg1)}</td>
                                                <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.in1)}</td>
                                                <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.out1)}</td>
                                                <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.upd1)}</td>
                                                <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(balance)}</td>
                                                {!excludePrice && (
                                                    <>
                                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.uprice)}</td>
                                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.beg1_amt)}</td>
                                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.in1_amt)}</td>
                                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.out1_amt)}</td>
                                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(item.upd1_amt)}</td>
                                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{formatNumber(balanceAmount)}</td>
                                                    </>
                                                )}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                            {stockcardData.length > 0 && (
                                <tfoot>
                                    <tr>
                                        <td colSpan={excludePrice ? 8 : 14}>
                                            <Divider sx={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 'bold', color: '#754C27' }}>
                                            Total:
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
                                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>-</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>-</td>
                                        {!excludePrice && (
                                            <>
                                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>-</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                                    {formatNumber(stockcardData.reduce((sum, item) => sum + (item.beg1_amt || 0), 0))}
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                                    {formatNumber(stockcardData.reduce((sum, item) => sum + (item.in1_amt || 0), 0))}
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                                    {formatNumber(stockcardData.reduce((sum, item) => sum + (item.out1_amt || 0), 0))}
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                                    {formatNumber(stockcardData.reduce((sum, item) => sum + (item.upd1_amt || 0), 0))}
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                                    {formatNumber(stockcardData.reduce((sum, item) => {
                                                        const balanceAmount = ((item.beg1_amt || 0) + (item.in1_amt || 0) - (item.out1_amt || 0)) + (item.upd1_amt || 0);
                                                        return sum + balanceAmount;
                                                    }, 0))}
                                                </td>
                                            </>
                                        )}
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