import { Box, Button, InputAdornment, TextField, Typography, Drawer, IconButton, FormControlLabel, Divider, Grid, Pagination, Stack } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
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
import Checkbox from '@mui/material/Checkbox';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch } from "react-redux";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import CloseIcon from '@mui/icons-material/Close';
import { fetchAlltypeuser } from '../../api/usertypeApi';
import { addTypeUserPermission, getAllTypeUserPermissions, deleteTypeUserPermission, updateTypeUserPermission, countTypeUserPermissions } from '../../api/typeuserpermissionApi';
import { useFormik } from "formik";
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

const initialValues = {
    typeuser_code: '',
    menu_setgeneral: 'N',
    menu_setuser: 'N',
    menu_setwarehouse: 'N',
    menu_setkitchen: 'N',
    menu_setbranch: 'N',
    // General Settings
    menu_setgen_typeproduct: 'N',
    menu_setgen_unit: 'N',
    menu_setgen_product: 'N',
    menu_setgen_branch: 'N',
    menu_setgen_kitchen: 'N',
    menu_setgen_supplier: 'N',
    // User Settings
    menu_setuser_typeuser: 'N',
    menu_setuser_typeuserpermission: 'N',
    menu_setuser_user: 'N',
    // Warehouse
    menu_setwh_purchase_order_to_supplier: 'N',
    menu_setwh_receipt_from_supplier: 'N',
    menu_setwh_receipt_from_kitchen: 'N',
    menu_setwh_dispatch_to_kitchen: 'N',
    menu_setwh_dispatch_to_branch: 'N',
    menu_setwh_report: 'N',
    // Kitchen
    menu_setkt_purchase_order_to_wh: 'N',
    menu_setkt_receipt_from_supplier: 'N',  // ตรวจสอบชื่อให้ตรงกับ database
    menu_setkt_receipt_from_wh: 'N',
    menu_setkt_goods_requisition: 'N',
    menu_setkt_product_receipt: 'N',
    menu_setkt_transfer_to_wh: 'N',
    menu_setkt_dispatch_to_branch: 'N',
    menu_setkt_stock_adjustment: 'N',
    menu_setkt_report: 'N',
    // Branch
    menu_setbr_minmum_stock: 'N',
    menu_setbr_stock_adjustment: 'N',
    menu_setbr_purchase_order_to_wh: 'N',
    menu_setbr_receipt_from_warehouse: 'N',
    menu_setbr_receipt_from_kitchen: 'N',
    menu_setbr_receipt_from_supplier: 'N',
    menu_setbr_goods_requisition: 'N',
    menu_setbr_report: 'N'
};

