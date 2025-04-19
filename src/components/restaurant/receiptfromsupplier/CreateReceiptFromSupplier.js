import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    Divider,
    InputAdornment,
    Grid,
    Autocomplete,
    CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../api/productrecordApi';
import { branchAll } from '../../../api/branchApi';
import { supplierAll } from '../../../api/supplierApi';
import { addBr_rfs } from '../../../api/restaurant/br_rfsApi';
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

export default function CreateBranchReceiptFromSupplier({ onBack }) {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(new Date());
    const [refNo, setRefNo] = useState(''); // Manual refNo input
    const [branches, setBranches] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [saveSupplier, setSaveSupplier] = useState('');
    const [saveBranch, setSaveBranch] = useState('');
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [total, setTotal] = useState(0);
    const [expiryDates, setExpiryDates] = useState({});
    const [temperatures, setTemperatures] = useState({});
    const [tax1Values, setTax1Values] = useState({});
    const [taxableAmount, setTaxableAmount] = useState(0);
    const [nonTaxableAmount, setNonTaxableAmount] = useState(0);
    const [saleTax, setSaleTax] = useState(0);
    const [totalDue, setTotalDue] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const TAX_RATE = 0.07;
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson || "{}");


    useEffect(() => {
        // Fetch branches
        dispatch(branchAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((res) => {
                setBranches(res.data);
            })
            .catch((err) => console.log(err.message));

        // Fetch suppliers
        dispatch(supplierAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((res) => {
                setSuppliers(res.data);
            })
            .catch((err) => console.log(err.message));
    }, [dispatch]);

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

        // Add the product
        setProducts([...products, product]);

        // Initialize state values for this product
        setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
        setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1.unit_code }));
        setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price }));
        setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
        setTemperatures(prev => ({ ...prev, [product.product_code]: '38' }));
        setTax1Values(prev => ({ ...prev, [product.product_code]: product.tax1 || 'N' }));

        // Calculate initial total
        const initialTotal = product.bulk_unit_price * 1;
        setTotals(prev => ({ ...prev, [product.product_code]: initialTotal }));

        // Update order totals
        calculateOrderTotals([...products, product]);

        setSearchTerm('');
        setShowDropdown(false);
    };

    const handleDeleteProduct = (productCode) => {
        const updatedProducts = products.filter(p => p.product_code !== productCode);
        setProducts(updatedProducts);

        // Clean up associated state
        const { [productCode]: _, ...newQuantities } = quantities;
        const { [productCode]: __, ...newUnits } = units;
        const { [productCode]: ___, ...newUnitPrices } = unitPrices;
        const { [productCode]: ____, ...newTotals } = totals;
        const { [productCode]: _____, ...newExpiryDates } = expiryDates;
        const { [productCode]: ______, ...newTax1Values } = tax1Values;
        const { [productCode]: _______, ...newTemperatures } = temperatures;

        setQuantities(newQuantities);
        setUnits(newUnits);
        setUnitPrices(newUnitPrices);
        setTotals(newTotals);
        setExpiryDates(newExpiryDates);
        setTax1Values(newTax1Values);
        setTemperatures(newTemperatures);

        calculateOrderTotals(updatedProducts);
    };



    const calculateOrderTotals = (productsList = products) => {
        let newTaxable = 0;
        let newNonTaxable = 0;
        let newTotal = 0;
        let newTotals = {};

        productsList.forEach(product => {
            const productCode = product.product_code;
            const quantity = quantities[productCode] || 1;
            const unitPrice = unitPrices[productCode] || product.bulk_unit_price;
            const lineTotal = quantity * unitPrice;

            newTotals[productCode] = lineTotal;
            newTotal += lineTotal;

            if (tax1Values[productCode] === 'Y') {
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

    // handleAmountChange
    const handleAmountChange = (productCode, newAmount) => {
        if (newAmount < 1) newAmount = 1;

        // เก็บค่าใหม่ไว้ในตัวแปร
        const newQuantities = { ...quantities, [productCode]: newAmount };
        setQuantities(newQuantities);

        const price = unitPrices[productCode];
        const newLineTotal = newAmount * price;

        // คำนวณ totals ใหม่
        const newTotals = { ...totals, [productCode]: newLineTotal };
        setTotals(newTotals);

        // คำนวณค่าทั้งหมดใหม่โดยใช้ข้อมูลล่าสุด
        let newTaxable = 0;
        let newNonTaxable = 0;
        let newTotal = 0;

        products.forEach(product => {
            const pCode = product.product_code;
            // ใช้ค่าใหม่สำหรับสินค้าที่กำลังแก้ไข
            const qty = pCode === productCode ? newAmount : quantities[pCode] || 1;
            const unitPrice = unitPrices[pCode] || product.bulk_unit_price;
            const lineTotal = qty * unitPrice;

            newTotal += lineTotal;

            if (tax1Values[pCode] === 'Y') {
                newTaxable += lineTotal;
            } else {
                newNonTaxable += lineTotal;
            }
        });

        const newSaleTax = newTaxable * TAX_RATE;
        const newTotalDue = newTotal + newSaleTax;

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setSaleTax(newSaleTax);
        setTotal(newTotal);
        setTotalDue(newTotalDue);
    };

    // handleUnitChange
    const handleUnitChange = (productCode, newUnit) => {
        // อัปเดท unit
        const newUnits = { ...units, [productCode]: newUnit };
        setUnits(newUnits);

        // หาราคาใหม่ตาม unit
        const product = products.find(p => p.product_code === productCode);
        const newPrice = newUnit === product.productUnit1.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        // อัปเดทราคา
        const newUnitPrices = { ...unitPrices, [productCode]: newPrice };
        setUnitPrices(newUnitPrices);

        // คำนวณยอดรวมของรายการ
        const qty = quantities[productCode] || 1;
        const newLineTotal = qty * newPrice;
        const newTotals = { ...totals, [productCode]: newLineTotal };
        setTotals(newTotals);

        // คำนวณค่าทั้งหมดใหม่
        let newTaxable = 0;
        let newNonTaxable = 0;
        let newTotal = 0;

        products.forEach(product => {
            const pCode = product.product_code;
            const qty = quantities[pCode] || 1;
            // ใช้ราคาใหม่สำหรับสินค้าที่กำลังแก้ไข
            const unitPrice = pCode === productCode ? newPrice : unitPrices[pCode] || product.bulk_unit_price;
            const lineTotal = qty * unitPrice;

            newTotal += lineTotal;

            if (tax1Values[pCode] === 'Y') {
                newTaxable += lineTotal;
            } else {
                newNonTaxable += lineTotal;
            }
        });

        const newSaleTax = newTaxable * TAX_RATE;
        const newTotalDue = newTotal + newSaleTax;

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setSaleTax(newSaleTax);
        setTotal(newTotal);
        setTotalDue(newTotalDue);
    };
    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
    };

    // handleTax1Change
    const handleTax1Change = (productCode, value) => {
        // อัปเดทสถานะภาษี
        const newTax1Values = { ...tax1Values, [productCode]: value };
        setTax1Values(newTax1Values);

        // คำนวณค่าทั้งหมดใหม่
        let newTaxable = 0;
        let newNonTaxable = 0;
        let newTotal = 0;

        products.forEach(product => {
            const pCode = product.product_code;
            const qty = quantities[pCode] || 1;
            const unitPrice = unitPrices[pCode] || product.bulk_unit_price;
            const lineTotal = qty * unitPrice;

            newTotal += lineTotal;

            // ใช้สถานะภาษีใหม่สำหรับสินค้าที่กำลังแก้ไข
            const isTaxable = pCode === productCode ? value === 'Y' : tax1Values[pCode] === 'Y';
            if (isTaxable) {
                newTaxable += lineTotal;
            } else {
                newNonTaxable += lineTotal;
            }
        });

        const newSaleTax = newTaxable * TAX_RATE;
        const newTotalDue = newTotal + newSaleTax;

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setSaleTax(newSaleTax);
        setTotal(newTotal);
        setTotalDue(newTotalDue);
    };

    const handleTemperatureChange = (productCode, temp) => {
        setTemperatures(prev => ({ ...prev, [productCode]: temp }));
    };

    // handlePriceChange
    const handlePriceChange = (productCode, newPrice) => {
        if (newPrice < 0) newPrice = 0;

        // อัปเดทราคา
        const newUnitPrices = { ...unitPrices, [productCode]: newPrice };
        setUnitPrices(newUnitPrices);

        // คำนวณยอดรวมของรายการ
        const qty = quantities[productCode] || 1;
        const newLineTotal = qty * newPrice;
        const newTotals = { ...totals, [productCode]: newLineTotal };
        setTotals(newTotals);

        // คำนวณค่าทั้งหมดใหม่
        let newTaxable = 0;
        let newNonTaxable = 0;
        let newTotal = 0;

        products.forEach(product => {
            const pCode = product.product_code;
            const qty = quantities[pCode] || 1;
            // ใช้ราคาใหม่สำหรับสินค้าที่กำลังแก้ไข
            const unitPrice = pCode === productCode ? newPrice : unitPrices[pCode] || product.bulk_unit_price;
            const lineTotal = qty * unitPrice;

            newTotal += lineTotal;

            if (tax1Values[pCode] === 'Y') {
                newTaxable += lineTotal;
            } else {
                newNonTaxable += lineTotal;
            }
        });

        const newSaleTax = newTaxable * TAX_RATE;
        const newTotalDue = newTotal + newSaleTax;

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setSaleTax(newSaleTax);
        setTotal(newTotal);
        setTotalDue(newTotalDue);
    };

    const handleSave = async () => {
        if (!refNo) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please enter a reference number.',
                timer: 1500
            });
            return;
        }

        if (!saveSupplier || !saveBranch || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a supplier, branch, and at least one product.',
                timer: 1500
            });
            return;
        }

        try {
            setIsLoading(true);

            Swal.fire({
                title: 'Saving receipt...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const headerData = {
                refno: refNo,
                rdate: format(startDate, 'MM/dd/yyyy'),
                supplier_code: saveSupplier,
                branch_code: saveBranch,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2?.user_code || '',
                taxable: taxableAmount.toString(),
                nontaxable: nonTaxableAmount.toString(),
                total: total.toString()
            };

            const productArrayData = products.map(product => {
                const productCode = product.product_code;
                return {
                    refno: refNo,
                    product_code: productCode,
                    qty: quantities[productCode].toString(),
                    unit_code: units[productCode],
                    uprice: unitPrices[productCode].toString(),
                    tax1: tax1Values[productCode] || 'N',
                    amt: totals[productCode].toString(),
                    expire_date: format(expiryDates[productCode], 'MM/dd/yyyy'),
                    texpire_date: format(expiryDates[productCode], 'yyyyMMdd'),
                    temperature1: temperatures[productCode] || '38'
                };
            });

            const orderData = {
                headerData,
                productArrayData,
                footerData: {
                    taxable: taxableAmount.toString(),
                    nontaxable: nonTaxableAmount.toString(),
                    total: totalDue.toString()
                }
            };

            await dispatch(addBr_rfs(orderData)).unwrap();

            await Swal.fire({
                icon: 'success',
                title: 'Created receipt successfully',
                text: `Reference No: ${refNo}`,
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
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setRefNo('');
        setProducts([]);
        setQuantities({});
        setUnits({});
        setUnitPrices({});
        setTotals({});
        setTotal(0);
        setSaveSupplier('');
        setSaveBranch('');
        setSearchTerm('');
        setExpiryDates({});
        setTax1Values({});
        setTemperatures({});
        setTaxableAmount(0);
        setNonTaxableAmount(0);
        setSaleTax(0);
        setTotalDue(0);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: '#754C27' }} />
                <Typography sx={{ ml: 2 }}>Saving data...</Typography>
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
                Back to Goods Receipt From Supplier
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
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Ref.no
                                </Typography>
                                <TextField
                                    value={refNo}
                                    onChange={(e) => setRefNo(e.target.value)}
                                    placeholder="Enter reference number"
                                    size="small"
                                    fullWidth
                                    sx={{
                                        mt: '8px',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            fontWeight: '700'
                                        },
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
                                    customInput={<CustomInput />}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Supplier
                                </Typography>
                                <Box
                                    component="select"
                                    value={saveSupplier}
                                    onChange={(e) => setSaveSupplier(e.target.value)}
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
                                    <option value="">Select Supplier</option>
                                    {suppliers.map((supplier) => (
                                        <option key={supplier.supplier_code} value={supplier.supplier_code}>
                                            {supplier.supplier_name}
                                        </option>
                                    ))}
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
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
                                        '& option': {
                                            fontSize: '16px',
                                        },
                                    }}
                                >
                                    <option value="">Select Restaurant</option>
                                    {branches.map((branch) => (
                                        <option key={branch.branch_code} value={branch.branch_code}>
                                            {branch.branch_name}
                                        </option>
                                    ))}
                                </Box>
                            </Grid>

                            <Divider sx={{ my: 3, width: '100%' }} />

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
                                            <th style={{ padding: '12px', textAlign: 'right', color: '#754C27', backgroundColor: '#f5f5f5' }}>Quantity</th>
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
                                                    No products selected. Search for products to add them to your order.
                                                </td>
                                            </tr>
                                        ) : (
                                            products.map((product, index) => {
                                                const productCode = product.product_code;
                                                const price = unitPrices[productCode] || product.bulk_unit_price;
                                                const quantity = quantities[productCode] || 1;
                                                const total = price * quantity;

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
                                                                value={tax1Values[productCode] || 'N'}
                                                                onChange={(e) => handleTax1Change(productCode, e.target.value)}
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
                                                                value={temperatures[productCode] || '38'}
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
                                                                value={quantity}
                                                                onChange={(e) => {
                                                                    const newAmount = Number(e.target.value);
                                                                    if (!isNaN(newAmount) && newAmount >= 1) {
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
                                                                value={units[productCode] || product.productUnit1.unit_code}
                                                                onChange={(e) => handleUnitChange(productCode, e.target.value)}
                                                                style={{
                                                                    padding: '4px',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px',
                                                                    width: '100px'
                                                                }}
                                                            >
                                                                <option value={product.productUnit1.unit_code}>
                                                                    {product.productUnit1.unit_name}
                                                                </option>
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
                                                                value={price}
                                                                onChange={(e) => {
                                                                    const newPrice = Number(e.target.value);
                                                                    if (!isNaN(newPrice) && newPrice >= 0) {
                                                                        handlePriceChange(productCode, newPrice);
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
                                disabled={!refNo || !saveSupplier || !saveBranch || products.length === 0}
                            >
                                Save
                            </Button>
                        </Grid>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}