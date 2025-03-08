import { Box, Button, InputAdornment, TextField, Typography, IconButton, Grid2, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../api/productrecordApi';
import { branchAll } from '../../../api/branchApi';
import { kitchenAll } from '../../../api/kitchenApi';
import { addKt_dpb, kt_dpbrefno } from '../../../api/kitchen/kt_dpbApi';
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

export default function CreateDispatchToRestaurant({ onBack }) {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('');
    const [branches, setBranches] = useState([]);
    const [kitchens, setKitchens] = useState([]);
    const [saveBranch, setSaveBranch] = useState('');
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
    const TAX_RATE = 0.07;
    const [lastMonth, setLastMonth] = useState('');
    const [lastYear, setLastYear] = useState('');
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson);
    const [expiryDates, setExpiryDates] = useState({});
    const [temperatures, setTemperatures] = useState({});
    const [totalDue, setTotalDue] = useState(0);

    useEffect(() => {
        const currentDate = new Date();
        const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const currentYear = currentDate.getFullYear().toString().slice(-2);
        setLastMonth(currentMonth);
        setLastYear(currentYear);
        handleGetLastRefNo(currentDate);

        dispatch(branchAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((res) => {
                setBranches(res.data);
            })
            .catch((err) => console.log(err.message));

        dispatch(kitchenAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((res) => {
                setKitchens(res.data);
            })
            .catch((err) => console.log(err.message));
    }, [dispatch]);

    const handleGetLastRefNo = async (selectedDate) => {
        try {
            // Add month and year to the payload
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);

            const res = await dispatch(kt_dpbrefno({
                test: 10,
                month: month,
                year: year
            })).unwrap();

            // Add logging to debug response
            console.log('Ref No Response:', res);

            if (!res.data || !res.data.refno) {
                setLastRefNo(`KTDPB${year}${month}001`);
                return;
            }

            const lastRefNo = res.data.refno;
            const lastRefMonth = lastRefNo.substring(6, 8);
            const lastRefYear = lastRefNo.substring(4, 6);

            if (lastRefMonth !== month || lastRefYear !== year) {
                setLastRefNo(`KTDPB${year}${month}001`);
                return;
            }

            const lastNumber = parseInt(lastRefNo.slice(-3));
            const newNumber = lastNumber + 1;
            setLastRefNo(`KTDPB${year}${month}${String(newNumber).padStart(3, '0')}`);

        } catch (err) {
            console.error("Error generating refno:", err);
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);
            setLastRefNo(`KTDPB${year}${month}001`);
        }
    };

    // Improved handleProductSelect function with better warning message
    const handleProductSelect = (product) => {
        if (products.some(p => p.product_code === product.product_code)) {
            // More detailed warning message with consistent styling
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Product',
                text: `${product.product_name} is already in your dispatch. Please adjust the quantity instead.`,
                confirmButtonColor: '#754C27'
            });
            setSearchTerm('');
            setShowDropdown(false);
            return;
        }

        setProducts(prev => [...prev, product]);
        setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
        setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1.unit_code }));
        setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
        setTemperatures(prev => ({ ...prev, [product.product_code]: "" }));
        setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price }));

        setSearchTerm('');
        setShowDropdown(false);
        calculateOrderTotals([...products, product]);
    };

    // Updated handleSearchChange with Enter key functionality
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Add Enter key functionality
        if (e.key === 'Enter' && value.trim() !== '') {
            // Search for exact match
            dispatch(searchProductName({ product_name: value }))
                .unwrap()
                .then((res) => {
                    if (res.data && res.data.length > 0) {
                        // Find exact match or use the first result
                        const exactMatch = res.data.find(
                            product => product.product_name.toLowerCase() === value.toLowerCase()
                        );
                        const selectedProduct = exactMatch || res.data[0];

                        // Check for duplicate
                        if (products.some(p => p.product_code === selectedProduct.product_code)) {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Duplicate Product',
                                text: `${selectedProduct.product_name} is already in your dispatch. Please adjust the quantity instead.`,
                                confirmButtonColor: '#754C27'
                            });
                        } else {
                            // Add product if not a duplicate
                            setProducts(prev => [...prev, selectedProduct]);
                            setQuantities(prev => ({ ...prev, [selectedProduct.product_code]: 1 }));
                            setUnits(prev => ({ ...prev, [selectedProduct.product_code]: selectedProduct.productUnit1.unit_code }));
                            setExpiryDates(prev => ({ ...prev, [selectedProduct.product_code]: new Date() }));
                            setTemperatures(prev => ({ ...prev, [selectedProduct.product_code]: "" }));
                            setUnitPrices(prev => ({ ...prev, [selectedProduct.product_code]: selectedProduct.bulk_unit_price }));
                            calculateOrderTotals([...products, selectedProduct]);
                        }
                        setSearchTerm('');
                        setShowDropdown(false);
                    }
                })
                .catch((err) => console.log(err.message));
        } else if (value.length > 0) {
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

    const calculateOrderTotals = (currentProducts = products) => {
        let newTotals = {};
        let newTotal = 0;
        let newTaxable = 0;
        let newNonTaxable = 0;

        currentProducts.forEach(product => {
            const productCode = product.product_code;
            const quantity = quantities[productCode] || 1;
            const price = unitPrices[productCode] || (
                units[productCode] === product.productUnit1.unit_code
                    ? product.bulk_unit_price
                    : product.retail_unit_price
            );
            const lineTotal = quantity * price;

            newTotals[productCode] = lineTotal;
            if (product.tax1 === 'Y') {
                newTaxable += lineTotal;
            } else {
                newNonTaxable += lineTotal;
            }
            newTotal += lineTotal;
        });

        setTotals(newTotals);
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

    const handleUnitChange = (productCode, newUnitCode) => {
        setUnits(prev => ({
            ...prev,
            [productCode]: newUnitCode
        }));

        const product = products.find(p => p.product_code === productCode);
        const defaultUnitPrice = newUnitCode === product.productUnit1.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        setUnitPrices(prev => ({
            ...prev,
            [productCode]: defaultUnitPrice
        }));

        calculateOrderTotals();
    };

    const handleQuantityChange = (productCode, newQuantity) => {
        if (newQuantity >= 1) {
            setQuantities(prev => ({
                ...prev,
                [productCode]: newQuantity
            }));
            calculateOrderTotals();
        }
    };

    const handleUnitPriceChange = (productCode, value) => {
        const newPrice = parseFloat(value);
        if (!isNaN(newPrice) && newPrice >= 0) {
            setUnitPrices(prev => ({
                ...prev,
                [productCode]: newPrice
            }));
            calculateOrderTotals();
        }
    };

    const handleDeleteProduct = (productCode) => {
        setProducts(prev => prev.filter(p => p.product_code !== productCode));
        const newProducts = products.filter(p => p.product_code !== productCode);
        calculateOrderTotals(newProducts);
    };

    const handleTemperatureChange = (productCode, temperature) => {
        setTemperatures(prev => ({
            ...prev,
            [productCode]: temperature
        }));
    };

    const handleSave = async () => {
        if (!saveBranch || !saveKitchen || products.length === 0) {
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
                title: 'Saving dispatch...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const headerData = {
                refno: lastRefNo,
                rdate: format(startDate, 'MM/dd/yyyy'),
                branch_code: saveBranch,
                kitchen_code: saveKitchen,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2.user_code,
                taxable: taxableAmount.toString(),
                nontaxable: nonTaxableAmount.toString(),
                total: total.toString()
            };

            const productArrayData = products.map(product => ({
                refno: headerData.refno,
                product_code: product.product_code,
                qty: quantities[product.product_code].toString(),
                unit_code: units[product.product_code],
                uprice: (unitPrices[product.product_code] || product.bulk_unit_price).toString(),
                tax1: product.tax1,
                amt: totals[product.product_code].toString(),
                expire_date: format(expiryDates[product.product_code], 'MM/dd/yyyy'),
                texpire_date: format(expiryDates[product.product_code], 'yyyyMMdd'),
                temperature1: temperatures[product.product_code]
            }));

            const orderData = {
                headerData,
                productArrayData,
                footerData: {
                    total: total.toString()
                }
            };

            await dispatch(addKt_dpb(orderData)).unwrap();

            await Swal.fire({
                icon: 'success',
                title: 'Created dispatch successfully',
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
                text: error.message || 'Error saving dispatch',
                confirmButtonText: 'OK'
            });
        }
    };

    const resetForm = () => {
        setProducts([]);
        setQuantities({});
        setUnits({});
        setUnitPrices({});
        setTotals({});
        setTaxableAmount(0);
        setNonTaxableAmount(0);
        setTotal(0);
        setSaveBranch('');
        setSaveKitchen('');
        setSearchTerm('');
        setExpiryDates({});
        setTemperatures({});
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Button
                onClick={onBack}
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2 }}
            >
                Back to Dispatch to Restaurant
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
                                    placeholderText="MM/DD/YYYY"
                                    customInput={<CustomInput />}
                                />
                            </Grid2>
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Camissary Kitchen
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
                                    <option value="">Select a Camissary Kitchen</option>
                                    {kitchens.map((kitchen) => (
                                        <option key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                                            {kitchen.kitchen_name}
                                        </option>
                                    ))}
                                </Box>
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
                                    <option value="">Select a Restaurant</option>
                                    {branches.map((branch) => (
                                        <option key={branch.branch_code} value={branch.branch_code}>
                                            {branch.branch_name}
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
                                    placeholder="Search"
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
                                                    borderBottom: '1px solid #eee'
                                                }}
                                            >
                                                <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                                                    {product.product_name}
                                                </Typography>
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
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Tax</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Total</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '1%', color: '#754C27', fontWeight: '800' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, index) => {
                                        const productCode = product.product_code;
                                        const currentUnit = units[productCode] || product.productUnit1.unit_code;
                                        const currentQuantity = quantities[productCode] || 1;
                                        const currentUnitPrice = unitPrices[productCode] ??
                                            (currentUnit === product.productUnit1.unit_code
                                                ? product.bulk_unit_price
                                                : product.retail_unit_price);
                                        const currentTotal = (currentQuantity * currentUnitPrice).toFixed(2);

                                        return (
                                            <tr key={productCode}>
                                                <td style={{ padding: '4px', fontSize: '12px', fontWeight: '800' }}>{index + 1}</td>
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
                                                        onChange={(e) => handleQuantityChange(productCode, parseInt(e.target.value))}
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
                                                        <option value={product.productUnit1.unit_code}>{product.productUnit1.unit_name}</option>
                                                        <option value={product.productUnit2.unit_code}>{product.productUnit2.unit_name}</option>
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
                                                    {product.tax1 === 'Y' ? 'Yes' : 'No'}
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
                                    })}
                                </tbody>
                            </table>
                        </Box>

                        <Box sx={{ width: '100%', height: 'auto', bgcolor: '#EAB86C', borderRadius: '10px', p: '18px' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: '100%' }}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    width: '100%',
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
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: '8px' }}>
                                <Typography sx={{ color: '#FFFFFF', fontSize: '30px', fontWeight: '600' }}>
                                    Total due
                                </Typography>
                                <Typography sx={{ color: '#FFFFFF', ml: 'auto', fontSize: '30px', fontWeight: '600' }}>
                                    ${total.toFixed(2)}
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
                                    bgcolor: '#5C3D1F'
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