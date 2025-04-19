import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    Divider,
    InputAdornment,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Select,
    MenuItem,
    Pagination,
    Card,
    CardContent,
    Paper,
    Grid,
    CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel'; // Added for consistency with POW
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../api/productrecordApi';
import { kitchenAll } from '../../../api/kitchenApi';
import { addKt_trw, Kt_trwrefno } from '../../../api/kitchen/kt_trwApi';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
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

export default function CreateTransferWithdrawal({ onBack }) {
    const dispatch = useDispatch();

    // Loading state
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRefNo, setIsLoadingRefNo] = useState(false);

    // Form state
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('');
    const [saveKitchen, setSaveKitchen] = useState('');

    // Data sources
    const [kitchens, setKitchens] = useState([]);

    // Product selection state
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    // Grid view product states
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
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
    const [temperatures, setTemperatures] = useState({});
    const [imageErrors, setImageErrors] = useState({});
    const [total, setTotal] = useState(0);

    // Get user data
    const userDataJson = localStorage.getItem("userData2");
    const userData2 = userDataJson ? JSON.parse(userDataJson) : null;

    // Load initial data
    useEffect(() => {
        setIsLoading(true);
        const loadInitialData = async () => {
            try {
                // Fetch kitchens
                const kitchensResponse = await dispatch(kitchenAll({ offset: 0, limit: 100 })).unwrap();
                if (kitchensResponse?.data) {
                    setKitchens(kitchensResponse.data);
                }

                // Initial product load for grid view
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

    // Handle filtering and pagination for grid view
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

        // For dropdown search results
        if (searchTerm.length > 0) {
            setSearchResults(filtered.slice(0, 10)); // Show top 10 results
            setShowDropdown(filtered.length > 0);
        } else {
            setShowDropdown(false);
        }

        // Reset page when filter changes
        setPage(1);
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

            // จัดรูปแบบข้อมูลวันที่
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);
            const kitchenPrefix = selectedKitchen.substring(0, 3).toUpperCase();

            // สร้าง prefix พื้นฐาน
            const prefix = `KTTRW${kitchenPrefix}${year}${month}`;

            console.log(`Generating reference number with prefix: ${prefix}`);
            console.log(`Selected kitchen: ${selectedKitchen}, type: ${typeof selectedKitchen}`);

            // ดึงเลขอ้างอิงล่าสุดจากฐานข้อมูลสำหรับ kitchen ที่เฉพาะเจาะจง
            const res = await dispatch(Kt_trwrefno({
                kitchen_code: selectedKitchen,
                month,
                year
            })).unwrap();

            // แสดงข้อมูลการแก้ไขปัญหา
            console.log("API response:", res);

            if (res.debug) {
                console.log("Debug info:", res.debug);
            }

            // หากไม่มีเลขอ้างอิงสำหรับ kitchen/month/year นี้ ให้เริ่มที่ 001
            if (!res.data || !res.data.refno) {
                console.log(`No existing reference number found for ${prefix}, starting with 001`);
                setLastRefNo(`${prefix}001`);
                return;
            }

            const lastRefNo = res.data.refno;
            console.log(`Found existing reference number: ${lastRefNo}`);

            // ตรวจสอบว่าเลขอ้างอิงที่พบตรงกับรูปแบบที่คาดหวังหรือไม่
            const expectedPattern = new RegExp(`^KTTRW${kitchenPrefix}${year}${month}\\d{3}$`);

            if (lastRefNo && expectedPattern.test(lastRefNo)) {
                try {
                    // แยกส่วนตัวเลข (3 ตัวสุดท้าย) และตรวจสอบว่าเป็นตัวเลขหรือไม่
                    const lastThreeDigits = lastRefNo.slice(-3);
                    const lastNumber = parseInt(lastThreeDigits, 10);

                    console.log(`Last reference number parsed: ${lastNumber} from ${lastThreeDigits}`);

                    // ตรวจสอบว่าการแปลงเป็นตัวเลขสำเร็จหรือไม่
                    if (isNaN(lastNumber)) {
                        console.warn(`Could not parse number from ${lastRefNo}, defaulting to 001`);
                        setLastRefNo(`${prefix}001`);
                        return;
                    }

                    // เพิ่มตัวเลขขึ้น 1 และเติม 0 ข้างหน้าให้ครบ 3 หลัก
                    const newNumber = lastNumber + 1;
                    const newRefNo = `${prefix}${String(newNumber).padStart(3, '0')}`;
                    console.log(`Generated new reference number: ${newRefNo}`);
                    setLastRefNo(newRefNo);
                } catch (parseError) {
                    console.error("Error parsing reference number:", parseError);
                    setLastRefNo(`${prefix}001`);
                }
            } else {
                // หากรูปแบบไม่ตรงกัน ให้เริ่มที่ 001
                console.log(`Pattern mismatch: ${lastRefNo} doesn't match expected pattern, starting with 001`);
                setLastRefNo(`${prefix}001`);
            }
        } catch (err) {
            console.error("Error generating refno:", err);

            // ใช้เลขอ้างอิงแบบพื้นฐานหากเกิดข้อผิดพลาด
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);
            const kitchenPrefix = selectedKitchen.substring(0, 3).toUpperCase();
            const fallbackRefNo = `KTTRW${kitchenPrefix}${year}${month}001`;

            console.log(`Using fallback reference number: ${fallbackRefNo}`);
            setLastRefNo(fallbackRefNo);
        } finally {
            setIsLoadingRefNo(false);
        }
    };

    // Handle kitchen change
    const handleKitchenChange = (e) => {
        const newKitchenCode = e.target.value;
        setSaveKitchen(newKitchenCode);

        // Generate reference number when kitchen is selected
        if (newKitchenCode) {
            handleGetLastRefNo(newKitchenCode, startDate);
        } else {
            setLastRefNo('');
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

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
    };

    // Handle search with Enter key
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchTerm.trim() !== '') {
            searchProduct(searchTerm);
        }
    };

    // Search product by name or code
    const searchProduct = async (term) => {
        try {
            const response = await dispatch(searchProductName({ product_name: term })).unwrap();
            if (response.data && response.data.length > 0) {
                // Find exact match or use the first result
                const exactMatch = response.data.find(
                    product => product.product_name.toLowerCase() === term.toLowerCase() ||
                        product.product_code.toLowerCase() === term.toLowerCase()
                );
                const selectedProduct = exactMatch || response.data[0];

                // Handle product selection with duplicate check
                handleProductSelect(selectedProduct);
                setSearchTerm('');
                setShowDropdown(false);
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Product Not Found',
                    text: 'No products found matching your search.',
                    confirmButtonColor: '#754C27'
                });
            }
        } catch (err) {
            console.error('Error searching products:', err);
            Swal.fire({
                icon: 'error',
                title: 'Search Error',
                text: err.message || 'Failed to search products',
                confirmButtonColor: '#754C27'
            });
        }
    };

    // Function to render product image
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

    // Toggle product selection from grid view
    const toggleSelectProduct = (product) => {
        const isSelected = selectedProducts.includes(product.product_code);

        if (isSelected) {
            // Remove the product
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

            // Recalculate total
            setTotal(Object.values(newTotals).reduce((sum, curr) => sum + curr, 0));
        } else {
            // Add the product if it doesn't already exist
            if (products.some(p => p.product_code === product.product_code)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Duplicate Product',
                    text: `${product.product_name} is already in your transfer order.`,
                    timer: 1500
                });
                return;
            }

            // Add product
            setSelectedProducts(prev => [...prev, product.product_code]);
            setProducts(prev => [...prev, product]);

            // Initialize associated state
            setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
            setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1?.unit_code || '' }));
            setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price || 0 }));
            setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
            setTemperatures(prev => ({ ...prev, [product.product_code]: "38" }));

            // Calculate initial total
            const initialTotal = (product.bulk_unit_price || 0) * 1;
            setTotals(prev => ({ ...prev, [product.product_code]: initialTotal }));
            setTotal(prev => prev + initialTotal);
        }
    };

    // Handle product selection from search dropdown
    const handleProductSelect = (product) => {
        // Check if product already exists in the list
        if (products.some(p => p.product_code === product.product_code) ||
            selectedProducts.includes(product.product_code)) {
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Product',
                text: `${product.product_name} is already in your transfer order. Please adjust the quantity instead.`,
                confirmButtonColor: '#754C27'
            });
            setSearchTerm('');
            setShowDropdown(false);
            return;
        }

        setSearchTerm('');
        setShowDropdown(false);

        // Add product
        setSelectedProducts(prev => [...prev, product.product_code]);
        setProducts(prevProducts => [...prevProducts, product]);

        // Initialize associated state
        setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
        setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1?.unit_code || '' }));
        setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price || 0 }));
        setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
        setTemperatures(prev => ({ ...prev, [product.product_code]: "38" }));

        // Calculate initial total
        const initialTotal = (product.bulk_unit_price || 0) * 1;
        setTotals(prev => ({ ...prev, [product.product_code]: initialTotal }));
        setTotal(prev => prev + initialTotal);
    };

    // Handle delete product
    const handleDeleteProduct = (productCode) => {
        setSelectedProducts(prev => prev.filter(id => id !== productCode));
        setProducts(prev => prev.filter(p => p.product_code !== productCode));

        // Clean up associated state
        const { [productCode]: qtyToRemove, ...newQuantities } = quantities;
        const { [productCode]: _, ...newUnits } = units;
        const { [productCode]: __, ...newUnitPrices } = unitPrices;
        const { [productCode]: totalToRemove, ...newTotals } = totals;
        const { [productCode]: ___, ...newExpiryDates } = expiryDates;
        const { [productCode]: ____, ...newTemperatures } = temperatures;

        setQuantities(newQuantities);
        setUnits(newUnits);
        setUnitPrices(newUnitPrices);
        setTotals(newTotals);
        setExpiryDates(newExpiryDates);
        setTemperatures(newTemperatures);

        setTotal(prev => prev - (totalToRemove || 0));
    };

    // Handle quantity change with +/- buttons
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

    // Handle direct quantity input
    const handleQuantityInput = (productCode, value) => {
        const newValue = parseInt(value);
        if (isNaN(newValue) || newValue < 1) return;

        setQuantities(prev => ({
            ...prev,
            [productCode]: newValue
        }));

        const unitPrice = unitPrices[productCode] || 0;
        const newTotal = newValue * unitPrice;

        setTotals(prev => ({
            ...prev,
            [productCode]: newTotal
        }));

        // Recalculate total
        calculateOrderTotal();
    };

    // Calculate total for the entire order
    const calculateOrderTotal = () => {
        const newTotal = Object.values(totals).reduce((sum, current) => sum + current, 0);
        setTotal(newTotal);
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
        const newTotal = qty * newPrice;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));

        // Recalculate total
        calculateOrderTotal();
    };

    // Handle expiry date change
    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
    };

    // Handle temperature change
    const handleTemperatureChange = (productCode, value) => {
        setTemperatures(prev => ({ ...prev, [productCode]: value }));
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
        setSearchTerm('');
        setExpiryDates({});
        setTemperatures({});
        // Don't reset kitchen and date to improve UX
    };

    // Handle form submission
    const handleSave = async () => {
        // Validate form
        if (!saveKitchen || products.length === 0 || !lastRefNo) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a kitchen and at least one product.',
                timer: 2000,
                confirmButtonColor: '#754C27'
            });
            return;
        }

        try {
            setIsLoading(true);

            Swal.fire({
                title: 'Saving transfer withdrawal...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Calculate taxable and non-taxable amounts
            let taxableAmount = 0;
            let nontaxableAmount = 0;

            products.forEach(product => {
                const productCode = product.product_code;
                const quantity = quantities[productCode] || 0;
                const unitPrice = unitPrices[productCode] || 0;
                const lineTotal = quantity * unitPrice;

                if (product.tax1 === 'Y') {
                    taxableAmount += lineTotal;
                } else {
                    nontaxableAmount += lineTotal;
                }
            });

            const saleTax = taxableAmount * 0.07;

            // Prepare header data
            const headerData = {
                refno: lastRefNo,
                rdate: format(startDate, 'MM/dd/yyyy'),
                kitchen_code: saveKitchen,
                trdate: format(startDate, 'yyyyMMdd'),
                monthh: format(startDate, 'MM'),
                myear: startDate.getFullYear(),
                user_code: userData2?.user_code || ''
            };

            // Prepare product data
            const productArrayData = products.map(product => ({
                refno: headerData.refno,
                product_code: product.product_code,
                qty: quantities[product.product_code] || 1,
                unit_code: units[product.product_code] || product.productUnit1?.unit_code || '',
                uprice: unitPrices[product.product_code] || 0,
                amt: totals[product.product_code] || 0,
                expire_date: format(expiryDates[product.product_code], 'MM/dd/yyyy'),
                texpire_date: format(expiryDates[product.product_code], 'yyyyMMdd'),
                tax1: product.tax1 || 'N',
                temperature1: temperatures[product.product_code] || ''
            }));

            // Prepare order data
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

            // Submit the data
            const result = await dispatch(addKt_trw(orderData)).unwrap();

            if (result.result) {
                // Show success message
                await Swal.fire({
                    icon: 'success',
                    title: 'Created transfer withdrawal successfully',
                    text: `Reference No: ${lastRefNo}`,
                    confirmButtonColor: '#754C27',
                    timer: 2000
                });

                resetForm();
                onBack();
            }
        } catch (error) {
            console.error("API error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error saving transfer withdrawal',
                confirmButtonColor: '#754C27'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle pagination
    const handlePageChange = (event, value) => {
        setPage(value);
    };

    if (isLoading && !products.length) {
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
        <Box sx={{ width: '100%' }}>
            {/* Back button */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                sx={{ mb: 2 }}
            >
                Back to Transfer Withdrawal
            </Button>

            {/* Main content */}
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
                    {/* Reference Number */}
                    <Grid item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Ref.no
                        </Typography>
                        <TextField
                            value={isLoadingRefNo ? "Generating..." : (lastRefNo || "Please select kitchen first")}
                            disabled
                            size="small"
                            fullWidth
                            sx={{
                                mt: 1,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    fontWeight: '700'
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

                    {/* Date */}
                    <Grid item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Date
                        </Typography>
                        <DatePicker
                            selected={startDate}
                            onChange={handleDateChange}
                            dateFormat="MM/dd/yyyy"
                            customInput={<CustomInput />}
                        />
                    </Grid>

                    {/* Kitchen Selection */}
                    <Grid item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Commissary Kitchen
                        </Typography>
                        <Box
                            component="select"
                            value={saveKitchen}
                            onChange={handleKitchenChange}
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
                            <option value="">Select Kitchen</option>
                            {kitchens.map((kitchen) => (
                                <option key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                                    {kitchen.kitchen_name}
                                </option>
                            ))}
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Product Search Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontSize: '20px', fontWeight: '600' }}>
                        Current Order
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', ml: 4 }}>
                        <Typography sx={{ mr: 2 }}>
                            Product Search
                        </Typography>
                        <Box sx={{ position: 'relative', flex: 1 }}>
                            <TextField
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onKeyDown={handleSearchKeyDown}
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
                                            <Typography variant="caption" color="text.secondary">{product.product_code}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Order Table */}
                <TableContainer sx={{
                    maxHeight: '400px',
                    overflow: 'auto',
                    boxShadow: 'none',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    mb: 3
                }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
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
                                        No products added yet. Search and add products to your order.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product, index) => (
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
                                            <TextField
                                                value={temperatures[product.product_code] || ""}
                                                onChange={(e) => handleTemperatureChange(product.product_code, e.target.value)}
                                                placeholder="Temperature"
                                                size="small"
                                                sx={{ width: 100 }}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">°C</InputAdornment>,
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
                                                <TextField
                                                    type="number"
                                                    value={quantities[product.product_code] || 1}
                                                    onChange={(e) => handleQuantityInput(product.product_code, e.target.value)}
                                                    size="small"
                                                    inputProps={{ min: 1, style: { textAlign: 'center' } }}
                                                    sx={{ width: 60, mx: 1 }}
                                                />
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
                                                value={units[product.product_code] || product.productUnit1?.unit_code || ''}
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
                                        <TableCell>${(unitPrices[product.product_code] || 0).toFixed(2)}</TableCell>
                                        <TableCell>${(totals[product.product_code] || 0).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleDeleteProduct(product.product_code)}
                                                color="error"
                                                size="small"
                                            >
                                                <CancelIcon />
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Typography variant="h5">Total</Typography>
                        <Typography variant="h5">${total.toFixed(2)}</Typography>
                    </Box>
                </Box>

                {/* Save Button */}
                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSave}
                    disabled={isLoading || !lastRefNo || products.length === 0}
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
    );
}