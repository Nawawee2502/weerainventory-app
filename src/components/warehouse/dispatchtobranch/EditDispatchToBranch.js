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
import { updateWh_dpb, Wh_dpbByRefno } from '../../../api/warehouse/wh_dpbApi';
import { Wh_dpbdtAlljoindt, updateWh_dpbdt, deleteWh_dpbdt, addWh_dpbdt } from '../../../api/warehouse/wh_dpbdtApi';
import Swal from 'sweetalert2';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
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

function EditDispatchToBranch({ onBack, editRefno }) {
    const dispatch = useDispatch();
    const [editDate, setEditDate] = useState(new Date());
    const [branches, setBranches] = useState([]);
    const [saveBranch, setSaveBranch] = useState('');
    const [products, setProducts] = useState([]);
    const [originalProducts, setOriginalProducts] = useState([]);
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
    const [expiryDates, setExpiryDates] = useState({});
    const [temperatures, setTemperatures] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [taxStatus, setTaxStatus] = useState({});
    const TAX_RATE = 0.07;

    useEffect(() => {
        let offset = 0;
        let limit = 100;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                console.log('Fetching data for refno:', editRefno);

                // Check if editRefno is a string or object
                const refnoParam = typeof editRefno === 'object' ? editRefno.refno || '' : editRefno;
                console.log('Using refno param:', refnoParam);

                const [branchRes, dpbRes] = await Promise.all([
                    dispatch(branchAll({ offset, limit })).unwrap(),
                    dispatch(Wh_dpbByRefno({ refno: refnoParam })).unwrap()
                ]);

                setBranches(branchRes.data || []);

                if (dpbRes?.data) {
                    const dpbData = dpbRes.data;
                    console.log("Fetched dispatch data:", dpbData);

                    if (dpbData.rdate) {
                        try {
                            const parsedDate = parse(dpbData.rdate, 'MM/dd/yyyy', new Date());
                            if (!isNaN(parsedDate.getTime())) {
                                setEditDate(parsedDate);
                            }
                        } catch (error) {
                            console.error("Error parsing date:", error);
                            setEditDate(new Date());
                        }
                    }

                    setSaveBranch(dpbData.branch_code || '');

                    // Fetch detail data
                    const detailResponse = await dispatch(Wh_dpbdtAlljoindt({ refno: refnoParam })).unwrap();
                    console.log("Fetched detail data:", detailResponse);

                    if (detailResponse.result && detailResponse.data) {
                        const initialProducts = detailResponse.data.map(item => ({
                            ...item,
                            product_code: item.product_code,
                            product_name: item.product_name || item.tbl_product?.product_name,
                            amount: item.qty,
                            unit_code: item.unit_code,
                            uprice: item.uprice,
                            tax1: item.tax1,
                            isNewProduct: false,
                            productUnit1: item.productUnit1 || item.tbl_product?.productUnit1,
                            productUnit2: item.productUnit2 || item.tbl_product?.productUnit2
                        }));

                        setProducts(initialProducts);
                        setOriginalProducts(initialProducts);

                        // Initialize states
                        const initialQuantities = {};
                        const initialUnits = {};
                        const initialUnitPrices = {};
                        const initialTotals = {};
                        const initialExpiryDates = {};
                        const initialTemperatures = {};
                        const initialTaxStatus = {};

                        let newTaxable = 0;
                        let newNonTaxable = 0;
                        let newTotal = 0;

                        initialProducts.forEach(product => {
                            if (!product.product_code) return;

                            const productCode = product.product_code;
                            initialQuantities[productCode] = parseFloat(product.qty) || 1;
                            initialUnits[productCode] = product.unit_code;
                            initialUnitPrices[productCode] = parseFloat(product.uprice) || 0;
                            initialTotals[productCode] = parseFloat(product.amt) || 0;
                            initialTaxStatus[productCode] = product.tax1 || 'N';
                            initialTemperatures[productCode] = product.temperature1 || '';

                            // Track totals
                            if (product.tax1 === 'Y') {
                                newTaxable += initialTotals[productCode];
                            } else {
                                newNonTaxable += initialTotals[productCode];
                            }
                            newTotal += initialTotals[productCode];

                            try {
                                if (product.expire_date) {
                                    const parsedExpiryDate = parse(product.expire_date, 'MM/dd/yyyy', new Date());
                                    initialExpiryDates[productCode] = !isNaN(parsedExpiryDate.getTime())
                                        ? parsedExpiryDate
                                        : new Date();
                                } else {
                                    initialExpiryDates[productCode] = new Date();
                                }
                            } catch (error) {
                                console.error("Error parsing expiry date for product", productCode, error);
                                initialExpiryDates[productCode] = new Date();
                            }
                        });

                        setQuantities(initialQuantities);
                        setUnits(initialUnits);
                        setUnitPrices(initialUnitPrices);
                        setTotals(initialTotals);
                        setExpiryDates(initialExpiryDates);
                        setTemperatures(initialTemperatures);
                        setTaxStatus(initialTaxStatus);
                        setTaxableAmount(newTaxable);
                        setNonTaxableAmount(newNonTaxable);
                        setTotal(newTotal);
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error loading data',
                    text: error.response?.data?.message || error.message || 'Failed to load data'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dispatch, editRefno]);

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
        if (products.some(p => p.product_code === product.product_code)) {
            Swal.fire({
                icon: 'warning',
                title: 'Product already exists',
                timer: 1500,
                showConfirmButton: false
            });
            return;
        }

        const newProduct = {
            ...product,
            amount: 1,
            isNewProduct: true
        };

        setProducts(prev => [...prev, newProduct]);
        setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
        setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1?.unit_code }));
        setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
        setTemperatures(prev => ({ ...prev, [product.product_code]: '' }));
        setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price }));
        setTaxStatus(prev => ({ ...prev, [product.product_code]: product.tax1 || 'N' }));

        setSearchTerm('');
        setShowDropdown(false);
        calculateOrderTotals([...products, newProduct], quantities, units, unitPrices, { ...taxStatus, [product.product_code]: product.tax1 || 'N' });
    };

    const calculateOrderTotals = (currentProducts = products, currentQuantities = quantities,
        currentUnits = units, currentUnitPrices = unitPrices, currentTaxStatus = taxStatus) => {
        let newTaxable = 0;
        let newNonTaxable = 0;
        let newTotal = 0;
        const newTotals = {};

        currentProducts.forEach(product => {
            const productCode = product.product_code;
            const quantity = currentQuantities[productCode] || 1;
            const price = currentUnitPrices[productCode] || (
                currentUnits[productCode] === product.productUnit1?.unit_code
                    ? product.bulk_unit_price
                    : product.retail_unit_price
            );
            const lineTotal = quantity * price;
            newTotals[productCode] = lineTotal;

            if (currentTaxStatus[productCode] === 'Y') {
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

    const handleQuantityChange = (productCode, newQuantity) => {
        if (newQuantity >= 1) {
            setQuantities(prev => ({ ...prev, [productCode]: newQuantity }));
            const updatedQuantities = { ...quantities, [productCode]: newQuantity };
            calculateOrderTotals(products, updatedQuantities, units, unitPrices, taxStatus);
        }
    };

    const handleUnitChange = (productCode, newUnit) => {
        setUnits(prev => ({ ...prev, [productCode]: newUnit }));
        const product = products.find(p => p.product_code === productCode);
        const newPrice = newUnit === product.productUnit1?.unit_code ?
            product.bulk_unit_price : product.retail_unit_price;

        setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));
        const updatedPrices = { ...unitPrices, [productCode]: newPrice };
        calculateOrderTotals(products, quantities, { ...units, [productCode]: newUnit }, updatedPrices, taxStatus);
    };

    const handleDeleteProduct = (productCode) => {
        setProducts(products.filter(p => p.product_code !== productCode));
        const updatedProducts = products.filter(p => p.product_code !== productCode);
        calculateOrderTotals(updatedProducts, quantities, units, unitPrices, taxStatus);
    };

    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
    };

    const handleTemperatureChange = (productCode, value) => {
        setTemperatures(prev => ({ ...prev, [productCode]: value }));
    };

    const handleTaxStatusChange = (productCode, value) => {
        setTaxStatus(prev => ({ ...prev, [productCode]: value }));
        const updatedTaxStatus = { ...taxStatus, [productCode]: value };
        calculateOrderTotals(products, quantities, units, unitPrices, updatedTaxStatus);
    };

    const handleUpdate = async () => {
        if (!saveBranch || products.length === 0) {
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
                title: 'Updating...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const headerData = {
                refno: editRefno,
                rdate: format(editDate, 'MM/dd/yyyy'),
                branch_code: saveBranch,
                trdate: format(editDate, 'yyyyMMdd'),
                monthh: format(editDate, 'MM'),
                myear: editDate.getFullYear().toString(),
                taxable: taxableAmount.toString(),
                nontaxable: nonTaxableAmount.toString(),
                total: total.toString(),
                user_code: JSON.parse(localStorage.getItem("userData2") || "{}")?.user_code || ""
            };

            const productArrayData = products.map(product => ({
                refno: editRefno,
                product_code: product.product_code,
                qty: quantities[product.product_code].toString(),
                unit_code: units[product.product_code] || product.productUnit1?.unit_code,
                uprice: unitPrices[product.product_code].toString(),
                tax1: taxStatus[product.product_code] || 'N',
                amt: totals[product.product_code].toString(),
                expire_date: format(expiryDates[product.product_code] || new Date(), 'MM/dd/yyyy'),
                texpire_date: format(expiryDates[product.product_code] || new Date(), 'yyyyMMdd'),
                temperature1: temperatures[product.product_code] || ''
            }));

            const footerData = {
                total: total.toString()
            };

            // Use the new API structure that matches kt_dpb
            await dispatch(updateWh_dpb({
                headerData,
                productArrayData,
                footerData
            })).unwrap();

            Swal.fire({
                icon: 'success',
                title: 'Updated successfully',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                onBack();
            });

        } catch (error) {
            console.error("Update error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error updating dispatch',
                text: error.message
            });
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Button
                onClick={onBack}
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2 }}
            >
                Back to Dispatch to Branch
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
                                    value={editRefno}
                                    disabled
                                    size="small"
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
                                    selected={editDate}
                                    onChange={(date) => {
                                        if (date && !isNaN(date.getTime())) {
                                            setEditDate(date);
                                        }
                                    }}
                                    dateFormat="MM/dd/yyyy"
                                    placeholderText="MM/DD/YYYY"
                                    customInput={<CustomInput />}
                                />
                            </Grid2>
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Branch
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
                                        '& option': {
                                            fontSize: '16px',
                                        },
                                    }}
                                >
                                    <option value="">Select a Branch</option>
                                    {branches.map((b) => (
                                        <option key={b.branch_code} value={b.branch_code}>
                                            {b.branch_name}
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
                                    placeholder="Search"
                                    size="small"
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
                        </Box>

                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}>
                            <table style={{ width: '100%', marginTop: '24px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '4px', fontSize: '14px', width: '1%', color: '#754C27', fontWeight: '800' }}>No.</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '15%', color: '#754C27', fontWeight: '800' }}>Product code</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '15%', color: '#754C27', fontWeight: '800' }}>Product name</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Expiry Date</th>
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
                                        const currentQuantity = quantities[productCode] || 1;
                                        const currentUnit = units[productCode] || product.productUnit1?.unit_code;
                                        const currentPrice = unitPrices[productCode] || (
                                            currentUnit === product.productUnit1?.unit_code
                                                ? product.bulk_unit_price
                                                : product.retail_unit_price
                                        );
                                        const currentTotal = totals[productCode] || (currentQuantity * currentPrice);
                                        const currentTax = taxStatus[productCode] || 'N';
                                        const currentTemp = temperatures[productCode] || '';

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
                                                        placeholderText="MM/DD/YYYY"
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
                                                        {product.productUnit1 && (
                                                            <option value={product.productUnit1.unit_code}>{product.productUnit1.unit_name}</option>
                                                        )}
                                                        {product.productUnit2 && (
                                                            <option value={product.productUnit2.unit_code}>{product.productUnit2.unit_name}</option>
                                                        )}
                                                    </select>
                                                </td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                    {currentPrice.toFixed(2)}
                                                </td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                    <select
                                                        value={currentTax}
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
                                                    {currentTotal.toFixed(2)}
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
                        </Box>

                        <Button
                            onClick={handleUpdate}
                            sx={{
                                width: '100%',
                                height: '48px',
                                mt: '24px',
                                bgcolor: '#754C27',
                                color: '#FFFFFF',
                                '&:hover': {
                                    bgcolor: '#5C3D1F'
                                }
                            }}
                        >
                            Update
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default EditDispatchToBranch;