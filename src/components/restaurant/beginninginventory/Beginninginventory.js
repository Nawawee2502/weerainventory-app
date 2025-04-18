// src/components/inventory/BranchBeginningInventory/BranchBeginningInventory.jsx
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
    Checkbox
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
import { branchAll } from '../../../api/branchApi';
import {
    addBr_stockcard,
    Br_stockcardAll,
    countBr_stockcard,
    updateBr_stockcard,
    deleteBr_stockcard
} from '../../../api/restaurant/br_stockcardApi';
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

// Custom Date Picker Input Component
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

export default function BeginningInventory() {
    const dispatch = useDispatch();
    const [openDrawer, setOpenDrawer] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [units, setUnits] = useState([]);
    const [branches, setBranches] = useState([]);
    const [stockcards, setStockcards] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [itemsPerPage] = useState(5);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [tableSearchTerm, setTableSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState(() => convertToLasVegasTime(new Date()));
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState([]);

    // Initial Form Values
    const initialValues = {
        date: convertToLasVegasTime(new Date()),
        product_code: '',
        product_name: '',
        unit_code: '',
        branch_code: '',
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
        if (!values.branch_code) errors.branch_code = 'Branch is required';
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

                const stockcardData = {
                    myear: values.isEditing ? values.myear : year,
                    monthh: values.isEditing ? values.monthh : month,
                    product_code: values.product_code,
                    unit_code: values.unit_code,
                    branch_code: values.branch_code,
                    refno: values.isEditing ? values.refno : 'BEG',
                    rdate: rdate,  // ให้ส่ง rdate ไปด้วยเสมอ
                    trdate: trdate,
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

                // แสดงข้อมูลที่จะส่งไปที่ API เพื่อดีบัก
                console.log("Sending to API:", stockcardData);

                const action = values.isEditing ? updateBr_stockcard : addBr_stockcard;
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
                    loadStockcardData(page);
                }
            } catch (error) {
                console.error('Error:', error);
                // Handle backend errors
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

    // Load Units and Branches
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [unitsResponse, branchesResponse] = await Promise.all([
                    dispatch(unitAll({ offset: 0, limit: 100 })).unwrap(),
                    dispatch(branchAll({ offset: 0, limit: 100 })).unwrap()
                ]);

                setUnits(unitsResponse.data || []);
                setBranches(branchesResponse.data || []);
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
        loadData();
    }, [dispatch]);

    // Load Stockcard Data
    const loadStockcardData = async (pageNumber = 1) => {
        try {
            setLoading(true);
            const offset = (pageNumber - 1) * itemsPerPage;
            const formattedDate = filterDate ? formatDate(filterDate) : null;

            // Fetch all stockcard data without refno filter in the API call
            const [stockcardsRes, countRes] = await Promise.all([
                dispatch(Br_stockcardAll({
                    offset,
                    limit: itemsPerPage,
                    rdate: formattedDate,
                    product_name: tableSearchTerm
                    // No refno filter here
                })).unwrap(),
                dispatch(countBr_stockcard({
                    rdate: formattedDate,
                    product_name: tableSearchTerm
                    // No refno filter here
                })).unwrap()
            ]);

            console.log("API Response:", stockcardsRes);

            if (stockcardsRes.result && Array.isArray(stockcardsRes.data)) {
                // Filter the results to only show BEG records in the table
                const begRecords = stockcardsRes.data.filter(record => record.refno === 'BEG');

                // Calculate pagination based on filtered results
                const filteredCount = begRecords.length;
                const totalOriginalRecords = countRes.data;

                // Adjust total count based on proportion of BEG records
                // This is an estimate - may need adjustment based on actual data distribution
                const estimatedTotalBegRecords = Math.ceil(totalOriginalRecords * (filteredCount / stockcardsRes.data.length || 1));

                const totalPages = Math.max(1, Math.ceil(estimatedTotalBegRecords / itemsPerPage));
                setCount(totalPages);

                // Set only BEG records to display in table
                setStockcards(begRecords);
            }
        } catch (error) {
            console.error('Error loading stockcard data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load stockcard data',
                confirmButtonColor: '#754C27'
            });
        } finally {
            setLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        loadStockcardData(page);
    }, [filterDate, tableSearchTerm, page]);

    // Handle Product Search
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

    // Handle Table Search
    const handleTableSearch = (e) => {
        setTableSearchTerm(e.target.value);
        setSelected([]);
        setPage(1);
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
        setShowDropdown(false);
    };

    // Reset Form
    const resetForm = () => {
        formik.resetForm();
        setProductSearchTerm('');
        setSelectedProduct(null);
    };

    // Handle Date Change
    const handleDateChange = (date) => {
        if (!date) return;
        const vegasDate = convertToLasVegasTime(date);
        setFilterDate(vegasDate);
        setPage(1);
    };

    // Clear Filters
    const clearFilters = () => {
        setTableSearchTerm('');
        setFilterDate(convertToLasVegasTime(new Date()));
        setPage(1);
        setSelected([]);
        loadStockcardData(1);
    };

    // Handle Page Change
    const handlePageChange = (event, value) => {
        setPage(value);
        loadStockcardData(value);
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
                branch_code: row.branch_code,
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
                await dispatch(deleteBr_stockcard({
                    refno: row.refno,
                    myear: row.myear,
                    monthh: row.monthh,
                    product_code: row.product_code,
                    branch_code: row.branch_code,  // เพิ่ม branch_code
                    rdate: row.rdate  // เพิ่ม rdate
                })).unwrap();

                await Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Record has been deleted.',
                    confirmButtonColor: '#754C27'
                });

                await loadStockcardData(page);
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
                    await dispatch(deleteBr_stockcard({
                        refno: item.refno,
                        myear: item.myear,
                        monthh: item.monthh,
                        product_code: item.product_code,
                        branch_code: item.branch_code,  // เพิ่ม branch_code
                        rdate: item.rdate  // เพิ่ม rdate
                    })).unwrap();
                }

                // Clear selection and reload data
                setSelected([]);
                await loadStockcardData(page);

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

                <Box sx={{ width: '80%', mt: '24px' }}>
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
                <TableContainer component={Paper} sx={{ width: '80%', mt: '24px' }}>
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
                                <StyledTableCell align="center">Product Code</StyledTableCell>
                                <StyledTableCell align="center">Product Name</StyledTableCell>
                                <StyledTableCell align="center">Restaurant</StyledTableCell>
                                <StyledTableCell align="center">Amount</StyledTableCell>
                                <StyledTableCell align="center">Unit Price</StyledTableCell>
                                <StyledTableCell align="center">Total</StyledTableCell>
                                <StyledTableCell width='1%' align="center">Edit</StyledTableCell>
                                <StyledTableCell width='1%' align="center">Delete</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <StyledTableRow>
                                    <StyledTableCell colSpan={10} align="center">Loading...</StyledTableCell>
                                </StyledTableRow>
                            ) : stockcards.length === 0 ? (
                                <StyledTableRow>
                                    <StyledTableCell colSpan={10} align="center">No records found</StyledTableCell>
                                </StyledTableRow>
                            ) : (
                                stockcards.map((row, index) => {
                                    const isSelected = selected.some(item =>
                                        item.refno === row.refno &&
                                        item.product_code === row.product_code
                                    );

                                    return (
                                        <StyledTableRow
                                            key={row.id || index}
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
                                            <StyledTableCell>{row.id || index + 1}</StyledTableCell>
                                            <StyledTableCell align="center">{row.product_code}</StyledTableCell>
                                            <StyledTableCell align="center">
                                                {row.tbl_product?.product_name || row.product_code}
                                            </StyledTableCell>
                                            <StyledTableCell align="center">
                                                {row.tbl_branch?.branch_name || row.branch_code || 'N/A'}
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

            {/* Drawer */}
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
                            Restaurant Beginning Inventory
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
                                    Restaurant
                                </Typography>
                                <Box
                                    component="select"
                                    name="branch_code"
                                    value={formik.values.branch_code}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    sx={{
                                        mt: '8px',
                                        width: '100%',
                                        height: '40px',
                                        borderRadius: '10px',
                                        padding: '0 14px',
                                        border: formik.touched.branch_code && formik.errors.branch_code
                                            ? '1px solid #d32f2f'
                                            : '1px solid rgba(0, 0, 0, 0.23)',
                                        fontSize: '16px',
                                        '&:focus': {
                                            outline: 'none',
                                            borderColor: '#754C27',
                                        },
                                    }}
                                >
                                    <option value="">Select Restaurant</option>
                                    {branches.map(branch => (
                                        <option key={branch.branch_code} value={branch.branch_code}>
                                            {branch.branch_name}
                                        </option>
                                    ))}
                                </Box>
                                {formik.touched.branch_code && formik.errors.branch_code && (
                                    <Typography color="error" variant="caption" sx={{ ml: 1 }}>
                                        {formik.errors.branch_code}
                                    </Typography>
                                )}

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                    Unit
                                </Typography>
                                <Box
                                    component="select"
                                    name="unit_code"
                                    value={formik.values.unit_code}
                                    disabled={!selectedProduct}
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
                                        backgroundColor: selectedProduct ? '#fff' : '#f5f5f5',
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