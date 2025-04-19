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
import { getKtTrwByRefno, updateKt_trw } from '../../../api/kitchen/kt_trwApi';
import { Kt_trwdtAlljoindt } from '../../../api/kitchen/kt_trwdtApi';
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

export default function EditTransferToWarehouse({ onBack, editRefno }) {
    const dispatch = useDispatch();

    // Form state
    const [transferDate, setTransferDate] = useState(new Date());
    const [kitchenCode, setKitchenCode] = useState('');
    const [kitchens, setKitchens] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
    const [taxStatus, setTaxStatus] = useState({});
    const [imageErrors, setImageErrors] = useState({});
    const [debugInfo, setDebugInfo] = useState({});

    // Get user data
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson || "{}");

    // Initial Data Loading
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                console.log('Fetching data for refno:', editRefno);

                // Load all products for catalog
                const productsResponse = await dispatch(searchProductName({ product_name: '' })).unwrap();
                if (productsResponse && productsResponse.data) {
                    setAllProducts(productsResponse.data);
                }

                // Fetch kitchens
                const kitchenResponse = await dispatch(kitchenAll({ offset: 0, limit: 100 })).unwrap();
                setKitchens(kitchenResponse.data || []);

                // Fetch transfer data using the getKtTrwByRefno function
                if (editRefno) {
                    const transferResponse = await dispatch(getKtTrwByRefno(
                        typeof editRefno === 'object' ? editRefno : { refno: editRefno }
                    )).unwrap();

                    if (transferResponse.result && transferResponse.data) {
                        const transferData = transferResponse.data;
                        setDebugInfo({ headerData: transferData });

                        // Set header data
                        if (transferData.trdate && transferData.trdate.length === 8) {
                            const year = parseInt(transferData.trdate.substring(0, 4));
                            const month = parseInt(transferData.trdate.substring(4, 6)) - 1;
                            const day = parseInt(transferData.trdate.substring(6, 8));
                            setTransferDate(new Date(year, month, day));
                        } else if (transferData.rdate) {
                            // Try to parse the date safely
                            try {
                                const dateParts = transferData.rdate.split('/');
                                if (dateParts.length === 3) {
                                    const month = parseInt(dateParts[0]) - 1;
                                    const day = parseInt(dateParts[1]);
                                    const year = parseInt(dateParts[2]);
                                    setTransferDate(new Date(year, month, day));
                                } else {
                                    setTransferDate(new Date());
                                }
                            } catch (e) {
                                console.error("Date parsing error:", e);
                                setTransferDate(new Date());
                            }
                        }

                        setKitchenCode(transferData.kitchen_code || '');
                        setTotal(parseFloat(transferData.total) || 0);

                        // Fetch detail data
                        const refnoParam = typeof editRefno === 'object' ? editRefno : { refno: editRefno };
                        const detailResponse = await dispatch(Kt_trwdtAlljoindt(refnoParam)).unwrap();
                        console.log('Detail response:', JSON.stringify(detailResponse));
                        setDebugInfo(prev => ({ ...prev, detailData: detailResponse.data }));

                        if (detailResponse.result && detailResponse.data && detailResponse.data.length > 0) {
                            await processDetailData(detailResponse.data);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading transfer data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load transfer data: ' + error.message
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
            const newTaxStatus = {};

            detailData.forEach((item) => {
                const productCode = item.product_code;
                newQuantities[productCode] = parseFloat(item.qty) || 1;
                newUnits[productCode] = item.unit_code || item.tbl_product?.productUnit1?.unit_code || '';
                newUnitPrices[productCode] = parseFloat(item.uprice) || 0;
                newTotals[productCode] = parseFloat(item.amt) || 0;
                newTemperatures[productCode] = item.temperature1 || '';
                newTaxStatus[productCode] = item.tax1 || 'N';

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
            setTaxStatus(newTaxStatus);

            // Calculate and set total
            const totalSum = Object.values(newTotals).reduce((sum, value) => sum + value, 0);
            setTotal(totalSum);

        } catch (error) {
            console.error('Error processing detail data:', error);
            throw error;
        }
    };

    // Fixed handleQuantityChange function
    const handleQuantityChange = (productCode, newQuantity) => {
        const qty = parseInt(newQuantity);
        if (isNaN(qty) || qty < 1) return;

        // Update quantities state
        const newQuantities = {
            ...quantities,
            [productCode]: qty
        };
        setQuantities(newQuantities);

        // Find the product and calculate new line total
        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        const unitPrice = unitPrices[productCode] || 0;
        const newLineTotal = qty * unitPrice;

        // Update totals with new line total
        const newTotals = {
            ...totals,
            [productCode]: newLineTotal
        };
        setTotals(newTotals);

        // Calculate new order total
        let newTotal = 0;
        products.forEach(p => {
            const pCode = p.product_code;
            if (pCode === productCode) {
                newTotal += newLineTotal;
            } else {
                newTotal += totals[pCode] || 0;
            }
        });

        // Update the total state
        setTotal(newTotal);
    };

    // Fixed handleUnitChange function
    const handleUnitChange = (productCode, newUnitCode) => {
        // Update units state
        const newUnits = {
            ...units,
            [productCode]: newUnitCode
        };
        setUnits(newUnits);

        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        // Determine unit price based on unit
        const defaultUnitPrice = newUnitCode === product.productUnit1?.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        // Update unit prices state
        const newUnitPrices = {
            ...unitPrices,
            [productCode]: defaultUnitPrice
        };
        setUnitPrices(newUnitPrices);

        // Calculate new line total
        const qty = quantities[productCode] || 1;
        const newLineTotal = qty * defaultUnitPrice;

        // Update totals with new line total
        const newTotals = {
            ...totals,
            [productCode]: newLineTotal
        };
        setTotals(newTotals);

        // Calculate new order total
        let newTotal = 0;
        products.forEach(p => {
            const pCode = p.product_code;
            if (pCode === productCode) {
                newTotal += newLineTotal;
            } else {
                newTotal += totals[pCode] || 0;
            }
        });

        // Update the total state
        setTotal(newTotal);
    };

    // Fixed handleUnitPriceChange function
    const handleUnitPriceChange = (productCode, value) => {
        const newPrice = parseFloat(value);
        if (isNaN(newPrice) || newPrice < 0) return;

        // Update unit prices state
        const newUnitPrices = {
            ...unitPrices,
            [productCode]: newPrice
        };
        setUnitPrices(newUnitPrices);

        // Calculate new line total
        const qty = quantities[productCode] || 1;
        const newLineTotal = qty * newPrice;

        // Update totals with new line total
        const newTotals = {
            ...totals,
            [productCode]: newLineTotal
        };
        setTotals(newTotals);

        // Calculate new order total
        let newTotal = 0;
        products.forEach(p => {
            const pCode = p.product_code;
            if (pCode === productCode) {
                newTotal += newLineTotal;
            } else {
                newTotal += totals[pCode] || 0;
            }
        });

        // Update the total state
        setTotal(newTotal);
    };

    // Fixed handleDeleteProduct function
    const handleDeleteProduct = (productCode) => {
        // Find the product to be deleted
        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

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
        const { [productCode]: _______, ...newTaxStatus } = taxStatus;

        // Update all state objects
        setQuantities(newQuantities);
        setUnits(newUnits);
        setUnitPrices(newPrices);
        setTotals(newTotals);
        setExpiryDates(newExpiryDates);
        setTemperatures(newTemperatures);
        setTaxStatus(newTaxStatus);

        // Directly calculate and update the new total
        const newTotal = total - productAmount;
        setTotal(newTotal);
    };

    // Fixed handleProductSelect function
    const handleProductSelect = (product) => {
        // Check if product is already in the list
        if (selectedProducts.includes(product.product_code)) {
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Product',
                text: `${product.product_name} is already in your transfer. Please adjust the quantity instead.`,
                confirmButtonColor: '#754C27'
            });
            setSearchTerm('');
            setShowDropdown(false);
            return;
        }

        // Add to selected products
        setSelectedProducts(prev => [...prev, product.product_code]);
        setProducts(prev => [...prev, product]);

        // Set initial values
        const initialQuantity = 1;
        const initialUnitCode = product.productUnit1?.unit_code || '';
        const initialUnitPrice = product.bulk_unit_price || 0;
        const initialAmount = initialQuantity * initialUnitPrice;

        // Update all state objects with initial values
        setQuantities(prev => ({ ...prev, [product.product_code]: initialQuantity }));
        setUnits(prev => ({ ...prev, [product.product_code]: initialUnitCode }));
        setUnitPrices(prev => ({ ...prev, [product.product_code]: initialUnitPrice }));
        setTotals(prev => ({ ...prev, [product.product_code]: initialAmount }));
        setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
        setTemperatures(prev => ({ ...prev, [product.product_code]: '38' }));
        setTaxStatus(prev => ({ ...prev, [product.product_code]: product.tax1 || 'N' }));

        // Update total by adding the new product's amount
        setTotal(prev => prev + initialAmount);

        // Reset search
        setSearchTerm('');
        setShowDropdown(false);
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

    // Handle temperature change
    const handleTemperatureChange = (productCode, value) => {
        setTemperatures(prev => ({
            ...prev,
            [productCode]: value
        }));
    };

    // Handle tax status change
    const handleTaxStatusChange = (productCode, value) => {
        setTaxStatus(prev => ({
            ...prev,
            [productCode]: value
        }));
    };

    // Calculate tax
    const calculateTax = () => {
        let taxableAmount = 0;
        products.forEach(product => {
            const productCode = product.product_code;
            if (taxStatus[productCode] === 'Y') {
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

    // Handle form submission (update)
    const handleUpdate = async () => {
        if (!kitchenCode || products.length === 0) {
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
                title: 'Updating transfer...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            // Calculate tax amounts
            let taxableAmount = 0;
            let nontaxableAmount = 0;

            products.forEach(product => {
                const productCode = product.product_code;
                const amount = totals[productCode] || 0;
                if (taxStatus[productCode] === 'Y') {
                    taxableAmount += amount;
                } else {
                    nontaxableAmount += amount;
                }
            });

            const headerData = {
                refno: editRefno,
                rdate: format(transferDate, 'MM/dd/yyyy'),
                kitchen_code: kitchenCode,
                trdate: format(transferDate, 'yyyyMMdd'),
                monthh: format(transferDate, 'MM'),
                myear: transferDate.getFullYear(),
                taxable: taxableAmount.toString(),
                nontaxable: nontaxableAmount.toString(),
                user_code: userData2?.user_code || '',
                total: total.toString(),
            };

            const productArrayData = products.map(product => ({
                refno: editRefno,
                product_code: product.product_code,
                qty: quantities[product.product_code].toString(),
                unit_code: units[product.product_code],
                uprice: unitPrices[product.product_code].toString(),
                tax1: taxStatus[product.product_code],
                amt: totals[product.product_code].toString(),
                expire_date: format(expiryDates[product.product_code], 'MM/dd/yyyy'),
                texpire_date: format(expiryDates[product.product_code], 'yyyyMMdd'),
                temperature1: temperatures[product.product_code] || ''
            }));

            await dispatch(updateKt_trw({
                // Send as both direct properties and nested objects to maintain compatibility
                ...headerData,
                headerData,
                productArrayData,
                footerData: {
                    total: total.toString(),
                }
            })).unwrap();

            await Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Transfer updated successfully',
                timer: 1500
            });

            onBack();
        } catch (error) {
            console.error('Error updating data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error updating data'
            });
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: '#754C27' }} />
                <Typography sx={{ ml: 2 }}>Loading transfer data...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Button
                onClick={onBack}
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2, mr: 'auto' }}
            >
                Back to Transfer to Warehouse
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
                                    selected={transferDate}
                                    onChange={(date) => setTransferDate(date)}
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
                                    value={kitchenCode}
                                    onChange={(e) => setKitchenCode(e.target.value)}
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
                                Current Transfer
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
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '15%', color: '#754C27', fontWeight: '800' }}>Product name</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Expiry Date</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Temperature</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Tax</th>
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
                                            <td colSpan={11} style={{ textAlign: 'center', padding: '16px', color: '#666' }}>
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
                                            const currentTaxStatus = taxStatus[productCode] || 'N';

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
                                                            placeholder="°C"
                                                            style={{
                                                                width: '60px',
                                                                padding: '4px',
                                                                textAlign: 'center',
                                                                borderRadius: '4px'
                                                            }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                        <select
                                                            value={currentTaxStatus}
                                                            onChange={(e) => handleTaxStatusChange(productCode, e.target.value)}
                                                            style={{
                                                                padding: '4px',
                                                                borderRadius: '4px'
                                                            }}
                                                        >
                                                            <option value="Y">Yes</option>
                                                            <option value="N">No</option>
                                                        </select>
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
                            disabled={!kitchenCode || products.length === 0}
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
                            Update Transfer
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}