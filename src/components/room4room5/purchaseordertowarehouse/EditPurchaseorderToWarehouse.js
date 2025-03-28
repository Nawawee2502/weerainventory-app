import { Box, Button, InputAdornment, TextField, Typography, IconButton, Grid2, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { branchAll } from '../../../api/branchApi';
import { updateKt_dpbdt, deleteKt_dpbdt, addKt_dpbdt } from '../../../api/kitchen/kt_dpbdtApi';
import { updateKt_dpb, Kt_dpbByRefno } from '../../../api/kitchen/kt_dpbApi';
import { updateKt_powdt, deleteKt_powdt, addKt_powdt } from '../../../api/kitchen/kt_powdtApi';
import { updateKt_pow, Kt_powByRefno } from '../../../api/kitchen/kt_powApi';
import { searchProductName } from '../../../api/productrecordApi';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Swal from 'sweetalert2';

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

const convertToLasVegasTime = (date) => {
    if (!date) return new Date();
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return new Date(newDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
};

const formatDate = (date) => {
    if (!date) return "";
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

export default function EditPurchaseOrderToWarehouse({ onBack, editRefno }) {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const [branch, setBranch] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [totals, setTotals] = useState({});
    const [editDate, setEditDate] = useState(new Date());
    const [saveBranch, setSaveBranch] = useState('');
    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [total, setTotal] = useState(0);
    const [originalProducts, setOriginalProducts] = useState([]);
    const [taxableAmount, setTaxableAmount] = useState(0);
    const [nonTaxableAmount, setNonTaxableAmount] = useState(0);
    const [unitPrices, setUnitPrices] = useState({});
    const TAX_RATE = 0.07;

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsLoading(true);

                // Load branch data
                const branchRes = await dispatch(branchAll({ offset: 0, limit: 100 })).unwrap();
                setBranch(branchRes.data || []);

                if (editRefno) {
                    // Load order data
                    const orderRes = await dispatch(Kt_powByRefno(editRefno)).unwrap();
                    processOrderData(orderRes.data);
                }
            } catch (error) {
                console.error('Error loading data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load order data',
                    confirmButtonColor: '#754C27'
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [dispatch, editRefno]);

    const processOrderData = (data) => {
        if (!data) return;

        // Process date
        if (data.rdate) {
            const [day, month, year] = data.rdate.split("/");
            setEditDate(new Date(year, month - 1, day));
        } else {
            setEditDate(new Date());
        }

        // Set branch
        setSaveBranch(data.branch_code || '');

        // Process products
        if (data.kt_dpbdts && Array.isArray(data.kt_dpbdts)) {
            const orderProducts = data.kt_dpbdts.map(item => ({
                product_code: item.product_code,
                product_name: item.tbl_product?.product_name || '',
                bulk_unit_price: item.tbl_product?.bulk_unit_price || 0,
                retail_unit_price: item.tbl_product?.retail_unit_price || 0,
                productUnit1: item.tbl_product?.productUnit1 || { unit_code: '', unit_name: '' },
                productUnit2: item.tbl_product?.productUnit2 || { unit_code: '', unit_name: '' },
                qty: item.qty || 1,
                unit_code: item.unit_code || '',
                uprice: item.uprice || 0,
                amt: item.amt || 0,
                tax1: item.tbl_product?.tax1 || 'N',
                isNewProduct: false
            }));

            setProducts(orderProducts);
            setOriginalProducts(orderProducts);

            // Initialize quantities, units, prices and totals
            const initialQuantities = {};
            const initialUnits = {};
            const initialUnitPrices = {};
            const initialTotals = {};

            orderProducts.forEach(item => {
                initialQuantities[item.product_code] = parseInt(item.qty) || 1;
                initialUnits[item.product_code] = item.unit_code || '';
                initialUnitPrices[item.product_code] = parseFloat(item.uprice) || 0;
                initialTotals[item.product_code] = parseFloat(item.amt) || 0;
            });

            setQuantities(initialQuantities);
            setUnits(initialUnits);
            setUnitPrices(initialUnitPrices);
            setTotals(initialTotals);

            // Set initial amounts
            calculateOrderTotals(orderProducts);
        }
    };

    const calculateOrderTotals = (productsList = null) => {
        const currentProducts = productsList || products;
        let newTaxable = 0;
        let newNonTaxable = 0;
        let newTotal = 0;

        currentProducts.forEach(product => {
            const productCode = product.product_code;
            const quantity = quantities[productCode] || 1;
            const unitPrice = unitPrices[productCode] || 0;
            const lineTotal = quantity * unitPrice;

            if (product.tax1 === 'Y') {
                newTaxable += lineTotal;
            } else {
                newNonTaxable += lineTotal;
            }

            newTotal += lineTotal;
        });

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setTotal(newTotal);
    };

    // Search functionality
    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 0) {
            try {
                const response = await dispatch(searchProductName({ product_name: value })).unwrap();
                if (response.data) {
                    const sortedResults = [...response.data].sort((a, b) => {
                        const aExact = a.product_name.toLowerCase() === value.toLowerCase();
                        const bExact = b.product_name.toLowerCase() === value.toLowerCase();
                        if (aExact && !bExact) return -1;
                        if (!aExact && bExact) return 1;
                        return a.product_name.length - b.product_name.length;
                    });
                    setSearchResults(sortedResults);
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

    // Search for product by name or code
    const searchProduct = async () => {
        if (!searchTerm.trim()) return;

        try {
            const response = await dispatch(searchProductName({ product_name: searchTerm })).unwrap();

            if (response.data && response.data.length > 0) {
                // Find exact match or use the first result
                const exactMatch = response.data.find(
                    product => product.product_name.toLowerCase() === searchTerm.toLowerCase() ||
                        product.product_code.toLowerCase() === searchTerm.toLowerCase()
                );
                const selectedProduct = exactMatch || response.data[0];

                handleProductSelect(selectedProduct);
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Product Not Found',
                    text: 'No products found matching your search.',
                    confirmButtonColor: '#754C27'
                });
            }
        } catch (err) {
            console.error('Error searching products:', err);
            Swal.fire({
                icon: 'error',
                title: 'Search Error',
                text: err.message || 'Failed to search products',
                confirmButtonColor: '#754C27'
            });
        }
    };

    const handleProductSelect = (product) => {
        // Check if product already exists
        if (products.some(p => p.product_code === product.product_code)) {
            Swal.fire({
                icon: 'warning',
                title: 'Product already exists',
                text: `${product.product_name} is already in your order.`,
                confirmButtonColor: '#754C27'
            });
            setSearchTerm('');
            setShowDropdown(false);
            return;
        }

        // Add product with new flag
        const newProduct = {
            ...product,
            isNewProduct: true
        };

        setProducts(prev => [...prev, newProduct]);

        // Set defaults
        const unitCode = product.productUnit1?.unit_code || '';
        const unitPrice = product.bulk_unit_price || 0;
        const quantity = 1;
        const total = quantity * unitPrice;

        setQuantities(prev => ({
            ...prev,
            [product.product_code]: quantity
        }));

        setUnits(prev => ({
            ...prev,
            [product.product_code]: unitCode
        }));

        setUnitPrices(prev => ({
            ...prev,
            [product.product_code]: unitPrice
        }));

        setTotals(prev => ({
            ...prev,
            [product.product_code]: total
        }));

        setSearchTerm('');
        setShowDropdown(false);

        // Recalculate totals
        calculateOrderTotals([...products, newProduct]);
    };

    const handleQuantityChange = (productCode, value) => {
        const newQuantity = parseInt(value);
        if (isNaN(newQuantity) || newQuantity < 1) return;

        setQuantities(prev => ({
            ...prev,
            [productCode]: newQuantity
        }));

        // Update total
        const unitPrice = unitPrices[productCode] || 0;
        const newTotal = newQuantity * unitPrice;

        setTotals(prev => ({
            ...prev,
            [productCode]: newTotal
        }));

        // Recalculate all totals
        calculateOrderTotals();
    };

    const handleUnitChange = (productCode, newUnitCode) => {
        setUnits(prev => ({
            ...prev,
            [productCode]: newUnitCode
        }));

        // Get product and determine new price
        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        const newPrice = newUnitCode === product.productUnit1?.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        setUnitPrices(prev => ({
            ...prev,
            [productCode]: newPrice
        }));

        // Update total
        const quantity = quantities[productCode] || 1;
        const newTotal = quantity * newPrice;

        setTotals(prev => ({
            ...prev,
            [productCode]: newTotal
        }));

        // Recalculate all totals
        calculateOrderTotals();
    };

    const handleUnitPriceChange = (productCode, value) => {
        const newPrice = parseFloat(value);
        if (isNaN(newPrice) || newPrice < 0) return;

        setUnitPrices(prev => ({
            ...prev,
            [productCode]: newPrice
        }));

        // Update total
        const quantity = quantities[productCode] || 1;
        const newTotal = quantity * newPrice;

        setTotals(prev => ({
            ...prev,
            [productCode]: newTotal
        }));

        // Recalculate all totals
        calculateOrderTotals();
    };

    const handleDeleteProduct = (productCode) => {
        setProducts(prev => prev.filter(p => p.product_code !== productCode));

        // Remove from quantities, units, prices and totals
        const newQuantities = { ...quantities };
        const newUnits = { ...units };
        const newUnitPrices = { ...unitPrices };
        const newTotals = { ...totals };

        delete newQuantities[productCode];
        delete newUnits[productCode];
        delete newUnitPrices[productCode];
        delete newTotals[productCode];

        setQuantities(newQuantities);
        setUnits(newUnits);
        setUnitPrices(newUnitPrices);
        setTotals(newTotals);

        // Recalculate all totals
        calculateOrderTotals();
    };

    const handleUpdateOrder = async () => {
        if (!saveBranch || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please fill in all required fields',
                timer: 1500
            });
            return;
        }

        try {
            Swal.fire({
                title: 'Updating...',
                text: 'Updating purchase order',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const headerData = {
                refno: editRefno,
                rdate: formatDate(editDate),
                branch_code: saveBranch,
                trdate: `${editDate.getFullYear()}${String(editDate.getMonth() + 1).padStart(2, '0')}${String(editDate.getDate()).padStart(2, '0')}`,
                myear: editDate.getFullYear().toString(),
                monthh: String(editDate.getMonth() + 1).padStart(2, '0'),
                taxable: taxableAmount.toString(),
                nontaxable: nonTaxableAmount.toString(),
                total: total.toString()
            };

            // Update header
            await dispatch(updateKt_pow(headerData)).unwrap();

            // Process deleted products
            const deletedProducts = originalProducts.filter(original =>
                !products.some(current => current.product_code === original.product_code)
            );

            // Delete removed products
            for (const product of deletedProducts) {
                await dispatch(deleteKt_powdt({
                    refno: editRefno,
                    product_code: product.product_code
                })).unwrap();
            }

            // Process all products (update existing, add new)
            for (const product of products) {
                const productData = {
                    refno: editRefno,
                    product_code: product.product_code,
                    qty: quantities[product.product_code].toString(),
                    unit_code: units[product.product_code],
                    uprice: unitPrices[product.product_code].toString(),
                    amt: totals[product.product_code].toString()
                };

                if (product.isNewProduct) {
                    // Add new product
                    await dispatch(addKt_powdt(productData)).unwrap();
                } else {
                    // Update existing product
                    await dispatch(updateKt_powdt(productData)).unwrap();
                }
            }

            Swal.fire({
                icon: 'success',
                title: 'Order updated successfully',
                timer: 1500,
                showConfirmButton: false
            });

            onBack();
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error updating order',
                text: error.message || 'An unknown error occurred',
                confirmButtonText: 'OK'
            });
        }
    };

    const resetForm = () => {
        Swal.fire({
            title: 'Reset Changes',
            text: "Are you sure you want to reset all changes?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, reset!'
        }).then((result) => {
            if (result.isConfirmed) {
                onBack();
            }
        });
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Button onClick={onBack} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Back to Purchase Orders to Warehouse
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
                                        const vegasDate = convertToLasVegasTime(date);
                                        setEditDate(vegasDate);
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
                                        }
                                    }}
                                >
                                    <option value="">Select a Restaurant</option>
                                    {branch.map((item) => (
                                        <option key={item.branch_code} value={item.branch_code}>
                                            {item.branch_name}
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
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            searchProduct();
                                        }
                                    }}
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
                                        bgcolor: '#C5D9F2',
                                    }
                                }}
                            >
                                Reset
                            </Button>
                        </Box>

                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}>
                            <table style={{ width: '100%', marginTop: '24px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '4px', fontSize: '14px', width: '1%', color: '#754C27', fontWeight: '800' }}>No.</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '15%', color: '#754C27', fontWeight: '800' }}>Product Code</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '15%', color: '#754C27', fontWeight: '800' }}>Product Name</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Quantity</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Unit</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Unit Price</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Tax</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Total</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '1%', color: '#754C27', fontWeight: '800' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>
                                                No products in this order. Add products using the search above.
                                            </td>
                                        </tr>
                                    ) : products.map((product, index) => {
                                        const productCode = product.product_code;
                                        const currentUnit = units[productCode] || product.productUnit1?.unit_code;
                                        const currentQuantity = quantities[productCode] || 1;
                                        const currentUnitPrice = unitPrices[productCode] || 0;

                                        return (
                                            <tr key={productCode}>
                                                <td style={{ padding: '4px', fontSize: '12px', fontWeight: '800' }}>{index + 1}</td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>{productCode}</td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>{product.product_name}</td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={currentQuantity}
                                                        onChange={(e) => handleQuantityChange(productCode, e.target.value)}
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
                                                        {product.productUnit1?.unit_code && (
                                                            <option value={product.productUnit1.unit_code}>
                                                                {product.productUnit1.unit_name}
                                                            </option>
                                                        )}
                                                        {product.productUnit2?.unit_code && (
                                                            <option value={product.productUnit2.unit_code}>
                                                                {product.productUnit2.unit_name}
                                                            </option>
                                                        )}
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
                                                            textAlign: 'center',
                                                            fontWeight: '600',
                                                            padding: '4px'
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                    {product.tax1 === 'Y' ? 'Yes' : 'No'}
                                                </td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                    ${(totals[productCode] || 0).toFixed(2)}
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
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <Typography sx={{ color: '#FFFFFF' }}>Taxable</Typography>
                                <Typography sx={{ color: '#FFFFFF', ml: 'auto' }}>
                                    ${taxableAmount.toFixed(2)}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: '8px' }}>
                                <Typography sx={{ color: '#FFFFFF' }}>Non-taxable</Typography>
                                <Typography sx={{ color: '#FFFFFF', ml: 'auto' }}>
                                    ${nonTaxableAmount.toFixed(2)}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: '8px' }}>
                                <Typography sx={{ color: '#FFFFFF', fontSize: '30px', fontWeight: '600' }}>
                                    Total
                                </Typography>
                                <Typography sx={{ color: '#FFFFFF', ml: 'auto', fontSize: '30px', fontWeight: '600' }}>
                                    ${total.toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>

                        <Button
                            onClick={handleUpdateOrder}
                            sx={{
                                width: '100%',
                                height: '48px',
                                mt: '24px',
                                bgcolor: '#754C27',
                                color: '#FFFFFF',
                                '&:hover': {
                                    bgcolor: '#5D3A1F',
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
};