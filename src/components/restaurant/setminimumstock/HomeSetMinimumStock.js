import { Box, Button, InputAdornment, TextField, Typography, Drawer, IconButton, Checkbox, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
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
import { Edit, Delete, Search, DeleteIcon } from '@mui/icons-material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { branchAll } from '../../../api/branchApi'
import { addBrMinStock, queryBrMinStock, deleteBrMinStock } from '../../../api/restaurant/br_minimum_stockApi';


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

export default function HomeSetMinimumStock() {
    const dispatch = useDispatch();
    const [openDrawer, setOpenDrawer] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [filterDate, setFilterDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [units, setUnits] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [minStocks, setMinStocks] = useState([]);
    const [page, setPage] = useState(1);
    const [itemsPerPage] = useState(10);


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

    const handleDateChange = (date) => {
        setFilterDate(date);
    };

    const formik = useFormik({
        initialValues: {
            product_code: '',
            product_name: '',
            unit_code: '',
            branch_code: '',
            min_qty: '',
        },
        validate: values => {
            const errors = {};

            if (!values.product_code) {
                errors.product_code = 'Product is required';
            }
            if (!values.unit_code) {
                errors.unit_code = 'Unit is required';
            }
            if (!values.branch_code) {
                errors.branch_code = 'Branch is required';
            }
            if (!values.min_qty || values.min_qty <= 0) {
                errors.min_qty = 'Minimum quantity must be greater than 0';
            }

            return errors;
        },
        onSubmit: async (values) => {
            try {
                const minStockData = {
                    product_code: values.product_code,
                    branch_code: values.branch_code,
                    unit_code: values.unit_code,
                    min_qty: values.min_qty
                };

                await dispatch(addBrMinStock(minStockData)).unwrap();

                Swal.fire({
                    icon: 'success',
                    title: 'Saved successfully',
                    showConfirmButton: false,
                    timer: 1500
                });

                setOpenDrawer(false);
                resetForm();
                // Refresh data
                if (selectedBranch) {
                    dispatch(queryBrMinStock({
                        offset: 0,
                        limit: itemsPerPage,
                        branch_code: selectedBranch
                    }));
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to save minimum stock'
                });
            }
        }
    });

    useEffect(() => {
        const offset = (page - 1) * itemsPerPage;
        dispatch(queryBrMinStock({
            offset,
            limit: itemsPerPage
        }))
            .unwrap()
            .then((res) => {
                if (res && res.data) {
                    setMinStocks(res.data);
                }
            })
            .catch((error) => {
                console.error('Error fetching minimum stocks:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch minimum stocks'
                });
            });
    }, [page, dispatch, itemsPerPage]);

    useEffect(() => {
        let offset = 0;
        let limit = 100;
        dispatch(unitAll({ offset, limit }))
            .unwrap()
            .then((res) => {
                setUnits(res.data);
            })
            .catch((err) => console.log(err.message));
        dispatch(branchAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((response) => {
                setBranches(response.data || []);
            })
            .catch((error) => {
                console.error('Error fetching branches:', error);
            });
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

    const handleDelete = (product_code, branch_code) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#754C27',
            cancelButtonColor: '#F62626',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(deleteBrMinStock({ product_code, branch_code }))
                    .unwrap()
                    .then(() => {
                        Swal.fire(
                            'Deleted!',
                            'Minimum stock has been deleted.',
                            'success'
                        );
                        // Refresh data
                        if (selectedBranch) {
                            dispatch(queryBrMinStock({
                                offset: 0,
                                limit: itemsPerPage,
                                branch_code: selectedBranch
                            }));
                        }
                    })
                    .catch((error) => {
                        Swal.fire(
                            'Error!',
                            error.message || 'Failed to delete minimum stock',
                            'error'
                        );
                    });
            }
        });
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

                <FormControl sx={{ width: '50%' }}>
                    <Select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        displayEmpty
                        size="small"
                        sx={{
                            height: '40px',
                            backgroundColor: '#fff',
                            mt: '24px',
                            '& .MuiSelect-select': {
                                padding: '8.5px 14px',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.23)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.87)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#754C27',
                            }
                        }}
                    >
                        <MenuItem value="">
                            <em>All Branches</em>
                        </MenuItem>
                        {branches.map((branch) => (
                            <MenuItem key={branch.branch_code} value={branch.branch_code}>
                                {branch.branch_name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mt: '24px',
                        width: '90%',
                        gap: '20px'
                    }}
                >
                    {/* <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                    Search
                </Typography> */}
                    <TextField
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search"
                        sx={{
                            '& .MuiInputBase-root': {
                                height: '40px',
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
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Filter by date"
                            customInput={<CustomInput />}
                            popperClassName="custom-popper"
                        />
                    </Box>
                    {/* <Button
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
                </Button> */}


                </Box>

                <TableContainer component={Paper} sx={{ width: '80%', mt: '24px' }}>
                    <Table aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell sx={{ width: '1%', textAlign: 'center' }}>
                                    <Checkbox
                                        sx={{ color: '#FFF' }} />
                                </StyledTableCell>
                                <StyledTableCell width='1%'>No.</StyledTableCell>
                                <StyledTableCell align="center">ID</StyledTableCell>
                                <StyledTableCell align="center">Product Name</StyledTableCell>
                                <StyledTableCell align="center">Unit</StyledTableCell>
                                <StyledTableCell align="center">Minimum Quantity</StyledTableCell>
                                <StyledTableCell width='1%' align="center"></StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {minStocks.map((stock, index) => (
                                <StyledTableRow key={`${stock.product_code}-${stock.branch_code}`}>
                                    <StyledTableCell padding="checkbox">
                                        <Checkbox />
                                    </StyledTableCell>
                                    <StyledTableCell>{index + 1}</StyledTableCell>
                                    <StyledTableCell>{stock.product_code}</StyledTableCell>
                                    <StyledTableCell>{stock.tbl_product?.product_name}</StyledTableCell>
                                    <StyledTableCell>{stock.tbl_unit?.unit_name}</StyledTableCell>
                                    <StyledTableCell align="center">{stock.min_qty}</StyledTableCell>
                                    <StyledTableCell align="center">
                                        <IconButton
                                            onClick={() => handleDelete(stock.product_code, stock.branch_code)}
                                            sx={{ border: '1px solid #F62626', borderRadius: '7px' }}
                                        >
                                            <Delete sx={{ color: '#F62626' }} />
                                        </IconButton>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
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
                            Set Min Product
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
                                <Typography sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', }}>
                                    Product ID :
                                    <Box component="span" sx={{ color: '#754C27', ml: '12px' }}>
                                        #11
                                    </Box>
                                </Typography>


                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                    Product Name
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
                                    Branch
                                </Typography>
                                <FormControl fullWidth sx={{ mt: 1 }}>
                                    <Select
                                        size="small"
                                        name="branch_code"
                                        value={formik.values.branch_code}
                                        onChange={formik.handleChange}
                                        error={formik.touched.branch_code && Boolean(formik.errors.branch_code)}
                                        sx={{
                                            borderRadius: '10px',
                                        }}
                                    >
                                        <MenuItem value="">Select Branch</MenuItem>
                                        {branches.map((branch) => (
                                            <MenuItem key={branch.branch_code} value={branch.branch_code}>
                                                {branch.branch_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {formik.touched.branch_code && formik.errors.branch_code && (
                                        <Typography color="error" variant="caption">
                                            {formik.errors.branch_code}
                                        </Typography>
                                    )}
                                </FormControl>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                    Minimum Quantity
                                </Typography>
                                <TextField
                                    size="small"
                                    type="number"
                                    name="min_qty"
                                    value={formik.values.min_qty}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter minimum quantity"
                                    error={formik.touched.min_qty && Boolean(formik.errors.min_qty)}
                                    helperText={formik.touched.min_qty && formik.errors.min_qty}
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