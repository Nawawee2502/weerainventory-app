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
import { updateKt_grf, getKtGrfByRefno } from '../../../api/kitchen/kt_grfApi';
import { Kt_grfdtAlljoindt } from '../../../api/kitchen/kt_grfdtApi';
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

export default function EditGoodsRequisition({ onBack, editRefno }) {
    const dispatch = useDispatch();

    // Form data state
    const [requisitionDate, setRequisitionDate] = useState(new Date());
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
    const [isLoading, setIsLoading] = useState(true);

    // User data
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson || "{}");

    // Initial data load
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Load kitchens
                const kitchenResponse = await dispatch(kitchenAll({ offset: 0, limit: 100 })).unwrap();
                if (kitchenResponse.result && kitchenResponse.data) {
                    setKitchens(kitchenResponse.data || []);
                }

                // Load all products for faster searching
                const productResponse = await dispatch(searchProductName({ product_name: '' })).unwrap();
                if (productResponse.result && productResponse.data) {
                    setAllProducts(productResponse.data || []);
                }

                // Load the requisition data
                if (editRefno) {
                    await loadRequisitionData();
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load initial data: ' + error.message
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dispatch, editRefno]);

    // Load requisition data
    const loadRequisitionData = async () => {
        try {
            console.log('Loading requisition data for:', editRefno);

            // แก้ไขตรงนี้ - ดึง string refno ก่อนส่งไปที่ API
            const refnoString = typeof editRefno === 'object' ? editRefno.refno : editRefno;
            console.log('Using refno:', refnoString);

            // Get requisition header data - ส่ง refnoString แทน object
            const headerResponse = await dispatch(getKtGrfByRefno(refnoString)).unwrap();

            if (headerResponse.result && headerResponse.data) {
                const requisitionData = headerResponse.data;
                setLastRefNo(requisitionData.refno || '');

                // Parse and set date
                if (requisitionData.trdate && requisitionData.trdate.length === 8) {
                    const year = parseInt(requisitionData.trdate.substring(0, 4));
                    const month = parseInt(requisitionData.trdate.substring(4, 6)) - 1;
                    const day = parseInt(requisitionData.trdate.substring(6, 8));
                    setRequisitionDate(new Date(year, month, day));
                } else if (requisitionData.rdate) {
                    try {
                        const dateParts = requisitionData.rdate.split('/');
                        if (dateParts.length === 3) {
                            const month = parseInt(dateParts[0]) - 1;
                            const day = parseInt(dateParts[1]);
                            const year = parseInt(dateParts[2]);
                            setRequisitionDate(new Date(year, month, day));
                        }
                    } catch (e) {
                        console.error("Date parsing error:", e);
                        setRequisitionDate(new Date());
                    }
                }

                setSaveKitchen(requisitionData.kitchen_code || '');

                // Set total
                setTotal(parseFloat(requisitionData.total) || 0);
            }

            // Get requisition detail data - ส่ง refnoString แทน object เช่นกัน
            const detailResponse = await dispatch(Kt_grfdtAlljoindt(refnoString)).unwrap();

            if (detailResponse.result && detailResponse.data && detailResponse.data.length > 0) {
                await processDetailData(detailResponse.data);
            }

        } catch (error) {
            console.error('Error loading requisition data:', error);
            throw error;
        }
    };

    // Process detail data
    const processDetailData = async (detailData) => {
        try {
            // Extract product codes and mark as selected
            const productCodes = detailData.map(item => item.product_code);
            setSelectedProducts(productCodes);

            // Build products array from detail data
            const productsData = detailData.map(item => ({
                ...item.tbl_product,
                product_code: item.product_code,
                product_name: item.tbl_product?.product_name || item.product_name
            }));

            setProducts(productsData);

            // Initialize state objects for each product
            const newQuantities = {};
            const newUnits = {};
            const newUnitPrices = {};
            const newTotals = {};
            const newExpiryDates = {};
            const newTemperatures = {};

            // Add each product's data to respective state objects
            detailData.forEach((item) => {
                const productCode = item.product_code;

                // Quantities
                newQuantities[productCode] = parseFloat(item.qty) || 1;

                // Units
                newUnits[productCode] = item.unit_code || item.tbl_product?.productUnit1?.unit_code || '';

                // Prices
                newUnitPrices[productCode] = parseFloat(item.uprice) || 0;

                // Totals
                newTotals[productCode] = parseFloat(item.amt) || 0;

                // Temperature
                newTemperatures[productCode] = item.temperature1 || '38';

                // Parse expiry date
                if (item.texpire_date && item.texpire_date.length === 8) {
                    const year = parseInt(item.texpire_date.substring(0, 4));
                    const month = parseInt(item.texpire_date.substring(4, 6)) - 1;
                    const day = parseInt(item.texpire_date.substring(6, 8));
                    newExpiryDates[productCode] = new Date(year, month, day);
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
            setTemperatures(newTemperatures);

            // Calculate totals
            calculateOrderTotals(productsData, newQuantities, newUnitPrices);

        } catch (error) {
            console.error('Error processing detail data:', error);
            throw error;
        }
    };

    // Handle product selection
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

        // Add product to selected products
        setSelectedProducts(prev => [...prev, product.product_code]);
        setProducts(prev => [...prev, product]);

        // Initialize product data
        setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
        setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1?.unit_code || '' }));
        setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price || 0 }));
        setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
        setTemperatures(prev => ({ ...prev, [product.product_code]: "38" }));

        // Calculate initial total
        const initialTotal = (product.bulk_unit_price || 0) * 1;
        setTotals(prev => ({ ...prev, [product.product_code]: initialTotal }));

        // Reset search
        setSearchTerm('');
        setShowDropdown(false);

        // Update order totals
        const newProducts = [...products, product];
        const newQuantities = { ...quantities, [product.product_code]: 1 };
        const newUnitPrices = { ...unitPrices, [product.product_code]: product.bulk_unit_price || 0 };

        calculateOrderTotals(newProducts, newQuantities, newUnitPrices);
    };

    // Handle search input change
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
            // Filter from already loaded products first
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

    const calculateOrderTotals = (currentProducts = products, currentQuantities = quantities, currentUnitPrices = unitPrices) => {
        let newTotals = {};
        let newTotal = 0;

        currentProducts.forEach(product => {
            const productCode = product.product_code;
            const quantity = currentQuantities[productCode] || 1;
            const price = currentUnitPrices[productCode] || (
                units[productCode] === product.productUnit1?.unit_code
                    ? product.bulk_unit_price
                    : product.retail_unit_price
            ) || 0;

            const lineTotal = quantity * price;

            newTotals[productCode] = lineTotal;
            newTotal += lineTotal;
        });

        setTotals(newTotals);
        setTotal(newTotal);
    };

    // Handle expiry date change
    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({
            ...prev,
            [productCode]: date
        }));
    };

    const handleUnitChange = (productCode, newUnitCode) => {
        // Update units state
        const newUnits = {
            ...units,
            [productCode]: newUnitCode
        };
        setUnits(newUnits);

        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        const defaultUnitPrice = newUnitCode === product.productUnit1?.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        // Create updated prices object
        const newUnitPrices = {
            ...unitPrices,
            [productCode]: defaultUnitPrice
        };

        // Set the updated prices
        setUnitPrices(newUnitPrices);

        // Calculate totals with the new prices directly
        calculateOrderTotals(products, quantities, newUnitPrices);
    };

    // Handle quantity change
    const handleQuantityChange = (productCode, delta) => {
        const currentQty = quantities[productCode] || 1;
        const newQty = Math.max(1, currentQty + delta);

        setQuantities(prev => ({
            ...prev,
            [productCode]: newQty
        }));

        calculateOrderTotals();
    };

    // Handle manual quantity change from input
    const handleQuantityInputChange = (productCode, value) => {
        const newQty = parseInt(value);
        if (isNaN(newQty) || newQty < 1) return;

        // Create updated quantities object
        const newQuantities = {
            ...quantities,
            [productCode]: newQty
        };

        // Set the updated quantities
        setQuantities(newQuantities);

        // Calculate totals with the new quantities directly
        calculateOrderTotals(products, newQuantities, unitPrices);
    };

    const handleUnitPriceChange = (productCode, value) => {
        const newPrice = parseFloat(value);
        if (isNaN(newPrice) || newPrice < 0) return;

        // Create updated prices object
        const newUnitPrices = {
            ...unitPrices,
            [productCode]: newPrice
        };

        // Set the updated prices
        setUnitPrices(newUnitPrices);

        // Calculate totals with the new prices directly
        calculateOrderTotals(products, quantities, newUnitPrices);
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
        const { [productCode]: _____, ...newExpiryDates } = expiryDates;
        const { [productCode]: ______, ...newTemperatures } = temperatures;

        setQuantities(newQuantities);
        setUnits(newUnits);
        setUnitPrices(newPrices);
        setTotals(newTotals);
        setExpiryDates(newExpiryDates);
        setTemperatures(newTemperatures);

        calculateOrderTotals(products.filter(p => p.product_code !== productCode));
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

    const handleUpdate = async () => {
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
                title: 'Updating requisition...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Prepare header data - use lastRefNo directly
            const headerData = {
                refno: lastRefNo,
                rdate: format(requisitionDate, 'MM/dd/yyyy'),
                kitchen_code: saveKitchen,
                trdate: format(requisitionDate, 'yyyyMMdd'),
                monthh: format(requisitionDate, 'MM'),
                myear: requisitionDate.getFullYear(),
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

            // Prepare footer data
            const footerData = {
                total: total.toString()
            };

            // Prepare complete order data
            const orderData = {
                headerData,
                productArrayData,
                footerData
            };

            console.log("Sending data to API:", orderData);

            // Submit the data - Make sure we're sending the full object
            await dispatch(updateKt_grf(orderData)).unwrap();

            // Show success message
            await Swal.fire({
                icon: 'success',
                title: 'Updated requisition successfully',
                text: `Reference No: ${lastRefNo}`,
                showConfirmButton: false,
                timer: 1500
            });

            onBack();

        } catch (error) {
            console.error("API error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error?.message || 'Error updating requisition',
                confirmButtonText: 'OK'
            });
        }
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

    return (
        <Box sx={{ width: '100%' }}>
            <Button
                onClick={onBack}
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2 }}
            >
                Back to Goods Requisition
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
                                    value={lastRefNo}
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
                            </Grid2>
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Date
                                </Typography>
                                <DatePicker
                                    selected={requisitionDate}
                                    onChange={(date) => setRequisitionDate(date)}
                                    dateFormat="MM/dd/yyyy"
                                    placeholderText="MM/DD/YYYY"
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
                                onClick={onBack}
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
                                Cancel
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
                                            const currentTotal = (currentQuantity * currentUnitPrice).toFixed(2);

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
                                                            onChange={(e) => handleQuantityInputChange(productCode, e.target.value)}
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
                            onClick={handleUpdate}
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
                            Update
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};