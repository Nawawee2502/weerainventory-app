import { Box, Button, InputAdornment, TextField, Typography, IconButton, Grid2, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../api/productrecordApi';
import {
    addBr_pow,
    Br_powAlljoindt,
    Br_powrefno,
    countBr_pow
} from '../../../api/restaurant/br_powApi';
import { branchAll } from '../../../api/branchApi';
import { supplierAll } from '../../../api/supplierApi';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

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

export default function CreateBranchPurchaseOrder({ onBack }) {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('');
    const [branches, setBranches] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [saveBranch, setSaveBranch] = useState('');
    const [saveSupplier, setSaveSupplier] = useState('');
    const [products, setProducts] = useState([]);
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
    const [isLoading, setIsLoading] = useState(false);

    const TAX_RATE = 0.07;
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson);

    useEffect(() => {
        loadBranches();
        loadSuppliers();
    }, []);

    const loadBranches = async () => {
        try {
            const response = await dispatch(branchAll({ offset: 0, limit: 100 })).unwrap();
            setBranches(response.data || []);
        } catch (err) {
            console.error('Error loading branches:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error Loading Branches',
                text: err.message || 'Failed to load branches',
                confirmButtonColor: '#754C27'
            });
        }
    };

    const loadSuppliers = async () => {
        try {
            const response = await dispatch(supplierAll({ offset: 0, limit: 100 })).unwrap();
            setSuppliers(response.data || []);
        } catch (err) {
            console.error('Error loading suppliers:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error Loading Suppliers',
                text: err.message || 'Failed to load suppliers',
                confirmButtonColor: '#754C27'
            });
        }
    };

    // Adjusted to match mobile version's refno generation logic
    const handleGetLastRefNo = async (selectedDate, selectedBranch, selectedSupplier) => {
        try {
            if (!selectedBranch || !selectedSupplier) {
                setLastRefNo('');
                return;
            }

            const res = await dispatch(Br_powrefno({
                branch_code: selectedBranch,
                supplier_code: selectedSupplier,
                date: selectedDate
            })).unwrap();

            if (res.result && res.data?.refno) {
                setLastRefNo(res.data.refno);
            } else {
                throw new Error('Failed to generate reference number');
            }

        } catch (err) {
            console.error("Error generating refno:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to generate reference number'
            });
        }
    };

    // Update supplier selection handler
    const handleSupplierChange = (event) => {
        const newSupplierCode = event.target.value;
        setSaveSupplier(newSupplierCode);
        if (newSupplierCode && saveBranch) {  // Only call if we have both codes
            handleGetLastRefNo(startDate, saveBranch, newSupplierCode);
        } else {
            setLastRefNo('');
        }
    };

    // Update branch selection handler
    const handleBranchChange = (event) => {
        const newBranchCode = event.target.value;
        setSaveBranch(newBranchCode);
        if (newBranchCode && saveSupplier) {  // Only call if we have both codes
            handleGetLastRefNo(startDate, newBranchCode, saveSupplier);
        } else {
            setLastRefNo('');
        }
    };

    // Improved handleProductSelect function with better warning message
    const handleProductSelect = (product) => {
        if (products.some(p => p.product_code === product.product_code)) {
            // More detailed warning message with consistent styling
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

        if (isTaxable) {
            setTaxableAmount(prev => prev + initialAmount);
        } else {
            setNonTaxableAmount(prev => prev + initialAmount);
        }

        const newTotalAmount = isTaxable ?
            initialAmount * (1 + TAX_RATE) : initialAmount;
        setTotal(prev => prev + newTotalAmount);

        setSearchTerm('');
        setShowDropdown(false);
    };

    // Updated handleSearchChange with Enter key functionality
    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Add Enter key functionality
        if (e.key === 'Enter' && value.trim() !== '') {
            try {
                const response = await dispatch(searchProductName({ product_name: value })).unwrap();
                if (response.data && response.data.length > 0) {
                    // Find exact match or use the first result
                    const exactMatch = response.data.find(
                        product => product.product_name.toLowerCase() === value.toLowerCase()
                    );
                    const selectedProduct = exactMatch || response.data[0];

                    // Check for duplicate
                    if (products.some(p => p.product_code === selectedProduct.product_code)) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Duplicate Product',
                            text: `${selectedProduct.product_name} is already in your purchase order. Please adjust the quantity instead.`,
                            confirmButtonColor: '#754C27'
                        });
                    } else {
                        // Add product if not a duplicate
                        const productCode = selectedProduct.product_code;
                        const initialQuantity = 1;
                        const initialUnitCode = selectedProduct.productUnit1.unit_code;
                        const initialUnitPrice = selectedProduct.bulk_unit_price;
                        const initialAmount = initialQuantity * initialUnitPrice;
                        const isTaxable = selectedProduct.tax1 === 'Y';

                        setProducts(prev => [...prev, selectedProduct]);
                        setQuantities(prev => ({ ...prev, [productCode]: initialQuantity }));
                        setUnits(prev => ({ ...prev, [productCode]: initialUnitCode }));
                        setUnitPrices(prev => ({ ...prev, [productCode]: initialUnitPrice }));
                        setTotals(prev => ({ ...prev, [productCode]: initialAmount }));
                        setExpiryDates(prev => ({ ...prev, [productCode]: new Date() }));

                        if (isTaxable) {
                            setTaxableAmount(prev => prev + initialAmount);
                        } else {
                            setNonTaxableAmount(prev => prev + initialAmount);
                        }

                        const newTotalAmount = isTaxable ?
                            initialAmount * (1 + TAX_RATE) : initialAmount;
                        setTotal(prev => prev + newTotalAmount);
                    }
                    setSearchTerm('');
                    setShowDropdown(false);
                }
            } catch (err) {
                console.error('Error searching products:', err);
            }
        } else if (value.length > 0) {
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

    const calculateProductTotal = (productCode, quantity, price, isTaxable) => {
        const amount = quantity * price;

        setTotals(prev => {
            const newTotals = { ...prev, [productCode]: amount };
            calculateOrderTotals(products, newTotals);
            return newTotals;
        });
    };

    const calculateOrderTotals = (currentProducts, newTotals) => {
        let newTaxable = 0;
        let newNonTaxable = 0;

        currentProducts.forEach(product => {
            const amount = newTotals[product.product_code] || 0;
            if (product.tax1 === 'Y') {
                newTaxable += amount;
            } else {
                newNonTaxable += amount;
            }
        });

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setTotal((newTaxable * (1 + TAX_RATE)) + newNonTaxable);
    };

    const handleQuantityChange = (productCode, newQuantity) => {
        if (newQuantity >= 1) {
            setQuantities(prev => ({ ...prev, [productCode]: newQuantity }));
            const product = products.find(p => p.product_code === productCode);
            calculateProductTotal(
                productCode,
                newQuantity,
                unitPrices[productCode],
                product.tax1 === 'Y'
            );
        }
    };

    const handleUnitChange = (productCode, newUnitCode) => {
        const product = products.find(p => p.product_code === productCode);
        const newPrice = newUnitCode === product.productUnit1.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        setUnits(prev => ({ ...prev, [productCode]: newUnitCode }));
        setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));
        calculateProductTotal(
            productCode,
            quantities[productCode],
            newPrice,
            product.tax1 === 'Y'
        );
    };

    const handleUnitPriceChange = (productCode, value) => {
        const newPrice = parseFloat(value);
        if (!isNaN(newPrice) && newPrice >= 0) {
            setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));
            const product = products.find(p => p.product_code === productCode);
            calculateProductTotal(
                productCode,
                quantities[productCode],
                newPrice,
                product.tax1 === 'Y'
            );
        }
    };

    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({
            ...prev,
            [productCode]: date
        }));
    };

    const handleDeleteProduct = (productCode) => {
        const product = products.find(p => p.product_code === productCode);
        const amount = totals[productCode] || 0;

        if (product.tax1 === 'Y') {
            setTaxableAmount(prev => prev - amount);
            setTotal(prev => prev - (amount * (1 + TAX_RATE)));
        } else {
            setNonTaxableAmount(prev => prev - amount);
            setTotal(prev => prev - amount);
        }

        setProducts(prev => prev.filter(p => p.product_code !== productCode));
        const newQuantities = { ...quantities };
        const newUnits = { ...units };
        const newUnitPrices = { ...unitPrices };
        const newTotals = { ...totals };
        const newExpiryDates = { ...expiryDates };

        delete newQuantities[productCode];
        delete newUnits[productCode];
        delete newUnitPrices[productCode];
        delete newTotals[productCode];
        delete newExpiryDates[productCode];

        setQuantities(newQuantities);
        setUnits(newUnits);
        setUnitPrices(newUnitPrices);
        setTotals(newTotals);
        setExpiryDates(newExpiryDates);
    };

    const handleSave = async () => {
        if (!saveBranch || !saveSupplier || products.length === 0 || !lastRefNo) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a branch and supplier and add at least one product',
                timer: 1500
            });
            return;
        }

        try {
            setIsLoading(true);
            Swal.fire({
                title: 'Saving purchase order...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const headerData = {
                refno: lastRefNo,
                rdate: format(startDate, 'MM/dd/yyyy'),
                branch_code: saveBranch,
                supplier_code: saveSupplier,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2?.user_code,
                taxable: taxableAmount.toString(),
                nontaxable: nonTaxableAmount.toString()
            };

            const productArrayData = products.map(product => ({
                refno: lastRefNo,
                product_code: product.product_code,
                qty: quantities[product.product_code].toString(),
                unit_code: units[product.product_code],
                uprice: unitPrices[product.product_code].toString(),
                tax1: product.tax1,
                amt: totals[product.product_code].toString(),
                expire_date: format(expiryDates[product.product_code], 'MM/dd/yyyy'),
                texpire_date: format(expiryDates[product.product_code], 'yyyyMMdd')
            }));

            const result = await dispatch(addBr_pow({
                headerData,
                productArrayData,
                footerData: {
                    total: total.toString(),
                    taxable: taxableAmount.toString(),
                    nontaxable: nonTaxableAmount.toString(),
                }
            })).unwrap();

            if (result.result) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Purchase order created successfully',
                    timer: 1500
                });
                resetForm();
                onBack();
            }
        } catch (error) {
            console.error('Error saving POW:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to create purchase order',
                confirmButtonColor: '#754C27'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setProducts([]);
        setQuantities({});
        setUnits({});
        setUnitPrices({});
        setTotals({});
        setSaveBranch('');
        setSaveSupplier('');
        setTaxableAmount(0);
        setNonTaxableAmount(0);
        setTotal(0);
        setExpiryDates({});
        setLastRefNo('');
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Button
                onClick={onBack}
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2 }}
            >
                Back to Purchase Orders
            </Button>

            <Box sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E4E4E4',
                p: 3
            }}>
                <Grid2 container spacing={2}>
                    <Grid2 item size={{ xs: 12, md: 6 }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Ref.no
                        </Typography>
                        <TextField
                            value={lastRefNo || "Please select supplier and branch first"}
                            disabled
                            size="small"
                            sx={{
                                mt: 1,
                                width: '100%',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    fontWeight: '700',
                                    // Show red text when no refno is available
                                    '& .Mui-disabled': {
                                        WebkitTextFillColor: !lastRefNo ? '#d32f2f' : 'rgba(0, 0, 0, 0.38)',
                                    }
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
                                if (saveBranch && saveSupplier) {
                                    handleGetLastRefNo(date, saveBranch, saveSupplier);
                                }
                            }}
                            dateFormat="MM/dd/yyyy"
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
                            onChange={(e) => handleBranchChange(e)}
                            sx={{
                                mt: 1,
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
                            <option value="">Select Branch</option>
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
                            onChange={(e) => handleSupplierChange(e)}
                            sx={{
                                mt: 1,
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
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', ml: 4 }}>
                        <Typography sx={{ mr: 2 }}>
                            Product Search
                        </Typography>
                        <Box sx={{ position: 'relative', flex: 1 }}>
                            <TextField
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onKeyDown={handleSearchChange}
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
                    </Box>
                </Box>

                <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>No.</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>Product Code</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>Product Name</th>
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
                            {products.map((product, index) => (
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
                                                        padding: '4px',
                                                        textAlign: 'center',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                            }
                                        />
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <input
                                            type="number"
                                            min="1"
                                            value={quantities[product.product_code] || 1}
                                            onChange={(e) => handleQuantityChange(product.product_code, parseInt(e.target.value))}
                                            style={{
                                                width: '60px',
                                                padding: '4px',
                                                textAlign: 'right'
                                            }}
                                        />
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <select
                                            value={units[product.product_code] || product.productUnit1.unit_code}
                                            onChange={(e) => handleUnitChange(product.product_code, e.target.value)}
                                            style={{
                                                padding: '4px',
                                                width: '100px'
                                            }}
                                        >
                                            <option value={product.productUnit1.unit_code}>
                                                {product.productUnit1.unit_name}
                                            </option>
                                            <option value={product.productUnit2.unit_code}>
                                                {product.productUnit2.unit_name}
                                            </option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={unitPrices[product.product_code] || 0}
                                            onChange={(e) => handleUnitPriceChange(product.product_code, e.target.value)}
                                            style={{
                                                width: '100px',
                                                padding: '4px',
                                                textAlign: 'right'
                                            }}
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
                            ))}
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography>Non-taxable</Typography>
                        <Typography>${nonTaxableAmount.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h5" fontWeight="bold">Total</Typography>
                        <Typography variant="h5" fontWeight="bold">${total.toFixed(2)}</Typography>
                    </Box>
                </Box>

                <Button
                    onClick={handleSave}
                    variant="contained"
                    fullWidth
                    disabled={isLoading || !lastRefNo}
                    sx={{
                        mt: 2,
                        bgcolor: '#754C27',
                        color: 'white',
                        '&:hover': {
                            bgcolor: '#5A3D1E',
                        },
                        height: '48px'
                    }}
                >
                    {isLoading ? 'Saving...' : 'Save'}
                </Button>
            </Box>
        </Box>
    );
}