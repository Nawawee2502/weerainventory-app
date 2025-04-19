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
    CircularProgress,
    Autocomplete,
    Paper,
    Grid
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
import { addBr_rfw, Br_rfwrefno, Br_rfwUsedRefnos } from '../../../../api/restaurant/br_rfwApi';
import { Wh_dpbdtAlljoindt } from '../../../../api/warehouse/wh_dpbdtApi';
import { Wh_dpbByRefno, wh_dpbAlljoindt } from '../../../../api/warehouse/wh_dpbApi';
import Swal from 'sweetalert2';
import { format, parse } from 'date-fns';
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

export default function CreateGoodsReceiptWarehouse({ onBack }) {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('Please select dispatch to branch');
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
    const [temperatures, setTemperatures] = useState({});
    const [imageErrors, setImageErrors] = useState({});
    const [taxStatus, setTaxStatus] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // For dispatch selection
    const [dispatchRefnos, setDispatchRefnos] = useState([]);
    const [selectedDispatchRefno, setSelectedDispatchRefno] = useState('');
    const [dispatchData, setDispatchData] = useState(null);
    const [loadingDispatch, setLoadingDispatch] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const [productsPerPage] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [paginatedProducts, setPaginatedProducts] = useState([]);

    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson || "{}");

    useEffect(() => {
        const currentDate = new Date();

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

    const fetchAvailableDispatches = async (branchCode = saveBranch) => {
        if (!branchCode) {
            setDispatchRefnos([]);
            return;
        }

        try {
            setIsLoading(true);

            // Get all used reference numbers first
            const usedRefnosResponse = await dispatch(Br_rfwUsedRefnos()).unwrap();
            const usedRefnos = usedRefnosResponse.result ? usedRefnosResponse.data : [];

            // Get dispatches from the last 30 days
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);

            const rdate1 = format(thirtyDaysAgo, 'yyyyMMdd');
            const rdate2 = format(today, 'yyyyMMdd');

            // Get all dispatches to selected branch
            const response = await dispatch(wh_dpbAlljoindt({
                rdate1,
                rdate2,
                branch_code: branchCode,
                offset: 0,
                limit: 100
            })).unwrap();

            if (response.result && response.data) {
                // Filter out already used reference numbers
                const filteredDispatches = response.data.filter(item =>
                    !usedRefnos.includes(item.refno)
                );

                // Transform data for Autocomplete
                const dispatchOptions = filteredDispatches.map(item => ({
                    refno: item.refno,
                    branch: item.tbl_branch?.branch_name || 'Unknown',
                    date: item.rdate || 'Unknown Date',
                    formattedDate: item.rdate ?
                        format(parse(item.rdate, 'MM/dd/yyyy', new Date()), 'MM/dd/yyyy') :
                        'Unknown'
                }));

                setDispatchRefnos(dispatchOptions);

                // Only show the "no dispatches" alert if there are actually no unused dispatches
                if (dispatchOptions.length === 0) {
                    Swal.fire({
                        icon: 'info',
                        title: 'No Available Dispatches',
                        text: 'There are no available dispatches to this restaurant.',
                        confirmButtonColor: '#754C27'
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching available dispatches:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch available dispatches: ' + (error.message || 'Unknown error')
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDispatchSelection = async (refno) => {
        if (!refno) {
            resetForm();
            return;
        }

        try {
            setLoadingDispatch(true);
            setSelectedDispatchRefno(refno);

            // Check if this dispatch is already used in br_rfw
            const usedRefnosResponse = await dispatch(Br_rfwUsedRefnos()).unwrap();
            const usedRefnos = usedRefnosResponse.result ? usedRefnosResponse.data : [];

            if (usedRefnos.includes(refno)) {
                // If refno is already used, silently return without showing alert
                setLoadingDispatch(false);
                return;
            }

            // Fetch header data
            const headerResponse = await dispatch(Wh_dpbByRefno({ refno })).unwrap();

            if (headerResponse.result && headerResponse.data) {
                const dispatchHeader = headerResponse.data;
                setDispatchData(dispatchHeader);

                // Set the lastRefNo to be the same as the dispatch refno
                setLastRefNo(refno);

                // Set branch from dispatch
                setSaveBranch(dispatchHeader.branch_code || '');

                // Fetch detail data
                const detailResponse = await dispatch(Wh_dpbdtAlljoindt({ refno })).unwrap();

                if (detailResponse.result && detailResponse.data && detailResponse.data.length > 0) {
                    await processDispatchDetailData(detailResponse.data);
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'No Items',
                        text: 'This dispatch has no items.'
                    });
                }
            }
        } catch (error) {
            console.error("Error loading dispatch data:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load dispatch data: ' + error.message
            });
        } finally {
            setLoadingDispatch(false);
        }
    };

    // Handle branch selection
    const handleBranchChange = (branchCode) => {
        setSaveBranch(branchCode);

        // Clear selected dispatch when branch changes
        setSelectedDispatchRefno('');
        setDispatchData(null);

        // Only fetch dispatches if a branch is selected
        if (branchCode) {
            fetchAvailableDispatches(branchCode);
        } else {
            // Clear dispatch options if no branch is selected
            setDispatchRefnos([]);
        }
    };

    // Process dispatch detail data
    const processDispatchDetailData = async (detailData) => {
        try {
            console.log('Processing dispatch detail data:', detailData);

            // Extract product codes to mark as selected
            const productCodes = detailData.map(item => item.product_code);
            setSelectedProducts(productCodes);

            // Set products array from detail data
            const productsData = detailData.map(item => ({
                ...item.tbl_product,
                product_code: item.product_code,
                product_name: item.tbl_product?.product_name || '',
                tax1: item.tax1 || 'N'
            }));

            setProducts(productsData);

            // Prepare state objects
            const newQuantities = {};
            const newUnits = {};
            const newUnitPrices = {};
            const newTotals = {};
            const newExpiryDates = {};
            const newTemperatures = {};
            const newTaxStatus = {};

            detailData.forEach((item) => {
                const productCode = item.product_code;
                if (!productCode) return;

                newQuantities[productCode] = parseFloat(item.qty) || 1;
                newUnits[productCode] = item.unit_code || '';
                newUnitPrices[productCode] = parseFloat(item.uprice) || 0;
                newTotals[productCode] = parseFloat(item.amt) || 0;
                newTemperatures[productCode] = item.temperature1 || '38';
                newTaxStatus[productCode] = item.tax1 || 'N';

                // Parse expiry date or use current date + 30 days
                if (item.expire_date) {
                    try {
                        newExpiryDates[productCode] = parse(item.expire_date, 'MM/dd/yyyy', new Date());
                    } catch (e) {
                        console.error("Expiry date parsing error:", e);
                        const futureDate = new Date();
                        futureDate.setDate(futureDate.getDate() + 30);
                        newExpiryDates[productCode] = futureDate;
                    }
                } else {
                    const futureDate = new Date();
                    futureDate.setDate(futureDate.getDate() + 30);
                    newExpiryDates[productCode] = futureDate;
                }
            });

            // Update all states
            setQuantities(newQuantities);
            setUnits(newUnits);
            setUnitPrices(newUnitPrices);
            setTotals(newTotals);
            setExpiryDates(newExpiryDates);
            setTemperatures(newTemperatures);
            setTaxStatus(newTaxStatus);

            // Calculate and set total
            const totalSum = Object.values(newTotals).reduce((sum, value) => sum + value, 0);
            setTotal(totalSum);

            console.log('Detail processing complete', {
                products: productsData,
                quantities: newQuantities,
                units: newUnits,
                prices: newUnitPrices,
                totals: newTotals
            });

        } catch (error) {
            console.error('Error processing detail data:', error);
            throw error;
        }
    };

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
            const { [product.product_code]: _______, ...newTaxStatus } = taxStatus;

            setQuantities(newQuantities);
            setUnits(newUnits);
            setUnitPrices(newPrices);
            setTotals(newTotals);
            setExpiryDates(newExpiryDates);
            setTemperatures(newTemperatures);
            setTaxStatus(newTaxStatus);

            setTotal(Object.values(newTotals).reduce((sum, curr) => sum + curr, 0));

        } else {
            setSelectedProducts(prev => [...prev, product.product_code]);
            setProducts(prev => [...prev, product]);

            // Initialize associated state
            setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
            setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1?.unit_code || '' }));
            setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price || 0 }));
            setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
            setTemperatures(prev => ({ ...prev, [product.product_code]: '38' }));
            setTaxStatus(prev => ({ ...prev, [product.product_code]: product.tax1 || 'N' }));

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
        const price = unitPrices[productCode];
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

        // Update total
        const qty = quantities[productCode] || 0;
        const newTotal = qty * newPrice;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(Object.values({ ...totals, [productCode]: newTotal }).reduce((a, b) => a + b, 0));
    };

    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
    };

    const handleTemperatureChange = (productCode, temp) => {
        setTemperatures(prev => ({ ...prev, [productCode]: temp }));
    };

    const handleTaxStatusChange = (productCode, value) => {
        setTaxStatus(prev => ({ ...prev, [productCode]: value }));
    };

    // Calculate tax based on products with tax1='Y'
    const calculateTax = () => {
        let taxableAmount = 0;
        products.forEach(product => {
            const productCode = product.product_code;
            if (taxStatus[productCode] === 'Y') {
                const quantity = quantities[productCode] || 0;
                const unitPrice = unitPrices[productCode] || 0;
                taxableAmount += quantity * unitPrice;
            }
        });
        return taxableAmount * 0.07;
    };

    // Calculate taxable and non-taxable amounts
    const calculateTaxableAndNonTaxable = () => {
        let taxable = 0;
        let nonTaxable = 0;

        products.forEach(product => {
            const productCode = product.product_code;
            const quantity = quantities[productCode] || 0;
            const unitPrice = unitPrices[productCode] || 0;
            const lineTotal = quantity * unitPrice;

            if (taxStatus[productCode] === 'Y') {
                taxable += lineTotal;
            } else {
                nonTaxable += lineTotal;
            }
        });

        return { taxable, nonTaxable };
    };

    const handleSave = async () => {
        if (!saveBranch || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a restaurant and at least one product.',
                timer: 1500
            });
            return;
        }

        // First check if the current refno already exists in br_rfw
        try {
            const usedRefnosResponse = await dispatch(Br_rfwUsedRefnos()).unwrap();
            const usedRefnos = usedRefnosResponse.result ? usedRefnosResponse.data : [];

            if (usedRefnos.includes(lastRefNo)) {
                // If refno is already used, silently return without showing alert
                console.log(`Refno ${lastRefNo} is already used. Skipping save operation.`);
                return;
            }
        } catch (error) {
            console.error("Error checking used refnos:", error);
            // Continue anyway, the server will catch duplicates
        }

        try {
            Swal.fire({
                title: 'Saving receipt...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const { taxable, nonTaxable } = calculateTaxableAndNonTaxable();
            const totalWithTax = total + calculateTax();

            const headerData = {
                refno: lastRefNo,
                rdate: format(startDate, 'MM/dd/yyyy'),
                supplier_code: "-", // Set supplier_code to "-" as default
                branch_code: saveBranch,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2?.user_code || '',
                taxable: taxable,
                nontaxable: nonTaxable,
                total: total
            };

            const productArrayData = products.map(product => {
                const productCode = product.product_code;
                return {
                    refno: headerData.refno,
                    product_code: productCode,
                    qty: quantities[productCode]?.toString() || "1",
                    unit_code: units[productCode] || product.productUnit1?.unit_code || '',
                    uprice: unitPrices[productCode]?.toString() || "0",
                    tax1: taxStatus[productCode] || 'N',
                    amt: totals[productCode]?.toString() || "0",
                    expire_date: format(expiryDates[productCode] || new Date(), 'MM/dd/yyyy'),
                    texpire_date: format(expiryDates[productCode] || new Date(), 'yyyyMMdd'),
                    temperature1: temperatures[productCode] || '38'
                };
            });

            const footerData = {
                taxable: taxable,
                nontaxable: nonTaxable,
                total: totalWithTax
            };

            await dispatch(addBr_rfw({
                headerData,
                productArrayData,
                footerData
            })).unwrap();

            await Swal.fire({
                icon: 'success',
                title: 'Created receipt successfully',
                text: `Reference No: ${lastRefNo}`,
                showConfirmButton: false,
                timer: 1500
            });

            resetForm();
            onBack();

        } catch (error) {
            console.error('Error saving receipt:', error);

            // Check for specific error patterns related to duplicate entries
            const errorString = JSON.stringify(error);

            if (
                errorString.includes('ER_DUP_ENTRY') ||
                errorString.includes('Duplicate entry') ||
                errorString.includes('must be unique') ||
                errorString.includes('PRIMARY')
            ) {
                // Silently handle duplicate entry errors - just log to console without showing an alert
                console.log(`Duplicate reference number "${lastRefNo}" detected during save.`);
            } else {
                // Handle other errors with alert
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Error saving receipt',
                    confirmButtonText: 'OK'
                });
            }
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
        setSaveBranch('');
        setSearchTerm('');
        setExpiryDates({});
        setTemperatures({});
        setTaxStatus({});
        setImageErrors({});
        setSelectedDispatchRefno('');
        setDispatchData(null);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: '#754C27' }} />
                <Typography sx={{ ml: 2 }}>Loading data...</Typography>
            </Box>
        );
    }

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
                Back to Goods Receipt Warehouse
            </Button>

            {/* Status Information */}
            <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                    <strong>Status:</strong> Creating new receipt |
                    Products selected: {selectedProducts.length} |
                    {selectedDispatchRefno && (
                        <span> Based on dispatch: {selectedDispatchRefno} |</span>
                    )}
                    Restaurant: {saveBranch || 'None'}
                </Typography>
            </Box>

            {/* Main content */}
            <Box display="flex" p={2} bgcolor="#F9F9F9" borderRadius="12px" boxShadow={1}>

                {/* Right Panel - Order Details */}
                <Box flex={2} pl={2} bgcolor="#FFF" p={3} borderRadius="12px" boxShadow={3}>
                    <Grid container spacing={3}>
                        {/* Restaurant Selection - This must be first */}
                        <Grid item xs={12}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                                Restaurant (Select First)
                            </Typography>
                            <Select
                                value={saveBranch}
                                onChange={(e) => handleBranchChange(e.target.value)}
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

                        {/* Dispatch Selection - Only enabled if branch is selected */}
                        <Grid item xs={12}>
                            <Box sx={{ opacity: saveBranch ? 1 : 0.5 }}>
                                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                                    Select from Available Dispatches
                                </Typography>
                                <Autocomplete
                                    options={dispatchRefnos}
                                    getOptionLabel={(option) =>
                                        typeof option === 'string'
                                            ? option
                                            : `${option.refno} - To: ${option.branch} (${option.formattedDate})`
                                    }
                                    onChange={(_, newValue) => handleDispatchSelection(newValue?.refno || '')}
                                    disabled={!saveBranch}
                                    noOptionsText={saveBranch ? "No available dispatches found" : "Select a restaurant first"}
                                    isOptionEqualToValue={(option, value) =>
                                        option.refno === (typeof value === 'string' ? value : value?.refno)
                                    }
                                    renderOption={(props, option) => (
                                        <Box component="li" {...props}>
                                            <Box>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {option.refno}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    To: {option.branch}
                                                </Typography>
                                                <Typography variant="caption" color="primary">
                                                    Date: {option.formattedDate}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Search dispatch reference"
                                            placeholder={saveBranch ? "Select dispatch to create receipt from" : "Select a restaurant first"}
                                            variant="outlined"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {loadingDispatch ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                                Ref.no
                            </Typography>
                            <TextField
                                value={lastRefNo}
                                disabled={true}
                                size="small"
                                fullWidth
                                sx={{
                                    mt: '8px',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                    '& .Mui-disabled': {
                                        WebkitTextFillColor: !lastRefNo || lastRefNo === 'Please select dispatch to branch'
                                            ? '#d32f2f'
                                            : 'rgba(0, 0, 0, 0.38)',
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                                Date
                            </Typography>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => {
                                    setStartDate(date);
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
                                    <TableCell>Tax</TableCell>
                                    <TableCell>Expiry Date</TableCell>
                                    <TableCell>Temperature</TableCell>
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
                                        <TableCell colSpan={9} align="center">
                                            <Typography color="text.secondary">
                                                No products selected. Select a dispatch from the dropdown or add products from the grid.
                                            </Typography>
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
                                                <Typography variant="body2" fontWeight="bold" noWrap sx={{ maxWidth: 150 }}>
                                                    {product.product_name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {product.product_code}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={taxStatus[product.product_code] || 'N'}
                                                    onChange={(e) => handleTaxStatusChange(product.product_code, e.target.value)}
                                                    size="small"
                                                    sx={{ minWidth: 60 }}
                                                >
                                                    <MenuItem value="Y">Yes</MenuItem>
                                                    <MenuItem value="N">No</MenuItem>
                                                </Select>
                                            </TableCell>
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

                    {/* Order Summary - Modified to hide price information */}
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
                        disabled={!lastRefNo || lastRefNo === 'Please select dispatch to branch' || products.length === 0}
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