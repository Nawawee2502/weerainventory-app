import { Box, Button, InputAdornment, TextField, Typography, IconButton, Grid2, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { branchAll } from '../../../api/branchApi';
import { updateKt_dpbdt, deleteKt_dpbdt, addKt_dpbdt } from '../../../api/kitchen/kt_dpbdtApi';
import { updateKt_dpb, Kt_dpbByRefno } from '../../../api/kitchen/kt_dpbApi';
import { searchProductName } from '../../../api/productrecordApi';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Swal from 'sweetalert2';

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

const convertToLasVegasTime = (date) => {
    if (!date) return new Date();
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return new Date(newDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
};

const formatDate = (date) => {
    if (!date) return "";
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

export default function EditPurchaseOrderToWarehouse({ onBack, editRefno }) {
    const dispatch = useDispatch();
    const [branch, setBranch] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [totals, setTotals] = useState({});
    const [editDate, setEditDate] = useState(new Date());
    const [saveBranch, setSaveBranch] = useState('');
    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [total, setTotal] = useState(0);
    const [originalProducts, setOriginalProducts] = useState([]);
    const [taxableAmount, setTaxableAmount] = useState(0);
    const [nonTaxableAmount, setNonTaxableAmount] = useState(0);
    const [unitPrices, setUnitPrices] = useState({});
    const TAX_RATE = 0.07;

    useEffect(() => {
        dispatch(Kt_dpbByRefno(editRefno))
            .unwrap()
            .then((res) => {
                const [day, month, year] = res.data.rdate.split("/");
                setEditDate(new Date(year, month - 1, day));
                setSaveBranch(res.data.branch_code);

                const initialUnitPrices = {};
                const orderProducts = res.data.kt_dpbdts.map(item => ({
                    product_code: item.product_code,
                    product_name: item.tbl_product.product_name,
                    bulk_unit_price: item.tbl_product.bulk_unit_price,
                    retail_unit_price: item.tbl_product.retail_unit_price,
                    productUnit1: item.tbl_product.productUnit1,
                    productUnit2: item.tbl_product.productUnit2,
                    qty: item.qty,
                    unit_code: item.unit_code,
                    uprice: item.uprice,
                    amt: item.amt,
                    isNewProduct: false
                }));

                orderProducts.forEach(item => {
                    initialUnitPrices[item.product_code] = parseFloat(item.uprice);
                });

                setUnitPrices(initialUnitPrices);
                setProducts(orderProducts);
                setOriginalProducts(orderProducts);

                const initialQuantities = {};
                const initialUnits = {};
                const initialTotals = {};

                orderProducts.forEach(item => {
                    initialQuantities[item.product_code] = parseInt(item.qty);
                    initialUnits[item.product_code] = item.unit_code;
                    initialTotals[item.product_code] = parseFloat(item.amt);
                });

                setQuantities(initialQuantities);
                setUnits(initialUnits);
                setTotals(initialTotals);
                calculateOrderTotals();
            })
            .catch((err) => {
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error loading order data',
                    text: err.message,
                    confirmButtonText: 'OK'
                });
            });

        dispatch(branchAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((res) => setBranch(res.data))
            .catch((err) => console.error(err));
    }, [dispatch, editRefno]);

    const calculateOrderTotals = () => {
        let taxable = 0;
        let nonTaxable = 0;

        products.forEach(product => {
            const productCode = product.product_code;
            const quantity = quantities[productCode] || 1;
            const unitCode = units[productCode] || product.productUnit1.unit_code;
            const unitPrice = unitPrices[productCode] ??
                (unitCode === product.productUnit1.unit_code
                    ? product.bulk_unit_price
                    : product.retail_unit_price);
            const amount = quantity * unitPrice;

            if (product.tax1 === 'Y') {
                taxable += amount * (1 + TAX_RATE);
            } else {
                nonTaxable += amount;
            }
        });

        setTaxableAmount(taxable);
        setNonTaxableAmount(nonTaxable);
        setTotal(taxable + nonTaxable);
    };

    const handleUpdateOrder = async () => {
        if (!saveBranch || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please fill in all required fields',
                timer: 1500
            });
            return;
        }

        try {
            const headerData = {
                refno: editRefno,
                rdate: formatDate(editDate),
                branch_code: saveBranch,
                trdate: `${editDate.getFullYear()}${String(editDate.getMonth() + 1).padStart(2, '0')}${String(editDate.getDate()).padStart(2, '0')}`,
                myear: editDate.getFullYear().toString(),
                monthh: String(editDate.getMonth() + 1).padStart(2, '0'),
                taxable: taxableAmount.toString(),
                nontaxable: nonTaxableAmount.toString(),
                total: total.toString()
            };

            await dispatch(updateKt_dpb(headerData)).unwrap();

            const deletedProducts = originalProducts.filter(original =>
                !products.some(current => current.product_code === original.product_code)
            );

            for (const product of deletedProducts) {
                await dispatch(deleteKt_dpbdt({
                    refno: editRefno,
                    product_code: product.product_code
                })).unwrap();
            }

            for (const product of products) {
                const productData = {
                    refno: editRefno,
                    product_code: product.product_code,
                    qty: quantities[product.product_code].toString(),
                    unit_code: units[product.product_code],
                    uprice: unitPrices[product.product_code].toString(),
                    amt: totals[product.product_code].toString()
                };

                if (product.isNewProduct) {
                    await dispatch(addKt_dpbdt(productData)).unwrap();
                } else {
                    await dispatch(updateKt_dpbdt(productData)).unwrap();
                }
            }

            Swal.fire({
                icon: 'success',
                title: 'Order updated successfully',
                timer: 1500,
                showConfirmButton: false
            });

            onBack();

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error updating order',
                text: error.message || 'An unknown error occurred',
                confirmButtonText: 'OK'
            });
        }
    };

    // Additional handlers
    const handleSearchChange = (e) => {
        if (e.key === 'Enter') {
            searchProduct();
        } else {
            setSearchTerm(e.target.value);
        }
    };

    const searchProduct = () => {
        dispatch(searchProductName({ product_name: searchTerm }))
            .unwrap()
            .then((res) => {
                const newProduct = {
                    ...res.data[0],
                    isNewProduct: true
                };

                if (products.some(p => p.product_code === newProduct.product_code)) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Product already exists in the order',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    return;
                }

                setProducts(prev => [...prev, newProduct]);
                setQuantities(prev => ({
                    ...prev,
                    [newProduct.product_code]: 1
                }));
                setUnits(prev => ({
                    ...prev,
                    [newProduct.product_code]: newProduct.productUnit1.unit_code
                }));

                const total = calculateTotal(1, newProduct.productUnit1.unit_code, newProduct);
                setTotals(prev => ({
                    ...prev,
                    [newProduct.product_code]: total
                }));

                setSearchTerm('');
                calculateOrderTotals();
            })
            .catch((err) => console.log(err.message));
    };

    const handleUnitPriceChange = (productCode, value) => {
        const newPrice = parseFloat(value);
        if (!isNaN(newPrice) && newPrice >= 0) {
            const newUnitPrices = {
                ...unitPrices,
                [productCode]: newPrice
            };

            let newTaxable = 0;
            let newNonTaxable = 0;
            const newTotals = { ...totals };

            products.forEach(product => {
                const currentCode = product.product_code;
                const quantity = quantities[currentCode] || 1;
                const unitCode = units[currentCode] || product.productUnit1.unit_code;
                const currentPrice = currentCode === productCode ?
                    newPrice :
                    (newUnitPrices[currentCode] ??
                        (unitCode === product.productUnit1.unit_code ?
                            product.bulk_unit_price :
                            product.retail_unit_price));

                const amount = quantity * currentPrice;
                newTotals[currentCode] = amount;

                if (product.tax1 === 'Y') {
                    newTaxable += amount * (1 + TAX_RATE);
                } else {
                    newNonTaxable += amount;
                }
            });

            setUnitPrices(newUnitPrices);
            setTotals(newTotals);
            setTaxableAmount(newTaxable);
            setNonTaxableAmount(newNonTaxable);
            setTotal(newTaxable + newNonTaxable);
        }
    };

    const handleQuantityChange = (productCode, newQuantity) => {
        if (newQuantity >= 1) {
            setQuantities(prev => ({
                ...prev,
                [productCode]: parseInt(newQuantity)
            }));
            calculateOrderTotals();
        }
    };

    const handleUnitChange = (productCode, newUnitCode) => {
        const product = products.find(p => p.product_code === productCode);
        const defaultUnitPrice = newUnitCode === product.productUnit1.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        setUnits(prev => ({
            ...prev,
            [productCode]: newUnitCode
        }));
        setUnitPrices(prev => ({
            ...prev,
            [productCode]: defaultUnitPrice
        }));

        calculateOrderTotals();
    };

    const handleDeleteProduct = (productCode) => {
        setProducts(prev => prev.filter(p => p.product_code !== productCode));
        const newProducts = products.filter(p => p.product_code !== productCode);
        calculateOrderTotals(newProducts);
    };

    const calculateTotal = (quantity, unitCode, product, customUnitPrice) => {
        const unitPrice = customUnitPrice ?? unitPrices[product.product_code] ??
            (unitCode === product.productUnit1.unit_code
                ? product.bulk_unit_price
                : product.retail_unit_price);
        return quantity * unitPrice;
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Button onClick={onBack} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Back to Purchase Orders to Warehouse
            </Button>

            <Box sx={{ width: '100%', mt: '10px', flexDirection: 'column' }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    border: '1px solid #E4E4E4',
                    borderRadius: '10px',
                    bgcolor: '#FFFFFF',
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
                                    value={editRefno}
                                    disabled
                                    size="small"
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
                                    selected={editDate}
                                    onChange={(date) => {
                                        const vegasDate = convertToLasVegasTime(date);
                                        setEditDate(vegasDate);
                                    }}
                                    dateFormat="MM/dd/yyyy"
                                    customInput={<CustomInput />}
                                />
                            </Grid2>
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Restaurant
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
                                        }
                                    }}
                                >
                                    <option value="">Select a Restaurant</option>
                                    {branch.map((item) => (
                                        <option key={item.branch_code} value={item.branch_code}>
                                            {item.branch_name}
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
                            <TextField
                                value={searchTerm}
                                onKeyUp={handleSearchChange}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search"
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: '30px',
                                        width: '100%'
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        padding: '8.5px 14px',
                                    },
                                    width: '50%',
                                    ml: '12px'
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: '#5A607F' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button
                                onClick={() => {
                                    setProducts([]);
                                    setQuantities({});
                                    setUnits({});
                                    setTotals({});
                                    calculateOrderTotals();
                                }}
                                sx={{
                                    ml: 'auto',
                                    bgcolor: '#E2EDFB',
                                    borderRadius: '6px',
                                    width: '105px',
                                    '&:hover': {
                                        bgcolor: '#C5D9F2',
                                    }
                                }}
                            >
                                Clear All
                            </Button>
                        </Box>

                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}>
                            <table style={{ width: '100%', marginTop: '24px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '4px', fontSize: '14px', width: '1%', color: '#754C27', fontWeight: '800' }}>No.</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '15%', color: '#754C27', fontWeight: '800' }}>Product Code</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '15%', color: '#754C27', fontWeight: '800' }}>Product Name</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Quantity</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Unit</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Unit Price</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Tax</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Total</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '1%', color: '#754C27', fontWeight: '800' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, index) => {
                                        const productCode = product.product_code;
                                        const currentUnit = units[productCode] || product.productUnit1.unit_code;
                                        const currentQuantity = quantities[productCode] || 1;
                                        const currentUnitPrice = unitPrices[productCode] ??
                                            (currentUnit === product.productUnit1.unit_code
                                                ? product.bulk_unit_price
                                                : product.retail_unit_price);
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
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={unitPrices[productCode] ?? currentUnitPrice}
                                                        onChange={(e) => handleUnitPriceChange(productCode, parseFloat(e.target.value))}
                                                        style={{
                                                            width: '80px',
                                                            textAlign: 'center',
                                                            fontWeight: '600',
                                                            padding: '4px'
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                    {product.tax1 === 'Y' ? 'Yes' : 'No'}
                                                </td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                    ${totals[productCode]?.toFixed(2)}
                                                </td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                    <IconButton
                                                        onClick={() => handleDeleteProduct(productCode)}
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
                            onClick={handleUpdateOrder}
                            sx={{
                                width: '100%',
                                height: '48px',
                                mt: '24px',
                                bgcolor: '#754C27',
                                color: '#FFFFFF',
                                '&:hover': {
                                    bgcolor: '#5D3A1F',
                                }
                            }}
                        >
                            Update
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );

};