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
import { updateBr_saf, getSafByRefno } from '../../../api/restaurant/br_safApi';
import { Br_safdtAlljoindt } from '../../../api/restaurant/br_safdtApi';
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

export default function EditStockAdjustment({ onBack, editRefno }) {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date());
    const [branches, setBranches] = useState([]);
    const [saveBranch, setSaveBranch] = useState('');
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [expiryDates, setExpiryDates] = useState({});
    const [imageErrors, setImageErrors] = useState({});

    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson || "{}");

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                console.log('Fetching data for refno:', editRefno);

                // Load branches
                const branchResponse = await dispatch(branchAll({ offset: 0, limit: 100 })).unwrap();
                if (branchResponse && branchResponse.data) {
                    setBranches(branchResponse.data);
                }

                // Load main stock adjustment data
                if (editRefno) {
                    // ใช้ API getSafByRefno เพื่อดึงข้อมูลเฉพาะรายการที่ต้องการแก้ไข
                    const orderResponse = await dispatch(getSafByRefno(editRefno)).unwrap();

                    if (orderResponse && orderResponse.result && orderResponse.data) {
                        const headerData = orderResponse.data;
                        console.log('Header data for edit:', headerData);

                        setSaveBranch(headerData.branch_code || '');

                        // ดึงวันที่จากข้อมูลที่ได้
                        if (headerData.trdate && headerData.trdate.length === 8) {
                            const year = parseInt(headerData.trdate.substring(0, 4));
                            const month = parseInt(headerData.trdate.substring(4, 6)) - 1;
                            const day = parseInt(headerData.trdate.substring(6, 8));
                            setStartDate(new Date(year, month, day));
                        } else if (headerData.rdate) {
                            // ใช้ฟังก์ชันช่วยในการแปลงวันที่
                            const parsedDate = new Date(headerData.rdate);
                            if (!isNaN(parsedDate.getTime())) {
                                setStartDate(parsedDate);
                            } else {
                                // ถ้าแปลงไม่สำเร็จ ลองวิเคราะห์รูปแบบวันที่ต่างๆ
                                const dateParts = headerData.rdate.split('/');
                                if (dateParts.length === 3) {
                                    const month = parseInt(dateParts[0]) - 1;
                                    const day = parseInt(dateParts[1]);
                                    const year = parseInt(dateParts[2]);
                                    setStartDate(new Date(year, month, day));
                                }
                            }
                        }

                        setTotal(parseFloat(headerData.total) || 0);

                        // Load order details
                        const detailResponse = await dispatch(Br_safdtAlljoindt(editRefno)).unwrap();

                        if (detailResponse && detailResponse.data && detailResponse.data.length > 0) {
                            await processDetailData(detailResponse.data);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load stock adjustment data'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dispatch, editRefno]);

    // Process detail data
    const processDetailData = async (detailData) => {
        try {
            console.log('Processing detail data:', detailData);

            // Set the products array directly from detailData 
            const products = detailData.map(item => ({
                product_code: item.product_code,
                product_name: item.tbl_product?.product_name || item.product_name,
                product_img: item.tbl_product?.product_img,
                productUnit1: item.tbl_product?.productUnit1,
                productUnit2: item.tbl_product?.productUnit2,
                bulk_unit_price: item.tbl_product?.bulk_unit_price || 0,
                retail_unit_price: item.tbl_product?.retail_unit_price || 0
            }));

            // Set all necessary states
            setProducts(products);

            // Prepare other state objects with better error handling
            const newQuantities = {};
            const newUnits = {};
            const newUnitPrices = {};
            const newTotals = {};
            const newExpiryDates = {};

            detailData.forEach((item) => {
                const productCode = item.product_code;
                if (!productCode) return; // Skip items without product code

                newQuantities[productCode] = parseFloat(item.qty) || 1;
                newUnits[productCode] = item.unit_code || item.tbl_product?.productUnit1?.unit_code || '';
                newUnitPrices[productCode] = parseFloat(item.uprice) || 0;
                newTotals[productCode] = parseFloat(item.amt) || 0;

                // Better date parsing
                if (item.texpire_date && item.texpire_date.length === 8) {
                    try {
                        const year = parseInt(item.texpire_date.substring(0, 4));
                        const month = parseInt(item.texpire_date.substring(4, 6)) - 1;
                        const day = parseInt(item.texpire_date.substring(6, 8));
                        newExpiryDates[productCode] = new Date(year, month, day);
                    } catch (e) {
                        console.error("Error parsing texpire_date:", e);
                        newExpiryDates[productCode] = new Date();
                    }
                } else if (item.expire_date) {
                    try {
                        const parsedDate = new Date(item.expire_date);
                        if (!isNaN(parsedDate.getTime())) {
                            newExpiryDates[productCode] = parsedDate;
                        } else {
                            newExpiryDates[productCode] = new Date();
                        }
                    } catch (e) {
                        console.error("Error parsing expire_date:", e);
                        newExpiryDates[productCode] = new Date();
                    }
                } else {
                    newExpiryDates[productCode] = new Date();
                }
            });

            // Update all states at once
            setQuantities(newQuantities);
            setUnits(newUnits);
            setUnitPrices(newUnitPrices);
            setTotals(newTotals);
            setExpiryDates(newExpiryDates);

            // Calculate and set total with better error handling
            const totalSum = Object.values(newTotals).reduce((sum, value) => sum + (isNaN(value) ? 0 : value), 0);
            setTotal(totalSum);

            console.log('Detail Data Processed:', {
                products,
                quantities: newQuantities,
                units: newUnits,
                unitPrices: newUnitPrices,
                totals: newTotals,
                expiryDates: newExpiryDates,
                total: totalSum
            });

        } catch (error) {
            console.error('Error processing detail data:', error);
            throw error;
        }
    };

    // Handle branch change
    const handleBranchChange = (event) => {
        setSaveBranch(event.target.value);
    };

    // Handle date change
    const handleDateChange = (date) => {
        setStartDate(date);
    };

    // Handle search product
    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (e.key === 'Enter' && value.trim() !== '') {
            try {
                const response = await dispatch(searchProductName({ product_name: value })).unwrap();
                if (response.data && response.data.length > 0) {
                    const exactMatch = response.data.find(
                        product => product.product_name.toLowerCase() === value.toLowerCase()
                    );
                    const selectedProduct = exactMatch || response.data[0];

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

    const handleUpdate = async () => {
        if (!saveBranch || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a branch and add at least one product.',
                timer: 1500
            });
            return;
        }

        try {
            setIsLoading(true);
            Swal.fire({
                title: 'Updating adjustment...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const headerData = {
                refno: editRefno,
                rdate: format(startDate, 'MM/dd/yyyy'),
                branch_code: saveBranch,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2.user_code || '',
                total: total.toString()
            };

            const productArrayData = products.map(product => ({
                refno: headerData.refno,
                product_code: product.product_code,
                qty: (quantities[product.product_code] || 1).toString(),
                unit_code: units[product.product_code] || product.productUnit1?.unit_code || '',
                uprice: (unitPrices[product.product_code] || 0).toString(),
                amt: (totals[product.product_code] || 0).toString(),
                expire_date: format(expiryDates[product.product_code] || new Date(), 'MM/dd/yyyy'),
                texpire_date: format(expiryDates[product.product_code] || new Date(), 'yyyyMMdd')
            }));

            const orderData = {
                // ข้อมูลหลักที่จำเป็นสำหรับ controller
                refno: editRefno,
                rdate: format(startDate, 'MM/dd/yyyy'),
                branch_code: saveBranch,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2.user_code || '',
                total: total.toString(),

                // รักษาโครงสร้างเดิมสำหรับความเข้ากันได้
                headerData,
                productArrayData,
                footerData: {
                    total: total.toString()
                }
            };

            // แสดง log ของข้อมูลก่อนส่ง
            console.log('Sending update data:', orderData);

            const result = await dispatch(updateBr_saf(orderData)).unwrap();
            console.log('Update result:', result);

            await Swal.fire({
                icon: 'success',
                title: 'Updated stock adjustment successfully',
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
                text: error.message || 'Error updating stock adjustment',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderProductImage = (product) => {
        if (!product?.product_img) {
            return <span style={{ color: '#999' }}>No image</span>;
        }

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

    const resetForm = () => {
        Swal.fire({
            title: 'Reset Changes',
            text: "Are you sure you want to reset all changes?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, reset!'
        }).then((result) => {
            if (result.isConfirmed) {
                onBack();
            }
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
                <Typography variant="h6">Loading stock adjustment data...</Typography>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={onBack}
                >
                    Back to Stock Adjustments
                </Button>
            </Box>

            {/* Status Information */}
            <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                    <strong>Status:</strong> Editing ref #{editRefno} |
                    Products loaded: {products.length} |
                    Restaurant: {saveBranch || 'None'}
                </Typography>
            </Box>

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
                            value={editRefno}
                            disabled
                            size="small"
                            fullWidth
                            sx={{
                                mt: '8px',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                },
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
                            popperProps={{
                                positionFixed: true,
                                modifiers: {
                                    preventOverflow: {
                                        enabled: true,
                                        escapeWithReference: false,
                                        boundariesElement: 'viewport'
                                    }
                                }
                            }}
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
                                        No products loaded or failed to load product data. Try searching for products above.
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

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                        onClick={resetForm}
                        variant="outlined"
                        sx={{
                            flex: 1,
                            borderColor: '#754C27',
                            color: '#754C27',
                            '&:hover': {
                                borderColor: '#5A3D1E',
                                backgroundColor: 'rgba(117, 76, 39, 0.04)',
                            },
                            height: '48px'
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={handleUpdate}
                        variant="contained"
                        sx={{
                            flex: 2,
                            bgcolor: '#754C27',
                            color: 'white',
                            '&:hover': {
                                bgcolor: '#5A3D1E',
                            },
                            height: '48px'
                        }}
                    >
                        Update
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}