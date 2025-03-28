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
    CircularProgress,
    Paper,
    Grid
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
import { searchProductName } from '../../../api/productrecordApi';
import { kitchenAll } from '../../../api/kitchenApi';
import { addKt_saf, Kt_safrefno } from '../../../api/kitchen/kt_safApi';
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
                    borderRadius: '10px'
                }
            }}
            InputProps={{
                readOnly: true,
                endAdornment: (
                    <InputAdornment position="end">
                        <CalendarTodayIcon sx={{ color: '#2E7D32', cursor: 'pointer' }} />
                    </InputAdornment>
                ),
            }}
        />
    </Box>
));

export default function CreateStockAdjustment({ onBack }) {
    const dispatch = useDispatch();

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRefNo, setIsLoadingRefNo] = useState(false);

    // Form states
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('');
    const [kitchens, setKitchens] = useState([]);
    const [saveKitchen, setSaveKitchen] = useState('');

    // Product selection states
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [expiryDates, setExpiryDates] = useState({});

    // Product search results and UI states
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [productsPerPage] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [paginatedProducts, setPaginatedProducts] = useState([]);
    const [imageErrors, setImageErrors] = useState({});

    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson);

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                // Load kitchens
                const kitchensResponse = await dispatch(kitchenAll({ offset: 0, limit: 100 })).unwrap();
                if (kitchensResponse?.data) {
                    setKitchens(kitchensResponse.data);
                }

                // Load products
                const productsResponse = await dispatch(searchProductName({ product_name: '' })).unwrap();
                if (productsResponse?.data) {
                    setAllProducts(productsResponse.data);
                    setFilteredProducts(productsResponse.data);
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load initial data'
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [dispatch]);

    // Filter products based on search term
    useEffect(() => {
        const filtered = allProducts.filter(product =>
            product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.product_code?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const sortedProducts = [...filtered].sort((a, b) => {
            const aSelected = selectedProducts.includes(a.product_code);
            const bSelected = selectedProducts.includes(b.product_code);
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return 0;
        });

        setFilteredProducts(sortedProducts);
        setTotalPages(Math.ceil(sortedProducts.length / productsPerPage));
        setPage(1);

        // For the dropdown search results
        if (searchTerm.length > 0) {
            setSearchResults(filtered.slice(0, 10)); // Show top 10 results
            setShowDropdown(filtered.length > 0);
        } else {
            setShowDropdown(false);
        }
    }, [searchTerm, allProducts, selectedProducts, productsPerPage]);

    // Update paginated products when page changes
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

            // Format date
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);
            const kitchenPrefix = selectedKitchen.substring(0, 2).toUpperCase();

            // Create prefix
            const prefix = `KTSAF${kitchenPrefix}${year}${month}`;

            // Get last reference number
            try {
                const res = await dispatch(Kt_safrefno({
                    kitchen_code: selectedKitchen,
                    date: selectedDate
                })).unwrap();

                // If reference number exists
                if (res.result && res.data?.refno) {
                    // Check if the returned refno matches our expected pattern
                    const expectedPattern = new RegExp(`^KTSAF${kitchenPrefix}${year}${month}\\d{3}$`);

                    if (expectedPattern.test(res.data.refno)) {
                        try {
                            // Extract the last 3 digits and parse as number
                            const lastThreeDigits = res.data.refno.slice(-3);
                            const lastNumber = parseInt(lastThreeDigits, 10);

                            // Ensure the parsed number is valid
                            if (isNaN(lastNumber)) {
                                setLastRefNo(`${prefix}001`);
                                return;
                            }

                            // Increment and pad to 3 digits
                            const newNumber = lastNumber + 1;
                            const newRefNo = `${prefix}${String(newNumber).padStart(3, '0')}`;
                            setLastRefNo(newRefNo);
                        } catch (parseError) {
                            console.error("Error parsing reference number:", parseError);
                            setLastRefNo(`${prefix}001`);
                        }
                    } else {
                        // Pattern doesn't match, start with 001
                        setLastRefNo(`${prefix}001`);
                    }
                } else {
                    // No existing reference number, start with 001
                    setLastRefNo(`${prefix}001`);
                }
            } catch (error) {
                console.warn("Error from API:", error);
                // Fallback to basic pattern if API call fails
                setLastRefNo(`${prefix}001`);
            }
        } catch (err) {
            console.error("Error generating refno:", err);
            // Fallback with basic generation
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);
            const kitchenPrefix = selectedKitchen.substring(0, 2).toUpperCase();
            setLastRefNo(`KTSAF${kitchenPrefix}${year}${month}001`);
        } finally {
            setIsLoadingRefNo(false);
        }
    };

    // Handle kitchen change
    const handleKitchenChange = (event) => {
        const newKitchenCode = event.target.value;
        setSaveKitchen(newKitchenCode);
        if (newKitchenCode) {
            handleGetLastRefNo(newKitchenCode, startDate);
        } else {
            setLastRefNo('');
        }
    };

    // Handle date change
    const handleDateChange = (date) => {
        setStartDate(date);
        if (saveKitchen) {
            handleGetLastRefNo(saveKitchen, date);
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
    };

    // Handle search with Enter key
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchTerm.trim() !== '') {
            searchProduct(searchTerm);
        }
    };

    // Search product by name or code
    const searchProduct = async (term) => {
        if (!term.trim()) return;

        try {
            const response = await dispatch(searchProductName({ product_name: term })).unwrap();
            if (response.data && response.data.length > 0) {
                // Find exact match or use the first result
                const exactMatch = response.data.find(
                    product => product.product_name.toLowerCase() === term.toLowerCase() ||
                        product.product_code.toLowerCase() === term.toLowerCase()
                );
                const selectedProduct = exactMatch || response.data[0];

                // Handle product selection with duplicate check
                handleProductSelect(selectedProduct);
                setSearchTerm('');
                setShowDropdown(false);
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Product Not Found',
                    text: 'No products found matching your search.',
                    confirmButtonColor: '#754C27'
                });
            }
        } catch (err) {
            console.error('Error searching products:', err);
            Swal.fire({
                icon: 'error',
                title: 'Search Error',
                text: err.message || 'Failed to search products',
                confirmButtonColor: '#754C27'
            });
        }
    };

    // Toggle product selection (for grid view)
    const toggleSelectProduct = (product) => {
        const isSelected = selectedProducts.includes(product.product_code);

        if (isSelected) {
            // Remove product
            setSelectedProducts(prev => prev.filter(id => id !== product.product_code));
            setProducts(prev => prev.filter(p => p.product_code !== product.product_code));

            // Clean up associated state
            const { [product.product_code]: _, ...newQuantities } = quantities;
            const { [product.product_code]: __, ...newUnits } = units;
            const { [product.product_code]: ___, ...newPrices } = unitPrices;
            const { [product.product_code]: ____, ...newTotals } = totals;
            const { [product.product_code]: _____, ...newExpiryDates } = expiryDates;

            setQuantities(newQuantities);
            setUnits(newUnits);
            setUnitPrices(newPrices);
            setTotals(newTotals);
            setExpiryDates(newExpiryDates);

            // Recalculate total
            setTotal(Object.values(newTotals).reduce((sum, curr) => sum + curr, 0));
        } else {
            // Check if already exists in dropdown selection
            if (products.some(p => p.product_code === product.product_code)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Duplicate Product',
                    text: `${product.product_name} is already in your adjustment.`,
                    timer: 1500
                });
                return;
            }

            // Add product
            setSelectedProducts(prev => [...prev, product.product_code]);
            setProducts(prev => [...prev, product]);

            // Initialize associated state
            setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
            setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1?.unit_code }));
            setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price }));
            setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));

            // Calculate initial total
            const initialTotal = product.bulk_unit_price * 1;
            setTotals(prev => ({ ...prev, [product.product_code]: initialTotal }));
            setTotal(prev => prev + initialTotal);
        }
    };

    // Handle product selection from dropdown
    const handleProductSelect = (product) => {
        // Check if product already exists
        if (products.some(p => p.product_code === product.product_code) ||
            selectedProducts.includes(product.product_code)) {
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Product',
                text: `${product.product_name} is already in your adjustment.`,
                timer: 1500
            });
            setSearchTerm('');
            setShowDropdown(false);
            return;
        }

        // Add product
        setSelectedProducts(prev => [...prev, product.product_code]);
        setProducts(prev => [...prev, product]);

        // Initialize associated state
        setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
        setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1?.unit_code || '' }));
        setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price || 0 }));
        setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));

        // Calculate initial total
        const initialTotal = (product.bulk_unit_price || 0) * 1;
        setTotals(prev => ({ ...prev, [product.product_code]: initialTotal }));
        setTotal(prev => prev + initialTotal);

        // Reset search
        setSearchTerm('');
        setShowDropdown(false);
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

    // Handle direct quantity input
    const handleQuantityInput = (productCode, value) => {
        const newValue = parseInt(value);
        if (isNaN(newValue) || newValue < 1) return;

        setQuantities(prev => ({
            ...prev,
            [productCode]: newValue
        }));

        const unitPrice = unitPrices[productCode] || 0;
        const newTotal = newValue * unitPrice;

        setTotals(prev => ({
            ...prev,
            [productCode]: newTotal
        }));

        // Recalculate total
        calculateOrderTotal();
    };

    // Calculate total for the entire order
    const calculateOrderTotal = () => {
        const newTotal = Object.values(totals).reduce((sum, current) => sum + current, 0);
        setTotal(newTotal);
    };

    // Handle unit change
    const handleUnitChange = (productCode, newUnit) => {
        setUnits(prev => ({ ...prev, [productCode]: newUnit }));

        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        const newPrice = newUnit === product.productUnit1?.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

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

    // Reset form
    const resetForm = () => {
        setProducts([]);
        setSelectedProducts([]);
        setQuantities({});
        setUnits({});
        setUnitPrices({});
        setTotals({});
        setTotal(0);
        setSearchTerm('');
        setExpiryDates({});
        // Don't reset kitchen and date to improve UX
    };

    // Handle form submission
    const handleSave = async () => {
        // Validate form
        if (!saveKitchen || products.length === 0 || !lastRefNo) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a kitchen and add at least one product',
                timer: 1500
            });
            return;
        }

        try {
            setIsLoading(true);

            Swal.fire({
                title: 'Saving stock adjustment...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Prepare header data
            const headerData = {
                refno: lastRefNo,
                rdate: format(startDate, 'MM/dd/yyyy'),
                kitchen_code: saveKitchen,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2?.user_code || ''
            };

            // Prepare product data
            const productArrayData = products.map(product => ({
                refno: headerData.refno,
                product_code: product.product_code,
                qty: quantities[product.product_code].toString(),
                unit_code: units[product.product_code],
                uprice: unitPrices[product.product_code].toString(),
                amt: totals[product.product_code].toString(),
                expire_date: format(expiryDates[product.product_code], 'MM/dd/yyyy'),
                texpire_date: format(expiryDates[product.product_code], 'yyyyMMdd')
            }));

            // Prepare order data
            const orderData = {
                headerData,
                productArrayData,
                footerData: {
                    total: total.toString()
                }
            };

            // Submit the data
            const result = await dispatch(addKt_saf(orderData)).unwrap();

            await Swal.fire({
                icon: 'success',
                title: 'Created stock adjustment successfully',
                text: `Reference No: ${lastRefNo}`,
                showConfirmButton: false,
                timer: 1500
            });

            onBack();

        } catch (error) {
            console.error('Save error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error saving stock adjustment',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Render product image
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

    if (isLoading && !products.length) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: 2
            }}>
                <Typography variant="h6">Loading...</Typography>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                sx={{ marginBottom: "20px" }}
            >
                Back to Stock Adjustments
            </Button>

            {/* Main content */}
            <Box display="flex" p={2} bgcolor="#F9F9F9" borderRadius="12px" boxShadow={1}>
                {/* Left Panel - Product Selection */}
                <Box flex={2} pr={2} display="flex" flexDirection="column">
                    {/* Search and Filter Section */}
                    <Box sx={{ marginBottom: "20px", paddingTop: '20px', position: 'relative' }}>
                        <TextField
                            placeholder="Search products by name or code..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
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

                        {/* Search Dropdown */}
                        {showDropdown && searchResults.length > 0 && (
                            <Box sx={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                bgcolor: 'background.paper',
                                boxShadow: 3,
                                borderRadius: 1,
                                zIndex: 1000,
                                maxHeight: 300,
                                overflow: 'auto'
                            }}>
                                {searchResults.map((product) => (
                                    <Box
                                        key={product.product_code}
                                        onClick={() => handleProductSelect(product)}
                                        sx={{
                                            p: 1.5,
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: 'action.hover' },
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Box sx={{ mr: 2, width: 40, height: 40 }}>
                                            {renderProductImage(product, 'table')}
                                        </Box>
                                        <Box>
                                            <Typography variant="body2">{product.product_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{product.product_code}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
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
                                        {product.tax1 === 'Y' && (
                                            <Typography variant="caption" color="success.main">
                                                Taxable
                                            </Typography>
                                        )}
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
                            onChange={(event, value) => setPage(value)}
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
                                Date
                            </Typography>
                            <DatePicker
                                selected={startDate}
                                onChange={handleDateChange}
                                dateFormat="MM/dd/yyyy"
                                customInput={<CustomInput />}
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
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Current Order Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" color="#754C27">Current Adjustment</Typography>
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
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Unit</TableCell>
                                    <TableCell>Unit Price</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">
                                                No products selected. Click on products to add them to your adjustment.
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
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <IconButton
                                                        onClick={() => handleQuantityChange(product.product_code, -1)}
                                                        size="small"
                                                    >
                                                        <RemoveIcon />
                                                    </IconButton>
                                                    <TextField
                                                        type="number"
                                                        value={quantities[product.product_code] || 1}
                                                        onChange={(e) => handleQuantityInput(product.product_code, e.target.value)}
                                                        size="small"
                                                        inputProps={{ min: 1, style: { textAlign: 'center' } }}
                                                        sx={{ width: 60, mx: 1 }}
                                                    />
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
                                                    value={units[product.product_code]}
                                                    onChange={(e) => handleUnitChange(product.product_code, e.target.value)}
                                                    size="small"
                                                    sx={{ minWidth: 80 }}
                                                >
                                                    <MenuItem value={product.productUnit1?.unit_code}>
                                                        {product.productUnit1?.unit_name}
                                                    </MenuItem>
                                                    <MenuItem value={product.productUnit2?.unit_code}>
                                                        {product.productUnit2?.unit_name}
                                                    </MenuItem>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                ${unitPrices[product.product_code]?.toFixed(2) || '0.00'}
                                            </TableCell>
                                            <TableCell>
                                                ${totals[product.product_code]?.toFixed(2) || '0.00'}
                                            </TableCell>
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

                    {/* Order Summary */}
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Typography variant="h6">Total</Typography>
                            <Typography variant="h6">${total.toFixed(2)}</Typography>
                        </Box>
                    </Box>

                    {/* Save Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSave}
                        disabled={isLoading || !lastRefNo || !saveKitchen || products.length === 0}
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
                        {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}