import { Box, Button, InputAdornment, TextField, Typography, tableCellClasses, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Checkbox, IconButton } from '@mui/material';
import React, { useState, useEffect } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import { styled } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import { useDispatch } from 'react-redux';
import { kitchenAll } from '../../../api/kitchenApi';
import { branchAll } from '../../../api/branchApi';
import { searchProductName } from '../../../api/productrecordApi';
import { Br_rfkAlljoindt, deleteBr_rfk } from '../../../api/restaurant/br_rfkApi';
import Swal from 'sweetalert2';

// CustomInput and styled components remain the same...
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

export default function ReceiptFromKitchen({ onCreate, onEdit }) {
    const dispatch = useDispatch();
    const [searchKitchen, setSearchKitchen] = useState("");
    const [searchProduct, setSearchProduct] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [kitchens, setKitchens] = useState([]);
    const [filterDate, setFilterDate] = useState(new Date());
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(1);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [searchBranch, setSearchBranch] = useState("");
    const limit = 5;

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [kitchenResponse, branchResponse] = await Promise.all([
                    dispatch(kitchenAll({ offset: 0, limit: 100 })).unwrap(),
                    dispatch(branchAll({ offset: 0, limit: 100 })).unwrap()
                ]);

                if (kitchenResponse.result && kitchenResponse.data) {
                    setKitchens(kitchenResponse.data);
                }
                if (branchResponse.result && branchResponse.data) {
                    setBranches(branchResponse.data);
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load initial data'
                });
            }
        };
        loadInitialData();
    }, [dispatch]);

    useEffect(() => {
        fetchData();
    }, [page, searchKitchen, searchBranch, searchProduct, filterDate]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const offset = (page - 1) * limit;
            const formattedDate = filterDate.toISOString().slice(0, 10).replace(/-/g, '');

            const response = await dispatch(Br_rfkAlljoindt({
                offset,
                limit,
                rdate1: formattedDate,
                rdate2: formattedDate,
                kitchen_code: searchKitchen,
                branch_code: searchBranch,
                product_code: searchProduct
            })).unwrap();

            if (response.result && response.data) {
                setData(response.data);
                const totalPages = Math.ceil(response.data.length / limit);
                setCount(totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch data'
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
                confirmButtonColor: '#754C27',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                await dispatch(deleteBr_rfk({ refno })).unwrap();
                await Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Record has been deleted.',
                    confirmButtonColor: '#754C27'
                });
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

    const handleSearchKitchenChange = (e) => {
        setSearchKitchen(e.target.value);
        setPage(1);
    };

    const handleSearchBranchChange = (e) => {
        setSearchBranch(e.target.value);
        setPage(1);
    };

    const handleSearchProductChange = async (e) => {
        const value = e.target.value;
        setSearchProduct(value);
        setPage(1);

        if (value.length > 0) {
            try {
                const response = await dispatch(searchProductName({ product_name: value })).unwrap();
                if (response.data) {
                    setSearchResults(response.data);
                    setShowDropdown(true);
                }
            } catch (error) {
                console.error('Error searching products:', error);
            }
        } else {
            setSearchResults([]);
            setShowDropdown(false);
        }
    };

    const handleDateChange = (date) => {
        setFilterDate(date);
        setPage(1);
    };

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: '48px' }}>
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
                    onChange={handleSearchKitchenChange}
                    sx={{
                        height: '38px',
                        width: '30%',
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

                {/* Branch Dropdown */}
                <Box
                    component="select"
                    value={searchBranch}
                    onChange={handleSearchBranchChange}
                    sx={{
                        height: '38px',
                        width: '25%',
                        borderRadius: '4px',
                        border: '1px solid rgba(0, 0, 0, 0.23)',
                        padding: '0 14px',
                        backgroundColor: '#fff'
                    }}
                >
                    <option value="">All Branches</option>
                    {branches.map((branch) => (
                        <option key={branch.branch_code} value={branch.branch_code}>
                            {branch.branch_name}
                        </option>
                    ))}
                </Box>

                {/* Product Search */}
                <Box sx={{ position: 'relative', width: '30%' }}>
                    <TextField
                        value={searchProduct}
                        onChange={handleSearchProductChange}
                        placeholder="Search Product"
                        sx={{
                            '& .MuiInputBase-root': { height: '38px' },
                            '& .MuiOutlinedInput-input': { padding: '8.5px 14px' },
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
                                    onClick={() => {
                                        setSearchProduct(product.product_name);
                                        setShowDropdown(false);
                                        fetchData();
                                    }}
                                    sx={{
                                        p: 1.5,
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: '#f5f5f5'
                                        },
                                        borderBottom: '1px solid #eee'
                                    }}
                                >
                                    <Typography>{product.product_name}</Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>

                {/* Date Picker */}
                <Box sx={{ width: '200px' }}>
                    <DatePicker
                        selected={filterDate}
                        onChange={handleDateChange}
                        dateFormat="MM/dd/yyyy"
                        placeholderText="Filter by date"
                        customInput={<CustomInput />}
                    />
                </Box>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} sx={{ width: '100%', mt: '24px' }}>
                <Table aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell width='1%'>No.</StyledTableCell>
                            <StyledTableCell align="center">Ref.no</StyledTableCell>
                            <StyledTableCell align="center">Date</StyledTableCell>
                            <StyledTableCell align="center">Kitchen</StyledTableCell>
                            <StyledTableCell align="center">Amount</StyledTableCell>
                            <StyledTableCell align="center">Username</StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">Loading...</TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">No data found</TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, index) => (
                                <StyledTableRow key={row.refno}>
                                    <StyledTableCell>
                                        {((page - 1) * limit) + index + 1}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">{row.refno}</StyledTableCell>
                                    <StyledTableCell align="center">{row.rdate}</StyledTableCell>
                                    <StyledTableCell align="center">{row.tbl_kitchen?.kitchen_name}</StyledTableCell>
                                    <StyledTableCell align="center">{row.total.toFixed(2)}</StyledTableCell>
                                    <StyledTableCell align="center">{row.user?.username}</StyledTableCell>
                                    <StyledTableCell align="center">
                                        <IconButton
                                            onClick={() => onEdit(row.refno)}
                                            sx={{ border: '1px solid #AD7A2C', borderRadius: '7px' }}
                                        >
                                            <EditIcon sx={{ color: '#AD7A2C' }} />
                                        </IconButton>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <IconButton
                                            onClick={() => handleDelete(row.refno)}
                                            sx={{ border: '1px solid #F62626', borderRadius: '7px' }}
                                        >
                                            <DeleteIcon sx={{ color: '#F62626' }} />
                                        </IconButton>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <IconButton
                                            onClick={() => {/* Add print functionality */ }}
                                            sx={{ border: '1px solid #5686E1', borderRadius: '7px' }}
                                        >
                                            <PrintIcon sx={{ color: '#5686E1' }} />
                                        </IconButton>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Stack spacing={2} sx={{ mt: 2, mb: 4, display: 'flex', alignItems: 'center' }}>
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