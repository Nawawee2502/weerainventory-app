// import React from 'react';
// import { Box, Button, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, InputAdornment, TextField, Typography, Drawer, IconButton, Grid2, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { addSupplier, deleteSupplier, updateSupplier, supplierAll, countSupplier, searchSupplier, lastSupplierCode } from '../../../api/supplierApi';
import { addBranch, deleteBranch, updateBranch, branchAll, countBranch, searchBranch, lastBranchCode } from '../../../api/branchApi';
import { addWh_pos, updateWh_pos, deleteWh_pos, wh_posAlljoindt, wh_posAllrdate } from '../../../api/warehouse/wh_posApi';
import { refno, addWh_posdt } from '../../../api/warehouse/wh_posdtApi';
import { searchProductCode, searchProductName } from '../../../api/productrecordApi';
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';



function CreatePurchaseOrderToSupplier({ onBack }) {
  const [selected, setSelected] = useState([]);
  const dispatch = useDispatch();
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [branch, setBranch] = useState([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [supplier, setSupplier] = useState([]);
  const [whpos, setWhpos] = useState([]);
  const [whposdt, setWhposdt] = useState([]);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [units, setUnits] = useState({});
  const [totals, setTotals] = useState({});
  const [startDate, setStartDate] = useState(new Date());
  const [inputValue, setInputValue] = useState('');
  const [lastRefNo, setLastRefNo] = useState('');
  const [saveSupplier, setSaveSupplier] = useState('');
  const [saveBranch, setSaveBranch] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [taxableAmount, setTaxableAmount] = useState(0);
  const [nonTaxableAmount, setNonTaxableAmount] = useState(0);
  const TAX_RATE = 0.07;
  const [lastMonth, setLastMonth] = useState('');
  const [lastYear, setLastYear] = useState('');

  // const userData = useSelector((state) => state.authentication.userData);
  // console.log("userData", userData)
  // const userData2 = localStorage.getItem("userData2");
  const userDataJson = localStorage.getItem("userData2");
  const userData2 = JSON.parse(userDataJson);
  console.log("userData2")
  console.log(userData2)

  let whProduct = [];

  // const handleSearchChange = (e) => {
  //   console.log("e.key");
  //   console.log(e.key);
  //   if (e.key === 'Enter') {
  //     searchWh();
  //   } else {
  //     setSearchTerm(e.target.value)
  //   }
  //   return true;
  // };


  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (e.key === 'Enter') {
      searchWh();
      setShowDropdown(false);
    } else if (value.length > 0) {
      // ค้นหาสินค้าเมื่อพิมพ์
      dispatch(searchProductName({ product_name: value }))
        .unwrap()
        .then((res) => {
          if (res.data) {
            // เรียงลำดับผลลัพธ์โดยให้ exact match อยู่บนสุด
            const sortedResults = [...res.data].sort((a, b) => {
              const aExact = a.product_name.toLowerCase() === value.toLowerCase();
              const bExact = b.product_name.toLowerCase() === value.toLowerCase();
              if (aExact && !bExact) return -1;
              if (!aExact && bExact) return 1;

              // ถ้าไม่มี exact match ให้เรียงตามความยาวชื่อจากสั้นไปยาว
              return a.product_name.length - b.product_name.length;
            });

            setSearchResults(sortedResults);
            setShowDropdown(true);
          }
        })
        .catch((err) => console.log(err.message));
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  // แก้ไขฟังก์ชัน handleProductSelect
  const handleProductSelect = (product) => {
    setSearchTerm(product.product_name);
    setShowDropdown(false);

    dispatch(searchProductName({ product_name: product.product_name }))
      .unwrap()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          // หาสินค้าที่ตรงกับที่เลือกจาก dropdown
          const selectedProduct = res.data.find(
            p => p.product_code === product.product_code
          ) || res.data[0];

          whProduct = products;
          whProduct.push(selectedProduct);

          const initialQuantity = 1;
          const unitCode = selectedProduct.productUnit1.unit_code;
          const total = calculateTotal(initialQuantity, unitCode, selectedProduct);

          setProducts(whProduct);
          setQuantities((prevQuantities) => ({
            ...prevQuantities,
            [selectedProduct.product_code]: initialQuantity,
          }));
          setUnits((prevUnits) => ({
            ...prevUnits,
            [selectedProduct.product_code]: unitCode,
          }));
          setTotals((prevTotals) => ({
            ...prevTotals,
            [selectedProduct.product_code]: total,
          }));

          setSearchTerm('');
        }
      })
      .catch((err) => console.log(err.message));
  };

  useEffect(() => {
    return () => {
      setSearchResults([]);
      setShowDropdown(false);
    };
  }, []);

  const searchWh = () => {
    dispatch(searchProductName({ product_name: searchTerm }))
      .unwrap()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          // หาสินค้าที่ชื่อตรงกับ searchTerm พอดี (exact match)
          const exactMatch = res.data.find(
            product => product.product_name.toLowerCase() === searchTerm.toLowerCase()
          );

          // ถ้าเจอ exact match ใช้ตัวนั้น ถ้าไม่เจอใช้ตัวแรกของผลลัพธ์
          const selectedProduct = exactMatch || res.data[0];

          whProduct = products;
          whProduct.push(selectedProduct);

          // กำหนดค่า quantity เริ่มต้นเป็น 1
          const initialQuantity = 1;

          // กำหนดค่า unit เริ่มต้นเป็น unit1 ของสินค้า
          const unitCode = selectedProduct.productUnit1.unit_code;

          // คำนวณ total เริ่มต้น
          const total = calculateTotal(initialQuantity, unitCode, selectedProduct);

          // อัปเดต state ของ products, quantity, unit และ total
          setProducts(whProduct);
          setQuantities((prevQuantities) => ({
            ...prevQuantities,
            [selectedProduct.product_code]: initialQuantity,
          }));
          setUnits((prevUnits) => ({
            ...prevUnits,
            [selectedProduct.product_code]: unitCode,
          }));
          setTotals((prevTotals) => ({
            ...prevTotals,
            [selectedProduct.product_code]: total,
          }));

          setSearchTerm(''); // รีเซ็ตค่า search term
        }
      })
      .catch((err) => console.log(err.message));
  };


  const handleDeleteWhProduct = (product_code) => {
    whProduct = products;
    whProduct = whProduct.filter((item) => item.product_code != product_code);
    setProducts(whProduct);

    // Calculate totals after deleting product
    setTimeout(() => calculateOrderTotals(), 0);
  };

  useEffect(() => {
    if (products.length > 0) {
      calculateOrderTotals();
    } else {
      // Reset totals when no products
      setSubtotal(0);
      setTax(0);
      setTotal(0);
    }
  }, [products, quantities, units]);


  const handleQuantityChange = (product_code, newQuantity) => {
    if (newQuantity >= 1) {
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [product_code]: parseInt(newQuantity),
      }));

      const selectedProduct = products.find((product) => product.product_code === product_code);
      const unit = units[product_code] || selectedProduct.productUnit1.unit_code;
      const total = calculateTotal(newQuantity, unit, selectedProduct);

      setTotals((prevTotals) => ({
        ...prevTotals,
        [product_code]: total,
      }));

      // Calculate totals after quantity change
      setTimeout(calculateOrderTotals, 0);
    }
  };


  const handleUnitChange = (productCode, newUnitCode) => {
    setUnits((prevUnits) => ({
      ...prevUnits,
      [productCode]: newUnitCode,
    }));

    const quantity = quantities[productCode] || 1;
    updateTotal(productCode, quantity, newUnitCode);

    // Calculate totals after unit change
    setTimeout(calculateOrderTotals, 0);
  };

  const updateTotal = (productCode, quantity, unitCode) => {
    const product = products.find((p) => p.product_code === productCode);
    const unitPrice = unitCode === product.productUnit1.unit_code
      ? product.bulk_unit_price
      : product.retail_unit_price;
    const newTotal = quantity * unitPrice;

    setTotals((prevTotals) => ({
      ...prevTotals,
      [productCode]: newTotal,
    }));
  };
  const calculateTotal = (quantity, unitCode, product) => {
    const unitPrice = unitCode === product.productUnit1.unit_code
      ? product.bulk_unit_price
      : product.retail_unit_price;
    return quantity * unitPrice;
  };

  const calculateOrderTotals = () => {
    let taxable = 0;
    let nonTaxable = 0;

    products.forEach(product => {
      const productCode = product.product_code;
      const quantity = quantities[productCode] || 1;
      const unitCode = units[productCode] || product.productUnit1.unit_code;
      const unitPrice = unitCode === product.productUnit1.unit_code
        ? product.bulk_unit_price
        : product.retail_unit_price;
      const amount = quantity * unitPrice;

      if (product.tax1 === 'Y') {
        // For taxable items, add tax to the amount
        taxable += amount * (1 + TAX_RATE);
      } else {
        // For non-taxable items, just add the amount
        nonTaxable += amount;
      }
    });

    setTaxableAmount(taxable);
    setNonTaxableAmount(nonTaxable);
    setTotal(taxable + nonTaxable);
  };

  useEffect(() => {
    let offset = 0;
    let limit = 5;
    let test = 10;

    // เซ็ตค่าเริ่มต้นของเดือนและปีจากวันที่ปัจจุบัน
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear().toString().slice(-2);
    setLastMonth(currentMonth);
    setLastYear(currentYear);

    dispatch(wh_posAlljoindt({ offset, limit }))
      .unwrap()
      .then((res) => {
        console.log("---------whpos---------")
        console.log(res.data);
        let resultData = res.data;
        for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
          resultData[indexArray].id = indexArray + 1;
        }
        setWhpos(resultData);
        console.log(resultData);

      })
      .catch((err) => err.message);

    dispatch(refno({ test }))
      .unwrap()
      .then((res) => {
        setLastRefNo(res.data);
        console.log("last refno", res.data)
        if (startDate) {
          handleGetLastRefNo(startDate);
        }
      })
      .catch((err) => err.message);


    dispatch(branchAll({ offset, limit }))
      .unwrap()
      .then((res) => {
        console.log("Branch data", res.data);
        setBranch(res.data);

      })
      .catch((err) => console.log(err.message));

    dispatch(supplierAll({ offset, limit }))
      .unwrap()
      .then((res) => {
        console.log("Supplier data", res.data);
        setSupplier(res.data);
      })
      .catch((err) => console.log(err.message));

  }, [dispatch]);

  const handleGetLastRefNo = (selectedDate) => {
    const year = selectedDate.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0'); // Month in MM format
    const baseRefNo = `WPOS${year}${month}`; // Base refno with the selected year and month

    dispatch(refno({ test: 10 }))
      .unwrap()
      .then((res) => {
        let lastRefNo = res.data;

        if (lastRefNo && typeof lastRefNo === 'object') {
          lastRefNo = lastRefNo.refno || '';
        }

        let newRefNo;

        // ดึงปีและเดือนจาก lastRefNo
        const lastRefYear = lastRefNo ? lastRefNo.substring(4, 6) : '';
        const lastRefMonth = lastRefNo ? lastRefNo.substring(6, 8) : '';

        // ตรวจสอบว่าเป็นเดือนหรือปีใหม่หรือไม่
        if (lastRefYear !== year || lastRefMonth !== month) {
          // ถ้าเป็นเดือนใหม่หรือปีใหม่ ให้เริ่มจาก 001
          newRefNo = `${baseRefNo}001`;
        } else {
          // ถ้าเป็นเดือนและปีเดียวกัน ให้เพิ่มเลขต่อ
          const lastNumber = parseInt(lastRefNo.slice(-3));
          const increment = lastNumber + 1;
          newRefNo = `${baseRefNo}${increment.toString().padStart(3, '0')}`;
        }

        setLastRefNo(newRefNo);
        console.log("Generated refno:", newRefNo);

        // อัพเดทค่าเดือนและปีล่าสุด
        setLastMonth(month);
        setLastYear(year);
      })
      .catch((err) => console.log(err.message));
  };

  const resetForm = () => {
    // รีเซ็ตข้อมูลทั้งหมด
    setProducts([]);
    setQuantities({});
    setUnits({});
    setTotals({});
    setSubtotal(0);
    setTax(0);
    setTotal(0);
    setSaveSupplier('');
    setSaveBranch('');

    // ดึง refno ใหม่
    const test = 10;
    dispatch(refno({ test }))
      .unwrap()
      .then((res) => {
        setLastRefNo(res.data);
        if (startDate) {
          handleGetLastRefNo(startDate);
        }
      })
      .catch((err) => console.log(err.message));
  };

  const handleSaveWhposdt = () => {
    // ตรวจสอบว่ามีการเลือก supplier และ branch หรือไม่
    if (!saveSupplier || !saveBranch) {
      Swal.fire({
        icon: 'warning',
        title: 'Please select supplier and branch',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }

    // ตรวจสอบว่ามีสินค้าในรายการหรือไม่
    if (products.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Please add at least one product',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }

    const day = String(startDate.getDate()).padStart(2, '0');
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const year = startDate.getFullYear();

    const headerData = {
      refno: lastRefNo,
      rdate: day + '/' + month + '/' + year,
      supplier_code: saveSupplier,
      branch_code: saveBranch,
      taxable: taxableAmount,
      nontaxable: nonTaxableAmount,
      trdate: year + month + day,
      monthh: month,
      myear: year,
      user_code: userData2.user_code
    }

    // Create array of products with updated values
    const tmpProduct = products.map(product => {
      const productCode = product.product_code;
      const quantity = quantities[productCode] || 1;
      const unitCode = units[productCode] || product.productUnit1.unit_code;
      const unitPrice = unitCode === product.productUnit1.unit_code
        ? product.bulk_unit_price
        : product.retail_unit_price;
      const amount = quantity * unitPrice;

      // Calculate final amount based on tax status
      const finalAmount = product.tax1 === 'Y'
        ? amount * (1 + TAX_RATE)
        : amount;

      return {
        refno: headerData.refno,
        product_code: productCode,
        qty: quantity.toString(),
        unit_code: unitCode,
        uprice: unitPrice.toString(),
        tax1: product.tax1,
        amt: finalAmount.toString()
      };
    });

    const orderData = {
      headerData: headerData,
      productArrayData: tmpProduct,
      footerData: {
        taxable: taxableAmount,
        nontaxable: nonTaxableAmount,
        total: total,
      },
    };

    // แสดง loading ระหว่างบันทึกข้อมูล
    Swal.fire({
      title: 'Saving order...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    dispatch(addWh_pos(orderData))
      .unwrap()
      .then((res) => {
        // ปิด loading และแสดงข้อความสำเร็จ
        Swal.fire({
          icon: 'success',
          title: 'Create order successfully',
          text: `Reference No: ${lastRefNo}`,
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          // รีเซ็ตฟอร์มหลังจากบันทึกสำเร็จ
          resetForm();
        });
      })
      .catch((err) => {
        // กรณีเกิดข้อผิดพลาด
        Swal.fire({
          icon: 'error',
          title: 'Error saving order',
          text: err.message,
          confirmButtonText: 'OK'
        });
      });
  };




  return (
    <Box sx={{ width: '100%' }}>
      <Button
        onClick={onBack}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2, mr: 'auto' }}
      >
        Back to Purchase Orders to Supplier
      </Button>
      <Box
        sx={{
          width: '100%',
          mt: '10px',
          flexDirection: 'column'
        }}
      >
        <Box
          sx={{
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
            <Grid2 container spacing={2}>
              <Grid2 item size={{ xs: 12, md: 6 }}>
                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                  Ref.no
                </Typography>
                <TextField
                  value={lastRefNo || ''}
                  disabled
                  size="small"
                  placeholder='Ref.no'
                  sx={{
                    mt: '8px',
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontWeight: '700'
                    },
                  }}
                />
              </Grid2>
              <Grid2 item size={{ xs: 12, md: 6 }}>
                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                  Date
                </Typography>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    handleGetLastRefNo(date); // Call when the date is selected
                  }}
                  dateFormat="dd/MM/yyyy"
                  customInput={
                    <TextField
                      size="small"
                      fullWidth
                      sx={{
                        mt: '8px',
                        width: '80%',
                        '& .MuiInputBase-root': {
                          width: '100%',
                        },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                        },
                      }}
                    />
                  }
                />

              </Grid2>
              <Grid2 item size={{ xs: 12, md: 6 }}>
                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                  Supplier
                </Typography>
                <Box
                  onChange={(e) => setSaveSupplier(e.target.value)}
                  component="select"
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
                  id="supplier"
                >
                  <option value="">Select a supplier</option>
                  {supplier.map((supplierItem) => (
                    <option key={supplierItem.supplier_code} value={supplierItem.supplier_code}>
                      {supplierItem.supplier_name}
                    </option>
                  ))}
                </Box>
              </Grid2>
              <Grid2 item size={{ xs: 12, md: 6 }}>
                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                  Branch
                </Typography>
                <Box
                  onChange={(e) => setSaveBranch(e.target.value)}
                  component="select"
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
                  id="branch"
                >
                  <option value="">Select a branch</option>
                  {branch.map((branchItem) => (
                    <option key={branchItem.branch_code} value={branchItem.branch_code}>
                      {branchItem.branch_name}
                    </option>
                  ))}

                </Box>
              </Grid2>
            </Grid2>
            <Divider sx={{ mt: '24px' }} />
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
                  onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                      searchWh();
                      setShowDropdown(false);
                    }
                  }}
                  onChange={handleSearchChange}
                  placeholder="Search"
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '30px',
                      width: '100%'
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '8.5px 14px',
                    },
                    width: '100%'
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#5A607F' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {showDropdown && searchResults.length > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      borderRadius: '4px',
                      zIndex: 1000,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      mt: '4px'
                    }}
                  >
                    {searchResults.map((product) => (
                      <Box
                        key={product.product_code}
                        onClick={() => handleProductSelect(product)}
                        sx={{
                          p: 1.5,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: '#f5f5f5'
                          },
                          borderBottom: '1px solid #eee'
                        }}
                      >
                        <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                          {product.product_name}
                        </Typography>
                        {/* <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                          Code: {product.product_code}
                        </Typography> */}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
              <Button sx={{ ml: 'auto', bgcolor: '#E2EDFB', borderRadius: '6px', width: '105px' }}>
                Clear All
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', p: '12px 0px', justifyContent: 'center', alignItems: 'center' }}>

            </Box>

            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}>
              <table style={{ width: '100%', marginTop: '24px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '4px', fontSize: '14px', width: '1%', color: '#754C27', fontWeight: '800' }}>No.</th>
                    <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '15%', color: '#754C27', fontWeight: '800' }}>Product code</th>
                    <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '15%', color: '#754C27', fontWeight: '800' }}>Product name</th>
                    <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Quantity</th>
                    <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '10%', color: '#754C27', fontWeight: '800' }}>Unit</th>
                    <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Unit Price</th>
                    <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Tax</th>
                    <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Total</th>
                    <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '1%', color: '#754C27', fontWeight: '800' }}></th>
                  </tr>
                  <tr>
                    <td colSpan="8">
                      <Divider sx={{ width: '100%', color: '#C6C6C6', border: '1px solid #C6C6C6' }} />
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => {
                    const productCode = product.product_code;
                    const currentUnit = units[productCode] || product.productUnit1.unit_code;
                    const currentQuantity = quantities[productCode] || 1;
                    const currentUnitPrice = currentUnit === product.productUnit1.unit_code
                      ? product.bulk_unit_price
                      : product.retail_unit_price;
                    const currentTotal = (currentQuantity * currentUnitPrice).toFixed(2);

                    return (
                      <tr key={productCode}>
                        <td style={{ padding: '4px', fontSize: '12px', fontWeight: '800' }}>{index + 1}</td>
                        <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>{productCode}</td>
                        <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>{product.product_name}</td>
                        <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                          <input
                            type="number"
                            min="1"
                            value={currentQuantity}
                            onChange={(e) => handleQuantityChange(productCode, parseInt(e.target.value))}
                            style={{
                              width: '50px',
                              textAlign: 'center',
                              fontWeight: '600',
                              padding: '4px'
                            }}
                          />
                        </td>
                        <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                          <select
                            value={currentUnit}
                            onChange={(e) => handleUnitChange(productCode, e.target.value)}
                            style={{
                              padding: '4px',
                              borderRadius: '4px'
                            }}
                          >
                            <option value={product.productUnit1.unit_code}>{product.productUnit1.unit_name}</option>
                            <option value={product.productUnit2.unit_code}>{product.productUnit2.unit_name}</option>
                          </select>
                        </td>
                        <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                          {currentUnitPrice.toFixed(2)}
                        </td>
                        <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                          {product.tax1 === 'Y' ? 'Yes' : product.tax1 === 'N' ? 'No' : product.tax1}
                        </td>
                        <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                          {currentTotal}
                        </td>
                        <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                          <IconButton
                            onClick={() => handleDeleteWhProduct(productCode)}
                            size="small"
                          >
                            <CancelIcon />
                          </IconButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>

            <Box sx={{ width: '100%', height: 'auto', bgcolor: '#EAB86C', borderRadius: '10px', p: '18px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Typography sx={{ color: '#FFFFFF' }}>Taxable</Typography>
                <Typography sx={{ color: '#FFFFFF', ml: 'auto' }}>
                  ${taxableAmount.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: '8px' }}>
                <Typography sx={{ color: '#FFFFFF' }}>Non-taxable</Typography>
                <Typography sx={{ color: '#FFFFFF', ml: 'auto' }}>
                  ${nonTaxableAmount.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: '8px' }}>
                <Typography sx={{ color: '#FFFFFF', fontSize: '30px', fontWeight: '600' }}>
                  Total
                </Typography>
                <Typography sx={{ color: '#FFFFFF', ml: 'auto', fontSize: '30px', fontWeight: '600' }}>
                  ${total.toFixed(2)}
                </Typography>
              </Box>
            </Box>
            <Button
              onClick={handleSaveWhposdt}
              sx={{ width: '100%', height: '48px', mt: '24px', bgcolor: '#754C27', color: '#FFFFFF' }}>
              Save
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default CreatePurchaseOrderToSupplier;