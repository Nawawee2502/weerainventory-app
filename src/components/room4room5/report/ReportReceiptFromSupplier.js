import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Box, Typography, TextField, Grid2, Button, InputAdornment } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Checkbox, Switch, Divider } from '@mui/material';
import { useDispatch } from 'react-redux';
import { Kt_rfsAlljoindt } from '../../../api/kitchen/kt_rfsApi';
import { exportToExcelRfs } from './ExportExcelRFS';
import { kitchenAll } from '../../../api/kitchenApi';
import { supplierAll } from '../../../api/supplierApi';
import { searchProductName } from '../../../api/productrecordApi';
import { exportToPdfRfs } from './ExportPdfRFS';
import PrintLayout from './PrintPreviewRFS';
import Swal from 'sweetalert2';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Custom Input component for DatePicker
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
                    borderRadius: '10px'
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

export default function ReportReceiptFromSupplier() {
    const today = new Date();
    const [rfsData, setRfsData] = useState([]);
    const [excludePrice, setExcludePrice] = useState(false);
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [selectedKitchen, setSelectedKitchen] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [kitchens, setKitchens] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    // Product search state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const dropdownRef = useRef(null);
    const dispatch = useDispatch();

    const formatDisplayDate = (date) => {
        if (!date) return "";
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    // Handle click outside search dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const formatDate = (date) => {
        if (!date) return null;
        return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    };

    // Fetch data function
    const fetchData = async (params) => {
        try {
            setIsLoading(true);
            const response = await dispatch(Kt_rfsAlljoindt(params)).unwrap();
            console.log("API Response:", response);

            if (response.data && Array.isArray(response.data)) {
                // สร้างข้อมูลที่แบนราบจากรายการที่ซ้อนกัน
                const flattenedData = [];

                response.data.forEach(order => {
                    if (order.kt_rfsdts && Array.isArray(order.kt_rfsdts)) {
                        order.kt_rfsdts.forEach(detail => {
                            flattenedData.push({
                                date: order.rdate,
                                refno: order.refno,
                                kitchen: order.tbl_kitchen?.kitchen_name || 'Unknown',
                                supplier: order.tbl_supplier?.supplier_name || 'Unknown',
                                product_id: detail.product_code,
                                product_name: detail.tbl_product?.product_name || 'Unknown',
                                quantity: detail.qty,
                                unit_price: detail.uprice,
                                expireDate: detail.expire_date,
                                unit_code: detail.tbl_unit?.unit_name || detail.unit_code,
                                amount: detail.amt,
                                total: order.total,
                                user_code: order.user?.username || order.user_code
                            });
                        });
                    }
                });

                setRfsData(flattenedData);
            } else {
                console.warn("Response format unexpected:", response);
                setRfsData([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setRfsData([]);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch data: ' + (error.message || 'Unknown error'),
                confirmButtonColor: '#754C27'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load effect
    useEffect(() => {
        const initialLoad = async () => {
            try {
                // Load kitchens first
                const kitchenResponse = await dispatch(kitchenAll({ offset: 0, limit: 1000 })).unwrap();
                if (kitchenResponse?.data) {
                    setKitchens(kitchenResponse.data);
                }

                // Load suppliers
                const supplierResponse = await dispatch(supplierAll({ offset: 0, limit: 1000 })).unwrap();
                if (supplierResponse?.data) {
                    setSuppliers(supplierResponse.data);
                }

                // Default search parameters - load data after kitchens and suppliers are loaded
                const params = {
                    offset: 0,
                    limit: 10000,
                    rdate1: formatDate(today),
                    rdate2: formatDate(today)
                };

                // Delay initial data fetch to avoid race conditions
                setTimeout(() => {
                    fetchData(params);
                }, 100);
            } catch (error) {
                console.error("Error in initial load:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load initial data',
                    confirmButtonColor: '#754C27'
                });
            }
        };

        initialLoad();
    }, [dispatch]);

    const handleDateChange = (type, date) => {
        if (type === 'start') {
            setStartDate(date);
        } else {
            setEndDate(date);
        }
    };

    // Handle product search
    const handleProductSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 2) { // Only search if at least 3 characters
            try {
                const result = await dispatch(searchProductName({ product_name: value })).unwrap();
                if (result.data) {
                    setSearchResults(result.data);
                    setShowDropdown(true);
                }
            } catch (error) {
                console.error("Product search error:", error);
            }
        } else {
            setSearchResults([]);
            setShowDropdown(false);
        }
    };

    // Handle product selection from dropdown
    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setSearchTerm(product.product_name);
        setShowDropdown(false);
    };

    const handleSearch = () => {
        let params = {
            offset: 0,
            limit: 10000
        };

        if (startDate && endDate) {
            params.rdate1 = formatDate(startDate);
            params.rdate2 = formatDate(endDate);
        }

        if (selectedKitchen) {
            params.kitchen_code = selectedKitchen;
        }

        if (selectedSupplier) {
            params.supplier_code = selectedSupplier;
        }

        if (selectedProduct) {
            params.product_code = selectedProduct.product_code;
        }

        console.log("Search params:", params);
        fetchData(params);
    };

    // Clear search
    const clearSearch = () => {
        setSelectedProduct(null);
        setSearchTerm('');
        handleSearch();
    };

    const handlePrint = () => {
        if (rfsData.length === 0) {
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
                        .page-number {
                            position: fixed;
                            bottom: 10px;
                            right: 10px;
                            font-size: 12px;
                        }
                        body {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .page-container {
                            position: relative;
                            min-height: 100vh;
                        }
                    </style>
                </head>
                <body>
                    <div class="page-container">
                        <div id="print-content"></div>
                        <div class="page-number">1</div>
                    </div>
                </body>
            </html>
        `);

        const root = createRoot(printDoc.getElementById('print-content'));
        root.render(
            <PrintLayout
                data={rfsData}
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

    const handleExportExcel = () => {
        if (rfsData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data',
                text: 'There is no data to export to Excel',
                confirmButtonColor: '#754C27'
            });
            return;
        }
        exportToExcelRfs(rfsData, excludePrice, startDate, endDate);
    };

    const handleExportPdf = () => {
        if (rfsData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data',
                text: 'There is no data to export to PDF',
                confirmButtonColor: '#754C27'
            });
            return;
        }
        exportToPdfRfs(rfsData, excludePrice, startDate, endDate);
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
            <Box sx={{
                width: '70%',
                mt: '10px',
                flexDirection: 'column'
            }}>
                <Box
                    sx={{
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
                    }}
                >
                    <Box sx={{ width: '90%', mt: '24px' }}>
                        <Grid2 container spacing={2}>
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    From Date
                                </Typography>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => handleDateChange('start', date)}
                                    selectsStart
                                    startDate={startDate}
                                    endDate={endDate}
                                    dateFormat="MM/dd/yyyy"
                                    customInput={<CustomInput />}
                                />
                            </Grid2>
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    To Date
                                </Typography>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => handleDateChange('end', date)}
                                    selectsEnd
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={startDate}
                                    dateFormat="MM/dd/yyyy"
                                    customInput={<CustomInput />}
                                />
                            </Grid2>
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Kitchen
                                </Typography>
                                <Box
                                    component="select"
                                    value={selectedKitchen}
                                    onChange={(e) => setSelectedKitchen(e.target.value)}
                                    sx={{
                                        mt: '8px',
                                        width: '100%',
                                        height: '40px',
                                        borderRadius: '10px',
                                        padding: '0 14px',
                                        border: '1px solid rgba(0, 0, 0, 0.23)',
                                        fontSize: '16px',
                                        bgcolor: 'white',
                                        '&:focus': {
                                            outline: 'none',
                                            borderColor: '#754C27',
                                        },
                                        '& option': {
                                            fontSize: '16px',
                                        },
                                    }}
                                    id="Kitchen"
                                >
                                    <option value="">All Kitchens</option>
                                    {kitchens.map(kitchen => (
                                        <option key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                                            {kitchen.kitchen_name}
                                        </option>
                                    ))}
                                </Box>
                            </Grid2>
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Supplier
                                </Typography>
                                <Box
                                    component="select"
                                    value={selectedSupplier}
                                    onChange={(e) => setSelectedSupplier(e.target.value)}
                                    sx={{
                                        mt: '8px',
                                        width: '100%',
                                        height: '40px',
                                        borderRadius: '10px',
                                        padding: '0 14px',
                                        border: '1px solid rgba(0, 0, 0, 0.23)',
                                        fontSize: '16px',
                                        bgcolor: 'white',
                                        '&:focus': {
                                            outline: 'none',
                                            borderColor: '#754C27',
                                        },
                                        '& option': {
                                            fontSize: '16px',
                                        },
                                    }}
                                    id="supplier"
                                >
                                    <option value="">All Suppliers</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.supplier_code} value={supplier.supplier_code}>
                                            {supplier.supplier_name}
                                        </option>
                                    ))}
                                </Box>
                            </Grid2>

                            <Grid2 item size={{ xs: 12, md: 12 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Product
                                </Typography>
                                <Box sx={{ position: 'relative' }} ref={dropdownRef}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={searchTerm}
                                        onChange={handleProductSearch}
                                        placeholder="Search product name..."
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                bgcolor: 'white'
                                            },
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
                                            mt: '4px'
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
                                                    <Typography sx={{ fontSize: '12px', color: 'gray' }}>
                                                        {product.product_code}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
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
                                            flex: 3
                                        }}
                                    >
                                        Show
                                    </Button>
                                    {selectedProduct && (
                                        <Button
                                            variant="outlined"
                                            onClick={clearSearch}
                                            sx={{
                                                color: '#754C27',
                                                borderColor: '#754C27',
                                                '&:hover': {
                                                    borderColor: '#5c3c1f',
                                                },
                                                borderRadius: '10px',
                                                flex: 1
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </Box>
                            </Grid2>
                        </Grid2>
                    </Box>
                </Box>
            </Box>

            <Box
                sx={{
                    width: '98%',
                    bgcolor: 'white',
                    p: '12px',
                    borderRadius: '24px',
                    mb: '24px',
                    position: 'relative',
                    mt: '20px'
                }}
            >
                <Box sx={{
                    position: 'absolute',
                    top: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: '#EAB86C',
                    color: '#FFFFFF',
                    px: 3,
                    py: 2,
                    borderRadius: '8px',
                    zIndex: 3
                }}>
                    <Typography sx={{ fontWeight: 'bold', color: '#754C27' }}>
                        Receipt From Supplier
                    </Typography>
                </Box>
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex' }}>
                            <Box>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C' }}>
                                    Date
                                </Typography>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C' }}>
                                    Kitchen
                                </Typography>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C' }}>
                                    Supplier
                                </Typography>
                                {selectedProduct && (
                                    <Typography sx={{ fontWeight: '700', color: '#AD7A2C' }}>
                                        Product
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ ml: '8px' }}>
                                <Typography>
                                    {startDate && endDate
                                        ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
                                        : "Not specified"}
                                </Typography>
                                <Typography>
                                    {kitchens.find(k => k.kitchen_code === selectedKitchen)?.kitchen_name || "All Kitchens"}
                                </Typography>
                                <Typography>
                                    {suppliers.find(s => s.supplier_code === selectedSupplier)?.supplier_name || "All Suppliers"}
                                </Typography>
                                {selectedProduct && (
                                    <Typography>
                                        {selectedProduct.product_name}
                                    </Typography>
                                )}
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
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}>
                        {isLoading ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography>Loading data...</Typography>
                            </Box>
                        ) : (
                            <table style={{ width: '100%', marginTop: '24px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>No.</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Date</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Ref.no</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Kitchen</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Supplier</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Product ID</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Product Name</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Quantity</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Unit Price</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Expire Date</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Unit</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Amount</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Total</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Username</th>
                                    </tr>
                                    <tr>
                                        <td colSpan="15">
                                            <Divider sx={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                        </td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rfsData.length === 0 ? (
                                        <tr>
                                            <td colSpan="15" style={{ textAlign: 'center', padding: '20px' }}>
                                                No data found. Try different search criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        rfsData.map((row, index) => (
                                            <tr key={`${row.refno}-${row.product_id}-${index}`}>
                                                <td style={{ padding: '12px 16px' }}>{index + 1}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.date}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.refno}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.kitchen}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.supplier}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.product_id}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.product_name}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.quantity}</td>
                                                <td style={{ padding: '12px 16px' }}>{!excludePrice ? Number(row.unit_price).toFixed(2) : '-'}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.expireDate}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.unit_code}</td>
                                                <td style={{ padding: '12px 16px' }}>{!excludePrice ? Number(row.amount).toFixed(2) : '-'}</td>
                                                <td style={{ padding: '12px 16px' }}>{!excludePrice ? Number(row.total).toFixed(2) : '-'}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.user_code}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}