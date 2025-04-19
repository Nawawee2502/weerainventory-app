import { Box, Button, InputAdornment, TextField, Typography, IconButton, Grid2, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../api/productrecordApi';
import {
    addKt_pow,
    kt_powRefno
} from '../../../api/kitchen/kt_powApi';
import { kitchenAll } from '../../../api/kitchenApi';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Swal from 'sweetalert2';

const convertToLasVegasTime = (date) => {
    if (!date) return new Date();

    // Create a new date object and set to midnight in local time
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);

    // Return this date without timezone conversion
    return newDate;
};

const formatDate = (date) => {
    if (!date) return "";
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

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

export default function CreatePurchaseOrderToWinery({ onBack }) {
    const dispatch = useDispatch();
    const [selected, setSelected] = useState([]);
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('');
    const [kitchens, setKitchens] = useState([]);
    const [saveKitchen, setSaveKitchen] = useState('');
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [taxableAmount, setTaxableAmount] = useState(0);
    const [nonTaxableAmount, setNonTaxableAmount] = useState(0);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const TAX_RATE = 0.07;
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = userDataJson ? JSON.parse(userDataJson) : null;

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsLoading(true);

                // เฉพาะโหลด Kitchen เท่านั้น ยังไม่ generate RefNo
                await loadKitchens();

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
    }, []);

    const loadKitchens = async () => {
        try {
            const response = await dispatch(kitchenAll({ offset: 0, limit: 100 })).unwrap();
            setKitchens(response.data || []);
        } catch (err) {
            console.error('Error loading kitchens:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error Loading Kitchens',
                text: err.message || 'Failed to load kitchens',
                confirmButtonColor: '#754C27'
            });
        }
    };

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
                const newRefNo = `KPOW${year}${month}001`;
                setLastRefNo(newRefNo);
            }
        } catch (err) {
            console.error("Error generating refno:", err);

            if (!selectedKitchen) {
                setLastRefNo('');
                return;
            }

            // Fallback with local generation
            const year = selectedDate.getFullYear().toString().slice(-2);
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const newRefNo = `KPOW${year}${month}001`;
            setLastRefNo(newRefNo);
        }
    };

    // Fix for handleQuantityChange
    const handleQuantityChange = (productCode, value) => {
        const newValue = parseInt(value);
        if (isNaN(newValue) || newValue < 1) return;

        // Update the quantities state
        const newQuantities = {
            ...quantities,
            [productCode]: newValue
        };
        setQuantities(newQuantities);

        // Get the current product and other needed values
        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        const unitPrice = unitPrices[productCode] || 0;

        // Calculate the new line total
        const newLineTotal = newValue * unitPrice;

        // Update the totals state with all current values plus the new line total
        const newTotals = {
            ...totals,
            [productCode]: newLineTotal
        };
        setTotals(newTotals);

        // Calculate new order totals immediately with the updated values
        let newTaxable = 0;
        let newNonTaxable = 0;
        let newTotal = 0;

        products.forEach(p => {
            const pCode = p.product_code;
            const pQuantity = pCode === productCode ? newValue : (quantities[pCode] || 1);
            const pUnitPrice = unitPrices[pCode] || 0;
            const pAmount = pCode === productCode ? newLineTotal : (totals[pCode] || 0);

            if (p.tax1 === 'Y') {
                newTaxable += pAmount;
            } else {
                newNonTaxable += pAmount;
            }

            newTotal += pAmount;
        });

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setTotal(newTotal);
    };

    // Fix for handleUnitChange
    const handleUnitChange = (productCode, newUnit) => {
        // Update the units state
        setUnits(prev => ({
            ...prev,
            [productCode]: newUnit
        }));

        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        // Update price based on the unit
        const newPrice = newUnit === product.productUnit1?.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        // Update unit prices state
        const newUnitPrices = {
            ...unitPrices,
            [productCode]: newPrice
        };
        setUnitPrices(newUnitPrices);

        // Update total for this product
        const quantity = quantities[productCode] || 1;
        const newLineTotal = quantity * newPrice;

        // Update totals state
        const newTotals = {
            ...totals,
            [productCode]: newLineTotal
        };
        setTotals(newTotals);

        // Calculate new order totals immediately
        let newTaxable = 0;
        let newNonTaxable = 0;
        let newTotal = 0;

        products.forEach(p => {
            const pCode = p.product_code;
            const pAmount = pCode === productCode ? newLineTotal : (totals[pCode] || 0);

            if (p.tax1 === 'Y') {
                newTaxable += pAmount;
            } else {
                newNonTaxable += pAmount;
            }

            newTotal += pAmount;
        });

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setTotal(newTotal);
    };

    // Fix for handleUnitPriceChange
    const handleUnitPriceChange = (productCode, value) => {
        const newPrice = parseFloat(value);
        if (isNaN(newPrice) || newPrice < 0) return;

        // Update unit prices state
        const newUnitPrices = {
            ...unitPrices,
            [productCode]: newPrice
        };
        setUnitPrices(newUnitPrices);

        // Update total for this product
        const quantity = quantities[productCode] || 1;
        const newLineTotal = quantity * newPrice;

        // Update totals state
        const newTotals = {
            ...totals,
            [productCode]: newLineTotal
        };
        setTotals(newTotals);

        // Calculate new order totals immediately
        let newTaxable = 0;
        let newNonTaxable = 0;
        let newTotal = 0;

        products.forEach(p => {
            const pCode = p.product_code;
            const pAmount = pCode === productCode ? newLineTotal : (totals[pCode] || 0);

            if (p.tax1 === 'Y') {
                newTaxable += pAmount;
            } else {
                newNonTaxable += pAmount;
            }

            newTotal += pAmount;
        });

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setTotal(newTotal);
    };

    // Improved handleSearchChange with debounce
    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (e.key === 'Enter' && value.trim() !== '') {
            await searchProduct(value);
            return;
        }

        if (value.length > 0) {
            try {
                const response = await dispatch(searchProductName({ product_name: value })).unwrap();
                if (response.data) {
                    const sortedResults = [...response.data].sort((a, b) => {
                        const aExact = a.product_name.toLowerCase() === value.toLowerCase();
                        const bExact = b.product_name.toLowerCase() === value.toLowerCase();
                        if (aExact && !bExact) return -1;
                        if (!aExact && bExact) return 1;
                        return a.product_name.length - b.product_name.length;
                    });
                    setSearchResults(sortedResults);
                    setShowDropdown(true);
                }
            } catch (err) {
                console.error('Error searching products:', err);
            }
        } else {
            setSearchResults([]);
            setShowDropdown(false);
        }
    };

    // Search product by name or code
    const searchProduct = async (term) => {
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

    const handleProductSelect = (product) => {
        // Check if product already exists in the list
        if (products.some(p => p.product_code === product.product_code)) {
            // Show warning with better styling and more helpful message
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Product',
                text: `${product.product_name} is already in your purchase order. Please adjust the quantity instead.`,
                confirmButtonColor: '#754C27'
            });
            setSearchTerm('');
            setShowDropdown(false);
            return;
        }

        setSearchTerm('');
        setShowDropdown(false);

        const newProducts = [...products, product];
        setProducts(newProducts);

        const initialQuantity = 1;
        const initialUnitCode = product.productUnit1.unit_code;
        const initialUnitPrice = product.productUnit1.unit_code === initialUnitCode
            ? product.bulk_unit_price
            : product.retail_unit_price;

        const initialAmount = initialQuantity * initialUnitPrice;
        const newTaxable = product.tax1 === 'Y' ? initialAmount : 0;
        const newNonTaxable = product.tax1 === 'Y' ? 0 : initialAmount;

        setTaxableAmount(prev => prev + newTaxable);
        setNonTaxableAmount(prev => prev + newNonTaxable);
        setTotal(prev => prev + initialAmount);

        setQuantities(prev => ({
            ...prev,
            [product.product_code]: initialQuantity
        }));
        setUnits(prev => ({
            ...prev,
            [product.product_code]: initialUnitCode
        }));
        setUnitPrices(prev => ({
            ...prev,
            [product.product_code]: initialUnitPrice
        }));
        setTotals(prev => ({
            ...prev,
            [product.product_code]: initialAmount
        }));
    };

    const calculateProductTotal = (productCode, quantity, unitPrice, tax1) => {
        const amount = quantity * unitPrice;
        setTotals(prev => {
            const newTotals = {
                ...prev,
                [productCode]: amount
            };

            // Calculate order totals immediately after updating totals
            let newTaxable = 0;
            let newNonTaxable = 0;

            products.forEach(product => {
                const total = newTotals[product.product_code] || 0;
                if (product.tax1 === 'Y') {
                    newTaxable += total;
                } else {
                    newNonTaxable += total;
                }
            });

            setTaxableAmount(newTaxable);
            setNonTaxableAmount(newNonTaxable);
            setTotal(newTaxable + newNonTaxable);

            return newTotals;
        });
    };

    const calculateOrderTotals = () => {
        let newTaxable = 0;
        let newNonTaxable = 0;
        let newTotal = 0;

        products.forEach(product => {
            const productCode = product.product_code;
            const quantity = quantities[productCode] || 1;
            const unitPrice = unitPrices[productCode] || 0;
            const amount = quantity * unitPrice;

            if (product.tax1 === 'Y') {
                newTaxable += amount;
            } else {
                newNonTaxable += amount;
            }

            newTotal += amount;
        });

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setTotal(newTotal);
    };

    const handleDeleteProduct = (productCode) => {
        setProducts(prev => prev.filter(p => p.product_code !== productCode));
        const newQuantities = { ...quantities };
        const newUnits = { ...units };
        const newUnitPrices = { ...unitPrices };
        const newTotals = { ...totals };

        delete newQuantities[productCode];
        delete newUnits[productCode];
        delete newUnitPrices[productCode];
        delete newTotals[productCode];

        setQuantities(newQuantities);
        setUnits(newUnits);
        setUnitPrices(newUnitPrices);
        setTotals(newTotals);

        calculateOrderTotals();
    };

    const handleSave = async () => {
        if (!saveKitchen) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a kitchen',
                confirmButtonColor: '#754C27'
            });
            return;
        }

        if (products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Products',
                text: 'Please add at least one product',
                confirmButtonColor: '#754C27'
            });
            return;
        }

        try {
            Swal.fire({
                title: 'Saving...',
                text: 'Creating purchase order',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const headerData = {
                refno: lastRefNo,
                rdate: formatDate(startDate),
                kitchen_code: saveKitchen,
                trdate: `${startDate.getFullYear()}${String(startDate.getMonth() + 1).padStart(2, '0')}${String(startDate.getDate()).padStart(2, '0')}`,
                monthh: String(startDate.getMonth() + 1).padStart(2, '0'),
                myear: startDate.getFullYear().toString(),
                user_code: userData2?.user_code,
                taxable: taxableAmount,
                nontaxable: nonTaxableAmount
            };

            const productArrayData = products.map(product => ({
                refno: lastRefNo,
                product_code: product.product_code,
                qty: quantities[product.product_code].toString(),
                unit_code: units[product.product_code],
                uprice: unitPrices[product.product_code].toString(),
                tax1: product.tax1,
                amt: totals[product.product_code].toString()
            }));

            const result = await dispatch(addKt_pow({
                headerData,
                productArrayData,
                footerData: {
                    total
                }
            })).unwrap();

            if (result.result) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Purchase order created successfully',
                    confirmButtonColor: '#754C27'
                });
                resetForm();
                onBack();
            }
        } catch (error) {
            console.error('Error saving POW:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to create purchase order',
                confirmButtonColor: '#754C27'
            });
        }
    };

    const resetForm = async () => {
        setProducts([]);
        setQuantities({});
        setUnits({});
        setUnitPrices({});
        setTotals({});
        setSaveKitchen('');
        setTaxableAmount(0);
        setNonTaxableAmount(0);
        setTotal(0);
        setLastRefNo('');
    };

    const handleDateChange = (date) => {
        if (!date) return;
        const vegasDate = convertToLasVegasTime(date);
        setStartDate(vegasDate);

        // Generate refno again only if kitchen is already selected
        if (saveKitchen) {
            handleGetLastRefNo(vegasDate, saveKitchen);
        }
    };

    const handleKitchenChange = (e) => {
        const newKitchenCode = e.target.value;
        setSaveKitchen(newKitchenCode);

        // Generate refno only when kitchen is selected
        if (newKitchenCode) {
            handleGetLastRefNo(startDate, newKitchenCode);
        } else {
            // Clear refno when kitchen is deselected
            setLastRefNo('');
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Button
                onClick={onBack}
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2 }}
            >
                Back to Purchase Orders
            </Button>

            <Box sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E4E4E4',
                p: 3
            }}>
                <Grid2 container spacing={2}>
                    {/* Reference Number */}
                    <Grid2 item size={{ xs: 12, md: 6 }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Ref.no
                        </Typography>
                        <TextField
                            value={lastRefNo || "Please select kitchen first"}
                            disabled
                            size="small"
                            sx={{
                                mt: 1,
                                width: '100%',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    fontWeight: '700'
                                },
                                '& .Mui-disabled': {
                                    WebkitTextFillColor: !lastRefNo ? '#d32f2f' : 'rgba(0, 0, 0, 0.38)',
                                }
                            }}
                        />
                    </Grid2>

                    {/* Date */}
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

                    {/* Kitchen Selection */}
                    <Grid2 item size={{ xs: 12, md: 6 }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Kitchen
                        </Typography>
                        <Box
                            component="select"
                            value={saveKitchen}
                            onChange={handleKitchenChange}
                            sx={{
                                mt: 1,
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
                            }}
                        >
                            <option value="">Select Kitchen</option>
                            {kitchens.map((kitchen) => (
                                <option key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                                    {kitchen.kitchen_name}
                                </option>
                            ))}
                        </Box>
                    </Grid2>
                </Grid2>

                <Divider sx={{ my: 3 }} />

                {/* Product Search Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontSize: '20px', fontWeight: '600' }}>
                        Current Order
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', ml: 4 }}>
                        <Typography sx={{ mr: 2 }}>
                            Product Search
                        </Typography>
                        <Box sx={{ position: 'relative', flex: 1 }}>
                            <TextField
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        searchProduct(searchTerm);
                                    }
                                }}
                                placeholder="Search products..."
                                size="small"
                                fullWidth
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
                                    bgcolor: 'background.paper',
                                    boxShadow: 3,
                                    borderRadius: 1,
                                    zIndex: 1000,
                                    maxHeight: 200,
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
                                                borderColor: 'divider'
                                            }}
                                        >
                                            <Typography variant="body2">{product.product_name}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Products Table */}
                <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>No.</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>Product Code</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>Product Name</th>
                                <th style={{ padding: '12px', textAlign: 'right', color: '#754C27', backgroundColor: '#f5f5f5' }}>Quantity</th>
                                <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Unit</th>
                                <th style={{ padding: '12px', textAlign: 'right', color: '#754C27', backgroundColor: '#f5f5f5' }}>Unit Price</th>
                                <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Tax</th>
                                <th style={{ padding: '12px', textAlign: 'right', color: '#754C27', backgroundColor: '#f5f5f5' }}>Total</th>
                                <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>
                                        No products added yet. Search and add products to your order.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product, index) => (
                                    <tr key={product.product_code}>
                                        <td style={{ padding: '12px' }}>{index + 1}</td>
                                        <td style={{ padding: '12px' }}>{product.product_code}</td>
                                        <td style={{ padding: '12px' }}>{product.product_name}</td>
                                        <td style={{ padding: '12px' }}>
                                            <input
                                                type="number"
                                                min="1"
                                                value={quantities[product.product_code] || 1}
                                                onChange={(e) => handleQuantityChange(product.product_code, e.target.value)}
                                                style={{
                                                    width: '60px',
                                                    padding: '4px',
                                                    textAlign: 'right'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <select
                                                value={units[product.product_code] || product.productUnit1?.unit_code}
                                                onChange={(e) => handleUnitChange(product.product_code, e.target.value)}
                                                style={{
                                                    padding: '4px',
                                                    width: '100px'
                                                }}
                                            >
                                                <option value={product.productUnit1.unit_code}>
                                                    {product.productUnit1.unit_name}
                                                </option>
                                                <option value={product.productUnit2.unit_code}>
                                                    {product.productUnit2.unit_name}
                                                </option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={unitPrices[product.product_code] || 0}
                                                onChange={(e) => handleUnitPriceChange(product.product_code, e.target.value)}
                                                style={{
                                                    width: '100px',
                                                    padding: '4px',
                                                    textAlign: 'right'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            {product.tax1 === 'Y' ? 'Yes' : 'No'}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            {(totals[product.product_code] || 0).toFixed(2)}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <IconButton
                                                onClick={() => handleDeleteProduct(product.product_code)}
                                                size="small"
                                                sx={{ color: 'error.main' }}
                                            >
                                                <CancelIcon />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Box>

                {/* Totals Section */}
                <Box sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: '#EAB86C',
                    borderRadius: '10px',
                    color: 'white'
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Taxable</Typography>
                        <Typography>${taxableAmount.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography>Non-taxable</Typography>
                        <Typography>${nonTaxableAmount.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h5" fontWeight="bold">Total</Typography>
                        <Typography variant="h5" fontWeight="bold">${total.toFixed(2)}</Typography>
                    </Box>
                </Box>

                {/* Save Button */}
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={!lastRefNo || products.length === 0}
                    fullWidth
                    sx={{
                        mt: 2,
                        bgcolor: '#754C27',
                        color: 'white',
                        '&:hover': {
                            bgcolor: '#5A3D1E',
                        },
                        height: '48px'
                    }}
                >
                    Save
                </Button>
            </Box>
        </Box>
    );
}