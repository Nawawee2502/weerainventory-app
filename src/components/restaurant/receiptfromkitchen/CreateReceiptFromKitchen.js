import { Box, Button, InputAdornment, TextField, Typography, IconButton, Grid2, Divider, Select, MenuItem, CircularProgress, Autocomplete } from '@mui/material';
import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { addBr_rfk, Br_rfkrefno, Br_rfkUsedRefnos } from '../../../api/restaurant/br_rfkApi';
import { searchProductName } from '../../../api/productrecordApi';
import { kitchenAll } from '../../../api/kitchenApi';
import { branchAll } from '../../../api/branchApi';
import { Kt_dpbdtAlljoindt } from '../../../api/kitchen/kt_dpbdtApi';
import { Kt_dpbByRefno, kt_dpbAlljoindt } from '../../../api/kitchen/kt_dpbApi';
import Swal from 'sweetalert2';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format, parse } from 'date-fns';

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

export default function CreateGoodsReceiptKitchen({ onBack }) {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('Please select dispatch to kitchen');
    const [kitchen, setKitchen] = useState([]);
    const [saveKitchen, setSaveKitchen] = useState('');
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [totals, setTotals] = useState({});
    const [taxableAmount, setTaxableAmount] = useState(0);
    const [nonTaxableAmount, setNonTaxableAmount] = useState(0);
    const [total, setTotal] = useState(0);
    const [saleTax, setSaleTax] = useState(0);
    const [totalDue, setTotalDue] = useState(0);
    const [expiryDates, setExpiryDates] = useState({});
    const [temperatures, setTemperatures] = useState({});
    const [lastMonth, setLastMonth] = useState('');
    const [lastYear, setLastYear] = useState('');
    const [customPrices, setCustomPrices] = useState({});
    const [branch_code, setBranchCode] = useState('');
    const [branches, setBranches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [taxStatus, setTaxStatus] = useState({});

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

        // Fetch kitchens
        dispatch(kitchenAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((res) => setKitchen(res.data))
            .catch((err) => console.log(err.message));

        // Fetch branches
        dispatch(branchAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((res) => setBranches(res.data))
            .catch((err) => console.log(err.message));

        // Fetch available dispatches
        fetchAvailableDispatches();
    }, [dispatch]);

    // Fetch available dispatches from kitchen to branch
    const fetchAvailableDispatches = async (kitchenCode = saveKitchen) => {
        if (!kitchenCode) {
            // If no kitchen is selected, clear the dispatches
            setDispatchRefnos([]);
            return;
        }

        try {
            setIsLoading(true);

            // Get last 30 days of dispatches
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);

            const rdate1 = format(thirtyDaysAgo, 'yyyyMMdd');
            const rdate2 = format(today, 'yyyyMMdd');

            // Get all dispatches from selected kitchen
            const response = await dispatch(kt_dpbAlljoindt({
                rdate1,
                rdate2,
                kitchen_code: kitchenCode,
                offset: 0,
                limit: 100
            })).unwrap();

            // Get list of all already used refnos from br_rfk table
            const usedRefnosResponse = await dispatch(Br_rfkUsedRefnos()).unwrap();
            const usedRefnos = usedRefnosResponse.result ? usedRefnosResponse.data : [];

            if (response.result && response.data) {
                // Filter dispatches:
                // 1. Only from the selected kitchen
                // 2. Exclude refnos that already exist in br_rfk
                const filteredDispatches = response.data.filter(item =>
                    !usedRefnos.includes(item.refno)
                );

                // Transform data for Autocomplete
                const dispatchOptions = filteredDispatches.map(item => ({
                    refno: item.refno,
                    kitchen: item.tbl_kitchen?.kitchen_name || 'Unknown',
                    branch: item.tbl_branch?.branch_name || 'Unknown',
                    date: item.rdate || 'Unknown Date',
                    formattedDate: item.rdate ?
                        format(parse(item.rdate, 'MM/dd/yyyy', new Date()), 'MM/dd/yyyy') :
                        'Unknown'
                }));

                setDispatchRefnos(dispatchOptions);

                // Show alert if no dispatches are available
                if (dispatchOptions.length === 0) {
                    Swal.fire({
                        icon: 'info',
                        title: 'No Available Dispatches',
                        text: 'There are no available dispatches from this kitchen or all have been processed already.',
                        confirmButtonColor: '#754C27'
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching available dispatches:", error);
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

            // Check if this dispatch is already used in br_rfk
            const usedRefnosResponse = await dispatch(Br_rfkUsedRefnos()).unwrap();
            const usedRefnos = usedRefnosResponse.result ? usedRefnosResponse.data : [];

            if (usedRefnos.includes(refno)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Already Processed',
                    text: `Dispatch "${refno}" has already been processed. Please select another dispatch.`,
                    confirmButtonColor: '#754C27'
                });
                setLoadingDispatch(false);
                return;
            }

            // Fetch header data
            const headerResponse = await dispatch(Kt_dpbByRefno({ refno })).unwrap();

            if (headerResponse.result && headerResponse.data) {
                const dispatchHeader = headerResponse.data;
                setDispatchData(dispatchHeader);

                // Use the same refno from kt_dpb instead of generating a new one
                setLastRefNo(refno);

                // Set kitchen and branch from dispatch
                setSaveKitchen(dispatchHeader.kitchen_code || '');
                setBranchCode(dispatchHeader.branch_code || '');

                // Fetch detail data
                const detailResponse = await dispatch(Kt_dpbdtAlljoindt({ refno })).unwrap();

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
            const newCustomPrices = {};
            const newExpiryDates = {};
            const newTemperatures = {};
            const newTaxStatus = {};

            detailData.forEach((item) => {
                const productCode = item.product_code;
                if (!productCode) return;

                newQuantities[productCode] = parseFloat(item.qty) || 1;
                newUnits[productCode] = item.unit_code || '';
                newCustomPrices[productCode] = parseFloat(item.uprice) || 0;
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
            setCustomPrices(newCustomPrices);
            setExpiryDates(newExpiryDates);
            setTemperatures(newTemperatures);
            setTaxStatus(newTaxStatus);

            // Calculate order totals
            calculateOrderTotals(productsData, newQuantities, newCustomPrices, newUnits, newTaxStatus);

        } catch (error) {
            console.error('Error processing detail data:', error);
            throw error;
        }
    };

    const handleGetLastRefNo = async (selectedDate) => {
        try {
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);

            const res = await dispatch(Br_rfkrefno({
                month,
                year
            })).unwrap();

            if (!res.data || !res.data.refno) {
                setLastRefNo(`BRFK${year}${month}001`);
                return;
            }

            const lastRefNo = res.data.refno;
            const lastRefMonth = lastRefNo.substring(6, 8);
            const lastRefYear = lastRefNo.substring(4, 6);

            if (lastRefMonth !== month || lastRefYear !== year) {
                setLastRefNo(`BRFK${year}${month}001`);
                return;
            }

            const lastNumber = parseInt(lastRefNo.slice(-3));
            const newNumber = lastNumber + 1;
            setLastRefNo(`BRFK${year}${month}${String(newNumber).padStart(3, '0')}`);

        } catch (err) {
            console.error("Error generating refno:", err);
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);
            setLastRefNo(`BRFK${year}${month}001`);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 0) {
            dispatch(searchProductName({ product_name: value }))
                .unwrap()
                .then((res) => {
                    if (res.data) {
                        setSearchResults(res.data);
                        setShowDropdown(true);
                    }
                })
                .catch((err) => console.log(err.message));
        } else {
            setSearchResults([]);
            setShowDropdown(false);
        }
    };

    const handleProductSelect = (product) => {
        // Check if product already exists
        if (products.some(p => p.product_code === product.product_code)) {
            Swal.fire({
                icon: 'info',
                title: 'Product Already Added',
                text: 'This product is already in your order.',
                timer: 1500
            });
            setSearchTerm('');
            setShowDropdown(false);
            return;
        }

        product.amount = 1; // Set initial quantity
        setProducts([...products, product]);
        setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
        setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1.unit_code }));
        setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
        setTemperatures(prev => ({ ...prev, [product.product_code]: '38' }));
        setTaxStatus(prev => ({ ...prev, [product.product_code]: product.tax1 || 'N' }));

        // Set initial unit price based on selected unit
        const initialPrice = product.productUnit1.unit_code === product.productUnit1.unit_code ?
            product.bulk_unit_price : product.retail_unit_price;
        setCustomPrices(prev => ({ ...prev, [product.product_code]: initialPrice }));

        calculateOrderTotals();
        setSearchTerm('');
        setShowDropdown(false);
    };

    const handleDeleteProduct = (productCode) => {
        const updatedProducts = products.filter(p => p.product_code !== productCode);
        setProducts(updatedProducts);

        // Clean up associated state
        const { [productCode]: _, ...newQuantities } = quantities;
        const { [productCode]: __, ...newUnits } = units;
        const { [productCode]: ___, ...newCustomPrices } = customPrices;
        const { [productCode]: ____, ...newExpiryDates } = expiryDates;
        const { [productCode]: _____, ...newTemperatures } = temperatures;
        const { [productCode]: ______, ...newTaxStatus } = taxStatus;

        setQuantities(newQuantities);
        setUnits(newUnits);
        setCustomPrices(newCustomPrices);
        setExpiryDates(newExpiryDates);
        setTemperatures(newTemperatures);
        setTaxStatus(newTaxStatus);

        calculateOrderTotals(updatedProducts, newQuantities, newCustomPrices, newUnits, newTaxStatus);
    };

    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
    };

    const handleTemperatureChange = (productCode, temp) => {
        setTemperatures(prev => ({ ...prev, [productCode]: temp }));
    };

    const calculateOrderTotals = (
        productsList = products,
        qtyMap = quantities,
        priceMap = customPrices,
        unitMap = units,
        taxMap = taxStatus
    ) => {
        let newTaxable = 0;
        let newNonTaxable = 0;
        let newTotals = {};
        let newTotal = 0;

        productsList.forEach(product => {
            const productCode = product.product_code;
            const unit = unitMap[productCode] || (product.productUnit1 ? product.productUnit1.unit_code : '');

            // Get price from customPrices if set, otherwise determine based on unit
            const price = priceMap[productCode] ??
                (unit === (product.productUnit1 ? product.productUnit1.unit_code : '') ?
                    product.bulk_unit_price :
                    product.retail_unit_price);

            // Get quantity, defaulting to the amount property or 1
            const qty = qtyMap[productCode] || product.amount || 1;

            // Calculate line total
            const lineTotal = qty * price;
            newTotals[productCode] = lineTotal;
            newTotal += lineTotal;

            // Calculate taxable vs non-taxable
            if (taxMap[productCode] === 'Y' || product.tax1 === 'Y') {
                newTaxable += lineTotal;
            } else {
                newNonTaxable += lineTotal;
            }
        });

        const newSaleTax = newTaxable * TAX_RATE;
        const newTotalDue = newTotal + newSaleTax;

        setTotals(newTotals);
        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setSaleTax(newSaleTax);
        setTotal(newTotal);
        setTotalDue(newTotalDue);
    };

    const handleUnitChange = (productCode, newUnit) => {
        setUnits(prev => ({ ...prev, [productCode]: newUnit }));

        // Find product
        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        // Update price based on new unit
        const newPrice = newUnit === product.productUnit1.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        // Only auto-update price if user hasn't manually changed it
        if (!customPrices[productCode]) {
            setCustomPrices(prev => ({ ...prev, [productCode]: newPrice }));
        }

        calculateOrderTotals();
    };

    const handleAmountChange = (productCode, newAmount) => {
        // Update the product's amount directly
        const updatedProducts = products.map(product => {
            if (product.product_code === productCode) {
                return { ...product, amount: newAmount };
            }
            return product;
        });
        setProducts(updatedProducts);

        // Also update quantities state 
        setQuantities(prev => ({ ...prev, [productCode]: newAmount }));

        calculateOrderTotals(updatedProducts);
    };

    const handleSave = async () => {
        if (!saveKitchen || !branch_code || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please fill in all required fields.',
                timer: 1500
            });
            return;
        }

        try {
            Swal.fire({
                title: 'Saving...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const headerData = {
                refno: lastRefNo,
                rdate: formatDate(startDate),
                kitchen_code: saveKitchen,
                branch_code: branch_code,
                trdate: startDate.toISOString().slice(0, 10).replace(/-/g, ''),
                monthh: (startDate.getMonth() + 1).toString().padStart(2, '0'),
                myear: startDate.getFullYear(),
                user_code: userData2?.user_code || '',
                taxable: taxableAmount,
                nontaxable: nonTaxableAmount,
                total: total
            };

            const productArrayData = products.map(product => {
                const productCode = product.product_code;
                const amount = quantities[productCode] || product.amount || 0;
                const unitCode = units[productCode] || (product.productUnit1 ? product.productUnit1.unit_code : '');
                const price = customPrices[productCode] ??
                    (unitCode === (product.productUnit1 ? product.productUnit1.unit_code : '') ?
                        product.bulk_unit_price :
                        product.retail_unit_price);

                return {
                    refno: lastRefNo,
                    product_code: productCode,
                    qty: amount.toString(),
                    unit_code: unitCode,
                    uprice: price.toString(),
                    tax1: taxStatus[productCode] || product.tax1 || 'N',
                    expire_date: formatDate(expiryDates[productCode] || new Date()),
                    texpire_date: (expiryDates[productCode] || new Date()).toISOString().slice(0, 10).replace(/-/g, ''),
                    temperature1: temperatures[productCode] || '',
                    amt: (amount * price).toString()
                };
            });

            const footerData = {
                taxable: taxableAmount,
                nontaxable: nonTaxableAmount,
                total: totalDue
            };

            const result = await dispatch(addBr_rfk({
                headerData,
                productArrayData,
                footerData
            })).unwrap();

            if (result.result) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Receipt created successfully',
                    timer: 1500
                });
                resetForm();
                onBack();
            }
        } catch (error) {
            console.error('Error saving RFK:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error saving data',
                confirmButtonColor: '#754C27'
            });
        }
    };

    const resetForm = () => {
        setProducts([]);
        setQuantities({});
        setUnits({});
        setTotals({});
        setExpiryDates({});
        setTemperatures({});
        setSaveKitchen('');
        setBranchCode('');
        setTaxableAmount(0);
        setNonTaxableAmount(0);
        setTotal(0);
        setCustomPrices({});
        setTaxStatus({});
        setSelectedDispatchRefno('');
        setDispatchData(null);
        setLastRefNo('Please select dispatch to kitchen');
    };

    const handleKitchenChange = (kitchenCode) => {
        setSaveKitchen(kitchenCode);

        // Clear selected dispatch when kitchen changes
        setSelectedDispatchRefno('');
        setDispatchData(null);

        // Only fetch dispatches if a kitchen is selected
        if (kitchenCode) {
            fetchAvailableDispatches(kitchenCode);
        } else {
            // Clear dispatch options if no kitchen is selected
            setDispatchRefnos([]);
        }
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
            <Button
                onClick={onBack}
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2 }}
            >
                Back to Goods Receipt Kitchen
            </Button>

            <Box sx={{
                width: '100%',
                mt: '10px',
                flexDirection: 'column'
            }}>
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
                        {/* Added: Dispatch Selection */}
                        <Typography sx={{ fontSize: '18px', fontWeight: '600', mb: 2 }}>
                            Select from Available Dispatch
                        </Typography>
                        <Autocomplete
                            options={dispatchRefnos}
                            getOptionLabel={(option) =>
                                typeof option === 'string'
                                    ? option
                                    : `${option.refno} - From: ${option.kitchen} To: ${option.branch} (${option.formattedDate})`
                            }
                            onChange={(_, newValue) => handleDispatchSelection(newValue?.refno || '')}
                            disabled={!saveKitchen}
                            noOptionsText={saveKitchen ? "No available dispatches found" : "Select a kitchen first"}
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
                                            From: {option.kitchen} To: {option.branch}
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
                                    placeholder={saveKitchen ? "Select dispatch to create receipt from" : "Select a kitchen first"}
                                    variant="outlined"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingDispatch ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                    sx={{ mb: 3 }}
                                />
                            )}
                        />

                        <Grid2 container spacing={2}>
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Ref.no
                                </Typography>
                                <TextField
                                    value={lastRefNo}
                                    disabled
                                    size="small"
                                    placeholder='Reference Number'
                                    sx={{
                                        mt: '8px',
                                        width: '100%',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            fontWeight: '700'
                                        },
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
                                    Kitchen
                                </Typography>
                                <Box
                                    component="select"
                                    value={saveKitchen}
                                    onChange={(e) => handleKitchenChange(e.target.value)}
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
                                    <option value="">Select a kitchen</option>
                                    {kitchen.map((k) => (
                                        <option key={k.kitchen_code} value={k.kitchen_code}>
                                            {k.kitchen_name}
                                        </option>
                                    ))}
                                </Box>
                            </Grid2>

                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Branch
                                </Typography>
                                <Box
                                    component="select"
                                    value={branch_code}
                                    onChange={(e) => setBranchCode(e.target.value)}
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
                                            '&:focus': {
                                                outline: 'none',
                                                borderColor: '#754C27',
                                            },
                                            '& option': {
                                                fontSize: '16px',
                                            },
                                        }
                                    }}
                                >
                                    <option value="">Select Branch</option>
                                    {branches.map((branch) => (
                                        <option key={branch.branch_code} value={branch.branch_code}>
                                            {branch.branch_name}
                                        </option>
                                    ))}
                                </Box>
                            </Grid2>

                            <Divider sx={{ my: 3 }} />

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

                            <Box sx={{ overflowX: 'auto', width: '100%' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>No.</th>
                                            <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>Product Code</th>
                                            <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>Product Name</th>
                                            <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Expiry Date</th>
                                            <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Tax</th>
                                            <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Temperature</th>
                                            <th style={{ padding: '12px', textAlign: 'right', color: '#754C27', backgroundColor: '#f5f5f5' }}>Amount</th>
                                            <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Unit</th>
                                            <th style={{ padding: '12px', textAlign: 'right', color: '#754C27', backgroundColor: '#f5f5f5' }}>Unit Price</th>
                                            <th style={{ padding: '12px', textAlign: 'right', color: '#754C27', backgroundColor: '#f5f5f5' }}>Total</th>
                                            <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.length === 0 ? (
                                            <tr>
                                                <td colSpan={11} style={{ padding: '20px', textAlign: 'center' }}>
                                                    No products selected. Select dispatch from dropdown or search for products.
                                                </td>
                                            </tr>
                                        ) : (
                                            products.map((product, index) => {
                                                const productCode = product.product_code;
                                                const unit = units[productCode] || (product.productUnit1 ? product.productUnit1.unit_code : '');
                                                const price = customPrices[productCode] ??
                                                    (unit === (product.productUnit1 ? product.productUnit1.unit_code : '') ?
                                                        product.bulk_unit_price :
                                                        product.retail_unit_price);
                                                const amount = quantities[productCode] || product.amount || 0;
                                                const total = amount * price;

                                                return (
                                                    <tr key={productCode}>
                                                        <td style={{ padding: '12px' }}>{index + 1}</td>
                                                        <td style={{ padding: '12px' }}>{productCode}</td>
                                                        <td style={{ padding: '12px' }}>{product.product_name}</td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            <DatePicker
                                                                selected={expiryDates[productCode] || new Date()}
                                                                onChange={(date) => handleExpiryDateChange(productCode, date)}
                                                                dateFormat="MM/dd/yyyy"
                                                                customInput={
                                                                    <input
                                                                        style={{
                                                                            width: '110px',
                                                                            padding: '4px',
                                                                            textAlign: 'center',
                                                                            border: '1px solid #ddd',
                                                                            borderRadius: '4px'
                                                                        }}
                                                                    />
                                                                }
                                                            />
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            <select
                                                                value={taxStatus[productCode] || product.tax1 || 'N'}
                                                                onChange={(e) => {
                                                                    setTaxStatus(prev => ({
                                                                        ...prev,
                                                                        [productCode]: e.target.value
                                                                    }));
                                                                    calculateOrderTotals();
                                                                }}
                                                                style={{
                                                                    padding: '4px',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px',
                                                                    width: '60px'
                                                                }}
                                                            >
                                                                <option value="Y">Yes</option>
                                                                <option value="N">No</option>
                                                            </select>
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            <input
                                                                type="text"
                                                                value={temperatures[productCode] || ''}
                                                                onChange={(e) => handleTemperatureChange(productCode, e.target.value)}
                                                                style={{
                                                                    width: '80px',
                                                                    padding: '4px',
                                                                    textAlign: 'center',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px'
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                                            <input
                                                                type="number"
                                                                value={amount}
                                                                onChange={(e) => {
                                                                    const newAmount = Number(e.target.value);
                                                                    if (!isNaN(newAmount) && newAmount >= 0) {
                                                                        handleAmountChange(productCode, newAmount);
                                                                    }
                                                                }}
                                                                style={{
                                                                    width: '80px',
                                                                    padding: '4px',
                                                                    textAlign: 'right',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px'
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            <select
                                                                value={unit}
                                                                onChange={(e) => handleUnitChange(productCode, e.target.value)}
                                                                style={{
                                                                    padding: '4px',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px',
                                                                    width: '100px'
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
                                                                value={customPrices[productCode] ?? price}
                                                                onChange={(e) => {
                                                                    const newPrice = Number(e.target.value);
                                                                    if (!isNaN(newPrice) && newPrice >= 0) {
                                                                        setCustomPrices(prev => ({
                                                                            ...prev,
                                                                            [productCode]: newPrice
                                                                        }));
                                                                        calculateOrderTotals();
                                                                    }
                                                                }}
                                                                style={{
                                                                    width: '100px',
                                                                    padding: '4px',
                                                                    textAlign: 'right',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px'
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                                            ${total.toFixed(2)}
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            <IconButton
                                                                onClick={() => handleDeleteProduct(productCode)}
                                                                size="small"
                                                                sx={{ color: 'error.main' }}
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

                            <Box sx={{
                                mt: 3,
                                p: 2,
                                bgcolor: '#EAB86C',
                                borderRadius: '10px',
                                color: 'white',
                                width: '100%'
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    height: '100%'
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        width: '100%',
                                        mr: 'auto',
                                        justifyContent: 'space-between'
                                    }}>
                                        <Box>
                                            <Typography sx={{ color: '#FFFFFF' }}>Taxable</Typography>
                                            <Typography sx={{ color: '#FFFFFF' }}>Non-Taxable</Typography>
                                            <Typography sx={{ color: '#FFFFFF' }}>Total</Typography>
                                        </Box>
                                        <Box>
                                            <Typography sx={{ color: '#FFFFFF' }}>${taxableAmount.toFixed(2)}</Typography>
                                            <Typography sx={{ color: '#FFFFFF' }}>${nonTaxableAmount.toFixed(2)}</Typography>
                                            <Typography sx={{ color: '#FFFFFF' }}>${total.toFixed(2)}</Typography>
                                        </Box>
                                    </Box>

                                    <Divider orientation="vertical" flexItem sx={{ borderColor: '#754C27', mx: 2 }} />

                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        width: '100%',
                                        ml: 'auto',
                                        justifyContent: 'space-between'
                                    }}>
                                        <Box>
                                            <Typography sx={{ color: '#FFFFFF' }}>Sale Tax</Typography>
                                        </Box>
                                        <Box>
                                            <Typography sx={{ color: '#FFFFFF' }}>${saleTax.toFixed(2)}</Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: '8px' }}>
                                    <Typography sx={{ color: '#FFFFFF', fontSize: '30px', fontWeight: '600' }}>
                                        Total due
                                    </Typography>
                                    <Typography sx={{ color: '#FFFFFF', ml: 'auto', fontSize: '30px', fontWeight: '600' }}>
                                        ${totalDue.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Button
                                onClick={handleSave}
                                sx={{
                                    width: '100%',
                                    height: '48px',
                                    mt: '24px',
                                    bgcolor: '#754C27',
                                    color: '#FFFFFF',
                                    '&:hover': {
                                        bgcolor: '#5A3D1F',
                                    }
                                }}
                            >
                                Save
                            </Button>
                        </Grid2>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}