import { Box, Button, InputAdornment, TextField, Typography, IconButton, Grid2, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../api/productrecordApi';
import { kitchenAll } from '../../../api/kitchenApi';
import { addKt_grf, Kt_grfrefno } from '../../../api/kitchen/kt_grfApi';
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
                    mt: '8px'
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

export default function CreateGoodsRequisition({ onBack }) {
    const dispatch = useDispatch();

    // Form data state
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('');
    const [kitchens, setKitchens] = useState([]);
    const [saveKitchen, setSaveKitchen] = useState('');

    // Product selection and search state
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Product details state
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [expiryDates, setExpiryDates] = useState({});
    const [temperatures, setTemperatures] = useState({});
    const [imageErrors, setImageErrors] = useState({});

    // Calculation state
    const [total, setTotal] = useState(0);

    // Loading state
    const [isLoadingRefNo, setIsLoadingRefNo] = useState(false);

    // User data
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson || "{}");

    // Initial data load
    useEffect(() => {
        // Load kitchens
        dispatch(kitchenAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((res) => {
                setKitchens(res.data || []);
            })
            .catch((err) => console.log(err?.message));

        // Initial product load for faster searching
        dispatch(searchProductName({ product_name: '' }))
            .unwrap()
            .then((res) => {
                if (res.data) {
                    setAllProducts(res.data);
                    setFilteredProducts(res.data);
                }
            })
            .catch((err) => console.log(err?.message));
    }, [dispatch]);

    // Handle filtering products based on search term
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
    }, [searchTerm, allProducts, selectedProducts]);

    // Generate reference number
    const handleGetLastRefNo = async (selectedDate, selectedKitchen) => {
        if (!selectedKitchen) {
            setLastRefNo('');
            return;
        }

        try {
            setIsLoadingRefNo(true);

            // Call the API to get a reference number
            const res = await dispatch(Kt_grfrefno({
                kitchen_code: selectedKitchen,
                date: format(selectedDate, 'yyyy-MM-dd')
            })).unwrap();

            if (res?.result && res?.data?.refno) {
                setLastRefNo(res.data.refno);
            } else {
                // Generate a fallback reference number using the kitchen prefix
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const year = selectedDate.getFullYear().toString().slice(-2);
                const kitchenPrefix = selectedKitchen.substring(0, 3).toUpperCase();
                setLastRefNo(`KTGRF${kitchenPrefix}${year}${month}001`);
            }
        } catch (err) {
            console.error("Error generating refno:", err);

            // Fallback with proper kitchen prefix
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);
            const kitchenPrefix = selectedKitchen.substring(0, 3).toUpperCase();
            setLastRefNo(`KTGRF${kitchenPrefix}${year}${month}001`);
        } finally {
            setIsLoadingRefNo(false);
        }
    };

    // Fixed handleProductSelect function
    const handleProductSelect = (product) => {
        // Check if product is already selected
        if (selectedProducts.includes(product.product_code)) {
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Product',
                text: `${product.product_name} is already in your requisition. Please adjust the quantity instead.`,
                confirmButtonColor: '#754C27'
            });
            setSearchTerm('');
            setShowDropdown(false);
            return;
        }

        // Set initial values
        const initialQuantity = 1;
        const initialUnitCode = product.productUnit1?.unit_code || '';
        const initialUnitPrice = product.bulk_unit_price || 0;
        const initialAmount = initialQuantity * initialUnitPrice;

        // Calculate immediate changes to total
        const newTotal = total + initialAmount;

        // Add product to selected products
        setSelectedProducts(prev => [...prev, product.product_code]);
        setProducts(prev => [...prev, product]);

        // Update all state objects with new values
        setQuantities(prev => ({ ...prev, [product.product_code]: initialQuantity }));
        setUnits(prev => ({ ...prev, [product.product_code]: initialUnitCode }));
        setUnitPrices(prev => ({ ...prev, [product.product_code]: initialUnitPrice }));
        setTotals(prev => ({ ...prev, [product.product_code]: initialAmount }));
        setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
        setTemperatures(prev => ({ ...prev, [product.product_code]: "38" }));

        // Update total
        setTotal(newTotal);

        // Reset search
        setSearchTerm('');
        setShowDropdown(false);
    };

    // Fixed handleQuantityChange function
    const handleQuantityChange = (productCode, value) => {
        const newQty = parseInt(value);
        if (isNaN(newQty) || newQty < 1) return;

        // Get current values before update
        const currentQty = quantities[productCode] || 1;
        const unitPrice = unitPrices[productCode] || 0;
        const oldAmount = totals[productCode] || 0;

        // Calculate new amount
        const newAmount = newQty * unitPrice;

        // Calculate change in total
        const difference = newAmount - oldAmount;
        const newTotal = total + difference;

        // Update state values
        setQuantities(prev => ({
            ...prev,
            [productCode]: newQty
        }));

        setTotals(prev => ({
            ...prev,
            [productCode]: newAmount
        }));

        // Update total directly
        setTotal(newTotal);
    };

    // Fixed handleUnitChange function
    const handleUnitChange = (productCode, newUnitCode) => {
        // Update units state
        setUnits(prev => ({
            ...prev,
            [productCode]: newUnitCode
        }));

        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        // Get current values
        const currentQty = quantities[productCode] || 1;
        const oldAmount = totals[productCode] || 0;

        // Determine the appropriate unit price based on the unit
        const newUnitPrice = newUnitCode === product.productUnit1?.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        // Calculate new amount
        const newAmount = currentQty * newUnitPrice;

        // Calculate change in total
        const difference = newAmount - oldAmount;
        const newTotal = total + difference;

        // Update unit prices and totals state
        setUnitPrices(prev => ({
            ...prev,
            [productCode]: newUnitPrice
        }));

        setTotals(prev => ({
            ...prev,
            [productCode]: newAmount
        }));

        // Update total directly
        setTotal(newTotal);
    };

    // Fixed handleUnitPriceChange function
    const handleUnitPriceChange = (productCode, value) => {
        const newPrice = parseFloat(value);
        if (isNaN(newPrice) || newPrice < 0) return;

        // Get current values
        const currentQty = quantities[productCode] || 1;
        const oldAmount = totals[productCode] || 0;

        // Calculate new amount
        const newAmount = currentQty * newPrice;

        // Calculate change in total
        const difference = newAmount - oldAmount;
        const newTotal = total + difference;

        // Update unit prices and totals state
        setUnitPrices(prev => ({
            ...prev,
            [productCode]: newPrice
        }));

        setTotals(prev => ({
            ...prev,
            [productCode]: newAmount
        }));

        // Update total directly
        setTotal(newTotal);
    };

    // Fixed handleDeleteProduct function
    const handleDeleteProduct = (productCode) => {
        // Get the amount for this product before deletion
        const productAmount = totals[productCode] || 0;

        // Remove product from products array
        setProducts(prev => prev.filter(p => p.product_code !== productCode));
        setSelectedProducts(prev => prev.filter(id => id !== productCode));

        // Remove from all state objects
        const { [productCode]: _, ...newQuantities } = quantities;
        const { [productCode]: __, ...newUnits } = units;
        const { [productCode]: ___, ...newPrices } = unitPrices;
        const { [productCode]: ____, ...newTotals } = totals;
        const { [productCode]: _____, ...newExpiryDates } = expiryDates;
        const { [productCode]: ______, ...newTemperatures } = temperatures;

        // Update all state objects
        setQuantities(newQuantities);
        setUnits(newUnits);
        setUnitPrices(newPrices);
        setTotals(newTotals);
        setExpiryDates(newExpiryDates);
        setTemperatures(newTemperatures);

        // Calculate and update the new total directly
        const newTotal = total - productAmount;
        setTotal(newTotal);
    };

    // Handle kitchen change
    const handleKitchenChange = (e) => {
        const kitchenCode = e.target.value;
        setSaveKitchen(kitchenCode);

        if (kitchenCode) {
            handleGetLastRefNo(startDate, kitchenCode);
        } else {
            setLastRefNo('');
        }
    };

    // Handle date change
    const handleDateChange = (date) => {
        setStartDate(date);
        if (saveKitchen) {
            handleGetLastRefNo(date, saveKitchen);
        }
    };

    // Calculate order totals
    const calculateOrderTotals = (currentProducts = products) => {
        let newTotals = {};
        let newTotal = 0;

        currentProducts.forEach(product => {
            const productCode = product.product_code;
            const quantity = quantities[productCode] || 1;
            const price = unitPrices[productCode] || (
                units[productCode] === product.productUnit1?.unit_code
                    ? product.bulk_unit_price
                    : product.retail_unit_price
            );
            const lineTotal = quantity * price;

            newTotals[productCode] = lineTotal;
            newTotal += lineTotal;
        });

        setTotals(newTotals);
        setTotal(newTotal);
    };

    // Render product image with error handling
    const renderProductImage = (product, size = 'small') => {
        if (!product?.product_img || imageErrors[product.product_code]) {
            return null;
        }

        const baseUrl = process.env.REACT_APP_URL_API || 'http://localhost:4001';
        const imageUrl = `${baseUrl}/public/images/${product.product_img}`;

        return (
            <Box sx={{
                width: '40px',
                height: '40px',
                position: 'relative',
                overflow: 'hidden',
                marginRight: '8px',
                display: 'inline-block'
            }}>
                <img
                    src={imageUrl}
                    alt={product.product_name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '4px'
                    }}
                    onError={() => {
                        setImageErrors(prev => ({
                            ...prev,
                            [product.product_code]: true
                        }));
                    }}
                />
            </Box>
        );
    };

    // Handle search input changes
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Handle Enter key for quick selection
        if (e.key === 'Enter' && value.trim() !== '') {
            // First try to find in already loaded products
            const exactMatch = allProducts.find(
                product => product.product_name.toLowerCase() === value.toLowerCase() ||
                    product.product_code.toLowerCase() === value.toLowerCase()
            );

            if (exactMatch) {
                handleProductSelect(exactMatch);
                return;
            }

            // If not found, search via API
            dispatch(searchProductName({ product_name: value }))
                .unwrap()
                .then((res) => {
                    if (res.data && res.data.length > 0) {
                        const exactApiMatch = res.data.find(
                            product => product.product_name.toLowerCase() === value.toLowerCase() ||
                                product.product_code.toLowerCase() === value.toLowerCase()
                        );
                        const selectedProduct = exactApiMatch || res.data[0];
                        handleProductSelect(selectedProduct);
                    }
                })
                .catch((err) => console.log(err?.message));
        } else if (value.length > 1) {
            // Filter from already loaded products
            const localResults = allProducts.filter(product =>
                product.product_name?.toLowerCase().includes(value.toLowerCase()) ||
                product.product_code?.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 10);

            if (localResults.length > 0) {
                setSearchResults(localResults);
                setShowDropdown(true);
            } else {
                // If no local results, search via API
                dispatch(searchProductName({ product_name: value }))
                    .unwrap()
                    .then((res) => {
                        if (res.data) {
                            setSearchResults(res.data);
                            setShowDropdown(true);
                        }
                    })
                    .catch((err) => console.log(err?.message));
            }
        } else {
            setSearchResults([]);
            setShowDropdown(false);
        }
    };

    // Handle expiry date change
    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({
            ...prev,
            [productCode]: date
        }));
    };

    // Handle temperature change
    const handleTemperatureChange = (productCode, temperature) => {
        // Make sure temperature is never an empty string
        const value = temperature.trim() === "" ? "38" : temperature;
        setTemperatures(prev => ({
            ...prev,
            [productCode]: value
        }));
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
        setLastRefNo('');
        setSearchTerm('');
        setExpiryDates({});
        setTemperatures({});
        setSearchResults([]);
        setShowDropdown(false);
    };

    // Handle save
    const handleSave = async () => {
        // Validate form
        if (!saveKitchen || !lastRefNo) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a kitchen first.',
                timer: 1500
            });
            return;
        }

        if (products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Products',
                text: 'Please add at least one product to the requisition.',
                timer: 1500
            });
            return;
        }

        try {
            Swal.fire({
                title: 'Saving requisition...',
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
                user_code: userData2?.user_code || '',
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
                texpire_date: format(expiryDates[product.product_code], 'yyyyMMdd'),
                temperature1: temperatures[product.product_code] || "38"
            }));

            // Prepare complete order data
            const orderData = {
                headerData,
                productArrayData,
                footerData: {
                    total: total.toString()
                }
            };

            // Submit the data
            await dispatch(addKt_grf(orderData)).unwrap();

            // Show success message
            await Swal.fire({
                icon: 'success',
                title: 'Created requisition successfully',
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
                text: error?.message || 'Error saving requisition',
                confirmButtonText: 'OK'
            });
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Button
                onClick={onBack}
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2, mr: 'auto' }}
            >
                Back to Internal Requisition
            </Button>
            <Box sx={{ width: '100%', mt: '10px', flexDirection: 'column' }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    border: '1px solid #E4E4E4',
                    borderRadius: '10px',
                    bgcolor: '#FFFFFF',
                    height: '100%',
                    p: '16px',
                    position: 'relative',
                    zIndex: 2,
                    mb: '50px'
                }}>
                    <Box sx={{ width: '90%', mt: '24px' }}>
                        <Grid2 container spacing={2}>
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Ref.no
                                </Typography>
                                <TextField
                                    value={isLoadingRefNo ? "Generating..." : (lastRefNo || "Please select kitchen first")}
                                    disabled
                                    size="small"
                                    placeholder='Ref.no'
                                    sx={{
                                        mt: '8px',
                                        width: '100%',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            fontWeight: '700'
                                        },
                                        '& .Mui-disabled': {
                                            WebkitTextFillColor: !lastRefNo ? '#d32f2f' : 'rgba(0, 0, 0, 0.38)',
                                        }
                                    }}
                                    InputProps={{
                                        endAdornment: isLoadingRefNo ? (
                                            <InputAdornment position="end">
                                                <span style={{ fontSize: '12px', color: '#757575' }}>Loading...</span>
                                            </InputAdornment>
                                        ) : null,
                                    }}
                                />
                            </Grid2>
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Date
                                </Typography>
                                <DatePicker
                                    selected={startDate}
                                    onChange={handleDateChange}
                                    dateFormat="MM/dd/yyyy"
                                    customInput={<CustomInput />}
                                />
                            </Grid2>
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Commissary Kitchen
                                </Typography>
                                <Box
                                    component="select"
                                    value={saveKitchen}
                                    onChange={handleKitchenChange}
                                    sx={{
                                        mt: '8px',
                                        width: '100%',
                                        height: '40px',
                                        borderRadius: '10px',
                                        padding: '0 14px',
                                        border: '1px solid rgba(0, 0, 0, 0.23)',
                                        fontSize: '16px',
                                        '&:focus': {
                                            outline: 'none',
                                            borderColor: '#754C27',
                                        },
                                        '& option': {
                                            fontSize: '16px',
                                        },
                                    }}
                                >
                                    <option value="">Select a Commissary Kitchen</option>
                                    {kitchens.map((kitchen) => (
                                        <option key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                                            {kitchen.kitchen_name}
                                        </option>
                                    ))}
                                </Box>
                            </Grid2>
                        </Grid2>

                        <Divider sx={{ mt: '24px' }} />

                        <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', p: '24px 0px' }}>
                            <Typography sx={{ fontSize: '20px', fontWeight: '600' }}>
                                Current Order
                            </Typography>
                            <Typography sx={{ ml: 'auto' }}>
                                Product Search
                            </Typography>
                            <Box sx={{ position: 'relative', width: '50%', ml: '12px' }}>
                                <TextField
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleSearchChange}
                                    placeholder="Search by name or code"
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '30px',
                                            width: '100%'
                                        },
                                        '& .MuiOutlinedInput-input': {
                                            padding: '8.5px 14px',
                                        },
                                        width: '100%'
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
                                                    borderBottom: '1px solid #eee',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                {renderProductImage(product)}
                                                <Box>
                                                    <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                                                        {product.product_name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                                        {product.product_code}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                            <Button
                                onClick={resetForm}
                                sx={{
                                    ml: 'auto',
                                    bgcolor: '#E2EDFB',
                                    borderRadius: '6px',
                                    width: '105px',
                                    '&:hover': {
                                        bgcolor: '#d0e0f7'
                                    }
                                }}
                            >
                                Clear All
                            </Button>
                        </Box>

                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}>
                            <table style={{ width: '100%', marginTop: '24px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '4px', fontSize: '14px', width: '1%', color: '#754C27', fontWeight: '800' }}>No.</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '15%', color: '#754C27', fontWeight: '800' }}>Product code</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '15%', color: '#754C27', fontWeight: '800' }}>Product name</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Expiry Date</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Temperature</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Quantity</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '10%', color: '#754C27', fontWeight: '800' }}>Unit</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Unit Price</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Total</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '1%', color: '#754C27', fontWeight: '800' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan="10" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                                No products added yet. Search and select products above.
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map((product, index) => {
                                            const productCode = product.product_code;
                                            const currentUnit = units[productCode] || product.productUnit1?.unit_code;
                                            const currentQuantity = quantities[productCode] || 1;
                                            const currentUnitPrice = unitPrices[productCode] !== undefined ?
                                                unitPrices[productCode] :
                                                (currentUnit === product.productUnit1?.unit_code
                                                    ? product.bulk_unit_price
                                                    : product.retail_unit_price);
                                            const currentTotal = totals[productCode]?.toFixed(2) || "0.00";

                                            return (
                                                <tr key={productCode}>
                                                    <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>{index + 1}</td>
                                                    <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>{productCode}</td>
                                                    <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>{product.product_name}</td>
                                                    <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                        <DatePicker
                                                            selected={expiryDates[productCode] || null}
                                                            onChange={(date) => handleExpiryDateChange(productCode, date)}
                                                            dateFormat="MM/dd/yyyy"
                                                            placeholderText="Select exp date"
                                                            customInput={
                                                                <input
                                                                    style={{
                                                                        width: '110px',
                                                                        padding: '4px',
                                                                        borderRadius: '4px',
                                                                        textAlign: 'center'
                                                                    }}
                                                                />
                                                            }
                                                        />
                                                    </td>
                                                    <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                        <input
                                                            type="text"
                                                            value={temperatures[productCode] || ""}
                                                            onChange={(e) => handleTemperatureChange(productCode, e.target.value)}
                                                            placeholder="Temperature"
                                                            style={{
                                                                width: '80px',
                                                                padding: '4px',
                                                                textAlign: 'center',
                                                                borderRadius: '4px'
                                                            }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={currentQuantity}
                                                            onChange={(e) => handleQuantityChange(productCode, e.target.value)}
                                                            style={{
                                                                width: '50px',
                                                                textAlign: 'center',
                                                                fontWeight: '600',
                                                                padding: '4px'
                                                            }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                        <select
                                                            value={currentUnit}
                                                            onChange={(e) => handleUnitChange(productCode, e.target.value)}
                                                            style={{
                                                                padding: '4px',
                                                                borderRadius: '4px'
                                                            }}
                                                        >
                                                            {product.productUnit1?.unit_code && (
                                                                <option value={product.productUnit1.unit_code}>
                                                                    {product.productUnit1.unit_name}
                                                                </option>
                                                            )}
                                                            {product.productUnit2?.unit_code && (
                                                                <option value={product.productUnit2.unit_code}>
                                                                    {product.productUnit2.unit_name}
                                                                </option>
                                                            )}
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={currentUnitPrice}
                                                            onChange={(e) => handleUnitPriceChange(productCode, e.target.value)}
                                                            style={{
                                                                width: '80px',
                                                                textAlign: 'right',
                                                                fontWeight: '600',
                                                                padding: '4px'
                                                            }}
                                                        />
                                                    </td>
                                                    <td style={{
                                                        padding: '4px', fontSize: '12px', textAlign: 'center',
                                                        fontWeight: '800'
                                                    }}>
                                                        {currentTotal}
                                                    </td>
                                                    <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                        <IconButton
                                                            onClick={() => handleDeleteProduct(productCode)}
                                                            size="small"
                                                        >
                                                            <CancelIcon />
                                                        </IconButton>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </Box>

                        <Box sx={{ width: '100%', height: 'auto', bgcolor: '#EAB86C', borderRadius: '10px', p: '18px' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: '8px' }}>
                                <Typography sx={{ color: '#FFFFFF', fontSize: '30px', fontWeight: '600' }}>
                                    Total
                                </Typography>
                                <Typography sx={{ color: '#FFFFFF', ml: 'auto', fontSize: '30px', fontWeight: '600' }}>
                                    ${total.toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>

                        <Button
                            onClick={handleSave}
                            disabled={!lastRefNo || products.length === 0}
                            sx={{
                                width: '100%',
                                height: '48px',
                                mt: '24px',
                                bgcolor: '#754C27',
                                color: '#FFFFFF',
                                '&:hover': {
                                    bgcolor: '#5C3D1F'
                                },
                                '&.Mui-disabled': {
                                    bgcolor: '#d3d3d3',
                                    color: '#808080'
                                }
                            }}>
                            Save
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};