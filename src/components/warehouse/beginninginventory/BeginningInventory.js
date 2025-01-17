// src/components/inventory/BeginningInventory/BeginningInventory.jsx
import {
    Box,
    Button,
    InputAdornment,
    TextField,
    Typography,
    Drawer,
    IconButton,
    Stack,
    Pagination
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
import {
    addWh_stockcard,
    queryWh_stockcard,
    countWh_stockcard,
    updateWh_stockcard,
    deleteWh_stockcard
} from '../../../api/warehouse/wh_stockcard';
import { useFormik } from 'formik';
import Swal from 'sweetalert2';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Styled Components
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

export default function BeginningInventory() {
    const dispatch = useDispatch();
    const [openDrawer, setOpenDrawer] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [units, setUnits] = useState([]);
    const [stockcards, setStockcards] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [itemsPerPage] = useState(5);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [tableSearchTerm, setTableSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState(() => convertToLasVegasTime(new Date()));
    const [loading, setLoading] = useState(false); 

    // Initial Form Values
    const initialValues = {
        date: convertToLasVegasTime(new Date()),
        product_code: '',
        product_name: '',
        unit_code: '',
        amount: '',
        unit_price: '',
        isEditing: false,
        refno: '',
        myear: '',
        monthh: ''
    };

    useEffect(() => {
        const loadUnits = async () => {
            try {
                const response = await dispatch(unitAll({ offset: 0, limit: 100 })).unwrap();
                setUnits(response.data);
            } catch (err) {
                console.error('Error loading units:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error Loading Units',
                    text: err.message || 'Failed to load units',
                    confirmButtonColor: '#754C27'
                });
            }
        };
        loadUnits();
    }, [dispatch]);

    // Form Validation Schema
    const validationSchema = {
        validate: values => {
            const errors = {};
            if (!values.product_code) errors.product_code = 'Product is required';
            if (!values.unit_code) errors.unit_code = 'Unit is required';
            if (!values.amount || values.amount <= 0) errors.amount = 'Amount must be greater than 0';
            if (!values.unit_price || values.unit_price <= 0) errors.unit_price = 'Unit price must be greater than 0';
            return errors;
        }
    };

    // Form Validation Schema
    const validate = values => {
        const errors = {};
        if (!values.product_code) errors.product_code = 'Product is required';
        if (!values.unit_code) errors.unit_code = 'Unit is required';
        if (!values.amount || values.amount <= 0) errors.amount = 'Amount must be greater than 0';
        if (!values.unit_price || values.unit_price <= 0) errors.unit_price = 'Unit price must be greater than 0';
        return errors;
    };

    const formik = useFormik({
        initialValues,
        validate,
        validateOnChange: false,
        onSubmit: async (values) => {
            try {
                const year = values.date.getFullYear();
                const month = (values.date.getMonth() + 1).toString().padStart(2, '0');
                const day = values.date.getDate().toString().padStart(2, '0');

                const stockcardData = {
                    myear: values.isEditing ? values.myear : year,
                    monthh: values.isEditing ? values.monthh : month,
                    product_code: values.product_code,
                    unit_code: values.unit_code,
                    refno: values.isEditing ? values.refno : 'BEG',
                    rdate: `${month}/${day}/${year}`,
                    trdate: `${year}${month}${day}`,
                    beg1: Number(values.amount),
                    in1: 0,
                    out1: 0,
                    upd1: 0,
                    uprice: Number(values.unit_price),
                    beg1_amt: Number(values.amount),
                    in1_amt: 0,
                    out1_amt: 0,
                    upd1_amt: 0
                };

                const action = values.isEditing ? updateWh_stockcard : addWh_stockcard;
                const result = await dispatch(action(stockcardData)).unwrap();

                if (result.result) {
                    Swal.fire({
                        icon: 'success',
                        title: values.isEditing ? 'Updated successfully' : 'Saved successfully',
                        showConfirmButton: false,
                        timer: 1500
                    });

                    setOpenDrawer(false);
                    resetForm();
                    loadData(page);
                }
            } catch (error) {
                console.log('Error:', error);
                // การจัดการ error ที่มาจาก backend
                if (error.type === 'DUPLICATE_RECORD') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Duplicate Entry',
                        text: error.message,
                        confirmButtonColor: '#754C27'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message || 'An unexpected error occurred',
                        confirmButtonColor: '#754C27'
                    });
                }
            }
        }
    });


    // Load Units Effect
    useEffect(() => {
        dispatch(unitAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((res) => setUnits(res.data))
            .catch((err) => console.log(err.message));
    }, [dispatch]);

    const loadData = async (pageNumber = 1) => {
        try {
            setLoading(true);
            const offset = (pageNumber - 1) * itemsPerPage;
            const formattedDate = filterDate ? formatDate(filterDate) : null;

            const [res, countRes] = await Promise.all([
                dispatch(queryWh_stockcard({
                    offset,
                    limit: itemsPerPage,
                    rdate: formattedDate,
                    product_name: tableSearchTerm
                })).unwrap(),
                dispatch(countWh_stockcard({
                    rdate: formattedDate,
                    product_name: tableSearchTerm
                })).unwrap()
            ]);

            if (res.result && Array.isArray(res.data)) {
                const resultData = res.data.map((item, index) => ({
                    ...item,
                    id: offset + index + 1
                }));
                setStockcards(resultData);
            }

            if (countRes.result) {
                const totalPages = Math.ceil(countRes.data / itemsPerPage);
                setCount(totalPages);
            }
        } catch (err) {
            console.error('Error loading data:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error Loading Data',
                text: err.message || 'An unknown error occurred',
                confirmButtonColor: '#754C27'
            });
        } finally {
            setLoading(false);
        }
    };

    // Load Data Effect
    useEffect(() => {
        loadData(page);
    }, [filterDate, tableSearchTerm, page]);

    const handleProductSearch = async (e) => {
        try {
            const value = e.target.value;
            setProductSearchTerm(value);

            if (value.length > 0) {
                const response = await dispatch(searchProductName({ product_name: value })).unwrap();
                if (response.data) {
                    const sortedResults = [...response.data].sort((a, b) => {
                        const aExact = a.product_name.toLowerCase() === value.toLowerCase();
                        const bExact = b.product_name.toLowerCase() === value.toLowerCase();
                        if (aExact && !bExact) return -1;
                        if (!aExact && bExact) return 1;
                        return a.product_name.length - b.product_name.length;
                    });
                    setSearchResults(sortedResults);
                    setShowDropdown(true);
                }
            } else {
                setSearchResults([]);
                setShowDropdown(false);
            }
        } catch (err) {
            console.error('Error searching products:', err);
            Swal.fire({
                icon: 'error',
                title: 'Search Error',
                text: err.message || 'Failed to search products',
                confirmButtonColor: '#754C27'
            });
        }
    };

    const handleTableSearch = (e) => {
        setTableSearchTerm(e.target.value);
        setPage(1);
    };

    const handleProductSelect = (product) => {
        const newValues = {
            ...formik.values,
            product_code: product.product_code,
            product_name: product.product_name,
            unit_code: product.productUnit2?.unit_code || '',
            unit_price: product.retail_unit_price || ''
        };

        formik.resetForm({ values: newValues });
        setSelectedProduct(product);
        setProductSearchTerm(product.product_name);
        setShowDropdown(false);
    };

    const resetForm = () => {
        formik.resetForm();
        setProductSearchTerm('');
        setSelectedProduct(null);
    };

    const handleDateChange = (date) => {
        if (!date) return;
        const vegasDate = convertToLasVegasTime(date);
        setFilterDate(vegasDate);
        setPage(1);
    };

    const clearFilters = () => {
        setTableSearchTerm('');
        const vegasDate = convertToLasVegasTime(new Date());
        setFilterDate(vegasDate);
        setPage(1);
        loadData(1);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
        loadData(value);
    };

    const handleEdit = async (row) => {
        try {
            const productData = {
                product_code: row.product_code,
                product_name: row.tbl_product?.product_name || '',
                productUnit2: {
                    unit_code: row.unit_code
                },
                retail_unit_price: row.uprice
            };

            const [month, day, year] = row.rdate.split('/');
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            date.setHours(0, 0, 0, 0);

            formik.setValues({
                date,
                product_code: row.product_code,
                product_name: row.tbl_product?.product_name || '',
                unit_code: row.unit_code,
                amount: row.beg1,
                unit_price: row.uprice,
                isEditing: true,
                refno: row.refno,
                myear: row.myear,
                monthh: row.monthh
            });

            setProductSearchTerm(row.tbl_product?.product_name || '');
            setSelectedProduct(productData);
            setOpenDrawer(true);
        } catch (err) {
            console.error('Error editing record:', err);
            Swal.fire({
                icon: 'error',
                title: 'Edit Error',
                text: err.message || 'Failed to edit record',
                confirmButtonColor: '#754C27'
            });
        }
    };

    const handleDelete = async (row) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#754C27',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                await dispatch(deleteWh_stockcard({
                    refno: row.refno,
                    myear: row.myear,
                    monthh: row.monthh,
                    product_code: row.product_code
                })).unwrap();

                await Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Record has been deleted.',
                    confirmButtonColor: '#754C27'
                });

                await loadData(page);
            }
        } catch (err) {
            console.error('Error deleting record:', err);
            Swal.fire({
                icon: 'error',
                title: 'Delete Error',
                text: err.message || 'Failed to delete record',
                confirmButtonColor: '#754C27'
            });
        }
    };


    const calculateTotal = () => {
        const amount = Number(formik.values.amount) || 0;
        const unitPrice = Number(formik.values.unit_price) || 0;
        return (amount * unitPrice).toFixed(2);
    };

    // Render UI
    return (
        <>
            <Box sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                {/* Create Button */}
                <Button onClick={() => setOpenDrawer(true)} sx={{
                    width: '209px',
                    height: '70px',
                    background: 'linear-gradient(180deg, #AD7A2C 0%, #754C27 100%)',
                    borderRadius: '15px',
                    boxShadow: '0px 4px 4px 0px #00000040',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    '&:hover': {
                        background: 'linear-gradient(180deg, #8C5D1E 0%, #5D3A1F 100%)',
                    },
                    mt: '80px'
                }}>
                    <AddCircleIcon sx={{ fontSize: '42px', color: '#FFFFFF', mr: '12px' }} />
                    <Typography sx={{ fontSize: '24px', fontWeight: '600', color: '#FFFFFF' }}>
                        Create
                    </Typography>
                </Button>

                {/* Search Filters */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: '48px',
                    width: '90%',
                    gap: '20px'
                }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                        Search
                    </Typography>
                    <TextField
                        value={tableSearchTerm}
                        onChange={handleTableSearch}
                        placeholder="Search stockcard"
                        sx={{
                            '& .MuiInputBase-root': {
                                height: '38px',
                                width: '100%'
                            },
                            '& .MuiOutlinedInput-input': {
                                padding: '8.5px 14px',
                            },
                            width: '35%'
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#5A607F' }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Box sx={{ width: '200px' }}>
                        <DatePicker
                            selected={filterDate}
                            onChange={handleDateChange}
                            dateFormat="MM/dd/yyyy"
                            placeholderText="MM/DD/YYYY"
                            customInput={<CustomInput />}
                        />
                    </Box>
                    <Button
                        onClick={clearFilters}
                        variant="outlined"
                        sx={{
                            height: '38px',
                            width: '120px',
                            borderColor: '#754C27',
                            color: '#754C27',
                            '&:hover': {
                                borderColor: '#5d3a1f',
                                backgroundColor: 'rgba(117, 76, 39, 0.04)'
                            }
                        }}
                    >
                        Clear
                    </Button>
                </Box>

                {/* Table */}
                <TableContainer component={Paper} sx={{ width: '80%', mt: '24px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell width='1%'>No.</StyledTableCell>
                                <StyledTableCell align="center">Product Code</StyledTableCell>
                                <StyledTableCell align="center">Product Name</StyledTableCell>
                                <StyledTableCell align="center">Amount</StyledTableCell>
                                <StyledTableCell align="center">Unit Price</StyledTableCell>
                                <StyledTableCell align="center">Total</StyledTableCell>
                                <StyledTableCell width='1%' align="center">Edit</StyledTableCell>
                                <StyledTableCell width='1%' align="center">Delete</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stockcards.map((row) => (
                                <StyledTableRow key={row.id}>
                                    <StyledTableCell>{row.id}</StyledTableCell>
                                    <StyledTableCell align="center">{row.product_code}</StyledTableCell>
                                    <StyledTableCell align="center">
                                        {row.tbl_product?.product_name || row.product_code}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">{row.beg1}</StyledTableCell>
                                    <StyledTableCell align="center">
                                        {row.uprice?.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        {row.beg1_amt?.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <IconButton
                                            onClick={() => handleEdit(row)}
                                            sx={{ border: '1px solid #AD7A2C', borderRadius: '7px' }}
                                        >
                                            <EditIcon sx={{ color: '#AD7A2C' }} />
                                        </IconButton>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <IconButton
                                            onClick={() => handleDelete(row)}
                                            sx={{ border: '1px solid #F62626', borderRadius: '7px' }}
                                        >
                                            <DeleteIcon sx={{ color: '#F62626' }} />
                                        </IconButton>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                <Stack spacing={2} sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Pagination
                        count={count}
                        page={page}
                        onChange={handlePageChange}
                        shape="rounded"
                        showFirstButton
                        showLastButton
                    />
                </Stack>
            </Box>

            {/* Drawer */}
            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}
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
                                    onChange={(date) => {
                                        const vegasDate = convertToLasVegasTime(date);
                                        formik.setFieldValue('date', vegasDate);
                                    }}
                                    dateFormat="MM/dd/yyyy"
                                    placeholderText="MM/DD/YYYY"
                                    customInput={<CustomInput />}
                                />

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                    Product
                                </Typography>
                                <Box sx={{ position: 'relative', width: '100%' }}>
                                    <TextField
                                        size="small"
                                        value={productSearchTerm}
                                        onChange={handleProductSearch}
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
                                    {formik.values.unit_code && (
                                        <option value={formik.values.unit_code}>
                                            {units.find(u => u.unit_code === formik.values.unit_code)?.unit_name || formik.values.unit_code}
                                        </option>
                                    )}
                                </Box>

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                    Amount
                                </Typography>
                                <TextField
                                    size="small"
                                    type="number"
                                    name="amount"
                                    value={formik.values.amount}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        formik.setFieldValue('amount', value === '' ? '' : Number(value), false);
                                    }}
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
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        formik.setFieldValue('unit_price', value === '' ? '' : Number(value), false);
                                    }}
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
                                    onClick={() => setOpenDrawer(false)}
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