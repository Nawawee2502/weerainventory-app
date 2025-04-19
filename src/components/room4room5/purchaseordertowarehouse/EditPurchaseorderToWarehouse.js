import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Typography, IconButton, Divider, InputAdornment,
    CircularProgress, Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../api/productrecordApi';
import { kitchenAll } from '../../../api/kitchenApi';
import { getKtPowByRefno, updateKt_pow } from '../../../api/kitchen/kt_powApi';
import { Kt_powdtAlljoindt } from '../../../api/kitchen/kt_powdtApi';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

// Custom DatePicker Input Component
const CustomDateInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
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

export default function EditPurchaseOrderWarehouse({ onBack, editRefno }) {
    const dispatch = useDispatch();

    // Form state
    const [startDate, setStartDate] = useState(new Date());
    const [kitchens, setKitchens] = useState([]);
    const [saveKitchen, setSaveKitchen] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [debugInfo, setDebugInfo] = useState({});

    // Product state
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [total, setTotal] = useState(0);
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Search state
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [allProducts, setAllProducts] = useState([]);

    // Additional product details
    const [imageErrors, setImageErrors] = useState({});

    // Get user data
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson || "{}");

    // Initial Data Loading
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                console.log('Fetching data for refno:', editRefno);

                // Load kitchens and products in parallel
                const [kitchenResponse, productsResponse] = await Promise.all([
                    dispatch(kitchenAll({ offset: 0, limit: 100 })).unwrap(),
                    dispatch(searchProductName({ product_name: '' })).unwrap()
                ]);

                if (kitchenResponse?.data) {
                    setKitchens(kitchenResponse.data);
                    console.log('Loaded kitchens:', kitchenResponse.data.length);
                }

                if (productsResponse?.data) {
                    setAllProducts(productsResponse.data);
                    console.log('Loaded all products:', productsResponse.data.length);
                }

                // Fetch purchase order data using getKtPowByRefno
                if (editRefno) {
                    console.log('Looking up with getKtPowByRefno for ref:', editRefno);
                    // Pass refno directly as a string, not as an object
                    const refno = typeof editRefno === 'object' ? editRefno.refno : editRefno;
                    const orderResponse = await dispatch(getKtPowByRefno(refno)).unwrap();
                    console.log('Response from getKtPowByRefno:', orderResponse);

                    if (orderResponse.result && orderResponse.data) {
                        // Set header info
                        const orderData = orderResponse.data;
                        console.log('Header data found:', orderData);
                        setDebugInfo({ headerData: orderData });

                        // Parse and set date
                        if (orderData.trdate && orderData.trdate.length === 8) {
                            const year = parseInt(orderData.trdate.substring(0, 4));
                            const month = parseInt(orderData.trdate.substring(4, 6)) - 1;
                            const day = parseInt(orderData.trdate.substring(6, 8));
                            setStartDate(new Date(year, month, day));
                        } else if (orderData.rdate) {
                            // Try to parse the date safely
                            try {
                                const dateParts = orderData.rdate.split('/');
                                if (dateParts.length === 3) {
                                    const month = parseInt(dateParts[0]) - 1;
                                    const day = parseInt(dateParts[1]);
                                    const year = parseInt(dateParts[2]);
                                    setStartDate(new Date(year, month, day));
                                } else {
                                    setStartDate(new Date());
                                }
                            } catch (e) {
                                console.error("Date parsing error:", e);
                                setStartDate(new Date());
                            }
                        }

                        setSaveKitchen(orderData.kitchen_code || '');
                        setTotal(parseFloat(orderData.total) || 0);

                        // Fetch detail data
                        const refno = typeof editRefno === 'object' ? editRefno.refno : editRefno;
                        const detailResponse = await dispatch(Kt_powdtAlljoindt({ refno: refno })).unwrap();
                        console.log('Detail response from Kt_powdtAlljoindt:', detailResponse);

                        if (detailResponse.result && detailResponse.data && detailResponse.data.length > 0) {
                            const detailData = detailResponse.data;
                            console.log('Detail data found:', detailData.length, 'items');
                            setDebugInfo(prev => ({ ...prev, detailData }));

                            // Process detail data
                            await processDetailData(detailData);
                        } else {
                            console.warn('No detail data found in Kt_powdtAlljoindt');
                            setDebugInfo(prev => ({ ...prev, detailError: 'No detail data found in Kt_powdtAlljoindt' }));
                        }
                    } else {
                        console.warn('No data found in getKtPowByRefno');
                        setDebugInfo(prev => ({ ...prev, error: 'No data found in getKtPowByRefno' }));
                    }
                } else {
                    console.warn('No editRefno provided');
                    setDebugInfo(prev => ({ ...prev, error: 'No editRefno provided' }));
                }
            } catch (error) {
                console.error('Error loading data:', error);
                setDebugInfo(prev => ({ ...prev, error: error.toString() }));
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load purchase order data: ' + error.message
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dispatch, editRefno]);

    // Fix for handleQuantityChange
    const handleQuantityChange = (productCode, newQuantityValue) => {
        const qty = parseInt(newQuantityValue);
        if (isNaN(qty) || qty < 1) return;

        // Update the quantities state
        const newQuantities = {
            ...quantities,
            [productCode]: qty
        };
        setQuantities(newQuantities);

        // Get the current product and calculate the new line total
        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        const currentUnitPrice = unitPrices[productCode] || 0;
        const newLineTotal = qty * currentUnitPrice;

        // Update totals state with the new line total
        const newTotals = {
            ...totals,
            [productCode]: newLineTotal
        };
        setTotals(newTotals);

        // Calculate the new order total immediately
        let newTotal = 0;
        products.forEach(p => {
            const pCode = p.product_code;
            if (pCode === productCode) {
                newTotal += newLineTotal;
            } else {
                newTotal += totals[pCode] || 0;
            }
        });

        setTotal(newTotal);
    };

    // Fix for handleUnitChange
    const handleUnitChange = (productCode, newUnitCode) => {
        // Update units state
        setUnits(prev => ({
            ...prev,
            [productCode]: newUnitCode
        }));

        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        // Determine the appropriate unit price based on the selected unit
        const defaultUnitPrice = newUnitCode === product.productUnit1?.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        // Update unit prices state
        const newUnitPrices = {
            ...unitPrices,
            [productCode]: defaultUnitPrice
        };
        setUnitPrices(newUnitPrices);

        // Calculate the new line total
        const currentQuantity = quantities[productCode] || 1;
        const newLineTotal = currentQuantity * defaultUnitPrice;

        // Update totals state
        const newTotals = {
            ...totals,
            [productCode]: newLineTotal
        };
        setTotals(newTotals);

        // Calculate the new order total immediately
        let newTotal = 0;
        products.forEach(p => {
            const pCode = p.product_code;
            if (pCode === productCode) {
                newTotal += newLineTotal;
            } else {
                newTotal += totals[pCode] || 0;
            }
        });

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

        // Calculate the new line total
        const currentQuantity = quantities[productCode] || 1;
        const newLineTotal = currentQuantity * newPrice;

        // Update totals state
        const newTotals = {
            ...totals,
            [productCode]: newLineTotal
        };
        setTotals(newTotals);

        // Calculate the new order total immediately
        let newTotal = 0;
        products.forEach(p => {
            const pCode = p.product_code;
            if (pCode === productCode) {
                newTotal += newLineTotal;
            } else {
                newTotal += totals[pCode] || 0;
            }
        });

        setTotal(newTotal);
    };

    // Also update the calculateTax function to be more immediate
    const calculateTax = () => {
        let taxableAmount = 0;
        products.forEach(product => {
            if (product.tax1 === 'Y') {
                const productCode = product.product_code;
                const amount = totals[productCode] || 0;
                taxableAmount += amount;
            }
        });
        return taxableAmount * 0.07;
    };

    // Process detail data
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

            detailData.forEach((item) => {
                const productCode = item.product_code;
                newQuantities[productCode] = parseFloat(item.qty) || 1;
                newUnits[productCode] = item.unit_code || item.tbl_product?.productUnit1?.unit_code || '';
                newUnitPrices[productCode] = parseFloat(item.uprice) || 0;
                newTotals[productCode] = parseFloat(item.amt) || 0;
            });

            // Update all states
            setQuantities(newQuantities);
            setUnits(newUnits);
            setUnitPrices(newUnitPrices);
            setTotals(newTotals);

            // Calculate and set total
            const totalSum = Object.values(newTotals).reduce((sum, value) => sum + value, 0);
            setTotal(totalSum);

        } catch (error) {
            console.error('Error processing detail data:', error);
            setDebugInfo(prev => ({ ...prev, processError: error.toString() }));
            throw error;
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

    // Function to render product image with error handling
    const renderProductImage = (product) => {
        // If this image has errored before or no image
        if (imageErrors[product.product_code] || !product?.product_img) {
            return null;
        }

        const baseUrl = process.env.REACT_APP_URL_API || 'http://localhost:4001';
        const imageUrl = `${baseUrl}/public/images/${product.product_img}`;

        return (
            <img
                src={imageUrl}
                alt={product.product_name}
                style={{ width: '30px', height: '30px', objectFit: 'cover', marginRight: '8px' }}
                onError={(e) => {
                    console.error('Image load error:', imageUrl);
                    setImageErrors(prev => ({
                        ...prev,
                        [product.product_code]: true
                    }));
                }}
            />
        );
    };

    // Toggle select product function for product search
    const handleProductSelect = (product) => {
        // Check if product is already in the list
        if (selectedProducts.includes(product.product_code)) {
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

        // Add to selected products
        setSelectedProducts(prev => [...prev, product.product_code]);
        setProducts(prev => [...prev, product]);

        // Initialize product data
        setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
        setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1?.unit_code || '' }));
        setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price || 0 }));

        // Reset search and calculate totals
        setSearchTerm('');
        setShowDropdown(false);
        calculateOrderTotals([...products, product]);
    };

    // Handle search input changes
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Handle Enter key for quick selection
        if (e.key === 'Enter' && value.trim() !== '') {
            // First try to find in already loaded products
            const exactMatch = allProducts.find(
                product => product.product_name?.toLowerCase() === value.toLowerCase() ||
                    product.product_code?.toLowerCase() === value.toLowerCase()
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
                            product => product.product_name?.toLowerCase() === value.toLowerCase() ||
                                product.product_code?.toLowerCase() === value.toLowerCase()
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

    // Add +/- button handlers
    const handleQuantityIncrease = (productCode) => {
        const currentQty = quantities[productCode] || 1;
        handleQuantityChange(productCode, currentQty + 1);
    };

    const handleQuantityDecrease = (productCode) => {
        const currentQty = quantities[productCode] || 1;
        if (currentQty > 1) {
            handleQuantityChange(productCode, currentQty - 1);
        }
    };


    // Handle product deletion
    const handleDeleteProduct = (productCode) => {
        setProducts(prev => prev.filter(p => p.product_code !== productCode));
        setSelectedProducts(prev => prev.filter(id => id !== productCode));

        // Clean up associated state
        const { [productCode]: _, ...newQuantities } = quantities;
        const { [productCode]: __, ...newUnits } = units;
        const { [productCode]: ___, ...newPrices } = unitPrices;
        const { [productCode]: ____, ...newTotals } = totals;

        setQuantities(newQuantities);
        setUnits(newUnits);
        setUnitPrices(newPrices);
        setTotals(newTotals);

        calculateOrderTotals(products.filter(p => p.product_code !== productCode));
    };

    // Reset form
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

    // Debug button to show current state
    const showDebugInfo = () => {
        console.log('Debug Info:', {
            editRefno,
            headerInfo: debugInfo.headerData,
            detailInfo: debugInfo.detailData,
            products,
            selectedProducts,
            quantities,
            units,
            unitPrices,
            error: debugInfo.error
        });

        Swal.fire({
            title: 'Debug Information',
            html: `
                <div style="text-align: left; max-height: 400px; overflow-y: auto;">
                    <p><strong>Edit RefNo:</strong> ${editRefno}</p>
                    <p><strong>Selected Products:</strong> ${selectedProducts.length}</p>
                    <p><strong>Products Array:</strong> ${products.length}</p>
                    <p><strong>Kitchen:</strong> ${saveKitchen}</p>
                    <p><strong>Total:</strong> ${total}</p>
                    <p><strong>Error:</strong> ${debugInfo.error || debugInfo.detailError || debugInfo.processError || 'None'}</p>
                    <hr/>
                    <p><strong>Header Data:</strong></p>
                    <pre style="font-size: 11px;">${JSON.stringify(debugInfo.headerData, null, 2)}</pre>
                    <hr/>
                    <p><strong>Detail Data (${debugInfo.detailData?.length || 0} items):</strong></p>
                    <pre style="font-size: 11px;">${JSON.stringify(debugInfo.detailData?.slice(0, 3), null, 2)}</pre>
                </div>
            `,
            width: 800,
        });
    };

    // Handle form submission (update)
    const handleUpdate = async () => {
        if (!saveKitchen || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a kitchen and add at least one product.',
                timer: 1500
            });
            return;
        }

        try {
            Swal.fire({
                title: 'Updating purchase order...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            // Calculate tax amounts
            let taxableAmount = 0;
            let nontaxableAmount = 0;

            products.forEach(product => {
                const productCode = product.product_code;
                const amount = totals[productCode] || 0;
                if (product.tax1 === 'Y') {
                    taxableAmount += amount;
                } else {
                    nontaxableAmount += amount;
                }
            });

            const headerData = {
                refno: editRefno,
                rdate: format(startDate, 'MM/dd/yyyy'),
                kitchen_code: saveKitchen,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                taxable: taxableAmount.toString(),
                nontaxable: nontaxableAmount.toString(),
                user_code: userData2.user_code || '',
                total: total.toString()
            };

            const productArrayData = products.map(product => ({
                refno: headerData.refno,
                product_code: product.product_code,
                qty: (quantities[product.product_code] || 1).toString(),
                unit_code: units[product.product_code] || product.productUnit1?.unit_code || '',
                uprice: (unitPrices[product.product_code] || 0).toString(),
                amt: (totals[product.product_code] || 0).toString()
            }));

            const payload = {
                headerData: headerData,
                productArrayData: productArrayData,
                footerData: {
                    total: total.toString()
                }
            };

            console.log("Sending update with payload:", payload);

            try {
                const response = await dispatch(updateKt_pow(payload)).unwrap();
                console.log("Update response:", response);

                await Swal.fire({
                    icon: 'success',
                    title: 'Updated purchase order successfully',
                    text: `Reference No: ${editRefno}`,
                    showConfirmButton: false,
                    timer: 1500
                });

                onBack();
            } catch (apiError) {
                console.error('Update API Error:', apiError);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: apiError.message || 'Error updating purchase order',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Update error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error updating purchase order',
                confirmButtonText: 'OK'
            });
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: '#754C27' }} />
                <Typography sx={{ ml: 2 }}>Loading purchase order data...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button
                    onClick={onBack}
                    startIcon={<ArrowBackIcon />}
                >
                    Back to Purchase Order
                </Button>
                <Button
                    variant="outlined"
                    color="warning"
                    onClick={showDebugInfo}
                    size="small"
                >
                    Debug Info
                </Button>
            </Box>
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
                        {/* Header Section */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Ref.no
                                </Typography>
                                <TextField
                                    value={editRefno}
                                    disabled
                                    size="small"
                                    placeholder='Ref.no'
                                    sx={{
                                        mt: '8px',
                                        width: '100%',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            fontWeight: '700'
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Date
                                </Typography>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    dateFormat="MM/dd/yyyy"
                                    customInput={<CustomDateInput />}
                                />
                            </Grid>
                            {/* Kitchen Section */}
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Commissary Kitchen
                                </Typography>
                                <Box
                                    component="select"
                                    value={saveKitchen}
                                    onChange={(e) => setSaveKitchen(e.target.value)}
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
                            </Grid>
                        </Grid>

                        <Divider sx={{ mt: '24px' }} />

                        <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', p: '24px 0px' }}>
                            <Typography sx={{ fontSize: '20px', fontWeight: '600' }}>
                                Current Purchase Order
                            </Typography>
                            <Typography sx={{ ml: 'auto' }}>
                                Product Search
                            </Typography>
                            <Box sx={{ position: 'relative', width: '50%', ml: '12px' }}>
                                <TextField
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleSearchChange}
                                    placeholder="Search by product name or code"
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
                                                    <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
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
                                Reset
                            </Button>
                        </Box>

                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}>
                            <table style={{ width: '100%', marginTop: '24px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '4px', fontSize: '14px', width: '1%', color: '#754C27', fontWeight: '800' }}>No.</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '15%', color: '#754C27', fontWeight: '800' }}>Product code</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '25%', color: '#754C27', fontWeight: '800' }}>Product name</th>
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
                                            <td colSpan={8} style={{ textAlign: 'center', padding: '16px', color: '#666' }}>
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
                                            const currentTotal = totals[productCode]?.toFixed(2) || '0.00';

                                            return (
                                                <tr key={productCode}>
                                                    <td style={{ padding: '4px', fontSize: '12px', fontWeight: '800' }}>{index + 1}</td>
                                                    <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>{productCode}</td>
                                                    <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {renderProductImage(product)}
                                                            {product.product_name}
                                                        </Box>
                                                    </td>
                                                    <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <IconButton
                                                                onClick={() => handleQuantityDecrease(productCode)}
                                                                size="small"
                                                                sx={{ fontSize: '14px', padding: '2px' }}
                                                            >
                                                                -
                                                            </IconButton>
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
                                                            <IconButton
                                                                onClick={() => handleQuantityIncrease(productCode)}
                                                                size="small"
                                                                sx={{ fontSize: '14px', padding: '2px' }}
                                                            >
                                                                +
                                                            </IconButton>
                                                        </Box>
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
                                                    <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
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
                            <Box sx={{ display: 'flex', flexDirection: 'column', color: 'white' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>Subtotal</Typography>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>${total.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>Tax (7%)</Typography>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>${calculateTax().toFixed(2)}</Typography>
                                </Box>
                                <Divider sx={{ my: 1, bgcolor: 'rgba(255, 255, 255, 0.3)' }} />
                                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: '8px' }}>
                                    <Typography sx={{ color: '#FFFFFF', fontSize: '30px', fontWeight: '600' }}>
                                        Total
                                    </Typography>
                                    <Typography sx={{ color: '#FFFFFF', ml: 'auto', fontSize: '30px', fontWeight: '600' }}>
                                        ${(total + calculateTax()).toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Button
                            onClick={handleUpdate}
                            disabled={!saveKitchen || products.length === 0}
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
                            Update Purchase Order
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}