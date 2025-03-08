import {
    Box, Button, InputAdornment, TextField, Typography, IconButton,
    Divider, Grid, CircularProgress, Select, MenuItem, TableContainer,
    Table, TableHead, TableRow, TableCell, TableBody, Paper
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { Kt_trwByRefno, updateKt_trw } from '../../../../api/kitchen/kt_trwApi';
import { searchProductName } from '../../../../api/productrecordApi';
import { kitchenAll } from '../../../../api/kitchenApi';
import Swal from 'sweetalert2';
import { format, parse } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Custom date picker input component
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

export default function EditTransferToWarehouse({ onBack, editRefno }) {
    const dispatch = useDispatch();

    // Loading state
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [receiptDate, setReceiptDate] = useState(new Date());
    const [kitchenCode, setKitchenCode] = useState('');

    // Data sources
    const [kitchens, setKitchens] = useState([]);

    // Product selection state
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    // Product details state
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [expiryDates, setExpiryDates] = useState({});
    const [temperatures, setTemperatures] = useState({}); // Added for temperature
    const [imageErrors, setImageErrors] = useState({});
    const [total, setTotal] = useState(0);

    // Get user data
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson);

    // Load initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch kitchens
                const kitchenResponse = await dispatch(kitchenAll({ offset: 0, limit: 100 })).unwrap();
                setKitchens(kitchenResponse.data || []);

                // Fetch receipt data
                const receiptResponse = await dispatch(Kt_trwByRefno({ refno: editRefno })).unwrap();
                if (receiptResponse.result && receiptResponse.data) {
                    const receiptData = receiptResponse.data;

                    // Set header data
                    if (receiptData.rdate) {
                        try {
                            const parsedDate = parse(receiptData.rdate, 'MM/dd/yyyy', new Date());
                            setReceiptDate(parsedDate);
                        } catch (e) {
                            console.error("Date parsing error:", e);
                            setReceiptDate(new Date());
                        }
                    }

                    setKitchenCode(receiptData.kitchen_code || '');

                    // Process receipt products
                    if (receiptData.kt_trwdts && receiptData.kt_trwdts.length > 0) {
                        const productsData = [];
                        const quantitiesData = {};
                        const unitsData = {};
                        const pricesData = {};
                        const totalsData = {};
                        const expiryDatesData = {};
                        const temperaturesData = {}; // Added for temperature
                        let totalSum = 0;

                        // Process each product in receipt
                        receiptData.kt_trwdts.forEach(item => {
                            const product = item.tbl_product;
                            if (product) {
                                productsData.push(product);

                                quantitiesData[product.product_code] = parseFloat(item.qty) || 1;
                                unitsData[product.product_code] = item.unit_code || product.productUnit1.unit_code;
                                pricesData[product.product_code] = parseFloat(item.uprice) || product.bulk_unit_price;
                                temperaturesData[product.product_code] = item.temperature1 || ''; // Get temperature data

                                const lineTotal = parseFloat(item.amt) ||
                                    parseFloat(item.qty) * parseFloat(item.uprice);
                                totalsData[product.product_code] = lineTotal;
                                totalSum += lineTotal;

                                if (item.expire_date) {
                                    try {
                                        expiryDatesData[product.product_code] = parse(
                                            item.expire_date,
                                            'MM/dd/yyyy',
                                            new Date()
                                        );
                                    } catch (e) {
                                        expiryDatesData[product.product_code] = new Date();
                                    }
                                } else {
                                    expiryDatesData[product.product_code] = new Date();
                                }
                            }
                        });

                        setProducts(productsData);
                        setQuantities(quantitiesData);
                        setUnits(unitsData);
                        setUnitPrices(pricesData);
                        setTotals(totalsData);
                        setExpiryDates(expiryDatesData);
                        setTemperatures(temperaturesData); // Store temperature data
                        setTotal(totalSum);
                    }
                }

            } catch (error) {
                console.error("Error fetching receipt data:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load transfer data',
                    confirmButtonText: 'OK'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dispatch, editRefno]);

    // Search for products
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

    // Function to render product image with error handling
    const renderProductImage = (product, size = 'small') => {
        // If no image
        if (!product?.product_img) {
            return (
                <Box sx={{
                    width: size === 'small' ? '100%' : (size === 'table' ? '50px' : 200),
                    height: size === 'small' ? 100 : (size === 'table' ? '50px' : 200),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: size === 'table' ? '4px' : '8px'
                }}>
                    <Typography variant="body2" color="text.secondary">No Image</Typography>
                </Box>
            );
        }

        // Check if this image has errored before
        if (imageErrors[product.product_code]) {
            return (
                <Box sx={{
                    width: size === 'small' ? '100%' : (size === 'table' ? '50px' : 200),
                    height: size === 'small' ? 100 : (size === 'table' ? '50px' : 200),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: size === 'table' ? '4px' : '8px'
                }}>
                    <Typography variant="body2" color="text.secondary">Image Error</Typography>
                </Box>
            );
        }

        const baseUrl = process.env.REACT_APP_URL_API || 'http://localhost:4001';
        const imageUrl = `${baseUrl}/public/images/${product.product_img}`;

        return (
            <Box sx={{
                width: '100%',
                height: size === 'small' ? 100 : (size === 'table' ? '50px' : 200),
                position: 'relative',
                overflow: 'hidden'
            }}>
                <img
                    src={imageUrl}
                    alt={product.product_name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: size === 'table' ? '4px' : '8px 8px 0 0'
                    }}
                    onError={(e) => {
                        console.error('Image load error:', imageUrl);
                        setImageErrors(prev => ({
                            ...prev,
                            [product.product_code]: true
                        }));
                    }}
                />
            </Box>
        );
    };

    // Add product to the list
    const handleProductSelect = (product) => {
        // Check if product already exists
        if (products.some(p => p.product_code === product.product_code)) {
            Swal.fire({
                icon: 'warning',
                title: 'Product Already Added',
                text: 'This product is already in your transfer.',
                timer: 1500
            });
            return;
        }

        setProducts([...products, product]);
        setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
        setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1.unit_code }));
        setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price }));
        setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
        setTemperatures(prev => ({ ...prev, [product.product_code]: '' })); // Initialize temperature

        // Calculate total
        const newLineTotal = product.bulk_unit_price * 1;
        setTotals(prev => ({ ...prev, [product.product_code]: newLineTotal }));
        setTotal(prev => prev + newLineTotal);

        setSearchTerm('');
        setShowDropdown(false);
    };

    // Remove product from the list
    const handleDeleteProduct = (productCode) => {
        const updatedProducts = products.filter(p => p.product_code !== productCode);
        setProducts(updatedProducts);

        // Update total
        const removedTotal = totals[productCode] || 0;
        setTotal(prev => prev - removedTotal);

        // Clean up state
        const { [productCode]: _, ...newQuantities } = quantities;
        const { [productCode]: __, ...newUnits } = units;
        const { [productCode]: ___, ...newPrices } = unitPrices;
        const { [productCode]: ____, ...newTotals } = totals;
        const { [productCode]: _____, ...newExpiryDates } = expiryDates;
        const { [productCode]: ______, ...newTemperatures } = temperatures;

        setQuantities(newQuantities);
        setUnits(newUnits);
        setUnitPrices(newPrices);
        setTotals(newTotals);
        setExpiryDates(newExpiryDates);
        setTemperatures(newTemperatures);
    };

    // Update quantity
    const handleQuantityChange = (productCode, delta) => {
        const currentQty = quantities[productCode] || 0;
        const newQty = Math.max(1, currentQty + delta);

        setQuantities(prev => ({ ...prev, [productCode]: newQty }));

        // Update total
        const price = unitPrices[productCode];
        const oldTotal = totals[productCode] || 0;
        const newTotal = newQty * price;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(prev => prev - oldTotal + newTotal);
    };

    // Update unit (which affects price)
    const handleUnitChange = (productCode, newUnit) => {
        setUnits(prev => ({ ...prev, [productCode]: newUnit }));

        const product = products.find(p => p.product_code === productCode);
        const newPrice = newUnit === product.productUnit1.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        // Update price
        const oldPrice = unitPrices[productCode];
        const qty = quantities[productCode];
        const oldTotal = totals[productCode] || 0;

        setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));

        // Update total
        const newTotal = qty * newPrice;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(prev => prev - oldTotal + newTotal);
    };

    // Update expiry date
    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
    };

    // Update temperature
    const handleTemperatureChange = (productCode, value) => {
        setTemperatures(prev => ({ ...prev, [productCode]: value }));
    };

    // Update price manually
    const handlePriceChange = (productCode, newPrice) => {
        if (newPrice < 0) return;

        const oldPrice = unitPrices[productCode] || 0;
        const qty = quantities[productCode] || 0;
        const oldTotal = totals[productCode] || 0;

        setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));

        // Update total
        const newTotal = qty * newPrice;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(prev => prev - oldTotal + newTotal);
    };

    // Calculate tax based on products with tax1='Y'
    const calculateTax = () => {
        let taxableAmount = 0;
        products.forEach(product => {
            if (product.tax1 === 'Y') {
                const productCode = product.product_code;
                const quantity = quantities[productCode] || 0;
                const unitPrice = unitPrices[productCode] || 0;
                taxableAmount += quantity * unitPrice;
            }
        });
        return taxableAmount * 0.07;
    };

    // Handle form submission (update)
    const handleUpdate = async () => {
        if (!kitchenCode || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a kitchen and add at least one product.',
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
                rdate: format(receiptDate, 'MM/dd/yyyy'),
                kitchen_code: kitchenCode,
                trdate: format(receiptDate, 'yyyyMMdd'),
                monthh: format(receiptDate, 'MM'),
                myear: receiptDate.getFullYear(),
                user_code: userData2?.user_code || '',
            };

            const productArrayData = products.map(product => ({
                refno: editRefno,
                product_code: product.product_code,
                qty: quantities[product.product_code].toString(),
                unit_code: units[product.product_code],
                uprice: unitPrices[product.product_code].toString(),
                amt: totals[product.product_code].toString(),
                expire_date: format(expiryDates[product.product_code], 'MM/dd/yyyy'),
                texpire_date: format(expiryDates[product.product_code], 'yyyyMMdd'),
                tax1: product.tax1 || 'N',
                temperature1: temperatures[product.product_code] || '' // Include temperature data
            }));

            const taxableAmount = productArrayData.reduce((sum, product) => {
                if (product.tax1 === 'Y') {
                    return sum + parseFloat(product.amt);
                }
                return sum;
            }, 0);

            const nontaxableAmount = productArrayData.reduce((sum, product) => {
                if (product.tax1 !== 'Y') {
                    return sum + parseFloat(product.amt);
                }
                return sum;
            }, 0);

            const saleTax = taxableAmount * 0.07;

            await dispatch(updateKt_trw({
                headerData,
                productArrayData,
                footerData: {
                    taxable: taxableAmount.toString(),
                    nontaxable: nontaxableAmount.toString(),
                    total: total.toString(),
                    sale_tax: saleTax.toString(),
                    total_due: (total + saleTax).toString()
                }
            })).unwrap();

            await Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Record updated successfully',
                timer: 1500
            });

            onBack();
        } catch (error) {
            console.error('Error updating data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error updating data',
                confirmButtonColor: '#754C27'
            });
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: '#754C27' }} />
                <Typography sx={{ ml: 2 }}>Loading transfer data...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Button
                onClick={onBack}
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2 }}
            >
                Back to Transfer to Warehouse
            </Button>

            <Box sx={{ backgroundColor: '#fff', borderRadius: '10px', p: 3, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="h6" sx={{ color: '#754C27', mb: 3 }}>
                    Edit Transfer: {editRefno}
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Ref.no
                        </Typography>
                        <TextField
                            value={editRefno}
                            disabled
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
                            selected={receiptDate}
                            onChange={(date) => setReceiptDate(date)}
                            dateFormat="MM/dd/yyyy"
                            customInput={<CustomInput />}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Kitchen
                        </Typography>
                        <Select
                            value={kitchenCode}
                            onChange={(e) => setKitchenCode(e.target.value)}
                            displayEmpty
                            size="small"
                            fullWidth
                            sx={{
                                mt: '8px',
                                borderRadius: '10px',
                                height: '40px'
                            }}
                        >
                            <MenuItem value=""><em>Select Kitchen</em></MenuItem>
                            {kitchens.map((kitchen) => (
                                <MenuItem key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                                    {kitchen.kitchen_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Add Products
                        </Typography>
                        <Box sx={{ position: 'relative', width: '100%', mt: '8px' }}>
                            <TextField
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Search for products..."
                                size="small"
                                fullWidth
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
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
                                            <Typography variant="caption" color="text.secondary">
                                                {product.product_code} - ${product.bulk_unit_price.toFixed(2)}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ color: '#754C27', mb: 2 }}>
                    Product List
                </Typography>

                <TableContainer component={Paper} sx={{ boxShadow: 'none', mb: 3 }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>No.</TableCell>
                                <TableCell>Image</TableCell>
                                <TableCell>Product</TableCell>
                                <TableCell>Expiry Date</TableCell>
                                <TableCell>Temperature</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Unit</TableCell>
                                <TableCell>Unit Price</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} style={{ textAlign: 'center', padding: '20px' }}>
                                        No products added yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product, index) => (
                                    <TableRow key={product.product_code}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <Box sx={{
                                                width: 50,
                                                height: 50,
                                                overflow: 'hidden',
                                                borderRadius: '4px'
                                            }}>
                                                {renderProductImage(product, 'table')}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">
                                                {product.product_name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {product.product_code}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <DatePicker
                                                selected={expiryDates[product.product_code]}
                                                onChange={(date) => handleExpiryDateChange(product.product_code, date)}
                                                dateFormat="MM/dd/yyyy"
                                                customInput={<CustomInput />}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                value={temperatures[product.product_code] || ""}
                                                onChange={(e) => handleTemperatureChange(product.product_code, e.target.value)}
                                                placeholder="Temperature"
                                                size="small"
                                                sx={{ width: 100 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <IconButton
                                                    onClick={() => handleQuantityChange(product.product_code, -1)}
                                                    size="small"
                                                >
                                                    <RemoveIcon />
                                                </IconButton>
                                                <Typography sx={{ mx: 1 }}>
                                                    {quantities[product.product_code]}
                                                </Typography>
                                                <IconButton
                                                    onClick={() => handleQuantityChange(product.product_code, 1)}
                                                    size="small"
                                                >
                                                    <AddIcon />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={units[product.product_code]}
                                                onChange={(e) => handleUnitChange(product.product_code, e.target.value)}
                                                size="small"
                                                sx={{ minWidth: 100 }}
                                            >
                                                <MenuItem value={product.productUnit1.unit_code}>
                                                    {product.productUnit1.unit_name}
                                                </MenuItem>
                                                <MenuItem value={product.productUnit2.unit_code}>
                                                    {product.productUnit2.unit_name}
                                                </MenuItem>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                value={unitPrices[product.product_code]}
                                                onChange={(e) => handlePriceChange(product.product_code, Number(e.target.value))}
                                                size="small"
                                                inputProps={{ min: 0, step: 0.01 }}
                                                sx={{ width: 100 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            ${totals[product.product_code]?.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleDeleteProduct(product.product_code)}
                                                color="error"
                                                size="small"
                                            >
                                                <CancelIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {products.length > 0 && (
                    <Box sx={{
                        mt: 3,
                        p: 2,
                        bgcolor: '#EAB86C',
                        borderRadius: '10px',
                        color: 'white'
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Subtotal</Typography>
                            <Typography>${total.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Tax (7%)</Typography>
                            <Typography>${calculateTax().toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Typography variant="h5">Total</Typography>
                            <Typography variant="h5">${(total + calculateTax()).toFixed(2)}</Typography>
                        </Box>
                    </Box>
                )}

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        variant="outlined"
                        onClick={onBack}
                        sx={{
                            borderColor: '#754C27',
                            color: '#754C27',
                            '&:hover': {
                                borderColor: '#5c3c1f',
                                backgroundColor: 'rgba(117, 76, 39, 0.04)',
                            }
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleUpdate}
                        sx={{
                            bgcolor: '#754C27',
                            color: '#FFFFFF',
                            '&:hover': {
                                bgcolor: '#5c3c1f',
                            }
                        }}
                    >
                        Update Transfer
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}