import { Box, Button, InputAdornment, TextField, Typography, IconButton, Grid2, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { updateWh_rfk, Wh_rfkByRefno } from '../../../api/warehouse/wh_rfkApi';
import { updateWh_rfkdt, deleteWh_rfkdt, addWh_rfkdt } from '../../../api/warehouse/wh_rfkdtApi';
import { searchProductName } from '../../../api/productrecordApi';
import { kitchenAll } from '../../../api/kitchenApi';
import Swal from 'sweetalert2';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Utility Functions
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

function EditReceiptFromKitchen({ onBack, editRefno }) {
    const dispatch = useDispatch();
    const [editDate, setEditDate] = useState(new Date());
    const [kitchen, setKitchen] = useState([]);
    const [saveKitchen, setSaveKitchen] = useState('');
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
    const [saleTax, setSaleTax] = useState(0);
    const [totalDue, setTotalDue] = useState(0);
    const [expiryDates, setExpiryDates] = useState({});
    const [temperatures, setTemperatures] = useState({});
    const TAX_RATE = 0.07;

    useEffect(() => {
        let offset = 0;
        let limit = 100;

        Promise.all([
            dispatch(kitchenAll({ offset, limit })).unwrap(),
            dispatch(Wh_rfkByRefno(editRefno)).unwrap()
        ]).then(([kitchenRes, rfkRes]) => {
            setKitchen(kitchenRes.data);

            const rfkData = rfkRes.data;

            if (rfkData.rdate) {
                try {
                    const [month, day, year] = rfkData.rdate.split('/');
                    const parsedDate = new Date(+year, +month - 1, +day);
                    if (!isNaN(parsedDate.getTime())) {
                        setEditDate(parsedDate);
                    }
                } catch (error) {
                    console.error("Error parsing date:", error);
                    setEditDate(new Date());
                }
            }

            setSaveKitchen(rfkData.kitchen_code);

            const initialProducts = rfkData.wh_rfkdts.map(item => ({
                ...item.tbl_product,
                amount: item.qty,
                unit_code: item.unit_code,
                temperature1: item.temperature1,
                isNewProduct: false
            }));

            setProducts(initialProducts);
            setOriginalProducts(initialProducts);

            // Initialize states for each product
            const initialQuantities = {};
            const initialUnits = {};
            const initialExpiryDates = {};
            const initialTemperatures = {};

            initialProducts.forEach(product => {
                const productCode = product.product_code;
                initialQuantities[productCode] = parseInt(product.amount);
                initialUnits[productCode] = product.unit_code;
                initialTemperatures[productCode] = product.temperature1;

                try {
                    if (product.expire_date) {
                        const [month, day, year] = product.expire_date.split('/');
                        const expiryDate = new Date(+year, +month - 1, +day);
                        if (!isNaN(expiryDate.getTime())) {
                            initialExpiryDates[productCode] = expiryDate;
                        } else {
                            initialExpiryDates[productCode] = new Date();
                        }
                    } else {
                        initialExpiryDates[productCode] = new Date();
                    }
                } catch (error) {
                    console.error("Error parsing expiry date for product", productCode, error);
                    initialExpiryDates[productCode] = new Date();
                }
            });

            setQuantities(initialQuantities);
            setUnits(initialUnits);
            setExpiryDates(initialExpiryDates);
            setTemperatures(initialTemperatures);
            setSaleTax(parseFloat(rfkData.sale_tax) || 0);
            setTotalDue(parseFloat(rfkData.total_due) || 0);

            calculateOrderTotals(initialProducts, initialQuantities, initialUnits);
        }).catch(err => {
            console.error("Error loading data:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error loading data',
                text: err.message
            });
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
        if (products.some(p => p.product_code === product.product_code)) {
            Swal.fire({
                icon: 'warning',
                title: 'Product already exists',
                timer: 1500,
                showConfirmButton: false
            });
            return;
        }

        const newProduct = {
            ...product,
            amount: 1,
            isNewProduct: true
        };

        setProducts(prev => [...prev, newProduct]);
        setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
        setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1.unit_code }));
        setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));
        setTemperatures(prev => ({ ...prev, [product.product_code]: '38' }));

        calculateOrderTotals([...products, newProduct], quantities, units);
        setSearchTerm('');
        setShowDropdown(false);
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
        const newTotalDue = newTotal + newSaleTax;

        setTaxableAmount(newTaxable);
        setNonTaxableAmount(newNonTaxable);
        setSaleTax(newSaleTax);
        setTotal(newTotal);
        setTotalDue(newTotalDue);
    };

    const handleDeleteProduct = (productCode) => {
        const updatedProducts = products.filter(p => p.product_code !== productCode);
        setProducts(updatedProducts);
        calculateOrderTotals(updatedProducts, quantities, units);
    };

    const handleUpdate = async () => {
        if (!saveKitchen || products.length === 0) {
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
                kitchen_code: saveKitchen,
                trdate: editDate.toISOString().slice(0, 10).replace(/-/g, ''),
                monthh: String(editDate.getMonth() + 1).padStart(2, '0'),
                myear: editDate.getFullYear(),
                taxable: taxableAmount.toString(),
                nontaxable: nonTaxableAmount.toString(),
                total: total.toString(),
                sale_tax: saleTax.toString(),
                total_due: totalDue.toString()
            };

            // Update header
            await dispatch(updateWh_rfk(headerData)).unwrap();

            // Handle deleted products
            const deletedProducts = originalProducts.filter(
                original => !products.some(current => current.product_code === original.product_code)
            );

            for (const product of deletedProducts) {
                await dispatch(deleteWh_rfkdt({
                    refno: editRefno,
                    product_code: product.product_code
                })).unwrap();
            }

            // Update existing and add new products
            for (const product of products) {
                const productData = {
                    refno: editRefno,
                    product_code: product.product_code,
                    qty: product.amount.toString(),
                    unit_code: units[product.product_code] || product.productUnit1.unit_code,
                    uprice: (units[product.product_code] === product.productUnit1.unit_code ?
                        product.bulk_unit_price : product.retail_unit_price).toString(),
                    tax1: product.tax1,
                    expire_date: formatDate(expiryDates[product.product_code]),
                    texpire_date: expiryDates[product.product_code]?.toISOString().slice(0, 10).replace(/-/g, ''),
                    temperature1: temperatures[product.product_code] || '',
                    amt: (product.amount * (units[product.product_code] === product.productUnit1.unit_code ?
                        product.bulk_unit_price : product.retail_unit_price)).toString()
                };

                if (product.isNewProduct) {
                    await dispatch(addWh_rfkdt(productData)).unwrap();
                } else {
                    await dispatch(updateWh_rfkdt(productData)).unwrap();
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

    // Rest of the render logic similar to CreateReceiptFromKitchen but with update functionality
    return (
        <Box sx={{ width: '100%' }}>
            <Button
                onClick={onBack}
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2 }}
            >
                Back to Receipt From Kitchen
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
                                        if (date && !isNaN(date.getTime())) {
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
                                                        onChange={(date) => {
                                                            setExpiryDates(prev => ({
                                                                ...prev,
                                                                [productCode]: date
                                                            }));
                                                        }}
                                                        dateFormat="MM/dd/yyyy"
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
                                                        value={amount}
                                                        onChange={(e) => {
                                                            const newAmount = Number(e.target.value);
                                                            product.amount = newAmount;
                                                            calculateOrderTotals();
                                                        }}
                                                        sx={{ width: '80px' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                                                    <select
                                                        value={unit}
                                                        onChange={(e) => {
                                                            setUnits(prev => ({
                                                                ...prev,
                                                                [productCode]: e.target.value
                                                            }));
                                                            calculateOrderTotals();
                                                        }}
                                                        style={{ padding: '4px', borderRadius: '4px' }}
                                                    >
                                                        <option value={product.productUnit1.unit_code}>{product.productUnit1.unit_name}</option>
                                                        <option value={product.productUnit2.unit_code}>{product.productUnit2.unit_name}</option>
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

export default EditReceiptFromKitchen;