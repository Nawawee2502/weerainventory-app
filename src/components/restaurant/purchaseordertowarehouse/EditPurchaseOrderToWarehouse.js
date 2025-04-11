import { Box, Button, InputAdornment, TextField, Typography, IconButton, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../api/productrecordApi';
import {
    updateBr_pow,
    getPowByRefno,
    checkPOUsedInDispatch
} from '../../../api/restaurant/br_powApi';
import { Br_powdtAlljoindt } from '../../../api/restaurant/br_powdtApi';
import { branchAll } from '../../../api/branchApi';
import { supplierAll } from '../../../api/supplierApi';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Swal from 'sweetalert2';
import { format, parse } from 'date-fns';

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

export default function EditBranchPurchaseOrder({ onBack, editRefno }) {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(new Date());
    const [branches, setBranches] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [saveBranch, setSaveBranch] = useState('');
    const [saveSupplier, setSaveSupplier] = useState('');
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [taxableAmount, setTaxableAmount] = useState(0);
    const [nonTaxableAmount, setNonTaxableAmount] = useState(0);
    const [total, setTotal] = useState(0);
    const [expiryDates, setExpiryDates] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [allProducts, setAllProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [imageErrors, setImageErrors] = useState({});

    // State for handling edit restrictions
    const [canEdit, setCanEdit] = useState(true);
    const [isUsedInDispatch, setIsUsedInDispatch] = useState(false);

    const TAX_RATE = 0.07;
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson || "{}");

    // Helper function to parse date from different formats
    const parseDateSafely = (dateString) => {
        if (!dateString) return new Date();

        console.log("Attempting to parse date:", dateString);

        try {
            // Try different formats
            const formats = [
                'MM/dd/yyyy', // US format
                'dd/MM/yyyy', // Thai/UK format
                'yyyy-MM-dd', // ISO format
                'yyyy/MM/dd',
                'MM-dd-yyyy',
                'dd-MM-yyyy',
                'yyyyMMdd'    // Compact format
            ];

            // Handle yyyyMMdd format specifically (e.g. 20240321)
            if (dateString.length === 8 && !isNaN(dateString)) {
                const year = dateString.substring(0, 4);
                const month = dateString.substring(4, 6);
                const day = dateString.substring(6, 8);
                console.log(`Parsing as yyyyMMdd: ${year}-${month}-${day}`);
                const date = new Date(`${year}-${month}-${day}`);

                if (!isNaN(date.getTime())) {
                    return date;
                }
            }

            // Try different formats
            for (const format of formats) {
                try {
                    const parsed = parse(dateString, format, new Date());
                    if (!isNaN(parsed.getTime())) {
                        console.log(`Successfully parsed as ${format}:`, parsed);
                        return parsed;
                    }
                } catch (e) {
                    // Try next format
                }
            }

            // Fallback to Date constructor
            const dateObject = new Date(dateString);
            if (!isNaN(dateObject.getTime())) {
                console.log('Parsed using native Date constructor:', dateObject);
                return dateObject;
            }

        } catch (e) {
            console.error("Error parsing date:", e, dateString);
        }

        console.warn("Could not parse date, using current date as fallback");
        return new Date();
    };

    useEffect(() => {
        loadInitialData();
    }, [editRefno]);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);

            // Load all necessary data in parallel for efficiency
            await Promise.all([
                loadBranches(),
                loadSuppliers(),
                loadAllProducts(),
                loadPurchaseOrderData()
            ]);
        } catch (err) {
            console.error('Error loading data:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error Loading Data',
                text: err.message || 'Failed to load purchase order data',
                confirmButtonColor: '#754C27'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadPurchaseOrderData = async () => {
        if (!editRefno) return;

        try {
            // First check if PO can be edited
            const usageCheck = await dispatch(checkPOUsedInDispatch(editRefno)).unwrap();
            console.log('PO usage check result:', usageCheck);

            if (!usageCheck.canEdit) {
                setCanEdit(false);
                setIsUsedInDispatch(true);

                // Notify user that PO cannot be edited but don't redirect
                Swal.fire({
                    icon: 'warning',
                    title: 'This Purchase Order Cannot Be Updated',
                    text: 'This purchase order has already been used in a dispatch. You can view the details but cannot update it.',
                    confirmButtonColor: '#754C27'
                });
            }

            // 1. Load header data from PO
            const orderResponse = await dispatch(getPowByRefno(editRefno)).unwrap();

            if (orderResponse && orderResponse.result && orderResponse.data) {
                const headerData = orderResponse.data;
                console.log('Header data for edit:', headerData);

                setSaveSupplier(headerData.supplier_code || '');
                setSaveBranch(headerData.branch_code || '');

                // Parse date from header data
                if (headerData.rdate) {
                    console.log('Using rdate from API:', headerData.rdate);
                    const parsedDate = parseDateSafely(headerData.rdate);
                    setStartDate(parsedDate);
                }

                setTotal(parseFloat(headerData.total) || 0);
                setTaxableAmount(parseFloat(headerData.taxable) || 0);
                setNonTaxableAmount(parseFloat(headerData.nontaxable) || 0);

                // 2. Load detail data for products
                const detailResponse = await dispatch(Br_powdtAlljoindt(editRefno)).unwrap();

                if (detailResponse && detailResponse.data && detailResponse.data.length > 0) {
                    await processDetailData(detailResponse.data);
                }
            }
        } catch (err) {
            console.error('Error loading purchase order data:', err);
            throw err;
        }
    };

    const processDetailData = async (detailData) => {
        try {
            // Set selected product codes
            const productCodes = detailData.map(item => item.product_code);
            setSelectedProducts(productCodes);

            // Map detail data to product array
            const products = detailData.map(item => ({
                product_code: item.product_code,
                product_name: item.tbl_product?.product_name || item.product_name,
                product_img: item.tbl_product?.product_img,
                productUnit1: item.tbl_product?.productUnit1,
                productUnit2: item.tbl_product?.productUnit2,
                bulk_unit_price: item.tbl_product?.bulk_unit_price || 0,
                retail_unit_price: item.tbl_product?.retail_unit_price || 0,
                tax1: item.tbl_product?.tax1 || item.tax1
            }));

            setProducts(products);

            // Prepare state objects
            const newQuantities = {};
            const newUnits = {};
            const newUnitPrices = {};
            const newTotals = {};
            const newExpiryDates = {};

            detailData.forEach((item) => {
                const productCode = item.product_code;
                newQuantities[productCode] = parseFloat(item.qty) || 1;
                newUnits[productCode] = item.unit_code || item.tbl_product?.productUnit1?.unit_code || '';
                newUnitPrices[productCode] = parseFloat(item.uprice) || 0;
                newTotals[productCode] = parseFloat(item.amt) || 0;

                if (item.texpire_date) {
                    const year = item.texpire_date.substring(0, 4);
                    const month = item.texpire_date.substring(4, 6);
                    const day = item.texpire_date.substring(6, 8);
                    newExpiryDates[productCode] = new Date(`${year}-${month}-${day}`);
                } else if (item.expire_date) {
                    newExpiryDates[productCode] = parseDateSafely(item.expire_date);
                } else {
                    newExpiryDates[productCode] = new Date();
                }
            });

            // Update all state at once
            setQuantities(newQuantities);
            setUnits(newUnits);
            setUnitPrices(newUnitPrices);
            setTotals(newTotals);
            setExpiryDates(newExpiryDates);

            // Calculate totals
            let newTaxable = 0;
            let newNonTaxable = 0;

            products.forEach(product => {
                const amount = newTotals[product.product_code] || 0;
                if (product.tax1 === 'Y') {
                    newTaxable += amount;
                } else {
                    newNonTaxable += amount;
                }
            });

            setTaxableAmount(newTaxable);
            setNonTaxableAmount(newNonTaxable);
            setTotal((newTaxable * (1 + TAX_RATE)) + newNonTaxable);

            console.log('Detail Data Processed:', {
                products,
                quantities: newQuantities,
                units: newUnits,
                unitPrices: newUnitPrices,
                totals: newTotals
            });

        } catch (error) {
            console.error('Error processing detail data:', error);
            throw error;
        }
    };

    const loadAllProducts = async () => {
        try {
            const response = await dispatch(searchProductName({ product_name: '' })).unwrap();
            if (response?.data) {
                setAllProducts(response.data);
            }
        } catch (err) {
            console.error('Error loading products:', err);
            throw err;
        }
    };

    const loadBranches = async () => {
        try {
            const response = await dispatch(branchAll({ offset: 0, limit: 100 })).unwrap();
            setBranches(response.data || []);
        } catch (err) {
            console.error('Error loading branches:', err);
            throw err;
        }
    };

    const loadSuppliers = async () => {
        try {
            const response = await dispatch(supplierAll({ offset: 0, limit: 100 })).unwrap();
            setSuppliers(response.data || []);
        } catch (err) {
            console.error('Error loading suppliers:', err);
            throw err;
        }
    };

    // Update branch selection handler
    const handleBranchChange = (event) => {
        if (!canEdit) return;
        const newBranchCode = event.target.value;
        setSaveBranch(newBranchCode);
    };

    // Update supplier selection handler
    const handleSupplierChange = (event) => {
        if (!canEdit) return;
        const newSupplierCode = event.target.value;
        setSaveSupplier(newSupplierCode);
    };

    // Update date change handler
    const handleDateChange = (date) => {
        if (!canEdit) return;
        setStartDate(date);
    };

    // Handle product selection from search
    const handleProductSelect = (product) => {
        if (!canEdit) return;

        if (products.some(p => p.product_code === product.product_code)) {
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Product',
                text: `${product.product_name} is already in your purchase order. Please adjust the quantity instead.`,
                confirmButtonColor: '#754C27'
            });
            setSearchTerm('');
            setShowDropdown(false);
            return;
        }

        setSelectedProducts(prev => [...prev, product.product_code]);

        const productCode = product.product_code;
        const initialQuantity = 1;
        const initialUnitCode = product.productUnit1?.unit_code;
        const initialUnitPrice = product.bulk_unit_price;
        const initialAmount = initialQuantity * initialUnitPrice;
        const isTaxable = product.tax1 === 'Y';

        setProducts(prev => [...prev, product]);
        setQuantities(prev => ({ ...prev, [productCode]: initialQuantity }));
        setUnits(prev => ({ ...prev, [productCode]: initialUnitCode }));
        setUnitPrices(prev => ({ ...prev, [productCode]: initialUnitPrice }));
        setTotals(prev => ({ ...prev, [productCode]: initialAmount }));
        setExpiryDates(prev => ({ ...prev, [productCode]: new Date() }));

        if (isTaxable) {
            setTaxableAmount(prev => prev + initialAmount);
        } else {
            setNonTaxableAmount(prev => prev + initialAmount);
        }

        const newTotalAmount = isTaxable ?
            initialAmount * (1 + TAX_RATE) : initialAmount;
        setTotal(prev => prev + newTotalAmount);

        setSearchTerm('');
        setShowDropdown(false);
    };

    // Handle search changes
    const handleSearchChange = async (e) => {
        if (!canEdit) return;

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
                            text: `${selectedProduct.product_name} is already in your purchase order. Please adjust the quantity instead.`,
                            confirmButtonColor: '#754C27'
                        });
                    } else {
                        // Add product if not a duplicate
                        setSelectedProducts(prev => [...prev, selectedProduct.product_code]);

                        const productCode = selectedProduct.product_code;
                        const initialQuantity = 1;
                        const initialUnitCode = selectedProduct.productUnit1?.unit_code;
                        const initialUnitPrice = selectedProduct.bulk_unit_price;
                        const initialAmount = initialQuantity * initialUnitPrice;
                        const isTaxable = selectedProduct.tax1 === 'Y';

                        setProducts(prev => [...prev, selectedProduct]);
                        setQuantities(prev => ({ ...prev, [productCode]: initialQuantity }));
                        setUnits(prev => ({ ...prev, [productCode]: initialUnitCode }));
                        setUnitPrices(prev => ({ ...prev, [productCode]: initialUnitPrice }));
                        setTotals(prev => ({ ...prev, [productCode]: initialAmount }));
                        setExpiryDates(prev => ({ ...prev, [productCode]: new Date() }));

                        if (isTaxable) {
                            setTaxableAmount(prev => prev + initialAmount);
                        } else {
                            setNonTaxableAmount(prev => prev + initialAmount);
                        }

                        const newTotalAmount = isTaxable ?
                            initialAmount * (1 + TAX_RATE) : initialAmount;
                        setTotal(prev => prev + newTotalAmount);
                    }
                    setSearchTerm('');
                    setShowDropdown(false);
                }
            } catch (err) {
                console.error('Error searching products:', err);
            }
        } else if (value.length > 0) {
            try {
                // Filter from already loaded products first for better performance
                const filteredResults = allProducts.filter(product =>
                    product.product_name?.toLowerCase().includes(value.toLowerCase()) ||
                    product.product_code?.toLowerCase().includes(value.toLowerCase())
                );

                if (filteredResults.length > 0) {
                    setSearchResults(filteredResults);
                    setShowDropdown(true);
                } else {
                    // If no local results, try API
                    const response = await dispatch(searchProductName({ product_name: value })).unwrap();
                    if (response.data && response.data.length > 0) {
                        setSearchResults(response.data);
                        setShowDropdown(true);
                    }
                }
            } catch (err) {
                console.error('Error searching products:', err);
            }
        } else {
            setSearchResults([]);
            setShowDropdown(false);
        }
    };

    const calculateProductTotal = (productCode, quantity, price, isTaxable) => {
        const amount = quantity * price;

        setTotals(prev => {
            const newTotals = { ...prev, [productCode]: amount };
            calculateOrderTotals(products, newTotals);
            return newTotals;
        });
    };

    const calculateOrderTotals = (currentProducts, newTotals) => {
        let newTaxable = 0;
        let newNonTaxable = 0;

        currentProducts.forEach(product => {
            const amount = newTotals[product.product_code] || 0;
            if (product.tax1 === 'Y') {
                newTaxable += amount;
            } else {
                newNonTaxable += amount;
            }
        });

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setTotal((newTaxable * (1 + TAX_RATE)) + newNonTaxable);
    };

    const handleQuantityChange = (productCode, value) => {
        if (!canEdit) return;

        const newQuantity = parseInt(value);
        if (isNaN(newQuantity) || newQuantity < 1) return;

        setQuantities(prev => ({ ...prev, [productCode]: newQuantity }));
        const product = products.find(p => p.product_code === productCode);
        calculateProductTotal(
            productCode,
            newQuantity,
            unitPrices[productCode],
            product.tax1 === 'Y'
        );
    };

    // Quantity adjustment function for +/- buttons
    const handleQuantityAdjust = (productCode, delta) => {
        if (!canEdit) return;

        const currentQty = quantities[productCode] || 0;
        const newQty = Math.max(1, currentQty + delta);

        handleQuantityChange(productCode, newQty);
    };

    const handleUnitChange = (productCode, newUnitCode) => {
        if (!canEdit) return;

        const product = products.find(p => p.product_code === productCode);
        const newPrice = newUnitCode === product.productUnit1?.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        setUnits(prev => ({ ...prev, [productCode]: newUnitCode }));
        setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));
        calculateProductTotal(
            productCode,
            quantities[productCode],
            newPrice,
            product.tax1 === 'Y'
        );
    };

    const handleUnitPriceChange = (productCode, value) => {
        if (!canEdit) return;

        const newPrice = parseFloat(value);
        if (!isNaN(newPrice) && newPrice >= 0) {
            setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));
            const product = products.find(p => p.product_code === productCode);
            calculateProductTotal(
                productCode,
                quantities[productCode],
                newPrice,
                product.tax1 === 'Y'
            );
        }
    };

    const handleExpiryDateChange = (productCode, date) => {
        if (!canEdit) return;

        setExpiryDates(prev => ({
            ...prev,
            [productCode]: date
        }));
    };

    const handleDeleteProduct = (productCode) => {
        if (!canEdit) return;

        const product = products.find(p => p.product_code === productCode);
        if (!product) return;

        // Remove from selected products array
        setSelectedProducts(prev => prev.filter(id => id !== productCode));

        const amount = totals[productCode] || 0;

        if (product.tax1 === 'Y') {
            setTaxableAmount(prev => prev - amount);
            setTotal(prev => prev - (amount * (1 + TAX_RATE)));
        } else {
            setNonTaxableAmount(prev => prev - amount);
            setTotal(prev => prev - amount);
        }

        setProducts(prev => prev.filter(p => p.product_code !== productCode));

        // Clean up associated state
        const newQuantities = { ...quantities };
        const newUnits = { ...units };
        const newUnitPrices = { ...unitPrices };
        const newTotals = { ...totals };
        const newExpiryDates = { ...expiryDates };

        delete newQuantities[productCode];
        delete newUnits[productCode];
        delete newUnitPrices[productCode];
        delete newTotals[productCode];
        delete newExpiryDates[productCode];

        setQuantities(newQuantities);
        setUnits(newUnits);
        setUnitPrices(newUnitPrices);
        setTotals(newTotals);
        setExpiryDates(newExpiryDates);
    };

    const handleUpdate = async () => {
        if (!canEdit) {
            Swal.fire({
                icon: 'warning',
                title: 'Cannot Update',
                text: 'This purchase order has been used in a dispatch and cannot be edited.',
                confirmButtonColor: '#754C27'
            });
            return;
        }

        if (!saveBranch || !saveSupplier || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please ensure branch, supplier and at least one product are selected',
                timer: 1500
            });
            return;
        }

        try {
            // Double check that PO can still be edited
            const usageCheck = await dispatch(checkPOUsedInDispatch(editRefno)).unwrap();
            if (!usageCheck.canEdit) {
                setCanEdit(false);
                setIsUsedInDispatch(true);

                Swal.fire({
                    icon: 'warning',
                    title: 'Cannot Update',
                    text: 'This purchase order has been used in a dispatch and cannot be edited.',
                    confirmButtonColor: '#754C27'
                });
                return;
            }

            setIsLoading(true);
            Swal.fire({
                title: 'Updating purchase order...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Prepare updated data
            const headerData = {
                refno: editRefno,
                rdate: format(startDate, 'MM/dd/yyyy'),
                branch_code: saveBranch,
                supplier_code: saveSupplier,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2?.user_code || '',
                taxable: taxableAmount.toString(),
                nontaxable: nonTaxableAmount.toString(),
                total: total.toString()
            };

            const productArrayData = products.map(product => ({
                refno: editRefno,
                product_code: product.product_code,
                qty: (quantities[product.product_code] || 1).toString(),
                unit_code: units[product.product_code] || product.productUnit1?.unit_code || '',
                uprice: (unitPrices[product.product_code] || 0).toString(),
                amt: (totals[product.product_code] || 0).toString(),
                tax1: product.tax1 || 'N',
                expire_date: format(expiryDates[product.product_code] || new Date(), 'MM/dd/yyyy'),
                texpire_date: format(expiryDates[product.product_code] || new Date(), 'yyyyMMdd')
            }));

            // Prepare update data in the format expected by the API
            const updateData = {
                // Top level data
                refno: editRefno,
                rdate: format(startDate, 'MM/dd/yyyy'),
                branch_code: saveBranch,
                supplier_code: saveSupplier,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2?.user_code || '',
                taxable: taxableAmount.toString(),
                nontaxable: nonTaxableAmount.toString(),
                total: total.toString(),

                // Original structure for compatibility
                headerData,
                productArrayData,
                footerData: {
                    total: total.toString(),
                    taxable: taxableAmount.toString(),
                    nontaxable: nonTaxableAmount.toString(),
                }
            };

            console.log('Sending update data:', updateData);

            const result = await dispatch(updateBr_pow(updateData)).unwrap();
            console.log('Update result:', result);

            await Swal.fire({
                icon: 'success',
                title: 'Successfully Updated',
                text: `Purchase order ${editRefno} has been updated`,
                timer: 1500
            });

            onBack();

        } catch (error) {
            console.error('Error updating PO:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to update purchase order',
                confirmButtonColor: '#754C27'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        Swal.fire({
            title: 'Discard Changes',
            text: "Are you sure you want to discard all changes?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#754C27',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, discard changes'
        }).then((result) => {
            if (result.isConfirmed) {
                onBack();
            }
        });
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Button
                onClick={onBack}
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2 }}
            >
                Back to Purchase Orders
            </Button>

            {/* Status Information */}
            {isUsedInDispatch && (
                <Box sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: '#fff3cd',
                    borderRadius: 1,
                    border: '1px solid #ffeeba'
                }}>
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box component="span" sx={{
                            display: 'inline-block',
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: 'error.main',
                            mr: 1
                        }}></Box>
                        This purchase order has been used in a dispatch and cannot be edited.
                    </Typography>
                </Box>
            )}

            <Box sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E4E4E4',
                p: 3,
                opacity: isUsedInDispatch ? 0.8 : 1,
                pointerEvents: isUsedInDispatch ? 'none' : 'auto',
                position: 'relative'
            }}>
                {isUsedInDispatch && (
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: '10px',
                        pointerEvents: 'none'
                    }}>
                        <Typography variant="h5" color="error.main" fontWeight="bold">
                            VIEW ONLY - CANNOT BE EDITED
                        </Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flexBasis: { xs: '100%', md: '48%' } }}>
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
                                },
                            }}
                        />
                    </Box>

                    <Box sx={{ flexBasis: { xs: '100%', md: '48%' } }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Date
                        </Typography>
                        <DatePicker
                            selected={startDate}
                            onChange={handleDateChange}
                            dateFormat="MM/dd/yyyy"
                            customInput={<CustomInput />}
                            disabled={!canEdit}
                        />
                    </Box>

                    <Box sx={{ flexBasis: { xs: '100%', md: '48%' } }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Restaurant
                        </Typography>
                        <Box
                            component="select"
                            value={saveBranch}
                            onChange={handleBranchChange}
                            disabled={!canEdit}
                            sx={{
                                mt: 1,
                                width: '100%',
                                height: '40px',
                                borderRadius: '10px',
                                padding: '0 14px',
                                border: '1px solid rgba(0, 0, 0, 0.23)',
                                fontSize: '16px',
                                cursor: !canEdit ? 'not-allowed' : 'pointer',
                                bgcolor: !canEdit ? '#f5f5f5' : '#fff',
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
                    </Box>

                    <Box sx={{ flexBasis: { xs: '100%', md: '48%' } }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Supplier
                        </Typography>
                        <Box
                            component="select"
                            value={saveSupplier}
                            onChange={handleSupplierChange}
                            disabled={!canEdit}
                            sx={{
                                mt: 1,
                                width: '100%',
                                height: '40px',
                                borderRadius: '10px',
                                padding: '0 14px',
                                border: '1px solid rgba(0, 0, 0, 0.23)',
                                fontSize: '16px',
                                cursor: !canEdit ? 'not-allowed' : 'pointer',
                                bgcolor: !canEdit ? '#f5f5f5' : '#fff',
                                '&:focus': {
                                    outline: 'none',
                                    borderColor: '#754C27',
                                },
                            }}
                        >
                            <option value="">Select Supplier</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.supplier_code} value={supplier.supplier_code}>
                                    {supplier.supplier_name}
                                </option>
                            ))}
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {canEdit && (
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
                )}

                <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>No.</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>Product Code</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>Product Name</th>
                                <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Expiry Date</th>
                                <th style={{ padding: '12px', textAlign: 'right', color: '#754C27', backgroundColor: '#f5f5f5' }}>Quantity</th>
                                <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Unit</th>
                                <th style={{ padding: '12px', textAlign: 'right', color: '#754C27', backgroundColor: '#f5f5f5' }}>Unit Price</th>
                                <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Tax</th>
                                <th style={{ padding: '12px', textAlign: 'right', color: '#754C27', backgroundColor: '#f5f5f5' }}>Total</th>
                                {canEdit && (
                                    <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}></th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={canEdit ? 10 : 9} style={{ textAlign: 'center', padding: '20px' }}>
                                        <Typography>Loading products...</Typography>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={canEdit ? 10 : 9} style={{ textAlign: 'center', padding: '20px' }}>
                                        <Typography color="text.secondary">
                                            No products added. {canEdit ? 'Search and select products above.' : ''}
                                        </Typography>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product, index) => (
                                    <tr key={product.product_code}>
                                        <td style={{ padding: '12px' }}>{index + 1}</td>
                                        <td style={{ padding: '12px' }}>{product.product_code}</td>
                                        <td style={{ padding: '12px' }}>{product.product_name}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <DatePicker
                                                selected={expiryDates[product.product_code]}
                                                onChange={(date) => handleExpiryDateChange(product.product_code, date)}
                                                dateFormat="MM/dd/yyyy"
                                                disabled={!canEdit}
                                                customInput={
                                                    <input
                                                        style={{
                                                            width: '110px',
                                                            padding: '4px',
                                                            textAlign: 'center',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            backgroundColor: !canEdit ? '#f5f5f5' : '#fff',
                                                            cursor: !canEdit ? 'not-allowed' : 'pointer'
                                                        }}
                                                    />
                                                }
                                            />
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <input
                                                type="number"
                                                min="1"
                                                value={quantities[product.product_code] || 1}
                                                onChange={(e) => handleQuantityChange(product.product_code, e.target.value)}
                                                disabled={!canEdit}
                                                style={{
                                                    width: '60px',
                                                    padding: '4px',
                                                    textAlign: 'right',
                                                    backgroundColor: !canEdit ? '#f5f5f5' : '#fff',
                                                    cursor: !canEdit ? 'not-allowed' : 'text'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <select
                                                value={units[product.product_code] || product.productUnit1?.unit_code}
                                                onChange={(e) => handleUnitChange(product.product_code, e.target.value)}
                                                disabled={!canEdit}
                                                style={{
                                                    padding: '4px',
                                                    width: '100px',
                                                    backgroundColor: !canEdit ? '#f5f5f5' : '#fff',
                                                    cursor: !canEdit ? 'not-allowed' : 'pointer'
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
                                        <td style={{ padding: '12px' }}>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={unitPrices[product.product_code] || 0}
                                                onChange={(e) => handleUnitPriceChange(product.product_code, e.target.value)}
                                                disabled={!canEdit}
                                                style={{
                                                    width: '100px',
                                                    padding: '4px',
                                                    textAlign: 'right',
                                                    backgroundColor: !canEdit ? '#f5f5f5' : '#fff',
                                                    cursor: !canEdit ? 'not-allowed' : 'text'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            {product.tax1 === 'Y' ? 'Yes' : 'No'}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            {(totals[product.product_code] || 0).toFixed(2)}
                                        </td>
                                        {canEdit && (
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <IconButton
                                                    onClick={() => handleDeleteProduct(product.product_code)}
                                                    size="small"
                                                    sx={{ color: 'error.main' }}
                                                >
                                                    <CancelIcon />
                                                </IconButton>
                                            </td>
                                        )}
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
                        <Typography>Taxable</Typography>
                        <Typography>${taxableAmount.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography>Non-taxable</Typography>
                        <Typography>${nonTaxableAmount.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h5" fontWeight="bold">Total</Typography>
                        <Typography variant="h5" fontWeight="bold">${total.toFixed(2)}</Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                        onClick={resetForm}
                        variant="outlined"
                        sx={{
                            flex: 1,
                            color: '#754C27',
                            borderColor: '#754C27',
                            '&:hover': {
                                borderColor: '#5A3D1E',
                                backgroundColor: 'rgba(117, 76, 39, 0.04)',
                            },
                            height: '48px'
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleUpdate}
                        variant="contained"
                        disabled={isLoading || !canEdit || products.length === 0}
                        sx={{
                            flex: 2,
                            bgcolor: !canEdit ? '#cccccc' : '#754C27',
                            color: 'white',
                            '&:hover': {
                                bgcolor: !canEdit ? '#cccccc' : '#5A3D1E',
                            },
                            height: '48px'
                        }}
                    >
                        {isLoading ? 'Updating...' : (canEdit ? 'Update Purchase Order' : 'Cannot Update - Used In Dispatch')}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}