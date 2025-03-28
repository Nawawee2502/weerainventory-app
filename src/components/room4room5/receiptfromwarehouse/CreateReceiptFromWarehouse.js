import React, { useState, useEffect } from 'react';
import { Box, Button, InputAdornment, TextField, Typography, IconButton, Grid2, Divider, Autocomplete, CircularProgress, Select, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../api/productrecordApi';
import { Kt_rfwrefno, addKt_rfw, Kt_rfwUsedRefnos } from '../../../api/kitchen/kt_rfwApi';
import { kitchenAll } from '../../../api/kitchenApi';
import { wh_dpkAlljoindt, Wh_dpkByRefno } from '../../../api/warehouse/wh_dpkApi';
import { Wh_dpkdtAlljoindt } from '../../../api/warehouse/wh_dpkdtApi';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Swal from 'sweetalert2';
import { format, parse } from 'date-fns';

const formatDate = (date) => {
    if (!date) return null;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

const formatTRDate = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
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
    const [expiryDates, setExpiryDates] = useState({});
    const [temperatures, setTemperatures] = useState({});
    const [taxableAmount, setTaxableAmount] = useState(0);
    const [nonTaxableAmount, setNonTaxableAmount] = useState(0);
    const [total, setTotal] = useState(0);
    const [refNo, setRefNo] = useState('Please select dispatch to kitchen');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingDispatch, setLoadingDispatch] = useState(false);

    // For dispatch selection
    const [dispatchRefnos, setDispatchRefnos] = useState([]);
    const [selectedDispatchRefno, setSelectedDispatchRefno] = useState('');
    const [dispatchData, setDispatchData] = useState(null);

    const TAX_RATE = 0.07;
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson);

    useEffect(() => {
        loadKitchens();
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
                text: err.message || 'Failed to load kitchens'
            });
        }
    };

    const fetchAvailableDispatches = async (kitchenCode = saveKitchen) => {
        if (!kitchenCode) {
            setDispatchRefnos([]);
            return;
        }

        try {
            setIsLoading(true);

            // Get all used reference numbers first
            const usedRefnosResponse = await dispatch(Kt_rfwUsedRefnos()).unwrap();
            const usedRefnos = usedRefnosResponse.result ? usedRefnosResponse.data : [];

            // Get dispatches from the last 30 days
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);

            const rdate1 = format(thirtyDaysAgo, 'yyyyMMdd');
            const rdate2 = format(today, 'yyyyMMdd');

            // Get all dispatches to selected kitchen
            const response = await dispatch(wh_dpkAlljoindt({
                rdate1,
                rdate2,
                kitchen_code: kitchenCode,
                offset: 0,
                limit: 100
            })).unwrap();

            if (response.result && response.data) {
                // Filter out already used reference numbers
                const filteredDispatches = response.data.filter(item =>
                    !usedRefnos.includes(item.refno)
                );

                // Transform data for Autocomplete
                const dispatchOptions = filteredDispatches.map(item => ({
                    refno: item.refno,
                    kitchen: item.tbl_kitchen?.kitchen_name || 'Unknown',
                    date: item.rdate || 'Unknown Date',
                    formattedDate: item.rdate ?
                        format(parse(item.rdate, 'MM/dd/yyyy', new Date()), 'MM/dd/yyyy') :
                        'Unknown'
                }));

                setDispatchRefnos(dispatchOptions);

                // Only show the "no dispatches" alert if there are actually no unused dispatches
                if (dispatchOptions.length === 0) {
                    Swal.fire({
                        icon: 'info',
                        title: 'No Available Dispatches',
                        text: 'There are no available dispatches to this kitchen.',
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

    const handleDispatchSelection = async (refno) => {
        if (!refno) {
            resetForm();
            return;
        }

        try {
            console.log('Starting dispatch selection for refno:', refno);
            setLoadingDispatch(true);
            setSelectedDispatchRefno(refno);

            // Check if this dispatch is already used in kt_rfw
            console.log('Checking used refnos...');
            const usedRefnosResponse = await dispatch(Kt_rfwUsedRefnos()).unwrap();
            const usedRefnos = usedRefnosResponse.result ? usedRefnosResponse.data : [];
            console.log('Used refnos:', usedRefnos);

            if (usedRefnos.includes(refno)) {
                // If refno is already used, silently return without showing alert
                console.log(`Refno ${refno} is already used, skipping...`);
                setLoadingDispatch(false);
                return;
            }

            // Fetch header data
            console.log('Fetching header data for refno:', refno);
            const headerResponse = await dispatch(Wh_dpkByRefno({ refno })).unwrap();
            console.log('Header data response:', headerResponse);

            if (headerResponse.result && headerResponse.data) {
                const dispatchHeader = headerResponse.data;
                setDispatchData(dispatchHeader);

                // Set the refNo to be the same as the dispatch refno
                setRefNo(refno);

                // Set kitchen from dispatch
                setSaveKitchen(dispatchHeader.kitchen_code || '');
                console.log('Set kitchen_code to:', dispatchHeader.kitchen_code);

                // Fetch detail data
                console.log('Fetching detail data...');
                const detailResponse = await dispatch(Wh_dpkdtAlljoindt({ refno })).unwrap();
                console.log('Detail data response:', detailResponse);

                if (detailResponse.result && detailResponse.data && detailResponse.data.length > 0) {
                    console.log('Processing detail data...');
                    await processDispatchDetailData(detailResponse.data);
                } else {
                    console.log('No items found in dispatch');
                    Swal.fire({
                        icon: 'warning',
                        title: 'No Items',
                        text: 'This dispatch has no items.'
                    });
                }
            }
        } catch (error) {
            console.error("Error loading dispatch data:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load dispatch data: ' + error.message
            });
        } finally {
            setLoadingDispatch(false);
        }
    };

    const processDispatchDetailData = async (detailData) => {
        try {
            console.log('Processing dispatch detail data:', detailData);

            // เก็บข้อมูลสินค้าทั้งหมดที่มี tbl_product ให้ครบถ้วน
            const productsData = detailData.map(item => {
                console.log('Item data for product:', item.product_code, item);

                return {
                    ...item.tbl_product,
                    product_code: item.product_code,
                    product_name: item.tbl_product?.product_name || '',
                    tax1: item.tax1 || 'N',
                    // เก็บข้อมูล unit จากหลายแหล่ง
                    unit_code: item.unit_code,
                    unit_name: item.tbl_unit?.unit_name || '',
                    tbl_unit: item.tbl_unit,
                    productUnit1: item.tbl_product?.productUnit1,
                    productUnit2: item.tbl_product?.productUnit2,
                    bulk_unit_price: item.tbl_product?.bulk_unit_price || 0,
                    retail_unit_price: item.tbl_product?.retail_unit_price || 0
                };
            });

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
                if (!productCode) return;

                newQuantities[productCode] = parseFloat(item.qty) || 1;

                // เก็บข้อมูล unit_code จากตารางรายละเอียด
                newUnits[productCode] = item.unit_code ||
                    (item.tbl_product?.productUnit1?.unit_code || '');

                console.log(`Setting unit for ${productCode}: ${newUnits[productCode]}`);

                newUnitPrices[productCode] = parseFloat(item.uprice) || 0;
                newTotals[productCode] = parseFloat(item.amt) || 0;

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

                newTemperatures[productCode] = item.temperature1 || '38';
            });

            // Update all states
            setQuantities(newQuantities);
            setUnits(newUnits);
            setUnitPrices(newUnitPrices);
            setTotals(newTotals);
            setExpiryDates(newExpiryDates);
            setTemperatures(newTemperatures);

            // Calculate taxable and non-taxable amounts
            let newTaxable = 0;
            let newNonTaxable = 0;

            detailData.forEach(item => {
                const amount = parseFloat(item.amt) || 0;
                if (item.tax1 === 'Y') {
                    newTaxable += amount;
                } else {
                    newNonTaxable += amount;
                }
            });

            setTaxableAmount(newTaxable);
            setNonTaxableAmount(newNonTaxable);
            setTotal(Object.values(newTotals).reduce((sum, value) => sum + value, 0));

            console.log('Detail processing complete', {
                products: productsData,
                quantities: newQuantities,
                units: newUnits,
                prices: newUnitPrices,
                totals: newTotals,
                taxable: newTaxable,
                nonTaxable: newNonTaxable
            });

        } catch (error) {
            console.error('Error processing detail data:', error);
            throw error;
        }
    };

    // Handle kitchen selection
    const handleKitchenChange = (kitchenCode) => {
        setSaveKitchen(kitchenCode);

        // Clear selected dispatch when kitchen changes
        setSelectedDispatchRefno('');
        setDispatchData(null);
        setRefNo('Please select dispatch to kitchen');

        // Only fetch dispatches if a kitchen is selected
        if (kitchenCode) {
            fetchAvailableDispatches(kitchenCode);
        } else {
            // Clear dispatch options if no kitchen is selected
            setDispatchRefnos([]);
        }
    };

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

    const handleProductSelect = (product) => {
        if (products.some(p => p.product_code === product.product_code)) {
            Swal.fire({
                icon: 'warning',
                title: 'Product Already Added',
                text: 'This product is already in your list'
            });
            return;
        }

        setSearchTerm('');
        setShowDropdown(false);

        const newProducts = [...products, product];
        setProducts(newProducts);

        const initialQuantity = 1;
        const initialUnitCode = product.productUnit1.unit_code;
        const initialUnitPrice = product.bulk_unit_price;

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
        setExpiryDates(prev => ({
            ...prev,
            [product.product_code]: new Date()
        }));
        setTemperatures(prev => ({
            ...prev,
            [product.product_code]: ''
        }));

        calculateProductTotal(product.product_code, initialQuantity, initialUnitPrice);
    };

    const calculateProductTotal = (productCode, quantity, unitPrice) => {
        const amount = quantity * unitPrice;
        setTotals(prev => {
            const newTotals = { ...prev, [productCode]: amount };
            let totalAmount = 0;
            let newTaxable = 0;
            let newNonTaxable = 0;

            products.forEach(product => {
                const currentAmount = product.product_code === productCode
                    ? amount
                    : (newTotals[product.product_code] || 0);

                totalAmount += currentAmount;

                if (product.tax1 === 'Y') {
                    newTaxable += currentAmount;
                } else {
                    newNonTaxable += currentAmount;
                }
            });

            setTaxableAmount(newTaxable);
            setNonTaxableAmount(newNonTaxable);
            setTotal(totalAmount);

            return newTotals;
        });
    };

    const handleSave = async () => {
        if (!saveKitchen || products.length === 0 || refNo === 'Please select dispatch to kitchen') {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a kitchen, dispatch, and at least one product.'
            });
            return;
        }

        try {
            // Check if the current refno already exists in kt_rfw
            const usedRefnosResponse = await dispatch(Kt_rfwUsedRefnos()).unwrap();
            const usedRefnos = usedRefnosResponse.result ? usedRefnosResponse.data : [];

            if (usedRefnos.includes(refNo)) {
                // If refno is already used, silently return without showing alert
                console.log(`Refno ${refNo} is already used. Skipping save operation.`);
                return;
            }

            Swal.fire({
                title: 'Saving...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const headerData = {
                refno: refNo,
                rdate: formatDate(startDate),
                kitchen_code: saveKitchen,
                trdate: formatTRDate(startDate),
                monthh: String(startDate.getMonth() + 1).padStart(2, '0'),
                myear: startDate.getFullYear().toString(),
                user_code: userData2?.user_code
            };

            const productArrayData = products.map(product => ({
                refno: refNo,
                product_code: product.product_code,
                qty: quantities[product.product_code] || 0,
                unit_code: units[product.product_code] || product.productUnit1.unit_code,
                uprice: unitPrices[product.product_code] || 0,
                tax1: product.tax1,
                amt: totals[product.product_code] || 0,
                expire_date: expiryDates[product.product_code] ? formatDate(expiryDates[product.product_code]) : null,
                texpire_date: expiryDates[product.product_code] ? formatTRDate(expiryDates[product.product_code]) : null,
                temperature1: temperatures[product.product_code] || ''
            }));

            const footerData = {
                taxable: Number(taxableAmount),
                nontaxable: Number(nonTaxableAmount),
                total: Number(total)
            };

            const result = await dispatch(addKt_rfw({
                headerData,
                productArrayData,
                footerData
            })).unwrap();

            if (result.result) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Receipt from warehouse created successfully',
                    timer: 1500
                });
                resetForm();
                onBack();
            }
        } catch (error) {
            console.error('Error saving RFW:', error);

            // Check for specific error patterns related to duplicate entries
            const errorString = JSON.stringify(error);

            if (
                errorString.includes('ER_DUP_ENTRY') ||
                errorString.includes('Duplicate entry') ||
                errorString.includes('must be unique') ||
                errorString.includes('PRIMARY')
            ) {
                // Silently handle duplicate entry errors - just log to console without showing an alert
                console.log(`Duplicate reference number "${refNo}" detected during save.`);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to create receipt'
                });
            }
        }
    };

    const handleDeleteProduct = (productCode) => {
        setProducts(prev => prev.filter(p => p.product_code !== productCode));
        setQuantities(prev => {
            const { [productCode]: _, ...rest } = prev;
            return rest;
        });
        setUnits(prev => {
            const { [productCode]: _, ...rest } = prev;
            return rest;
        });
        setUnitPrices(prev => {
            const { [productCode]: _, ...rest } = prev;
            return rest;
        });
        setTotals(prev => {
            const { [productCode]: _, ...rest } = prev;
            return rest;
        });
        setExpiryDates(prev => {
            const { [productCode]: _, ...rest } = prev;
            return rest;
        });
        setTemperatures(prev => {
            const { [productCode]: _, ...rest } = prev;
            return rest;
        });

        calculateOrderTotals();
    };

    const calculateOrderTotals = (customTotals = null) => {
        const totalObj = customTotals || totals;
        let newTaxable = 0;
        let newNonTaxable = 0;
        let subTotal = 0;

        products.forEach(product => {
            const productCode = product.product_code;
            const amount = totalObj[productCode] || 0;

            subTotal += amount;

            if (product.tax1 === 'Y') {
                newTaxable += amount;
            } else {
                newNonTaxable += amount;
            }
        });

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setTotal(subTotal);
    };

    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({
            ...prev,
            [productCode]: date
        }));
    };

    const resetForm = () => {
        setProducts([]);
        setQuantities({});
        setUnits({});
        setUnitPrices({});
        setTotals({});
        setExpiryDates({});
        setTemperatures({});
        setSaveKitchen('');
        setTaxableAmount(0);
        setNonTaxableAmount(0);
        setTotal(0);
        setRefNo('Please select dispatch to kitchen');
        setSelectedDispatchRefno('');
        setDispatchData(null);
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

            <Box sx={{
                width: '100%',
                bgcolor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E4E4E4',
                p: 3
            }}>
                <Grid2 container spacing={2}>
                    <Grid2 item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Kitchen (Select First)
                        </Typography>
                        <Box
                            component="select"
                            value={saveKitchen}
                            onChange={(e) => handleKitchenChange(e.target.value)}
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
                            <option value="">Select Kitchen</option>
                            {kitchens.map((kitchen) => (
                                <option key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                                    {kitchen.kitchen_name}
                                </option>
                            ))}
                        </Box>
                    </Grid2>

                    <Grid2 item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Select from Available Dispatches
                        </Typography>
                        <Box sx={{ opacity: saveKitchen ? 1 : 0.5, mt: 1 }}>
                            <Autocomplete
                                options={dispatchRefnos}
                                getOptionLabel={(option) =>
                                    typeof option === 'string'
                                        ? option
                                        : `${option.refno} - To: ${option.kitchen} (${option.formattedDate})`
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
                                                To: {option.kitchen}
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
                                        placeholder={saveKitchen ? "Select dispatch to create receipt from" : "Select a kitchen first"}
                                        variant="outlined"
                                        size="small"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loadingDispatch ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px'
                                            }
                                        }}
                                    />
                                )}
                            />
                        </Box>
                    </Grid2>

                    <Grid2 item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Ref.no
                        </Typography>
                        <TextField
                            value={refNo}
                            disabled={true}
                            size="small"
                            placeholder="Enter reference number"
                            fullWidth
                            sx={{
                                mt: 1,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px'
                                },
                                '& .Mui-disabled': {
                                    WebkitTextFillColor: refNo === 'Please select dispatch to kitchen'
                                        ? '#d32f2f'
                                        : 'rgba(0, 0, 0, 0.38)',
                                }
                            }}
                        />
                    </Grid2>

                    <Grid2 item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Date
                        </Typography>
                        <DatePicker
                            selected={startDate}
                            onChange={setStartDate}
                            dateFormat="MM/dd/yyyy"
                            customInput={<CustomInput />}
                        />
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
                                    <td colSpan={11} style={{ padding: '20px', textAlign: 'center' }}>
                                        <Typography color="text.secondary">
                                            No products selected. Select a dispatch from the dropdown or add products from the search.
                                        </Typography>
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
                                                selected={expiryDates[product.product_code] || new Date()}
                                                onChange={(date) => handleExpiryDateChange(product.product_code, date)}
                                                dateFormat="MM/dd/yyyy"
                                                customInput={<CustomInput />}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <TextField
                                                size="small"
                                                value={temperatures[product.product_code] || '38'}
                                                onChange={(e) => {
                                                    setTemperatures(prev => ({
                                                        ...prev,
                                                        [product.product_code]: e.target.value
                                                    }));
                                                }}
                                                type="number"
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">°C</InputAdornment>,
                                                }}
                                                sx={{ width: '80px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={quantities[product.product_code] || 1}
                                                onChange={(e) => {
                                                    const newValue = parseInt(e.target.value) || 1;
                                                    setQuantities(prev => ({
                                                        ...prev,
                                                        [product.product_code]: newValue
                                                    }));
                                                    calculateProductTotal(
                                                        product.product_code,
                                                        newValue,
                                                        unitPrices[product.product_code]
                                                    );
                                                }}
                                                sx={{ width: '80px' }}
                                                inputProps={{ min: 1 }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <Select
                                                value={units[product.product_code] || product.unit_code || ''}
                                                onChange={(e) => {
                                                    const newUnit = e.target.value;
                                                    setUnits(prev => ({ ...prev, [product.product_code]: newUnit }));

                                                    // Calculate new price based on unit
                                                    let newPrice = unitPrices[product.product_code] || 0;
                                                    if (product.productUnit1 && newUnit === product.productUnit1.unit_code) {
                                                        newPrice = product.bulk_unit_price || 0;
                                                    } else if (product.productUnit2 && newUnit === product.productUnit2.unit_code) {
                                                        newPrice = product.retail_unit_price || 0;
                                                    }

                                                    setUnitPrices(prev => ({ ...prev, [product.product_code]: newPrice }));
                                                    calculateProductTotal(
                                                        product.product_code,
                                                        quantities[product.product_code] || 1,
                                                        newPrice
                                                    );
                                                }}
                                                size="small"
                                                sx={{ minWidth: 80 }}
                                            >
                                                {/* ตัวเลือกหลักจาก unit_code และ tbl_unit */}
                                                {product.unit_code && (
                                                    <MenuItem value={product.unit_code}>
                                                        {product.unit_name || (product.tbl_unit ? product.tbl_unit.unit_name : 'หน่วย')}
                                                    </MenuItem>
                                                )}

                                                {/* ถ้ามี productUnit1 และไม่ซ้ำกับ unit_code หลัก */}
                                                {product.productUnit1 && product.productUnit1.unit_code &&
                                                    product.productUnit1.unit_code !== product.unit_code && (
                                                        <MenuItem value={product.productUnit1.unit_code}>
                                                            {product.productUnit1.unit_name}
                                                        </MenuItem>
                                                    )}

                                                {/* ถ้ามี productUnit2 และไม่ซ้ำกับตัวเลือกอื่น */}
                                                {product.productUnit2 && product.productUnit2.unit_code &&
                                                    product.productUnit2.unit_code !== product.unit_code &&
                                                    (!product.productUnit1 || product.productUnit2.unit_code !== product.productUnit1.unit_code) && (
                                                        <MenuItem value={product.productUnit2.unit_code}>
                                                            {product.productUnit2.unit_name}
                                                        </MenuItem>
                                                    )}
                                            </Select>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={unitPrices[product.product_code] || 0}
                                                onChange={(e) => {
                                                    const newPrice = parseFloat(e.target.value) || 0;
                                                    setUnitPrices(prev => ({
                                                        ...prev,
                                                        [product.product_code]: newPrice
                                                    }));
                                                    calculateProductTotal(
                                                        product.product_code,
                                                        quantities[product.product_code],
                                                        newPrice
                                                    );
                                                }}
                                                sx={{ width: '100px' }}
                                                inputProps={{ min: 0, step: "0.01" }}
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
                    <Divider sx={{ my: 1, borderColor: 'white' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="h5" fontWeight="bold">Total</Typography>
                        <Typography variant="h5" fontWeight="bold">${total.toFixed(2)}</Typography>
                    </Box>
                </Box>

                <Button
                    onClick={handleSave}
                    variant="contained"
                    fullWidth
                    disabled={!refNo || refNo === 'Please select dispatch to kitchen' || products.length === 0}
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