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
    Pagination
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
import { kitchenAll } from '../../../../api/kitchenApi';
import { addKt_grf, Kt_grfrefno } from '../../../../api/kitchen/kt_grfApi';
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


export default function CreateKitchenRequisition({ onBack }) {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('');
    const [kitchens, setKitchens] = useState([]);
    const [saveKitchen, setSaveKitchen] = useState('');
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
    const [temperatures, setTemperatures] = useState({});
    const [imageErrors, setImageErrors] = useState({});

    // Pagination state
    const [page, setPage] = useState(1);
    const [productsPerPage] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [paginatedProducts, setPaginatedProducts] = useState([]);

    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson || "{}");

    useEffect(() => {
        // Fetch kitchens
        dispatch(kitchenAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((res) => {
                setKitchens(res.data);
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
            product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
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

    const handleGetLastRefNo = async (selectedDate, selectedKitchen) => {
        try {
            if (!selectedKitchen) {
                setLastRefNo('');
                return;
            }

            const res = await dispatch(Kt_grfrefno({
                kitchen_code: selectedKitchen,
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

    // Update kitchen selection handler
    const handleKitchenChange = (event) => {
        const newKitchenCode = event.target.value;
        setSaveKitchen(newKitchenCode);
        if (newKitchenCode) {  // Only call if we have a kitchen code
            handleGetLastRefNo(startDate, newKitchenCode);
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
            const { [product.product_code]: ______, ...newTemperatures } = temperatures;

            setQuantities(newQuantities);
            setUnits(newUnits);
            setUnitPrices(newPrices);
            setTotals(newTotals);
            setExpiryDates(newExpiryDates);
            setTemperatures(newTemperatures);

            setTotal(Object.values(newTotals).reduce((sum, curr) => sum + curr, 0));

        } else {
            setSelectedProducts(prev => [...prev, product.product_code]);
            setProducts(prev => [...prev, product]);

            // Initialize associated state
            setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
            setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1.unit_code }));
            setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price }));
            setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
            setTemperatures(prev => ({ ...prev, [product.product_code]: "38" }));

            // Calculate initial total
            const initialTotal = product.bulk_unit_price * 1;
            setTotals(prev => ({ ...prev, [product.product_code]: initialTotal }));
            setTotal(prev => prev + initialTotal);
        }
    };

    const handleQuantityChange = (productCode, delta) => {
        const currentQty = quantities[productCode] || 0;
        const newQty = Math.max(1, currentQty + delta);

        setQuantities(prev => ({ ...prev, [productCode]: newQty }));

        // Update total
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

        // Update total
        const qty = quantities[productCode];
        const newTotal = qty * newPrice;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(Object.values({ ...totals, [productCode]: newTotal }).reduce((a, b) => a + b, 0));
    };

    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
    };

    const handleTemperatureChange = (productCode, value) => {
        setTemperatures(prev => ({ ...prev, [productCode]: value }));
    };

    const handleSave = async () => {
        if (!saveKitchen || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a kitchen and at least one product.',
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
                kitchen_code: saveKitchen,
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
                texpire_date: format(expiryDates[product.product_code], 'yyyyMMdd'),
                temperature1: temperatures[product.product_code] || ""
            }));

            const orderData = {
                headerData,
                productArrayData,
                footerData: {
                    total: total.toString()
                }
            };

            await dispatch(addKt_grf(orderData)).unwrap();

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

    const resetForm = () => {
        setProducts([]);
        setSelectedProducts([]);
        setQuantities({});
        setUnits({});
        setUnitPrices({});
        setTotals({});
        setTotal(0);
        setSaveKitchen('');
        setSearchTerm('');
        setExpiryDates({});
        setTemperatures({});
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <Box sx={{ padding: "10px", paddingBottom: "300px", fontFamily: "Arial, sans-serif" }}>
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
                                {renderProductImage(product, 'small')}
                                <CardContent>
                                    <Typography variant="body1" fontWeight={500} noWrap>
                                        {product.product_name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        {product.product_code}
                                    </Typography>
                                    {/* Price removed from product card */}
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
                            onChange={handlePageChange}
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
                        value={lastRefNo || "Please select kitchen first"}
                        disabled
                        size="small"
                        sx={{
                            mt: '8px',
                            width: '95%',
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                // Show red text when no kitchen is selected
                                '& .Mui-disabled': {
                                    WebkitTextFillColor: !lastRefNo ? '#d32f2f' : 'rgba(0, 0, 0, 0.38)',
                                }
                            },
                        }}
                    />

                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
                        Kitchen
                    </Typography>
                    <Select
                        value={saveKitchen}
                        onChange={handleKitchenChange}
                        displayEmpty
                        size="small"
                        sx={{
                            mt: '8px',
                            width: '95%',
                            borderRadius: '10px',
                        }}
                    >
                        <MenuItem value=""><em>Select Kitchen</em></MenuItem>
                        {kitchens.map((kitchen) => (
                            <MenuItem key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                                {kitchen.kitchen_name}
                            </MenuItem>
                        ))}
                    </Select>

                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
                        Date
                    </Typography>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => {
                            setStartDate(date);
                            handleGetLastRefNo(date, saveKitchen);
                        }}
                        dateFormat="MM/dd/yyyy"
                        customInput={<CustomInput />}
                    />

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
                                    <TableCell>Image</TableCell>
                                    <TableCell>Product Code</TableCell>
                                    <TableCell>Product Name</TableCell>
                                    <TableCell>Expiry Date</TableCell>
                                    <TableCell>Temperature</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Unit</TableCell>
                                    {/* Unit Price column removed */}
                                    {/* Total column removed */}
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.map((product, index) => (
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
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={temperatures[product.product_code] || "38"}
                                                onChange={(e) => handleTemperatureChange(product.product_code, e.target.value)}
                                                placeholder="Temperature"
                                                sx={{ width: '80px' }}
                                                inputProps={{ min: 0, step: "1" }}
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
                                                <MenuItem value={product.productUnit1.unit_code}>
                                                    {product.productUnit1.unit_name}
                                                </MenuItem>
                                                <MenuItem value={product.productUnit2.unit_code}>
                                                    {product.productUnit2.unit_name}
                                                </MenuItem>
                                            </Select>
                                        </TableCell>
                                        {/* Unit price cell removed */}
                                        {/* Total cell removed */}
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

                    {/* Order Summary - Modified to hide prices */}
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
                        {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Typography variant="h5">Ready to Process</Typography>
                            <Typography variant="h5">{products.length > 0 ? '✓' : '✗'}</Typography>
                        </Box> */}
                    </Box>

                    {/* Save Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSave}
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