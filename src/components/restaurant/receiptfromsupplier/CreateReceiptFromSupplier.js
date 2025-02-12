import { Box, Button, InputAdornment, TextField, Typography, IconButton, Grid2, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { addBr_rfs, Br_rfsrefno } from '../../../api/restaurant/br_rfsApi';
import { searchProductName } from '../../../api/productrecordApi';
import { supplierAll } from '../../../api/supplierApi';
import { branchAll } from '../../../api/branchApi';
import Swal from 'sweetalert2';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const formatDate = (date) => {
    if (!date) return "";
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

const formatTRDate = (date) => {
    if (!date) return "";
    const clonedDate = new Date(date);
    const year = clonedDate.getFullYear();
    const month = String(clonedDate.getMonth() + 1).padStart(2, '0');
    const day = String(clonedDate.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
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

function CreateBranchReceiptFromSupplier({ onBack }) {
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
    const [instantSaving, setInstantSaving] = useState(0);
    const [expiryDates, setExpiryDates] = useState({});
    const [temperatures, setTemperatures] = useState({});
    const [customPrices, setCustomPrices] = useState({});
    const [taxableAmount, setTaxableAmount] = useState(0);
    const [nonTaxableAmount, setNonTaxableAmount] = useState(0);
    const [total, setTotal] = useState(0);
    const [deliverySurcharge, setDeliverySurcharge] = useState(0);
    const [saleTax, setSaleTax] = useState(0);
    const [totalDue, setTotalDue] = useState(0);
    const TAX_RATE = 0.07;

    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson);

    useEffect(() => {
        const currentDate = new Date();
        handleGetLastRefNo(currentDate);

        let offset = 0;
        let limit = 100;

        dispatch(branchAll({ offset, limit }))
            .unwrap()
            .then((res) => setBranch(res.data))
            .catch((err) => console.log(err.message));

        dispatch(supplierAll({ offset, limit }))
            .unwrap()
            .then((res) => setSupplier(res.data))
            .catch((err) => console.log(err.message));
    }, [dispatch]);

    const handleGetLastRefNo = async (selectedDate) => {
        try {
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);

            const res = await dispatch(Br_rfsrefno({
                month,
                year
            })).unwrap();

            if (!res.data || !res.data.refno) {
                setLastRefNo(`BRFS${year}${month}001`);
                return;
            }

            const lastRefNo = res.data.refno;
            const lastRefMonth = lastRefNo.substring(6, 8);
            const lastRefYear = lastRefNo.substring(4, 6);

            if (lastRefMonth !== month || lastRefYear !== year) {
                setLastRefNo(`BRFS${year}${month}001`);
                return;
            }

            const lastNumber = parseInt(lastRefNo.slice(-3));
            const newNumber = lastNumber + 1;
            setLastRefNo(`BRFS${year}${month}${String(newNumber).padStart(3, '0')}`);

        } catch (err) {
            console.error("Error generating refno:", err);
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear().toString().slice(-2);
            setLastRefNo(`BRFS${year}${month}001`);
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
        calculateOrderTotals();
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
        const newTotalDue = newTotal + newSaleTax + deliverySurcharge;

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setSaleTax(newSaleTax);
        setTotal(newTotal);
        setTotalDue(newTotalDue);
    };

    const handleUnitChange = (productCode, newUnit) => {
        setUnits(prev => ({ ...prev, [productCode]: newUnit }));
        setCustomPrices(prev => {
            const { [productCode]: removed, ...rest } = prev;
            return rest;
        });
        calculateOrderTotals();
    };

    const handleSave = async () => {
        if (!saveSupplier || !saveBranch || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please fill in all required fields.',
                timer: 1500
            });
            return;
        }

        try {
            Swal.fire({
                title: 'Saving...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const headerData = {
                refno: lastRefNo,
                rdate: formatDate(startDate),
                supplier_code: saveSupplier,
                branch_code: saveBranch,
                trdate: formatTRDate(startDate),
                monthh: (startDate.getMonth() + 1).toString().padStart(2, '0'),
                myear: startDate.getFullYear(),
                user_code: userData2.user_code
            };

            const productArrayData = products.map(product => ({
                refno: lastRefNo,
                product_code: product.product_code,
                qty: product.amount || 0,
                unit_code: units[product.product_code] || product.productUnit1.unit_code,
                uprice: customPrices[product.product_code] ??
                    (units[product.product_code] === product.productUnit1.unit_code ?
                        product.bulk_unit_price :
                        product.retail_unit_price),
                tax1: product.tax1,
                temperature1: temperatures[product.product_code] || '',
                amt: product.amount || 0
            }));

            const footerData = {
                taxable: taxableAmount,
                nontaxable: nonTaxableAmount,
                total: total
            };

            const result = await dispatch(addBr_rfs({
                headerData,
                productArrayData,
                footerData
            })).unwrap();

            if (result.result) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Data saved successfully',
                    timer: 1500
                });
                resetForm();
                onBack();
            }
        } catch (error) {
            console.error('Error saving RFS:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error saving data',
                confirmButtonColor: '#754C27'
            });
        }
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
        setTaxableAmount(0);
        setNonTaxableAmount(0);
        setSaleTax(0);
        setTotal(0);
        setTotalDue(0);
        setCustomPrices({});
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
                                    placeholder='Reference Number'
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
                                    dateFormat="MM/dd/yyyy"
                                    customInput={<CustomInput />}
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
                                    <option value="">Select a Branch</option>
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

                        <Box sx={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>No.</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>Product Code</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>Product Name</th>
                                        <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Tax</th>
                                        <th style={{ padding: '12px', textAlign: 'right', color: '#754C27', backgroundColor: '#f5f5f5' }}>Amount</th>
                                        <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Unit</th>
                                        <th style={{ padding: '12px', textAlign: 'right', color: '#754C27', backgroundColor: '#f5f5f5' }}>Unit Price</th>
                                        <th style={{ padding: '12px', textAlign: 'right', color: '#754C27', backgroundColor: '#f5f5f5' }}>Total</th>
                                        <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}></th>
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
                                                <td style={{ padding: '12px' }}>{index + 1}</td>
                                                <td style={{ padding: '12px' }}>{productCode}</td>
                                                <td style={{ padding: '12px' }}>{product.product_name}</td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    {product.tax1 === 'Y' ? 'Yes' : 'No'}
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                                    <input
                                                        type="number"
                                                        value={amount}
                                                        onChange={(e) => {
                                                            const newAmount = Number(e.target.value);
                                                            if (!isNaN(newAmount) && newAmount >= 0) {
                                                                product.amount = newAmount;
                                                                calculateOrderTotals();
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
                                                        value={unit}
                                                        onChange={(e) => handleUnitChange(productCode, e.target.value)}
                                                        style={{
                                                            padding: '4px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            width: '100px'
                                                        }}
                                                    >
                                                        <option value={product.productUnit1.unit_code}>
                                                            {product.productUnit1.unit_name}
                                                        </option>
                                                        <option value={product.productUnit2.unit_code}>
                                                            {product.productUnit2.unit_name}
                                                        </option>
                                                    </select>
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                                    <input
                                                        type="number"
                                                        value={customPrices[productCode] ?? price}
                                                        onChange={(e) => {
                                                            const newPrice = Number(e.target.value);
                                                            if (!isNaN(newPrice) && newPrice >= 0) {
                                                                setCustomPrices(prev => ({
                                                                    ...prev,
                                                                    [productCode]: newPrice
                                                                }));
                                                                calculateOrderTotals();
                                                            }
                                                        }}
                                                        style={{
                                                            width: '100px',
                                                            padding: '4px',
                                                            textAlign: 'right',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                                    {total.toFixed(2)}
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
                                    })}
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
                                        <Typography sx={{ color: '#FFFFFF' }}>Delivery Surcharge</Typography>
                                        <Typography sx={{ color: '#FFFFFF' }}>Sale Tax</Typography>
                                    </Box>
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={deliverySurcharge}
                                                onChange={(e) => {
                                                    const newValue = Number(e.target.value);
                                                    if (!isNaN(newValue) && newValue >= 0) {
                                                        setDeliverySurcharge(newValue);
                                                        setTimeout(calculateOrderTotals, 0);
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
                        >
                            Save
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default CreateBranchReceiptFromSupplier;