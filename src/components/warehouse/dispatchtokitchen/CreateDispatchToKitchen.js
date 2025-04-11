import { Box, Button, InputAdornment, TextField, Typography, IconButton, Grid2, Divider, Autocomplete, CircularProgress } from '@mui/material';
import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../api/productrecordApi';
import { kitchenAll } from '../../../api/kitchenApi';
import { addWh_dpk, wh_dpkrefno } from '../../../api/warehouse/wh_dpkApi';
import { kt_powAlljoindt, Kt_powByRefno, updateKt_pow } from '../../../api/kitchen/kt_powApi';
import { Kt_powdtAlljoindt, updateKt_powdt } from '../../../api/kitchen/kt_powdtApi';
import Swal from 'sweetalert2';
import { format, parse } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

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
    <Box sx={{ position: 'relative', display: 'inline-block', width: '100%', mt: '8px' }}>
        <TextField
            value={value}
            onClick={onClick}
            placeholder={placeholder || "MM/DD/YYYY"}
            ref={ref}
            size="small"
            sx={{
                '& .MuiInputBase-root': {
                    height: '40px',
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

export default function CreateDispatchToKitchen({ onBack }) {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('');
    const [kitchens, setKitchens] = useState([]);
    const [saveKitchen, setSaveKitchen] = useState('');
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [taxableAmount, setTaxableAmount] = useState(0);
    const [nonTaxableAmount, setNonTaxableAmount] = useState(0);
    const [lastMonth, setLastMonth] = useState('');
    const [lastYear, setLastYear] = useState('');
    const [expiryDates, setExpiryDates] = useState({});
    const [refNo, setRefNo] = useState('Please select purchase order');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPO, setLoadingPO] = useState(false);
    const [poRefno, setPoRefno] = useState('');
    const [temperatures, setTemperatures] = useState({});

    // Adding states for PO functionality
    const [originalQty, setOriginalQty] = useState({});
    const [remainingQty, setRemainingQty] = useState({});
    const [poRefnos, setPoRefnos] = useState([]);
    const [selectedPoRefno, setSelectedPoRefno] = useState('');
    const [poData, setPoData] = useState(null);

    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson);

    useEffect(() => {
        const currentDate = new Date();
        const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const currentYear = currentDate.getFullYear().toString().slice(-2);
        setLastMonth(currentMonth);
        setLastYear(currentYear);

        dispatch(kitchenAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((res) => {
                setKitchens(res.data);
            })
            .catch((err) => console.log(err.message));
    }, [dispatch]);

    useEffect(() => {
        // Set default temperature to 38 for all products
        if (products.length > 0) {
            const defaultTemps = {};
            products.forEach(product => {
                defaultTemps[product.product_code] = temperatures[product.product_code] || 38;
            });
            setTemperatures(defaultTemps);
        }
    }, [products]);

    const handleGetLastRefNo = async (selectedDate) => {
        try {
            // Pass the correct parameters
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);

            const res = await dispatch(wh_dpkrefno({
                month: month,
                year: year
            })).unwrap();

            if (!res.data || !res.data.refno) {
                setLastRefNo(`WDPK${year}${month}001`);
                return;
            }

            const lastRefNo = res.data.refno;
            const lastRefMonth = lastRefNo.substring(6, 8);
            const lastRefYear = lastRefNo.substring(4, 6);

            if (lastRefMonth !== month || lastRefYear !== year) {
                setLastRefNo(`WDPK${year}${month}001`);
                return;
            }

            const lastNumber = parseInt(lastRefNo.slice(-3));
            const newNumber = lastNumber + 1;
            setLastRefNo(`WDPK${year}${month}${String(newNumber).padStart(3, '0')}`);

            setLastMonth(month);
            setLastYear(year);
        } catch (err) {
            console.error("Error generating refno:", err);
            // Provide a fallback when API fails
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);
            setLastRefNo(`WDPK${year}${month}001`);
        }
    };

    const fetchAvailablePurchaseOrders = async (kitchenCode = saveKitchen) => {
        if (!kitchenCode) {
            setPoRefnos([]);
            return;
        }

        try {
            setIsLoading(true);

            // Get all purchase orders from the last 30 days
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);

            const rdate1 = format(thirtyDaysAgo, 'yyyyMMdd');
            const rdate2 = format(today, 'yyyyMMdd');

            // Get all purchase orders from selected kitchen
            const response = await dispatch(kt_powAlljoindt({
                rdate1,
                rdate2,
                kitchen_code: kitchenCode,
                offset: 0,
                limit: 100
            })).unwrap();

            if (response.result && response.data) {
                // Filter out POs with status 'end'
                const filteredPOs = response.data.filter(item => item.status !== 'end');

                // Transform data for Autocomplete
                const poOptions = filteredPOs.map(item => ({
                    refno: item.refno,
                    kitchen: item.tbl_kitchen?.kitchen_name || 'Unknown',
                    date: item.rdate || 'Unknown Date',
                    formattedDate: item.rdate ?
                        format(parse(item.rdate, 'MM/dd/yyyy', new Date()), 'MM/dd/yyyy') :
                        'Unknown'
                }));

                setPoRefnos(poOptions);

                // Only show the "no POs" alert if there are actually no unused POs
                if (poOptions.length === 0) {
                    Swal.fire({
                        icon: 'info',
                        title: 'No Available Purchase Orders',
                        text: 'There are no available purchase orders from this kitchen.',
                        confirmButtonColor: '#754C27'
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching available purchase orders:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch available purchase orders: ' + (error.message || 'Unknown error')
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePOSelection = async (refno) => {
        if (!refno) {
            resetForm();
            return;
        }

        try {
            console.log('Starting PO selection for refno:', refno);
            setLoadingPO(true);
            setSelectedPoRefno(refno);
            setPoRefno(refno);

            // Fetch header data first to check status
            console.log('Fetching header data for refno:', refno);
            const headerResponse = await dispatch(Kt_powByRefno({ refno })).unwrap();
            console.log('Header data response:', headerResponse);

            if (headerResponse.result && headerResponse.data) {
                const poHeader = headerResponse.data;

                // Check if the PO is already completed (status = 'end')
                if (poHeader.status === 'end') {
                    Swal.fire({
                        icon: 'info',
                        title: 'Purchase Order Already Completed',
                        text: 'This purchase order has already been fully dispatched.',
                        confirmButtonColor: '#754C27'
                    });
                    setLoadingPO(false);
                    return;
                }

                setPoData(poHeader);

                // Generate a new refno for dispatch
                await handleGetLastRefNo(startDate);

                // Display PO refno for reference
                setRefNo(refno);

                // Set kitchen from PO data
                setSaveKitchen(poHeader.kitchen_code || '');
                console.log('Set kitchen_code to:', poHeader.kitchen_code);

                // Fetch detail data
                console.log('Fetching detail data...');
                const detailResponse = await dispatch(Kt_powdtAlljoindt({ refno })).unwrap();
                console.log('Detail data response:', detailResponse);

                if (detailResponse.result && detailResponse.data && detailResponse.data.length > 0) {
                    console.log('Processing detail data...');
                    await processPODetailData(detailResponse.data);
                } else {
                    console.log('No items found in purchase order');
                    Swal.fire({
                        icon: 'warning',
                        title: 'No Items',
                        text: 'This purchase order has no items.',
                        confirmButtonColor: '#754C27'
                    });
                }
            }
        } catch (error) {
            console.error("Error loading PO data:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load purchase order data: ' + error.message
            });
        } finally {
            setLoadingPO(false);
        }
    };

    const processPODetailData = async (detailData) => {
        try {
            console.log('Processing PO detail data:', detailData);

            // Filter only products with remaining quantity
            const availableItems = detailData.filter(item => {
                const total = parseFloat(item.qty) || 0;
                const sent = parseFloat(item.qty_send) || 0;
                return total > sent; // Only products not fully dispatched
            });

            if (availableItems.length === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'No Products Available',
                    text: 'All products in this purchase order have already been dispatched.',
                    confirmButtonColor: '#754C27'
                });
                return;
            }

            // Store product data
            const productsData = availableItems.map(item => {
                return {
                    ...item.tbl_product,
                    product_code: item.product_code,
                    product_name: item.tbl_product?.product_name || '',
                    tax1: item.tax1 || 'N',
                    unit_code: item.unit_code,
                    unit_name: item.tbl_unit?.unit_name || '',
                    tbl_unit: item.tbl_unit,
                    productUnit1: item.tbl_product?.productUnit1,
                    productUnit2: item.tbl_product?.productUnit2,
                    bulk_unit_price: item.tbl_product?.bulk_unit_price || 0,
                    retail_unit_price: item.tbl_product?.retail_unit_price || 0,
                    original_qty: parseFloat(item.qty) || 0,
                    qty_send: parseFloat(item.qty_send) || 0
                };
            });

            setProducts(productsData);

            // Create new state objects
            const newQuantities = {};
            const newUnits = {};
            const newUnitPrices = {};
            const newTotals = {};
            const newExpiryDates = {};
            const newOriginalQty = {};
            const newRemainingQty = {};

            availableItems.forEach((item) => {
                const productCode = item.product_code;
                if (!productCode) return;

                const totalQty = parseFloat(item.qty) || 0;
                const sentQty = parseFloat(item.qty_send) || 0;
                const remainingQty = totalQty - sentQty;

                // Store original and remaining quantities
                newOriginalQty[productCode] = totalQty;
                newRemainingQty[productCode] = remainingQty;

                // Set quantity to dispatch as the remaining quantity
                newQuantities[productCode] = remainingQty;

                // Store unit_code
                newUnits[productCode] = item.unit_code ||
                    (item.tbl_product?.productUnit1?.unit_code || '');

                newUnitPrices[productCode] = parseFloat(item.uprice) || 0;
                newTotals[productCode] = remainingQty * parseFloat(item.uprice || 0);

                // Set expiry date
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

            // Update states
            setQuantities(newQuantities);
            setUnits(newUnits);
            setUnitPrices(newUnitPrices);
            setTotals(newTotals);
            setExpiryDates(newExpiryDates);
            setOriginalQty(newOriginalQty);
            setRemainingQty(newRemainingQty);

            // Calculate amounts
            let newTaxable = 0;
            let newNonTaxable = 0;

            availableItems.forEach(item => {
                const productCode = item.product_code;
                const amount = newTotals[productCode] || 0;
                if (item.tax1 === 'Y') {
                    newTaxable += amount;
                } else {
                    newNonTaxable += amount;
                }
            });

            setTaxableAmount(newTaxable);
            setNonTaxableAmount(newNonTaxable);
            setTotal(Object.values(newTotals).reduce((sum, value) => sum + value, 0));

        } catch (error) {
            console.error('Error processing detail data:', error);
            throw error;
        }
    };

    // Handle kitchen selection
    const handleKitchenChange = (kitchenCode) => {
        setSaveKitchen(kitchenCode);

        // Clear selected PO when kitchen changes
        setSelectedPoRefno('');
        setPoData(null);
        setRefNo('Please select purchase order');

        // Only fetch POs if a kitchen is selected
        if (kitchenCode) {
            fetchAvailablePurchaseOrders(kitchenCode);
        } else {
            // Clear PO options if no kitchen is selected
            setPoRefnos([]);
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
                text: 'This product is already in your list',
                confirmButtonColor: '#754C27'
            });
            return;
        }

        setSearchTerm('');
        setShowDropdown(false);

        const newProducts = [...products, product];
        setProducts(newProducts);

        const initialQuantity = 1;
        const initialUnitCode = product.productUnit1?.unit_code;
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
            [product.product_code]: 38 // Default temperature to 38
        }));

        calculateProductTotal(product.product_code, initialQuantity, initialUnitPrice);
    };

    const handleTemperatureChange = (productCode, value) => {
        const newTemp = parseFloat(value);
        if (!isNaN(newTemp)) {
            setTemperatures(prev => ({
                ...prev,
                [productCode]: newTemp
            }));
        }
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

    const handleQuantityChange = (productCode, newQuantity) => {
        // Check maximum allowed quantity if from PO
        if (selectedPoRefno) {
            const maxQuantity = remainingQty[productCode] || 1;

            // Check if quantity exceeds what's remaining
            if (newQuantity > maxQuantity) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Quantity Limit Exceeded',
                    text: `You can only dispatch up to ${maxQuantity} units for this product`,
                    confirmButtonColor: '#754C27'
                });
                newQuantity = maxQuantity;
            }
        }

        if (newQuantity >= 1) {
            const product = products.find(p => p.product_code === productCode);
            const unit = units[productCode] || (product.productUnit1?.unit_code || '');
            const unitPrice = unitPrices[productCode] || 0;

            setQuantities(prev => ({
                ...prev,
                [productCode]: newQuantity
            }));

            calculateProductTotal(productCode, newQuantity, unitPrice);
        }
    };

    const handleUnitPriceChange = (productCode, value) => {
        const newPrice = parseFloat(value);
        if (!isNaN(newPrice) && newPrice >= 0) {
            const quantity = quantities[productCode] || 1;

            setUnitPrices(prev => ({
                ...prev,
                [productCode]: newPrice
            }));

            calculateProductTotal(productCode, quantity, newPrice);
        }
    };

    const handleUnitChange = (productCode, newUnitCode) => {
        setUnits(prev => ({
            ...prev,
            [productCode]: newUnitCode
        }));

        const product = products.find(p => p.product_code === productCode);
        let newPrice = unitPrices[productCode] || 0;

        // Update price based on unit if it's a product unit change
        if (product.productUnit1 && newUnitCode === product.productUnit1.unit_code) {
            newPrice = product.bulk_unit_price || 0;
        } else if (product.productUnit2 && newUnitCode === product.productUnit2.unit_code) {
            newPrice = product.retail_unit_price || 0;
        }

        setUnitPrices(prev => ({
            ...prev,
            [productCode]: newPrice
        }));

        const quantity = quantities[productCode] || 1;
        calculateProductTotal(productCode, quantity, newPrice);
    };

    const handleDeleteProduct = (productCode) => {
        setProducts(prev => prev.filter(p => p.product_code !== productCode));

        // Clear related state for the deleted product
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

        // Recalculate order totals
        const updatedProducts = products.filter(p => p.product_code !== productCode);
        let newTaxable = 0;
        let newNonTaxable = 0;
        let newTotal = 0;

        updatedProducts.forEach(product => {
            const amount = totals[product.product_code] || 0;
            newTotal += amount;

            if (product.tax1 === 'Y') {
                newTaxable += amount;
            } else {
                newNonTaxable += amount;
            }
        });

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setTotal(newTotal);
    };

    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({
            ...prev,
            [productCode]: date
        }));
    };

    const handleSave = async () => {
        if (!saveKitchen || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a kitchen and ensure there is at least one product.',
                confirmButtonColor: '#754C27'
            });
            return;
        }

        try {
            Swal.fire({
                title: 'Saving...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            // Step 1: Prepare and save the dispatch data
            const headerData = {
                refno: lastRefNo,
                po_refno: poRefno,
                rdate: formatDate(startDate),
                kitchen_code: saveKitchen,
                trdate: formatTRDate(startDate),
                monthh: String(startDate.getMonth() + 1).padStart(2, '0'),
                myear: startDate.getFullYear().toString(),
                user_code: userData2?.user_code,
                po_refno: selectedPoRefno, // Make sure this is always sent, even if null
                taxable: Number(taxableAmount),
                nontaxable: Number(nonTaxableAmount)
            };

            const productArrayData = products.map(product => {
                const productCode = product.product_code;
                return {
                    refno: lastRefNo,
                    product_code: productCode,
                    qty: quantities[productCode] || 0,
                    unit_code: units[productCode] || (product.productUnit1?.unit_code || ''),
                    uprice: unitPrices[productCode] || 0,
                    tax1: product.tax1,
                    amt: totals[productCode] || 0,
                    expire_date: expiryDates[productCode] ? formatDate(expiryDates[productCode]) : null,
                    texpire_date: expiryDates[productCode] ? formatTRDate(expiryDates[productCode]) : null,
                    temperature1: temperatures[productCode] || 38
                };
            });

            const footerData = {
                taxable: Number(taxableAmount),
                nontaxable: Number(nonTaxableAmount),
                total: Number(total)
            };

            // Step 2: Save the dispatch
            const result = await dispatch(addWh_dpk({
                headerData,
                productArrayData,
                footerData
            })).unwrap();

            if (result.result) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Dispatch to kitchen created successfully',
                    timer: 1500,
                    confirmButtonColor: '#754C27'
                });
                resetForm();
                onBack();
            }
        } catch (error) {
            console.error('Error saving DPK:', error);

            // Extract the detailed error message from the server response
            let errorMessage = 'An error occurred while saving';

            if (error.response) {
                console.log('Server response error data:', error.response.data);

                if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data && error.response.data.errorDetail) {
                    errorMessage = error.response.data.errorDetail;
                } else if (error.response.status === 500) {
                    errorMessage = 'Internal Server Error (500): ' + (error.response.statusText || 'Unknown server error');
                }
            } else if (error.request) {
                errorMessage = 'No response received from server. Please check your connection.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonColor: '#754C27',
                footer: process.env.NODE_ENV === 'development' ?
                    `<span style="font-size: 12px; color: #666;">Technical details: ${error.stack ? error.stack.split('\n')[0] : 'No stack trace'}</span>` : ''
            });
        }
    };

    const resetForm = async () => {
        setProducts([]);
        setQuantities({});
        setUnits({});
        setUnitPrices({});
        setTotals({});
        setExpiryDates({});
        setSaveKitchen('');
        setTaxableAmount(0);
        setNonTaxableAmount(0);
        setTotal(0);
        setRefNo('Please select purchase order');
        setSelectedPoRefno('');
        setPoData(null);
        setLastRefNo('');
        setOriginalQty({});
        setRemainingQty({});
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
                Back to Dispatch to Kitchen
            </Button>

            <Box sx={{
                width: '100%',
                bgcolor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E4E4E4',
                p: 3
            }}>
                <Grid2 container spacing={2}>
                    <Grid2 item size={{ xs: 12, md: 6 }}>
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

                    <Grid2 item size={{ xs: 12, md: 6 }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Select from Available Purchase Orders
                        </Typography>
                        <Box sx={{ opacity: saveKitchen ? 1 : 0.5, mt: 1 }}>
                            <Autocomplete
                                options={poRefnos}
                                getOptionLabel={(option) =>
                                    typeof option === 'string'
                                        ? option
                                        : `${option.refno} - From: ${option.kitchen} (${option.formattedDate})`
                                }
                                onChange={(_, newValue) => handlePOSelection(newValue?.refno || '')}
                                disabled={!saveKitchen}
                                noOptionsText={saveKitchen ? "No available purchase orders found" : "Select a kitchen first"}
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
                                                From: {option.kitchen}
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
                                        placeholder={saveKitchen ? "Select purchase order to create dispatch from" : "Select a kitchen first"}
                                        variant="outlined"
                                        size="small"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loadingPO ? <CircularProgress color="inherit" size={20} /> : null}
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

                    <Grid2 item size={{ xs: 12, md: 6 }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Dispatch Ref.No
                        </Typography>
                        <TextField
                            value={lastRefNo || "Will be generated automatically"}
                            disabled
                            size="small"
                            placeholder='Dispatch Ref.No'
                            sx={{
                                mt: 1,
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
                            Original PO Ref.No
                        </Typography>
                        <TextField
                            value={selectedPoRefno || refNo}
                            disabled
                            size="small"
                            placeholder='PO Ref.No'
                            sx={{
                                mt: 1,
                                width: '100%',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    fontWeight: '700'
                                },
                                '& .Mui-disabled': {
                                    WebkitTextFillColor: refNo === 'Please select purchase order'
                                        ? '#d32f2f'
                                        : 'rgba(0, 0, 0, 0.38)',
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
                            onChange={(date) => setStartDate(date)}
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
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && searchTerm.length > 0) {
                                        dispatch(searchProductName({ product_name: searchTerm }))
                                            .unwrap()
                                            .then((res) => {
                                                if (res.data && res.data.length > 0) {
                                                    const exactMatch = res.data.find(
                                                        product => product.product_name.toLowerCase() === searchTerm.toLowerCase()
                                                    );
                                                    const selectedProduct = exactMatch || res.data[0];
                                                    handleProductSelect(selectedProduct);
                                                }
                                            })
                                            .catch((err) => console.log(err.message));
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
                                <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Temperature (°C)</th>
                                <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Expiry Date</th>
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
                                            No products selected. Select a purchase order from the dropdown or add products from the search.
                                        </Typography>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product, index) => {
                                    const productCode = product.product_code;
                                    return (
                                        <tr key={productCode}>
                                            <td style={{ padding: '12px' }}>{index + 1}</td>
                                            <td style={{ padding: '12px' }}>{productCode}</td>
                                            <td style={{ padding: '12px' }}>{product.product_name}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={temperatures[productCode] || 38}
                                                    onChange={(e) => {
                                                        handleTemperatureChange(productCode, e.target.value);
                                                    }}
                                                    sx={{ width: '80px' }}
                                                    inputProps={{ min: 0, step: "1" }}
                                                />
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <DatePicker
                                                    selected={expiryDates[productCode] || new Date()}
                                                    onChange={(date) => handleExpiryDateChange(productCode, date)}
                                                    dateFormat="MM/dd/yyyy"
                                                    customInput={<CustomInput />}
                                                />
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={quantities[productCode] || 1}
                                                    onChange={(e) => {
                                                        const newValue = parseInt(e.target.value) || 1;
                                                        handleQuantityChange(productCode, newValue);
                                                    }}
                                                    sx={{ width: '80px' }}
                                                    inputProps={{ min: 1 }}
                                                />
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <Box
                                                    component="select"
                                                    value={units[productCode] || ''}
                                                    onChange={(e) => handleUnitChange(productCode, e.target.value)}
                                                    sx={{
                                                        p: 1,
                                                        borderRadius: '4px',
                                                        border: '1px solid rgba(0, 0, 0, 0.23)',
                                                        minWidth: '80px'
                                                    }}
                                                >
                                                    {/* Main unit option from unit_code and tbl_unit */}
                                                    {product.unit_code && (
                                                        <option value={product.unit_code}>
                                                            {product.unit_name || (product.tbl_unit ? product.tbl_unit.unit_name : 'Unit')}
                                                        </option>
                                                    )}

                                                    {/* If productUnit1 exists and is not the same as the main unit_code */}
                                                    {product.productUnit1 && product.productUnit1.unit_code &&
                                                        product.productUnit1.unit_code !== product.unit_code && (
                                                            <option value={product.productUnit1.unit_code}>
                                                                {product.productUnit1.unit_name}
                                                            </option>
                                                        )}

                                                    {/* If productUnit2 exists and is not a duplicate of other options */}
                                                    {product.productUnit2 && product.productUnit2.unit_code &&
                                                        product.productUnit2.unit_code !== product.unit_code &&
                                                        (!product.productUnit1 || product.productUnit2.unit_code !== product.productUnit1.unit_code) && (
                                                            <option value={product.productUnit2.unit_code}>
                                                                {product.productUnit2.unit_name}
                                                            </option>
                                                        )}
                                                </Box>
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={unitPrices[productCode] || 0}
                                                    onChange={(e) => {
                                                        handleUnitPriceChange(productCode, e.target.value);
                                                    }}
                                                    sx={{ width: '100px' }}
                                                    inputProps={{ min: 0, step: "0.01" }}
                                                />
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                {product.tax1 === 'Y' ? 'Yes' : 'No'}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                                {(totals[productCode] || 0).toFixed(2)}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <IconButton
                                                    onClick={() => handleDeleteProduct(productCode)}
                                                    color="error"
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
                    disabled={!saveKitchen || products.length === 0}
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