import React, { useState, useEffect } from 'react';
import { Box, Button, InputAdornment, TextField, Typography, IconButton, Grid2, Divider, Autocomplete, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../api/productrecordApi';
import { Br_rfwrefno, addBr_rfw } from '../../../api/restaurant/br_rfwApi';
import { branchAll } from '../../../api/branchApi';
import { supplierAll } from '../../../api/supplierApi';
import { Wh_dpbdtAlljoindt } from '../../../api/warehouse/wh_dpbdtApi';
import { Wh_dpbByRefno, wh_dpbAlljoindt } from '../../../api/warehouse/wh_dpbApi';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Swal from 'sweetalert2';
import { format, parse } from 'date-fns';

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
                        <CalendarTodayIcon sx={{ color: '#754C27', cursor: 'pointer' }} />
                    </InputAdornment>
                ),
            }}
        />
    </Box>
));

export default function CreateReceiptFromWarehouse({ onBack }) {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('Please select dispatch to restaurant');
    const [branches, setBranches] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [saveSupplier, setSaveSupplier] = useState('');
    const [saveBranch, setSaveBranch] = useState('');
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [expiryDates, setExpiryDates] = useState({});
    const [temperatures, setTemperatures] = useState({});
    const [imageErrors, setImageErrors] = useState({});
    const [taxStatus, setTaxStatus] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [taxableAmount, setTaxableAmount] = useState(0);
    const [nonTaxableAmount, setNonTaxableAmount] = useState(0);

    // For dispatch selection
    const [dispatchRefnos, setDispatchRefnos] = useState([]);
    const [selectedDispatchRefno, setSelectedDispatchRefno] = useState('');
    const [dispatchData, setDispatchData] = useState(null);
    const [loadingDispatch, setLoadingDispatch] = useState(false);

    const TAX_RATE = 0.07;
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson || "{}");

    useEffect(() => {
        const currentDate = new Date();
        // handleGetLastRefNo(currentDate);

        // Load branches
        dispatch(branchAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((res) => {
                setBranches(res.data);
            })
            .catch((err) => console.log(err.message));

        // Load suppliers
        dispatch(supplierAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((res) => {
                setSuppliers(res.data);
            })
            .catch((err) => console.log(err.message));

        // Fetch available dispatches
        fetchAvailableDispatches();

        // Load initial products
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

    // Fetch available dispatches from warehouse to branch
    const fetchAvailableDispatches = async () => {
        try {
            setIsLoading(true);

            // Get dispatches from last 90 days
            const today = new Date();
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(today.getDate() - 90);

            // Format dates for API requirements
            const rdate1 = format(ninetyDaysAgo, 'yyyyMMdd');
            const rdate2 = format(today, 'yyyyMMdd');

            console.log(`Fetching dispatches from ${rdate1} to ${rdate2}`);

            // Call API with properly specified parameters
            const response = await dispatch(wh_dpbAlljoindt({
                rdate1: rdate1,
                rdate2: rdate2,
                offset: 0,
                limit: 100
            })).unwrap();

            // Process the response data
            if (response && response.result && Array.isArray(response.data)) {
                console.log(`Found ${response.data.length} dispatches`);

                // Filter out invalid data entries
                const validData = response.data.filter(item =>
                    item && item.refno && (item.rdate || item.trdate)
                );

                // Transform data for Autocomplete
                const dispatchOptions = validData.map(item => {
                    // Use trdate as fallback if rdate doesn't exist
                    const dateValue = item.rdate || item.trdate;
                    let formattedDate = 'Unknown';

                    // Safely parse date
                    try {
                        if (dateValue) {
                            // Try different date formats
                            if (dateValue.includes('/')) {
                                formattedDate = format(parse(dateValue, 'MM/dd/yyyy', new Date()), 'MM/dd/yyyy');
                            } else {
                                // If dateValue is in yyyyMMdd format
                                formattedDate = format(
                                    parse(dateValue, 'yyyyMMdd', new Date()),
                                    'MM/dd/yyyy'
                                );
                            }
                        }
                    } catch (e) {
                        console.warn(`Date parsing error for ${dateValue}:`, e);
                        formattedDate = 'Invalid date';
                    }

                    return {
                        refno: item.refno,
                        branch: item.tbl_branch?.branch_name || 'Unknown',
                        date: dateValue || 'Unknown Date',
                        formattedDate: formattedDate,
                        total: item.total || '0'
                    };
                });

                setDispatchRefnos(dispatchOptions);
                console.log('Available dispatch options:', dispatchOptions);
            } else {
                console.warn('No dispatch data found or invalid response format:', response);
                setDispatchRefnos([]);
            }
        } catch (error) {
            console.error("Error fetching available dispatches:", error);
            setDispatchRefnos([]);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch available dispatches: ' + (error.message || 'Unknown error')
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle selecting a dispatch
    const handleDispatchSelection = async (refno) => {
        if (!refno) {
            resetForm();
            return;
        }

        try {
            setLoadingDispatch(true);
            setSelectedDispatchRefno(refno);

            // Fetch header data
            const headerResponse = await dispatch(Wh_dpbByRefno({ refno })).unwrap();

            if (headerResponse.result && headerResponse.data) {
                const dispatchHeader = headerResponse.data;
                setDispatchData(dispatchHeader);

                // Set the lastRefNo to be the same as the dispatch refno
                setLastRefNo(refno);

                // Set branch from dispatch
                setSaveBranch(dispatchHeader.branch_code || '');

                // Fetch detail data
                const detailResponse = await dispatch(Wh_dpbdtAlljoindt({ refno })).unwrap();

                if (detailResponse.result && detailResponse.data && detailResponse.data.length > 0) {
                    await processDispatchDetailData(detailResponse.data);
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'No Items',
                        text: 'This dispatch has no items.'
                    });
                }
            }
        } catch (error) {
            console.error("Error loading dispatch data:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load dispatch data: ' + error.message
            });
        } finally {
            setLoadingDispatch(false);
        }
    };

    // Process dispatch detail data
    const processDispatchDetailData = async (detailData) => {
        try {
            console.log('Processing dispatch detail data:', detailData);

            // Extract product codes to mark as selected
            const productCodes = detailData.map(item => item.product_code);
            setSelectedProducts(productCodes);

            // Set products array from detail data
            const productsData = detailData.map(item => ({
                ...item.tbl_product,
                product_code: item.product_code,
                product_name: item.tbl_product?.product_name || '',
                tax1: item.tax1 || 'N'
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
                if (!productCode) return;

                newQuantities[productCode] = parseFloat(item.qty) || 1;
                newUnits[productCode] = item.unit_code || '';
                newUnitPrices[productCode] = parseFloat(item.uprice) || 0;
                newTotals[productCode] = parseFloat(item.amt) || 0;
                newTemperatures[productCode] = item.temperature1 || '38';
                newTaxStatus[productCode] = item.tax1 || 'N';

                // Parse expiry date or use current date + 30 days
                if (item.expire_date) {
                    try {
                        newExpiryDates[productCode] = parse(item.expire_date, 'MM/dd/yyyy', new Date());
                    } catch (e) {
                        console.error("Expiry date parsing error:", e);
                        const futureDate = new Date();
                        futureDate.setDate(futureDate.getDate() + 30);
                        newExpiryDates[productCode] = futureDate;
                    }
                } else {
                    const futureDate = new Date();
                    futureDate.setDate(futureDate.getDate() + 30);
                    newExpiryDates[productCode] = futureDate;
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

            // Calculate taxable and non-taxable amounts
            let newTaxable = 0;
            let newNonTaxable = 0;

            detailData.forEach((item) => {
                const productCode = item.product_code;
                const amount = parseFloat(item.amt) || 0;

                if (item.tax1 === 'Y') {
                    newTaxable += amount;
                } else {
                    newNonTaxable += amount;
                }
            });

            setTaxableAmount(newTaxable);
            setNonTaxableAmount(newNonTaxable);

            console.log('Detail processing complete', {
                products: productsData,
                quantities: newQuantities,
                units: newUnits,
                prices: newUnitPrices,
                totals: newTotals
            });

        } catch (error) {
            console.error('Error processing detail data:', error);
            throw error;
        }
    };

    // Product search handler
    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 0) {
            try {
                const response = await dispatch(searchProductName({ product_name: value })).unwrap();
                if (response.data) {
                    setSearchResults(response.data);
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

    const handleGetLastRefNo = async (selectedDate) => {
        try {
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);

            const res = await dispatch(Br_rfwrefno({
                month: month,
                year: year
            })).unwrap();

            if (!res.data || !res.data.refno) {
                setLastRefNo(`BRFW${year}${month}001`);
                return;
            }

            const lastRefNo = res.data.refno;
            const lastRefMonth = lastRefNo.substring(6, 8);
            const lastRefYear = lastRefNo.substring(4, 6);

            if (lastRefMonth !== month || lastRefYear !== year) {
                setLastRefNo(`BRFW${year}${month}001`);
                return;
            }

            const lastNumber = parseInt(lastRefNo.slice(-3));
            const newNumber = lastNumber + 1;
            setLastRefNo(`BRFW${year}${month}${String(newNumber).padStart(3, '0')}`);

        } catch (err) {
            console.error("Error generating refno:", err);
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);
            setLastRefNo(`BRFW${year}${month}001`);
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

    // Product selection handler
    const handleProductSelect = (product) => {
        if (products.some(p => p.product_code === product.product_code)) {
            // More detailed warning message with consistent styling
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Product',
                text: `${product.product_name} is already in your order. Please adjust the quantity instead.`,
                confirmButtonColor: '#754C27'
            });
            setSearchTerm('');
            setShowDropdown(false);
            return;
        }

        const productCode = product.product_code;
        const initialQuantity = 1;
        const initialUnitCode = product.productUnit1.unit_code;
        const initialUnitPrice = product.bulk_unit_price;
        const initialAmount = initialQuantity * initialUnitPrice;
        const isTaxable = product.tax1 === 'Y';

        setProducts(prev => [...prev, product]);
        setQuantities(prev => ({ ...prev, [productCode]: initialQuantity }));
        setUnits(prev => ({ ...prev, [productCode]: initialUnitCode }));
        setUnitPrices(prev => ({ ...prev, [productCode]: initialUnitPrice }));
        setTotals(prev => ({ ...prev, [productCode]: initialAmount }));
        setExpiryDates(prev => ({ ...prev, [productCode]: new Date() }));
        setTemperatures(prev => ({ ...prev, [productCode]: '38' }));
        setTaxStatus(prev => ({ ...prev, [productCode]: product.tax1 || 'N' }));

        if (isTaxable) {
            setTaxableAmount(prev => prev + initialAmount);
        } else {
            setNonTaxableAmount(prev => prev + initialAmount);
        }

        setTotal(prev => prev + initialAmount);

        setSearchTerm('');
        setShowDropdown(false);
    };

    // Quantity change handler
    const handleQuantityChange = (productCode, quantity) => {
        const oldQuantity = quantities[productCode] || 0;
        const price = unitPrices[productCode] || 0;
        const oldAmount = oldQuantity * price;
        const newAmount = quantity * price;
        const diffAmount = newAmount - oldAmount;

        setQuantities(prev => ({ ...prev, [productCode]: quantity }));
        setTotals(prev => ({ ...prev, [productCode]: newAmount }));

        const product = products.find(p => p.product_code === productCode);
        if (product && product.tax1 === 'Y') {
            setTaxableAmount(prev => prev + diffAmount);
        } else {
            setNonTaxableAmount(prev => prev + diffAmount);
        }

        setTotal(prev => prev + diffAmount);
    };

    // Unit change handler
    const handleUnitChange = (productCode, newUnit) => {
        setUnits(prev => ({ ...prev, [productCode]: newUnit }));

        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        const oldPrice = unitPrices[productCode] || 0;
        const newPrice = newUnit === product.productUnit1?.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        const quantity = quantities[productCode] || 0;
        const oldAmount = quantity * oldPrice;
        const newAmount = quantity * newPrice;
        const diffAmount = newAmount - oldAmount;

        setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));
        setTotals(prev => ({ ...prev, [productCode]: newAmount }));

        if (product.tax1 === 'Y') {
            setTaxableAmount(prev => prev + diffAmount);
        } else {
            setNonTaxableAmount(prev => prev + diffAmount);
        }

        setTotal(prev => prev + diffAmount);
    };

    // Expiry date change handler
    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
    };

    // Temperature change handler
    const handleTemperatureChange = (productCode, temp) => {
        setTemperatures(prev => ({ ...prev, [productCode]: temp }));
    };

    // Tax status change handler
    const handleTaxStatusChange = (productCode, value) => {
        const oldTaxStatus = taxStatus[productCode] || 'N';
        const newTaxStatus = value;

        if (oldTaxStatus !== newTaxStatus) {
            const amount = totals[productCode] || 0;

            if (oldTaxStatus === 'Y' && newTaxStatus === 'N') {
                setTaxableAmount(prev => prev - amount);
                setNonTaxableAmount(prev => prev + amount);
            } else if (oldTaxStatus === 'N' && newTaxStatus === 'Y') {
                setTaxableAmount(prev => prev + amount);
                setNonTaxableAmount(prev => prev - amount);
            }
        }

        setTaxStatus(prev => ({ ...prev, [productCode]: value }));
    };

    // Calculate tax
    const calculateTax = () => {
        return taxableAmount * 0.07;
    };

    // Delete product handler
    const handleDeleteProduct = (productCode) => {
        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        const amount = totals[productCode] || 0;
        if (product.tax1 === 'Y' || taxStatus[productCode] === 'Y') {
            setTaxableAmount(prev => prev - amount);
        } else {
            setNonTaxableAmount(prev => prev - amount);
        }

        setTotal(prev => prev - amount);

        setProducts(prev => prev.filter(p => p.product_code !== productCode));

        const newQuantities = { ...quantities };
        delete newQuantities[productCode];
        setQuantities(newQuantities);

        const newUnits = { ...units };
        delete newUnits[productCode];
        setUnits(newUnits);

        const newUnitPrices = { ...unitPrices };
        delete newUnitPrices[productCode];
        setUnitPrices(newUnitPrices);

        const newTotals = { ...totals };
        delete newTotals[productCode];
        setTotals(newTotals);

        const newExpiryDates = { ...expiryDates };
        delete newExpiryDates[productCode];
        setExpiryDates(newExpiryDates);

        const newTemperatures = { ...temperatures };
        delete newTemperatures[productCode];
        setTemperatures(newTemperatures);

        const newTaxStatus = { ...taxStatus };
        delete newTaxStatus[productCode];
        setTaxStatus(newTaxStatus);
    };

    // Save handler
    const handleSave = async () => {
        if (!saveSupplier || !saveBranch || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a supplier, branch, and add at least one product.',
                timer: 1500
            });
            return;
        }

        try {
            Swal.fire({
                title: 'Saving receipt...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const headerData = {
                refno: lastRefNo,
                rdate: format(startDate, 'MM/dd/yyyy'),
                supplier_code: saveSupplier,
                branch_code: saveBranch,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2?.user_code || '',
                taxable: taxableAmount,
                nontaxable: nonTaxableAmount,
                total: total
            };

            const productArrayData = products.map(product => {
                const productCode = product.product_code;
                return {
                    refno: headerData.refno,
                    product_code: productCode,
                    qty: quantities[productCode]?.toString() || "1",
                    unit_code: units[productCode] || product.productUnit1?.unit_code || '',
                    uprice: unitPrices[productCode]?.toString() || "0",
                    tax1: taxStatus[productCode] || 'N',
                    amt: totals[productCode]?.toString() || "0",
                    expire_date: format(expiryDates[productCode] || new Date(), 'MM/dd/yyyy'),
                    texpire_date: format(expiryDates[productCode] || new Date(), 'yyyyMMdd'),
                    temperature1: temperatures[productCode] || '38'
                };
            });

            const footerData = {
                taxable: taxableAmount,
                nontaxable: nonTaxableAmount,
                total: total + calculateTax()
            };

            await dispatch(addBr_rfw({
                headerData,
                productArrayData,
                footerData
            })).unwrap();

            await Swal.fire({
                icon: 'success',
                title: 'Created receipt successfully',
                text: `Reference No: ${lastRefNo}`,
                showConfirmButton: false,
                timer: 1500
            });

            resetForm();
            onBack();

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error saving receipt',
                confirmButtonText: 'OK'
            });
        }
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
        setSaveSupplier('');
        setSaveBranch('');
        setSearchTerm('');
        setExpiryDates({});
        setTemperatures({});
        setTaxStatus({});
        setImageErrors({});
        setSelectedDispatchRefno('');
        setDispatchData(null);
        setTaxableAmount(0);
        setNonTaxableAmount(0);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: '#754C27' }} />
                <Typography sx={{ ml: 2 }}>Loading data...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Button onClick={onBack} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Back to Receipt From Warehouse
            </Button>

            {/* Status Information */}
            <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                    <strong>Status:</strong> Creating new receipt |
                    Products selected: {selectedProducts.length} |
                    {selectedDispatchRefno && (
                        <span> Based on dispatch: {selectedDispatchRefno} |</span>
                    )}
                    Supplier: {saveSupplier || 'None'} |
                    Restaurant: {saveBranch || 'None'} |
                    Total: ${total.toFixed(2)}
                </Typography>
            </Box>

            <Box sx={{
                width: '100%',
                bgcolor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E4E4E4',
                p: 3
            }}>
                {/* Dispatch Selection */}
                <Box sx={{ marginBottom: "20px" }}>
                    <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                        Select from Existing Dispatch
                    </Typography>
                    <Autocomplete
                        options={dispatchRefnos}
                        getOptionLabel={(option) =>
                            typeof option === 'string'
                                ? option
                                : `${option.refno} - To: ${option.branch} (${option.formattedDate})`
                        }
                        onChange={(_, newValue) => handleDispatchSelection(newValue?.refno || '')}
                        isOptionEqualToValue={(option, value) =>
                            option.refno === (typeof value === 'string' ? value : value?.refno)
                        }
                        renderOption={(props, option) => (
                            <Box component="li" {...props}>
                                <Box>
                                    <Typography variant="body1" fontWeight="bold">
                                        {option.refno}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        To: {option.branch}
                                    </Typography>
                                    <Typography variant="caption" color="primary">
                                        Date: {option.formattedDate}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search dispatch reference"
                                placeholder="Select dispatch to create receipt from"
                                variant="outlined"
                                sx={{ mb: 2 }}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loadingDispatch ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                </Box>

                <Grid2 container spacing={2}>
                    <Grid2 item size={{ xs: 12, md: 6 }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Ref.no
                        </Typography>
                        <TextField
                            value={lastRefNo}
                            disabled
                            size="small"
                            placeholder="Reference number"
                            fullWidth
                            sx={{
                                mt: 1,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px'
                                }
                            }}
                        />
                    </Grid2>

                    <Grid2 item size={{ xs: 12, md: 6 }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Date
                        </Typography>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => {
                                setStartDate(date);
                                handleGetLastRefNo(date);
                            }}
                            dateFormat="MM/dd/yyyy"
                            customInput={<CustomInput />}
                        />
                    </Grid2>

                    <Grid2 item size={{ xs: 12, md: 6 }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Restaurant
                        </Typography>
                        <Box
                            component="select"
                            value={saveBranch}
                            onChange={(e) => setSaveBranch(e.target.value)}
                            sx={{
                                mt: 1,
                                width: '100%',
                                height: '40px',
                                borderRadius: '10px',
                                padding: '0 14px',
                                border: '1px solid rgba(0, 0, 0, 0.23)',
                                '&:focus': {
                                    outline: 'none',
                                    borderColor: '#754C27'
                                }
                            }}
                        >
                            <option value="">Select Restaurant</option>
                            {branches.map((branch) => (
                                <option key={branch.branch_code} value={branch.branch_code}>
                                    {branch.branch_name}
                                </option>
                            ))}
                        </Box>
                    </Grid2>

                    <Grid2 item size={{ xs: 12, md: 6 }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Supplier
                        </Typography>
                        <Box
                            component="select"
                            value={saveSupplier}
                            onChange={(e) => setSaveSupplier(e.target.value)}
                            sx={{
                                mt: 1,
                                width: '100%',
                                height: '40px',
                                borderRadius: '10px',
                                padding: '0 14px',
                                border: '1px solid rgba(0, 0, 0, 0.23)',
                                '&:focus': {
                                    outline: 'none',
                                    borderColor: '#754C27'
                                }
                            }}
                        >
                            <option value="">Select Supplier</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.supplier_code} value={supplier.supplier_code}>
                                    {supplier.supplier_name}
                                </option>
                            ))}
                        </Box>
                    </Grid2>
                </Grid2>

                <Divider sx={{ my: 3 }} />

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
                                placeholder="Search products..."
                                size="small"
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: '#5A607F' }} />
                                        </InputAdornment>
                                    )
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
                    {products.length > 0 && (
                        <Button
                            onClick={resetForm}
                            sx={{
                                ml: 2,
                                bgcolor: '#E2EDFB',
                                color: '#754C27',
                                '&:hover': { bgcolor: '#d1e3f9' }
                            }}
                        >
                            Clear All
                        </Button>
                    )}
                </Box>

                <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>No.</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>Product Code</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>Product Name</th>
                                <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Expiry Date</th>
                                <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Temperature</th>
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
                                    <td colSpan="11" style={{ padding: '20px', textAlign: 'center', color: 'rgba(0, 0, 0, 0.6)' }}>
                                        No products yet. Please select a dispatch from the dropdown or add products using the search.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product, index) => (
                                    <tr key={product.product_code}>
                                        <td style={{ padding: '12px' }}>{index + 1}</td>
                                        <td style={{ padding: '12px' }}>{product.product_code}</td>
                                        <td style={{ padding: '12px' }}>{product.product_name}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <DatePicker
                                                selected={expiryDates[product.product_code]}
                                                onChange={(date) => handleExpiryDateChange(product.product_code, date)}
                                                dateFormat="MM/dd/yyyy"
                                                customInput={
                                                    <input
                                                        style={{
                                                            width: '110px',
                                                            padding: '8px',
                                                            textAlign: 'center',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                }
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <input
                                                type="text"
                                                value={temperatures[product.product_code] || ''}
                                                onChange={(e) => handleTemperatureChange(product.product_code, e.target.value)}
                                                style={{
                                                    width: '70px',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            <input
                                                type="number"
                                                min="1"
                                                value={quantities[product.product_code] || 1}
                                                onChange={(e) => handleQuantityChange(product.product_code, parseInt(e.target.value))}
                                                style={{
                                                    width: '60px',
                                                    padding: '8px',
                                                    textAlign: 'right',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <select
                                                value={units[product.product_code] || product.productUnit1?.unit_code}
                                                onChange={(e) => handleUnitChange(product.product_code, e.target.value)}
                                                style={{
                                                    padding: '8px',
                                                    width: '100px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ddd'
                                                }}
                                            >
                                                {product.productUnit1 && (
                                                    <option value={product.productUnit1.unit_code}>
                                                        {product.productUnit1.unit_name}
                                                    </option>
                                                )}
                                                {product.productUnit2 && (
                                                    <option value={product.productUnit2.unit_code}>
                                                        {product.productUnit2.unit_name}
                                                    </option>
                                                )}
                                            </select>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={unitPrices[product.product_code] || 0}
                                                onChange={(e) => {
                                                    const newPrice = parseFloat(e.target.value) || 0;
                                                    const oldPrice = unitPrices[product.product_code] || 0;
                                                    const quantity = quantities[product.product_code] || 0;
                                                    const diffAmount = (newPrice - oldPrice) * quantity;

                                                    setUnitPrices(prev => ({ ...prev, [product.product_code]: newPrice }));
                                                    setTotals(prev => {
                                                        const newTotal = (prev[product.product_code] || 0) + diffAmount;
                                                        return { ...prev, [product.product_code]: newTotal };
                                                    });

                                                    if (taxStatus[product.product_code] === 'Y') {
                                                        setTaxableAmount(prev => prev + diffAmount);
                                                    } else {
                                                        setNonTaxableAmount(prev => prev + diffAmount);
                                                    }

                                                    setTotal(prev => prev + diffAmount);
                                                }}
                                                style={{
                                                    width: '100px',
                                                    padding: '8px',
                                                    textAlign: 'right',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <select
                                                value={taxStatus[product.product_code] || 'N'}
                                                onChange={(e) => handleTaxStatusChange(product.product_code, e.target.value)}
                                                style={{
                                                    padding: '8px',
                                                    width: '70px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ddd'
                                                }}
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Non-taxable</Typography>
                        <Typography>${nonTaxableAmount.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Tax (7%)</Typography>
                        <Typography>${calculateTax().toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1, borderColor: 'white' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="h5" fontWeight="bold">Total</Typography>
                        <Typography variant="h5" fontWeight="bold">${(total + calculateTax()).toFixed(2)}</Typography>
                    </Box>
                </Box>

                <Button
                    onClick={handleSave}
                    variant="contained"
                    fullWidth
                    sx={{
                        mt: 2,
                        bgcolor: '#754C27',
                        color: 'white',
                        '&:hover': {
                            bgcolor: '#5A3D1E'
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