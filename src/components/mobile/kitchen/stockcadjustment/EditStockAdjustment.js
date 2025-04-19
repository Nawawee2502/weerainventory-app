import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Typography, IconButton, Divider, InputAdornment, Card, CardContent,
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem,
    Pagination, CircularProgress, Paper, Grid
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
import { getKtSafByRefno, updateKt_saf } from '../../../../api/kitchen/kt_safApi';
import { Kt_safdtAlljoindt } from '../../../../api/kitchen/kt_safdtApi';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// ส่วนของ CustomInput
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
                        <CalendarTodayIcon sx={{ color: '#2E7D32', cursor: 'pointer' }} />
                    </InputAdornment>
                ),
            }}
        />
    </Box>
));

export default function EditStockAdjustment({ onBack, editRefno }) {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const [adjustmentDate, setAdjustmentDate] = useState(new Date());
    const [kitchenCode, setKitchenCode] = useState('');
    const [kitchens, setKitchens] = useState([]);
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [total, setTotal] = useState(0);
    const [expiryDates, setExpiryDates] = useState({});
    const [imageErrors, setImageErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [debugInfo, setDebugInfo] = useState({});
    const [beginningQuantities, setBeginningQuantities] = useState({});
    const [balanceQuantities, setBalanceQuantities] = useState({});

    // Pagination state
    const [page, setPage] = useState(1);
    const [productsPerPage] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [paginatedProducts, setPaginatedProducts] = useState([]);

    // Get user data
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson || "{}");

    // Load initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                console.log('Fetching data for refno:', editRefno);

                // Load all products for catalog
                const productsResponse = await dispatch(searchProductName({ product_name: '' })).unwrap();
                if (productsResponse && productsResponse.data) {
                    setAllProducts(productsResponse.data);
                    setFilteredProducts(productsResponse.data);
                }

                // Fetch kitchens
                const kitchenResponse = await dispatch(kitchenAll({ offset: 0, limit: 100 })).unwrap();
                setKitchens(kitchenResponse.data || []);

                // Fetch stock adjustment data using the getKtSafByRefno function
                if (editRefno) {
                    const adjustmentResponse = await dispatch(getKtSafByRefno(typeof editRefno === 'object' ? editRefno : { refno: editRefno })).unwrap();

                    if (adjustmentResponse.result && adjustmentResponse.data) {
                        const adjustmentData = adjustmentResponse.data;
                        setDebugInfo({ headerData: adjustmentData });

                        // Set header data
                        if (adjustmentData.trdate && adjustmentData.trdate.length === 8) {
                            const year = parseInt(adjustmentData.trdate.substring(0, 4));
                            const month = parseInt(adjustmentData.trdate.substring(4, 6)) - 1;
                            const day = parseInt(adjustmentData.trdate.substring(6, 8));
                            setAdjustmentDate(new Date(year, month, day));
                        } else if (adjustmentData.rdate) {
                            // Try to parse the date safely
                            try {
                                const dateParts = adjustmentData.rdate.split('/');
                                if (dateParts.length === 3) {
                                    const month = parseInt(dateParts[0]) - 1;
                                    const day = parseInt(dateParts[1]);
                                    const year = parseInt(dateParts[2]);
                                    setAdjustmentDate(new Date(year, month, day));
                                } else {
                                    setAdjustmentDate(new Date());
                                }
                            } catch (e) {
                                console.error("Date parsing error:", e);
                                setAdjustmentDate(new Date());
                            }
                        }

                        setKitchenCode(adjustmentData.kitchen_code || '');
                        setTotal(parseFloat(adjustmentData.total) || 0);

                        // Fetch detail data
                        const refnoParam = typeof editRefno === 'object' ? editRefno : { refno: editRefno };
                        const detailResponse = await dispatch(Kt_safdtAlljoindt(refnoParam)).unwrap();
                        setDebugInfo(prev => ({ ...prev, detailData: detailResponse.data }));

                        if (detailResponse.result && detailResponse.data && detailResponse.data.length > 0) {
                            await processDetailData(detailResponse.data);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading stock adjustment data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load stock adjustment data: ' + error.message
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dispatch, editRefno]);

    const processDetailData = async (detailData) => {
        try {
            console.log('Processing detail data:', detailData);

            // Extract product codes to mark as selected
            const productCodes = detailData.map(item => item.product_code);
            setSelectedProducts(productCodes);

            // Set products array from detail data
            const productsData = detailData.map(item => ({
                ...item.tbl_product,
                product_code: item.product_code,
                product_name: item.tbl_product?.product_name || item.product_name
            }));

            setProducts(productsData);

            // Prepare state objects
            const newQuantities = {};
            const newUnits = {};
            const newUnitPrices = {};
            const newTotals = {};
            const newExpiryDates = {};
            const newBeginningQuantities = {};
            const newBalanceQuantities = {};

            detailData.forEach((item) => {
                const productCode = item.product_code;
                newQuantities[productCode] = parseFloat(item.qty) || 1;
                newUnits[productCode] = item.unit_code || item.tbl_product?.productUnit1?.unit_code || '';
                newUnitPrices[productCode] = parseFloat(item.uprice) || 0;
                newTotals[productCode] = parseFloat(item.amt) || 0;
                newBeginningQuantities[productCode] = parseFloat(item.beg1) || 0;
                newBalanceQuantities[productCode] = parseFloat(item.bal1) ||
                    (parseFloat(item.qty) + parseFloat(item.beg1)) || 0;

                // Parse expiry date
                if (item.texpire_date && item.texpire_date.length === 8) {
                    try {
                        const year = parseInt(item.texpire_date.substring(0, 4));
                        const month = parseInt(item.texpire_date.substring(4, 6)) - 1;
                        const day = parseInt(item.texpire_date.substring(6, 8));
                        newExpiryDates[productCode] = new Date(year, month, day);
                    } catch (e) {
                        console.error("Error parsing texpire_date:", e);
                        newExpiryDates[productCode] = new Date();
                    }
                } else if (item.expire_date) {
                    try {
                        const dateParts = item.expire_date.split('/');
                        if (dateParts.length === 3) {
                            const month = parseInt(dateParts[0]) - 1;
                            const day = parseInt(dateParts[1]);
                            const year = parseInt(dateParts[2]);
                            newExpiryDates[productCode] = new Date(year, month, day);
                        } else {
                            newExpiryDates[productCode] = new Date();
                        }
                    } catch (e) {
                        console.error("Expiry date parsing error:", e);
                        newExpiryDates[productCode] = new Date();
                    }
                } else {
                    newExpiryDates[productCode] = new Date();
                }
            });

            // Update all states
            setQuantities(newQuantities);
            setUnits(newUnits);
            setUnitPrices(newUnitPrices);
            setTotals(newTotals);
            setExpiryDates(newExpiryDates);
            setBeginningQuantities(newBeginningQuantities);
            setBalanceQuantities(newBalanceQuantities);

            // Calculate and set total
            const totalSum = Object.values(newTotals).reduce((sum, value) => sum + value, 0);
            setTotal(totalSum);

            console.log('Detail processing complete', {
                products: productsData,
                quantities: newQuantities,
                units: newUnits,
                prices: newUnitPrices,
                totals: newTotals,
                beginningQuantities: newBeginningQuantities,
                balanceQuantities: newBalanceQuantities
            });

        } catch (error) {
            console.error('Error processing detail data:', error);
            throw error;
        }
    };

    // Handle filtering and pagination
    useEffect(() => {
        if (allProducts.length === 0) return;

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
    }, [searchTerm, allProducts, selectedProducts, productsPerPage]);

    useEffect(() => {
        const startIndex = (page - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
    }, [filteredProducts, page, productsPerPage]);

    const toggleSelectProduct = (product) => {
        const isSelected = selectedProducts.includes(product.product_code);

        if (isSelected) {
            setSelectedProducts(prev => prev.filter(id => id !== product.product_code));
            setProducts(prev => prev.filter(p => p.product_code !== product.product_code));

            const { [product.product_code]: _, ...newQuantities } = quantities;
            const { [product.product_code]: __, ...newUnits } = units;
            const { [product.product_code]: ___, ...newPrices } = unitPrices;
            const { [product.product_code]: ____, ...newTotals } = totals;
            const { [product.product_code]: _____, ...newExpiryDates } = expiryDates;
            const { [product.product_code]: ______, ...newBeginningQuantities } = beginningQuantities;
            const { [product.product_code]: _______, ...newBalanceQuantities } = balanceQuantities;

            setQuantities(newQuantities);
            setUnits(newUnits);
            setUnitPrices(newPrices);
            setTotals(newTotals);
            setExpiryDates(newExpiryDates);
            setBeginningQuantities(newBeginningQuantities);
            setBalanceQuantities(newBalanceQuantities);

            setTotal(Object.values(newTotals).reduce((sum, curr) => sum + curr, 0));
        } else {
            setSelectedProducts(prev => [...prev, product.product_code]);
            setProducts(prev => [...prev, product]);

            // Initial values
            const initialQty = 1; // You could set this to 0 if you want a neutral starting point
            const initialBeg = 0;
            const initialBal = initialQty + initialBeg;

            setQuantities(prev => ({ ...prev, [product.product_code]: initialQty }));
            setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1?.unit_code || '' }));
            setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price || 0 }));
            setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
            setBeginningQuantities(prev => ({ ...prev, [product.product_code]: initialBeg }));
            setBalanceQuantities(prev => ({ ...prev, [product.product_code]: initialBal }));

            const initialTotal = (product.bulk_unit_price || 0) * initialQty;
            setTotals(prev => ({ ...prev, [product.product_code]: initialTotal }));
            setTotal(prev => prev + initialTotal);
        }
    };

    const calculateBalance = (productCode) => {
        const qty = quantities[productCode] || 0;
        const beg = beginningQuantities[productCode] || 0;
        return qty + beg;
    };

    // Function to render product image with error handling
    const renderProductImage = (product, size = 'small') => {
        // If no image
        if (!product?.product_img) {
            return (
                <Box sx={{
                    width: size === 'small' ? '100%' : (size === 'table' ? '50px' : 200),
                    height: size === 'small' ? 100 : (size === 'table' ? '50px' : 200),
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
                    width: size === 'small' ? '100%' : (size === 'table' ? '50px' : 200),
                    height: size === 'small' ? 100 : (size === 'table' ? '50px' : 200),
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
                height: size === 'small' ? 100 : (size === 'table' ? '50px' : 200),
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

    const handleQuantityChange = (productCode, delta) => {
        const currentQty = quantities[productCode] || 0;
        // Remove the Math.max(1, ...) to allow negative quantities
        const newQty = currentQty + delta;
        const currentBeg = beginningQuantities[productCode] || 0;
        const newBal = newQty + currentBeg;

        setQuantities(prev => ({ ...prev, [productCode]: newQty }));
        setBalanceQuantities(prev => ({ ...prev, [productCode]: newBal }));

        // Update total
        const price = unitPrices[productCode] || 0;
        const oldTotal = totals[productCode] || 0;
        const newTotal = newQty * price;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(prev => prev - oldTotal + newTotal);
    };

    const handleBeginningChange = (productCode, delta) => {
        const currentBeg = beginningQuantities[productCode] || 0;
        const newBeg = Math.max(0, currentBeg + delta);
        const currentQty = quantities[productCode] || 0;
        const newBal = currentQty + newBeg;

        setBeginningQuantities(prev => ({ ...prev, [productCode]: newBeg }));
        setBalanceQuantities(prev => ({ ...prev, [productCode]: newBal }));
    };

    // Update unit (which affects price)
    const handleUnitChange = (productCode, newUnit) => {
        setUnits(prev => ({ ...prev, [productCode]: newUnit }));

        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        const newPrice = newUnit === product.productUnit1?.unit_code
            ? (product.bulk_unit_price || 0)
            : (product.retail_unit_price || 0);

        // Update price
        const oldPrice = unitPrices[productCode] || 0;
        const qty = quantities[productCode] || 0;
        const oldTotal = totals[productCode] || 0;

        setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));

        // Update total
        const newTotal = qty * newPrice;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(prev => prev - oldTotal + newTotal);
    };

    // Update expiry date
    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
    };

    // Update price manually
    const handlePriceChange = (productCode, newPrice) => {
        if (newPrice < 0) return;

        const oldPrice = unitPrices[productCode] || 0;
        const qty = quantities[productCode] || 0;
        const oldTotal = totals[productCode] || 0;

        setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));

        // Update total
        const newTotal = qty * newPrice;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(prev => prev - oldTotal + newTotal);
    };

    const handleUpdate = async () => {
        if (!kitchenCode || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a kitchen and add at least one product.'
            });
            return;
        }

        try {
            Swal.fire({
                title: 'Updating...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const headerData = {
                refno: editRefno,
                rdate: format(adjustmentDate, 'MM/dd/yyyy'),
                kitchen_code: kitchenCode,
                trdate: format(adjustmentDate, 'yyyyMMdd'),
                monthh: format(adjustmentDate, 'MM'),
                myear: adjustmentDate.getFullYear(),
                user_code: userData2?.user_code || '',
                total: total.toString()
            };

            const productArrayData = products.map(product => ({
                refno: editRefno,
                product_code: product.product_code,
                qty: quantities[product.product_code].toString(),
                unit_code: units[product.product_code],
                uprice: unitPrices[product.product_code].toString(),
                amt: totals[product.product_code].toString(),
                expire_date: format(expiryDates[product.product_code], 'MM/dd/yyyy'),
                texpire_date: format(expiryDates[product.product_code], 'yyyyMMdd'),
                beg1: beginningQuantities[product.product_code].toString(),
                bal1: balanceQuantities[product.product_code].toString()
            }));

            await dispatch(updateKt_saf({
                ...headerData,
                headerData,
                productArrayData,
                footerData: {
                    total: total.toString()
                }
            })).unwrap();

            await Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Stock adjustment updated successfully',
                timer: 1500
            });

            onBack();
        } catch (error) {
            console.error('Error updating data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error updating stock adjustment'
            });
        }
    };

    // Reset form function
    const resetForm = () => {
        Swal.fire({
            title: 'Reset Changes',
            text: "Are you sure you want to reset all changes?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, reset!'
        }).then((result) => {
            if (result.isConfirmed) {
                onBack();
            }
        });
    };

    // Loading state
    if (isLoading) {
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
            <style>
                {`
                .react-datepicker-popper {
                    z-index: 9999 !important;
                }
            `}
            </style>
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
                    {/* Search Section */}
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
                                No products found. Try a different search term.
                            </Typography>
                        ) : (
                            paginatedProducts.map((product) => {
                                if (!product || !product.product_code) return null;

                                return (
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
                                );
                            })
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

                {/* Right Panel - Adjustment Details */}
                <Box flex={2} pl={2} bgcolor="#FFF" p={3} borderRadius="12px" boxShadow={3}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                                Ref.no
                            </Typography>
                            <TextField
                                value={editRefno}
                                disabled
                                size="small"
                                fullWidth
                                sx={{
                                    mt: '8px',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                                Date
                            </Typography>
                            <DatePicker
                                selected={adjustmentDate}
                                onChange={(date) => setAdjustmentDate(date)}
                                dateFormat="MM/dd/yyyy"
                                customInput={<CustomInput />}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                                Kitchen
                            </Typography>
                            <Select
                                value={kitchenCode}
                                onChange={(e) => setKitchenCode(e.target.value)}
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

                    {/* Current Adjustment Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" color="#754C27">Edit Stock Adjustment</Typography>
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

                    {/* Products Table */}
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
                                    <TableCell>Beginning (Beg1)</TableCell>
                                    <TableCell>Adjustment (Qty)</TableCell>
                                    <TableCell>Balance (Bal1)</TableCell>
                                    <TableCell>Unit</TableCell>
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
                                                    selected={expiryDates[product.product_code] || new Date()}
                                                    onChange={(date) => handleExpiryDateChange(product.product_code, date)}
                                                    dateFormat="MM/dd/yyyy"
                                                    customInput={<CustomInput />}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography sx={{ fontWeight: 'bold' }}>
                                                        {beginningQuantities[product.product_code] || 0}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
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
                                                <Typography sx={{ fontWeight: 'bold' }}>
                                                    {balanceQuantities[product.product_code] || 0}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={units[product.product_code] || ''}
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

                    {/* Summary Section */}
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

                    {/* Update Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleUpdate}
                        sx={{
                            mt: 2,
                            bgcolor: '#754C27',
                            color: '#FFFFFF',
                            height: '48px',
                            '&:hover': {
                                bgcolor: '#5c3c1f',
                            }
                        }}
                        disabled={!kitchenCode || products.length === 0}
                    >
                        Update Stock Adjustment
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}