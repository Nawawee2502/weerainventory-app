import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    Divider,
    InputAdornment,
    Card,
    CardContent,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Select,
    MenuItem,
    Pagination,
    CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../../api/productrecordApi';
import { kitchenAll } from '../../../../api/kitchenApi';
import { addKt_pow, kt_powRefno } from '../../../../api/kitchen/kt_powApi';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

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
                    borderRadius: '10px',
                    mt: '8px'
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

export default function CreatePurchaseOrderWarehouse({ onBack }) {
    // Log component lifecycle
    useEffect(() => {
        console.log('CreatePurchaseOrderWarehouse component mounted');
        return () => {
            console.log('CreatePurchaseOrderWarehouse component unmounted');
        };
    }, []);

    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('');
    const [kitchens, setKitchens] = useState([]);
    const [saveKitchen, setSaveKitchen] = useState('');
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [imageErrors, setImageErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Pagination state
    const [page, setPage] = useState(1);
    const [productsPerPage] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [paginatedProducts, setPaginatedProducts] = useState([]);

    const userDataJson = localStorage.getItem("userData2");
    const userData2 = userDataJson ? JSON.parse(userDataJson) : null;

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsLoading(true);
                console.log('Loading initial data...');

                // Fetch kitchens and products in parallel
                const kitchenPromise = dispatch(kitchenAll({ offset: 0, limit: 100 })).unwrap();
                const productPromise = dispatch(searchProductName({ product_name: '' })).unwrap();

                const [kitchenRes, productRes] = await Promise.all([
                    kitchenPromise, productPromise
                ]);

                console.log('Kitchens loaded:', kitchenRes.data?.length);
                console.log('Products loaded:', productRes.data?.length);

                if (kitchenRes.result && kitchenRes.data) {
                    setKitchens(kitchenRes.data);
                }

                if (productRes.data) {
                    setAllProducts(productRes.data);
                    setFilteredProducts(productRes.data);
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load initial data. Please try again.'
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [dispatch]);

    // Handle filtering and pagination
    useEffect(() => {
        const filtered = allProducts.filter(product =>
            product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.product_code?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Sort products: selected ones first
        const sortedProducts = [...filtered].sort((a, b) => {
            const aSelected = selectedProducts.includes(a.product_code);
            const bSelected = selectedProducts.includes(b.product_code);

            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return 0;
        });

        setFilteredProducts(sortedProducts);
        setTotalPages(Math.ceil(sortedProducts.length / productsPerPage));
        setPage(1); // Reset to first page when filter changes
    }, [searchTerm, allProducts, selectedProducts, productsPerPage]);

    // Update paginated products when page or filtered products change
    useEffect(() => {
        const startIndex = (page - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
    }, [filteredProducts, page, productsPerPage]);

    const handleGetLastRefNo = async (selectedDate, selectedKitchen) => {
        try {
            if (!selectedKitchen) {
                setLastRefNo('');
                return;
            }

            const res = await dispatch(kt_powRefno({
                kitchen_code: selectedKitchen,
                date: selectedDate
            })).unwrap();

            if (res.result && res.data?.refno) {
                setLastRefNo(res.data.refno);
            } else {
                // Fallback if API doesn't return a reference number
                const year = selectedDate.getFullYear().toString().slice(-2);
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const newRefNo = `KTPOW${selectedKitchen}${year}${month}001`;
                setLastRefNo(newRefNo);
            }
        } catch (err) {
            console.error("Error generating refno:", err);
            // Fallback with local generation
            const year = selectedDate.getFullYear().toString().slice(-2);
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const newRefNo = `KTPOW${selectedKitchen}${year}${month}001`;
            setLastRefNo(newRefNo);

            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'Generated a local reference number due to server error.'
            });
        }
    };

    const handleKitchenChange = (e) => {
        const newKitchenCode = e.target.value;
        setSaveKitchen(newKitchenCode);
        if (newKitchenCode) {
            handleGetLastRefNo(startDate, newKitchenCode);
        } else {
            setLastRefNo('');
        }
    };

    const handleDateChange = (date) => {
        setStartDate(date);
        if (saveKitchen) {
            handleGetLastRefNo(date, saveKitchen);
        }
    };

    // Function to render product image with error handling
    const renderProductImage = (product, size = 'small') => {
        // If no image
        if (!product?.product_img) {
            return (
                <Box sx={{
                    width: size === 'small' ? '100%' : (size === 'table' ? '100%' : 200),
                    height: size === 'small' ? 100 : (size === 'table' ? '100%' : 200),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: size === 'table' ? '4px' : '8px'
                }}>
                    <Typography variant="body2" color="text.secondary">No Image</Typography>
                </Box>
            );
        }

        // Check if this image has errored before
        if (imageErrors[product.product_code]) {
            return (
                <Box sx={{
                    width: size === 'small' ? '100%' : (size === 'table' ? '100%' : 200),
                    height: size === 'small' ? 100 : (size === 'table' ? '100%' : 200),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: size === 'table' ? '4px' : '8px'
                }}>
                    <Typography variant="body2" color="text.secondary">Image Error</Typography>
                </Box>
            );
        }

        const baseUrl = process.env.REACT_APP_URL_API || 'http://localhost:4001';
        const imageUrl = `${baseUrl}/public/images/${product.product_img}`;

        return (
            <Box sx={{
                width: '100%',
                height: size === 'small' ? 100 : (size === 'table' ? '100%' : 200),
                position: 'relative',
                overflow: 'hidden'
            }}>
                <img
                    src={imageUrl}
                    alt={product.product_name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: size === 'table' ? '4px' : '8px 8px 0 0'
                    }}
                    onError={(e) => {
                        console.error('Image load error:', imageUrl);
                        setImageErrors(prev => ({
                            ...prev,
                            [product.product_code]: true
                        }));
                    }}
                />
            </Box>
        );
    };

    const toggleSelectProduct = (product) => {
        console.log('Toggling product selection:', product.product_code);
        const isSelected = selectedProducts.includes(product.product_code);

        if (isSelected) {
            setSelectedProducts(prev => prev.filter(id => id !== product.product_code));
            setProducts(prev => prev.filter(p => p.product_code !== product.product_code));

            // Clean up associated state
            const { [product.product_code]: _, ...newQuantities } = quantities;
            const { [product.product_code]: __, ...newUnits } = units;
            const { [product.product_code]: ___, ...newPrices } = unitPrices;
            const { [product.product_code]: ____, ...newTotals } = totals;

            setQuantities(newQuantities);
            setUnits(newUnits);
            setUnitPrices(newPrices);
            setTotals(newTotals);

            setTotal(Object.values(newTotals).reduce((sum, curr) => sum + curr, 0));

        } else {
            setSelectedProducts(prev => [...prev, product.product_code]);
            setProducts(prev => [...prev, product]);

            // Initialize associated state
            setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
            setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1?.unit_code || '' }));
            setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price || 0 }));

            // Calculate initial total
            const initialTotal = (product.bulk_unit_price || 0) * 1;
            setTotals(prev => ({ ...prev, [product.product_code]: initialTotal }));
            setTotal(prev => prev + initialTotal);
        }
    };

    const handleQuantityChange = (productCode, delta) => {
        const currentQty = quantities[productCode] || 0;
        const newQty = Math.max(1, currentQty + delta);

        setQuantities(prev => ({ ...prev, [productCode]: newQty }));

        // Update total
        const price = unitPrices[productCode] || 0;
        const newTotal = newQty * price;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(Object.values({ ...totals, [productCode]: newTotal }).reduce((a, b) => a + b, 0));
    };

    const handleUnitChange = (productCode, newUnit) => {
        setUnits(prev => ({ ...prev, [productCode]: newUnit }));

        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        const newPrice = newUnit === product.productUnit1?.unit_code
            ? (product.bulk_unit_price || 0)
            : (product.retail_unit_price || 0);

        setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));

        // Update total
        const qty = quantities[productCode] || 0;
        const newTotal = qty * newPrice;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(Object.values({ ...totals, [productCode]: newTotal }).reduce((a, b) => a + b, 0));
    };

    // Update to handleSave function to include tax values
    const handleSave = async () => {
        if (!saveKitchen || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a kitchen and at least one product.',
                timer: 1500
            });
            return;
        }

        try {
            Swal.fire({
                title: 'Saving purchase order...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Calculate taxable and non-taxable amounts
            let taxableAmount = 0;
            let nontaxableAmount = 0;

            products.forEach(product => {
                const productCode = product.product_code;
                const quantity = quantities[productCode] || 0;
                const unitPrice = unitPrices[productCode] || 0;
                const lineTotal = quantity * unitPrice;

                if (product.tax1 === 'Y') {
                    taxableAmount += lineTotal;
                } else {
                    nontaxableAmount += lineTotal;
                }
            });

            const headerData = {
                refno: lastRefNo,
                rdate: format(startDate, 'MM/dd/yyyy'),
                kitchen_code: saveKitchen,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2?.user_code || '',
                // Add the tax fields to header data
                taxable: taxableAmount.toString(),
                nontaxable: nontaxableAmount.toString()
            };

            const productArrayData = products.map(product => ({
                refno: headerData.refno,
                product_code: product.product_code,
                qty: (quantities[product.product_code] || 1).toString(),
                unit_code: units[product.product_code] || product.productUnit1?.unit_code || '',
                uprice: (unitPrices[product.product_code] || 0).toString(),
                amt: (totals[product.product_code] || 0).toString(),
                // Add tax1 field to each product
                tax1: product.tax1 || 'N'
            }));

            const orderData = {
                headerData,
                productArrayData,
                footerData: {
                    total: total.toString()
                }
            };

            console.log('Submitting order data:', orderData);

            try {
                const response = await dispatch(addKt_pow(orderData)).unwrap();
                console.log('API response:', response);

                await Swal.fire({
                    icon: 'success',
                    title: 'Created purchase order successfully',
                    text: `Reference No: ${lastRefNo}`,
                    showConfirmButton: false,
                    timer: 1500
                });

                resetForm();
                if (typeof onBack === 'function') {
                    onBack();
                } else {
                    console.error('onBack is not a function:', onBack);
                }
            } catch (apiError) {
                console.error('API Error Details:', {
                    message: apiError.message,
                    stack: apiError.stack,
                    data: apiError.data,
                    status: apiError.status,
                    fullError: apiError
                });

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: apiError.message || 'Error saving purchase order',
                    confirmButtonText: 'OK',
                    footer: 'Check browser console for detailed error information'
                });
            }
        } catch (error) {
            console.error('Error saving purchase order:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error saving purchase order',
                confirmButtonText: 'OK'
            });
        }
    };

    // Calculate tax based on products with tax1='Y'
    const calculateTax = () => {
        let taxableAmount = 0;
        products.forEach(product => {
            if (product.tax1 === 'Y') {
                const productCode = product.product_code;
                const quantity = quantities[productCode] || 0;
                const unitPrice = unitPrices[productCode] || 0;
                taxableAmount += quantity * unitPrice;
            }
        });
        return taxableAmount * 0.07;
    };

    const resetForm = () => {
        setProducts([]);
        setSelectedProducts([]);
        setQuantities({});
        setUnits({});
        setUnitPrices({});
        setTotals({});
        setTotal(0);
        setSaveKitchen('');
        setSearchTerm('');
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleBackClick = () => {
        console.log('Back button clicked, calling onBack function');
        if (typeof onBack === 'function') {
            onBack();
        } else {
            console.error('onBack is not a function:', onBack);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: 3
            }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Loading data...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ padding: "10px", paddingBottom: "300px", fontFamily: "Arial, sans-serif" }}>
            <style>
                {`
                .react-datepicker-popper {
                    z-index: 9999 !important;
                }
            `}
            </style>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBackClick}
                sx={{ marginBottom: "20px" }}
            >
                Back to Purchase Order Warehouse
            </Button>

            {/* Main content */}
            <Box display="flex" p={2} bgcolor="#F9F9F9">
                {/* Left Panel - Product Selection */}
                <Box flex={2} pr={2} display="flex" flexDirection="column">
                    {/* Search and Filter Section */}
                    <Box sx={{ marginBottom: "20px", paddingTop: '20px' }}>
                        <TextField
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                width: '100%',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '40px',
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
                    </Box>

                    {/* Products Grid */}
                    <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center" sx={{ flex: 1, overflow: 'auto' }}>
                        {paginatedProducts.length === 0 ? (
                            <Typography sx={{ my: 4, color: 'text.secondary' }}>
                                No products found. Try a different search term.
                            </Typography>
                        ) : (
                            paginatedProducts.map((product) => (
                                <Card
                                    key={product.product_code}
                                    sx={{
                                        width: 160,
                                        borderRadius: '16px',
                                        boxShadow: 3,
                                        position: 'relative',
                                        cursor: 'pointer',
                                        border: selectedProducts.includes(product.product_code) ? '2px solid #4caf50' : 'none',
                                        bgcolor: selectedProducts.includes(product.product_code) ? '#f0fff0' : 'white',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                    onClick={() => toggleSelectProduct(product)}
                                >
                                    {renderProductImage(product, 'small')}
                                    <CardContent>
                                        <Typography variant="body1" fontWeight={500} noWrap>
                                            {product.product_name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {product.product_code}
                                        </Typography>
                                        {/* Removed price display */}
                                    </CardContent>
                                    {selectedProducts.includes(product.product_code) && (
                                        <CheckCircleIcon
                                            sx={{
                                                color: '#4caf50',
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                fontSize: 30,
                                                backgroundColor: 'rgba(255,255,255,0.7)',
                                                borderRadius: '50%'
                                            }}
                                        />
                                    )}
                                </Card>
                            ))
                        )}
                    </Box>

                    {/* Pagination */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            showFirstButton
                            showLastButton
                            size="large"
                        />
                    </Box>
                </Box>

                {/* Right Panel - Order Details */}
                <Box flex={2} pl={2} bgcolor="#FFF" p={1} borderRadius="12px" boxShadow={3}>
                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
                        Ref.no
                    </Typography>
                    <TextField
                        value={lastRefNo || "Please select kitchen first"}
                        disabled
                        size="small"
                        sx={{
                            mt: '8px',
                            width: '95%',
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                '& .Mui-disabled': {
                                    WebkitTextFillColor: !lastRefNo ? '#d32f2f' : 'rgba(0, 0, 0, 0.38)',
                                }
                            },
                        }}
                    />

                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
                        Date
                    </Typography>
                    <DatePicker
                        selected={startDate}
                        onChange={handleDateChange}
                        dateFormat="MM/dd/yyyy"
                        customInput={<CustomInput />}
                    />

                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
                        Kitchen
                    </Typography>
                    <Select
                        value={saveKitchen}
                        onChange={handleKitchenChange}
                        displayEmpty
                        size="small"
                        sx={{
                            mt: '8px',
                            width: '95%',
                            borderRadius: '10px',
                        }}
                    >
                        <MenuItem value=""><em>Select Kitchen</em></MenuItem>
                        {kitchens.map((kitchen) => (
                            <MenuItem key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                                {kitchen.kitchen_name}
                            </MenuItem>
                        ))}
                    </Select>

                    <Divider sx={{ my: 2 }} />

                    {/* Current Order Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" color="#754C27">Current Order</Typography>
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                {products.length} items selected
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={resetForm}
                                sx={{
                                    background: "rgba(192, 231, 243, 0.88)",
                                    color: '#3399FF',
                                    '&:hover': {
                                        background: "rgba(192, 231, 243, 0.95)",
                                    },
                                    ml: 1
                                }}
                            >
                                Clear All
                            </Button>
                        </Box>
                    </Box>

                    {/* Order Table */}
                    <TableContainer sx={{ mt: 2, maxHeight: '400px', overflow: 'auto' }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>No.</TableCell>
                                    <TableCell>Image</TableCell>
                                    <TableCell>Product Code</TableCell>
                                    <TableCell>Product Name</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Unit</TableCell>
                                    {/* Removed Unit Price column */}
                                    {/* Removed Total column */}
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">
                                                No products selected. Click on products to add them to your order.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.map((product, index) => (
                                        <TableRow key={product.product_code}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                <Box sx={{
                                                    width: 50,
                                                    height: 50,
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '4px'
                                                }}>
                                                    {renderProductImage(product, 'table')}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{product.product_code}</TableCell>
                                            <TableCell>{product.product_name}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <IconButton
                                                        onClick={() => handleQuantityChange(product.product_code, -1)}
                                                        size="small"
                                                    >
                                                        <RemoveIcon />
                                                    </IconButton>
                                                    <Typography sx={{ mx: 1 }}>
                                                        {quantities[product.product_code] || 0}
                                                    </Typography>
                                                    <IconButton
                                                        onClick={() => handleQuantityChange(product.product_code, 1)}
                                                        size="small"
                                                    >
                                                        <AddIcon />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={units[product.product_code] || ''}
                                                    onChange={(e) => handleUnitChange(product.product_code, e.target.value)}
                                                    size="small"
                                                >
                                                    {product.productUnit1 && (
                                                        <MenuItem value={product.productUnit1.unit_code}>
                                                            {product.productUnit1.unit_name}
                                                        </MenuItem>
                                                    )}
                                                    {product.productUnit2 && (
                                                        <MenuItem value={product.productUnit2.unit_code}>
                                                            {product.productUnit2.unit_name}
                                                        </MenuItem>
                                                    )}
                                                </Select>
                                            </TableCell>
                                            {/* Removed unit price cell */}
                                            {/* Removed total cell */}
                                            <TableCell>
                                                <IconButton
                                                    onClick={() => toggleSelectProduct(product)}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Order Summary - Only shows item count, not prices */}
                    <Box sx={{
                        bgcolor: '#EAB86C',
                        borderRadius: '10px',
                        p: 2,
                        mt: 2,
                        color: 'white'
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Total Items</Typography>
                            <Typography>{products.length}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Total Quantity</Typography>
                            <Typography>
                                {Object.values(quantities).reduce((sum, qty) => sum + qty, 0)}
                            </Typography>
                        </Box>
                        {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Typography variant="h5">Ready to Process</Typography>
                            <Typography variant="h5">{products.length > 0 ? '✓' : '✗'}</Typography>
                        </Box> */}
                    </Box>

                    {/* Save Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSave}
                        disabled={!lastRefNo}
                        sx={{
                            mt: 2,
                            bgcolor: '#754C27',
                            color: '#FFFFFF',
                            height: '48px',
                            '&:hover': {
                                bgcolor: '#5c3c1f',
                            }
                        }}
                    >
                        Save
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}