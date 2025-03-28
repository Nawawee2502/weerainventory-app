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
import { branchAll } from '../../../../api/branchApi';
import { supplierAll } from '../../../../api/supplierApi';
import { updateBr_rfs, getRfsByRefno } from '../../../../api/restaurant/br_rfsApi';
import { Br_rfsdtAlljoindt } from '../../../../api/restaurant/br_rfsdtApi';
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

export default function EditGoodsReceiptSupplier({ onBack, editRefno }) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({});
  const [startDate, setStartDate] = useState(new Date());
  const [branches, setBranches] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [saveBranch, setSaveBranch] = useState('');
  const [saveSupplier, setSaveSupplier] = useState('');
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
  // Tax and temperature states
  const [tax1Values, setTax1Values] = useState({});
  const [temperatures, setTemperatures] = useState({});

  // Pagination state
  const [page, setPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedProducts, setPaginatedProducts] = useState([]);

  const userDataJson = localStorage.getItem("userData2");
  const userData2 = JSON.parse(userDataJson || "{}");

  // ในส่วน useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching data for refno:', editRefno);

        // โหลด suppliers และ branches
        const [branchResponse, supplierResponse] = await Promise.all([
          dispatch(branchAll({ offset: 0, limit: 100 })).unwrap(),
          dispatch(supplierAll({ offset: 0, limit: 100 })).unwrap()
        ]);

        if (branchResponse && branchResponse.data) {
          setBranches(branchResponse.data);
        }

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
          // ใช้ API ใหม่เพื่อดึงข้อมูลเฉพาะรายการที่ต้องการแก้ไข
          const receiptResponse = await dispatch(getRfsByRefno(editRefno)).unwrap();

          if (receiptResponse && receiptResponse.result && receiptResponse.data) {
            const headerData = receiptResponse.data;
            console.log('Header data for edit:', headerData);

            setSaveBranch(headerData.branch_code || '');
            setSaveSupplier(headerData.supplier_code || '');

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

            // ดึงรายละเอียดต่อ
            const detailResponse = await dispatch(Br_rfsdtAlljoindt(editRefno)).unwrap();

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
          text: 'Failed to load supplier receipt data'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch, editRefno]);

  const processDetailData = async (detailData) => {
    try {
      console.log('Processing detail data:', detailData);

      // Set selected product codes first
      const productCodes = detailData.map(item => item.product_code);
      setSelectedProducts(productCodes);

      // Then set the products array directly from detailData 
      const products = detailData.map(item => ({
        product_code: item.product_code,
        product_name: item.tbl_product?.product_name || item.product_name,
        product_img: item.tbl_product?.product_img,
        productUnit1: {
          unit_code: item.tbl_product?.productUnit1?.unit_code || item.unit?.unit_code,
          unit_name: item.tbl_product?.productUnit1?.unit_name || item.unit?.unit_name
        },
        productUnit2: item.tbl_product?.productUnit2,
        bulk_unit_price: item.tbl_product?.bulk_unit_price || 0,
        retail_unit_price: item.tbl_product?.retail_unit_price || 0,
        tax1: item.tbl_product?.tax1 || item.tax1
      }));

      // Set all necessary states
      setProducts(products);

      // Prepare other state objects with better error handling
      const newQuantities = {};
      const newUnits = {};
      const newUnitPrices = {};
      const newTotals = {};
      const newExpiryDates = {};
      const newTax1Values = {};
      const newTemperatures = {};

      detailData.forEach((item) => {
        const productCode = item.product_code;
        if (!productCode) return; // Skip items without product code

        newQuantities[productCode] = parseFloat(item.qty) || 1;
        newUnits[productCode] = item.unit_code || item.tbl_product?.productUnit1?.unit_code || '';
        newUnitPrices[productCode] = parseFloat(item.uprice) || 0;
        newTotals[productCode] = parseFloat(item.amt) || 0;
        newTax1Values[productCode] = item.tax1 || 'N';
        newTemperatures[productCode] = item.temperature1 || '38';

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
      setTax1Values(newTax1Values);
      setTemperatures(newTemperatures);

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
        tax1Values: newTax1Values,
        temperatures: newTemperatures,
        total: totalSum
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
      const { [product.product_code]: ______, ...newTax1Values } = tax1Values;
      const { [product.product_code]: _______, ...newTemperatures } = temperatures;

      setQuantities(newQuantities);
      setUnits(newUnits);
      setUnitPrices(newPrices);
      setTotals(newTotals);
      setExpiryDates(newExpiryDates);
      setTax1Values(newTax1Values);
      setTemperatures(newTemperatures);

      setTotal(Object.values(newTotals).reduce((sum, curr) => sum + curr, 0));
    } else {
      setSelectedProducts(prev => [...prev, product.product_code]);
      setProducts(prev => [...prev, product]);

      setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
      setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1?.unit_code || '' }));
      setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price || 0 }));
      setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
      setTax1Values(prev => ({ ...prev, [product.product_code]: product.tax1 || 'N' }));
      setTemperatures(prev => ({ ...prev, [product.product_code]: '38' }));

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

  const handleTax1Change = (productCode, value) => {
    setTax1Values(prev => ({ ...prev, [productCode]: value }));
  };

  const handleTemperatureChange = (productCode, temp) => {
    setTemperatures(prev => ({ ...prev, [productCode]: temp }));
  };

  // Calculate tax based on products with tax1='Y'
  const calculateTax = () => {
    let taxableAmount = 0;
    products.forEach(product => {
      const productCode = product.product_code;
      if (tax1Values[productCode] === 'Y') {
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

      if (tax1Values[productCode] === 'Y') {
        taxable += lineTotal;
      } else {
        nonTaxable += lineTotal;
      }
    });

    return { taxable, nonTaxable };
  };

  const handleUpdate = async () => {
    if (!saveBranch || !saveSupplier || products.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select a branch, supplier and add at least one product.',
        timer: 1500
      });
      return;
    }

    try {
      setIsLoading(true);
      const { taxable, nonTaxable } = calculateTaxableAndNonTaxable();
      const tax = calculateTax();

      // แสดง log เพื่อตรวจสอบข้อมูลที่จะส่ง
      console.log('Date to update:', startDate, format(startDate, 'MM/dd/yyyy'));
      console.log('Branch code:', saveBranch);
      console.log('Supplier code:', saveSupplier);
      console.log('Products to update:', products.length);

      // สร้างข้อมูลสำหรับส่งไป API
      const headerData = {
        refno: editRefno,
        rdate: format(startDate, 'MM/dd/yyyy'),
        branch_code: saveBranch,
        supplier_code: saveSupplier,
        trdate: format(startDate, 'yyyyMMdd'),
        monthh: format(startDate, 'MM'),
        myear: startDate.getFullYear(),
        user_code: userData2.user_code || '',
        taxable: taxable.toString(),
        nontaxable: nonTaxable.toString(),
        total: total.toString()
      };

      const productArrayData = products.map(product => {
        const productCode = product.product_code;
        return {
          refno: editRefno,
          product_code: productCode,
          qty: (quantities[productCode] || 1).toString(),
          unit_code: units[productCode] || product.productUnit1?.unit_code || '',
          uprice: (unitPrices[productCode] || 0).toString(),
          tax1: tax1Values[productCode] || 'N',
          amt: (totals[productCode] || 0).toString(),
          expire_date: format(expiryDates[productCode] || new Date(), 'MM/dd/yyyy'),
          texpire_date: format(expiryDates[productCode] || new Date(), 'yyyyMMdd'),
          temperature1: temperatures[productCode] || '38'
        };
      });

      const orderData = {
        headerData,
        productArrayData,
        footerData: {
          taxable: taxable.toString(),
          nontaxable: nonTaxable.toString(),
          total: (total + tax).toString()
        }
      };

      // แสดง log ของข้อมูลก่อนส่ง
      console.log('Sending update data:', orderData);

      const result = await dispatch(updateBr_rfs(orderData)).unwrap();
      console.log('Update result:', result);

      await Swal.fire({
        icon: 'success',
        title: 'Updated supplier receipt successfully',
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
        text: error.message || 'Error updating supplier receipt',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
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
        <Typography variant="h6">Loading supplier receipt data...</Typography>
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
          Back to Goods Receipt Supplier
        </Button>
      </Box>

      {/* Status Information */}
      <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="subtitle2">
          <strong>Status:</strong> Editing ref #{editRefno} |
          Products selected: {selectedProducts.length} |
          Products loaded: {products.length} |
          Branch: {saveBranch || 'None'} |
          Supplier: {saveSupplier || 'None'} |
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
                    <Typography variant="caption" color="text.secondary">
                      {product.tax1 === 'Y' && (
                        <Typography variant="caption" color="success.main">
                          Taxable
                        </Typography>
                      )}
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
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="MM/dd/yyyy"
            customInput={<CustomInput />}
          />

          <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
            Restaurant
          </Typography>
          <Select
            value={saveBranch}
            onChange={(e) => setSaveBranch(e.target.value)}
            displayEmpty
            size="small"
            sx={{
              mt: '8px',
              width: '95%',
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

          <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
            Supplier
          </Typography>
          <Select
            value={saveSupplier}
            onChange={(e) => setSaveSupplier(e.target.value)}
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
                  <TableCell>Product</TableCell>
                  <TableCell>Tax</TableCell>
                  <TableCell>Expiry Date</TableCell>
                  <TableCell>Temperature</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (!products || products.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography color="text.secondary">
                        No products selected or failed to load product data
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
                          value={tax1Values[product.product_code] || 'N'}
                          onChange={(e) => handleTax1Change(product.product_code, e.target.value)}
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
                          value={temperatures[product.product_code] || ''}
                          onChange={(e) => handleTemperatureChange(product.product_code, e.target.value)}
                          size="small"
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">°C</InputAdornment>,
                          }}
                          sx={{
                            width: '90px',
                            '& .MuiInputBase-root': {
                              height: '38px'
                            }
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
                              {product.productUnit1.unit_name || 'Unknown'}
                            </MenuItem>
                          )}
                          {product.productUnit2 && (
                            <MenuItem value={product.productUnit2.unit_code}>
                              {product.productUnit2.unit_name || 'Unknown'}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="h5">Taxable Items</Typography>
              <Typography variant="h5">
                {Object.values(tax1Values).filter(status => status === 'Y').length}
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
            Update
          </Button>
        </Box>
      </Box>
    </Box>
  );
}