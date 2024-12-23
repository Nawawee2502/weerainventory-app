import { Box, Button, InputAdornment, TextField, Typography, Drawer, IconButton } from '@mui/material';
import React, { useState, useEffect } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../api/productrecordApi';
import { unitAll } from '../../../api/productunitApi';
import { addWh_stockcard } from '../../../api/warehouse/wh_stockcard';
import { useFormik } from 'formik';
import Swal from 'sweetalert2';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#754C27',
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: '16px',
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export default function BeginningInventory() {
    const dispatch = useDispatch();
    const [openDrawer, setOpenDrawer] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [units, setUnits] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const formik = useFormik({
        initialValues: {
            date: new Date(),
            product_code: '',
            product_name: '',
            unit_code: '',
            amount: '',
            unit_price: '',
        },
        validate: values => {
            const errors = {};

            if (!values.product_code) {
                errors.product_code = 'Product is required';
            }
            if (!values.unit_code) {
                errors.unit_code = 'Unit is required';
            }
            if (!values.amount || values.amount <= 0) {
                errors.amount = 'Amount must be greater than 0';
            }
            if (!values.unit_price || values.unit_price <= 0) {
                errors.unit_price = 'Unit price must be greater than 0';
            }

            return errors;
        },
        onSubmit: (values) => {
            const year = values.date.getFullYear();
            const month = (values.date.getMonth() + 1).toString().padStart(2, '0');
            const day = values.date.getDate().toString().padStart(2, '0');

            const stockcardData = {
                myear: year,
                monthh: month,
                product_code: values.product_code,
                unit_code: values.unit_code,
                refno: 'BEG',
                rdate: values.date.toLocaleDateString('en-GB'),
                trdate: `${year}${month}${day}`,
                beg1: Number(values.amount),
                in1: 0,
                out1: 0,
                upd1: 0,
                uprice: Number(values.unit_price),
                beg1_amt: Number(values.amount) * Number(values.unit_price),
                in1_amt: 0,
                out1_amt: 0,
                upd1_amt: 0
            };

            Swal.fire({
                title: 'Saving...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            dispatch(addWh_stockcard(stockcardData))
                .unwrap()
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Saved successfully',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    setOpenDrawer(false);
                    resetForm();
                })
                .catch((err) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: err.message
                    });
                });
        },
    });

    useEffect(() => {
        let offset = 0;
        let limit = 100;
        dispatch(unitAll({ offset, limit }))
            .unwrap()
            .then((res) => {
                setUnits(res.data);
            })
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
                        const sortedResults = [...res.data].sort((a, b) => {
                            const aExact = a.product_name.toLowerCase() === value.toLowerCase();
                            const bExact = b.product_name.toLowerCase() === value.toLowerCase();
                            if (aExact && !bExact) return -1;
                            if (!aExact && bExact) return 1;
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

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        formik.setFieldValue('product_code', product.product_code);
        formik.setFieldValue('product_name', product.product_name);
        formik.setFieldValue('unit_code', product.productUnit2.unit_code);
        formik.setFieldValue('unit_price', product.retail_unit_price);
        setSearchTerm(product.product_name);
        setShowDropdown(false);
    };

    const toggleDrawer = (open) => () => {
        setOpenDrawer(open);
        if (!open) {
            resetForm();
        }
    };

    const resetForm = () => {
        formik.resetForm();
        setSearchTerm('');
        setSelectedProduct(null);
        setStartDate(new Date());
    };

    const calculateTotal = () => {
        const amount = Number(formik.values.amount) || 0;
        const unitPrice = Number(formik.values.unit_price) || 0;
        return (amount * unitPrice).toFixed(2);
    };

    return (
        <>
            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: '48px' }}>
                <Button onClick={toggleDrawer(true)} sx={{
                    width: '209px', height: '70px',
                    background: 'linear-gradient(180deg, #AD7A2C 0%, #754C27 100%)',
                    borderRadius: '15px',
                    boxShadow: '0px 4px 4px 0px #00000040',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    '&:hover': {
                        background: 'linear-gradient(180deg, #8C5D1E 0%, #5D3A1F 100%)',
                    }
                }}>
                    <AddCircleIcon sx={{ fontSize: '42px', color: '#FFFFFF', mr: '12px' }} />
                    <Typography sx={{ fontSize: '24px', fontWeight: '600', color: '#FFFFFF' }}>
                        Create
                    </Typography>
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: '48px', width: '60%' }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mr: '24px' }}>
                        Beginning Inventory Search
                    </Typography>
                    <TextField
                        placeholder="Search"
                        sx={{
                            '& .MuiInputBase-root': { height: '38px', width: '100%' },
                            '& .MuiOutlinedInput-input': { padding: '8.5px 14px' },
                            width: '40%'
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

                <TableContainer component={Paper} sx={{ width: '60%', mt: '24px' }}>
                    <Table aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell width='1%'>No.</StyledTableCell>
                                <StyledTableCell align="center">Product Code</StyledTableCell>
                                <StyledTableCell align="center">Product Name</StyledTableCell>
                                <StyledTableCell align="center">Amount</StyledTableCell>
                                <StyledTableCell align="center">Unit Price</StyledTableCell>
                                <StyledTableCell align="center">Total</StyledTableCell>
                                <StyledTableCell width='1%' align="center"></StyledTableCell>
                                <StyledTableCell width='1%' align="center"></StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* Table data */}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={toggleDrawer(false)}
                ModalProps={{
                    BackdropProps: {
                        style: { backgroundColor: 'transparent' },
                    },
                }}
                PaperProps={{
                    sx: {
                        boxShadow: 'none',
                        width: '25%',
                        borderRadius: '20px',
                        border: '1px solid #E4E4E4',
                        bgcolor: '#FAFAFA',
                        mt: '36px'
                    },
                }}
            >
                <Box sx={{ width: '100%', mt: '80px', flexDirection: 'column' }}>
                    <Box sx={{
                        position: 'absolute',
                        top: '48px',
                        left: '0',
                        width: '200px',
                        bgcolor: '#AD7A2C',
                        color: '#FFFFFF',
                        px: '8px',
                        py: '4px',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        zIndex: 1,
                        height: '89px',
                        display: 'flex',
                        justifyContent: 'center',
                    }}>
                        <Typography sx={{ fontWeight: '600', fontSize: '14px' }}>
                            Beginning Inventory
                        </Typography>
                    </Box>
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
                    }}>
                        <form onSubmit={formik.handleSubmit} style={{ width: '80%' }}>
                            <Box sx={{ width: '100%', mt: '24px' }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Date
                                </Typography>
                                <DatePicker
                                    selected={formik.values.date}
                                    onChange={(date) => formik.setFieldValue('date', date)}
                                    dateFormat="dd/MM/yyyy"
                                    customInput={
                                        <TextField
                                            size="small"
                                            sx={{
                                                mt: '8px',
                                                width: '100%',
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '10px',
                                                },
                                            }}
                                        />
                                    }
                                />

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                    Product
                                </Typography>
                                <Box sx={{ position: 'relative', width: '100%' }}>
                                    <TextField
                                        size="small"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        placeholder="Search Product"
                                        error={formik.touched.product_code && Boolean(formik.errors.product_code)}
                                        helperText={formik.touched.product_code && formik.errors.product_code}
                                        sx={{
                                            mt: '8px',
                                            width: '100%',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                            },
                                        }}
                                    />
                                    {showDropdown && searchResults.length > 0 && (
                                        <Box sx={{
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
                                        }}>
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

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                    Unit
                                </Typography>
                                <Box
                                    component="select"
                                    name="unit_code"
                                    value={formik.values.unit_code}
                                    disabled={true}
                                    sx={{
                                        mt: '8px',
                                        width: '100%',
                                        height: '40px',
                                        borderRadius: '10px',
                                        padding: '0 14px',
                                        border: formik.touched.unit_code && formik.errors.unit_code
                                            ? '1px solid #d32f2f'
                                            : '1px solid rgba(0, 0, 0, 0.23)',
                                        fontSize: '16px',
                                        backgroundColor: '#f5f5f5',
                                        appearance: 'none',
                                        '-webkit-appearance': 'none',
                                        '-moz-appearance': 'none',
                                        '&:focus': {
                                            outline: 'none',
                                            borderColor: '#754C27',
                                        },
                                    }}
                                >
                                    <option value="">Unit</option>
                                    {selectedProduct && (
                                        <option value={selectedProduct.productUnit2.unit_code}>
                                            {selectedProduct.productUnit2.unit_name}
                                        </option>
                                    )}
                                </Box>
                                {formik.touched.unit_code && formik.errors.unit_code && (
                                    <Typography color="error" variant="caption" sx={{ ml: 1 }}>
                                        {formik.errors.unit_code}
                                    </Typography>
                                )}

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                    Amount
                                </Typography>
                                <TextField
                                    size="small"
                                    type="number"
                                    name="amount"
                                    value={formik.values.amount}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter Amount"
                                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                                    helperText={formik.touched.amount && formik.errors.amount}
                                    sx={{
                                        mt: '8px',
                                        width: '100%',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                        },
                                    }}
                                />

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                    Unit Price
                                </Typography>
                                <TextField
                                    size="small"
                                    type="number"
                                    name="unit_price"
                                    value={formik.values.unit_price}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter Unit Price"
                                    error={formik.touched.unit_price && Boolean(formik.errors.unit_price)}
                                    helperText={formik.touched.unit_price && formik.errors.unit_price}
                                    sx={{
                                        mt: '8px',
                                        width: '100%',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                        },
                                    }}
                                />

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                    Total
                                </Typography>
                                <TextField
                                    size="small"
                                    value={calculateTotal()}
                                    disabled
                                    sx={{
                                        mt: '8px',
                                        width: '100%',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                        },
                                    }}
                                />
                            </Box>

                            <Box sx={{ mt: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="button"
                                    variant='contained'
                                    onClick={toggleDrawer(false)}
                                    sx={{
                                        width: '100px',
                                        bgcolor: '#F62626',
                                        '&:hover': {
                                            bgcolor: '#D32F2F',
                                        },
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant='contained'
                                    sx={{
                                        width: '100px',
                                        bgcolor: '#754C27',
                                        '&:hover': {
                                            bgcolor: '#5A3D1E',
                                        },
                                        ml: '24px'
                                    }}
                                >
                                    Save
                                </Button>
                            </Box>
                        </form>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
}