// CreatePurchaseOrderToWarehouse.jsx
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
    CardMedia,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Select,
    MenuItem,
    Pagination,
    CircularProgress,
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
import { supplierAll } from '../../../../api/supplierApi';
import { branchAll } from '../../../../api/branchApi';
import { addBr_pow, Br_powrefno } from '../../../../api/restaurant/br_powApi';
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

export default function CreatePurchaseOrderToWarehouse({ onBack }) {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const [saveSupplier, setSaveSupplier] = useState('');
    const [branches, setBranches] = useState([]);
    const [saveBranch, setSaveBranch] = useState('');
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [expiryDates, setExpiryDates] = useState({});
    const [page, setPage] = useState(1);
    const [productsPerPage] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [paginatedProducts, setPaginatedProducts] = useState([]);

    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                // Load suppliers
                const suppliersResponse = await dispatch(supplierAll({ offset: 0, limit: 100 })).unwrap();
                if (suppliersResponse?.data) {
                    setSuppliers(suppliersResponse.data);
                }

                // Load branches
                const branchesResponse = await dispatch(branchAll({ offset: 0, limit: 100 })).unwrap();
                if (branchesResponse?.data) {
                    setBranches(branchesResponse.data);
                }

                // Load products
                const productsResponse = await dispatch(searchProductName({ product_name: '' })).unwrap();
                if (productsResponse?.data) {
                    setAllProducts(productsResponse.data);
                    setFilteredProducts(productsResponse.data);
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

    useEffect(() => {
        const filtered = allProducts.filter(product =>
            product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.product_code?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const sortedProducts = [...filtered].sort((a, b) => {
            const aSelected = selectedProducts.includes(a.product_code);
            const bSelected = selectedProducts.includes(b.product_code);
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return 0;
        });

        setFilteredProducts(sortedProducts);
        setTotalPages(Math.ceil(sortedProducts.length / productsPerPage));
        setPage(1);
    }, [searchTerm, allProducts, selectedProducts, productsPerPage]);

    useEffect(() => {
        const startIndex = (page - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
    }, [filteredProducts, page, productsPerPage]);

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

            setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
            setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1?.unit_code }));
            setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price }));
            setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));

            const initialTotal = product.bulk_unit_price * 1;
            setTotals(prev => ({ ...prev, [product.product_code]: initialTotal }));
            setTotal(prev => prev + initialTotal);
        }
    };

    const handleQuantityChange = (productCode, delta) => {
        const currentQty = quantities[productCode] || 0;
        const newQty = Math.max(1, currentQty + delta);

        setQuantities(prev => ({ ...prev, [productCode]: newQty }));

        const price = unitPrices[productCode] || 0;
        const newTotal = newQty * price;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(Object.values({ ...totals, [productCode]: newTotal }).reduce((a, b) => a + b, 0));
    };

    const handleUnitChange = (productCode, newUnit) => {
        setUnits(prev => ({ ...prev, [productCode]: newUnit }));

        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        const newPrice = newUnit === product.productUnit1?.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));

        const qty = quantities[productCode] || 0;
        const newTotal = qty * newPrice;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(Object.values({ ...totals, [productCode]: newTotal }).reduce((a, b) => a + b, 0));
    };

    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
    };

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

    const handleSave = async () => {
        if (!saveSupplier || !saveBranch || products.length === 0 || !lastRefNo) {
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
            const tax = calculateTax();

            const headerData = {
                refno: lastRefNo,
                rdate: format(startDate, 'MM/dd/yyyy'),
                supplier_code: saveSupplier,
                branch_code: saveBranch,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2.user_code,
                taxable: tax.toString(),
                nontaxable: (total - tax).toString()
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

            await dispatch(addBr_pow(orderData)).unwrap();

            await Swal.fire({
                icon: 'success',
                title: 'Created purchase order successfully',
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
                text: error.message || 'Error saving purchase order',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setProducts([]);
        setSelectedProducts([]);
        setQuantities({});
        setUnits({});
        setUnitPrices({});
        setTotals({});
        setTotal(0);
        setSaveSupplier('');
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

    return (
        <Box sx={{ padding: "10px", paddingBottom: "300px", fontFamily: "Arial, sans-serif" }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                sx={{ marginBottom: "20px" }}
            >
                Back to Purchase Orders
            </Button>

            {/* Main content */}
            <Box display="flex" p={2} bgcolor="#F9F9F9">
                {/* Left Panel - Product Selection */}
                <Box flex={2} pr={2} display="flex" flexDirection="column">
                    {/* Search and Filter Section */}
                    <Box sx={{ marginBottom: "20px", paddingTop: '20px' }}>
                        <TextField
                            placeholder="Search products..."
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
                        {paginatedProducts.map((product) => (
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
                                    flexDirection: 'column'
                                }}
                                onClick={() => toggleSelectProduct(product)}
                            >
                                <CardMedia
                                    component="img"
                                    height="100"
                                    image="/api/placeholder/160/100"
                                    alt={product.product_name}
                                />
                                <CardContent>
                                    <Typography variant="body1" fontWeight={500} noWrap>
                                        {product.product_name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        {product.product_code}
                                    </Typography>
                                    <Typography variant="h6" color="#D9A05B" mt={1}>
                                        ${product.bulk_unit_price?.toFixed(2) || "0.00"}
                                    </Typography>
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
                        ))}
                    </Box>

                    {/* Pagination */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(event, value) => setPage(value)}
                            color="primary"
                            showFirstButton
                            showLastButton
                            size="large"
                        />
                    </Box>
                </Box>

                {/* Right Panel - Order Details */}
                <Box flex={2} pl={2} bgcolor="#FFF" p={1} borderRadius="12px" boxShadow={3}>
                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
                        Ref.no
                    </Typography>
                    <TextField
                        value={lastRefNo || "Please select supplier and restaurant first"}
                        disabled
                        size="small"
                        sx={{
                            mt: '8px',
                            width: '95%',
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                // Show red text when no refno is available
                                '& .Mui-disabled': {
                                    WebkitTextFillColor: !lastRefNo ? '#d32f2f' : 'rgba(0, 0, 0, 0.38)',
                                }
                            },
                        }}
                    />

                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
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

                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
                        Restaurant
                    </Typography>
                    <Select
                        value={saveBranch}
                        onChange={handleBranchChange}
                        displayEmpty
                        size="small"
                        sx={{
                            mt: '8px',
                            width: '95%',
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

                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
                        Supplier
                    </Typography>
                    <Select
                        value={saveSupplier}
                        onChange={handleSupplierChange}
                        displayEmpty
                        size="small"
                        sx={{
                            mt: '8px',
                            width: '95%',
                            borderRadius: '10px',
                        }}
                    >
                        <MenuItem value=""><em>Select Supplier</em></MenuItem>
                        {suppliers.map((supplier) => (
                            <MenuItem key={supplier.supplier_code} value={supplier.supplier_code}>
                                {supplier.supplier_name}
                            </MenuItem>
                        ))}
                    </Select>



                    <Divider sx={{ my: 2 }} />

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
                            >
                                Clear All
                            </Button>
                        </Box>
                    </Box>

                    {/* Order Table */}
                    <TableContainer sx={{ mt: 2, maxHeight: '400px', overflow: 'auto' }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>No.</TableCell>
                                    <TableCell>Product Code</TableCell>
                                    <TableCell>Product Name</TableCell>
                                    <TableCell>Expiry Date</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Unit</TableCell>
                                    <TableCell>Unit Price</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.map((product, index) => (
                                    <TableRow key={product.product_code}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{product.product_code}</TableCell>
                                        <TableCell>{product.product_name}</TableCell>
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
                                            >
                                                <MenuItem value={product.productUnit1?.unit_code}>
                                                    {product.productUnit1?.unit_name}
                                                </MenuItem>
                                                <MenuItem value={product.productUnit2?.unit_code}>
                                                    {product.productUnit2?.unit_name}
                                                </MenuItem>
                                            </Select>
                                        </TableCell>
                                        <TableCell>${unitPrices[product.product_code]?.toFixed(2) || "0.00"}</TableCell>
                                        <TableCell>${totals[product.product_code]?.toFixed(2) || "0.00"}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => toggleSelectProduct(product)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Order Summary */}
                    <Box sx={{
                        bgcolor: '#EAB86C',
                        borderRadius: '10px',
                        p: 2,
                        mt: 2,
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

                    {/* Save Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSave}
                        disabled={isLoading || !lastRefNo}
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
                        {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}