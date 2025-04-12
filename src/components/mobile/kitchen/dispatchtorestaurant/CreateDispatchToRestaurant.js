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
    CircularProgress,
    Autocomplete
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
import { branchAll } from '../../../../api/branchApi';
import { addKt_dpb, kt_dpbrefno } from '../../../../api/kitchen/kt_dpbApi';
import { Br_rtkAlljoindt, Br_rtkByRefno, updateBr_rtk } from '../../../../api/restaurant/br_rtkApi';
import { Br_rtkdtAlljoindt, updateBr_rtkdt } from '../../../../api/restaurant/br_rtkdtApi';
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

export default function CreateDispatchToRestaurant({ onBack }) {
    const dispatch = useDispatch();

    // Loading state
    const [isLoadingRefNo, setIsLoadingRefNo] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingRTK, setLoadingRTK] = useState(false);

    // Form state
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('');
    const [saveKitchen, setSaveKitchen] = useState('');
    const [saveBranch, setSaveBranch] = useState('');
    const [refNo, setRefNo] = useState('Please select return request first');
    const [rtkRefno, setRtkRefno] = useState('');

    // Data sources
    const [kitchens, setKitchens] = useState([]);
    const [branches, setBranches] = useState([]);
    const [allProducts, setAllProducts] = useState([]);

    // Product selection state
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Product details state
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [expiryDates, setExpiryDates] = useState({});
    const [temperatures, setTemperatures] = useState({});
    const [taxStatus, setTaxStatus] = useState({});
    const [imageErrors, setImageErrors] = useState({});
    const [total, setTotal] = useState(0);
    const [taxableAmount, setTaxableAmount] = useState(0);
    const [nonTaxableAmount, setNonTaxableAmount] = useState(0);

    // RTK state
    const [originalQty, setOriginalQty] = useState({});
    const [remainingQty, setRemainingQty] = useState({});
    const [rtkRefnos, setRtkRefnos] = useState([]);
    const [selectedRtkRefno, setSelectedRtkRefno] = useState('');
    const [rtkData, setRtkData] = useState(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [productsPerPage] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [paginatedProducts, setPaginatedProducts] = useState([]);

    // Get user data
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = userDataJson ? JSON.parse(userDataJson) : null;

    // Load initial data
    useEffect(() => {
        // Fetch kitchens for reference
        dispatch(kitchenAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((res) => {
                setKitchens(res.data || []);
            })
            .catch((err) => console.log(err.message));

        // Fetch branches for reference
        dispatch(branchAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((res) => {
                setBranches(res.data || []);
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

        // Fetch all available return requests on initial load
        fetchAvailableReturnRequests('');
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

    // Generate reference number based on kitchen and date
    const handleGetLastRefNo = async (selectedKitchen, selectedDate) => {
        if (!selectedKitchen) {
            setLastRefNo('');
            return;
        }

        try {
            setIsLoadingRefNo(true);

            // Call the API with kitchen_code and date
            const res = await dispatch(kt_dpbrefno({
                kitchen_code: selectedKitchen,
                date: format(selectedDate, 'yyyy-MM-dd')
            })).unwrap();

            if (res?.result && res?.data?.refno) {
                setLastRefNo(res.data.refno);
            } else {
                // If API doesn't return refno, create default
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const year = selectedDate.getFullYear().toString().slice(-2);
                setLastRefNo(`KTDPB${selectedKitchen}${year}${month}001`);
            }
        } catch (err) {
            console.error("Error generating refno:", err);
            // Fallback pattern if API call fails
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);
            setLastRefNo(`KTDPB${selectedKitchen}${year}${month}001`);
        } finally {
            setIsLoadingRefNo(false);
        }
    };

    // Fetch available RTK (Return to Kitchen) records
    const fetchAvailableReturnRequests = async (branchCode = '') => {
        try {
            setIsLoading(true);

            // Get all return requests from the last 30 days
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);

            const rdate1 = format(thirtyDaysAgo, 'yyyyMMdd');
            const rdate2 = format(today, 'yyyyMMdd');

            // API parameters
            const apiParams = {
                rdate1,
                rdate2,
                offset: 0,
                limit: 100
            };

            // Add branch filter only if specified
            if (branchCode) {
                apiParams.branch_code = branchCode;
            }

            // Get all return requests or filtered by branch if specified
            const response = await dispatch(Br_rtkAlljoindt(apiParams)).unwrap();

            if (response.result && response.data) {
                // Filter out RTKs with status 'end' if it exists
                const filteredRTKs = response.data.filter(item => item.status !== 'end');

                // Transform data for Autocomplete
                const rtkOptions = filteredRTKs.map(item => ({
                    refno: item.refno,
                    branch: item.tbl_branch?.branch_name || 'Unknown',
                    branch_code: item.branch_code || '',
                    kitchen: item.tbl_kitchen?.kitchen_name || 'Unknown',
                    kitchen_code: item.kitchen_code || '',
                    date: item.rdate || 'Unknown Date',
                    formattedDate: item.rdate ?
                        format(parse(item.rdate, 'MM/dd/yyyy', new Date()), 'MM/dd/yyyy') :
                        'Unknown'
                }));

                setRtkRefnos(rtkOptions);

                // Show alert if no RTKs found after explicit branch selection
                if (rtkOptions.length === 0 && branchCode) {
                    Swal.fire({
                        icon: 'info',
                        title: 'No Available Return Requests',
                        text: 'There are no available return requests from this branch.',
                        confirmButtonColor: '#754C27'
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching available return requests:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch available return requests: ' + (error.message || 'Unknown error')
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRTKSelection = async (refno, option) => {
        if (!refno) {
            resetForm();
            return;
        }

        try {
            console.log('Starting RTK selection for refno:', refno);
            setLoadingRTK(true);
            setSelectedRtkRefno(refno);
            setRtkRefno(refno);

            // If we have the option data (from Autocomplete), use it directly
            if (option) {
                // Set kitchen and branch from the selected option
                setSaveKitchen(option.kitchen_code || '');
                setSaveBranch(option.branch_code || '');

                // Generate reference number now that we have the kitchen code
                if (option.kitchen_code) {
                    await handleGetLastRefNo(option.kitchen_code, startDate);
                }
            }

            // Fetch header data
            console.log('Fetching header data for refno:', refno);
            const headerResponse = await dispatch(Br_rtkByRefno({ refno })).unwrap();
            console.log('Header data response:', headerResponse);

            if (headerResponse.result && headerResponse.data) {
                const rtkHeader = headerResponse.data;

                // Check if RTK is already completed (status = 'end')
                if (rtkHeader.status === 'end') {
                    Swal.fire({
                        icon: 'info',
                        title: 'Return Request Already Completed',
                        text: 'This return request has already been fully processed.',
                        confirmButtonColor: '#754C27'
                    });
                    setLoadingRTK(false);
                    return;
                }

                setRtkData(rtkHeader);

                // Display RTK refno for reference
                setRefNo(refno);

                // If we didn't get the kitchen/branch from the option, set them from header data
                if (!option || !option.kitchen_code) {
                    setSaveKitchen(rtkHeader.kitchen_code || '');
                    console.log('Set kitchen_code to:', rtkHeader.kitchen_code);

                    // Generate a new refno for dispatch now that we have the kitchen code
                    if (rtkHeader.kitchen_code) {
                        await handleGetLastRefNo(rtkHeader.kitchen_code, startDate);
                    }
                }

                if (!option || !option.branch_code) {
                    setSaveBranch(rtkHeader.branch_code || '');
                    console.log('Set branch_code to:', rtkHeader.branch_code);
                }

                // Fetch detail data
                console.log('Fetching detail data...');
                const detailResponse = await dispatch(Br_rtkdtAlljoindt({ refno })).unwrap();
                console.log('Detail data response:', detailResponse);

                if (detailResponse.result && detailResponse.data && detailResponse.data.length > 0) {
                    console.log('Processing detail data...');
                    await processRTKDetailData(detailResponse.data);
                } else {
                    console.log('No items found in return request');
                    Swal.fire({
                        icon: 'warning',
                        title: 'No Items',
                        text: 'This return request has no items.',
                        confirmButtonColor: '#754C27'
                    });
                }
            }
        } catch (error) {
            console.error("Error loading RTK data:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load return request data: ' + error.message
            });
        } finally {
            setLoadingRTK(false);
        }
    };

    const processRTKDetailData = async (detailData) => {
        try {
            console.log('Processing RTK detail data:', detailData);

            // Filter only products with remaining quantity if qty_send exists
            const availableItems = detailData.filter(item => {
                if ('qty_send' in item) {
                    const total = parseFloat(item.qty) || 0;
                    const sent = parseFloat(item.qty_send) || 0;
                    return total > sent; // Only products not fully dispatched
                }
                return true; // Include all products if qty_send doesn't exist
            });

            if (availableItems.length === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'No Products Available',
                    text: 'All products in this return request have already been processed.',
                    confirmButtonColor: '#754C27'
                });
                return;
            }

            // Store product data
            const productsData = availableItems.map(item => {
                return {
                    ...item.tbl_product,
                    product_code: item.product_code,
                    product_name: item.tbl_product?.product_name || '',
                    tax1: item.tax1 || 'N',
                    unit_code: item.unit_code,
                    unit_name: item.tbl_unit?.unit_name || '',
                    tbl_unit: item.tbl_unit,
                    productUnit1: item.tbl_product?.productUnit1,
                    productUnit2: item.tbl_product?.productUnit2,
                    bulk_unit_price: item.tbl_product?.bulk_unit_price || 0,
                    retail_unit_price: item.tbl_product?.retail_unit_price || 0,
                    original_qty: parseFloat(item.qty) || 0,
                    qty_send: parseFloat(item.qty_send) || 0
                };
            });

            setProducts(productsData);
            setSelectedProducts(productsData.map(p => p.product_code));

            // Create new state objects
            const newQuantities = {};
            const newUnits = {};
            const newUnitPrices = {};
            const newTotals = {};
            const newExpiryDates = {};
            const newTemperatures = {};
            const newTaxStatus = {};
            const newOriginalQty = {};
            const newRemainingQty = {};

            availableItems.forEach((item) => {
                const productCode = item.product_code;
                if (!productCode) return;

                const totalQty = parseFloat(item.qty) || 0;
                const sentQty = parseFloat(item.qty_send) || 0;
                const remainingQty = 'qty_send' in item ? totalQty - sentQty : totalQty;

                // Store original and remaining quantities
                newOriginalQty[productCode] = totalQty;
                newRemainingQty[productCode] = remainingQty;

                // Set quantity to dispatch as the remaining quantity
                newQuantities[productCode] = remainingQty;

                // Store unit_code
                newUnits[productCode] = item.unit_code ||
                    (item.tbl_product?.productUnit1?.unit_code || '');

                newUnitPrices[productCode] = parseFloat(item.uprice) || 0;
                newTotals[productCode] = remainingQty * parseFloat(item.uprice || 0);
                newTaxStatus[productCode] = item.tax1 || 'N';

                // Set default temperature
                newTemperatures[productCode] = 38;

                // Set expiry date
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

            // Update states
            setQuantities(newQuantities);
            setUnits(newUnits);
            setUnitPrices(newUnitPrices);
            setTotals(newTotals);
            setTaxStatus(newTaxStatus);
            setExpiryDates(newExpiryDates);
            setTemperatures(newTemperatures);
            setOriginalQty(newOriginalQty);
            setRemainingQty(newRemainingQty);

            // Calculate amounts
            let newTaxable = 0;
            let newNonTaxable = 0;

            availableItems.forEach(item => {
                const productCode = item.product_code;
                const amount = newTotals[productCode] || 0;
                if (item.tax1 === 'Y') {
                    newTaxable += amount;
                } else {
                    newNonTaxable += amount;
                }
            });

            setTaxableAmount(newTaxable);
            setNonTaxableAmount(newNonTaxable);
            setTotal(Object.values(newTotals).reduce((sum, value) => sum + value, 0));

        } catch (error) {
            console.error('Error processing detail data:', error);
            throw error;
        }
    };

    // Handle date change
    const handleDateChange = (date) => {
        setStartDate(date);

        // If kitchen is already selected, update reference number
        if (saveKitchen) {
            handleGetLastRefNo(saveKitchen, date);
        }
    };

    // Optional: Handle branch filter for return requests
    const handleBranchFilter = (branchCode) => {
        // Fetch RTKs filtered by this branch
        fetchAvailableReturnRequests(branchCode);
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

    // Toggle product selection
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
            setTemperatures(prev => ({ ...prev, [product.product_code]: "38" }));
            setTaxStatus(prev => ({ ...prev, [product.product_code]: product.tax1 || 'N' }));

            // Calculate initial total
            const initialTotal = (product.bulk_unit_price || 0) * 1;
            setTotals(prev => ({ ...prev, [product.product_code]: initialTotal }));
            setTotal(prev => prev + initialTotal);
        }
    };

    // Calculate product total and update related states
    const calculateProductTotal = (productCode, quantity, unitPrice, tax) => {
        const amount = quantity * unitPrice;
        setTotals(prev => {
            const newTotals = { ...prev, [productCode]: amount };
            const totalAmount = Object.values(newTotals).reduce((sum, val) => sum + val, 0);
            setTotal(totalAmount);

            // Update taxable and non-taxable amounts
            let newTaxable = 0;
            let newNonTaxable = 0;

            products.forEach(product => {
                const pCode = product.product_code;
                const pAmount = newTotals[pCode] || 0;
                const pTax = taxStatus[pCode] || product.tax1 || 'N';

                if (pTax === 'Y') {
                    newTaxable += pAmount;
                } else {
                    newNonTaxable += pAmount;
                }
            });

            // Also consider the product being updated
            if (productCode && !products.some(p => p.product_code === productCode)) {
                if (tax === 'Y') {
                    newTaxable += amount;
                } else {
                    newNonTaxable += amount;
                }
            }

            setTaxableAmount(newTaxable);
            setNonTaxableAmount(newNonTaxable);

            return newTotals;
        });
    };

    // Handle quantity change with +/- buttons
    const handleQuantityChange = (productCode, delta) => {
        const currentQty = quantities[productCode] || 0;
        const newQty = Math.max(1, currentQty + delta);

        // Check maximum allowed quantity if from RTK
        if (selectedRtkRefno && remainingQty[productCode]) {
            const maxQuantity = remainingQty[productCode] || 1;
            if (newQty > maxQuantity) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Quantity Limit Exceeded',
                    text: `You can only dispatch up to ${maxQuantity} units for this product`,
                    confirmButtonColor: '#754C27'
                });
                return;
            }
        }

        setQuantities(prev => ({
            ...prev,
            [productCode]: newQty
        }));

        // Update total
        const price = unitPrices[productCode] || 0;
        const tax = taxStatus[productCode] || 'N';
        calculateProductTotal(productCode, newQty, price, tax);
    };

    // Handle direct quantity input change
    const handleQuantityInputChange = (productCode, value) => {
        const newQty = Math.max(1, parseInt(value) || 1);

        // Check maximum allowed quantity if from RTK
        if (selectedRtkRefno && remainingQty[productCode]) {
            const maxQuantity = remainingQty[productCode] || 1;
            if (newQty > maxQuantity) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Quantity Limit Exceeded',
                    text: `You can only dispatch up to ${maxQuantity} units for this product`,
                    confirmButtonColor: '#754C27'
                });
                return;
            }
        }

        setQuantities(prev => ({
            ...prev,
            [productCode]: newQty
        }));

        // Update total
        const price = unitPrices[productCode] || 0;
        const tax = taxStatus[productCode] || 'N';
        calculateProductTotal(productCode, newQty, price, tax);
    };

    // Handle unit change (which affects price)
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
        const tax = taxStatus[productCode] || 'N';
        calculateProductTotal(productCode, qty, newPrice, tax);
    };

    // Handle expiry date change
    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
    };

    // Handle temperature change
    const handleTemperatureChange = (productCode, value) => {
        const newTemp = parseFloat(value);
        if (!isNaN(newTemp)) {
            setTemperatures(prev => ({
                ...prev,
                [productCode]: newTemp
            }));
        }
    };

    // Handle tax status change
    const handleTaxStatusChange = (productCode, value) => {
        setTaxStatus(prev => ({
            ...prev,
            [productCode]: value
        }));

        // Update totals since tax status changed
        const qty = quantities[productCode] || 0;
        const price = unitPrices[productCode] || 0;
        calculateProductTotal(productCode, qty, price, value);
    };

    // Delete product from dispatch
    const handleDeleteProduct = (productCode) => {
        setProducts(prev => prev.filter(p => p.product_code !== productCode));
        setSelectedProducts(prev => prev.filter(id => id !== productCode));

        // Clear related state for the deleted product
        setQuantities(prev => {
            const { [productCode]: _, ...rest } = prev;
            return rest;
        });
        setUnits(prev => {
            const { [productCode]: _, ...rest } = prev;
            return rest;
        });
        setUnitPrices(prev => {
            const { [productCode]: _, ...rest } = prev;
            return rest;
        });
        setTotals(prev => {
            const { [productCode]: _, ...rest } = prev;
            return rest;
        });
        setExpiryDates(prev => {
            const { [productCode]: _, ...rest } = prev;
            return rest;
        });
        setTemperatures(prev => {
            const { [productCode]: _, ...rest } = prev;
            return rest;
        });
        setTaxStatus(prev => {
            const { [productCode]: _, ...rest } = prev;
            return rest;
        });

        // Recalculate order totals
        const updatedProducts = products.filter(p => p.product_code !== productCode);
        let newTaxable = 0;
        let newNonTaxable = 0;
        let newTotal = 0;

        updatedProducts.forEach(product => {
            const amount = totals[product.product_code] || 0;
            newTotal += amount;

            if (taxStatus[product.product_code] === 'Y') {
                newTaxable += amount;
            } else {
                newNonTaxable += amount;
            }
        });

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setTotal(newTotal);
    };

    // Reset form
    const resetForm = () => {
        setProducts([]);
        setSelectedProducts([]);
        setQuantities({});
        setUnits({});
        setUnitPrices({});
        setTotals({});
        setTotal(0);
        setTaxableAmount(0);
        setNonTaxableAmount(0);
        setSaveKitchen('');
        setSaveBranch('');
        setSearchTerm('');
        setExpiryDates({});
        setTemperatures({});
        setTaxStatus({});
        setRtkRefno('');
        setSelectedRtkRefno('');
        setRtkData(null);
        setOriginalQty({});
        setRemainingQty({});
        setLastRefNo(''); // Clear ref no when form is reset
        setRefNo('Please select return request first');
    };

    // Handle form submission
    const handleSave = async () => {
        // Validate form
        if (!saveKitchen || !saveBranch || products.length === 0 || !lastRefNo) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a return request and ensure products are added.',
                timer: 1500
            });
            return;
        }

        try {
            Swal.fire({
                title: 'Saving dispatch...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Calculate tax amounts
            let taxableAmount = 0;
            let nontaxableAmount = 0;

            products.forEach(product => {
                const productCode = product.product_code;
                const amount = totals[productCode] || 0;
                if (taxStatus[productCode] === 'Y') {
                    taxableAmount += amount;
                } else {
                    nontaxableAmount += amount;
                }
            });

            // Prepare header data with refno1 instead of rtk_refno
            const headerData = {
                refno: lastRefNo,
                refno1: rtkRefno, // Use refno1 instead of rtk_refno
                rdate: format(startDate, 'MM/dd/yyyy'),
                kitchen_code: saveKitchen,
                branch_code: saveBranch,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2?.user_code || '',
                taxable: taxableAmount,
                nontaxable: nontaxableAmount
            };

            // Prepare product data
            const productArrayData = products.map(product => ({
                refno: headerData.refno,
                product_code: product.product_code,
                qty: quantities[product.product_code] || 1,
                unit_code: units[product.product_code] || product.productUnit1?.unit_code || '',
                uprice: unitPrices[product.product_code] || 0,
                tax1: taxStatus[product.product_code] || 'N',
                amt: totals[product.product_code] || 0,
                expire_date: format(expiryDates[product.product_code], 'MM/dd/yyyy'),
                texpire_date: format(expiryDates[product.product_code], 'yyyyMMdd'),
                temperature1: temperatures[product.product_code] || ''
            }));

            const saleTax = taxableAmount * 0.07;

            // Prepare complete order data
            const orderData = {
                headerData,
                productArrayData,
                footerData: {
                    taxable: taxableAmount,
                    nontaxable: nontaxableAmount,
                    total: total,
                    sale_tax: saleTax,
                    total_due: total + saleTax
                }
            };

            console.log("Sending data to API:", orderData);

            // Submit the data
            const response = await dispatch(addKt_dpb(orderData)).unwrap();
            console.log("API response:", response);

            // Show success message
            await Swal.fire({
                icon: 'success',
                title: 'Created dispatch successfully',
                text: `Reference No: ${lastRefNo}`,
                showConfirmButton: false,
                timer: 1500
            });

            resetForm();
            onBack();

        } catch (error) {
            console.error("API error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error saving dispatch',
                confirmButtonText: 'OK'
            });
        }
    };

    // Handle pagination
    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <Box sx={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            {/* Back button */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                sx={{ marginBottom: "20px" }}
            >
                Back to Dispatch to Restaurant
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
                        {/* Return Request Selector - MOVED TO TOP */}
                        <Grid item xs={12}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                                Select Return Request
                            </Typography>
                            <Box sx={{ mt: '8px' }}>
                                <Autocomplete
                                    options={rtkRefnos}
                                    getOptionLabel={(option) =>
                                        typeof option === 'string'
                                            ? option
                                            : `${option.refno} - From: ${option.branch} (${option.formattedDate})`
                                    }
                                    onChange={(_, newValue) => handleRTKSelection(newValue?.refno || '', newValue)}
                                    noOptionsText={"Select or search for a return request"}
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
                                                    From: {option.branch}
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
                                            placeholder={"Search and select a return request"}
                                            variant="outlined"
                                            size="small"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '10px'
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                                Selected Return Ref.No
                            </Typography>
                            <TextField
                                value={refNo}
                                disabled
                                size="small"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                        fontWeight: '700'
                                    },
                                    '& .Mui-disabled': {
                                        WebkitTextFillColor: refNo === 'Please select return request first'
                                            ? '#d32f2f'
                                            : 'rgba(0, 0, 0, 0.38)',
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
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
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                                Ref.no
                            </Typography>
                            <TextField
                                value={isLoadingRefNo ? "Generating..." : (lastRefNo || "Will generate after selecting return request")}
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
                                Kitchen
                            </Typography>
                            <TextField
                                value={
                                    saveKitchen ?
                                        kitchens.find(k => k.kitchen_code === saveKitchen)?.kitchen_name || saveKitchen :
                                        "Auto-populated from return request"
                                }
                                disabled
                                size="small"
                                fullWidth
                                sx={{
                                    mt: '8px',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                                Restaurant
                            </Typography>
                            <TextField
                                value={
                                    saveBranch ?
                                        branches.find(b => b.branch_code === saveBranch)?.branch_name || saveBranch :
                                        "Auto-populated from return request"
                                }
                                disabled
                                size="small"
                                fullWidth
                                sx={{
                                    mt: '8px',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Current Order Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" color="#754C27">Current Dispatch</Typography>
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

                    {/* Products Table */}
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
                                    <TableCell>Product</TableCell>
                                    <TableCell>Expiry Date</TableCell>
                                    <TableCell>Temp</TableCell>
                                    <TableCell>Tax</TableCell>
                                    <TableCell>Qty</TableCell>
                                    <TableCell>Unit</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">
                                            <Typography sx={{ py: 3, color: 'text.secondary' }}>
                                                No products added yet. Select a return request to load products.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.map((product, index) => {
                                        const productCode = product.product_code;
                                        return (
                                            <TableRow key={productCode}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Box sx={{
                                                            width: 40,
                                                            height: 40,
                                                            overflow: 'hidden',
                                                            marginRight: 1
                                                        }}>
                                                            {renderProductImage(product, 'table')}
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="bold" noWrap sx={{ maxWidth: 120 }}>
                                                                {product.product_name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {product.product_code}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <DatePicker
                                                        selected={expiryDates[productCode]}
                                                        onChange={(date) => handleExpiryDateChange(productCode, date)}
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
                                                    <Select
                                                        value={taxStatus[productCode] || 'N'}
                                                        onChange={(e) => handleTaxStatusChange(productCode, e.target.value)}
                                                        size="small"
                                                        sx={{ minWidth: 60 }}
                                                    >
                                                        <MenuItem value="Y">Yes</MenuItem>
                                                        <MenuItem value="N">No</MenuItem>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <IconButton
                                                            onClick={() => handleQuantityChange(productCode, -1)}
                                                            size="small"
                                                        >
                                                            <RemoveIcon />
                                                        </IconButton>
                                                        <Typography sx={{ mx: 1 }}>{quantities[productCode]}</Typography>
                                                        <IconButton
                                                            onClick={() => handleQuantityChange(productCode, 1)}
                                                            size="small"
                                                        >
                                                            <AddIcon />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={units[productCode] || ''}
                                                        onChange={(e) => handleUnitChange(productCode, e.target.value)}
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
                                                        onClick={() => handleDeleteProduct(productCode)}
                                                        color="error"
                                                        size="small"
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