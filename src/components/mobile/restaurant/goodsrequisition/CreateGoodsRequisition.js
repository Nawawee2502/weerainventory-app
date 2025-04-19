import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    Divider,
    InputAdornment,
    Card,
    CardContent,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Select,
    MenuItem,
    Pagination,
    Paper,
    Grid,
    CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../../api/productrecordApi';
import { branchAll } from '../../../../api/branchApi';
import { addBr_grf, Br_grfrefno } from '../../../../api/restaurant/br_grfApi';
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
                    borderRadius: '10px',
                    mt: '8px'
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

export default function CreateGoodsRequisition({ onBack }) {
    const dispatch = useDispatch();

    // Loading state
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
    // Keep these states for data submission, but don't display in UI
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [total, setTotal] = useState(0);

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [expiryDates, setExpiryDates] = useState({});
    const [imageErrors, setImageErrors] = useState({});

    // Pagination state
    const [page, setPage] = useState(1);
    const [productsPerPage] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [paginatedProducts, setPaginatedProducts] = useState([]);

    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson);

    useEffect(() => {
        // Fetch branches
        dispatch(branchAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((res) => {
                setBranches(res.data);
            })
            .catch((err) => console.log(err.message));

        // Initial product load
        dispatch(searchProductName({ product_name: '' }))
            .unwrap()
            .then((res) => {
                if (res.data) {
                    setAllProducts(res.data);
                    setFilteredProducts(res.data);
                }
            })
            .catch((err) => console.log(err.message));
    }, [dispatch]);

    // Handle filtering and pagination
    useEffect(() => {
        const filtered = allProducts.filter(product =>
            product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.product_code?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Sort products: selected ones first
        const sortedProducts = [...filtered].sort((a, b) => {
            const aSelected = selectedProducts.includes(a.product_code);
            const bSelected = selectedProducts.includes(b.product_code);

            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return 0;
        });

        setFilteredProducts(sortedProducts);
        setTotalPages(Math.ceil(sortedProducts.length / productsPerPage));
        setPage(1); // Reset to first page when filter changes
    }, [searchTerm, allProducts, selectedProducts, productsPerPage]);

    // Update paginated products when page or filtered products change
    useEffect(() => {
        const startIndex = (page - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
    }, [filteredProducts, page, productsPerPage]);


    const handleGetLastRefNo = async (selectedDate, selectedBranch) => {
        try {
            if (!selectedBranch) {
                setLastRefNo('');
                return;
            }

            setIsLoadingRefNo(true);

            const res = await dispatch(Br_grfrefno({
                branch_code: selectedBranch,
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

    // Function to render product image with error handling
    const renderProductImage = (product, size = 'small') => {
        // If no image
        if (!product?.product_img) {
            return (
                <Box sx={{
                    width: size === 'small' ? '100%' : (size === 'table' ? '100%' : 200),
                    height: size === 'small' ? 100 : (size === 'table' ? '100%' : 200),
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
                    width: size === 'small' ? '100%' : (size === 'table' ? '100%' : 200),
                    height: size === 'small' ? 100 : (size === 'table' ? '100%' : 200),
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
                height: size === 'small' ? 100 : (size === 'table' ? '100%' : 200),
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

    const toggleSelectProduct = (product) => {
        const isSelected = selectedProducts.includes(product.product_code);

        if (isSelected) {
            setSelectedProducts(prev => prev.filter(id => id !== product.product_code));
            setProducts(prev => prev.filter(p => p.product_code !== product.product_code));

            // Clean up associated state
            const { [product.product_code]: _, ...newQuantities } = quantities;
            const { [product.product_code]: __, ...newUnits } = units;
            const { [product.product_code]: ___, ...newPrices } = unitPrices;
            const { [product.product_code]: ____, ...newTotals } = totals;
            const { [product.product_code]: _____, ...newExpiryDates } = expiryDates;

            setQuantities(newQuantities);
            setUnits(newUnits);
            setUnitPrices(newPrices);
            setTotals(newTotals);
            setExpiryDates(newExpiryDates);

            setTotal(Object.values(newTotals).reduce((sum, curr) => sum + curr, 0));

        } else {
            setSelectedProducts(prev => [...prev, product.product_code]);
            setProducts(prev => [...prev, product]);

            // Initialize associated state
            setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
            setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1.unit_code }));
            setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price }));
            setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));

            // Calculate initial total (still needed for backend but not displayed)
            const initialTotal = product.bulk_unit_price * 1;
            setTotals(prev => ({ ...prev, [product.product_code]: initialTotal }));
            setTotal(prev => prev + initialTotal);
        }
    };

    const handleQuantityChange = (productCode, delta) => {
        const currentQty = quantities[productCode] || 0;
        const newQty = Math.max(1, currentQty + delta);

        setQuantities(prev => ({ ...prev, [productCode]: newQty }));

        // Update total (still needed for backend)
        const price = unitPrices[productCode];
        const newTotal = newQty * price;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(Object.values({ ...totals, [productCode]: newTotal }).reduce((a, b) => a + b, 0));
    };

    const handleUnitChange = (productCode, newUnit) => {
        setUnits(prev => ({ ...prev, [productCode]: newUnit }));

        const product = products.find(p => p.product_code === productCode);
        const newPrice = newUnit === product.productUnit1.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));

        // Update total (still needed for backend)
        const qty = quantities[productCode];
        const newTotal = qty * newPrice;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(Object.values({ ...totals, [productCode]: newTotal }).reduce((a, b) => a + b, 0));
    };

    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
    };

    const handleSave = async () => {
        if (!saveBranch || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a branch and at least one product.',
                timer: 1500
            });
            return;
        }

        try {
            Swal.fire({
                title: 'Saving requisition...',
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
                user_code: userData2.user_code,
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

            await dispatch(addBr_grf(orderData)).unwrap();

            await Swal.fire({
                icon: 'success',
                title: 'Created requisition successfully',
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
                text: error.message || 'Error saving requisition',
                confirmButtonText: 'OK'
            });
        }
    };

    // Calculate tax based on products with tax1='Y' (still needed for backend)
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

    const resetForm = () => {
        setProducts([]);
        setSelectedProducts([]);
        setQuantities({});
        setUnits({});
        setUnitPrices({});
        setTotals({});
        setTotal(0);
        setSaveBranch('');
        setSearchTerm('');
        setExpiryDates({});
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <Box sx={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <style>
                {`
                .react-datepicker-popper {
                    z-index: 9999 !important;
                }
            `}
            </style>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                sx={{ marginBottom: "20px" }}
            >
                Back to Internal Requisition
            </Button>

            {/* Main content */}
            <Box display="flex" p={2} bgcolor="#F9F9F9" borderRadius="12px" boxShadow={1}>
                {/* Left Panel - Product Selection */}
                <Box flex={2} pr={2} display="flex" flexDirection="column">
                    {/* Search and Filter Section */}
                    <Box sx={{ marginBottom: "20px", paddingTop: '20px' }}>
                        <TextField
                            placeholder="Search products by name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                width: '100%',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '40px',
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#5A607F' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    {/* Products Grid */}
                    <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center" sx={{ flex: 1, overflow: 'auto' }}>
                        {paginatedProducts.length === 0 ? (
                            <Typography sx={{ my: 4, color: 'text.secondary' }}>
                                No products found matching your search criteria
                            </Typography>
                        ) : (
                            paginatedProducts.map((product) => (
                                <Card
                                    key={product.product_code}
                                    sx={{
                                        width: 160,
                                        borderRadius: '16px',
                                        boxShadow: 3,
                                        position: 'relative',
                                        cursor: 'pointer',
                                        border: selectedProducts.includes(product.product_code) ? '2px solid #4caf50' : 'none',
                                        bgcolor: selectedProducts.includes(product.product_code) ? '#f0fff0' : 'white',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4
                                        }
                                    }}
                                    onClick={() => toggleSelectProduct(product)}
                                >
                                    {renderProductImage(product, 'small')}
                                    <CardContent>
                                        <Typography variant="body1" fontWeight={500} noWrap>
                                            {product.product_name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {product.product_code}
                                        </Typography>
                                        {/* Removed price display */}
                                    </CardContent>
                                    {selectedProducts.includes(product.product_code) && (
                                        <CheckCircleIcon
                                            sx={{
                                                color: '#4caf50',
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                fontSize: 30,
                                                backgroundColor: 'rgba(255,255,255,0.7)',
                                                borderRadius: '50%'
                                            }}
                                        />
                                    )}
                                </Card>
                            ))
                        )}
                    </Box>

                    {/* Pagination */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            showFirstButton
                            showLastButton
                            size="large"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    '&.Mui-selected': {
                                        backgroundColor: '#754C27',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#5c3c1f',
                                        }
                                    }
                                }
                            }}
                        />
                    </Box>
                </Box>

                {/* Right Panel - Order Details */}
                <Box flex={2} pl={2} bgcolor="#FFF" p={3} borderRadius="12px" boxShadow={3}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
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
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                                Restaurant
                            </Typography>
                            <Select
                                value={saveBranch}
                                onChange={handleBranchChange}
                                displayEmpty
                                size="small"
                                fullWidth
                                sx={{
                                    mt: '8px',
                                    borderRadius: '10px',
                                }}
                            >
                                <MenuItem value=""><em>Select Restaurant</em></MenuItem>
                                {branches.map((branch) => (
                                    <MenuItem key={branch.branch_code} value={branch.branch_code}>
                                        {branch.branch_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                                Date
                            </Typography>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => {
                                    setStartDate(date);
                                    handleGetLastRefNo(date, saveBranch);
                                }}
                                dateFormat="MM/dd/yyyy"
                                customInput={<CustomInput />}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Current Order Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" color="#754C27">Current Order</Typography>
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                {products.length} items selected
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={resetForm}
                                sx={{
                                    background: "rgba(192, 231, 243, 0.88)",
                                    color: '#3399FF',
                                    '&:hover': {
                                        background: "rgba(192, 231, 243, 0.95)",
                                    },
                                    ml: 1
                                }}
                                disabled={products.length === 0}
                            >
                                Clear All
                            </Button>
                        </Box>
                    </Box>

                    {/* Order Table */}
                    <TableContainer component={Paper} sx={{
                        mt: 2,
                        maxHeight: '400px',
                        overflow: 'auto',
                        boxShadow: 'none',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px'
                    }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell>No.</TableCell>
                                    <TableCell>Image</TableCell>
                                    <TableCell>Product</TableCell>
                                    <TableCell>Expiry Date</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Unit</TableCell>
                                    {/* Removed Price column */}
                                    {/* Removed Total column */}
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            No products added yet. Select products from the left panel.
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
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
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
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <IconButton
                                                        onClick={() => handleQuantityChange(product.product_code, -1)}
                                                        size="small"
                                                    >
                                                        <RemoveIcon />
                                                    </IconButton>
                                                    <Typography sx={{ mx: 1 }}>{quantities[product.product_code]}</Typography>
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
                                                    sx={{ minWidth: 80 }}
                                                >
                                                    {product.productUnit1 && (
                                                        <MenuItem value={product.productUnit1.unit_code}>
                                                            {product.productUnit1.unit_name}
                                                        </MenuItem>
                                                    )}
                                                    {product.productUnit2 && (
                                                        <MenuItem value={product.productUnit2.unit_code}>
                                                            {product.productUnit2.unit_name}
                                                        </MenuItem>
                                                    )}
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    onClick={() => toggleSelectProduct(product)}
                                                    color="error"
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Modified Order Summary - Hide prices */}
                    <Box sx={{
                        bgcolor: '#EAB86C',
                        borderRadius: '10px',
                        p: 2,
                        mt: 2,
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
                    </Box>

                    {/* Save Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSave}
                        disabled={!lastRefNo || products.length === 0}
                        sx={{
                            mt: 2,
                            bgcolor: '#754C27',
                            color: '#FFFFFF',
                            height: '48px',
                            '&:hover': {
                                bgcolor: '#5c3c1f',
                            }
                        }}
                    >
                        Save
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}