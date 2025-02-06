import React, { useState, useEffect } from 'react';
import { Box, Button, InputAdornment, TextField, Typography, IconButton, Grid2, Divider } from '@mui/material';
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
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Swal from 'sweetalert2';

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

export default function CreateReceiptFromWarehouse({ onBack }) {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(new Date());
    const [branches, setBranches] = useState([]);
    const [saveBranch, setSaveBranch] = useState('');
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
    const [suppliers, setSuppliers] = useState([]);
    const [saveSupplier, setSaveSupplier] = useState('');
    const [total, setTotal] = useState(0);
    const [refNo, setRefNo] = useState('');

    const TAX_RATE = 0.07;
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson);

    useEffect(() => {
        loadBranches();
        loadSuppliers();
        const currentDate = new Date();
        handleGetLastRefNo(currentDate);
    }, []);

    const loadSuppliers = async () => {
        try {
            const response = await dispatch(supplierAll({ offset: 0, limit: 100 })).unwrap();
            setSuppliers(response.data || []);
        } catch (err) {
            console.error('Error loading suppliers:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error Loading Suppliers',
                text: err.message || 'Failed to load suppliers'
            });
        }
    };

    const loadBranches = async () => {
        try {
            const response = await dispatch(branchAll({ offset: 0, limit: 100 })).unwrap();
            setBranches(response.data || []);
        } catch (err) {
            console.error('Error loading branches:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error Loading Branches',
                text: err.message || 'Failed to load branches'
            });
        }
    };

    const handleGetLastRefNo = async (selectedDate) => {
        try {
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);

            const res = await dispatch(Br_rfwrefno({
                month,
                year
            })).unwrap();

            if (!res.data || !res.data.refno) {
                setRefNo(`BRFW${year}${month}001`);
                return;
            }

            const lastRefNo = res.data.refno;
            const lastRefMonth = lastRefNo.substring(6, 8);
            const lastRefYear = lastRefNo.substring(4, 6);

            if (lastRefMonth !== month || lastRefYear !== year) {
                setRefNo(`BRFW${year}${month}001`);
                return;
            }

            const lastNumber = parseInt(lastRefNo.slice(-3));
            const newNumber = lastNumber + 1;
            setRefNo(`BRFW${year}${month}${String(newNumber).padStart(3, '0')}`);

        } catch (err) {
            console.error('Error generating refno:', err);
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);
            setRefNo(`BRFW${year}${month}001`);
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
        if (!saveBranch || !saveSupplier || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please fill in all required fields'
            });
            return;
        }

        try {
            const headerData = {
                refno: refNo,
                rdate: formatDate(startDate),
                branch_code: saveBranch,
                supplier_code: saveSupplier,
                trdate: formatTRDate(startDate),
                monthh: String(startDate.getMonth() + 1).padStart(2, '0'),
                myear: startDate.getFullYear().toString(),
                user_code: userData2?.user_code,
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

            Swal.fire({
                title: 'Saving...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const result = await dispatch(addBr_rfw({
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
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to create receipt'
            });
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
        calculateOrderTotals();
    };

    const calculateOrderTotals = () => {
        let newTaxable = 0;
        let newNonTaxable = 0;
        let subTotal = 0;

        products.forEach(product => {
            const quantity = quantities[product.product_code] || 0;
            const unitPrice = unitPrices[product.product_code] || 0;
            const amount = quantity * unitPrice;

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
        setSaveBranch('');
        setSaveSupplier('');
        setTaxableAmount(0);
        setNonTaxableAmount(0);
        setTotal(0);
    };

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
                            Ref.no
                        </Typography>
                        <TextField
                            value={refNo}
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

                    <Grid2 item xs={12} md={6}>
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
                            customInput={
                                <TextField
                                    size="small"
                                    fullWidth
                                    sx={{
                                        mt: 1,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px'
                                        }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <CalendarTodayIcon />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            }
                        />
                    </Grid2>

                    <Grid2 item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Branch
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
                            <option value="">Select Branch</option>
                            {branches.map((branch) => (
                                <option key={branch.branch_code} value={branch.branch_code}>
                                    {branch.branch_name}
                                </option>
                            ))}
                        </Box>
                    </Grid2>

                    <Grid2 item xs={12} md={6}>
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
                                                <TextField
                                                    size="small"
                                                    sx={{ width: '120px' }}
                                                />
                                            }
                                        />
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <TextField
                                            size="small"
                                            value={temperatures[product.product_code] || ''}
                                            onChange={(e) => {
                                                setTemperatures(prev => ({
                                                    ...prev,
                                                    [product.product_code]: e.target.value
                                                }));
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
                                        <select
                                            value={units[product.product_code] || product.productUnit1.unit_code}
                                            onChange={(e) => {
                                                const newUnit = e.target.value;
                                                setUnits(prev => ({
                                                    ...prev,
                                                    [product.product_code]: newUnit
                                                }));
                                                calculateProductTotal(
                                                    product.product_code,
                                                    quantities[product.product_code],
                                                    unitPrices[product.product_code]
                                                );
                                            }}
                                            style={{
                                                padding: '8px',
                                                width: '100px',
                                                borderRadius: '4px',
                                                border: '1px solid rgba(0, 0, 0, 0.23)'
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