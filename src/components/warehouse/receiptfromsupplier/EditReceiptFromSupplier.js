import { Box, Button, InputAdornment, TextField, Typography, IconButton, Grid2, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { updateWh_rfs, Wh_rfsByRefno } from '../../../api/warehouse/wh_rfsApi';
import { updateWh_rfsdt, deleteWh_rfsdt, addWh_rfsdt } from '../../../api/warehouse/wh_rfsdtApi';
import { searchProductName } from '../../../api/productrecordApi';
import { supplierAll } from '../../../api/supplierApi';
import { branchAll } from '../../../api/branchApi';
import Swal from 'sweetalert2';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Utility Functions
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
                    mt: '8px'
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

export default function EditReceiptFromSupplier({ onBack, editRefno }) {
    const dispatch = useDispatch();
    const [editDate, setEditDate] = useState(new Date());
    const [supplier, setSupplier] = useState([]);
    const [branch, setBranch] = useState([]);
    const [saveSupplier, setSaveSupplier] = useState('');
    const [saveBranch, setSaveBranch] = useState('-');
    const [products, setProducts] = useState([]);
    const [originalProducts, setOriginalProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [totals, setTotals] = useState({});
    const [taxableAmount, setTaxableAmount] = useState(0);
    const [nonTaxableAmount, setNonTaxableAmount] = useState(0);
    const [total, setTotal] = useState(0);
    const [deliverySurcharge, setDeliverySurcharge] = useState(0);
    const [saleTax, setSaleTax] = useState(0);
    const [totalDue, setTotalDue] = useState(0);
    const [temperatures, setTemperatures] = useState({});
    const TAX_RATE = 0.07;

    useEffect(() => {
        dispatch(Wh_rfsByRefno(editRefno))
            .unwrap()
            .then((res) => {
                // แปลงวันที่
                const [month, day, year] = res.data.rdate.split("/");
                setEditDate(new Date(year, month - 1, day));

                // เซ็ตข้อมูล supplier และ branch
                setSaveSupplier(res.data.supplier_code);
                setSaveBranch('-');

                // ตรวจสอบว่า wh_rfsdts มีข้อมูลหรือไม่
                console.log("Details data:", res.data.wh_rfsdts);

                const initialProducts = res.data.wh_rfsdts.map(item => {
                    // ถ้า tbl_product ไม่มีข้อมูล productUnit1 หรือ productUnit2 ให้กำหนดค่าเริ่มต้น
                    const defaultUnit = { unit_code: item.unit_code, unit_name: item.tbl_unit?.unit_name || 'EA' };

                    return {
                        product_code: item.product_code,
                        product_name: item.tbl_product?.product_name || '',
                        bulk_unit_price: item.tbl_product?.bulk_unit_price || item.uprice,
                        retail_unit_price: item.tbl_product?.retail_unit_price || item.uprice,
                        tax1: item.tax1 || 'N',
                        productUnit1: item.tbl_product?.productUnit1 || defaultUnit,
                        productUnit2: item.tbl_product?.productUnit2 || defaultUnit,
                        amount: item.qty,
                        unit_code: item.unit_code,
                        temperature1: item.temperature1 || '',
                        uprice: item.uprice,
                        isNewProduct: false
                    };
                });

                setProducts(initialProducts);
                setOriginalProducts(initialProducts);

                // ตั้งค่าเริ่มต้นสำหรับแต่ละผลิตภัณฑ์
                const initialQuantities = {};
                const initialUnits = {};
                const initialTemperatures = {};

                initialProducts.forEach(product => {
                    const productCode = product.product_code;
                    initialQuantities[productCode] = parseInt(product.amount);
                    initialUnits[productCode] = product.unit_code;
                    initialTemperatures[productCode] = product.temperature1;
                });

                setQuantities(initialQuantities);
                setUnits(initialUnits);
                setTemperatures(initialTemperatures);
                setDeliverySurcharge(parseFloat(res.data.delivery_surcharge) || 0);
                setSaleTax(parseFloat(res.data.sale_tax) || 0);
                setTotalDue(parseFloat(res.data.total_due) || 0);

                calculateOrderTotals(initialProducts, initialQuantities, initialUnits);
            })
            .catch((err) => {
                console.error("Error loading receipt data:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error loading receipt data',
                    text: err.message
                });
            });

        // โหลด suppliers และ branches สำหรับ dropdown
        Promise.all([
            dispatch(branchAll({ offset: 0, limit: 9999 })).unwrap(),
            dispatch(supplierAll({ offset: 0, limit: 9999 })).unwrap()
        ])
            .then(([branchRes, supplierRes]) => {
                setBranch(branchRes.data);
                setSupplier(supplierRes.data);
            })
            .catch((err) => {
                console.error("Error loading reference data:", err);
            });
    }, [dispatch, editRefno]);

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
        // ตรวจสอบว่าสินค้ามีอยู่แล้วหรือไม่
        if (products.some(p => p.product_code === product.product_code)) {
            Swal.fire({
                icon: 'warning',
                title: 'Product already exists',
                timer: 1500,
                showConfirmButton: false
            });
            return;
        }

        // สร้างค่าเริ่มต้นสำหรับ unit ในกรณีที่ไม่มีข้อมูล
        const defaultUnit = { unit_code: 'EA', unit_name: 'Each' };

        const newProduct = {
            ...product,
            productUnit1: product.productUnit1 || defaultUnit,
            productUnit2: product.productUnit2 || defaultUnit,
            amount: 1,
            temperature1: '38',
            isNewProduct: true
        };

        setProducts(prev => [...prev, newProduct]);
        setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
        setUnits(prev => ({ ...prev, [product.product_code]: newProduct.productUnit1.unit_code }));
        setTemperatures(prev => ({ ...prev, [product.product_code]: '38' }));

        calculateOrderTotals();
        setSearchTerm('');
    };

    const calculateOrderTotals = (currentProducts = products, currentQuantities = quantities, currentUnits = units) => {
        let newTaxable = 0;
        let newNonTaxable = 0;

        currentProducts.forEach(product => {
            const amount = Number(product.amount || 0);
            const unit = currentUnits[product.product_code] || product.productUnit1.unit_code;
            const price = unit === product.productUnit1.unit_code ?
                product.bulk_unit_price : product.retail_unit_price;
            const lineTotal = amount * price;

            if (product.tax1 === 'Y') {
                newTaxable += lineTotal;
            } else {
                newNonTaxable += lineTotal;
            }
        });

        const newSaleTax = newTaxable * TAX_RATE;
        const newTotal = newTaxable + newNonTaxable;
        const newTotalDue = newTotal + newSaleTax + deliverySurcharge;

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setSaleTax(newSaleTax);
        setTotal(newTotal);
        setTotalDue(newTotalDue);
    };

    const handleDeleteProduct = (productCode) => {
        const updatedProducts = products.filter(p => p.product_code !== productCode);
        setProducts(updatedProducts);

        const newQuantities = { ...quantities };
        const newUnits = { ...units };
        const newTemperatures = { ...temperatures };

        delete newQuantities[productCode];
        delete newUnits[productCode];
        delete newTemperatures[productCode];

        setQuantities(newQuantities);
        setUnits(newUnits);
        setTemperatures(newTemperatures);

        calculateOrderTotals(updatedProducts, newQuantities, newUnits);
    };

    const handleUpdate = async () => {
        if (!saveSupplier || products.length === 0) {
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
                title: 'Updating...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const headerData = {
                refno: editRefno,
                rdate: formatDate(editDate),
                supplier_code: saveSupplier,
                branch_code: saveBranch,
                trdate: editDate.toISOString().slice(0, 10).replace(/-/g, ''),
                monthh: String(editDate.getMonth() + 1).padStart(2, '0'),
                myear: editDate.getFullYear(),
                taxable: taxableAmount.toString(),
                nontaxable: nonTaxableAmount.toString(),
                total: total.toString(),
                instant_saving: "0",
                delivery_surcharge: deliverySurcharge.toString(),
                sale_tax: saleTax.toString(),
                total_due: totalDue.toString()
            };

            // Update header
            await dispatch(updateWh_rfs(headerData)).unwrap();

            // Handle deleted products
            const deletedProducts = originalProducts.filter(
                original => !products.some(current => current.product_code === original.product_code)
            );

            for (const product of deletedProducts) {
                await dispatch(deleteWh_rfsdt({
                    refno: editRefno,
                    product_code: product.product_code
                })).unwrap();
            }

            // Update existing and add new products
            for (const product of products) {
                const productData = {
                    refno: editRefno,
                    product_code: product.product_code,
                    qty: quantities[product.product_code]?.toString() || '1',
                    unit_code: units[product.product_code] || product.productUnit1?.unit_code || 'EA',
                    uprice: product.uprice?.toString() || '0',
                    tax1: product.tax1 || 'N',
                    expire_date: '',
                    texpire_date: '',
                    instant_saving1: '0',
                    temperature1: temperatures[product.product_code] || '',
                    amt: (quantities[product.product_code] * product.uprice).toString() || '0'
                };

                if (product.isNewProduct) {
                    await dispatch(addWh_rfsdt(productData)).unwrap();
                } else {
                    await dispatch(updateWh_rfsdt(productData)).unwrap();
                }
            }

            Swal.fire({
                icon: 'success',
                title: 'Updated successfully',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                onBack();
            });
        } catch (error) {
            console.error("Update error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error updating receipt',
                text: error.message
            });
        }
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

            {/* Main content - similar to CreateReceiptFromSupplier but with edit functionality */}
            <Box sx={{ width: '100%', mt: '10px', flexDirection: 'column' }}>
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
                                        if (date && !isNaN(date.getTime())) { // ตรวจสอบว่าวันที่ถูกต้อง
                                            setEditDate(date);
                                        }
                                    }}
                                    dateFormat="MM/dd/yyyy"
                                    placeholderText="MM/DD/YYYY"
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
                        </Box>

                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}>
                            <table style={{ width: '100%', marginTop: '24px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '4px', fontSize: '14px', width: '1%', color: '#754C27', fontWeight: '800' }}>No.</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '10%', color: '#754C27', fontWeight: '800' }}>Product code</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '10%', color: '#754C27', fontWeight: '800' }}>Product name</th>
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
                                        const currentUnit = units[productCode] || product.unit_code;
                                        const quantity = quantities[productCode] || 1;
                                        const price = product.uprice;
                                        const total = quantity * price;

                                        return (
                                            <tr key={productCode}>
                                                <td style={{ padding: '4px', fontSize: '12px', fontWeight: '800' }}>{index + 1}</td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>{productCode}</td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>{product.product_name}</td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                    {product.tax1 === 'Y' ? 'Yes' : 'No'}
                                                </td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                    <TextField
                                                        size="small"
                                                        value={temperatures[productCode] || ''}
                                                        onChange={(e) => {
                                                            setTemperatures(prev => ({
                                                                ...prev,
                                                                [productCode]: e.target.value
                                                            }));
                                                        }}
                                                        sx={{ width: '80px' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={quantity}
                                                        onChange={(e) => {
                                                            const newAmount = Number(e.target.value);
                                                            setQuantities(prev => ({
                                                                ...prev,
                                                                [productCode]: newAmount
                                                            }));
                                                            product.amount = newAmount;
                                                            calculateOrderTotals();
                                                        }}
                                                        sx={{ width: '80px' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                    <select
                                                        value={currentUnit}
                                                        onChange={(e) => {
                                                            setUnits(prev => ({
                                                                ...prev,
                                                                [productCode]: e.target.value
                                                            }));
                                                            calculateOrderTotals();
                                                        }}
                                                        style={{ padding: '4px', borderRadius: '4px' }}
                                                    >
                                                        {/* ต้องมีการตรวจสอบว่ามีข้อมูลหรือไม่ก่อนแสดง option */}
                                                        {product.productUnit1 && (
                                                            <option value={product.productUnit1.unit_code}>{product.productUnit1.unit_name}</option>
                                                        )}
                                                        {product.productUnit2 && (
                                                            <option value={product.productUnit2.unit_code}>{product.productUnit2.unit_name}</option>
                                                        )}
                                                        {/* ถ้าไม่มีข้อมูล unit ให้แสดงค่าเริ่มต้น */}
                                                        {(!product.productUnit1 && !product.productUnit2) && (
                                                            <option value={product.unit_code}>{product.unit_code}</option>
                                                        )}
                                                    </select>
                                                </td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                    {price.toFixed(2)}
                                                </td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                    {total.toFixed(2)}
                                                </td>
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
                        </Box>

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
                                                    if (!isNaN(newValue)) {
                                                        setDeliverySurcharge(newValue);
                                                        setTimeout(() => {
                                                            const newTotalDue = total + saleTax + newValue;
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
                            onClick={handleUpdate}
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
}
