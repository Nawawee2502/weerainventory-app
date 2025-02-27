import { Box, Button, InputAdornment, TextField, Typography, IconButton, Grid2, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { Br_grfAlljoindt, updateBr_grf } from '../../../../api/restaurant/br_grfApi';
import { searchProductName } from '../../../../api/productrecordApi';
import { branchAll } from '../../../../api/branchApi';
import Swal from 'sweetalert2';
import { format, parse } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CircularProgress from '@mui/material/CircularProgress';

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
                    borderRadius: '10px'
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

export default function EditGoodsReceiptKitchen({ onBack, editRefno }) {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const [receiptDate, setReceiptDate] = useState(new Date());
    const [branchCode, setBranchCode] = useState('');
    const [branches, setBranches] = useState([]);
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [units, setUnits] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [totals, setTotals] = useState({});
    const [expiryDates, setExpiryDates] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [total, setTotal] = useState(0);

    const userDataJson = localStorage.getItem("userData2");
    const userData2 = JSON.parse(userDataJson);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch branches
                const branchResponse = await dispatch(branchAll({ offset: 0, limit: 100 })).unwrap();
                setBranches(branchResponse.data || []);

                // Fetch receipt data
                const receiptResponse = await dispatch(Br_grfAlljoindt({ refno: editRefno })).unwrap();
                if (receiptResponse.result && receiptResponse.data) {
                    const receiptData = receiptResponse.data;

                    // Set header data
                    if (receiptData.rdate) {
                        try {
                            const parsedDate = parse(receiptData.rdate, 'MM/dd/yyyy', new Date());
                            setReceiptDate(parsedDate);
                        } catch (e) {
                            console.error("Date parsing error:", e);
                            setReceiptDate(new Date());
                        }
                    }

                    setBranchCode(receiptData.branch_code || '');

                    // Process receipt products
                    if (receiptData.detail && receiptData.detail.length > 0) {
                        const productsData = [];
                        const quantitiesData = {};
                        const unitsData = {};
                        const pricesData = {};
                        const totalsData = {};
                        const expiryDatesData = {};
                        let totalSum = 0;

                        // Get full product details for each receipt product
                        await Promise.all(receiptData.detail.map(async (item) => {
                            try {
                                const productResponse = await dispatch(searchProductName({
                                    product_code: item.product_code
                                })).unwrap();

                                if (productResponse.data && productResponse.data.length > 0) {
                                    const product = productResponse.data[0];
                                    productsData.push(product);

                                    quantitiesData[product.product_code] = parseFloat(item.qty) || 1;
                                    unitsData[product.product_code] = item.unit_code || product.productUnit1.unit_code;
                                    pricesData[product.product_code] = parseFloat(item.uprice) || product.bulk_unit_price;

                                    const lineTotal = parseFloat(item.amt) ||
                                        parseFloat(item.qty) * parseFloat(item.uprice);
                                    totalsData[product.product_code] = lineTotal;
                                    totalSum += lineTotal;

                                    if (item.expire_date) {
                                        try {
                                            expiryDatesData[product.product_code] = parse(
                                                item.expire_date,
                                                'MM/dd/yyyy',
                                                new Date()
                                            );
                                        } catch (e) {
                                            expiryDatesData[product.product_code] = new Date();
                                        }
                                    } else {
                                        expiryDatesData[product.product_code] = new Date();
                                    }
                                }
                            } catch (error) {
                                console.error("Error fetching product details:", error);
                            }
                        }));

                        setProducts(productsData);
                        setQuantities(quantitiesData);
                        setUnits(unitsData);
                        setUnitPrices(pricesData);
                        setTotals(totalsData);
                        setExpiryDates(expiryDatesData);
                        setTotal(totalSum);
                    }
                }

            } catch (error) {
                console.error("Error fetching receipt data:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load receipt data',
                    confirmButtonText: 'OK'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
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
        // Check if product already exists
        if (products.some(p => p.product_code === product.product_code)) {
            Swal.fire({
                icon: 'warning',
                title: 'Product Already Added',
                text: 'This product is already in your order.',
                timer: 1500
            });
            return;
        }

        setProducts([...products, product]);
        setQuantities(prev => ({ ...prev, [product.product_code]: 1 }));
        setUnits(prev => ({ ...prev, [product.product_code]: product.productUnit1.unit_code }));
        setUnitPrices(prev => ({ ...prev, [product.product_code]: product.bulk_unit_price }));
        setExpiryDates(prev => ({ ...prev, [product.product_code]: new Date() }));

        // Calculate total
        const newLineTotal = product.bulk_unit_price * 1;
        setTotals(prev => ({ ...prev, [product.product_code]: newLineTotal }));
        setTotal(prev => prev + newLineTotal);

        setSearchTerm('');
        setShowDropdown(false);
    };

    const handleDeleteProduct = (productCode) => {
        const updatedProducts = products.filter(p => p.product_code !== productCode);
        setProducts(updatedProducts);

        // Update total
        const removedTotal = totals[productCode] || 0;
        setTotal(prev => prev - removedTotal);

        // Clean up state
        const { [productCode]: _, ...newQuantities } = quantities;
        const { [productCode]: __, ...newUnits } = units;
        const { [productCode]: ___, ...newPrices } = unitPrices;
        const { [productCode]: ____, ...newTotals } = totals;
        const { [productCode]: _____, ...newExpiryDates } = expiryDates;

        setQuantities(newQuantities);
        setUnits(newUnits);
        setUnitPrices(newPrices);
        setTotals(newTotals);
        setExpiryDates(newExpiryDates);
    };

    const handleQuantityChange = (productCode, newQuantity) => {
        if (newQuantity < 1) return;

        setQuantities(prev => ({ ...prev, [productCode]: newQuantity }));

        // Update total
        const price = unitPrices[productCode];
        const newTotal = newQuantity * price;
        const oldTotal = totals[productCode];
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(prev => prev - oldTotal + newTotal);
    };

    const handleUnitChange = (productCode, newUnit) => {
        setUnits(prev => ({ ...prev, [productCode]: newUnit }));

        const product = products.find(p => p.product_code === productCode);
        const newPrice = newUnit === product.productUnit1.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        // Update price
        const oldPrice = unitPrices[productCode];
        setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));

        // Update total
        const qty = quantities[productCode];
        const oldTotal = totals[productCode];
        const newTotal = qty * newPrice;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(prev => prev - oldTotal + newTotal);
    };

    const handleExpiryDateChange = (productCode, date) => {
        setExpiryDates(prev => ({ ...prev, [productCode]: date }));
    };

    const handlePriceChange = (productCode, newPrice) => {
        if (newPrice < 0) return;

        setUnitPrices(prev => ({ ...prev, [productCode]: newPrice }));

        // Update total
        const qty = quantities[productCode];
        const oldTotal = totals[productCode];
        const newTotal = qty * newPrice;
        setTotals(prev => ({ ...prev, [productCode]: newTotal }));
        setTotal(prev => prev - oldTotal + newTotal);
    };

    const handleUpdate = async () => {
        if (!branchCode || products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a branch and add at least one product.',
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
                rdate: formatDate(receiptDate),
                branch_code: branchCode,
                trdate: format(receiptDate, 'yyyyMMdd'),
                monthh: format(receiptDate, 'MM'),
                myear: receiptDate.getFullYear(),
                user_code: userData2.user_code,
            };

            const productArrayData = products.map(product => ({
                refno: editRefno,
                product_code: product.product_code,
                qty: quantities[product.product_code].toString(),
                unit_code: units[product.product_code],
                uprice: unitPrices[product.product_code].toString(),
                amt: totals[product.product_code].toString(),
                expire_date: formatDate(expiryDates[product.product_code]),
                texpire_date: format(expiryDates[product.product_code], 'yyyyMMdd')
            }));

            const footerData = {
                total: total.toString()
            };

            await dispatch(updateBr_grf({
                headerData,
                productArrayData,
                footerData
            })).unwrap();

            await Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Record updated successfully',
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
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: '#754C27' }} />
                <Typography sx={{ ml: 2 }}>Loading receipt data...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Button
                onClick={onBack}
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2 }}
            >
                Back to Goods Receipt Kitchen
            </Button>

            <Box sx={{ backgroundColor: '#fff', borderRadius: '10px', p: 3, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="h6" sx={{ color: '#754C27', mb: 3 }}>
                    Edit Receipt: {editRefno}
                </Typography>

                <Grid2 container spacing={3}>
                    <Grid2 item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Ref.no
                        </Typography>
                        <TextField
                            value={editRefno}
                            disabled
                            size="small"
                            fullWidth
                            sx={{
                                mt: '8px',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    fontWeight: '700'
                                },
                            }}
                        />
                    </Grid2>

                    <Grid2 item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Date
                        </Typography>
                        <DatePicker
                            selected={receiptDate}
                            onChange={(date) => setReceiptDate(date)}
                            dateFormat="MM/dd/yyyy"
                            customInput={<CustomInput />}
                        />
                    </Grid2>

                    <Grid2 item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Branch
                        </Typography>
                        <Box
                            component="select"
                            value={branchCode}
                            onChange={(e) => setBranchCode(e.target.value)}
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
                            {branches.map((branch) => (
                                <option key={branch.branch_code} value={branch.branch_code}>
                                    {branch.branch_name}
                                </option>
                            ))}
                        </Box>
                    </Grid2>

                    <Grid2 item xs={12} md={6}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                            Add Products
                        </Typography>
                        <Box sx={{ position: 'relative', width: '100%', mt: '8px' }}>
                            <TextField
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Search for products..."
                                size="small"
                                fullWidth
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
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
                                            <Typography variant="caption" color="text.secondary">
                                                {product.product_code} - ${product.bulk_unit_price.toFixed(2)}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Grid2>
                </Grid2>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ color: '#754C27', mb: 2 }}>
                    Product List
                </Typography>

                <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>No.</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>Product Code</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#754C27', backgroundColor: '#f5f5f5' }}>Product Name</th>
                                <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Expiry Date</th>
                                <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Quantity</th>
                                <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Unit</th>
                                <th style={{ padding: '12px', textAlign: 'right', color: '#754C27', backgroundColor: '#f5f5f5' }}>Unit Price</th>
                                <th style={{ padding: '12px', textAlign: 'right', color: '#754C27', backgroundColor: '#f5f5f5' }}>Total</th>
                                <th style={{ padding: '12px', textAlign: 'center', color: '#754C27', backgroundColor: '#f5f5f5' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>
                                        No products added yet
                                    </td>
                                </tr>
                            ) : (
                                products.map((product, index) => (
                                    <tr key={product.product_code}>
                                        <td style={{ padding: '12px' }}>{index + 1}</td>
                                        <td style={{ padding: '12px' }}>{product.product_code}</td>
                                        <td style={{ padding: '12px' }}>{product.product_name}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <DatePicker
                                                selected={expiryDates[product.product_code]}
                                                onChange={(date) => handleExpiryDateChange(product.product_code, date)}
                                                dateFormat="MM/dd/yyyy"
                                                customInput={
                                                    <input
                                                        style={{
                                                            width: '110px',
                                                            padding: '4px',
                                                            textAlign: 'center',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                }
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <input
                                                type="number"
                                                value={quantities[product.product_code]}
                                                onChange={(e) => handleQuantityChange(product.product_code, Number(e.target.value))}
                                                style={{
                                                    width: '60px',
                                                    padding: '4px',
                                                    textAlign: 'center',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px'
                                                }}
                                                min="1"
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <select
                                                value={units[product.product_code]}
                                                onChange={(e) => handleUnitChange(product.product_code, e.target.value)}
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
                                                value={unitPrices[product.product_code]}
                                                onChange={(e) => handlePriceChange(product.product_code, Number(e.target.value))}
                                                style={{
                                                    width: '80px',
                                                    padding: '4px',
                                                    textAlign: 'right',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px'
                                                }}
                                                min="0"
                                                step="0.01"
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            ${totals[product.product_code]?.toFixed(2)}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <IconButton
                                                onClick={() => handleDeleteProduct(product.product_code)}
                                                size="small"
                                                sx={{ color: 'error.main' }}
                                            >
                                                <CancelIcon />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Box>

                {products.length > 0 && (
                    <Box sx={{
                        mt: 3,
                        p: 2,
                        bgcolor: '#EAB86C',
                        borderRadius: '10px',
                        color: 'white'
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Subtotal</Typography>
                            <Typography>${total.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Tax (7%)</Typography>
                            <Typography>${(total * 0.07).toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Typography variant="h5">Total</Typography>
                            <Typography variant="h5">${(total * 1.07).toFixed(2)}</Typography>
                        </Box>
                    </Box>
                )}

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        variant="outlined"
                        onClick={onBack}
                        sx={{
                            borderColor: '#754C27',
                            color: '#754C27',
                            '&:hover': {
                                borderColor: '#5c3c1f',
                                backgroundColor: 'rgba(117, 76, 39, 0.04)',
                            }
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleUpdate}
                        sx={{
                            bgcolor: '#754C27',
                            color: '#FFFFFF',
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