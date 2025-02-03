import { Box, Button, InputAdornment, TextField, Typography, tableCellClasses, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Checkbox, Switch } from '@mui/material';
import React, { useState, useEffect } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import { useDispatch } from "react-redux";
import { Kt_rfsAlljoindt, countKt_rfs, deleteKt_rfs, Kt_rfsByRefno } from '../../../api/kitchen/kt_rfsApi';
import { kitchenAll } from '../../../api/kitchenApi';
import { searchProductName } from '../../../api/productrecordApi';
import { searchSupplier } from '../../../api/supplierApi';
import { supplierAll } from '../../../api/supplierApi';
import Swal from 'sweetalert2';

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

export default function ReceiptFromSupplier({ onCreate }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState(new Date());
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(1);
    const [kitchens, setKitchens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [kitchenSearchTerm, setKitchenSearchTerm] = useState('');
    const dispatch = useDispatch();
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [productResults, setProductResults] = useState([]);
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
    const [supplierResults, setSupplierResults] = useState([]);
    const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => {
        const loadSuppliers = async () => {
            try {
                const response = await dispatch(supplierAll({
                    offset: 0,
                    limit: 100
                })).unwrap();
                setSuppliers(response.data);
            } catch (err) {
                console.error('Error loading suppliers:', err);
            }
        };
        loadSuppliers();
    }, [dispatch]);

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
                    title: 'Error',
                    text: err.message || 'Failed to load kitchens',
                    confirmButtonColor: '#754C27'
                });
            }
        };
        loadKitchens();
        fetchData();
    }, [dispatch]);

    useEffect(() => {
        fetchData();
    }, [page, searchTerm, filterDate, kitchenSearchTerm, supplierSearchTerm]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const formattedDate = formatDate(filterDate);

            const [ordersRes, countRes] = await Promise.all([
                dispatch(Kt_rfsAlljoindt({
                    offset: (page - 1) * 10,
                    limit: 10,
                    rdate: formattedDate,
                    kitchen_code: kitchenSearchTerm,
                    product_code: productSearchTerm,
                    supplier_code: supplierSearchTerm
                })).unwrap(),
                dispatch(countKt_rfs({
                    rdate: formattedDate
                })).unwrap()
            ]);

            if (ordersRes.result) {
                setOrders(ordersRes.data);
                setCount(Math.ceil(countRes.data / 10));
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to fetch data'
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "";
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const handleKitchenChange = (e) => {
        setKitchenSearchTerm(e.target.value);
        setPage(1);
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
                selected.slice(selectedIndex + 1)
            );
        }

        setSelected(newSelected);
    };


    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDateChange = (date) => {
        setFilterDate(date);
    };

    const clearFilters = () => {
        setFilterDate(new Date());
        setSearchTerm("");
    };

    const handleDeleteSelected = () => {
        // Add delete functionality here
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button
                onClick={() => {
                    console.log("Create button clicked");
                    onCreate();
                }}
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

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: '48px',
                    width: '90%',
                    gap: '20px'
                }}
            >

                <Box
                    component="select"
                    value={supplierSearchTerm}
                    onChange={(e) => {
                        setSupplierSearchTerm(e.target.value);
                        setPage(1);
                    }}
                    sx={{
                        height: '38px',
                        width: '25%',
                        borderRadius: '4px',
                        padding: '0 14px',
                        fontSize: '16px',
                        '&:focus': {
                            outline: 'none',
                            borderColor: '#754C27',
                        }
                    }}
                >
                    <option value="">All Suppliers</option>
                    {suppliers.map((supplier) => (
                        <option key={supplier.supplier_code} value={supplier.supplier_code}>
                            {supplier.supplier_name}
                        </option>
                    ))}
                </Box>



                <Box
                    component="select"
                    value={kitchenSearchTerm}
                    onChange={handleKitchenChange}
                    sx={{
                        mt: '0px',
                        width: '40%',
                        height: '40px',
                        borderRadius: '4px',
                        padding: '0 14px',
                        fontSize: '16px',
                        '&:focus': {
                            outline: 'none',
                            borderColor: '#754C27',
                        }
                    }}
                >
                    <option value="">All Kitchens</option>
                    {kitchens.map((kitchen) => (
                        <option key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                            {kitchen.kitchen_name}
                        </option>
                    ))}
                </Box>
                <Box sx={{ width: '230px' }}>
                    <DatePicker
                        selected={filterDate}
                        onChange={handleDateChange}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Filter by date"
                        customInput={<CustomInput />}
                        popperClassName="custom-popper"
                    />
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ width: '100%', mt: '24px' }}>
                <Table sx={{}} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell sx={{ width: '1%', textAlign: 'center' }}>
                                <Checkbox
                                />
                            </StyledTableCell>
                            <StyledTableCell width='1%'>No.</StyledTableCell>
                            <StyledTableCell align="center">Ref.no</StyledTableCell>
                            <StyledTableCell align="center">Date</StyledTableCell>
                            <StyledTableCell align="center">Kitchen</StyledTableCell>
                            <StyledTableCell align="center">Supplier</StyledTableCell>
                            <StyledTableCell align="center">Amount</StyledTableCell>
                            <StyledTableCell align="center">Username</StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center">Loading...</TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center">No data found</TableCell>
                            </TableRow>
                        ) : (
                            orders.map((row, index) => (
                                <StyledTableRow key={row.refno}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selected.includes(row.kitchen_code)}
                                            onChange={(e) => handleCheckboxChange(e, row.kitchen_code)}
                                        />
                                    </TableCell>
                                    <TableCell>{((page - 1) * 10) + index + 1}</TableCell>
                                    <TableCell align="center">{row.refno}</TableCell>
                                    <TableCell align="center">{row.rdate}</TableCell>
                                    <TableCell align="center">{row.tbl_kitchen?.kitchen_name}</TableCell>
                                    <TableCell align="center">{row.tbl_supplier?.supplier_name}</TableCell>
                                    <TableCell align="center">
                                        {row.total?.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </TableCell>
                                    <TableCell align="center">{row.user_code}</TableCell>
                                    <TableCell align="center">
                                        {/* Add your edit/delete buttons here */}
                                    </TableCell>
                                </StyledTableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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