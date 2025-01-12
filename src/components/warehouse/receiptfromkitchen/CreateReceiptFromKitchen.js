import { Box, Button, InputAdornment, TextField, Typography, IconButton, Grid2, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { addWh_rfk, refno } from '../../../api/warehouse/wh_rfkApi';
import { searchProductName } from '../../../api/productrecordApi';
import { kitchenAll } from '../../../api/kitchenApi';
import Swal from 'sweetalert2';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
// import { refno } from '../../../api/warehouse/wh_rfkApi';

const formatDate = (date) => {
    if (!date) return "";
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

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

function CreateReceiptFromKitchen({ onBack }) {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('');
    const [kitchen, setKitchen] = useState([]);
    const [saveKitchen, setSaveKitchen] = useState('');
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
    const [saleTax, setSaleTax] = useState(0);
    const [totalDue, setTotalDue] = useState(0);
    const [expiryDates, setExpiryDates] = useState({});
    const [temperatures, setTemperatures] = useState({});
    const [lastMonth, setLastMonth] = useState('');
    const [lastYear, setLastYear] = useState('');
    const [customPrices, setCustomPrices] = useState({});
    const [refNo, setRefNo] = useState('');
    const TAX_RATE = 0.07;

    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson);

    useEffect(() => {
        const currentDate = new Date();
        const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const currentYear = currentDate.getFullYear().toString().slice(-2);
        setLastMonth(currentMonth);
        setLastYear(currentYear);

        const baseRefNo = `WRFK${currentYear}${currentMonth}`;

    }, [dispatch]);

    useEffect(() => {
        let offset = 0;
        let limit = 5;

        dispatch(kitchenAll({ offset, limit }))
            .unwrap()
            .then((res) => setKitchen(res.data))
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
        calculateOrderTotals(); // เปลี่ยนจาก updateTotals เป็น calculateOrderTotals
        setSearchTerm('');
        setShowDropdown(false);
    };

    const handleDeleteProduct = (productCode) => {
        const updatedProducts = products.filter(p => p.product_code !== productCode);
        setProducts(updatedProducts);
        calculateOrderTotals();
    };

    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
    };

    const handleTemperatureChange = (productCode, temp) => {
        setTemperatures(prev => ({ ...prev, [productCode]: temp }));
    };

    const calculateOrderTotals = () => {
        let newTaxable = 0;
        let newNonTaxable = 0;
        let newTotal = 0;

        products.forEach(product => {
            const unit = units[product.product_code] || product.productUnit1.unit_code;
            // ใช้ custom price ถ้ามี ถ้าไม่มีใช้ default price
            const price = customPrices[product.product_code] ??
                (unit === product.productUnit1.unit_code ?
                    product.bulk_unit_price :
                    product.retail_unit_price);
            const amount = Number(product.amount || 0);
            const lineTotal = amount * price;

            if (product.tax1 === 'Y') {
                newTaxable += lineTotal;
            } else {
                newNonTaxable += lineTotal;
            }

            newTotal += lineTotal;
        });

        const newSaleTax = newTaxable * TAX_RATE;
        const newTotalDue = newTotal + newSaleTax;

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setSaleTax(newSaleTax);
        setTotal(newTotal);
        setTotalDue(newTotalDue);
    };

    const handleUnitChange = (productCode, newUnit) => {
        setUnits(prev => ({ ...prev, [productCode]: newUnit }));
        // Reset custom price when unit changes
        setCustomPrices(prev => {
            const { [productCode]: removed, ...rest } = prev;
            return rest;
        });
        calculateOrderTotals();
    };

    const handleSave = () => {
        if (!saveKitchen || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please fill in all required fields.',
                timer: 1500
            });
            return;
        }

        const headerData = {
            refno: refNo,
            rdate: formatDate(startDate),
            kitchen_code: saveKitchen,
            trdate: startDate.toISOString().slice(0, 10).replace(/-/g, ''),
            monthh: (startDate.getMonth() + 1).toString().padStart(2, '0'),
            myear: startDate.getFullYear(),
            user_code: userData2.user_code,
            taxable: taxableAmount,
            nontaxable: nonTaxableAmount,
            total: total
        };

        const productArrayData = products.map(product => ({
            refno: refNo,
            product_code: product.product_code,
            qty: product.amount || 0,
            unit_code: units[product.product_code] || product.productUnit1.unit_code,
            uprice: customPrices[product.product_code] ??
                (units[product.product_code] === product.productUnit1.unit_code ?
                    product.bulk_unit_price :
                    product.retail_unit_price),
            tax1: product.tax1,
            expire_date: formatDate(expiryDates[product.product_code]), // Changed from toLocaleDateString
            texpire_date: expiryDates[product.product_code]?.toISOString().slice(0, 10).replace(/-/g, ''),
            temperature1: temperatures[product.product_code] || '',
            amt: product.amount || 0
        }));

        const footerData = {
            taxable: taxableAmount,
            nontaxable: nonTaxableAmount,
            total: total
        };

        Swal.fire({
            title: 'Saving...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        dispatch(addWh_rfk({
            headerData,
            productArrayData,
            footerData
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
        setSaveKitchen('');
        setTaxableAmount(0);
        setNonTaxableAmount(0);
        setTotal(0);
        setCustomPrices({});
        setRefNo('');
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Button
                onClick={onBack}
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2 }}
            >
                Back to Receipt From Kitchen
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
                                    value={refNo}
                                    onChange={(e) => setRefNo(e.target.value)}
                                    size="small"
                                    placeholder='Enter Reference Number'
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
                                    }}
                                    dateFormat="MM/dd/yyyy"  // Changed from dd/MM/yyyy
                                    placeholderText="MM/DD/YYYY"
                                    customInput={<CustomInput />}
                                    sx={{
                                        mt: '8px'
                                    }}
                                />
                            </Grid2>
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Kitchen
                                </Typography>
                                <Box
                                    component="select"
                                    value={saveKitchen}
                                    onChange={(e) => setSaveKitchen(e.target.value)}
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
                                    <option value="">Select a kitchen</option>
                                    {kitchen.map((k) => (
                                        <option key={k.kitchen_code} value={k.kitchen_code}>
                                            {k.kitchen_name}
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
                                    const price = customPrices[productCode] ??
                                        (unit === product.productUnit1.unit_code ?
                                            product.bulk_unit_price :
                                            product.retail_unit_price);
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
                                                    dateFormat="MM/dd/yyyy"  // Changed from dd/MM/yyyy
                                                    customInput={<TextField size="small" sx={{ width: '120px' }} />}
                                                />
                                            </td>
                                            <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                {product.tax1 === 'Y' ? 'Yes' : 'No'}
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
                                            <td>
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={customPrices[productCode] ?? price}
                                                    onChange={(e) => {
                                                        const newPrice = Number(e.target.value);
                                                        if (!isNaN(newPrice) && newPrice >= 0) {
                                                            // ทำการ update customPrices และคำนวณ totals ในทันที
                                                            const newCustomPrices = {
                                                                ...customPrices,
                                                                [productCode]: newPrice
                                                            };
                                                            setCustomPrices(newCustomPrices);

                                                            // คำนวณ totals ทันทีโดยใช้ค่าใหม่
                                                            let newTaxable = 0;
                                                            let newNonTaxable = 0;
                                                            let newTotal = 0;

                                                            products.forEach(p => {
                                                                const pUnit = units[p.product_code] || p.productUnit1.unit_code;
                                                                const pPrice = p.product_code === productCode ?
                                                                    newPrice :
                                                                    (customPrices[p.product_code] ??
                                                                        (pUnit === p.productUnit1.unit_code ?
                                                                            p.bulk_unit_price :
                                                                            p.retail_unit_price));
                                                                const pAmount = Number(p.amount || 0);
                                                                const lineTotal = pAmount * pPrice;

                                                                if (p.tax1 === 'Y') {
                                                                    newTaxable += lineTotal;
                                                                } else {
                                                                    newNonTaxable += lineTotal;
                                                                }

                                                                newTotal += lineTotal;
                                                            });

                                                            const newSaleTax = newTaxable * TAX_RATE;
                                                            const newTotalDue = newTotal + newSaleTax;

                                                            setTaxableAmount(newTaxable);
                                                            setNonTaxableAmount(newNonTaxable);
                                                            setSaleTax(newSaleTax);
                                                            setTotal(newTotal);
                                                            setTotalDue(newTotalDue);
                                                        }
                                                    }}
                                                    sx={{
                                                        width: '100px',
                                                        '& input': {
                                                            padding: '8px'
                                                        }
                                                    }}
                                                    inputProps={{
                                                        min: 0,
                                                        step: "any"
                                                    }}
                                                />
                                            </td>
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

                        <Box sx={{ width: '100%', height: 'auto', bgcolor: '#EAB86C', borderRadius: '10px', p: '18px', mt: 3 }}>
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
                            sx={{ width: '100%', height: '48px', mt: '24px', bgcolor: '#754C27', color: '#FFFFFF' }}>
                            Save
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default CreateReceiptFromKitchen;