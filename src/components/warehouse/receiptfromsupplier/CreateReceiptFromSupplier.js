import { Box, Button, InputAdornment, TextField, Typography, IconButton, Grid2, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { addWh_rfs } from '../../../api/warehouse/wh_rfsApi';
import { addWh_rfsdt } from '../../../api/warehouse/wh_rfsdtApi';
import { searchProductName } from '../../../api/productrecordApi';
import { supplierAll } from '../../../api/supplierApi';
import { branchAll } from '../../../api/branchApi';
import Swal from 'sweetalert2';
import { refno } from '../../../api/warehouse/wh_rfsApi';

function CreateReceiptFromSupplier({ onBack }) {
  const dispatch = useDispatch();
  const [startDate, setStartDate] = useState(new Date());
  const [lastRefNo, setLastRefNo] = useState('');
  const [supplier, setSupplier] = useState([]);
  const [branch, setBranch] = useState([]);
  const [saveSupplier, setSaveSupplier] = useState('');
  const [saveBranch, setSaveBranch] = useState('');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [units, setUnits] = useState({});
  const [totals, setTotals] = useState({});
  const [taxableAmount, setTaxableAmount] = useState(0);
  const [nonTaxableAmount, setNonTaxableAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [instantSaving, setInstantSaving] = useState(0);
  const [deliverySurcharge, setDeliverySurcharge] = useState(0);
  const [saleTax, setSaleTax] = useState(0);
  const [totalDue, setTotalDue] = useState(0);
  const [expiryDates, setExpiryDates] = useState({});
  const [temperatures, setTemperatures] = useState({});
  const [lastMonth, setLastMonth] = useState('');
  const [lastYear, setLastYear] = useState('');
  const TAX_RATE = 0.07;

  const userDataJson = localStorage.getItem("userData2");
  const userData2 = JSON.parse(userDataJson);

  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear().toString().slice(-2);
    setLastMonth(currentMonth);
    setLastYear(currentYear);

    dispatch(refno({ test: 10 }))  // Changed from Wh_rfsByRefno to refno
      .unwrap()
      .then((res) => {
        setLastRefNo(res.data);
        if (startDate) {
          handleGetLastRefNo(startDate);
        }
      })
      .catch((err) => console.log(err.message));
  }, [dispatch]);

  useEffect(() => {
    let offset = 0;
    let limit = 5;

    dispatch(branchAll({ offset, limit }))
      .unwrap()
      .then((res) => setBranch(res.data))
      .catch((err) => console.log(err.message));

    dispatch(supplierAll({ offset, limit }))
      .unwrap()
      .then((res) => setSupplier(res.data))
      .catch((err) => console.log(err.message));
  }, [dispatch]);

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
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleProductSelect = (product) => {
    product.amount = 0;
    setProducts([...products, product]);
    setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
    setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1.unit_code }));
    setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
    setTemperatures(prev => ({ ...prev, [product.product_code]: '38' }));
    updateTotals();
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleDeleteProduct = (productCode) => {
    const updatedProducts = products.filter(p => p.product_code !== productCode);
    setProducts(updatedProducts);

    let newTaxable = 0;
    let newNonTaxable = 0;
    let newInstantSaving = 0;
    let grandTotal = 0;

    updatedProducts.forEach(p => {
      const unit = units[p.product_code] || p.productUnit1.unit_code;
      const price = unit === p.productUnit1.unit_code ?
        p.bulk_unit_price : p.retail_unit_price;
      const lineTotal = Number(p.amount || 0) * price;

      if (p.tax1 === 'Y') {
        newTaxable += lineTotal;
      } else {
        newNonTaxable += lineTotal;
      }

      grandTotal += lineTotal;
      newInstantSaving += Number(p.instant_saving1 || 0);
    });

    const newSaleTax = newTaxable * TAX_RATE;
    const newTotalDue = grandTotal + newSaleTax + deliverySurcharge - newInstantSaving;

    setTaxableAmount(newTaxable);
    setNonTaxableAmount(newNonTaxable);
    setInstantSaving(newInstantSaving);
    setSaleTax(newSaleTax);
    setTotal(grandTotal);
    setTotalDue(newTotalDue);
  };

  const handleQuantityChange = (productCode, newQuantity) => {
    if (newQuantity >= 1) {
      setQuantities(prev => ({ ...prev, [productCode]: newQuantity }));
      updateTotals();
    }
  };

  const handleUnitChange = (productCode, newUnit) => {
    setUnits(prev => ({ ...prev, [productCode]: newUnit }));

    // Get the product and recalculate with new unit price
    const product = products.find(p => p.product_code === productCode);
    const newPrice = newUnit === product.productUnit1.unit_code ?
      product.bulk_unit_price : product.retail_unit_price;
    const amount = Number(product.amount || 0);

    // Update product's total with new unit price
    const newTotal = amount * newPrice;
    product.total = newTotal;

    // Recalculate all totals
    let newTaxable = 0;
    let newNonTaxable = 0;
    let newInstantSaving = 0;
    let grandTotal = 0;

    products.forEach(p => {
      const unit = units[p.product_code] || p.productUnit1.unit_code;
      const currentPrice = unit === p.productUnit1.unit_code ?
        p.bulk_unit_price : p.retail_unit_price;
      const lineTotal = Number(p.amount || 0) * currentPrice;

      if (p.tax1 === 'Y') {
        newTaxable += lineTotal;
      } else {
        newNonTaxable += lineTotal;
      }

      grandTotal += lineTotal;
      newInstantSaving += Number(p.instant_saving1 || 0);
    });

    const newSaleTax = newTaxable * TAX_RATE;
    const newTotalDue = grandTotal + newSaleTax + deliverySurcharge - newInstantSaving;

    setTaxableAmount(newTaxable);
    setNonTaxableAmount(newNonTaxable);
    setInstantSaving(newInstantSaving);
    setSaleTax(newSaleTax);
    setTotal(grandTotal);
    setTotalDue(newTotalDue);
  };

  const handleExpiryDateChange = (productCode, date) => {
    setExpiryDates(prev => ({ ...prev, [productCode]: date }));
  };

  const handleTemperatureChange = (productCode, temp) => {
    setTemperatures(prev => ({ ...prev, [productCode]: temp }));
  };

  const handleGetLastRefNo = (selectedDate) => {
    const year = selectedDate.getFullYear().toString().slice(-2);
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const baseRefNo = `WRFS${year}${month}`; // Changed from WPOS to WRFS

    dispatch(refno({ test: 10 }))
      .unwrap()
      .then((res) => {
        let lastRefNo = res.data;
        if (lastRefNo && typeof lastRefNo === 'object') {
          lastRefNo = lastRefNo.refno || '';
        }

        let newRefNo;
        const lastRefYear = lastRefNo ? lastRefNo.substring(4, 6) : '';
        const lastRefMonth = lastRefNo ? lastRefNo.substring(6, 8) : '';

        if (lastRefYear !== year || lastRefMonth !== month) {
          newRefNo = `${baseRefNo}001`;
        } else {
          const lastNumber = parseInt(lastRefNo.slice(-3));
          const increment = lastNumber + 1;
          newRefNo = `${baseRefNo}${increment.toString().padStart(3, '0')}`;
        }

        setLastRefNo(newRefNo);
        setLastMonth(month);
        setLastYear(year);
      })
      .catch((err) => console.log(err.message));
  };

  const updateTotals = () => {
    let newTaxable = 0;
    let newNonTaxable = 0;

    products.forEach(product => {
      const quantity = quantities[product.product_code] || 1;
      const unit = units[product.product_code] || product.productUnit1.unit_code;
      const price = unit === product.productUnit1.unit_code ? product.bulk_unit_price : product.retail_unit_price;
      const amount = quantity * price;

      if (product.tax1 === 'Y') {
        newTaxable += amount;
      } else {
        newNonTaxable += amount;
      }
    });

    const newSaleTax = newTaxable * TAX_RATE;
    const newTotal = newTaxable + newNonTaxable;
    const newTotalDue = newTotal + newSaleTax + deliverySurcharge - instantSaving;

    setTaxableAmount(newTaxable);
    setNonTaxableAmount(newNonTaxable);
    setSaleTax(newSaleTax);
    setTotal(newTotal);
    setTotalDue(newTotalDue);
  };

  const handleSave = () => {
    if (!saveSupplier || !saveBranch || products.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields.',
        timer: 1500
      });
      return;
    }

    const headerData = {
      refno: lastRefNo,
      rdate: startDate.toLocaleDateString('en-GB'),
      supplier_code: saveSupplier,
      branch_code: saveBranch,
      trdate: startDate.toISOString().slice(0, 10).replace(/-/g, ''),
      monthh: (startDate.getMonth() + 1).toString().padStart(2, '0'),
      myear: startDate.getFullYear(),
      user_code: userData2.user_code,
      taxable: taxableAmount,
      nontaxable: nonTaxableAmount,
      total: total,
      instant_saving: instantSaving,
      delivery_surcharge: deliverySurcharge,
      sale_tax: saleTax,
      total_due: totalDue
    };

    const productArrayData = products.map(product => ({
      refno: lastRefNo,
      product_code: product.product_code,
      qty: (product.amount || 0) / (units[product.product_code] === product.productUnit1.unit_code ?
        product.bulk_unit_price : product.retail_unit_price),
      unit_code: units[product.product_code] || product.productUnit1.unit_code,
      uprice: units[product.product_code] === product.productUnit1.unit_code ?
        product.bulk_unit_price : product.retail_unit_price,
      tax1: product.tax1,
      expire_date: expiryDates[product.product_code]?.toLocaleDateString('en-GB'),
      texpire_date: expiryDates[product.product_code]?.toISOString().slice(0, 10).replace(/-/g, ''),
      instant_saving1: product.instant_saving1 || 0,
      temperature1: temperatures[product.product_code] || '',
      amt: product.amount || 0
    }));

    Swal.fire({
      title: 'Saving...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    dispatch(addWh_rfs({
      headerData,
      productArrayData,
      footerData: {
        taxable: taxableAmount,
        nontaxable: nonTaxableAmount,
        total: total,
        instant_saving: instantSaving,
        delivery_surcharge: deliverySurcharge,
        sale_tax: saleTax,
        total_due: totalDue
      }
    }))
      .unwrap()
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Saved successfully',
          showConfirmButton: false,
          timer: 1500
        });
        resetForm();
      })
      .catch(err => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message
        });
      });
  };

  const resetForm = () => {
    setProducts([]);
    setQuantities({});
    setUnits({});
    setTotals({});
    setExpiryDates({});
    setTemperatures({});
    setSaveSupplier('');
    setSaveBranch('');
    setInstantSaving(0);
    setDeliverySurcharge(0);
    setTaxableAmount(0); // Added
    setNonTaxableAmount(0); // Added
    setSaleTax(0); // Added
    setTotal(0); // Added
    setTotalDue(0); // Added

    dispatch(refno({ test: 10 }))
      .unwrap()
      .then((res) => {
        setLastRefNo(res.data);
        if (startDate) {
          handleGetLastRefNo(startDate);
        }
      })
      .catch((err) => console.log(err.message));
  };

  const calculateOrderTotals = () => {
    let newTaxable = 0;
    let newNonTaxable = 0;
    let newInstantSaving = 0;
    let newTotal = 0;

    products.forEach(product => {
      const unit = units[product.product_code] || product.productUnit1.unit_code;
      const price = unit === product.productUnit1.unit_code ?
        product.bulk_unit_price : product.retail_unit_price;
      const amount = Number(product.amount || 0);
      const lineTotal = amount * price;

      if (product.tax1 === 'Y') {
        newTaxable += lineTotal;
      } else {
        newNonTaxable += lineTotal;
      }

      newTotal += lineTotal;
      newInstantSaving += Number(product.instant_saving1 || 0);
    });

    const newSaleTax = newTaxable * TAX_RATE;
    const newTotalDue = newTotal + newSaleTax + deliverySurcharge - newInstantSaving;

    setTaxableAmount(newTaxable);
    setNonTaxableAmount(newNonTaxable);
    setInstantSaving(newInstantSaving);
    setSaleTax(newSaleTax);
    setTotal(newTotal);
    setTotalDue(newTotalDue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Button
        onClick={onBack}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Back to Receipt From Supplier
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
            <Grid2 container spacing={2}>
              <Grid2 item size={{ xs: 12, md: 6 }}>
                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                  Ref.no
                </Typography>
                <TextField
                  value={lastRefNo}
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
                    handleGetLastRefNo(date);
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
                  component="select"
                  value={saveSupplier}
                  onChange={(e) => setSaveSupplier(e.target.value)}
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
                  <option value="">Select a supplier</option>
                  {supplier.map((s) => (
                    <option key={s.supplier_code} value={s.supplier_code}>
                      {s.supplier_name}
                    </option>
                  ))}
                </Box>
              </Grid2>
              <Grid2 item size={{ xs: 12, md: 6 }}>
                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                  Branch
                </Typography>
                <Box
                  component="select"
                  value={saveBranch}
                  onChange={(e) => setSaveBranch(e.target.value)}
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
                  <option value="">Select a branch</option>
                  {branch.map((b) => (
                    <option key={b.branch_code} value={b.branch_code}>
                      {b.branch_name}
                    </option>
                  ))}
                </Box>
              </Grid2>
            </Grid2>

            <Divider sx={{ my: 3 }} />

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
                  placeholder="Search"
                  size="small"
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
                  width: '105px'
                }}
              >
                Clear All
              </Button>
            </Box>

            <table style={{ width: '100%', marginTop: '24px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '4px', fontSize: '14px', width: '1%', color: '#754C27', fontWeight: '800' }}>No.</th>
                  <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '10%', color: '#754C27', fontWeight: '800' }}>Product code</th>
                  <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '10%', color: '#754C27', fontWeight: '800' }}>Product name</th>
                  <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Expiry date</th>
                  <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Tax</th>
                  <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800', width: '10%' }}>Instance saving</th>
                  <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Temperature</th>
                  <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Amount</th>
                  <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Unit</th>
                  <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Unit Price</th>
                  <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Total</th>
                  <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '1%', color: '#754C27', fontWeight: '800' }}></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const productCode = product.product_code;
                  const unit = units[productCode] || product.productUnit1.unit_code;
                  const price = unit === product.productUnit1.unit_code ?
                    product.bulk_unit_price : product.retail_unit_price;
                  const amount = product.amount || 0;
                  const total = amount * price;

                  return (
                    <tr key={productCode}>
                      <td style={{ padding: '4px', fontSize: '12px', fontWeight: '800' }}>{index + 1}</td>
                      <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>{productCode}</td>
                      <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>{product.product_name}</td>
                      <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                        <DatePicker
                          selected={expiryDates[productCode]}
                          onChange={(date) => handleExpiryDateChange(productCode, date)}
                          dateFormat="dd/MM/yyyy"
                          customInput={<TextField size="small" sx={{ width: '120px' }} />}
                        />
                      </td>
                      <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                        {product.tax1 === 'Y' ? 'Yes' : 'No'}
                      </td>
                      <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                        <TextField
                          type="number"
                          size="small"
                          value={product.instant_saving1 || 0}
                          onChange={(e) => {
                            const newValue = Number(e.target.value);
                            product.instant_saving1 = newValue;
                            calculateOrderTotals();
                          }}
                          sx={{ width: '80px' }}
                        />
                      </td>
                      <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                        <TextField
                          size="small"
                          value={temperatures[productCode] || ''}
                          onChange={(e) => handleTemperatureChange(productCode, e.target.value)}
                          sx={{ width: '80px' }}
                        />
                      </td>
                      <td>
                        <TextField
                          type="number"
                          size="small"
                          value={amount}
                          onChange={(e) => {
                            const newAmount = Number(e.target.value);
                            product.amount = newAmount;
                            calculateOrderTotals();
                          }}
                          sx={{ width: '80px' }}
                        />
                      </td>
                      <td>
                        <select
                          value={unit}
                          onChange={(e) => {
                            handleUnitChange(productCode, e.target.value);
                            calculateOrderTotals();
                          }}
                        >
                          <option value={product.productUnit1.unit_code}>{product.productUnit1.unit_name}</option>
                          <option value={product.productUnit2.unit_code}>{product.productUnit2.unit_name}</option>
                        </select>
                      </td>
                      <td>{price.toFixed(2)}</td>
                      <td>{total.toFixed(2)}</td>
                      <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                        <IconButton onClick={() => handleDeleteProduct(productCode)} size="small">
                          <CancelIcon />
                        </IconButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <Box sx={{ width: '100%', height: 'auto', bgcolor: '#EAB86C', borderRadius: '10px', p: '18px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: '100%' }}>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '48%',
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
                  width: '48%',
                  ml: 'auto',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <Typography sx={{ color: '#FFFFFF' }}>Instance Saving</Typography>
                    <Typography sx={{ color: '#FFFFFF' }}>Delivery Surcharge</Typography>
                    <Typography sx={{ color: '#FFFFFF' }}>Sale Tax</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#FFFFFF' }}>${instantSaving.toFixed(2)}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        type="number"
                        size="small"
                        value={deliverySurcharge}
                        onChange={(e) => {
                          const newValue = Number(e.target.value);
                          if (!isNaN(newValue)) {
                            setDeliverySurcharge(newValue);
                            setTimeout(() => {
                              const newTotalDue = total + saleTax + newValue - instantSaving;
                              setTotalDue(newTotalDue);
                            }, 0);
                          }
                        }}
                        sx={{
                          width: '100px',
                          bgcolor: 'white',
                          '& .MuiInputBase-input': {
                            height: '20px',
                            padding: '4px 8px'
                          }
                        }}
                        inputProps={{
                          min: 0,
                          step: "any"
                        }}
                      />
                    </Box>
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
              sx={{ width: '100%', height: '48px', mt: '24px', bgcolor: '#754C27', color: '#FFFFFF' }}>
              Save
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default CreateReceiptFromSupplier;