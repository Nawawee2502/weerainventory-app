import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    InputAdornment,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Checkbox,
    Switch,
    Stack,
    Pagination,
    CircularProgress,
    tableCellClasses
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch } from 'react-redux';
import { Kt_safAlljoindt, deleteKt_saf } from '../../../../api/kitchen/kt_safApi';
import { kitchenAll } from '../../../../api/kitchenApi';
import { searchProductName } from '../../../../api/productrecordApi';
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

export default function StockAdjustment({ onCreate, onEdit }) {
    const dispatch = useDispatch();
    const [searchKitchen, setSearchKitchen] = useState("");
    const [searchProduct, setSearchProduct] = useState("");
    const [kitchens, setKitchens] = useState([]);
    const [filterDate, setFilterDate] = useState(new Date());
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(1);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [excludePrice, setExcludePrice] = useState(false);
    const limit = 5;

    useEffect(() => {
        const loadKitchens = async () => {
            try {
                const response = await dispatch(kitchenAll({ offset: 0, limit: 100 })).unwrap();
                if (response.result && response.data) {
                    setKitchens(response.data);
                }
            } catch (error) {
                console.error('Error loading kitchens:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load kitchens'
                });
            }
        };

        loadKitchens();
    }, [dispatch]);

    useEffect(() => {
        fetchData();
    }, [page, searchKitchen, searchProduct, filterDate]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const offset = (page - 1) * limit;

            // Format date as YYYYMMDD for backend
            const year = filterDate.getFullYear();
            const month = String(filterDate.getMonth() + 1).padStart(2, '0');
            const day = String(filterDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}${month}${day}`;

            console.log('Fetching data with date:', formattedDate);

            const response = await dispatch(Kt_safAlljoindt({
                offset,
                limit,
                rdate1: formattedDate,
                rdate2: formattedDate,
                kitchen_code: searchKitchen,
                product_code: searchProduct
            })).unwrap();

            if (response.result) {
                // Update data array with received records
                setData(response.data || []);

                // Get the total count from the response and calculate pagination
                const total = response.total || 0;

                // Calculate total pages and update the count
                const totalPages = Math.ceil(total / limit);
                setCount(totalPages > 0 ? totalPages : 1);

                console.log(`Retrieved ${response.data.length} records out of ${total} total. Pages: ${totalPages}`);
            } else {
                console.error('API returned result:false:', response);
                setData([]);
                setCount(1);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
            setCount(1);

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch data: ' + (error.message || 'Unknown error')
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (refno) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                await dispatch(deleteKt_saf({ refno })).unwrap();
                await Swal.fire(
                    'Deleted!',
                    'Stock adjustment has been deleted.',
                    'success'
                );
                fetchData();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete record'
            });
        }
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelected(data.map(row => row.refno));
        } else {
            setSelected([]);
        }
    };

    const handleSelectOne = (event, refno) => {
        const selectedIndex = selected.indexOf(refno);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, refno);
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

    const handleDeleteSelected = async () => {
        if (selected.length === 0) return;

        try {
            const result = await Swal.fire({
                title: 'Delete Selected Adjustments',
                text: `Are you sure you want to delete ${selected.length} adjustments?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete them!'
            });

            if (result.isConfirmed) {
                await Promise.all(
                    selected.map(refno => dispatch(deleteKt_saf({ refno })).unwrap())
                );
                await Swal.fire(
                    'Deleted!',
                    'Selected adjustments have been deleted.',
                    'success'
                );
                setSelected([]);
                fetchData();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete selected adjustments'
            });
        }
    };

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: '48px', width: '90%', gap: '20px' }}>
                {/* Kitchen Dropdown */}
                <Box
                    component="select"
                    value={searchKitchen}
                    onChange={(e) => setSearchKitchen(e.target.value)}
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

                {/* Date Picker */}
                <Box sx={{ width: '200px' }}>
                    <DatePicker
                        selected={filterDate}
                        onChange={(date) => setFilterDate(date)}
                        dateFormat="MM/dd/yyyy"
                        customInput={<CustomInput />}
                    />
                </Box>

                {/* Price Toggle */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Switch
                        checked={excludePrice}
                        onChange={(e) => setExcludePrice(e.target.checked)}
                    />
                    <Typography sx={{ fontWeight: '500', color: '#7E84A3' }}>
                        Exclude price in file
                    </Typography>
                </Box>
            </Box>

            {/* Delete Selected Button */}
            <Box sx={{ width: '90%', mt: '24px' }}>
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteSelected}
                    disabled={selected.length === 0}
                >
                    Delete Selected ({selected.length})
                </Button>
            </Box>

            {/* Data Table */}
            <TableContainer component={Paper} sx={{ width: '90%', mt: '24px' }}>
                <Table aria-label="stock adjustments table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell padding="checkbox">
                                <Checkbox
                                    checked={data.length > 0 && selected.length === data.length}
                                    onChange={handleSelectAll}
                                />
                            </StyledTableCell>
                            <StyledTableCell>No.</StyledTableCell>
                            <StyledTableCell align="center">Ref.no</StyledTableCell>
                            <StyledTableCell align="center">Date</StyledTableCell>
                            <StyledTableCell align="center">Kitchen</StyledTableCell>
                            <StyledTableCell align="center">Total Amount</StyledTableCell>
                            <StyledTableCell align="center">Username</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    No data found
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, index) => {
                                const isSelected = selected.includes(row.refno);
                                return (
                                    <StyledTableRow key={row.refno}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={(event) => handleSelectOne(event, row.refno)}
                                            />
                                        </TableCell>
                                        <TableCell>{((page - 1) * limit) + index + 1}</TableCell>
                                        <TableCell align="center">{row.refno}</TableCell>
                                        <TableCell align="center">{row.rdate}</TableCell>
                                        <TableCell align="center">{row.tbl_kitchen?.kitchen_name}</TableCell>
                                        <TableCell align="center">${Number(row.total).toFixed(2)}</TableCell>
                                        <TableCell align="center">{row.user?.username}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <IconButton
                                                    onClick={() => onEdit(row.refno)}
                                                    sx={{ border: '1px solid #AD7A2C', borderRadius: '7px' }}
                                                >
                                                    <EditIcon sx={{ color: '#AD7A2C' }} />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDelete(row.refno)}
                                                    sx={{ border: '1px solid #F62626', borderRadius: '7px' }}
                                                >
                                                    <DeleteIcon sx={{ color: '#F62626' }} />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => { /* Add print functionality */ }}
                                                    sx={{ border: '1px solid #5686E1', borderRadius: '7px' }}
                                                >
                                                    <PrintIcon sx={{ color: '#5686E1' }} />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </StyledTableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <Stack spacing={2} sx={{ mt: 2, mb: 4 }}>
                <Pagination
                    count={count}
                    page={page}
                    onChange={(event, value) => setPage(value)}
                    shape="rounded"
                    showFirstButton
                    showLastButton
                />
            </Stack>
        </Box>
    );
}