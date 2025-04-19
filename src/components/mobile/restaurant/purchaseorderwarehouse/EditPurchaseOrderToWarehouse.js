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
import { Br_powAlljoindt, updateBr_pow, getPowByRefno, checkPOUsedInDispatch } from '../../../../api/restaurant/br_powApi';
import { Br_powdtAlljoindt } from '../../../../api/restaurant/br_powdtApi';
import { branchAll } from '../../../../api/branchApi';
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

export default function EditPurchaseOrderToWarehouse({ onBack, editRefno }) {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const [debugInfo, setDebugInfo] = useState({});
    const [startDate, setStartDate] = useState(new Date());
    const [saveSupplier, setSaveSupplier] = useState('-');
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
    const [imageErrors, setImageErrors] = useState({});
    const [branches, setBranches] = useState([]);

    // เพิ่มสถานะใหม่สำหรับตรวจสอบว่าสามารถแก้ไขได้หรือไม่
    const [canEdit, setCanEdit] = useState(true);
    const [isUsedInDispatch, setIsUsedInDispatch] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const [productsPerPage] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [paginatedProducts, setPaginatedProducts] = useState([]);

    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson || "{}");

    // Helper function to parse date from different formats
    const parseDateSafely = (dateString) => {
        if (!dateString) return new Date();

        console.log("Attempting to parse date:", dateString);

        try {
            // ลองแปลงตามรูปแบบต่างๆ
            const formats = [
                'MM/dd/yyyy', // US format
                'dd/MM/yyyy', // Thai/UK format
                'yyyy-MM-dd', // ISO format
                'yyyy/MM/dd',
                'MM-dd-yyyy',
                'dd-MM-yyyy',
                'yyyyMMdd'    // Compact format
            ];

            // ถ้าเป็นรูปแบบ yyyyMMdd (เช่น 20240321)
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

            // ลองแปลงตามรูปแบบต่างๆที่กำหนด
            for (const format of formats) {
                try {
                    const parsed = parse(dateString, format, new Date());
                    if (!isNaN(parsed.getTime())) {
                        console.log(`Successfully parsed as ${format}:`, parsed);
                        return parsed;
                    }
                } catch (e) {
                    // ลองรูปแบบถัดไป
                }
            }

            // ถ้าล้มเหลวทุกรูปแบบ ลองใช้ Date constructor
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
        const fetchData = async () => {
            try {
                setIsLoading(true);
                console.log('Fetching data for refno:', editRefno);

                // เรียกใช้ API ใหม่เพื่อตรวจสอบการใช้ใน dispatch
                if (editRefno) {
                    try {
                        const usageCheck = await dispatch(checkPOUsedInDispatch(editRefno)).unwrap();
                        console.log('PO usage check result:', usageCheck);

                        if (!usageCheck.canEdit) {
                            setCanEdit(false);
                            setIsUsedInDispatch(true);

                            // แสดง popup แจ้งเตือนว่าไม่สามารถแก้ไขได้ แต่ไม่ redirect กลับ
                            Swal.fire({
                                icon: 'warning',
                                title: 'This Purchase Order Cannot Be Updated',
                                text: 'This purchase order has already been used in a dispatch. You can view the details but cannot update it.',
                                confirmButtonColor: '#754C27'
                            });

                            // ไม่ต้อง return เพื่อให้โหลดข้อมูลต่อไป
                        }
                    } catch (error) {
                        console.error('Error checking PO usage:', error);
                        // ถ้าเกิดข้อผิดพลาด ยังคงให้แก้ไขได้ แต่บันทึก log ไว้
                    }
                }

                // โหลดข้อมูลอื่นๆ เหมือนเดิม
                const branchResponse = await dispatch(branchAll({ offset: 0, limit: 100 })).unwrap();
                if (branchResponse && branchResponse.data) {
                    setBranches(branchResponse.data);
                }

                // Load all products for catalog
                const productsResponse = await dispatch(searchProductName({ product_name: '' })).unwrap();
                if (productsResponse && productsResponse.data) {
                    setAllProducts(productsResponse.data);
                    setFilteredProducts(productsResponse.data);
                }

                // ใช้ API ใหม่เพื่อดึงข้อมูลเฉพาะรายการที่ต้องการแก้ไข
                if (editRefno) {
                    // 1. ดึงข้อมูลหลักของรายการ
                    const orderResponse = await dispatch(getPowByRefno(editRefno)).unwrap();

                    if (orderResponse && orderResponse.result && orderResponse.data) {
                        const headerData = orderResponse.data;
                        console.log('Header data for edit:', headerData);

                        setSaveSupplier('-'); // Always set to default value
                        setSaveBranch(headerData.branch_code || '');

                        // ดึงวันที่จาก headerData ที่ได้
                        if (headerData.rdate) {
                            console.log('Using rdate from API:', headerData.rdate);
                            const parsedDate = parseDateSafely(headerData.rdate);
                            setStartDate(parsedDate);
                        }

                        setTotal(parseFloat(headerData.total) || 0);

                        // 2. ดึงรายละเอียดรายการสินค้า
                        const detailResponse = await dispatch(Br_powdtAlljoindt(editRefno)).unwrap();

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
                    text: 'Failed to load purchase order data'
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
            // Set selected product codes first
            const productCodes = detailData.map(item => item.product_code);
            setSelectedProducts(productCodes);

            // Then set the products array directly from detailData 
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

            // Set all necessary states
            setProducts(products);

            // Prepare other state objects
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

            // Update all states at once
            setQuantities(newQuantities);
            setUnits(newUnits);
            setUnitPrices(newUnitPrices);
            setTotals(newTotals);
            setExpiryDates(newExpiryDates);

            // Calculate and set total
            const totalSum = Object.values(newTotals).reduce((sum, value) => sum + value, 0);
            setTotal(totalSum);

            // Log for debugging
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

    // Handle filtering and pagination
    useEffect(() => {
        if (allProducts.length === 0) return;

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

    const toggleSelectProduct = (product) => {
        const isSelected = selectedProducts.includes(product.product_code);

        if (isSelected) {
            setSelectedProducts(prev => prev.filter(id => id !== product.product_code));
            setProducts(prev => prev.filter(p => p.product_code !== product.product_code));

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
            setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1?.unit_code || '' }));
            setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price || 0 }));
            setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));

            const initialTotal = (product.bulk_unit_price || 0) * 1;
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
            ? (product.bulk_unit_price || 0)
            : (product.retail_unit_price || 0);

        setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));

        const qty = quantities[productCode] || 0;
        const newTotal = qty * newPrice;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(Object.values({ ...totals, [productCode]: newTotal }).reduce((a, b) => a + b, 0));
    };

    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
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

        if (products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please add at least one product.',
                timer: 1500
            });
            return;
        }

        try {
            // ตรวจสอบอีกครั้งก่อนบันทึก (double check)
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

            Swal.fire({
                title: 'Updating purchase order...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Calculate tax and nontaxable amounts
            const tax = calculateTax();
            const nontaxable = total - tax;

            // Prepare data for API
            const orderData = {
                // Top level data for the controller
                refno: editRefno,
                rdate: format(startDate, 'MM/dd/yyyy'),
                supplier_code: "-",
                branch_code: saveBranch,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2.user_code || '',
                taxable: tax.toString(),
                nontaxable: nontaxable.toString(),
                total: total.toString(),

                // Keep original structure for compatibility
                headerData: {
                    refno: editRefno,
                    rdate: format(startDate, 'MM/dd/yyyy'),
                    supplier_code: "-",
                    branch_code: saveBranch,
                    trdate: format(startDate, 'yyyyMMdd'),
                    monthh: format(startDate, 'MM'),
                    myear: startDate.getFullYear(),
                    user_code: userData2.user_code || '',
                    taxable: tax.toString(),
                    nontaxable: nontaxable.toString()
                },
                productArrayData: products.map(product => ({
                    refno: editRefno,
                    product_code: product.product_code,
                    qty: (quantities[product.product_code] || 1).toString(),
                    unit_code: units[product.product_code] || product.productUnit1?.unit_code || '',
                    uprice: (unitPrices[product.product_code] || 0).toString(),
                    amt: (totals[product.product_code] || 0).toString(),
                    tax1: product.tax1 || 'N', // Default to 'N' if not specified
                    expire_date: format(expiryDates[product.product_code] || new Date(), 'MM/dd/yyyy'),
                    texpire_date: format(expiryDates[product.product_code] || new Date(), 'yyyyMMdd')
                })),
                footerData: {
                    total: total.toString()
                }
            };

            // Log the data being sent
            console.log('Sending update data:', orderData);

            const result = await dispatch(updateBr_pow(orderData)).unwrap();
            console.log('Update result:', result);

            await Swal.fire({
                icon: 'success',
                title: 'Updated purchase order successfully',
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
                text: error.message || 'Error updating purchase order',
                confirmButtonText: 'OK'
            });
        }
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

    const renderProductImage = (product, size = 'small') => {
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
                <Typography variant="h6">Loading purchase order data...</Typography>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: "10px", paddingBottom: "300px", fontFamily: "Arial, sans-serif" }}>
            <style>
                {`
                .react-datepicker-popper {
                    z-index: 9999 !important;
                }
            `}
            </style>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={onBack}
                >
                    Back to Purchase Orders
                </Button>
            </Box>

            {/* Status Information */}
            <Box sx={{ mb: 2, p: 2, bgcolor: isUsedInDispatch ? '#fff3cd' : '#f5f5f5', borderRadius: 1, border: isUsedInDispatch ? '1px solid #ffeeba' : 'none' }}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    <strong>Status:</strong>&nbsp;Editing ref #{editRefno} |
                    Restaurant: {saveBranch} |
                    Products selected: {selectedProducts.length}

                    {isUsedInDispatch && (
                        <Box component="span" sx={{
                            ml: 2,
                            color: 'error.main',
                            fontWeight: 'bold',
                            bgcolor: 'error.light',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            display: 'inline-flex',
                            alignItems: 'center'
                        }}>
                            <Box component="span" sx={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main', mr: 1 }}></Box>
                            LOCKED - USED IN DISPATCH
                        </Box>
                    )}
                </Typography>
            </Box>

            {/* Main content */}
            <Box display="flex" p={2} bgcolor="#F9F9F9" borderRadius="12px" boxShadow={1}>
                {/* Left Panel - Product Selection */}
                <Box flex={2} pr={2} display="flex" flexDirection="column">
                    {/* Search Section */}
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
                            );
                        })}
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

                        <Grid item xs={12} sx={{ position: 'relative', zIndex: 9999 }}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                                Date
                            </Typography>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
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
                            <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                                Restaurant
                            </Typography>
                            <Select
                                value={saveBranch}
                                onChange={(e) => setSaveBranch(e.target.value)}
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
                    </Grid>

                    <Divider sx={{ my: 3 }} />

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
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : (!products || products.length === 0) ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">
                                                No products selected or failed to load product data.
                                                Click on products to add them to your order.
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
                                                <Typography variant="body2" fontWeight="bold">
                                                    {product.product_name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {product.product_code}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ zIndex: 1001 }}>
                                                <DatePicker
                                                    selected={expiryDates[product.product_code] || new Date()}
                                                    onChange={(date) => handleExpiryDateChange(product.product_code, date)}
                                                    dateFormat="MM/dd/yyyy"
                                                    customInput={<CustomInput />}
                                                    popperPlacement="auto"
                                                    popperModifiers={{
                                                        preventOverflow: {
                                                            enabled: true,
                                                        },
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
                                                    <Typography sx={{ mx: 1 }}>
                                                        {quantities[product.product_code] || 0}
                                                    </Typography>
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
                    </Box>



                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleUpdate}
                        disabled={!canEdit || products.length === 0}
                        sx={{
                            mt: 2,
                            bgcolor: !canEdit ? '#cccccc' : '#754C27',
                            color: '#FFFFFF',
                            height: '48px',
                            '&:hover': {
                                bgcolor: !canEdit ? '#cccccc' : '#5c3c1f',
                            }
                        }}
                    >
                        {!canEdit ? 'Cannot Update - Used In Dispatch' : 'Update'}
                    </Button>

                    {/* ข้อความเตือนด้านล่างปุ่ม */}
                    {!canEdit && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
                            <Typography variant="body2" color="error.dark">
                                This purchase order has been used in a dispatch and cannot be edited.
                                You can view the details but cannot make changes to it.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}