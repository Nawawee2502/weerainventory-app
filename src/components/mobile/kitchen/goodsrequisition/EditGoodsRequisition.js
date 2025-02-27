import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    Grid2,
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
    CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../../api/productrecordApi';
import { kitchenAll } from '../../../../api/kitchenApi';
import { Kt_grfAlljoindt, updateKt_grf } from '../../../../api/kitchen/kt_grfApi';
import { Kt_grfdtAlljoindt } from '../../../../api/kitchen/kt_grfdtApi';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Custom Input component for DatePicker
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

export default function EditKitchenRequisition({ onBack, editRefno }) {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const [debugInfo, setDebugInfo] = useState({});
    const [startDate, setStartDate] = useState(new Date());
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

    // Pagination state
    const [page, setPage] = useState(1);
    const [productsPerPage] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [paginatedProducts, setPaginatedProducts] = useState([]);

    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson || "{}");

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                console.log('Fetching data for refno:', editRefno);

                // Load kitchens
                const kitchenResponse = await dispatch(kitchenAll({ offset: 0, limit: 100 })).unwrap();
                if (kitchenResponse && kitchenResponse.data) {
                    setKitchens(kitchenResponse.data);
                    console.log('Loaded kitchens:', kitchenResponse.data.length);
                }

                // Load all products for catalog
                const productsResponse = await dispatch(searchProductName({ product_name: '' })).unwrap();
                if (productsResponse && productsResponse.data) {
                    setAllProducts(productsResponse.data);
                    setFilteredProducts(productsResponse.data);
                    console.log('Loaded all products:', productsResponse.data.length);
                }

                // Load data using Kt_grfAlljoindt (Main API)
                if (editRefno) {
                    console.log('Looking up with Kt_grfAlljoindt for ref:', editRefno);
                    const allJoinResponse = await dispatch(Kt_grfAlljoindt({ refno: editRefno })).unwrap();
                    console.log('Response from Kt_grfAlljoindt:', allJoinResponse);

                    if (allJoinResponse && allJoinResponse.data && allJoinResponse.data.length > 0) {
                        // Set header info from first record
                        const headerData = allJoinResponse.data[0];
                        console.log('Header data found:', headerData);
                        setDebugInfo(prev => ({ ...prev, headerData }));

                        setSaveKitchen(headerData.kitchen_code || '');
                        setStartDate(headerData.rdate ? new Date(headerData.rdate) : new Date());
                        setTotal(parseFloat(headerData.total) || 0);

                        // Now get details from Kt_grfdtAlljoindt
                        const detailResponse = await dispatch(Kt_grfdtAlljoindt(editRefno)).unwrap();
                        console.log('Detail response from Kt_grfdtAlljoindt:', detailResponse);

                        if (detailResponse && detailResponse.data && detailResponse.data.length > 0) {
                            const detailData = detailResponse.data;
                            console.log('Detail data found:', detailData.length, 'items');
                            setDebugInfo(prev => ({ ...prev, detailData }));

                            // Process all products and related info
                            await processDetailData(detailData);
                        } else {
                            console.warn('No detail data found in Kt_grfdtAlljoindt');
                            setDebugInfo(prev => ({ ...prev, detailError: 'No detail data found in Kt_grfdtAlljoindt' }));
                        }
                    } else {
                        console.warn('No data found in Kt_grfAlljoindt');
                        setDebugInfo(prev => ({ ...prev, error: 'No data found in Kt_grfAlljoindt' }));
                    }
                } else {
                    console.warn('No editRefno provided');
                    setDebugInfo(prev => ({ ...prev, error: 'No editRefno provided' }));
                }
            } catch (error) {
                console.error('Error loading data:', error);
                setDebugInfo(prev => ({ ...prev, error: error.toString() }));
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load requisition data: ' + error.message
                });
            } finally {
                setIsLoading(false);
            }
        };

        // Helper function to process detail data
        const processDetailData = async (detailData) => {
            try {
                // Set selected product codes first
                const productCodes = detailData.map(item => item.product_code);
                setSelectedProducts(productCodes);

                // Transform products directly from detailData
                const products = detailData.map(item => ({
                    product_code: item.product_code,
                    product_name: item.tbl_product?.product_name,
                    productUnit1: item.tbl_product?.productUnit1,
                    productUnit2: item.tbl_product?.productUnit2,
                    bulk_unit_price: item.tbl_product?.bulk_unit_price,
                    retail_unit_price: item.tbl_product?.retail_unit_price,
                    product_img: item.tbl_product?.product_img
                }));

                // Set all states at once
                setProducts(products);

                // Prepare other state objects
                const newQuantities = {};
                const newUnits = {};
                const newUnitPrices = {};
                const newTotals = {};
                const newExpiryDates = {};
                const newTemperatures = {};

                detailData.forEach((item) => {
                    const productCode = item.product_code;
                    newQuantities[productCode] = parseFloat(item.qty) || 1;
                    newUnits[productCode] = item.unit_code || item.tbl_product?.productUnit1?.unit_code || '';
                    newUnitPrices[productCode] = parseFloat(item.uprice) || 0;
                    newTotals[productCode] = parseFloat(item.amt) || 0;
                    newTotals[productCode] = parseFloat(item.amt) || 0;
                    newTemperatures[productCode] = item.temperature1 || "";

                    if (item.texpire_date) {
                        const year = item.texpire_date.substring(0, 4);
                        const month = item.texpire_date.substring(4, 6);
                        const day = item.texpire_date.substring(6, 8);
                        newExpiryDates[productCode] = new Date(`${year}-${month}-${day}`);
                    } else if (item.expire_date) {
                        newExpiryDates[productCode] = new Date(item.expire_date);
                    } else {
                        newExpiryDates[productCode] = new Date();
                    }
                });

                // Update all states
                setQuantities(newQuantities);
                setUnits(newUnits);
                setUnitPrices(newUnitPrices);
                setTotals(newTotals);
                setExpiryDates(newExpiryDates);
                setTemperatures(newTemperatures);

                // Calculate and set total
                const totalSum = Object.values(newTotals).reduce((sum, value) => sum + value, 0);
                setTotal(totalSum);

                console.log('Processed Data:', {
                    products,
                    quantities: newQuantities,
                    units: newUnits,
                    unitPrices: newUnitPrices,
                    totals: newTotals,
                    temperatures: newTemperatures
                });

            } catch (error) {
                console.error('Error processing detail data:', error);
                setDebugInfo(prev => ({ ...prev, processError: error.toString() }));
            }
        };

        fetchData();
    }, [dispatch, editRefno]);

    // Handle filtering and pagination
    useEffect(() => {
        if (allProducts.length === 0) return;

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

    const updateTotals = (productCode, quantity, price) => {
        const newLineTotal = quantity * price;

        setTotals(prev => {
            const newTotals = { ...prev, [productCode]: newLineTotal };
            const newTotal = Object.values(newTotals).reduce((sum, curr) => sum + curr, 0);
            setTotal(newTotal);
            return newTotals;
        });
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
            setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1?.unit_code || '' }));
            setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price || 0 }));
            setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
            setTemperatures(prev => ({ ...prev, [product.product_code]: "" }));

            // Calculate initial total
            const initialTotal = (product.bulk_unit_price || 0) * 1;
            setTotals(prev => ({ ...prev, [product.product_code]: initialTotal }));
            setTotal(prev => prev + initialTotal);
        }
    };

    const handleQuantityChange = (productCode, delta) => {
        const currentQty = quantities[productCode] || 0;
        const newQty = Math.max(1, currentQty + delta);

        setQuantities(prev => ({ ...prev, [productCode]: newQty }));

        // Update total
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
            ? (product.bulk_unit_price || 0)
            : (product.retail_unit_price || 0);

        setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));

        // Update total
        const qty = quantities[productCode] || 0;
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

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleUpdate = async () => {
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
                title: 'Updating requisition...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const headerData = {
                refno: editRefno,
                rdate: format(startDate, 'MM/dd/yyyy'),
                kitchen_code: saveKitchen,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2.user_code || '',
            };

            const productArrayData = products.map(product => ({
                refno: headerData.refno,
                product_code: product.product_code,
                qty: (quantities[product.product_code] || 1).toString(),
                unit_code: units[product.product_code] || product.productUnit1?.unit_code || '',
                uprice: (unitPrices[product.product_code] || 0).toString(),
                amt: (totals[product.product_code] || 0).toString(),
                expire_date: format(expiryDates[product.product_code] || new Date(), 'MM/dd/yyyy'),
                texpire_date: format(expiryDates[product.product_code] || new Date(), 'yyyyMMdd'),
                temperature1: temperatures[product.product_code] || ""
            }));

            const orderData = {
                headerData,
                productArrayData,
                footerData: {
                    total: total.toString()
                }
            };

            await dispatch(updateKt_grf(orderData)).unwrap();

            await Swal.fire({
                icon: 'success',
                title: 'Updated requisition successfully',
                text: `Reference No: ${editRefno}`,
                showConfirmButton: false,
                timer: 1500
            });

            onBack();

        } catch (error) {
            console.error('Update error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error updating requisition',
                confirmButtonText: 'OK'
            });
        }
    };

    const resetForm = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will reset all your changes!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, reset it!'
        }).then((result) => {
            if (result.isConfirmed) {
                onBack();
            }
        });
    };

    // Debug button to show current state
    const showDebugInfo = () => {
        console.log('Debug Info:', {
            editRefno,
            headerInfo: debugInfo.headerData,
            detailInfo: debugInfo.detailData,
            products,
            selectedProducts,
            quantities,
            units,
            unitPrices,
            temperatures,
            error: debugInfo.error
        });

        Swal.fire({
            title: 'Debug Information',
            html: `
                <div style="text-align: left; max-height: 400px; overflow-y: auto;">
                    <p><strong>Edit RefNo:</strong> ${editRefno}</p>
                    <p><strong>Selected Products:</strong> ${selectedProducts.length}</p>
                    <p><strong>Products Array:</strong> ${products.length}</p>
                    <p><strong>Kitchen:</strong> ${saveKitchen}</p>
                    <p><strong>Total:</strong> ${total}</p>
                    <p><strong>Error:</strong> ${debugInfo.error || debugInfo.detailError || debugInfo.processError || 'None'}</p>
                    <hr/>
                    <p><strong>Header Data:</strong></p>
                    <pre style="font-size: 11px;">${JSON.stringify(debugInfo.headerData, null, 2)}</pre>
                    <hr/>
                    <p><strong>Detail Data (${debugInfo.detailData?.length || 0} items):</strong></p>
                    <pre style="font-size: 11px;">${JSON.stringify(debugInfo.detailData?.slice(0, 3), null, 2)}</pre>
                </div>
            `,
            width: 800,
        });
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
                <Typography variant="h6">Loading requisition data...</Typography>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: "10px", paddingBottom: "300px", fontFamily: "Arial, sans-serif" }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={onBack}
                >
                    Back to Kitchen Requisition
                </Button>
                <Button
                    variant="outlined"
                    color="warning"
                    onClick={showDebugInfo}
                    size="small"
                >
                    Debug Info
                </Button>
            </Box>

            {/* Status Information */}
            <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                    <strong>Status:</strong> Editing ref #{editRefno} |
                    Products selected: {selectedProducts.length} |
                    Products loaded: {products.length} |
                    Kitchen: {saveKitchen || 'None'} |
                    Total: ${total.toFixed(2)}
                </Typography>
            </Box>

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
                        {paginatedProducts.map((product) => {
                            if (!product || !product.product_code) return null;

                            return (
                                <Card
                                    key={product.product_code}
                                    sx={{
                                        width: 160,
                                        borderRadius: '16px',
                                        boxShadow: 3,
                                        position: 'relative',
                                        cursor: 'pointer',
                                        border: selectedProducts.includes(product.product_code) ? '2px solid #4caf50' : 'none',
                                        bgcolor: selectedProducts.includes(product.product_code) ? '#f0fff0' : 'white'
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
                                            ${(product.bulk_unit_price || 0).toFixed(2)}
                                        </Typography>
                                    </CardContent>
                                    {selectedProducts.includes(product.product_code) && (
                                        <CheckCircleIcon
                                            sx={{
                                                color: '#4caf50',
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                fontSize: 30
                                            }}
                                        />
                                    )}
                                </Card>
                            );
                        })}
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
                        value={editRefno}
                        disabled
                        size="small"
                        sx={{
                            mt: '8px',
                            width: '95%',
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                            },
                        }}
                    />

                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
                        Date
                    </Typography>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="MM/dd/yyyy"
                        customInput={<CustomInput />}
                    />

                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
                        Kitchen
                    </Typography>
                    <Select
                        value={saveKitchen}
                        onChange={(e) => setSaveKitchen(e.target.value)}
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

                    <Divider sx={{ my: 2 }} />

                    {/* Current Order Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" color="#754C27">Edit Order</Typography>
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
                                Reset
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
                                    <TableCell>Temperature</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Unit</TableCell>
                                    <TableCell>Unit Price</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">
                                            <Typography color="text.secondary">
                                                No products selected or failed to load product data
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.map((product, index) => {
                                        if (!product || !product.product_code) return null;

                                        return (
                                            <TableRow key={product.product_code}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{product.product_code}</TableCell>
                                                <TableCell>{product.product_name}</TableCell>
                                                <TableCell>
                                                    <DatePicker
                                                        selected={expiryDates[product.product_code] || new Date()}
                                                        onChange={(date) => handleExpiryDateChange(product.product_code, date)}
                                                        dateFormat="MM/dd/yyyy"
                                                        customInput={<CustomInput />}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        value={temperatures[product.product_code] || ""}
                                                        onChange={(e) => handleTemperatureChange(product.product_code, e.target.value)}
                                                        size="small"
                                                        placeholder="°C"
                                                        inputProps={{
                                                            inputMode: 'numeric',
                                                            pattern: '[0-9]*'
                                                        }}
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
                                                        <Typography sx={{ mx: 1 }}>{quantities[product.product_code] || 0}</Typography>
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
                                                        value={units[product.product_code] || ''}
                                                        onChange={(e) => handleUnitChange(product.product_code, e.target.value)}
                                                        size="small"
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
                                                <TableCell>${(unitPrices[product.product_code] || 0).toFixed(2)}</TableCell>
                                                <TableCell>${(totals[product.product_code] || 0).toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() => toggleSelectProduct(product)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
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
                            <Typography>${(total * 0.07).toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Typography variant="h5">Total</Typography>
                            <Typography variant="h5">${(total * 1.07).toFixed(2)}</Typography>
                        </Box>
                    </Box>

                    {/* Save Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleUpdate}
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
                        Update
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}