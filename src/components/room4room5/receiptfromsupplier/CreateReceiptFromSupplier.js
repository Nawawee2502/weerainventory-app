import React, { useState, useEffect } from 'react';
import { Box, Button, InputAdornment, TextField, Typography, IconButton, Grid, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../api/productrecordApi';
import { addKt_rfs } from '../../../api/kitchen/kt_rfsApi';
import { kitchenAll } from '../../../api/kitchenApi';
import { supplierAll } from '../../../api/supplierApi';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Swal from 'sweetalert2';

const formatDate = (date) => {
    if (!date) return "";
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

const formatTRDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

export default function CreateReceiptFromSupplier({ onBack }) {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(new Date());
    const [refNo, setRefNo] = useState('');
    const [kitchens, setKitchens] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [saveKitchen, setSaveKitchen] = useState('');
    const [saveSupplier, setSaveSupplier] = useState('');
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
    const [salesTax, setSalesTax] = useState(0);
    const [instantSaving, setInstantSaving] = useState(0);
    const [deliverySurcharge, setDeliverySurcharge] = useState(0);
    const [totalDue, setTotalDue] = useState(0);
    const [allProducts, setAllProducts] = useState([]);

    const TAX_RATE = 0.07;
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson);

    useEffect(() => {
        loadKitchens();
        loadSuppliers();
        loadProducts();
    }, []);

    useEffect(() => {
        if (products.length > 0) {
            calculateOrderTotals();
        }
    }, [products, quantities, unitPrices, totals, instantSaving, deliverySurcharge]);

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

    const loadProducts = async () => {
        try {
            const response = await dispatch(searchProductName({ product_name: '' })).unwrap();
            if (response.data) {
                setAllProducts(response.data);
            }
        } catch (err) {
            console.error('Error loading products:', err);
        }
    };

    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 0) {
            const filtered = allProducts.filter(product =>
                product.product_name?.toLowerCase().includes(value.toLowerCase()) ||
                product.product_code?.toLowerCase().includes(value.toLowerCase())
            );
            setSearchResults(filtered);
            setShowDropdown(true);
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
        const initialUnitCode = product.productUnit1?.unit_code || '';
        const initialUnitPrice = product.bulk_unit_price || 0;

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
            [product.product_code]: '38'
        }));

        calculateProductTotal(product.product_code, initialQuantity, initialUnitPrice);
    };

    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
    };

    const handleTemperatureChange = (productCode, temp) => {
        setTemperatures(prev => ({ ...prev, [productCode]: temp }));
    };

    const calculateProductTotal = (productCode, quantity, unitPrice) => {
        const amount = quantity * unitPrice;
        setTotals(prev => {
            const newTotals = { ...prev, [productCode]: amount };
            return newTotals;
        });
        console.log(`Product ${productCode}: Qty=${quantity}, Price=${unitPrice}, Total=${amount}`);
    };

    // ปรับปรุงฟังก์ชัน calculateOrderTotals
    const calculateOrderTotals = (newTotals = totals) => {
        let newTaxable = 0;
        let newNonTaxable = 0;
        let subTotal = 0;

        // แสดง log เพื่อตรวจสอบค่า totals ที่ได้รับ
        console.log("Calculating order totals with:", newTotals);
        console.log("Current products:", products);

        products.forEach(product => {
            const amount = newTotals[product.product_code] || 0;
            subTotal += amount;

            if (product.tax1 === 'Y') {
                newTaxable += amount;
            } else {
                newNonTaxable += amount;
            }

            // แสดง log สำหรับแต่ละสินค้า
            console.log(`${product.product_code}: Amount=${amount}, Tax=${product.tax1}`);
        });

        const tax = newTaxable * TAX_RATE;
        const finalTotal = subTotal + tax + deliverySurcharge - instantSaving;

        // แสดง log ผลลัพธ์การคำนวณ
        console.log("Calculation results:");
        console.log("- subTotal:", subTotal);
        console.log("- taxable:", newTaxable);
        console.log("- non-taxable:", newNonTaxable);
        console.log("- tax:", tax);
        console.log("- instantSaving:", instantSaving);
        console.log("- deliverySurcharge:", deliverySurcharge);
        console.log("- finalTotal:", finalTotal);

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setSalesTax(tax);
        setTotal(subTotal);
        setTotalDue(finalTotal);
    };

    const handleSave = async () => {
        if (!refNo) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please enter a reference number'
            });
            return;
        }

        if (!saveKitchen || !saveSupplier || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please fill in all required fields and add at least one product'
            });
            return;
        }

        try {
            const headerData = {
                refno: refNo,
                rdate: formatDate(startDate),
                kitchen_code: saveKitchen,
                supplier_code: saveSupplier,
                trdate: formatTRDate(startDate),
                monthh: String(startDate.getMonth() + 1).padStart(2, '0'),
                myear: startDate.getFullYear().toString(),
                user_code: userData2?.user_code
            };

            const productArrayData = products.map(product => {
                const expiryDate = expiryDates[product.product_code];
                return {
                    refno: refNo,
                    product_code: product.product_code,
                    qty: quantities[product.product_code] || 0,  // Keep as number not string
                    unit_code: units[product.product_code] || '',
                    uprice: unitPrices[product.product_code] || 0,  // Keep as number not string
                    tax1: product.tax1 || 'N',
                    expire_date: formatDate(expiryDate),
                    texpire_date: formatTRDate(expiryDate),
                    instant_saving1: instantSaving || 0,
                    temperature1: temperatures[product.product_code] || '38',
                    amt: totals[product.product_code] || 0  // Keep as number not string
                };
            });

            const footerData = {
                taxable: taxableAmount,
                nontaxable: nonTaxableAmount,
                total: total,
                instant_saving: instantSaving || 0,
                delivery_surcharge: deliverySurcharge || 0,
                sale_tax: salesTax,
                total_due: totalDue
            };

            Swal.fire({
                title: 'Saving...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const orderData = {
                headerData,
                productArrayData,
                footerData
            };

            console.log("Sending to server:", JSON.stringify(orderData, null, 2));

            const result = await dispatch(addKt_rfs(orderData)).unwrap();

            if (result.result) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Receipt from supplier created successfully',
                    timer: 1500
                });
                resetForm();
                onBack();
            }
        } catch (error) {
            console.error('Error saving RFS:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to create receipt'
            });
        }
    };

    const handleDeleteProduct = (productCode) => {
        setProducts(prev => prev.filter(p => p.product_code !== productCode));

        const { [productCode]: removedQuantity, ...newQuantities } = quantities;
        const { [productCode]: removedUnit, ...newUnits } = units;
        const { [productCode]: removedPrice, ...newUnitPrices } = unitPrices;
        const { [productCode]: removedTotal, ...newTotals } = totals;
        const { [productCode]: removedExpiry, ...newExpiryDates } = expiryDates;
        const { [productCode]: removedTemp, ...newTemperatures } = temperatures;

        setQuantities(newQuantities);
        setUnits(newUnits);
        setUnitPrices(newUnitPrices);
        setTotals(newTotals);
        setExpiryDates(newExpiryDates);
        setTemperatures(newTemperatures);

        calculateOrderTotals(newTotals);
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
        setSaveSupplier('');
        setTaxableAmount(0);
        setNonTaxableAmount(0);
        setTotal(0);
        setSalesTax(0);
        setInstantSaving(0);
        setDeliverySurcharge(0);
        setTotalDue(0);
        setRefNo('');
        setSearchTerm('');
    };

    const handleQuantityChange = (productCode, e) => {
        const newValue = parseInt(e.target.value) || 1;
        setQuantities(prev => ({
            ...prev,
            [productCode]: newValue
        }));
        calculateProductTotal(
            productCode,
            newValue,
            unitPrices[productCode]
        );
    };

    const handleUnitChange = (productCode, e) => {
        const newUnit = e.target.value;
        setUnits(prev => ({
            ...prev,
            [productCode]: newUnit
        }));

        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        const newPrice = newUnit === product.productUnit1?.unit_code
            ? (product.bulk_unit_price || 0)
            : (product.retail_unit_price || 0);

        setUnitPrices(prev => ({
            ...prev,
            [productCode]: newPrice
        }));

        calculateProductTotal(
            productCode,
            quantities[productCode],
            newPrice
        );
    };

    const handleUnitPriceChange = (productCode, e) => {
        const newPrice = parseFloat(e.target.value) || 0;
        setUnitPrices(prev => ({
            ...prev,
            [productCode]: newPrice
        }));
        calculateProductTotal(
            productCode,
            quantities[productCode],
            newPrice
        );
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Button onClick={onBack} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Back to Goods Receipt From Supplier
            </Button>

            <Box sx={{
                width: '100%',
                bgcolor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E4E4E4',
                p: 3
            }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Ref.no
                        </Typography>
                        <TextField
                            value={refNo}
                            onChange={(e) => setRefNo(e.target.value)}
                            size="small"
                            placeholder="Enter reference number"
                            fullWidth
                            sx={{
                                mt: 1,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px'
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Date
                        </Typography>
                        <DatePicker
                            selected={startDate}
                            onChange={setStartDate}
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

                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Kitchen
                        </Typography>
                        <Box
                            component="select"
                            value={saveKitchen}
                            onChange={(e) => setSaveKitchen(e.target.value)}
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
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Product Search Section */}
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

                {/* Products Table */}
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
                                            value={temperatures[product.product_code] || '38'}
                                            onChange={(e) => handleTemperatureChange(product.product_code, e.target.value)}
                                            sx={{ width: '80px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right' }}>
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={quantities[product.product_code] || 1}
                                            onChange={(e) => handleQuantityChange(product.product_code, e)}
                                            sx={{ width: '80px' }}
                                            inputProps={{ min: 1 }}
                                        />
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <select
                                            value={units[product.product_code] || product.productUnit1?.unit_code || ''}
                                            onChange={(e) => handleUnitChange(product.product_code, e)}
                                            style={{
                                                padding: '8px',
                                                width: '100px',
                                                borderRadius: '4px',
                                                border: '1px solid rgba(0, 0, 0, 0.23)'
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
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={unitPrices[product.product_code] || 0}
                                            onChange={(e) => handleUnitPriceChange(product.product_code, e)}
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

                {/* Totals Section */}
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
                        <Typography>Total</Typography>
                        <Typography>${total.toFixed(2)}</Typography>
                    </Box>
                    // For Instant Saving field - COMPLETELY WRONG BEFORE
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Instant Saving</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ mr: 1 }}>$</Typography>
                            <TextField
                                type="number"
                                size="small"
                                value={instantSaving || ""}
                                onChange={(e) => {
                                    // This now correctly updates instantSaving instead of deliverySurcharge!
                                    const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                    setInstantSaving(value);
                                    calculateOrderTotals();
                                }}
                                sx={{
                                    width: '100px',
                                    bgcolor: 'white',
                                    borderRadius: '4px',
                                    '& .MuiOutlinedInput-root': {
                                        height: '32px'
                                    }
                                }}
                                inputProps={{ min: 0, step: "0.01" }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Delivery Surcharge</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ mr: 1 }}>$</Typography>
                            <TextField
                                type="number"
                                size="small"
                                value={deliverySurcharge || ""}
                                onChange={(e) => {
                                    // This now correctly updates deliverySurcharge instead of instantSaving!
                                    const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                    setDeliverySurcharge(value);
                                    calculateOrderTotals();
                                }}
                                sx={{
                                    width: '100px',
                                    bgcolor: 'white',
                                    borderRadius: '4px',
                                    '& .MuiOutlinedInput-root': {
                                        height: '32px'
                                    }
                                }}
                                inputProps={{ min: 0, step: "0.01" }}
                            />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Sales Tax ({(TAX_RATE * 100).toFixed(0)}%)</Typography>
                        <Typography>${salesTax.toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1, borderColor: 'white' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="h5" fontWeight="bold">Total Due</Typography>
                        <Typography variant="h5" fontWeight="bold">${totalDue.toFixed(2)}</Typography>
                    </Box>
                </Box>

                {/* Save Button */}
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