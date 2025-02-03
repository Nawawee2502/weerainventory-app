import {
    Box, Button, InputAdornment, TextField, Typography,
    TableContainer, Table, TableHead, TableRow, TableCell, tableCellClasses,
    TableBody, Paper, Checkbox, IconButton
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import Swal from 'sweetalert2';
import { useDispatch } from "react-redux";
import { kt_powAlljoindt, countkt_pow, Kt_powByRefno, deleteKt_pow } from '../../../api/kitchen/kt_powApi';
import { deleteKt_powdt } from '../../../api/kitchen/kt_powdtApi';
import { kitchenAll } from '../../../api/kitchenApi';
import { searchProductName } from '../../../api/productrecordApi';


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

// Custom DatePicker Input Component
const CustomInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
        <TextField
            value={value}
            onClick={onClick}
            placeholder={placeholder}
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
                    <InputAdornment position="start">
                        <CalendarTodayIcon
                            sx={{
                                color: '#754C27',
                                cursor: 'pointer'
                            }}
                        />
                    </InputAdornment>
                ),
            }}
        />
    </Box>
));

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

export default function PurchaseOrderToWarehouse({ onCreate, onEdit }) {
    const dispatch = useDispatch();
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState(new Date());
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(1);
    const [itemsPerPage] = useState(5);
    const [kitchens, setKitchens] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [kitchenSearchTerm, setKitchenSearchTerm] = useState('');
    const [productSearchTerm, setProductSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [page, filterDate, kitchenSearchTerm]);

    useEffect(() => {
        const loadKitchens = async () => {
            try {
                const response = await dispatch(kitchenAll({
                    offset: 0,
                    limit: 100
                })).unwrap();
                setKitchens(response.data);
            } catch (err) {
                console.error('Error loading kitchens:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error Loading Kitchens',
                    text: err.message || 'Failed to load kitchens',
                    confirmButtonColor: '#754C27'
                });
            }
        };
        loadKitchens();
    }, [dispatch]);

    const fetchOrders = async () => {
        try {
            const currentPage = Math.max(1, page);
            const offset = Math.max(0, (currentPage - 1) * itemsPerPage);
            const formattedDate = filterDate ? formatDate(filterDate) : null;

            const [ordersRes, countRes] = await Promise.all([
                dispatch(kt_powAlljoindt({
                    offset,
                    limit: itemsPerPage,
                    ...(formattedDate && { rdate: formattedDate }),
                    ...(productSearchTerm && { product_code: productSearchTerm }),
                    ...(kitchenSearchTerm && { kitchen_code: kitchenSearchTerm })
                })).unwrap(),
                dispatch(countkt_pow({
                    ...(formattedDate && { rdate: formattedDate })
                })).unwrap()
            ]);

            if (ordersRes.result && Array.isArray(ordersRes.data)) {
                const resultData = ordersRes.data.map((item, index) => ({
                    ...item,
                    id: offset + index + 1
                }));
                setOrders(resultData);
            }

            if (countRes.result) {
                const totalPages = Math.ceil(countRes.data / itemsPerPage);
                setCount(totalPages);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error loading data',
                text: err.message || 'An unknown error occurred'
            });
        }
    };

    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setProductSearchTerm(value);

        if (value.trim()) {
            try {
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
            } catch (err) {
                console.error('Error searching products:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Search Error',
                    text: err.message || 'Failed to search products',
                    confirmButtonColor: '#754C27'
                });
            }
        } else {
            setSearchResults([]);
            setShowDropdown(false);
            setProductSearchTerm('');
        }
    };

    const handleDateChange = (date) => {
        const vegasDate = convertToLasVegasTime(date);
        setFilterDate(vegasDate);
        setPage(1);
    };

    const clearFilters = () => {
        const today = convertToLasVegasTime(new Date());
        setFilterDate(today);
        setSearchTerm("");
        setPage(1);
    };

    const handleDelete = (refno) => {
        Swal.fire({
            title: 'Are you sure you want to delete this order?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    Swal.fire({
                        title: 'Deleting order...',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    // 1. Get order data
                    const orderData = await dispatch(Kt_powByRefno(refno)).unwrap();

                    // 2. Delete detail records
                    for (const item of orderData.data.kt_powdts) {
                        await dispatch(deleteKt_powdt({
                            refno: refno,
                            product_code: item.product_code
                        })).unwrap();
                    }

                    // 3. Delete header record
                    await dispatch(deleteKt_pow({ refno })).unwrap();

                    // 4. Count remaining records and calculate pages
                    const countRes = await dispatch(countkt_pow({})).unwrap();
                    const totalPages = Math.ceil(countRes.data / itemsPerPage);
                    const newPage = page > totalPages ? Math.max(1, totalPages) : page;

                    Swal.fire({
                        icon: 'success',
                        title: 'Order deleted successfully',
                        timer: 1500,
                        showConfirmButton: false,
                    });

                    setPage(newPage);
                    await fetchOrders();

                } catch (err) {
                    console.error("Error:", err);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error deleting order',
                        text: err.message || 'An unknown error occurred',
                        confirmButtonText: 'OK'
                    });
                }
            }
        });
    };

    const handleDeleteSelected = () => {
        if (selected.length === 0) return;

        Swal.fire({
            title: 'Are you sure you want to delete the selected orders?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Deleting orders...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const selectedOrders = orders.filter(row => selected.includes(row.kitchen_code));
                const deletePromises = selectedOrders.map(async (order) => {
                    try {
                        const orderData = await dispatch(Kt_powByRefno(order.refno)).unwrap();

                        // Delete all detail records
                        const detailPromises = orderData.data.kt_powdts.map(item =>
                            dispatch(deleteKt_powdt({
                                refno: order.refno,
                                product_code: item.product_code
                            })).unwrap()
                        );
                        await Promise.all(detailPromises);

                        // Delete header record
                        await dispatch(deleteKt_pow({ refno: order.refno })).unwrap();
                    } catch (err) {
                        throw err;
                    }
                });

                Promise.all(deletePromises)
                    .then(async () => {
                        const countRes = await dispatch(countkt_pow({})).unwrap();
                        const totalPages = Math.ceil(countRes.data / itemsPerPage);
                        const newPage = page > totalPages ? Math.max(1, totalPages) : page;

                        setSelected([]);
                        setPage(newPage);

                        Swal.fire({
                            icon: 'success',
                            title: 'Selected orders deleted successfully',
                            timer: 1500,
                            showConfirmButton: false,
                        });

                        await fetchOrders();
                    })
                    .catch((err) => {
                        console.error("Error deleting orders:", err);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error deleting orders',
                            text: err.message || 'An unknown error occurred',
                            confirmButtonText: 'OK'
                        });
                    });
            }
        });
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = orders.map((row) => row.kitchen_code);
            setSelected(newSelected);
        } else {
            setSelected([]);
        }
    };

    const handleCheckboxChange = (event, kitchen_code) => {
        const selectedIndex = selected.indexOf(kitchen_code);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, kitchen_code);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
    };

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Create Button */}
            <Button
                onClick={onCreate}
                sx={{
                    width: '209px',
                    height: '70px',
                    background: 'linear-gradient(180deg, #AD7A2C 0%, #754C27 100%)',
                    borderRadius: '15px',
                    boxShadow: '0px 4px 4px 0px #00000040',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: '48px',
                    '&:hover': {
                        background: 'linear-gradient(180deg, #8C5D1E 0%, #5D3A1F 100%)',
                    }
                }}
            >
                <AddCircleIcon sx={{ fontSize: '42px', color: '#FFFFFF', mr: '12px' }} />
                <Typography sx={{ fontSize: '24px', fontWeight: '600', color: '#FFFFFF' }}>
                    Create
                </Typography>
            </Button>

            {/* Search and Filters */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: '48px', width: '90%', gap: '20px' }}>
                <Box
                    component="select"
                    value={kitchenSearchTerm}
                    onChange={(e) => {
                        setKitchenSearchTerm(e.target.value);
                        setPage(1);
                    }}
                    sx={{
                        height: '38px',
                        width: '25%',
                        borderRadius: '4px',
                        border: '1px solid rgba(0, 0, 0, 0.23)',
                        padding: '0 14px',
                        backgroundColor: '#fff'
                    }}
                >
                    <option value="">All Kitchens</option>
                    {kitchens.map((kitchen) => (
                        <option key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                            {kitchen.kitchen_name}
                        </option>
                    ))}
                </Box>

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

            {/* Delete Selected Button */}
            <Box sx={{ width: '100%', mt: '24px' }}>
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteSelected}
                    sx={{ mt: 2 }}
                    disabled={selected.length === 0}
                >
                    Delete Selected ({selected.length})
                </Button>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} sx={{ width: '100%', mt: '24px' }}>
                <Table sx={{}} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell sx={{ width: '1%', textAlign: 'center' }}>
                                <Checkbox
                                    sx={{ color: '#FFF' }}
                                    indeterminate={selected.length > 0 && selected.length < orders.length}
                                    checked={orders.length > 0 && selected.length === orders.length}
                                    onChange={handleSelectAllClick}
                                />
                            </StyledTableCell>
                            <StyledTableCell width='1%'>No.</StyledTableCell>
                            <StyledTableCell align="center">Ref.no</StyledTableCell>
                            <StyledTableCell align="center">Date</StyledTableCell>
                            <StyledTableCell align="center">Kitchen</StyledTableCell>
                            <StyledTableCell align="center">Amount</StyledTableCell>
                            <StyledTableCell align="center">Username</StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((row) => (
                            <StyledTableRow key={row.refno}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selected.includes(row.kitchen_code)}
                                        onChange={(event) => handleCheckboxChange(event, row.kitchen_code)}
                                    />
                                </TableCell>
                                <TableCell>{row.id}</TableCell>
                                <TableCell align="center">{row.refno}</TableCell>
                                <TableCell align="center">{row.rdate}</TableCell>
                                <TableCell align="center">
                                    {row.tbl_kitchen?.kitchen_name || row.kitchen_code}
                                </TableCell>
                                <TableCell align="center">
                                    {typeof row.total === 'number'
                                        ? row.total.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })
                                        : row.total}
                                </TableCell>
                                <TableCell align="center">
                                    {row.user?.username || row.user_code}
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        onClick={() => onEdit(row.refno)}
                                        sx={{
                                            border: '1px solid #AD7A2C',
                                            borderRadius: '7px'
                                        }}
                                    >
                                        <EditIcon sx={{ color: '#AD7A2C' }} />
                                    </IconButton>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        onClick={() => handleDelete(row.refno)}
                                        sx={{
                                            border: '1px solid #F62626',
                                            borderRadius: '7px'
                                        }}
                                    >
                                        <DeleteIcon sx={{ color: '#F62626' }} />
                                    </IconButton>
                                </TableCell>
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
    );
}