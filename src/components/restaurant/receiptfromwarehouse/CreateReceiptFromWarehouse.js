import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    Divider,
    InputAdornment,
    Grid,
    CircularProgress,
    Autocomplete
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../api/productrecordApi';
import { branchAll } from '../../../api/branchApi';
import { addBr_rfw, Br_rfwrefno, Br_rfwUsedRefnos } from '../../../api/restaurant/br_rfwApi';
import { Wh_dpbdtAlljoindt } from '../../../api/warehouse/wh_dpbdtApi';
import { Wh_dpbByRefno, wh_dpbAlljoindt } from '../../../api/warehouse/wh_dpbApi';
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
                    mt: '8px'
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

export default function CreateGoodsReceiptWarehouse({ onBack }) {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('Please select dispatch to branch');
    const [branches, setBranches] = useState([]);
    const [saveBranch, setSaveBranch] = useState('');
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [total, setTotal] = useState(0);
    const [expiryDates, setExpiryDates] = useState({});
    const [temperatures, setTemperatures] = useState({});
    const [taxStatus, setTaxStatus] = useState({});
    const [taxableAmount, setTaxableAmount] = useState(0);
    const [nonTaxableAmount, setNonTaxableAmount] = useState(0);
    const [saleTax, setSaleTax] = useState(0);
    const [totalDue, setTotalDue] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // For dispatch selection
    const [dispatchRefnos, setDispatchRefnos] = useState([]);
    const [selectedDispatchRefno, setSelectedDispatchRefno] = useState('');
    const [dispatchData, setDispatchData] = useState(null);
    const [loadingDispatch, setLoadingDispatch] = useState(false);

    const TAX_RATE = 0.07;
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson || "{}");

    useEffect(() => {
        // Fetch branches
        dispatch(branchAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((res) => {
                setBranches(res.data);
            })
            .catch((err) => console.log(err.message));

        // Initial product search setup
        dispatch(searchProductName({ product_name: '' }))
            .unwrap()
            .then((res) => {
                if (res.data) {
                    setSearchResults(res.data);
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

            let newTaxable = 0;
            let newNonTaxable = 0;
            let newTotal = 0;

            detailData.forEach((item) => {
                const productCode = item.product_code;
                if (!productCode) return;

                const qty = parseFloat(item.qty) || 1;
                const unitCode = item.unit_code || '';
                const price = parseFloat(item.uprice) || 0;
                const tax1 = item.tax1 || 'N';
                const lineTotal = qty * price;

                newQuantities[productCode] = qty;
                newUnits[productCode] = unitCode;
                newUnitPrices[productCode] = price;
                newTotals[productCode] = lineTotal;
                newTemperatures[productCode] = item.temperature1 || '38';
                newTaxStatus[productCode] = tax1;

                newTotal += lineTotal;

                if (tax1 === 'Y') {
                    newTaxable += lineTotal;
                } else {
                    newNonTaxable += lineTotal;
                }

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

            // Set calculated amounts
            setTotal(newTotal);
            setTaxableAmount(newTaxable);
            setNonTaxableAmount(newNonTaxable);
            setSaleTax(newTaxable * TAX_RATE);
            setTotalDue(newTotal + (newTaxable * TAX_RATE));

        } catch (error) {
            console.error('Error processing detail data:', error);
            throw error;
        }
    };

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
            setShowDropdown(false);
        }
    };

    const handleProductSelect = (product) => {
        // Check if product already exists
        if (products.some(p => p.product_code === product.product_code)) {
            Swal.fire({
                icon: 'info',
                title: 'Product Already Added',
                text: 'This product is already in your order.',
                timer: 1500
            });
            setSearchTerm('');
            setShowDropdown(false);
            return;
        }

        // Create new arrays/objects with updated values to avoid state update delays
        const updatedProducts = [...products, product];

        // Initialize state values for this product
        const productCode = product.product_code;
        const newQuantity = 1;
        const newUnit = product.productUnit1?.unit_code || '';
        const newPrice = product.bulk_unit_price || 0;
        const newTaxStatus = product.tax1 || 'N';
        const lineTotal = newQuantity * newPrice;

        // Create updated state objects
        const newQuantities = { ...quantities, [productCode]: newQuantity };
        const newUnits = { ...units, [productCode]: newUnit };
        const newUnitPrices = { ...unitPrices, [productCode]: newPrice };
        const newTotals = { ...totals, [productCode]: lineTotal };
        const newExpiryDates = { ...expiryDates, [productCode]: new Date() };
        const newTemperatures = { ...temperatures, [productCode]: '38' };
        const newTaxStatusValues = { ...taxStatus, [productCode]: newTaxStatus };

        // Calculate order totals
        let newTaxable = taxableAmount;
        let newNonTaxable = nonTaxableAmount;

        if (newTaxStatus === 'Y') {
            newTaxable += lineTotal;
        } else {
            newNonTaxable += lineTotal;
        }

        const newTotal = total + lineTotal;
        const newSaleTax = newTaxable * TAX_RATE;
        const newTotalDue = newTotal + newSaleTax;

        // Update all state at once
        setProducts(updatedProducts);
        setQuantities(newQuantities);
        setUnits(newUnits);
        setUnitPrices(newUnitPrices);
        setTotals(newTotals);
        setExpiryDates(newExpiryDates);
        setTemperatures(newTemperatures);
        setTaxStatus(newTaxStatusValues);
        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setTotal(newTotal);
        setSaleTax(newSaleTax);
        setTotalDue(newTotalDue);

        setSearchTerm('');
        setShowDropdown(false);
    };

    const handleDeleteProduct = (productCode) => {
        // Get product information before deletion
        const productToDelete = products.find(p => p.product_code === productCode);
        if (!productToDelete) return;

        // Create new product list without the deleted product
        const updatedProducts = products.filter(p => p.product_code !== productCode);

        // Calculate line total to subtract
        const lineTotal = totals[productCode] || 0;

        // Clean up all associated state
        const { [productCode]: _, ...newQuantities } = quantities;
        const { [productCode]: __, ...newUnits } = units;
        const { [productCode]: ___, ...newUnitPrices } = unitPrices;
        const { [productCode]: ____, ...newTotals } = totals;
        const { [productCode]: _____, ...newExpiryDates } = expiryDates;
        const { [productCode]: ______, ...newTemperatures } = temperatures;
        const { [productCode]: _______, ...newTaxStatus } = taxStatus;

        // Recalculate totals
        const isTaxable = taxStatus[productCode] === 'Y';
        const newTaxable = isTaxable ? taxableAmount - lineTotal : taxableAmount;
        const newNonTaxable = !isTaxable ? nonTaxableAmount - lineTotal : nonTaxableAmount;
        const newTotal = total - lineTotal;
        const newSaleTax = newTaxable * TAX_RATE;
        const newTotalDue = newTotal + newSaleTax;

        // Update all state
        setProducts(updatedProducts);
        setQuantities(newQuantities);
        setUnits(newUnits);
        setUnitPrices(newUnitPrices);
        setTotals(newTotals);
        setExpiryDates(newExpiryDates);
        setTemperatures(newTemperatures);
        setTaxStatus(newTaxStatus);
        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setTotal(newTotal);
        setSaleTax(newSaleTax);
        setTotalDue(newTotalDue);
    };

    const handleQuantityChange = (productCode, newQuantity) => {
        if (newQuantity < 1) newQuantity = 1;

        // Get current price and values
        const price = unitPrices[productCode] || 0;
        const oldQty = quantities[productCode] || 0;
        const oldLineTotal = totals[productCode] || 0;
        const isTaxable = taxStatus[productCode] === 'Y';

        // Calculate new line total
        const newLineTotal = newQuantity * price;
        const lineTotalDiff = newLineTotal - oldLineTotal;

        // Update quantities and totals
        const newQuantities = { ...quantities, [productCode]: newQuantity };
        const newTotals = { ...totals, [productCode]: newLineTotal };

        // Recalculate order totals
        const newTaxable = isTaxable ? taxableAmount + lineTotalDiff : taxableAmount;
        const newNonTaxable = !isTaxable ? nonTaxableAmount + lineTotalDiff : nonTaxableAmount;
        const newTotal = total + lineTotalDiff;
        const newSaleTax = newTaxable * TAX_RATE;
        const newTotalDue = newTotal + newSaleTax;

        // Update all state
        setQuantities(newQuantities);
        setTotals(newTotals);
        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setTotal(newTotal);
        setSaleTax(newSaleTax);
        setTotalDue(newTotalDue);
    };

    const handleUnitChange = (productCode, newUnit) => {
        // Find product and get current values
        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        // Get price based on unit
        const newPrice = newUnit === product.productUnit1?.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        const quantity = quantities[productCode] || 1;
        const oldLineTotal = totals[productCode] || 0;
        const newLineTotal = quantity * newPrice;
        const lineTotalDiff = newLineTotal - oldLineTotal;
        const isTaxable = taxStatus[productCode] === 'Y';

        // Create updated state objects
        const newUnits = { ...units, [productCode]: newUnit };
        const newUnitPrices = { ...unitPrices, [productCode]: newPrice };
        const newTotals = { ...totals, [productCode]: newLineTotal };

        // Recalculate order totals
        const newTaxable = isTaxable ? taxableAmount + lineTotalDiff : taxableAmount;
        const newNonTaxable = !isTaxable ? nonTaxableAmount + lineTotalDiff : nonTaxableAmount;
        const newTotal = total + lineTotalDiff;
        const newSaleTax = newTaxable * TAX_RATE;
        const newTotalDue = newTotal + newSaleTax;

        // Update all state
        setUnits(newUnits);
        setUnitPrices(newUnitPrices);
        setTotals(newTotals);
        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setTotal(newTotal);
        setSaleTax(newSaleTax);
        setTotalDue(newTotalDue);
    };

    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
    };

    const handleTemperatureChange = (productCode, temp) => {
        setTemperatures(prev => ({ ...prev, [productCode]: temp }));
    };

    const handleTaxStatusChange = (productCode, value) => {
        // Get existing line total and statuses
        const lineTotal = totals[productCode] || 0;
        const oldTaxStatus = taxStatus[productCode] || 'N';
        const newTaxStatus = value;

        // Skip if no change
        if (oldTaxStatus === newTaxStatus) return;

        // Create updated tax status object
        const newTaxStatusValues = { ...taxStatus, [productCode]: newTaxStatus };

        // Calculate tax changes
        let newTaxable = taxableAmount;
        let newNonTaxable = nonTaxableAmount;

        if (oldTaxStatus === 'N' && newTaxStatus === 'Y') {
            // Moving from non-taxable to taxable
            newTaxable += lineTotal;
            newNonTaxable -= lineTotal;
        } else if (oldTaxStatus === 'Y' && newTaxStatus === 'N') {
            // Moving from taxable to non-taxable
            newTaxable -= lineTotal;
            newNonTaxable += lineTotal;
        }

        const newSaleTax = newTaxable * TAX_RATE;
        const newTotalDue = total + newSaleTax;

        // Update all state
        setTaxStatus(newTaxStatusValues);
        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setSaleTax(newSaleTax);
        setTotalDue(newTotalDue);
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

            const headerData = {
                refno: lastRefNo,
                rdate: format(startDate, 'MM/dd/yyyy'),
                supplier_code: "-", // Set supplier_code to "-" as default
                branch_code: saveBranch,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2?.user_code || '',
                taxable: taxableAmount.toString(),
                nontaxable: nonTaxableAmount.toString(),
                total: total.toString()
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
                taxable: taxableAmount.toString(),
                nontaxable: nonTaxableAmount.toString(),
                total: totalDue.toString()
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
        setTaxableAmount(0);
        setNonTaxableAmount(0);
        setSaleTax(0);
        setTotalDue(0);
        setSelectedDispatchRefno('');
        setDispatchData(null);
        setLastRefNo('Please select dispatch to branch');
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
        <Box sx={{ width: '100%' }}>
            <Button
                onClick={onBack}
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2 }}
            >
                Back to Goods Receipt Warehouse
            </Button>

            <Box sx={{
                width: '100%',
                mt: '10px',
                flexDirection: 'column'
            }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    border: '1px solid #E4E4E4',
                    borderRadius: '10px',
                    bgcolor: '#FFFFFF',
                    height: '100%',
                    p: '16px',
                    position: 'relative',
                    zIndex: 2,
                    mb: '50px'
                }}>
                    <Box sx={{ width: '90%', mt: '24px' }}>
                        <Grid container spacing={2}>
                            {/* Restaurant Selection - This must be first */}
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Restaurant (Select First)
                                </Typography>
                                <Box
                                    component="select"
                                    value={saveBranch}
                                    onChange={(e) => handleBranchChange(e.target.value)}
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
                                        },
                                        '& option': {
                                            fontSize: '16px',
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

                            {/* Dispatch Selection */}
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Select Dispatch
                                </Typography>
                                <Box sx={{ opacity: saveBranch ? 1 : 0.5, mt: '8px' }}>
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
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '10px',
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
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

                            <Grid item xs={12} md={6}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Date
                                </Typography>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    dateFormat="MM/dd/yyyy"
                                    customInput={<CustomInput />}
                                />
                            </Grid>

                            <Divider sx={{ my: 3, width: '100%' }} />

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
                                <Button
                                    onClick={resetForm}
                                    sx={{
                                        ml: 'auto',
                                        bgcolor: '#E2EDFB',
                                        borderRadius: '6px',
                                        width: '105px',
                                        '&:hover': {
                                            bgcolor: '#d0e0f7'
                                        }
                                    }}
                                >
                                    Clear All
                                </Button>
                            </Box>

                            <Box sx={{ overflowX: 'auto', width: '100%' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>No.</th>
                                            <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>Product Code</th>
                                            <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>Product Name</th>
                                            <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Expiry Date</th>
                                            <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Tax</th>
                                            <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Temperature</th>
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
                                                <td colSpan={11} style={{ padding: '20px', textAlign: 'center' }}>
                                                    No products selected. Select a dispatch from the dropdown or search for products to add.
                                                </td>
                                            </tr>
                                        ) : (
                                            products.map((product, index) => {
                                                const productCode = product.product_code;
                                                const price = unitPrices[productCode] || 0;
                                                const quantity = quantities[productCode] || 1;
                                                const total = totals[productCode] || (price * quantity);

                                                return (
                                                    <tr key={productCode}>
                                                        <td style={{ padding: '12px' }}>{index + 1}</td>
                                                        <td style={{ padding: '12px' }}>{productCode}</td>
                                                        <td style={{ padding: '12px' }}>{product.product_name}</td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            <DatePicker
                                                                selected={expiryDates[productCode] || new Date()}
                                                                onChange={(date) => handleExpiryDateChange(productCode, date)}
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
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            <select
                                                                value={taxStatus[productCode] || 'N'}
                                                                onChange={(e) => handleTaxStatusChange(productCode, e.target.value)}
                                                                style={{
                                                                    padding: '4px',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px',
                                                                    width: '60px'
                                                                }}
                                                            >
                                                                <option value="Y">Yes</option>
                                                                <option value="N">No</option>
                                                            </select>
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            <input
                                                                type="text"
                                                                value={temperatures[productCode] || '38'}
                                                                onChange={(e) => handleTemperatureChange(productCode, e.target.value)}
                                                                style={{
                                                                    width: '80px',
                                                                    padding: '4px',
                                                                    textAlign: 'center',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px'
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                                            <input
                                                                type="number"
                                                                value={quantity}
                                                                onChange={(e) => {
                                                                    const newQty = Number(e.target.value);
                                                                    if (!isNaN(newQty) && newQty >= 1) {
                                                                        handleQuantityChange(productCode, newQty);
                                                                    }
                                                                }}
                                                                style={{
                                                                    width: '80px',
                                                                    padding: '4px',
                                                                    textAlign: 'right',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px'
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            <select
                                                                value={units[productCode] || product.productUnit1?.unit_code || ''}
                                                                onChange={(e) => handleUnitChange(productCode, e.target.value)}
                                                                style={{
                                                                    padding: '4px',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px',
                                                                    width: '100px'
                                                                }}
                                                            >
                                                                {product.productUnit1 && (
                                                                    <option value={product.productUnit1.unit_code}>
                                                                        {product.productUnit1.unit_name || 'Unknown'}
                                                                    </option>
                                                                )}
                                                                {product.productUnit2 && (
                                                                    <option value={product.productUnit2.unit_code}>
                                                                        {product.productUnit2.unit_name || 'Unknown'}
                                                                    </option>
                                                                )}
                                                            </select>
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                                            ${price.toFixed(2)}
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                                            ${total.toFixed(2)}
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            <IconButton
                                                                onClick={() => handleDeleteProduct(productCode)}
                                                                size="small"
                                                                sx={{ color: 'error.main' }}
                                                            >
                                                                <CancelIcon />
                                                            </IconButton>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </Box>

                            <Box sx={{
                                mt: 3,
                                p: 2,
                                bgcolor: '#EAB86C',
                                borderRadius: '10px',
                                color: 'white',
                                width: '100%'
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    height: '100%'
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        width: '100%',
                                        mr: 'auto',
                                        justifyContent: 'space-between'
                                    }}>
                                        <Box>
                                            <Typography sx={{ color: '#FFFFFF' }}>Taxable</Typography>
                                            <Typography sx={{ color: '#FFFFFF' }}>Non-Taxable</Typography>
                                            <Typography sx={{ color: '#FFFFFF' }}>Total</Typography>
                                        </Box>
                                        <Box>
                                            <Typography sx={{ color: '#FFFFFF' }}>${taxableAmount.toFixed(2)}</Typography>
                                            <Typography sx={{ color: '#FFFFFF' }}>${nonTaxableAmount.toFixed(2)}</Typography>
                                            <Typography sx={{ color: '#FFFFFF' }}>${total.toFixed(2)}</Typography>
                                        </Box>
                                    </Box>

                                    <Divider orientation="vertical" flexItem sx={{ borderColor: '#754C27', mx: 2 }} />

                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        width: '100%',
                                        ml: 'auto',
                                        justifyContent: 'space-between'
                                    }}>
                                        <Box>
                                            <Typography sx={{ color: '#FFFFFF' }}>Sale Tax</Typography>
                                        </Box>
                                        <Box>
                                            <Typography sx={{ color: '#FFFFFF' }}>${saleTax.toFixed(2)}</Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: '8px' }}>
                                    <Typography sx={{ color: '#FFFFFF', fontSize: '30px', fontWeight: '600' }}>
                                        Total due
                                    </Typography>
                                    <Typography sx={{ color: '#FFFFFF', ml: 'auto', fontSize: '30px', fontWeight: '600' }}>
                                        ${totalDue.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Button
                                onClick={handleSave}
                                sx={{
                                    width: '100%',
                                    height: '48px',
                                    mt: '24px',
                                    bgcolor: '#754C27',
                                    color: '#FFFFFF',
                                    '&:hover': {
                                        bgcolor: '#5A3D1F',
                                    }
                                }}
                                disabled={!lastRefNo || lastRefNo === 'Please select dispatch to branch' || products.length === 0}
                            >
                                Save
                            </Button>
                        </Grid>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}