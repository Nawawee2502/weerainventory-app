import { Box, Button, InputAdornment, TextField, Typography, IconButton, Checkbox, Select, MenuItem, FormControl, Modal, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useDispatch } from "react-redux";
import { searchProductName } from '../../../../api/productrecordApi';
import { unitAll } from '../../../../api/productunitApi';
import { addBrMinStock, queryBrMinStock, deleteBrMinStock, updateBrMinStock, checkMinStockExists } from '../../../../api/restaurant/br_minimum_stockApi';
import { useFormik } from 'formik';
import Swal from 'sweetalert2';
import { Edit, Delete } from '@mui/icons-material';
import { branchAll } from '../../../../api/branchApi';

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

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: '15px',
    p: 4,
    overflowY: 'auto'
};

export default function HomeSetMinimumStock() {
    const dispatch = useDispatch();
    const [openModal, setOpenModal] = useState(false);
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
    const [isEditing, setIsEditing] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [tableSearchTerm, setTableSearchTerm] = useState('');


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

                // Check for duplicates only when adding new records
                if (!isEditing) {
                    const checkResult = await dispatch(checkMinStockExists({
                        product_code: values.product_code,
                        branch_code: values.branch_code
                    })).unwrap();

                    if (checkResult.exists) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Duplicate Entry',
                            text: 'This product is already set for this restaurant'
                        });
                        return;
                    }
                }

                if (isEditing) {
                    await dispatch(updateBrMinStock(minStockData)).unwrap();
                    Swal.fire({
                        icon: 'success',
                        title: 'Updated successfully',
                        showConfirmButton: false,
                        timer: 1500
                    });
                } else {
                    await dispatch(addBrMinStock(minStockData)).unwrap();
                    Swal.fire({
                        icon: 'success',
                        title: 'Saved successfully',
                        showConfirmButton: false,
                        timer: 1500
                    });
                }

                setOpenModal(false);
                resetForm();
                refreshData();
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to save minimum stock'
                });
            }
        }
    });

    const refreshData = () => {
        const offset = (page - 1) * itemsPerPage;

        // สร้าง params สำหรับส่งไป API
        const params = {
            offset,
            limit: itemsPerPage
        };

        // เพิ่ม branch_code ถ้ามีการเลือก
        if (selectedBranch) {
            params.branch_code = selectedBranch;
        }

        // เพิ่ม product_name ถ้ามีการค้นหา
        if (tableSearchTerm) {
            params.product_name = tableSearchTerm;
        }

        console.log("API Request params:", params);

        // เรียก API
        dispatch(queryBrMinStock(params))
            .unwrap()
            .then((res) => {
                console.log("API Response:", res);
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
    };

    useEffect(() => {
        refreshData();
    }, [page, selectedBranch, tableSearchTerm]);

    // โหลด units และ branches
    useEffect(() => {
        let offset = 0;
        let limit = 100;

        dispatch(unitAll({ offset, limit }))
            .unwrap()
            .then((res) => {
                setUnits(res.data);
            })
            .catch((err) => console.error('Error loading units:', err.message));

        dispatch(branchAll({ offset: 0, limit: 100 }))
            .unwrap()
            .then((response) => {
                setBranches(response.data || []);
            })
            .catch((error) => {
                console.error('Error fetching branches:', error);
            });
    }, [dispatch]);

    const handleTableSearch = (e) => {
        setTableSearchTerm(e.target.value);
        setPage(1);
    };

    // จัดการการค้นหาผลิตภัณฑ์ในฟอร์ม
    const handleSearchChange = async (e) => {
        try {
            const value = e.target.value;
            setSearchTerm(value);

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
        }
    };

    // จัดการการเลือกผลิตภัณฑ์จากผลการค้นหา
    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        formik.setFieldValue('product_code', product.product_code);
        formik.setFieldValue('product_name', product.product_name);
        formik.setFieldValue('unit_code', product.productUnit2?.unit_code || '');
        setSearchTerm(product.product_name);
        setShowDropdown(false);
    };

    // รีเซ็ตฟอร์ม
    const resetForm = () => {
        formik.resetForm();
        setSearchTerm('');
        setSelectedProduct(null);
        setIsEditing(false);
        setEditItem(null);
    };

    // จัดการการเปลี่ยนร้านอาหารในตัวกรอง
    const handleBranchChange = (e) => {
        const branchCode = e.target.value;
        setSelectedBranch(branchCode);
        setPage(1);
    };

    // จัดการการเปลี่ยนร้านอาหารในฟอร์ม
    const handleFormBranchChange = (e) => {
        const branchCode = e.target.value;
        formik.setFieldValue('branch_code', branchCode);

        // อัพเดทชื่อร้านอาหารในฟอร์ม
        updateRestaurantFromBranch(branchCode);
    };

    // Helper function สำหรับอัพเดทชื่อร้านอาหารตาม branch code
    const updateRestaurantFromBranch = (branchCode) => {
        if (branchCode) {
            const selectedBranchData = branches.find(branch => branch.branch_code === branchCode);
            if (selectedBranchData) {
                formik.setFieldValue('restaurant', selectedBranchData.branch_name || '');
            }
        } else {
            formik.setFieldValue('restaurant', '');
        }
    };

    // จัดการการแก้ไข
    const handleEdit = (stock) => {
        setIsEditing(true);
        setEditItem(stock);
        setSelectedProduct({
            product_code: stock.product_code,
            product_name: stock.tbl_product?.product_name,
            productUnit2: { unit_code: stock.unit_code }
        });

        // Find branch details to get restaurant name
        const branchData = branches.find(branch => branch.branch_code === stock.branch_code);
        const restaurantName = branchData ? branchData.branch_name : '';

        formik.setValues({
            product_code: stock.product_code,
            product_name: stock.tbl_product?.product_name,
            unit_code: stock.unit_code,
            branch_code: stock.branch_code,
            min_qty: stock.min_qty,
            restaurant: restaurantName
        });

        setSearchTerm(stock.tbl_product?.product_name);
        setOpenModal(true);
    };

    // จัดการการลบ
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
                        refreshData();
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

    // ดึงชื่อร้านอาหารจาก branch code
    const getRestaurantName = (branchCode) => {
        if (!branchCode) return '';
        const branch = branches.find(b => b.branch_code === branchCode);
        return branch ? branch.branch_name : '';
    };

    // ล้างตัวกรอง
    const clearFilters = () => {
        setTableSearchTerm('');
        setSelectedBranch('');
        setPage(1);
        setTimeout(() => {
            refreshData();
        }, 50);
    };

    return (
        <>
            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: '48px' }}>
                <Button onClick={() => setOpenModal(true)} sx={{
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
                            value={selectedBranch}
                            onChange={handleBranchChange}
                            displayEmpty
                            size="small"
                            sx={{
                                height: '38px',
                                backgroundColor: '#fff',
                                '& .MuiSelect-select': {
                                    padding: '8.5px 14px',
                                }
                            }}
                        >
                            <MenuItem value="">
                                <em>All Restaurant</em>
                            </MenuItem>
                            {branches.map((branch) => (
                                <MenuItem key={branch.branch_code} value={branch.branch_code}>
                                    {branch.branch_name}
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

                    <Button
                        onClick={clearFilters}
                        variant="outlined"
                        sx={{
                            height: '38px',
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

                <TableContainer component={Paper} sx={{ width: '80%', mt: '24px' }}>
                    <Table aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell sx={{ width: '1%', textAlign: 'center' }}>
                                    <Checkbox
                                        sx={{ color: '#FFF' }} />
                                </StyledTableCell>
                                <StyledTableCell width='1%'>No.</StyledTableCell>
                                <StyledTableCell align="center">Product Code</StyledTableCell>
                                <StyledTableCell align="center">Product Name</StyledTableCell>
                                <StyledTableCell align="center">Unit</StyledTableCell>
                                <StyledTableCell align="center">Minimum Quantity</StyledTableCell>
                                <StyledTableCell align="center">Restaurant</StyledTableCell>
                                <StyledTableCell width='12%' align="center">Actions</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {minStocks.length === 0 ? (
                                <StyledTableRow>
                                    <StyledTableCell colSpan={8} align="center">No records found</StyledTableCell>
                                </StyledTableRow>
                            ) : (
                                minStocks.map((stock, index) => (
                                    <StyledTableRow key={`${stock.product_code}-${stock.branch_code}`}>
                                        <StyledTableCell padding="checkbox">
                                            <Checkbox />
                                        </StyledTableCell>
                                        <StyledTableCell>{index + 1}</StyledTableCell>
                                        <StyledTableCell>{stock.product_code}</StyledTableCell>
                                        <StyledTableCell>{stock.tbl_product?.product_name}</StyledTableCell>
                                        <StyledTableCell>{stock.tbl_unit?.unit_name}</StyledTableCell>
                                        <StyledTableCell align="center">{stock.min_qty}</StyledTableCell>
                                        <StyledTableCell>{getRestaurantName(stock.branch_code)}</StyledTableCell>
                                        <StyledTableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                <IconButton
                                                    onClick={() => handleEdit(stock)}
                                                    sx={{ border: '1px solid #754C27', borderRadius: '7px' }}
                                                >
                                                    <Edit sx={{ color: '#754C27' }} />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDelete(stock.product_code, stock.branch_code)}
                                                    sx={{ border: '1px solid #F62626', borderRadius: '7px' }}
                                                >
                                                    <Delete sx={{ color: '#F62626' }} />
                                                </IconButton>
                                            </Box>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Modal for Add/Edit */}
            <Modal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    resetForm();
                }}
                aria-labelledby="modal-title"
            >
                <Box sx={modalStyle}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography
                            id="modal-title"
                            variant="h6"
                            component="h2"
                            fontWeight="bold"
                            color="#754C27"
                        >
                            {isEditing ? 'Edit Minimum Stock' : 'Add Minimum Stock'}
                        </Typography>
                        <IconButton
                            onClick={() => {
                                setOpenModal(false);
                                resetForm();
                            }}
                            size="small"
                            sx={{ bgcolor: '#f5f5f5' }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <form onSubmit={formik.handleSubmit}>
                        <Box sx={{ width: '100%' }}>
                            <Box sx={{ mb: 2 }}>
                                <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: '600', color: '#754C27' }}>
                                    Restaurant
                                </Typography>
                                <FormControl fullWidth>
                                    <Select
                                        size="small"
                                        name="branch_code"
                                        value={formik.values.branch_code}
                                        onChange={handleFormBranchChange}
                                        error={formik.touched.branch_code && Boolean(formik.errors.branch_code)}
                                        displayEmpty
                                        sx={{
                                            borderRadius: '10px',
                                        }}
                                    >
                                        <MenuItem value="">Select Restaurant</MenuItem>
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
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: '600', color: '#754C27' }}>
                                    Product Name
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
                                    Unit
                                </Typography>
                                <Box
                                    component="select"
                                    name="unit_code"
                                    value={formik.values.unit_code}
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
                                    {selectedProduct && (
                                        <option value={selectedProduct.productUnit2?.unit_code}>
                                            {units.find(u => u.unit_code === selectedProduct.productUnit2?.unit_code)?.unit_name || ''}
                                        </option>
                                    )}
                                </Box>
                                {formik.touched.unit_code && formik.errors.unit_code && (
                                    <Typography color="error" variant="caption" sx={{ ml: 1 }}>
                                        {formik.errors.unit_code}
                                    </Typography>
                                )}
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: '600', color: '#754C27' }}>
                                    Minimum Quantity
                                </Typography>
                                <TextField
                                    fullWidth
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
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                        },
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'flex-end',
                            mt: 3
                        }}>
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() => {
                                    setOpenModal(false);
                                    resetForm();
                                }}
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
                                {isEditing ? 'Update' : 'Save'}
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Modal>
        </>
    );
}