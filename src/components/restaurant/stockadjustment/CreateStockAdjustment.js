import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    Divider,
    InputAdornment,
    CircularProgress,
    Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../api/productrecordApi';
import { branchAll } from '../../../api/branchApi';
import { addBr_saf, Br_safrefno } from '../../../api/restaurant/br_safApi';
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

export default function CreateStockAdjustment({ onBack }) {
    const dispatch = useDispatch();

    // Loading state
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRefNo, setIsLoadingRefNo] = useState(false);

    // Form state
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('');
    const [branches, setBranches] = useState([]);
    const [saveBranch, setSaveBranch] = useState('');

    // Product-related state
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [total, setTotal] = useState(0);
    const [expiryDates, setExpiryDates] = useState({});
    const [imageErrors, setImageErrors] = useState({});

    // Search state
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson || '{}');

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                // Load branches
                const branchesResponse = await dispatch(branchAll({ offset: 0, limit: 100 })).unwrap();
                if (branchesResponse?.data) {
                    setBranches(branchesResponse.data);
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load initial data'
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [dispatch]);

    const handleGetLastRefNo = async (selectedDate, selectedBranch) => {
        try {
            if (!selectedBranch) {
                setLastRefNo('');
                return;
            }

            setIsLoadingRefNo(true);

            try {
                const res = await dispatch(Br_safrefno({
                    branch_code: selectedBranch,
                    date: selectedDate
                })).unwrap();

                if (res.result && res.data?.refno) {
                    setLastRefNo(res.data.refno);
                    return;
                }
            } catch (error) {
                console.warn("Could not get reference number from API, generating locally", error);
            }

            // Fallback: generate a reference number locally
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);
            const branchPrefix = selectedBranch.substring(0, 2).toUpperCase();
            const newRefNo = `BRSAF${branchPrefix}${year}${month}001`;
            setLastRefNo(newRefNo);

        } catch (err) {
            console.error("Error generating refno:", err);
            // Still generate a reference locally if all else fails
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);
            setLastRefNo(`BRSAF${year}${month}001`);
        } finally {
            setIsLoadingRefNo(false);
        }
    };

    // Update branch selection handler
    const handleBranchChange = (event) => {
        const newBranchCode = event.target.value;
        setSaveBranch(newBranchCode);
        if (newBranchCode) {  // Only call if we have a branch code
            handleGetLastRefNo(startDate, newBranchCode);
        } else {
            setLastRefNo('');
        }
    };

    // Handle date change
    const handleDateChange = (date) => {
        setStartDate(date);
        if (saveBranch) {
            handleGetLastRefNo(date, saveBranch);
        }
    };

    // Search functionality
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
                            text: `${selectedProduct.product_name} is already in your adjustment. Please adjust the quantity instead.`,
                            confirmButtonColor: '#754C27'
                        });
                    } else {
                        handleProductSelect(selectedProduct);
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

    const handleProductSelect = (product) => {
        if (products.some(p => p.product_code === product.product_code)) {
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Product',
                text: `${product.product_name} is already in your adjustment. Please adjust the quantity instead.`,
                confirmButtonColor: '#754C27'
            });
            setSearchTerm('');
            setShowDropdown(false);
            return;
        }

        const productCode = product.product_code;
        const initialQuantity = 1;
        const initialUnitCode = product.productUnit1?.unit_code || '';
        const initialUnitPrice = product.bulk_unit_price || 0;
        const initialAmount = initialQuantity * initialUnitPrice;

        setProducts(prev => [...prev, product]);
        setQuantities(prev => ({ ...prev, [productCode]: initialQuantity }));
        setUnits(prev => ({ ...prev, [productCode]: initialUnitCode }));
        setUnitPrices(prev => ({ ...prev, [productCode]: initialUnitPrice }));
        setTotals(prev => ({ ...prev, [productCode]: initialAmount }));
        setExpiryDates(prev => ({ ...prev, [productCode]: new Date() }));
        setTotal(prev => prev + initialAmount);

        setSearchTerm('');
        setShowDropdown(false);
    };

    const handleQuantityChange = (productCode, delta) => {
        const currentQty = quantities[productCode] || 0;
        const newQty = Math.max(1, currentQty + delta);
        const price = unitPrices[productCode] || 0;
        const newTotal = newQty * price;

        setQuantities(prev => ({ ...prev, [productCode]: newQty }));
        setTotals(prev => {
            const oldTotal = prev[productCode] || 0;
            return { ...prev, [productCode]: newTotal };
        });
        setTotal(prev => prev - (currentQty * price) + newTotal);
    };

    const handleQuantityInputChange = (productCode, value) => {
        const newQty = parseInt(value);
        if (!isNaN(newQty) && newQty >= 1) {
            const currentQty = quantities[productCode] || 0;
            const price = unitPrices[productCode] || 0;
            const newTotal = newQty * price;

            setQuantities(prev => ({ ...prev, [productCode]: newQty }));
            setTotals(prev => {
                const oldTotal = prev[productCode] || 0;
                return { ...prev, [productCode]: newTotal };
            });
            setTotal(prev => prev - (currentQty * price) + newTotal);
        }
    };

    const handleUnitChange = (productCode, newUnitCode) => {
        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        const currentQty = quantities[productCode] || 0;
        const newPrice = newUnitCode === product.productUnit1?.unit_code
            ? (product.bulk_unit_price || 0)
            : (product.retail_unit_price || 0);
        const oldPrice = unitPrices[productCode] || 0;
        const newTotal = currentQty * newPrice;

        setUnits(prev => ({ ...prev, [productCode]: newUnitCode }));
        setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(prev => prev - (currentQty * oldPrice) + newTotal);
    };

    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({
            ...prev,
            [productCode]: date
        }));
    };

    const handleDeleteProduct = (productCode) => {
        // Calculate amount to remove from total
        const amount = totals[productCode] || 0;

        setProducts(prev => prev.filter(p => p.product_code !== productCode));

        // Clean up associated state
        const { [productCode]: _, ...newQuantities } = quantities;
        const { [productCode]: __, ...newUnits } = units;
        const { [productCode]: ___, ...newUnitPrices } = unitPrices;
        const { [productCode]: ____, ...newTotals } = totals;
        const { [productCode]: _____, ...newExpiryDates } = expiryDates;

        setQuantities(newQuantities);
        setUnits(newUnits);
        setUnitPrices(newUnitPrices);
        setTotals(newTotals);
        setExpiryDates(newExpiryDates);
        setTotal(prev => prev - amount);
    };

    const handleSave = async () => {
        if (!saveBranch || products.length === 0 || !lastRefNo) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a branch and add at least one product',
                timer: 1500
            });
            return;
        }

        try {
            setIsLoading(true);
            Swal.fire({
                title: 'Saving adjustment...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const headerData = {
                refno: lastRefNo,
                rdate: format(startDate, 'MM/dd/yyyy'),
                branch_code: saveBranch,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2.user_code
            };

            const productArrayData = products.map(product => ({
                refno: headerData.refno,
                product_code: product.product_code,
                qty: quantities[product.product_code].toString(),
                unit_code: units[product.product_code],
                uprice: unitPrices[product.product_code].toString(),
                amt: totals[product.product_code].toString(),
                expire_date: format(expiryDates[product.product_code], 'MM/dd/yyyy'),
                texpire_date: format(expiryDates[product.product_code], 'yyyyMMdd')
            }));

            const orderData = {
                headerData,
                productArrayData,
                footerData: {
                    total: total.toString()
                }
            };

            await dispatch(addBr_saf(orderData)).unwrap();

            await Swal.fire({
                icon: 'success',
                title: 'Created stock adjustment successfully',
                text: `Reference No: ${lastRefNo}`,
                showConfirmButton: false,
                timer: 1500
            });

            onBack();

        } catch (error) {
            console.error('Save error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error saving stock adjustment',
                confirmButtonText: 'OK'
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
        setTotal(0);
        setSaveBranch('');
        setSearchTerm('');
        setExpiryDates({});
        setLastRefNo('');
    };

    if (isLoading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: 2
            }}>
                <Typography variant="h6">Loading...</Typography>
                <CircularProgress />
            </Box>
        );
    }

    const renderProductImage = (product) => {
        // If no image
        if (!product?.product_img) {
            return <span style={{ color: '#999' }}>No image</span>;
        }

        // Check if this image has errored before
        if (imageErrors[product.product_code]) {
            return <span style={{ color: '#999' }}>Image error</span>;
        }

        const baseUrl = process.env.REACT_APP_URL_API || 'http://localhost:4001';
        const imageUrl = `${baseUrl}/public/images/${product.product_img}`;

        return (
            <Box sx={{
                width: '50px',
                height: '50px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '4px',
                display: 'inline-block',
                border: '1px solid #ddd',
            }}>
                <img
                    src={imageUrl}
                    alt={product.product_name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
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

    return (
        <Box sx={{ width: '100%' }}>
            <Button
                onClick={onBack}
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2 }}
            >
                Back to Stock Adjustments
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
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Ref.no
                        </Typography>
                        <TextField
                            value={isLoadingRefNo ? "Generating..." : (lastRefNo || "Please select restaurant first")}
                            disabled
                            size="small"
                            fullWidth
                            sx={{
                                mt: '8px',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                },
                                '& .Mui-disabled': {
                                    WebkitTextFillColor: !lastRefNo ? '#d32f2f' : 'rgba(0, 0, 0, 0.38)',
                                }
                            }}
                            InputProps={{
                                endAdornment: isLoadingRefNo ? (
                                    <InputAdornment position="end">
                                        <CircularProgress size={20} />
                                    </InputAdornment>
                                ) : null,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Date
                        </Typography>
                        <DatePicker
                            selected={startDate}
                            onChange={handleDateChange}
                            dateFormat="MM/dd/yyyy"
                            customInput={<CustomInput />}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Restaurant
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
                            <option value="">Select Restaurant</option>
                            {branches.map((branch) => (
                                <option key={branch.branch_code} value={branch.branch_code}>
                                    {branch.branch_name}
                                </option>
                            ))}
                        </Box>
                    </Grid>
                </Grid>

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
                                <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Image</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>Product Code</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>Product Name</th>
                                <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Expiry Date</th>
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
                                    <td colSpan={8} style={{ padding: '20px', textAlign: 'center' }}>
                                        No products added yet. Search and add products above.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product, index) => (
                                    <tr key={product.product_code}>
                                        <td style={{ padding: '12px' }}>{index + 1}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            {renderProductImage(product)}
                                        </td>
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
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                <IconButton
                                                    onClick={() => handleQuantityChange(product.product_code, -1)}
                                                    size="small"
                                                >
                                                    <RemoveIcon />
                                                </IconButton>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={quantities[product.product_code] || 1}
                                                    onChange={(e) => handleQuantityInputChange(product.product_code, e.target.value)}
                                                    style={{
                                                        width: '60px',
                                                        padding: '4px',
                                                        textAlign: 'center',
                                                        margin: '0 8px'
                                                    }}
                                                />
                                                <IconButton
                                                    onClick={() => handleQuantityChange(product.product_code, 1)}
                                                    size="small"
                                                >
                                                    <AddIcon />
                                                </IconButton>
                                            </Box>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <select
                                                value={units[product.product_code] || (product.productUnit1?.unit_code || '')}
                                                onChange={(e) => handleUnitChange(product.product_code, e.target.value)}
                                                style={{
                                                    padding: '4px',
                                                    width: '100px'
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
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={unitPrices[product.product_code] || 0}
                                                onChange={(e) => {
                                                    const newPrice = parseFloat(e.target.value);
                                                    if (!isNaN(newPrice) && newPrice >= 0) {
                                                        const qty = quantities[product.product_code] || 0;
                                                        const oldPrice = unitPrices[product.product_code] || 0;
                                                        const newTotal = qty * newPrice;

                                                        setUnitPrices(prev => ({ ...prev, [product.product_code]: newPrice }));
                                                        setTotals(prev => ({ ...prev, [product.product_code]: newTotal }));
                                                        setTotal(prev => prev - (qty * oldPrice) + newTotal);
                                                    }
                                                }}
                                                style={{
                                                    width: '90px',
                                                    padding: '4px',
                                                    textAlign: 'right'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'medium' }}>
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
                        <Typography>Total Items</Typography>
                        <Typography>{products.length}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Total Quantity</Typography>
                        <Typography>
                            {Object.values(quantities).reduce((sum, qty) => sum + qty, 0)}
                        </Typography>
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
                    disabled={isLoading || !lastRefNo || products.length === 0}
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