export default function UserPermission() {
    const dispatch = useDispatch();
    const [openDrawer, setOpenDrawer] = useState(false);
    const [userTypes, setUserTypes] = useState([]);
    const [selected, setSelected] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [openEditDrawer, setOpenEditDrawer] = useState(false);
    const [editingPermission, setEditingPermission] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [count, setCount] = useState(0);

    // Add page change handle

    // แก้ไขใน loadData
    const [totalItems, setTotalItems] = useState(0);
    useEffect(() => {
        loadData(1);
    }, []);

    useEffect(() => {
        if (permissions.length > itemsPerPage) {
            // If we have more items than we should, reload the current page
            loadData(page);
        }
    }, [permissions.length]);

    // ฟังก์ชันโหลดข้อมูล
    const loadData = async (targetPage) => {
        try {
            // Clear existing data first
            setPermissions([]); // เคลียร์ข้อมูลเก่าก่อน

            // Calculate correct offset
            const offset = (targetPage - 1) * itemsPerPage;
            console.log('Loading page:', targetPage, 'offset:', offset, 'limit:', itemsPerPage);

            // Load permissions with correct pagination
            const permissionsRes = await dispatch(getAllTypeUserPermissions({
                offset: offset,
                limit: itemsPerPage
            })).unwrap();

            if (permissionsRes?.data) {
                // Take only the first itemsPerPage items
                const paginatedData = permissionsRes.data.slice(0, itemsPerPage);
                setPermissions(paginatedData);
            }

            // Update current page
            setPage(targetPage);

            // Load user types
            const userTypesRes = await dispatch(fetchAlltypeuser({
                offset: 0,
                limit: 100
            })).unwrap();

            if (userTypesRes?.data) {
                setUserTypes(userTypesRes.data);
            }

            // Get total count for pagination
            const countRes = await dispatch(countTypeUserPermissions({ test: "" })).unwrap();
            if (countRes?.data) {
                const totalPages = Math.ceil(countRes.data / itemsPerPage);
                setCount(totalPages);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    // handle page change
    const handlePageChange = (event, newPage) => {
        console.log('Changing to page:', newPage); // debug log
        loadData(newPage);
    };

    // ฟังก์ชัน Handle Checkbox
    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = permissions.map(permission => permission.typeuser_code);
            setSelected(newSelected);
        } else {
            setSelected([]);
        }
    };

    const handleCheckboxChange = (event, code) => {
        const selectedIndex = selected.indexOf(code);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, code);
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


    const toggleEditDrawer = (open) => (event) => {
        if (event?.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setOpenEditDrawer(open);
        if (!open) {
            setEditingPermission(null);
            formik.resetForm();
        }
    };

    // ฟังก์ชันค้นหา
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Filter permissions
    const filteredPermissions = permissions.filter(permission => {
        const userType = userTypes.find(type => type.typeuser_code === permission.typeuser_code);
        return userType?.typeuser_name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // ฟังก์ชัน Handle Delete
    const handleDelete = (typeuser_code) => {
        Swal.fire({
            title: 'Are you sure you want to delete this permission?',
            text: 'You will not be able to recover this information!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(deleteTypeUserPermission({ typeuser_code }))
                    .unwrap()
                    .then(() => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted successfully',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                        loadData();
                    })
                    .catch((error) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error deleting permission',
                            text: 'Please try again',
                            timer: 3000,
                            showConfirmButton: false,
                        });
                    });
            }
        });
    };

    const handleDeleteSelected = () => {
        Swal.fire({
            title: 'Are you sure you want to delete selected permissions?',
            text: 'You will not be able to recover this information!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                Promise.all(
                    selected.map(typeuser_code =>
                        dispatch(deleteTypeUserPermission({ typeuser_code })).unwrap()
                    )
                )
                    .then(() => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted successfully',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                        setSelected([]);
                        loadData();
                    })
                    .catch((error) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error deleting permissions',
                            text: 'Please try again',
                            timer: 3000,
                            showConfirmButton: false,
                        });
                    });
            }
        });
    };

    const handleSaveEdit = async () => {
        try {
            await dispatch(updateTypeUserPermission(formik.values));
            setOpenEditDrawer(false);
            setEditingPermission(null);
            loadData();
            Swal.fire({
                icon: 'success',
                title: 'Updated successfully',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error updating permission',
                text: 'Please try again',
                timer: 3000,
                showConfirmButton: false,
            });
        }
    };

    // ฟังก์ชัน Handle Edit
    const handleEdit = (permission) => {
        setEditingPermission(permission);
        formik.setValues({
            typeuser_code: permission.typeuser_code,
            ...Object.keys(permission).reduce((acc, key) => {
                if (key.startsWith('menu_')) {
                    acc[key] = permission[key];
                }
                return acc;
            }, {})
        });
        setOpenEditDrawer(true);
    };

    const formik = useFormik({
        initialValues,
        onSubmit: async (values) => {
            try {
                const response = await dispatch(addTypeUserPermission(values)).unwrap();

                if (response.result) {
                    // Get total count to determine which page to load
                    const countResponse = await dispatch(countTypeUserPermissions({ test: "" }));
                    if (countResponse.payload?.data) {
                        const totalItems = countResponse.payload.data;
                        const targetPage = Math.ceil(totalItems / itemsPerPage);
                        setOpenDrawer(false);
                        await Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: 'เพิ่มข้อมูลสำเร็จ',
                            timer: 1500,
                            showConfirmButton: false,
                        });

                        // Reset form and refresh data
                        formik.resetForm();

                        await loadData(targetPage); // โหลดข้อมูลหน้าสุดท้าย
                    }
                } else {
                    throw new Error(response.message || 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล',
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
        }
    });

    useEffect(() => {
        const loadUserTypes = async () => {
            try {
                const response = await dispatch(fetchAlltypeuser({ offset: 0, limit: 100 }));
                if (response.payload?.data) {
                    setUserTypes(response.payload.data);
                }
            } catch (error) {
                console.error('Error loading user types:', error);
            }
        };
        loadUserTypes();
    }, [dispatch]);

    const toggleDrawer = (drawerType) => {
        if (drawerType === 'edit') {
            return {
                open: () => setOpenEditDrawer(true),
                close: () => {
                    setOpenEditDrawer(false);
                    setEditingPermission(null);
                    formik.resetForm();
                }
            };
        }
        return {
            open: () => setOpenDrawer(true),
            close: () => {
                setOpenDrawer(false);
                formik.resetForm();
            }
        };
    };

    const handleCheckboxChangeFormik = (name) => (event) => {
        formik.setFieldValue(name, event.target.checked ? 'Y' : 'N');
    };

    const handleMainPermissionChange = (permission) => (event) => {
        const value = event.target.checked ? 'Y' : 'N';
        const updates = {};

        // Set main permission
        updates[permission] = value;

        // Set related sub-permissions
        Object.keys(formik.values).forEach(key => {
            if (key.startsWith(permission.replace('menu_', 'menu_' + permission.split('_')[1] + '_'))) {
                updates[key] = value;
            }
        });

        formik.setValues({
            ...formik.values,
            ...updates
        });
    };

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                // justifyContent: 'center',
            }}
        >
            <Button
                onClick={() => toggleDrawer('create').open()}
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

            <TableContainer component={Paper} sx={{ width: '100%', mt: '24px' }}>
                <Table sx={{}} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell sx={{ width: '1%', textAlign: 'center' }}>
                                <Checkbox
                                    sx={{ color: '#FFF' }}
                                    indeterminate={selected.length > 0 && selected.length < permissions.length}
                                    checked={permissions.length > 0 && selected.length === permissions.length}
                                    onChange={handleSelectAllClick}
                                />
                            </StyledTableCell>
                            <StyledTableCell width='1%'>No.</StyledTableCell>
                            <StyledTableCell align="center">User Type Code</StyledTableCell>
                            <StyledTableCell align="center">User Type Name</StyledTableCell>
                            <StyledTableCell align="center">Set General</StyledTableCell>
                            <StyledTableCell align="center">User Setting</StyledTableCell>
                            <StyledTableCell align="center">Warehouse</StyledTableCell>
                            <StyledTableCell align="center">Commissary Kitchen</StyledTableCell>
                            <StyledTableCell align="center">Restaurant</StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {permissions.map((permission, index) => {
                            const userType = userTypes.find(type => type.typeuser_code === permission.typeuser_code);
                            const currentIndex = ((page - 1) * itemsPerPage) + index + 1;
                            return (
                                <StyledTableRow key={permission.typeuser_code}>
                                    <StyledTableCell padding="checkbox" align="center">
                                        <Checkbox
                                            checked={selected.includes(permission.typeuser_code)}
                                            onChange={(event) => handleCheckboxChange(event, permission.typeuser_code)}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell component="th" scope="row">
                                        {currentIndex}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">{permission.typeuser_code}</StyledTableCell>
                                    <StyledTableCell align="center">{userType?.typeuser_name}</StyledTableCell>
                                    <StyledTableCell align="center">
                                        {permission.menu_setgeneral === 'Y' ? 'Yes' : 'No'}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        {permission.menu_setuser === 'Y' ? 'Yes' : 'No'}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        {permission.menu_setwarehouse === 'Y' ? 'Yes' : 'No'}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        {permission.menu_setkitchen === 'Y' ? 'Yes' : 'No'}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        {permission.menu_setbranch === 'Y' ? 'Yes' : 'No'}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <IconButton
                                            color="primary"
                                            size="md"
                                            onClick={() => handleEdit(permission)}
                                            sx={{ border: '1px solid #AD7A2C', borderRadius: '7px' }}
                                        >
                                            <EditIcon sx={{ color: '#AD7A2C' }} />
                                        </IconButton>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <IconButton
                                            color="danger"
                                            size="md"
                                            onClick={() => handleDelete(permission.typeuser_code)}
                                            sx={{ border: '1px solid #F62626', borderRadius: '7px' }}
                                        >
                                            <DeleteIcon sx={{ color: '#F62626' }} />
                                        </IconButton>
                                    </StyledTableCell>
                                </StyledTableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Stack spacing={2} sx={{ mt: '8px' }}>
                <Pagination
                    count={count}
                    page={page}
                    onChange={handlePageChange}
                    shape="rounded"
                />
            </Stack>
            {/* Permission Creation/Edit Drawer */}
            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={() => toggleDrawer('create').close()}
                PaperProps={{
                    sx: {
                        width: '70%',
                        p: 3
                    }
                }}
            >
                <IconButton
                    onClick={() => toggleDrawer('create').close()}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>

                <Typography variant="h6" sx={{ mb: 3 }}>
                    User Permission Settings
                </Typography>

                <form onSubmit={formik.handleSubmit}>
                    {/* User Type Selection */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <Typography sx={{ mb: 1 }}>User Type</Typography>
                        <Select
                            name="typeuser_code"
                            value={formik.values.typeuser_code}
                            onChange={formik.handleChange}
                            displayEmpty
                        >
                            <MenuItem disabled value="">Select User Type</MenuItem>
                            {userTypes.map((type) => (
                                <MenuItem key={type.typeuser_code} value={type.typeuser_code}>
                                    {type.typeuser_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Main Permissions */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ mb: 2, fontWeight: '600', color: '#754C27' }}>
                            Main Access Rights
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {[
                                'menu_setgeneral',
                                'menu_setuser',
                                'menu_setwarehouse',
                                'menu_setkitchen',
                                'menu_setbranch'
                            ].map((key) => (
                                <FormControlLabel
                                    key={key}
                                    control={
                                        <Checkbox
                                            checked={formik.values[key] === 'Y'}
                                            onChange={handleMainPermissionChange(key)}
                                        />
                                    }
                                    label={
                                        key === 'menu_setbranch'
                                            ? 'RESTAURANT'
                                            : key.replace('menu_set', '').replace('_', ' ').toUpperCase()
                                    }
                                />
                            ))}
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Sub Permissions */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ mb: 2, fontWeight: '600', color: '#754C27' }}>
                            Detailed Permissions
                        </Typography>
                        <Grid container spacing={4}>
                            {/* General Settings */}
                            {formik.values.menu_setgeneral === 'Y' && (
                                <Grid item xs={12} md={4}>
                                    <Typography sx={{ mb: 2, fontWeight: '600', color: '#754C27' }}>
                                        General Settings
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {Object.keys(formik.values)
                                            .filter(key => key.startsWith('menu_setgen_'))
                                            .map(key => (
                                                <FormControlLabel
                                                    key={key}
                                                    control={
                                                        <Checkbox
                                                            checked={formik.values[key] === 'Y'}
                                                            onChange={handleCheckboxChangeFormik(key)}
                                                        />
                                                    }
                                                    label={key.replace('menu_setgen_', '').replace('_', ' ')}
                                                />
                                            ))}
                                    </Box>
                                </Grid>
                            )}

                            {/* User Settings */}
                            {formik.values.menu_setuser === 'Y' && (
                                <Grid item xs={12} md={4}>
                                    <Typography sx={{ mb: 2, fontWeight: '600', color: '#754C27' }}>
                                        User Settings
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {Object.keys(formik.values)
                                            .filter(key => key.startsWith('menu_setuser_'))
                                            .map(key => (
                                                <FormControlLabel
                                                    key={key}
                                                    control={
                                                        <Checkbox
                                                            checked={formik.values[key] === 'Y'}
                                                            onChange={handleCheckboxChangeFormik(key)}
                                                        />
                                                    }
                                                    label={key.replace('menu_setuser_', '').replace('_', ' ')}
                                                />
                                            ))}
                                    </Box>
                                </Grid>
                            )}

                            {/* Warehouse Section */}
                            {formik.values.menu_setwarehouse === 'Y' && (
                                <Grid item xs={12} md={4}>
                                    <Typography sx={{ mb: 2, fontWeight: '600', color: '#754C27' }}>
                                        Warehouse
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setwh_purchase_order_to_supplier === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setwh_purchase_order_to_supplier')}
                                                />
                                            }
                                            label="Purchase Order to Supplier"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setwh_receipt_from_supplier === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setwh_receipt_from_supplier')}
                                                />
                                            }
                                            label="Receipt From Supplier"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setwh_receipt_from_kitchen === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setwh_receipt_from_kitchen')}
                                                />
                                            }
                                            label="Receipt From Kitchen"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setwh_dispatch_to_kitchen === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setwh_dispatch_to_kitchen')}
                                                />
                                            }
                                            label="Dispatch to Kitchen"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setwh_dispatch_to_branch === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setwh_dispatch_to_branch')}
                                                />
                                            }
                                            label="Dispatch to Branch"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setwh_report === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setwh_report')}
                                                />
                                            }
                                            label="Report"
                                        />
                                    </Box>
                                </Grid>
                            )}

                            {/* Kitchen Section */}
                            {formik.values.menu_setkitchen === 'Y' && (
                                <Grid item xs={12} md={4}>
                                    <Typography sx={{ mb: 2, fontWeight: '600', color: '#754C27' }}>
                                        Kitchen
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setkt_purchase_order_to_wh === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setkt_purchase_order_to_wh')}
                                                />
                                            }
                                            label="Purchase Order to Warehouse"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setkt_receipt_from_supplier === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setkt_receipt_from_supplier')}
                                                />
                                            }
                                            label="Receipt From Supplier"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setkt_receipt_from_wh === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setkt_receipt_from_wh')}
                                                />
                                            }
                                            label="Receipt From Warehouse"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setkt_goods_requisition === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setkt_goods_requisition')}
                                                />
                                            }
                                            label="Goods Requisition"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setkt_product_receipt === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setkt_product_receipt')}
                                                />
                                            }
                                            label="Product Receipt"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setkt_transfer_to_wh === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setkt_transfer_to_wh')}
                                                />
                                            }
                                            label="Transfer to Warehouse"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setkt_dispatch_to_branch === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setkt_dispatch_to_branch')}
                                                />
                                            }
                                            label="Dispatch to Branch"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setkt_stock_adjustment === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setkt_stock_adjustment')}
                                                />
                                            }
                                            label="Stock Adjustment"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setkt_report === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setkt_report')}
                                                />
                                            }
                                            label="Report"
                                        />
                                    </Box>

                                </Grid>
                            )}

                            {/* Branch Section */}
                            {formik.values.menu_setbranch === 'Y' && (
                                <Grid item xs={12} md={4}>
                                    <Typography sx={{ mb: 2, fontWeight: '600', color: '#754C27' }}>
                                        Restaurant
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setbr_minmum_stock === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setbr_minmum_stock')}
                                                />
                                            }
                                            label="Minimum Stock"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setbr_stock_adjustment === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setbr_stock_adjustment')}
                                                />
                                            }
                                            label="Stock Adjustment"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setbr_purchase_order_to_wh === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setbr_purchase_order_to_wh')}
                                                />
                                            }
                                            label="Purchase Order to Warehouse"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setbr_receipt_from_warehouse === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setbr_receipt_from_warehouse')}
                                                />
                                            }
                                            label="Receipt From Warehouse"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setbr_receipt_from_kitchen === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setbr_receipt_from_kitchen')}
                                                />
                                            }
                                            label="Receipt From Kitchen"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setbr_receipt_from_supplier === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setbr_receipt_from_supplier')}
                                                />
                                            }
                                            label="Receipt From Supplier"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setbr_goods_requisition === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setbr_goods_requisition')}
                                                />
                                            }
                                            label="Goods Requisition"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.menu_setbr_report === 'Y'}
                                                    onChange={handleCheckboxChangeFormik('menu_setbr_report')}
                                                />
                                            }
                                            label="Report"
                                        />
                                    </Box>



                                </Grid>
                            )}
                        </Grid>
                    </Box>

                    {/* Save Button */}
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={!formik.values.typeuser_code}
                            sx={{
                                background: 'linear-gradient(180deg, #AD7A2C 0%, #754C27 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(180deg, #8C5D1E 0%, #5D3A1F 100%)',
                                },
                                marginBottom: '48px'

                            }}
                        >
                            Save Permissions
                        </Button>
                    </Box>
                </form>
            </Drawer>
            <Drawer
                anchor="right"
                open={openEditDrawer}
                onClose={() => toggleDrawer('edit').close()}
                PaperProps={{
                    sx: {
                        width: '70%',
                        p: 3
                    }
                }}
            >
                <IconButton
                    onClick={() => toggleDrawer('edit').close()}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>

                <Typography variant="h6" sx={{ mb: 3 }}>
                    Edit User Permission
                </Typography>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveEdit();
                }}>
                    {/* User Type Display (Read-only) */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <Typography sx={{ mb: 1 }}>User Type</Typography>
                        <Typography sx={{
                            p: 2,
                            border: '1px solid rgba(0, 0, 0, 0.23)',
                            borderRadius: 1,
                            bgcolor: 'rgba(0, 0, 0, 0.09)'
                        }}>
                            {userTypes.find(type => type.typeuser_code === formik.values.typeuser_code)?.typeuser_name || ''}
                        </Typography>
                    </FormControl>

                    {/* Main Permissions */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ mb: 2, fontWeight: '600', color: '#754C27' }}>
                            Main Access Rights
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {[
                                'menu_setgeneral',
                                'menu_setuser',
                                'menu_setwarehouse',
                                'menu_setkitchen',
                                'menu_setbranch'
                            ].map((key) => (
                                <FormControlLabel
                                    key={key}
                                    control={
                                        <Checkbox
                                            checked={formik.values[key] === 'Y'}
                                            onChange={handleMainPermissionChange(key)}
                                        />
                                    }
                                    label={key.replace('menu_set', '').replace('_', ' ').toUpperCase()}
                                />
                            ))}
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Sub Permissions */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ mb: 2, fontWeight: '600', color: '#754C27' }}>
                            Detailed Permissions
                        </Typography>
                        <Grid container spacing={4}>
                            {/* General Settings */}
                            {formik.values.menu_setgeneral === 'Y' && (
                                <Grid item xs={12} md={4}>
                                    <Typography sx={{ mb: 2, fontWeight: '600', color: '#754C27' }}>
                                        General Settings
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {Object.keys(formik.values)
                                            .filter(key => key.startsWith('menu_setgen_'))
                                            .map(key => (
                                                <FormControlLabel
                                                    key={key}
                                                    control={
                                                        <Checkbox
                                                            checked={formik.values[key] === 'Y'}
                                                            onChange={handleCheckboxChangeFormik(key)}
                                                        />
                                                    }
                                                    label={key.replace('menu_setgen_', '').replace('_', ' ')}
                                                />
                                            ))}
                                    </Box>
                                </Grid>
                            )}

                            {/* User Settings */}
                            {formik.values.menu_setuser === 'Y' && (
                                <Grid item xs={12} md={4}>
                                    <Typography sx={{ mb: 2, fontWeight: '600', color: '#754C27' }}>
                                        User Settings
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {Object.keys(formik.values)
                                            .filter(key => key.startsWith('menu_setuser_'))
                                            .map(key => (
                                                <FormControlLabel
                                                    key={key}
                                                    control={
                                                        <Checkbox
                                                            checked={formik.values[key] === 'Y'}
                                                            onChange={handleCheckboxChangeFormik(key)}
                                                        />
                                                    }
                                                    label={key.replace('menu_setuser_', '').replace('_', ' ')}
                                                />
                                            ))}
                                    </Box>
                                </Grid>
                            )}

                            {/* Warehouse Section */}
                            {formik.values.menu_setwarehouse === 'Y' && (
                                <Grid item xs={12} md={4}>
                                    <Typography sx={{ mb: 2, fontWeight: '600', color: '#754C27' }}>
                                        Warehouse
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {Object.keys(formik.values)
                                            .filter(key => key.startsWith('menu_setwh_'))
                                            .map(key => (
                                                <FormControlLabel
                                                    key={key}
                                                    control={
                                                        <Checkbox
                                                            checked={formik.values[key] === 'Y'}
                                                            onChange={handleCheckboxChangeFormik(key)}
                                                        />
                                                    }
                                                    label={key.replace('menu_setwh_', '').replace('_', ' ')}
                                                />
                                            ))}
                                    </Box>
                                </Grid>
                            )}

                            {/* Kitchen Section */}
                            {formik.values.menu_setkitchen === 'Y' && (
                                <Grid item xs={12} md={4}>
                                    <Typography sx={{ mb: 2, fontWeight: '600', color: '#754C27' }}>
                                        Kitchen
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {Object.keys(formik.values)
                                            .filter(key => key.startsWith('menu_setkt_'))
                                            .map(key => (
                                                <FormControlLabel
                                                    key={key}
                                                    control={
                                                        <Checkbox
                                                            checked={formik.values[key] === 'Y'}
                                                            onChange={handleCheckboxChangeFormik(key)}
                                                        />
                                                    }
                                                    label={key.replace('menu_setkt_', '').replace('_', ' ')}
                                                />
                                            ))}
                                    </Box>
                                </Grid>
                            )}

                            {/* Branch Section */}
                            {formik.values.menu_setbranch === 'Y' && (
                                <Grid item xs={12} md={4}>
                                    <Typography sx={{ mb: 2, fontWeight: '600', color: '#754C27' }}>
                                        Restaurant
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {Object.keys(formik.values)
                                            .filter(key => key.startsWith('menu_setbr_'))
                                            .map(key => (
                                                <FormControlLabel
                                                    key={key}
                                                    control={
                                                        <Checkbox
                                                            checked={formik.values[key] === 'Y'}
                                                            onChange={handleCheckboxChangeFormik(key)}
                                                        />
                                                    }
                                                    label={key.replace('menu_setbr_', '').replace('_', ' ')}
                                                />
                                            ))}
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            onClick={() => toggleDrawer('edit').close()}
                            variant="outlined"
                            sx={{
                                color: '#754C27',
                                borderColor: '#754C27',
                                '&:hover': {
                                    borderColor: '#5D3A1F',
                                    backgroundColor: 'rgba(117, 76, 39, 0.04)'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(180deg, #AD7A2C 0%, #754C27 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(180deg, #8C5D1E 0%, #5D3A1F 100%)',
                                }
                            }}
                        >
                            Save Changes
                        </Button>
                    </Box>
                </form>
            </Drawer>
        </Box>
    );
}