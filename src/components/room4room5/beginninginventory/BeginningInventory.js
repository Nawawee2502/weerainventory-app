import {
    Box,
    Button,
    InputAdornment,
    TextField,
    Typography,
    Drawer,
    IconButton,
    Stack,
    Pagination,
    Checkbox,
    Divider,
    FormControl,
    Select,
    MenuItem
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
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
import { useFormik } from 'formik';
import Swal from 'sweetalert2';
import {
    addKt_stockcard,
    updateKt_stockcard,
    deleteKt_stockcard,
    Kt_stockcardAll,
    countKt_stockcard
} from '../../../api/kitchen/kt_stockcardApi';
import { kitchenAll } from '../../../api/kitchenApi';

// SweetAlert2 Style Override
document.head.insertAdjacentHTML(
    'beforeend',
    `<style>
      .swal2-container {
        z-index: 9999 !important; /* Much higher than MUI's Modal z-index of 1300 */
      }
    </style>`
);

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

const convertToLasVegasTime = (date) => {
    if (!date) return new Date();

    // Create a new date object and set to midnight in local time
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);

    // Return this date without timezone conversion
    return newDate;
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
    const [kitchens, setKitchens] = useState([]);
    const [stockcards, setStockcards] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [itemsPerPage] = useState(5);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [tableSearchTerm, setTableSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState(() => convertToLasVegasTime(new Date()));
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState([]);
    const [selectedKitchenCode, setSelectedKitchenCode] = useState('');
    const [loading, setLoading] = useState(false);

    // Initial Form Values
    const initialValues = {
        date: convertToLasVegasTime(new Date()),
        product_code: '',
        product_name: '',
        unit_code: '',
        kitchen_code: '',
        amount: '',
        unit_price: '',
        isEditing: false,
        refno: '',
        myear: '',
        monthh: ''
    };

    // Form Validation
    const validate = values => {
        const errors = {};
        if (!values.product_code) errors.product_code = 'Product is required';
        if (!values.unit_code) errors.unit_code = 'Unit is required';
        if (!values.kitchen_code) errors.kitchen_code = 'Kitchen is required';
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

                const rdate = `${month}/${day}/${year}`;
                const trdate = `${year}${month}${day}`;

                // Calculate amounts
                const amount = Number(values.amount) || 0;
                const unitPrice = Number(values.unit_price) || 0;
                const totalAmount = amount * unitPrice;

                const stockcardData = {
                    myear: values.isEditing ? values.myear : year.toString(),
                    monthh: values.isEditing ? values.monthh : month,
                    kitchen_code: values.kitchen_code,
                    product_code: values.product_code,
                    unit_code: values.unit_code,
                    refno: values.isEditing ? values.refno : 'BEG',
                    rdate: rdate,  // ส่ง rdate ไปด้วยเสมอ
                    trdate: trdate,
                    beg1: amount,
                    in1: 0,
                    out1: 0,
                    upd1: 0,
                    uprice: unitPrice,
                    beg1_amt: totalAmount,
                    in1_amt: 0,
                    out1_amt: 0,
                    upd1_amt: 0,
                    balance: amount,
                    balance_amount: totalAmount
                };

                setOpenDrawer(false);

                // แสดงข้อมูลที่จะส่งไปที่ API เพื่อดีบัก
                console.log("Sending to API:", stockcardData);

                const action = values.isEditing ? updateKt_stockcard : addKt_stockcard;
                const result = await dispatch(action(stockcardData)).unwrap();

                if (result.result) {
                    Swal.fire({
                        icon: 'success',
                        title: values.isEditing ? 'Updated successfully' : 'Saved successfully',
                        showConfirmButton: false,
                        timer: 1500
                    });

                    resetForm();
                    loadData(page);
                }
            } catch (error) {
                console.error('Error:', error);

                // Re-open the drawer so the user can correct the data
                setOpenDrawer(true);

                // Then show the SweetAlert with high z-index
                if (error.type === 'DUPLICATE_RECORD') {
                    setTimeout(() => {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Duplicate Entry',
                            text: error.message,
                            confirmButtonColor: '#754C27'
                        });
                    }, 100); // Small delay to ensure drawer is fully rendered
                } else {
                    setTimeout(() => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: error.message || 'An unexpected error occurred',
                            confirmButtonColor: '#754C27'
                        });
                    }, 100);
                }
            }
        }
    });

    // Load Units and Kitchens
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [unitsResponse, kitchensResponse] = await Promise.all([
                    dispatch(unitAll({ offset: 0, limit: 100 })).unwrap(),
                    dispatch(kitchenAll({ offset: 0, limit: 100 })).unwrap()
                ]);

                setUnits(unitsResponse.data || []);
                setKitchens(kitchensResponse.data || []);
            } catch (err) {
                console.error('Error loading initial data:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error Loading Data',
                    text: err.message || 'Failed to load initial data',
                    confirmButtonColor: '#754C27'
                });
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [dispatch]);

    const loadData = async (pageNumber = 1) => {
        try {
            setLoading(true);
            const offset = (pageNumber - 1) * itemsPerPage;

            // Date parameters
            let dateParams = {};
            if (filterDate) {
                const formattedDate = formatDate(filterDate);
                dateParams = { rdate: formattedDate };
            }

            // Kitchen filter
            let kitchenParams = {};
            if (selectedKitchenCode) {
                kitchenParams.kitchen_code = selectedKitchenCode;
            }

            // Fetch stockcard data with BEG refno filter
            const [stockcardsRes, countRes] = await Promise.all([
                dispatch(Kt_stockcardAll({
                    offset,
                    limit: itemsPerPage,
                    ...dateParams,
                    ...kitchenParams,
                    product_name: tableSearchTerm,
                    refno: 'BEG'
                })).unwrap(),
                dispatch(countKt_stockcard({
                    ...dateParams,
                    ...kitchenParams,
                    product_name: tableSearchTerm,
                    refno: 'BEG'
                })).unwrap()
            ]);

            if (stockcardsRes.result && Array.isArray(stockcardsRes.data)) {
                setStockcards(stockcardsRes.data);

                const totalRecords = countRes.data;

                // Calculate total pages
                const totalPages = Math.max(1, Math.ceil(totalRecords / itemsPerPage));
                setCount(totalPages);
            } else {
                setStockcards([]);
                setCount(1);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error Loading Data',
                text: error.message || 'Failed to load stockcard data',
                confirmButtonColor: '#754C27'
            });
            setStockcards([]);
            setCount(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(page);
    }, [filterDate, tableSearchTerm, selectedKitchenCode, page]);

    // Handle Kitchen Change
    const handleKitchenChange = (e) => {
        setSelectedKitchenCode(e.target.value);
        setPage(1);
        setSelected([]);
    };

    // Handle Product Search
    const handleSearchChange = async (e) => {
        try {
            const value = e.target.value;
            setSearchTerm(value);
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

    // Handle Table Search
    const handleTableSearch = (e) => {
        setTableSearchTerm(e.target.value);
        setPage(1);
        setSelected([]);
    };

    // Handle Product Selection
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
        setSearchTerm(product.product_name);
        setShowDropdown(false);
    };

    // Reset Form
    const resetForm = () => {
        formik.resetForm();
        setProductSearchTerm('');
        setSearchTerm('');
        setSelectedProduct(null);
        setShowDropdown(false);
    };

    // Handle Date Change
    const handleDateChange = (date) => {
        if (!date) return;
        const vegasDate = convertToLasVegasTime(date);
        setFilterDate(vegasDate);
        setPage(1);
        setSelected([]);
    };

    // Clear Filters
    const clearFilters = () => {
        setTableSearchTerm('');
        setSelectedKitchenCode('');
        setFilterDate(convertToLasVegasTime(new Date()));
        setPage(1);
        setSelected([]);
        loadData(1);
    };

    // Handle Page Change
    const handlePageChange = (event, value) => {
        setPage(value);
    };

    // Calculate Total
    const calculateTotal = () => {
        const amount = Number(formik.values.amount) || 0;
        const unitPrice = Number(formik.values.unit_price) || 0;
        return (amount * unitPrice).toFixed(2);
    };

    // Handle Edit
    const handleEdit = async (row) => {
        try {
            const productData = {
                product_code: row.product_code,
                product_name: row.tbl_product?.product_name || '',
                productUnit2: {
                    unit_code: row.unit_code,
                    unit_name: row.tbl_unit?.unit_name || ''
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
                kitchen_code: row.kitchen_code,
                amount: row.beg1,
                unit_price: row.uprice,
                isEditing: true,
                refno: row.refno,
                myear: row.myear,
                monthh: row.monthh
            });

            setProductSearchTerm(row.tbl_product?.product_name || '');
            setSearchTerm(row.tbl_product?.product_name || '');
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

    // Handle Delete
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
                await dispatch(deleteKt_stockcard({
                    refno: row.refno,
                    myear: row.myear,
                    monthh: row.monthh,
                    product_code: row.product_code,
                    kitchen_code: row.kitchen_code,  // เพิ่ม kitchen_code
                    rdate: row.rdate  // เพิ่ม rdate
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

    // Handle Batch Delete
    const handleBatchDelete = async () => {
        if (selected.length === 0) return;

        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: `You are about to delete ${selected.length} items`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#754C27',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete them!'
            });

            if (result.isConfirmed) {
                // Delete each selected item
                for (const item of selected) {
                    await dispatch(deleteKt_stockcard({
                        refno: item.refno,
                        myear: item.myear,
                        monthh: item.monthh,
                        product_code: item.product_code,
                        kitchen_code: item.kitchen_code,  // เพิ่ม kitchen_code
                        rdate: item.rdate  // เพิ่ม rdate
                    })).unwrap();
                }

                // Clear selection and reload data
                setSelected([]);
                await loadData(page);

                await Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: `Successfully deleted ${selected.length} items`,
                    confirmButtonColor: '#754C27',
                    timer: 1500
                });
            }
        } catch (error) {
            console.error('Error in batch delete:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Delete Error',
                text: error.message || 'Failed to delete selected items',
                confirmButtonColor: '#754C27'
            });
        }
    };

    // Handle Select All Click
    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            setSelected(stockcards);
        } else {
            setSelected([]);
        }
    };

    // Handle Checkbox Change
    const handleCheckboxChange = (event, stockcard) => {
        const selectedIndex = selected.findIndex(item =>
            item.refno === stockcard.refno &&
            item.product_code === stockcard.product_code
        );
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = [...selected, stockcard];
        } else {
            newSelected = [
                ...selected.slice(0, selectedIndex),
                ...selected.slice(selectedIndex + 1),
            ];
        }
        setSelected(newSelected);
    };

    // Toggle Drawer
    const toggleDrawer = (open) => () => {
        setOpenDrawer(open);
        if (!open) {
            resetForm();
        }
    };

    return (
        <>
            <Box sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: '24px'
            }}>
                {/* Create Button */}
                <Button onClick={toggleDrawer(true)} sx={{
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
                    mt: '48px'
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
                    <FormControl sx={{ width: '30%' }}>
                        <Select
                            value={selectedKitchenCode}
                            onChange={handleKitchenChange}
                            displayEmpty
                            size="small"
                        >
                            <MenuItem value="">
                                <em>All Kitchens</em>
                            </MenuItem>
                            {kitchens.map((kitchen) => (
                                <MenuItem key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                                    {kitchen.kitchen_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        value={tableSearchTerm}
                        onChange={handleTableSearch}
                        placeholder="Search product"
                        sx={{
                            '& .MuiInputBase-root': {
                                height: '38px',
                                width: '100%'
                            },
                            '& .MuiOutlinedInput-input': {
                                padding: '8.5px 14px',
                                bgcolor: '#FFFFFF'
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

                {/* Batch Delete Button */}
                <Box sx={{ width: '100%', mt: '24px' }}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleBatchDelete}
                        sx={{ mt: 2 }}
                        disabled={selected.length === 0}
                    >
                        Delete Selected ({selected.length})
                    </Button>
                </Box>

                {/* Table */}
                <TableContainer component={Paper} sx={{ width: '100%', mt: '24px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell padding="checkbox">
                                    <Checkbox
                                        color="primary"
                                        checked={stockcards.length > 0 && selected.length === stockcards.length}
                                        indeterminate={selected.length > 0 && selected.length < stockcards.length}
                                        onChange={handleSelectAllClick}
                                        sx={{
                                            color: '#FFFFFF',
                                            '&.Mui-checked': {
                                                color: '#FFFFFF',
                                            },
                                            '&.MuiCheckbox-indeterminate': {
                                                color: '#FFFFFF',
                                            }
                                        }}
                                    />
                                </StyledTableCell>
                                <StyledTableCell width='1%'>No.</StyledTableCell>
                                <StyledTableCell align="center">Date</StyledTableCell>
                                <StyledTableCell align="center">Product Code</StyledTableCell>
                                <StyledTableCell align="center">Product Name</StyledTableCell>
                                <StyledTableCell align="center">Kitchen</StyledTableCell>
                                <StyledTableCell align="center">Amount</StyledTableCell>
                                {/* <StyledTableCell align="center">Unit Price</StyledTableCell> */}
                                {/* <StyledTableCell align="center">Total</StyledTableCell> */}
                                <StyledTableCell width='1%' align="center">Edit</StyledTableCell>
                                <StyledTableCell width='1%' align="center">Delete</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <StyledTableRow>
                                    <StyledTableCell colSpan={11} align="center">Loading...</StyledTableCell>
                                </StyledTableRow>
                            ) : stockcards.length === 0 ? (
                                <StyledTableRow>
                                    <StyledTableCell colSpan={11} align="center">No records found</StyledTableCell>
                                </StyledTableRow>
                            ) : (
                                stockcards.map((row, index) => {
                                    const isSelected = selected.some(item =>
                                        item.refno === row.refno &&
                                        item.product_code === row.product_code
                                    );

                                    return (
                                        <StyledTableRow
                                            key={`${row.refno}-${row.product_code}-${index}`}
                                            selected={isSelected}
                                        >
                                            <StyledTableCell padding="checkbox">
                                                <Checkbox
                                                    color="primary"
                                                    checked={isSelected}
                                                    onChange={(event) => handleCheckboxChange(event, row)}
                                                    sx={{
                                                        '&.Mui-checked': {
                                                            color: '#754C27',
                                                        }
                                                    }}
                                                />
                                            </StyledTableCell>
                                            <StyledTableCell>{(page - 1) * itemsPerPage + index + 1}</StyledTableCell>
                                            <StyledTableCell align="center">{row.rdate}</StyledTableCell>
                                            <StyledTableCell align="center">{row.product_code}</StyledTableCell>
                                            <StyledTableCell align="center">
                                                {row.tbl_product?.product_name || row.product_code}
                                            </StyledTableCell>
                                            <StyledTableCell align="center">
                                                {row.tbl_kitchen?.kitchen_name || row.kitchen_code || 'N/A'}
                                            </StyledTableCell>
                                            <StyledTableCell align="center">{row.beg1}</StyledTableCell>
                                            {/* <StyledTableCell align="center">
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
                                            </StyledTableCell> */}
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
                                    );
                                })
                            )}
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

            {/* Drawer for Add/Edit */}
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
                        width: '30%',
                        borderRadius: '20px 0 0 20px',
                        border: '1px solid #E4E4E4',
                        bgcolor: '#FAFAFA',
                        mt: '36px',
                        mb: '36px'
                    },
                }}
            >
                <Box sx={{ width: '100%', mt: '40px', p: 3 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography
                            variant="h6"
                            component="h2"
                            fontWeight="bold"
                            color="#754C27"
                        >
                            {formik.values.isEditing ? 'Edit Inventory Item' : 'Add Inventory Item'}
                        </Typography>
                        <IconButton
                            onClick={toggleDrawer(false)}
                            size="small"
                            sx={{ bgcolor: '#f5f5f5' }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <form onSubmit={formik.handleSubmit}>
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: '600', color: '#754C27' }}>
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
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: '600', color: '#754C27' }}>
                                Product
                            </Typography>
                            <Box sx={{ position: 'relative', width: '100%' }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Search Product"
                                    error={formik.touched.product_code && Boolean(formik.errors.product_code)}
                                    helperText={formik.touched.product_code && formik.errors.product_code}
                                    sx={{
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
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: '600', color: '#754C27' }}>
                                Kitchen
                            </Typography>
                            <Box
                                component="select"
                                name="kitchen_code"
                                value={formik.values.kitchen_code}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                sx={{
                                    width: '100%',
                                    height: '40px',
                                    borderRadius: '10px',
                                    padding: '0 14px',
                                    border: formik.touched.kitchen_code && formik.errors.kitchen_code
                                        ? '1px solid #d32f2f'
                                        : '1px solid rgba(0, 0, 0, 0.23)',
                                    fontSize: '16px',
                                    '&:focus': {
                                        outline: 'none',
                                        borderColor: '#754C27',
                                    },
                                }}
                            >
                                <option value="">Select Kitchen</option>
                                {kitchens.map(kitchen => (
                                    <option key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                                        {kitchen.kitchen_name}
                                    </option>
                                ))}
                            </Box>
                            {formik.touched.kitchen_code && formik.errors.kitchen_code && (
                                <Typography color="error" variant="caption" sx={{ ml: 1 }}>
                                    {formik.errors.kitchen_code}
                                </Typography>
                            )}
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: '600', color: '#754C27' }}>
                                Unit
                            </Typography>
                            <Box
                                component="select"
                                name="unit_code"
                                value={formik.values.unit_code}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                disabled={true}
                                sx={{
                                    width: '100%',
                                    height: '40px',
                                    borderRadius: '10px',
                                    padding: '0 14px',
                                    border: formik.touched.unit_code && formik.errors.unit_code
                                        ? '1px solid #d32f2f'
                                        : '1px solid rgba(0, 0, 0, 0.23)',
                                    fontSize: '16px',
                                    backgroundColor: '#f5f5f5',
                                    '&:focus': {
                                        outline: 'none',
                                        borderColor: '#754C27',
                                    },
                                }}
                            >
                                <option value="">Unit</option>
                                {selectedProduct && units.map(unit => (
                                    <option key={unit.unit_code} value={unit.unit_code}>
                                        {unit.unit_name}
                                    </option>
                                ))}
                            </Box>
                            {formik.touched.unit_code && formik.errors.unit_code && (
                                <Typography color="error" variant="caption" sx={{ ml: 1 }}>
                                    {formik.errors.unit_code}
                                </Typography>
                            )}
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: '600', color: '#754C27' }}>
                                Amount
                            </Typography>
                            <TextField
                                fullWidth
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
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                            />
                        </Box>

                        {/* <Box sx={{ mb: 2 }}>
                            <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: '600', color: '#754C27' }}>
                                Unit Price
                            </Typography>
                            <TextField
                                fullWidth
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
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                            />
                        </Box> */}

                        {/* <Box sx={{ mb: 3 }}>
                            <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: '600', color: '#754C27' }}>
                                Total
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={Number(calculateTotal()).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                                disabled
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                        backgroundColor: '#f5f5f5'
                                    },
                                }}
                            />
                        </Box> */}

                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'flex-end',
                            mt: 4
                        }}>
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={toggleDrawer(false)}
                                sx={{
                                    borderColor: '#F62626',
                                    color: '#F62626',
                                    '&:hover': {
                                        borderColor: '#d32f2f',
                                        backgroundColor: 'rgba(246, 38, 38, 0.04)'
                                    },
                                    width: '100px'
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{
                                    bgcolor: '#754C27',
                                    '&:hover': {
                                        bgcolor: '#5A3D1E',
                                    },
                                    width: '100px'
                                }}
                            >
                                Save
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Drawer>
        </>
    );
}