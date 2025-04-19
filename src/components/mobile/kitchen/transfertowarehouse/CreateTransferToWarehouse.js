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
    Paper,
    Grid,
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
import { addKt_trw, Kt_trwrefno } from '../../../../api/kitchen/kt_trwApi';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Custom date picker input component
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

export default function CreateTransferToWarehouse({ onBack }) {
    const dispatch = useDispatch();

    // Loading state
    const [isLoadingRefNo, setIsLoadingRefNo] = useState(false);

    // Form state
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('');
    const [saveKitchen, setSaveKitchen] = useState('');

    // Data sources
    const [kitchens, setKitchens] = useState([]);
    const [allProducts, setAllProducts] = useState([]);

    // Product selection state
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Product details state
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [expiryDates, setExpiryDates] = useState({});
    const [temperatures, setTemperatures] = useState({});
    const [imageErrors, setImageErrors] = useState({});
    const [total, setTotal] = useState(0);

    // Pagination
    const [page, setPage] = useState(1);
    const [productsPerPage] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [paginatedProducts, setPaginatedProducts] = useState([]);

    // Get user data
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = userDataJson ? JSON.parse(userDataJson) : null;

    // Load initial data
    useEffect(() => {
        // Fetch kitchens
        dispatch(kitchenAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((res) => {
                setKitchens(res.data || []);
            })
            .catch((err) => console.log(err.message));

        // Initial product load
        dispatch(searchProductName({ product_name: '' }))
            .unwrap()
            .then((res) => {
                if (res.data) {
                    setAllProducts(res.data);
                    setFilteredProducts(res.data);
                }
            })
            .catch((err) => console.log(err.message));
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

    // Generate reference number based on kitchen and date
    const handleGetLastRefNo = async (selectedKitchen, selectedDate) => {
        if (!selectedKitchen) {
            setLastRefNo('');
            return;
        }

        try {
            setIsLoadingRefNo(true);
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);
            const kitchenPrefix = selectedKitchen.substring(0, 3).toUpperCase();

            // Get the last reference number from the database including kitchen code
            const res = await dispatch(Kt_trwrefno({
                kitchen_code: selectedKitchen,
                month,
                year
            })).unwrap();

            // If no reference numbers exist yet, start with 001
            if (!res.data || !res.data.refno) {
                const prefix = `KTTRW${kitchenPrefix}${year}${month}`;
                setLastRefNo(`${prefix}001`);
                return;
            }

            const lastRefNo = res.data.refno;
            const prefix = `KTTRW${kitchenPrefix}${year}${month}`;

            // Check if the last reference number has the same year/month/kitchen prefix
            if (lastRefNo && lastRefNo.startsWith(prefix)) {
                // Extract the numerical part (last 3 digits)
                const lastNumber = parseInt(lastRefNo.slice(-3));
                // Increment and pad to 3 digits
                const newNumber = lastNumber + 1;
                setLastRefNo(`${prefix}${String(newNumber).padStart(3, '0')}`);
            } else {
                // If the month/year/kitchen has changed, start with 001 for the new combination
                setLastRefNo(`${prefix}001`);
            }
        } catch (err) {
            console.error("Error generating refno:", err);
            // Fallback to a basic pattern if API call fails
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);
            const kitchenPrefix = selectedKitchen.substring(0, 3).toUpperCase();
            setLastRefNo(`KTTRW${kitchenPrefix}${year}${month}001`);
        } finally {
            setIsLoadingRefNo(false);
        }
    };

    // Handle kitchen change
    const handleKitchenChange = (e) => {
        const newKitchenCode = e.target.value;
        setSaveKitchen(newKitchenCode);

        // Generate reference number when kitchen is selected
        if (newKitchenCode) {
            handleGetLastRefNo(newKitchenCode, startDate);
        } else {
            setLastRefNo('');
        }
    };

    // Handle date change
    const handleDateChange = (date) => {
        setStartDate(date);

        // If kitchen is already selected, update reference number
        if (saveKitchen) {
            handleGetLastRefNo(saveKitchen, date);
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

    // Toggle product selection
    const toggleSelectProduct = (product) => {
        const isSelected = selectedProducts.includes(product.product_code);

        if (isSelected) {
            setSelectedProducts(prev => prev.filter(id => id !== product.product_code));
            setProducts(prev => prev.filter(p => p.product_code !== product.product_code));

            // Clean up associated state
            const { [product.product_code]: _, ...newQuantities } = quantities;
            const { [product.product_code]: __, ...newUnits } = units;
            const { [product.product_code]: ___, ...newPrices } = unitPrices;
            const { [product.product_code]: ____, ...newTotals } = totals;
            const { [product.product_code]: _____, ...newExpiryDates } = expiryDates;
            const { [product.product_code]: ______, ...newTemperatures } = temperatures;

            setQuantities(newQuantities);
            setUnits(newUnits);
            setUnitPrices(newPrices);
            setTotals(newTotals);
            setExpiryDates(newExpiryDates);
            setTemperatures(newTemperatures);

            setTotal(Object.values(newTotals).reduce((sum, curr) => sum + curr, 0));

        } else {
            setSelectedProducts(prev => [...prev, product.product_code]);
            setProducts(prev => [...prev, product]);

            // Initialize associated state
            setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
            setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1?.unit_code || '' }));
            setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price || 0 }));
            setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
            setTemperatures(prev => ({ ...prev, [product.product_code]: "38" }));

            // Calculate initial total
            const initialTotal = (product.bulk_unit_price || 0) * 1;
            setTotals(prev => ({ ...prev, [product.product_code]: initialTotal }));
            setTotal(prev => prev + initialTotal);
        }
    };

    // Handle quantity change with +/- buttons
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

    // Handle unit change (which affects price)
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

    // Handle expiry date change
    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
    };

    // Handle temperature change
    const handleTemperatureChange = (productCode, value) => {
        setTemperatures(prev => ({ ...prev, [productCode]: value }));
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

    // Reset form
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
        setExpiryDates({});
        setTemperatures({});
        setLastRefNo(''); // Clear ref no when form is reset
    };

    // Handle form submission
    const handleSave = async () => {
        // Validate form
        if (!saveKitchen || products.length === 0 || !lastRefNo) {
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
                title: 'Saving transfer...',
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

            const saleTax = taxableAmount * 0.07;

            // Prepare header data - without taxable/nontaxable
            const headerData = {
                refno: lastRefNo,
                rdate: format(startDate, 'MM/dd/yyyy'),
                kitchen_code: saveKitchen,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2?.user_code || ''
            };

            // Prepare product data - keeping values as numbers
            const productArrayData = products.map(product => ({
                refno: headerData.refno,
                product_code: product.product_code,
                qty: quantities[product.product_code] || 1,
                unit_code: units[product.product_code] || product.productUnit1?.unit_code || '',
                uprice: unitPrices[product.product_code] || 0,
                amt: totals[product.product_code] || 0,
                expire_date: format(expiryDates[product.product_code], 'MM/dd/yyyy'),
                texpire_date: format(expiryDates[product.product_code], 'yyyyMMdd'),
                tax1: product.tax1 || 'N',
                temperature1: temperatures[product.product_code] || ''
            }));

            // Prepare complete order data
            const orderData = {
                headerData,
                productArrayData,
                footerData: {
                    taxable: taxableAmount,
                    nontaxable: nontaxableAmount,
                    total: total,
                    sale_tax: saleTax,
                    total_due: total + saleTax
                }
            };

            console.log("Sending data to API:", orderData);

            // Submit the data
            const response = await dispatch(addKt_trw(orderData)).unwrap();
            console.log("API response:", response);

            // Show success message
            await Swal.fire({
                icon: 'success',
                title: 'Created transfer successfully',
                text: `Reference No: ${lastRefNo}`,
                showConfirmButton: false,
                timer: 1500
            });

            resetForm();
            onBack();

        } catch (error) {
            console.error("API error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error saving transfer',
                confirmButtonText: 'OK'
            });
        }
    };

    // Handle pagination
    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <Box sx={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <style>
                {`
                .react-datepicker-popper {
                    z-index: 9999 !important;
                }
            `}
            </style>
            {/* Back button */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                sx={{ marginBottom: "20px" }}
            >
                Back to Transfer to Warehouse
            </Button>

            {/* Main content */}
            <Box display="flex" p={2} bgcolor="#F9F9F9" borderRadius="12px" boxShadow={1}>
                {/* Left Panel - Product Selection */}
                <Box flex={2} pr={2} display="flex" flexDirection="column">
                    {/* Search and Filter Section */}
                    <Box sx={{ marginBottom: "20px", paddingTop: '20px' }}>
                        <TextField
                            placeholder="Search products by name or code..."
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
                                No products found matching your search criteria
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
                                        flexDirection: 'column',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4
                                        }
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
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    '&.Mui-selected': {
                                        backgroundColor: '#754C27',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#5c3c1f',
                                        }
                                    }
                                }
                            }}
                        />
                    </Box>
                </Box>

                {/* Right Panel - Order Details */}
                <Box flex={2} pl={2} bgcolor="#FFF" p={3} borderRadius="12px" boxShadow={3}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                                Ref.no
                            </Typography>
                            <TextField
                                value={isLoadingRefNo ? "Generating..." : (lastRefNo || "Please select kitchen first")}
                                disabled
                                size="small"
                                fullWidth
                                sx={{
                                    mt: '8px',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                    '& .Mui-disabled': {
                                        WebkitTextFillColor: !lastRefNo ? '#d32f2f' : 'rgba(0, 0, 0, 0.38)',
                                    }
                                }}
                                InputProps={{
                                    endAdornment: isLoadingRefNo ? (
                                        <InputAdornment position="end">
                                            <CircularProgress size={20} />
                                        </InputAdornment>
                                    ) : null,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                                Kitchen
                            </Typography>
                            <Select
                                value={saveKitchen}
                                onChange={handleKitchenChange}
                                displayEmpty
                                size="small"
                                fullWidth
                                sx={{
                                    mt: '8px',
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
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                                Date
                            </Typography>
                            <DatePicker
                                selected={startDate}
                                onChange={handleDateChange}
                                dateFormat="MM/dd/yyyy"
                                customInput={<CustomInput />}
                            />
                        </Grid>


                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Current Order Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" color="#754C27">Current Transfer</Typography>
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
                                disabled={products.length === 0}
                            >
                                Clear All
                            </Button>
                        </Box>
                    </Box>

                    {/* Order Table */}
                    <TableContainer component={Paper} sx={{
                        mt: 2,
                        maxHeight: '400px',
                        overflow: 'auto',
                        boxShadow: 'none',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px'
                    }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell>No.</TableCell>
                                    <TableCell>Image</TableCell>
                                    <TableCell>Product</TableCell>
                                    <TableCell>Expiry Date</TableCell>
                                    <TableCell>Temperature</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Unit</TableCell>
                                    {/* Removed Price column */}
                                    {/* Removed Total column */}
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            No products added yet. Select products from the left panel.
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
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {product.product_name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {product.product_code}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <DatePicker
                                                    selected={expiryDates[product.product_code]}
                                                    onChange={(date) => handleExpiryDateChange(product.product_code, date)}
                                                    dateFormat="MM/dd/yyyy"
                                                    customInput={<CustomInput />}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={temperatures[product.product_code] || "38"}
                                                    onChange={(e) => handleTemperatureChange(product.product_code, e.target.value)}
                                                    placeholder="Temperature"
                                                    sx={{ width: '80px' }}
                                                    inputProps={{ min: 0, step: "1" }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <TextField
                                                        sx={{ width: '80px', mx: 1 }}
                                                        size="small"
                                                        type="number"
                                                        inputProps={{ min: 1, style: { textAlign: 'center' } }}
                                                        value={quantities[product.product_code] || ''}
                                                        onChange={(e) => {
                                                            if (e.target.value === '') {
                                                                setQuantities(prev => ({ ...prev, [product.product_code]: '' }));
                                                                return;
                                                            }

                                                            const newValue = parseInt(e.target.value);
                                                            // ถ้าเป็นตัวเลขที่ถูกต้อง
                                                            if (!isNaN(newValue)) {
                                                                // ถ้าน้อยกว่า 1 ให้ใช้ค่า 1
                                                                const validValue = newValue < 1 ? 1 : newValue;
                                                                const oldValue = quantities[product.product_code] || 0;
                                                                setQuantities(prev => ({ ...prev, [product.product_code]: validValue }));

                                                                // Update total
                                                                const price = unitPrices[product.product_code] || 0;
                                                                const oldTotal = totals[product.product_code] || 0;
                                                                const newTotal = validValue * price;
                                                                setTotals(prev => ({ ...prev, [product.product_code]: newTotal }));
                                                                setTotal(prev => prev - oldTotal + newTotal);
                                                            }
                                                        }}
                                                        // เมื่อสูญเสียโฟกัส ถ้าเป็นค่าว่างให้กำหนดเป็น 1
                                                        onBlur={(e) => {
                                                            if (e.target.value === '' || parseInt(e.target.value) < 1) {
                                                                const oldValue = quantities[product.product_code] || 0;
                                                                setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));

                                                                // Update total
                                                                const price = unitPrices[product.product_code] || 0;
                                                                const oldTotal = totals[product.product_code] || 0;
                                                                const newTotal = 1 * price;
                                                                setTotals(prev => ({ ...prev, [product.product_code]: newTotal }));
                                                                setTotal(prev => prev - oldTotal + newTotal);
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={units[product.product_code]}
                                                    onChange={(e) => handleUnitChange(product.product_code, e.target.value)}
                                                    size="small"
                                                    sx={{ minWidth: 80 }}
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
                                            {/* Removed price cells */}
                                            <TableCell>
                                                <IconButton
                                                    onClick={() => toggleSelectProduct(product)}
                                                    color="error"
                                                    size="small"
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

                    {/* Modified Order Summary - Hide prices */}
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
                    </Box>

                    {/* Save Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSave}
                        disabled={!lastRefNo || products.length === 0}
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