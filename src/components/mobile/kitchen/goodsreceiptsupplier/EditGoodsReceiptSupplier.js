import {
    Box, Button, InputAdornment, TextField, Typography, IconButton,
    Divider, Grid, CircularProgress, Select, MenuItem, TableContainer,
    Table, TableHead, TableRow, TableCell, TableBody, Paper, Card, CardContent,
    Pagination
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { getKtRfsByRefno, updateKt_rfs } from '../../../../api/kitchen/kt_rfsApi';
import { Kt_rfsdtAlljoindt } from '../../../../api/kitchen/kt_rfsdtApi';
import { searchProductName } from '../../../../api/productrecordApi';
import { kitchenAll } from '../../../../api/kitchenApi';
import { supplierAll } from '../../../../api/supplierApi';
import Swal from 'sweetalert2';
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

export default function EditGoodsReceiptSupplier({ onBack, editRefno }) {
    const dispatch = useDispatch();

    // Loading state
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [receiptDate, setReceiptDate] = useState(new Date());
    const [supplierCode, setSupplierCode] = useState('');
    const [kitchenCode, setKitchenCode] = useState('');

    // Data sources
    const [kitchens, setKitchens] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    // Product selection state
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [imageErrors, setImageErrors] = useState({});

    // Pagination state
    const [page, setPage] = useState(1);
    const [productsPerPage] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [paginatedProducts, setPaginatedProducts] = useState([]);

    // Product details state
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [expiryDates, setExpiryDates] = useState({});
    const [temperatures, setTemperatures] = useState({}); // Added for temperature
    const [taxStatus, setTaxStatus] = useState({});
    const [total, setTotal] = useState(0);

    // Get user data
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson || "{}");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                console.log('Fetching data for refno:', editRefno);

                // โหลด kitchens
                const kitchenResponse = await dispatch(kitchenAll({ offset: 0, limit: 100 })).unwrap();
                if (kitchenResponse && kitchenResponse.data) {
                    setKitchens(kitchenResponse.data);
                }

                // โหลด suppliers
                const supplierResponse = await dispatch(supplierAll({ offset: 0, limit: 100 })).unwrap();
                if (supplierResponse && supplierResponse.data) {
                    setSuppliers(supplierResponse.data);
                }

                // โหลด products
                const productsResponse = await dispatch(searchProductName({ product_name: '' })).unwrap();
                if (productsResponse && productsResponse.data) {
                    setAllProducts(productsResponse.data);
                    setFilteredProducts(productsResponse.data);
                }

                if (editRefno) {
                    // ดึงข้อมูลส่วนหัว (header)
                    const receiptResponse = await dispatch(getKtRfsByRefno({ refno: editRefno })).unwrap();
                    console.log('Receipt header data:', receiptResponse);

                    if (receiptResponse.result && receiptResponse.data) {
                        const receiptData = receiptResponse.data;

                        // ตั้งค่าข้อมูลส่วนหัว
                        if (receiptData.trdate && receiptData.trdate.length === 8) {
                            const year = parseInt(receiptData.trdate.substring(0, 4));
                            const month = parseInt(receiptData.trdate.substring(4, 6)) - 1;
                            const day = parseInt(receiptData.trdate.substring(6, 8));
                            setReceiptDate(new Date(year, month, day));
                        } else if (receiptData.rdate) {
                            try {
                                const dateParts = receiptData.rdate.split('/');
                                if (dateParts.length === 3) {
                                    const month = parseInt(dateParts[0]) - 1;
                                    const day = parseInt(dateParts[1]);
                                    const year = parseInt(dateParts[2]);
                                    setReceiptDate(new Date(year, month, day));
                                } else {
                                    setReceiptDate(new Date());
                                }
                            } catch (e) {
                                console.error("Date parsing error:", e);
                                setReceiptDate(new Date());
                            }
                        }

                        setSupplierCode(receiptData.supplier_code || '');
                        setKitchenCode(receiptData.kitchen_code || '');
                        setTotal(parseFloat(receiptData.total) || 0);

                        // ดึงข้อมูลรายละเอียดสินค้า (detail)
                        const detailResponse = await dispatch(Kt_rfsdtAlljoindt({ refno: editRefno })).unwrap();
                        console.log('Receipt product details:', detailResponse);

                        if (detailResponse.result && detailResponse.data && detailResponse.data.length > 0) {
                            const productCodes = [];
                            const productsData = [];
                            const quantitiesData = {};
                            const unitsData = {};
                            const pricesData = {};
                            const totalsData = {};
                            const expiryDatesData = {};
                            const temperaturesData = {};
                            const taxStatusData = {};
                            let totalSum = 0;

                            // แปลงข้อมูลสินค้าทีละรายการ
                            detailResponse.data.forEach(item => {
                                const product = item.tbl_product;
                                if (product) {
                                    productCodes.push(product.product_code);
                                    productsData.push({
                                        product_code: product.product_code,
                                        product_name: product.product_name,
                                        product_img: product.product_img,
                                        bulk_unit_price: product.bulk_unit_price || 0,
                                        retail_unit_price: product.retail_unit_price || 0,
                                        productUnit1: product.productUnit1 || item.tbl_unit,
                                        productUnit2: product.productUnit2,
                                        tax1: product.tax1 || item.tax1 || 'N'
                                    });

                                    quantitiesData[product.product_code] = parseFloat(item.qty) || 1;
                                    unitsData[product.product_code] = item.unit_code || (product.productUnit1 ? product.productUnit1.unit_code : '');
                                    pricesData[product.product_code] = parseFloat(item.uprice) || 0;
                                    temperaturesData[product.product_code] = item.temperature1 || '';
                                    taxStatusData[product.product_code] = item.tax1 || 'N';

                                    const lineTotal = parseFloat(item.amt) ||
                                        (parseFloat(item.qty) * parseFloat(item.uprice));
                                    totalsData[product.product_code] = lineTotal;
                                    totalSum += lineTotal;

                                    // แปลงข้อมูลวันหมดอายุ
                                    if (item.texpire_date && item.texpire_date.length === 8) {
                                        try {
                                            const year = parseInt(item.texpire_date.substring(0, 4));
                                            const month = parseInt(item.texpire_date.substring(4, 6)) - 1;
                                            const day = parseInt(item.texpire_date.substring(6, 8));
                                            expiryDatesData[product.product_code] = new Date(year, month, day);
                                        } catch (e) {
                                            console.error("Error parsing expiry date:", e);
                                            expiryDatesData[product.product_code] = new Date();
                                        }
                                    } else if (item.expire_date) {
                                        try {
                                            const dateParts = item.expire_date.split('/');
                                            if (dateParts.length === 3) {
                                                const month = parseInt(dateParts[0]) - 1;
                                                const day = parseInt(dateParts[1]);
                                                const year = parseInt(dateParts[2]);
                                                expiryDatesData[product.product_code] = new Date(year, month, day);
                                            } else {
                                                expiryDatesData[product.product_code] = new Date();
                                            }
                                        } catch (e) {
                                            console.error("Error parsing expiry date:", e);
                                            expiryDatesData[product.product_code] = new Date();
                                        }
                                    } else {
                                        expiryDatesData[product.product_code] = new Date();
                                    }
                                }
                            });

                            // อัปเดต state ทั้งหมด
                            setSelectedProducts(productCodes);
                            setProducts(productsData);
                            setQuantities(quantitiesData);
                            setUnits(unitsData);
                            setUnitPrices(pricesData);
                            setTotals(totalsData);
                            setExpiryDates(expiryDatesData);
                            setTemperatures(temperaturesData);
                            setTaxStatus(taxStatusData);
                            setTotal(totalSum);

                            console.log('Successfully processed product data:', {
                                products: productsData.length,
                                selectedProducts: productCodes.length,
                                total: totalSum
                            });
                        } else {
                            console.warn('No product details found for refno:', editRefno);
                        }
                    } else {
                        console.error('Failed to fetch receipt header data for refno:', editRefno);
                    }
                }
            } catch (error) {
                console.error("Error fetching receipt data:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load receipt data: ' + (error.message || 'Unknown error'),
                    confirmButtonText: 'OK'
                });
            } finally {
                setIsLoading(false);
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

    // Function to render product image with error handling
    const renderProductImage = (product, size = 'small') => {
        // If no image
        if (!product?.product_img) {
            return (
                <Box sx={{
                    width: size === 'small' ? '100%' : (size === 'table' ? '50px' : 200),
                    height: size === 'small' ? 100 : (size === 'table' ? '50px' : 200),
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
                    width: size === 'small' ? '100%' : (size === 'table' ? '50px' : 200),
                    height: size === 'small' ? 100 : (size === 'table' ? '50px' : 200),
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
                height: size === 'small' ? 100 : (size === 'table' ? '50px' : 200),
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

    // Toggle select product (for grid view)
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

            setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
            setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1?.unit_code || '' }));
            setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price || 0 }));
            setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
            setTemperatures(prev => ({ ...prev, [product.product_code]: '38' }));
            setTaxStatus(prev => ({ ...prev, [product.product_code]: product.tax1 || 'N' }));

            const initialTotal = (product.bulk_unit_price || 0) * 1;
            setTotals(prev => ({ ...prev, [product.product_code]: initialTotal }));
            setTotal(prev => prev + initialTotal);
        }
    };

    // Update quantity
    const handleQuantityChange = (productCode, delta) => {
        const currentQty = quantities[productCode] || 0;
        const newQty = Math.max(1, currentQty + delta);

        setQuantities(prev => ({ ...prev, [productCode]: newQty }));

        // Update total
        const price = unitPrices[productCode];
        const oldTotal = totals[productCode] || 0;
        const newTotal = newQty * price;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(prev => prev - oldTotal + newTotal);
    };

    // Update unit (which affects price)
    const handleUnitChange = (productCode, newUnit) => {
        setUnits(prev => ({ ...prev, [productCode]: newUnit }));

        const product = products.find(p => p.product_code === productCode);
        const newPrice = newUnit === product.productUnit1?.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        // Update price
        const oldPrice = unitPrices[productCode];
        const qty = quantities[productCode];
        const oldTotal = totals[productCode] || 0;

        setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));

        // Update total
        const newTotal = qty * newPrice;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(prev => prev - oldTotal + newTotal);
    };

    // Update expiry date
    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
    };

    // Update temperature
    const handleTemperatureChange = (productCode, value) => {
        setTemperatures(prev => ({ ...prev, [productCode]: value }));
    };

    // Update tax status
    const handleTaxStatusChange = (productCode, value) => {
        setTaxStatus(prev => ({ ...prev, [productCode]: value }));
    };

    // Update price manually
    const handlePriceChange = (productCode, newPrice) => {
        if (newPrice < 0) return;

        const oldPrice = unitPrices[productCode] || 0;
        const qty = quantities[productCode] || 0;
        const oldTotal = totals[productCode] || 0;

        setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));

        // Update total
        const newTotal = qty * newPrice;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(prev => prev - oldTotal + newTotal);
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

    const handleUpdate = async () => {
        // ขั้นตอนการตรวจสอบเบื้องต้น
        if (!supplierCode || !kitchenCode || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a supplier, kitchen, and add at least one product.',
                timer: 1500
            });
            return;
        }

        try {
            setIsLoading(true);

            // แสดง log เพื่อตรวจสอบค่าที่จะส่ง
            console.log('editRefno:', editRefno);
            console.log('Date to update:', receiptDate);
            console.log('Supplier code:', supplierCode);
            console.log('Kitchen code:', kitchenCode);
            console.log('Products to update:', products.length);

            const year = receiptDate.getFullYear();
            const month = String(receiptDate.getMonth() + 1).padStart(2, '0');
            const day = String(receiptDate.getDate()).padStart(2, '0');

            // กำหนดโครงสร้างข้อมูลให้ถูกต้อง
            const productArrayData = products.map(product => {
                const expDate = expiryDates[product.product_code] || new Date();
                const expYear = expDate.getFullYear();
                const expMonth = String(expDate.getMonth() + 1).padStart(2, '0');
                const expDay = String(expDate.getDate()).padStart(2, '0');

                return {
                    refno: editRefno,  // แน่ใจว่ามีการกำหนดค่า refno ทุกครั้ง
                    product_code: product.product_code,
                    qty: (quantities[product.product_code] || 1).toString(),
                    unit_code: units[product.product_code] || '',
                    uprice: (unitPrices[product.product_code] || 0).toString(),
                    amt: (totals[product.product_code] || 0).toString(),
                    expire_date: `${expMonth}/${expDay}/${expYear}`,
                    texpire_date: `${expYear}${expMonth}${expDay}`,
                    tax1: taxStatus[product.product_code] || 'N',
                    temperature1: temperatures[product.product_code] || ''
                };
            });

            // คำนวณค่าอื่นๆ
            const taxableAmount = productArrayData.reduce((sum, product) => {
                if (product.tax1 === 'Y') {
                    return sum + parseFloat(product.amt);
                }
                return sum;
            }, 0);

            const nontaxableAmount = productArrayData.reduce((sum, product) => {
                if (product.tax1 !== 'Y') {
                    return sum + parseFloat(product.amt);
                }
                return sum;
            }, 0);

            const saleTax = taxableAmount * 0.07;

            // สร้างข้อมูลสำหรับส่ง
            const updateData = {
                refno: editRefno,  // ที่สำคัญ: ต้องมี refno
                rdate: `${month}/${day}/${year}`,
                trdate: `${year}${month}${day}`,
                myear: year.toString(),
                monthh: month,
                kitchen_code: kitchenCode,
                supplier_code: supplierCode,
                user_code: userData2?.user_code || '',
                taxable: taxableAmount.toString(),
                nontaxable: nontaxableAmount.toString(),
                total: total.toString(),
                sale_tax: saleTax.toString(),
                total_due: (total + saleTax).toString(),
                instant_saving: '0',
                delivery_surcharge: '0',
                productArrayData: productArrayData
            };

            // Log ข้อมูลที่จะส่ง
            console.log('Sending update data:', updateData);

            // ส่งข้อมูลไปยัง API
            const result = await dispatch(updateKt_rfs(updateData)).unwrap();

            // Log ผลลัพธ์
            console.log('Update result:', result);

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Receipt updated successfully',
                timer: 1500
            });

            onBack();
        } catch (error) {
            console.error('Error updating data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error updating data',
                confirmButtonColor: '#754C27'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form function
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

    // Loading state
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: '#754C27' }} />
                <Typography sx={{ ml: 2 }}>Loading receipt data...</Typography>
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
                    Back to Goods Receipt From Supplier
                </Button>
            </Box>

            {/* Status Information */}
            <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                    <strong>Status:</strong> Editing ref #{editRefno} |
                    Products selected: {selectedProducts.length} |
                    Products loaded: {products.length} |
                    Kitchen: {kitchenCode || 'None'} |
                    Supplier: {supplierCode || 'None'} |
                    Total: ${total.toFixed(2)}
                </Typography>
            </Box>

            {/* Main content */}
            <Box display="flex" p={2} bgcolor="#F9F9F9">
                {/* Left Panel - Product Selection */}
                <Box flex={2} pr={2} display="flex" flexDirection="column">
                    {/* Search Section */}
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
                        />
                    </Box>
                </Box>

                {/* Right Panel - Receipt Details */}
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
                        selected={receiptDate}
                        onChange={(date) => setReceiptDate(date)}
                        dateFormat="MM/dd/yyyy"
                        customInput={<CustomInput />}
                    />

                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
                        Supplier
                    </Typography>
                    <Select
                        value={supplierCode}
                        onChange={(e) => setSupplierCode(e.target.value)}
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

                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
                        Kitchen
                    </Typography>
                    <Select
                        value={kitchenCode}
                        onChange={(e) => setKitchenCode(e.target.value)}
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
                        <Typography variant="h6" color="#754C27">Edit Receipt</Typography>
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
                                    <TableCell>Image</TableCell>
                                    <TableCell>Product Name</TableCell>
                                    <TableCell>Expiry Date</TableCell>
                                    <TableCell>Temp</TableCell>
                                    <TableCell>Tax</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Unit</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : (!products || products.length === 0) ? (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center">
                                            <Typography color="text.secondary">
                                                No products selected. Please select products from the left panel.
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
                                                <TextField
                                                    value={taxStatus[product.product_code] || "N"}
                                                    onChange={(e) => handleTaxStatusChange(product.product_code, e.target.value)}
                                                    size="small"
                                                    sx={{ minWidth: 60 }}
                                                    disabled
                                                >
                                                    <MenuItem value="Y">Yes</MenuItem>
                                                    <MenuItem value="N">No</MenuItem>
                                                </TextField>
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

                    {/* Order Summary */}
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

                    {/* Update Button */}
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
                        Update Receipt
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}