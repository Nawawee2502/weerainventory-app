import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Typography, IconButton, Divider, InputAdornment,
    CircularProgress, Grid, Select, MenuItem, FormControl
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../api/productrecordApi';
import { kitchenAll } from '../../../api/kitchenApi';
import { getKtPrfByRefno, updateKt_prf } from '../../../api/kitchen/kt_prfApi';
import { Kt_prfdtAlljoindt } from '../../../api/kitchen/kt_prfdtApi';
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

export default function EditProductReceipt({ onBack, editRefno }) {
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
    const [expiryDates, setExpiryDates] = useState({});
    const [temperatures, setTemperatures] = useState({});
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

                // Fetch receipt data using getKtPrfByRefno
                if (editRefno) {
                    console.log('Looking up with getKtPrfByRefno for ref:', editRefno);
                    // Pass refno directly as a string, not as an object
                    const refno = typeof editRefno === 'object' ? editRefno.refno : editRefno;
                    const receiptResponse = await dispatch(getKtPrfByRefno(refno)).unwrap();
                    console.log('Response from getKtPrfByRefno:', receiptResponse);

                    if (receiptResponse.result && receiptResponse.data) {
                        // Set header info
                        const receiptData = receiptResponse.data;
                        console.log('Header data found:', receiptData);
                        setDebugInfo({ headerData: receiptData });

                        // Parse and set date
                        if (receiptData.trdate && receiptData.trdate.length === 8) {
                            const year = parseInt(receiptData.trdate.substring(0, 4));
                            const month = parseInt(receiptData.trdate.substring(4, 6)) - 1;
                            const day = parseInt(receiptData.trdate.substring(6, 8));
                            setStartDate(new Date(year, month, day));
                        } else if (receiptData.rdate) {
                            // Try to parse the date safely
                            try {
                                const dateParts = receiptData.rdate.split('/');
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

                        setSaveKitchen(receiptData.kitchen_code || '');
                        setTotal(parseFloat(receiptData.total) || 0);

                        // Fetch detail data
                        const refno = typeof editRefno === 'object' ? editRefno.refno : editRefno;
                        const detailResponse = await dispatch(Kt_prfdtAlljoindt(refno)).unwrap();
                        console.log('Detail response from Kt_prfdtAlljoindt:', detailResponse);

                        if (detailResponse.result && detailResponse.data && detailResponse.data.length > 0) {
                            const detailData = detailResponse.data;
                            console.log('Detail data found:', detailData.length, 'items');
                            setDebugInfo(prev => ({ ...prev, detailData }));

                            // Process detail data
                            await processDetailData(detailData);
                        } else {
                            console.warn('No detail data found in Kt_prfdtAlljoindt');
                            setDebugInfo(prev => ({ ...prev, detailError: 'No detail data found in Kt_prfdtAlljoindt' }));
                        }
                    } else {
                        console.warn('No data found in getKtPrfByRefno');
                        setDebugInfo(prev => ({ ...prev, error: 'No data found in getKtPrfByRefno' }));
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
                    text: 'Failed to load receipt data: ' + error.message
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dispatch, editRefno]);

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
            const newExpiryDates = {};
            const newTemperatures = {};

            detailData.forEach((item) => {
                const productCode = item.product_code;
                newQuantities[productCode] = parseFloat(item.qty) || 1;
                newUnits[productCode] = item.unit_code || item.tbl_product?.productUnit1?.unit_code || '';
                newUnitPrices[productCode] = parseFloat(item.uprice) || 0;
                newTotals[productCode] = parseFloat(item.amt) || 0;
                newTemperatures[productCode] = item.temperature1 || '0';

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
            setTemperatures(newTemperatures);

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
                text: `${product.product_name} is already in your receipt. Please adjust the quantity instead.`,
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
        setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
        setTemperatures(prev => ({ ...prev, [product.product_code]: "38" }));

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

    // Handle expiry date change
    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({
            ...prev,
            [productCode]: date
        }));
    };

    // Handle temperature change
    const handleTemperatureChange = (productCode, value) => {
        setTemperatures(prev => ({
            ...prev,
            [productCode]: value || "0"
        }));
    };

    // Handle unit change
    const handleUnitChange = (productCode, newUnitCode) => {
        setUnits(prev => ({
            ...prev,
            [productCode]: newUnitCode
        }));

        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        const defaultUnitPrice = newUnitCode === product.productUnit1?.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        setUnitPrices(prev => ({
            ...prev,
            [productCode]: defaultUnitPrice
        }));

        calculateOrderTotals();
    };

    // Handle quantity change
    const handleQuantityChange = (productCode, newQuantity) => {
        const qty = parseInt(newQuantity);
        if (isNaN(qty) || qty < 1) return;

        setQuantities(prev => ({
            ...prev,
            [productCode]: qty
        }));

        calculateOrderTotals();
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

    // Handle unit price change
    const handleUnitPriceChange = (productCode, value) => {
        const newPrice = parseFloat(value);
        if (isNaN(newPrice) || newPrice < 0) return;

        setUnitPrices(prev => ({
            ...prev,
            [productCode]: newPrice
        }));

        calculateOrderTotals();
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
        Swal.fire({
            title: 'Are you sure?',
            text: "This will reset all your changes!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, reset it!'
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
            temperatures,
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
                title: 'Updating receipt...',
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

            const saleTax = taxableAmount * 0.07;

            const headerData = {
                refno: editRefno,
                rdate: format(startDate, 'MM/dd/yyyy'),
                kitchen_code: saveKitchen,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                taxable: taxableAmount.toString(),
                nontaxable: nontaxableAmount.toString(),
                user_code: userData2?.user_code || '',
                total: total.toString(),
                sale_tax: saleTax.toString(),
                total_due: (total + saleTax).toString()
            };

            const productArrayData = products.map(product => ({
                refno: editRefno,
                product_code: product.product_code,
                qty: (quantities[product.product_code] || 1).toString(),
                unit_code: units[product.product_code] || product.productUnit1?.unit_code || '',
                uprice: (unitPrices[product.product_code] || 0).toString(),
                amt: (totals[product.product_code] || 0).toString(),
                expire_date: format(expiryDates[product.product_code] || new Date(), 'MM/dd/yyyy'),
                texpire_date: format(expiryDates[product.product_code] || new Date(), 'yyyyMMdd'),
                tax1: product.tax1 || 'N',
                temperature1: temperatures[product.product_code] || "0"
            }));

            await dispatch(updateKt_prf({
                // Send as both direct properties and nested objects to maintain compatibility
                ...headerData,
                headerData,
                productArrayData,
                footerData: {
                    taxable: taxableAmount.toString(),
                    nontaxable: nontaxableAmount.toString(),
                    total: total.toString(),
                    sale_tax: saleTax.toString(),
                    total_due: (total + saleTax).toString()
                }
            })).unwrap();

            await Swal.fire({
                icon: 'success',
                title: 'Updated receipt successfully',
                text: `Reference No: ${editRefno}`,
                showConfirmButton: false,
                timer: 1500
            });

            onBack();
        } catch (error) {
            console.error('Update error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error updating receipt',
                confirmButtonText: 'OK'
            });
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: '#754C27' }} />
                <Typography sx={{ ml: 2 }}>Loading receipt data...</Typography>
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
                    Back to Product Receipts
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
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Kitchen
                                </Typography>
                                <FormControl fullWidth sx={{ mt: '8px' }}>
                                    <Select
                                        value={saveKitchen}
                                        onChange={(e) => setSaveKitchen(e.target.value)}
                                        size="small"
                                        displayEmpty
                                        sx={{
                                            borderRadius: '10px',
                                            height: '38px'
                                        }}
                                    >
                                        <MenuItem value="" disabled>
                                            <em>Select Kitchen</em>
                                        </MenuItem>
                                        {kitchens.map((kitchen) => (
                                            <MenuItem key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                                                {kitchen.kitchen_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* Search product section */}
                        <Box sx={{ mt: '24px' }}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                Search Products
                            </Typography>
                            <Box sx={{ position: 'relative', mt: '8px' }}>
                                <TextField
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleSearchChange}
                                    placeholder="Search by name or code"
                                    fullWidth
                                    size="small"
                                    autoComplete="off"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                        }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: '#5A607F' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchTerm && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setSearchTerm('');
                                                        setShowDropdown(false);
                                                    }}
                                                >
                                                    <CancelIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                {/* Search dropdown */}
                                {showDropdown && searchResults.length > 0 && (
                                    <Box sx={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        width: '100%',
                                        bgcolor: 'white',
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                        borderRadius: '0 0 10px 10px',
                                        zIndex: 10,
                                        maxHeight: '300px',
                                        overflow: 'auto'
                                    }}>
                                        {searchResults.map((product) => (
                                            <Box
                                                key={product.product_code}
                                                sx={{
                                                    p: '8px 16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    borderBottom: '1px solid #eee',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        bgcolor: '#f5f5f5'
                                                    }
                                                }}
                                                onClick={() => handleProductSelect(product)}
                                            >
                                                {renderProductImage(product)}
                                                <Box>
                                                    <Typography sx={{ fontWeight: '500' }}>
                                                        {product.product_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {product.product_code} - ${product.bulk_unit_price}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* Selected products table */}
                        <Box sx={{ mt: '24px' }}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mb: '16px' }}>
                                Selected Products ({products.length})
                            </Typography>

                            {products.length === 0 ? (
                                <Box sx={{
                                    border: '1px dashed #ccc',
                                    p: '24px',
                                    borderRadius: '10px',
                                    textAlign: 'center'
                                }}>
                                    <Typography color="text.secondary">
                                        No products selected. Search and select products above.
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ overflowX: 'auto' }}>
                                    <Box sx={{
                                        minWidth: '900px',
                                        display: 'table',
                                        width: '100%',
                                        borderCollapse: 'collapse'
                                    }}>
                                        {/* Table Header */}
                                        <Box sx={{
                                            display: 'table-header-group',
                                            bgcolor: '#F8F8F8',
                                            fontWeight: '500',
                                            fontSize: '14px'
                                        }}>
                                            <Box sx={{ display: 'table-row' }}>
                                                <Box sx={{ display: 'table-cell', p: '10px', borderBottom: '1px solid #E4E4E4' }}>No.</Box>
                                                <Box sx={{ display: 'table-cell', p: '10px', borderBottom: '1px solid #E4E4E4' }}>Product</Box>
                                                <Box sx={{ display: 'table-cell', p: '10px', borderBottom: '1px solid #E4E4E4' }}>Expiry Date</Box>
                                                <Box sx={{ display: 'table-cell', p: '10px', borderBottom: '1px solid #E4E4E4' }}>Temperature</Box>
                                                <Box sx={{ display: 'table-cell', p: '10px', borderBottom: '1px solid #E4E4E4' }}>Quantity</Box>
                                                <Box sx={{ display: 'table-cell', p: '10px', borderBottom: '1px solid #E4E4E4' }}>Unit</Box>
                                                <Box sx={{ display: 'table-cell', p: '10px', borderBottom: '1px solid #E4E4E4' }}>Unit Price</Box>
                                                <Box sx={{ display: 'table-cell', p: '10px', borderBottom: '1px solid #E4E4E4' }}>Total</Box>
                                                <Box sx={{ display: 'table-cell', p: '10px', borderBottom: '1px solid #E4E4E4' }}>Action</Box>
                                            </Box>
                                        </Box>

                                        {/* Table Body */}
                                        <Box sx={{ display: 'table-row-group' }}>
                                            {products.map((product, index) => (
                                                <Box key={product.product_code} sx={{ display: 'table-row' }}>
                                                    <Box sx={{ display: 'table-cell', p: '10px', borderBottom: '1px solid #E4E4E4', verticalAlign: 'middle' }}>
                                                        {index + 1}
                                                    </Box>
                                                    <Box sx={{ display: 'table-cell', p: '10px', borderBottom: '1px solid #E4E4E4', verticalAlign: 'middle' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            {renderProductImage(product)}
                                                            <Box>
                                                                <Typography sx={{ fontWeight: '500', fontSize: '14px' }}>
                                                                    {product.product_name}
                                                                </Typography>
                                                                <Typography sx={{ color: '#5A607F', fontSize: '12px' }}>
                                                                    {product.product_code}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'table-cell', p: '10px', borderBottom: '1px solid #E4E4E4', verticalAlign: 'middle' }}>
                                                        <DatePicker
                                                            selected={expiryDates[product.product_code] || new Date()}
                                                            onChange={(date) => handleExpiryDateChange(product.product_code, date)}
                                                            dateFormat="MM/dd/yyyy"
                                                            customInput={<CustomDateInput />}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'table-cell', p: '10px', borderBottom: '1px solid #E4E4E4', verticalAlign: 'middle' }}>
                                                        <TextField
                                                            value={temperatures[product.product_code] || "0"}
                                                            onChange={(e) => handleTemperatureChange(product.product_code, e.target.value)}
                                                            size="small"
                                                            InputProps={{
                                                                endAdornment: <InputAdornment position="end">°C</InputAdornment>,
                                                            }}
                                                            sx={{
                                                                width: '90px',
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: '10px',
                                                                }
                                                            }}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'table-cell', p: '10px', borderBottom: '1px solid #E4E4E4', verticalAlign: 'middle' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleQuantityDecrease(product.product_code)}
                                                                sx={{ bgcolor: '#F8F8F8', borderRadius: '5px', mr: '5px' }}
                                                            >
                                                                <RemoveIcon fontSize="small" />
                                                            </IconButton>
                                                            <TextField
                                                                value={quantities[product.product_code] || 1}
                                                                onChange={(e) => handleQuantityChange(product.product_code, e.target.value)}
                                                                type="number"
                                                                size="small"
                                                                sx={{
                                                                    width: '60px',
                                                                    '& .MuiOutlinedInput-root': {
                                                                        borderRadius: '5px',
                                                                    },
                                                                    '& input': {
                                                                        textAlign: 'center',
                                                                        p: '4px'
                                                                    }
                                                                }}
                                                                inputProps={{ min: 1 }}
                                                            />
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleQuantityIncrease(product.product_code)}
                                                                sx={{ bgcolor: '#F8F8F8', borderRadius: '5px', ml: '5px' }}
                                                            >
                                                                <AddIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'table-cell', p: '10px', borderBottom: '1px solid #E4E4E4', verticalAlign: 'middle' }}>
                                                        <Select
                                                            value={units[product.product_code] || ''}
                                                            onChange={(e) => handleUnitChange(product.product_code, e.target.value)}
                                                            size="small"
                                                            sx={{
                                                                minWidth: '80px',
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: '5px',
                                                                }
                                                            }}
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
                                                    </Box>
                                                    <Box sx={{ display: 'table-cell', p: '10px', borderBottom: '1px solid #E4E4E4', verticalAlign: 'middle' }}>
                                                        <TextField
                                                            value={unitPrices[product.product_code] || 0}
                                                            onChange={(e) => handleUnitPriceChange(product.product_code, e.target.value)}
                                                            type="number"
                                                            size="small"
                                                            sx={{
                                                                width: '100px',
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: '5px',
                                                                }
                                                            }}
                                                            InputProps={{
                                                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                            }}
                                                            inputProps={{ step: "0.01", min: 0 }}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'table-cell', p: '10px', borderBottom: '1px solid #E4E4E4', verticalAlign: 'middle', fontWeight: '500' }}>
                                                        ${totals[product.product_code]?.toFixed(2) || '0.00'}
                                                    </Box>
                                                    <Box sx={{ display: 'table-cell', p: '10px', borderBottom: '1px solid #E4E4E4', verticalAlign: 'middle' }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteProduct(product.product_code)}
                                                            sx={{ color: '#FF5252' }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        {/* Total Summary */}
                        {products.length > 0 && (
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
                        )}

                        {/* Action Buttons */}
                        <Box sx={{ mt: '24px', display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="outlined"
                                onClick={resetForm}
                                sx={{
                                    borderRadius: '5px',
                                    height: '48px',
                                    px: '24px',
                                    borderColor: '#E4E4E4',
                                    color: '#5A607F'
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleUpdate}
                                disabled={products.length === 0 || !saveKitchen}
                                sx={{
                                    borderRadius: '5px',
                                    height: '48px',
                                    px: '24px',
                                    bgcolor: '#754C27',
                                    '&:hover': {
                                        bgcolor: '#5A3B1E'
                                    },
                                    '&.Mui-disabled': {
                                        bgcolor: '#E4E4E4',
                                        color: '#A0A0A0'
                                    }
                                }}
                            >
                                Update Receipt
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}