import { Box, Button, InputAdornment, TextField, Typography, Drawer, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
import Checkbox from '@mui/material/Checkbox';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import { fetchAlltypeuser } from '../../api/usertypeApi';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Swal from 'sweetalert2';
import {
    register,
    updateUser,
    deleteUser,
    showUser,
    searchUser,
    getLastUserCode,
    countUser
} from '../../api/loginApi';
import { branchAll } from '../../api/branchApi';
import { kitchenAll } from '../../api/kitchenApi';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

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

export default function ManageUser() {
    const [selected, setSelected] = useState([]);
    const dispatch = useDispatch();
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [itemsPerPage] = useState(5);
    const [editMode, setEditMode] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [userTypes, setUserTypes] = useState([]);
    const [branches, setBranches] = useState([]);
    const [kitchens, setKitchens] = useState([]);


    const loadUserTypes = async () => {
        try {
            const res = await dispatch(fetchAlltypeuser({ offset: 0, limit: 100 })).unwrap();
            if (res.result && Array.isArray(res.data)) {
                setUserTypes(res.data);
            }
        } catch (error) {
            showAlert('Error loading user types', 'error');
        }
    };

    const loadBranchesAndKitchens = async () => {
        try {
            const [branchRes, kitchenRes] = await Promise.all([
                dispatch(branchAll({ offset: 0, limit: 100 })).unwrap(),
                dispatch(kitchenAll({ offset: 0, limit: 100 })).unwrap()
            ]);

            if (branchRes.result && Array.isArray(branchRes.data)) {
                setBranches(branchRes.data);
            }
            if (kitchenRes.result && Array.isArray(kitchenRes.data)) {
                setKitchens(kitchenRes.data);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            showAlert('Error loading data', 'error');
        }
    };

    useEffect(() => {
        loadUserTypes();
        loadUserTypes();
        loadBranchesAndKitchens();
    }, []);

    const validate = values => {
        const errors = {};

        if (!values.username) {
            errors.username = 'Username is required';
        }

        if (!values.password && !editMode) {
            errors.password = 'Password is required';
        } else if (values.password && values.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (!values.email) {
            errors.email = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
            errors.email = 'Invalid email address';
        }

        if (!values.typeuser_code) {
            errors.typeuser_code = 'User type is required';
        }

        return errors;
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);

    async function fetchUsers() {
        try {
            const offset = (page - 1) * itemsPerPage;
            const res = await dispatch(showUser({
                offset: offset,
                limit: itemsPerPage
            })).unwrap();

            if (res.data && Array.isArray(res.data)) {
                const paginatedData = res.data.map((user, index) => ({
                    ...user,
                    id: offset + index + 1
                }));
                setUsers(paginatedData);

                // เพิ่มการเรียกใช้ countUser เพื่อดึงจำนวน records ทั้งหมด
                const countRes = await dispatch(countUser()).unwrap();
                if (countRes.result) {
                    const totalPages = Math.ceil(countRes.data / itemsPerPage);
                    setCount(totalPages);
                }
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            showAlert('Error fetching users', 'error');
        }
    }

    function showAlert(message, type = 'success') {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
    }

    const handleSearchChange = async (e) => {
        setSearchTerm(e.target.value);
        try {
            if (e.target.value) {
                const res = await dispatch(searchUser({ username: e.target.value })).unwrap();
                setUsers(res.data);
            } else {
                fetchUsers();
            }
        } catch (error) {
            showAlert('Search failed', 'error');
        }
    };

    const handleCheckboxChange = (event, user_code) => {
        if (event.target.checked) {
            setSelected([...selected, user_code]);
        } else {
            setSelected(selected.filter((item) => item !== user_code));
        }
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = users.map((user) => user.user_code);
            setSelected(newSelected);
        } else {
            setSelected([]);
        }
    };

    const handleDelete = (user_code) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await dispatch(deleteUser({ user_code })).unwrap();
                    Swal.fire('Deleted!', 'User has been deleted.', 'success');
                    fetchUsers();
                } catch (error) {
                    Swal.fire('Error!', 'Failed to delete user.', 'error');
                }
            }
        });
    };

    const handleEdit = (user) => {
        setEditMode(true);
        formik.setValues({
            user_code: user.user_code,
            username: user.username,
            email: user.email,
            line_uid: user.line_uid || '',
            typeuser_code: user.typeuser_code,
            kitchen_access_type: user.kitchen_code === 'All' ? 'all' :
                user.kitchen_code === 'No' ? 'no_permission' : 'select',
            branch_access_type: user.branch_code === 'All' ? 'all' :
                user.branch_code === 'No' ? 'no_permission' : 'select',
            branch_code: user.branch_code !== 'All' && user.branch_code !== 'No' ? user.branch_code : '',
            kitchen_code: user.kitchen_code !== 'All' && user.kitchen_code !== 'No' ? user.kitchen_code : '',
            password: ''
        });
        setOpenDrawer(true);
    };

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
        setEditMode(false);
        formik.resetForm();
    };

    const handleDeleteSelected = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${selected.length} users`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete them!',
            cancelButtonText: 'No, cancel!',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Promise.all(selected.map(user_code =>
                        dispatch(deleteUser({ user_code })).unwrap()
                    ));
                    Swal.fire('Deleted!', 'Users have been deleted.', 'success');
                    setSelected([]);
                    fetchUsers();
                } catch (error) {
                    Swal.fire('Error!', 'Failed to delete users.', 'error');
                }
            }
        });
    };

    const handleGenerateUserCode = async () => {
        try {
            const response = await dispatch(getLastUserCode()).unwrap();
            console.log('Last user code response:', response);

            // ถ้าไม่มีข้อมูล หรือ response ไม่ถูกต้อง
            if (!response || !response.result || !response.data) {
                console.log('No last user code found, using default');
                return '001';
            }

            if (response.data.user_code) {
                const currentNumber = parseInt(response.data.user_code, 10);
                const nextNumber = currentNumber + 1;
                return nextNumber.toString().padStart(3, '0');
            }

            return '001'; // ค่าเริ่มต้น
        } catch (error) {
            console.error('Error generating user code:', error);
            // ถ้าเกิด error ให้ใช้ค่าเริ่มต้น
            return '001';
        }
    };

    const handleCreate = async (values) => {
        try {
            const userCode = await handleGenerateUserCode();

            const userData = {
                user_code: userCode,
                username: values.username,
                password: values.password,
                email: values.email,
                typeuser_code: values.typeuser_code,
                line_uid: values.line_uid || '',
                branch_code: values.branch_code || null,
                kitchen_code: values.kitchen_code || null
            };

            const response = await dispatch(register(userData)).unwrap();

            if (response.result) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'เพิ่มข้อมูลสำเร็จ',
                    timer: 1500,
                    showConfirmButton: false,
                });

                handleCloseDrawer();
                await fetchUsers();
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
    };

    const handleUpdate = async (values) => {
        try {
            const updateData = {
                user_code: values.user_code,
                username: values.username,
                email: values.email,
                typeuser_code: values.typeuser_code,
                line_uid: values.line_uid,
                // เพิ่มการส่งค่า branch_code และ kitchen_code
                branch_code: values.branch_access_type === 'select' ? values.branch_code :
                    values.branch_access_type === 'all' ? 'All' : 'No',
                kitchen_code: values.kitchen_access_type === 'select' ? values.kitchen_code :
                    values.kitchen_access_type === 'all' ? 'All' : 'No'
            };

            // เพิ่ม password เฉพาะเมื่อมีการกรอกค่าใหม่
            if (values.password) {
                updateData.password = values.password;
            }

            await dispatch(updateUser(updateData)).unwrap();

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'แก้ไขข้อมูลสำเร็จ',
                timer: 1500,
                showConfirmButton: false,
            });

            handleCloseDrawer();
            fetchUsers();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล',
                timer: 1500,
                showConfirmButton: false,
            });
        }
    };

    const formik = useFormik({
        initialValues: {
            user_code: '',
            username: '',
            password: '',
            email: '',
            line_uid: '',
            typeuser_code: '',
            kitchen_access_type: 'no_permission', // Added
            branch_access_type: 'no_permission',  // Added
            branch_code: '',
            kitchen_code: ''
        },
        validate,
        onSubmit: async (values) => {
            const formattedValues = {
                ...values,
                kitchen_code: values.kitchen_access_type === 'select' ? values.kitchen_code :
                    values.kitchen_access_type === 'all' ? 'All' : 'No',
                branch_code: values.branch_access_type === 'select' ? values.branch_code :
                    values.branch_access_type === 'all' ? 'All' : 'No'
            };

            if (editMode) {
                await handleUpdate(formattedValues);
            } else {
                await handleCreate(formattedValues);
            }
        }
    });



    return (
        <>
            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Button
                    onClick={() => setOpenDrawer(true)}
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

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mt: '48px',
                        width: '60%'
                    }}
                >
                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mr: '24px' }}>
                        User Search
                    </Typography>
                    <TextField
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search"
                        sx={{
                            '& .MuiInputBase-root': {
                                height: '38px',
                                width: '100%'
                            },
                            '& .MuiOutlinedInput-input': {
                                padding: '8.5px 14px',
                            },
                            width: '40%'
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#5A607F' }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {selected.length > 0 && (
                    <Box sx={{ width: '90%', mt: '24px' }}>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleDeleteSelected}
                            sx={{ mt: 2 }}
                        >
                            Delete Selected ({selected.length})
                        </Button>
                    </Box>
                )}

                <TableContainer component={Paper} sx={{ width: '100%', mt: '24px' }}>
                    <Table sx={{}} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell padding="checkbox">
                                    <Checkbox
                                        sx={{ color: '#FFF' }}
                                        indeterminate={selected.length > 0 && selected.length < users.length}
                                        checked={users.length > 0 && selected.length === users.length}
                                        onChange={handleSelectAllClick}
                                    />
                                </StyledTableCell>
                                <StyledTableCell>No.</StyledTableCell>
                                <StyledTableCell>User ID</StyledTableCell>
                                <StyledTableCell>Username</StyledTableCell>
                                <StyledTableCell>User Type</StyledTableCell>
                                <StyledTableCell>Email</StyledTableCell>
                                <StyledTableCell>Line ID</StyledTableCell>
                                <StyledTableCell>Restaurant</StyledTableCell>
                                <StyledTableCell>Kitchen</StyledTableCell>
                                <StyledTableCell></StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <StyledTableRow key={user.user_code}>
                                    <StyledTableCell padding="checkbox">
                                        <Checkbox
                                            checked={selected.includes(user.user_code)}
                                            onChange={(event) => handleCheckboxChange(event, user.user_code)}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>{user.id}</StyledTableCell>
                                    <StyledTableCell>{user.user_code}</StyledTableCell>
                                    <StyledTableCell>{user.username}</StyledTableCell>
                                    <StyledTableCell>
                                        {user.tbl_typeuser?.typeuser_name || user.Tbl_typeuser?.typeuser_name || '-'}
                                    </StyledTableCell>
                                    <StyledTableCell>{user.email}</StyledTableCell>
                                    <StyledTableCell>{user.line_uid}</StyledTableCell>
                                    <StyledTableCell>
                                        {user.branch_code === 'All' ? 'All' :
                                            user.branch_code === 'No' ? 'No Permission' :
                                                branches.find(b => b.branch_code === user.branch_code)?.branch_name || '-'}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {user.kitchen_code === 'All' ? 'All' :
                                            user.kitchen_code === 'No' ? 'No Permission' :
                                                kitchens.find(k => k.kitchen_code === user.kitchen_code)?.kitchen_name || '-'}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <IconButton
                                            onClick={() => handleEdit(user)}
                                            sx={{ mr: 1, border: '1px solid #AD7A2C', borderRadius: '7px' }}
                                        >
                                            <EditIcon sx={{ color: '#AD7A2C' }} />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(user.user_code)}
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

                <Stack spacing={2} sx={{ mt: '8px' }}>
                    <Pagination
                        count={count}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        shape="rounded"
                        showFirstButton
                        showLastButton
                    />
                </Stack>

                <Drawer
                    anchor="right"
                    open={openDrawer && !editMode}
                    onClose={handleCloseDrawer}
                    ModalProps={{
                        BackdropProps: {
                            style: { backgroundColor: 'transparent' }
                        }
                    }}
                    PaperProps={{
                        sx: {
                            boxShadow: 'none',
                            width: '25%',
                            borderRadius: '20px',
                            border: '1px solid #E4E4E4',
                            bgcolor: '#FAFAFA'
                        },
                    }}
                >
                    <Box sx={{ width: '100%', mt: '80px', flexDirection: 'column' }}>
                        <Box sx={{
                            position: 'absolute',
                            top: '48px',
                            left: '0',
                            width: '129px',
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
                                Create User
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
                            <Box sx={{ width: '80%', mt: '24px' }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Username
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="username"
                                    placeholder="Username"
                                    {...formik.getFieldProps('username')}
                                    error={formik.touched.username && Boolean(formik.errors.username)}
                                    helperText={formik.touched.username && formik.errors.username}
                                    sx={{ mb: 2 }}
                                />

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Password
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    {...formik.getFieldProps('password')}
                                    error={formik.touched.password && Boolean(formik.errors.password)}
                                    helperText={formik.touched.password && formik.errors.password}
                                    sx={{ mb: 2 }}
                                />

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Email
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="email"
                                    placeholder="Email"
                                    {...formik.getFieldProps('email')}
                                    error={formik.touched.email && Boolean(formik.errors.email)}
                                    helperText={formik.touched.email && formik.errors.email}
                                    sx={{ mb: 2 }}
                                />

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    User Type
                                </Typography>
                                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                    <Select
                                        name="typeuser_code"
                                        value={formik.values.typeuser_code}
                                        onChange={formik.handleChange}
                                        error={formik.touched.typeuser_code && Boolean(formik.errors.typeuser_code)}
                                    >
                                        {userTypes.map((type) => (
                                            <MenuItem key={type.typeuser_code} value={type.typeuser_code}>
                                                {type.typeuser_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {formik.touched.typeuser_code && formik.errors.typeuser_code && (
                                        <Typography color="error" variant="caption">
                                            {formik.errors.typeuser_code}
                                        </Typography>
                                    )}
                                </FormControl>

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: 2 }}>
                                    Kitchen Access
                                </Typography>
                                <FormControl component="fieldset">
                                    <RadioGroup
                                        name="kitchen_access_type"
                                        value={formik.values.kitchen_access_type}
                                        onChange={formik.handleChange}
                                    >
                                        <FormControlLabel
                                            value="no_permission"
                                            control={<Radio />}
                                            label="No Permission"
                                        />
                                        <FormControlLabel
                                            value="select"
                                            control={<Radio />}
                                            label="Select Kitchen"
                                        />
                                        <FormControlLabel
                                            value="all"
                                            control={<Radio />}
                                            label="All Kitchens"
                                        />
                                    </RadioGroup>
                                </FormControl>

                                <FormControl
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 2, mt: 1 }}
                                    disabled={formik.values.kitchen_access_type !== 'select'}
                                >
                                    <Select
                                        name="kitchen_code"
                                        value={formik.values.kitchen_code}
                                        onChange={formik.handleChange}
                                    >
                                        <MenuItem value="">Select a Kitchen</MenuItem>
                                        {kitchens.map((kitchen) => (
                                            <MenuItem key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                                                {kitchen.kitchen_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: 2 }}>
                                    Restaurant Access
                                </Typography>
                                <FormControl component="fieldset">
                                    <RadioGroup
                                        name="branch_access_type"
                                        value={formik.values.branch_access_type}
                                        onChange={formik.handleChange}
                                    >
                                        <FormControlLabel
                                            value="no_permission"
                                            control={<Radio />}
                                            label="No Permission"
                                        />
                                        <FormControlLabel
                                            value="select"
                                            control={<Radio />}
                                            label="Select Restaurant"
                                        />
                                        <FormControlLabel
                                            value="all"
                                            control={<Radio />}
                                            label="All Branches"
                                        />
                                    </RadioGroup>
                                </FormControl>

                                <FormControl
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 2, mt: 1 }}
                                    disabled={formik.values.branch_access_type !== 'select'}
                                >
                                    <Select
                                        name="branch_code"
                                        value={formik.values.branch_code}
                                        onChange={formik.handleChange}
                                    >
                                        <MenuItem value="">Select a Restaurant</MenuItem>
                                        {branches.map((branch) => (
                                            <MenuItem key={branch.branch_code} value={branch.branch_code}>
                                                {branch.branch_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Line ID
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="line_uid"
                                    placeholder="Line ID"
                                    {...formik.getFieldProps('line_uid')}
                                    sx={{ mb: 2 }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleCloseDrawer}
                                    sx={{
                                        width: '100px',
                                        bgcolor: '#F62626',
                                        '&:hover': { bgcolor: '#D32F2F' }
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={formik.handleSubmit}
                                    sx={{
                                        width: '100px',
                                        bgcolor: '#754C27',
                                        '&:hover': { bgcolor: '#5A3D1E' }
                                    }}
                                >
                                    Save
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Drawer>

                {/* Edit Drawer */}
                <Drawer
                    anchor="right"
                    open={openDrawer && editMode}
                    onClose={handleCloseDrawer}
                    ModalProps={{
                        BackdropProps: {
                            style: { backgroundColor: 'transparent' }
                        }
                    }}
                    PaperProps={{
                        sx: {
                            boxShadow: 'none',
                            width: '25%',
                            borderRadius: '20px',
                            border: '1px solid #E4E4E4',
                            bgcolor: '#FAFAFA'
                        },
                    }}
                >
                    <Box sx={{ width: '100%', mt: '80px', flexDirection: 'column' }}>
                        <Box sx={{
                            position: 'absolute',
                            top: '48px',
                            left: '0',
                            width: '129px',
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
                                Edit User
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
                            <Box sx={{ width: '80%', mt: '24px' }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Username
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="username"
                                    placeholder="Username"
                                    {...formik.getFieldProps('username')}
                                    error={formik.touched.username && Boolean(formik.errors.username)}
                                    helperText={formik.touched.username && formik.errors.username}
                                    sx={{ mb: 2 }}
                                />

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Email
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="email"
                                    placeholder="Email"
                                    {...formik.getFieldProps('email')}
                                    error={formik.touched.email && Boolean(formik.errors.email)}
                                    helperText={formik.touched.email && formik.errors.email}
                                    sx={{ mb: 2 }}
                                />

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    User Type
                                </Typography>
                                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                    <Select
                                        name="typeuser_code"
                                        value={formik.values.typeuser_code}
                                        onChange={formik.handleChange}
                                        error={formik.touched.typeuser_code && Boolean(formik.errors.typeuser_code)}
                                    >
                                        {userTypes.map((type) => (
                                            <MenuItem key={type.typeuser_code} value={type.typeuser_code}>
                                                {type.typeuser_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {formik.touched.typeuser_code && formik.errors.typeuser_code && (
                                        <Typography color="error" variant="caption">
                                            {formik.errors.typeuser_code}
                                        </Typography>
                                    )}
                                </FormControl>

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: 2 }}>
                                    Kitchen Access
                                </Typography>
                                <FormControl component="fieldset">
                                    <RadioGroup
                                        name="kitchen_access_type"
                                        value={formik.values.kitchen_access_type}
                                        onChange={formik.handleChange}
                                    >
                                        <FormControlLabel
                                            value="no_permission"
                                            control={<Radio />}
                                            label="No Permission"
                                        />
                                        <FormControlLabel
                                            value="select"
                                            control={<Radio />}
                                            label="Select Kitchen"
                                        />
                                        <FormControlLabel
                                            value="all"
                                            control={<Radio />}
                                            label="All Kitchens"
                                        />
                                    </RadioGroup>
                                </FormControl>

                                <FormControl
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 2, mt: 1 }}
                                    disabled={formik.values.kitchen_access_type !== 'select'}
                                >
                                    <Select
                                        name="kitchen_code"
                                        value={formik.values.kitchen_code}
                                        onChange={formik.handleChange}
                                    >
                                        <MenuItem value="">Select a Kitchen</MenuItem>
                                        {kitchens.map((kitchen) => (
                                            <MenuItem key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                                                {kitchen.kitchen_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: 2 }}>
                                    Restaurant Access
                                </Typography>
                                <FormControl component="fieldset">
                                    <RadioGroup
                                        name="branch_access_type"
                                        value={formik.values.branch_access_type}
                                        onChange={formik.handleChange}
                                    >
                                        <FormControlLabel
                                            value="no_permission"
                                            control={<Radio />}
                                            label="No Permission"
                                        />
                                        <FormControlLabel
                                            value="select"
                                            control={<Radio />}
                                            label="Select Restaurant"
                                        />
                                        <FormControlLabel
                                            value="all"
                                            control={<Radio />}
                                            label="All Branches"
                                        />
                                    </RadioGroup>
                                </FormControl>

                                <FormControl
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 2, mt: 1 }}
                                    disabled={formik.values.branch_access_type !== 'select'}
                                >
                                    <Select
                                        name="branch_code"
                                        value={formik.values.branch_code}
                                        onChange={formik.handleChange}
                                    >
                                        <MenuItem value="">Select a Restaurant</MenuItem>
                                        {branches.map((branch) => (
                                            <MenuItem key={branch.branch_code} value={branch.branch_code}>
                                                {branch.branch_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Line ID
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="line_uid"
                                    placeholder="Line ID"
                                    {...formik.getFieldProps('line_uid')}
                                    sx={{ mb: 2 }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleCloseDrawer}
                                    sx={{
                                        width: '100px',
                                        bgcolor: '#F62626',
                                        '&:hover': { bgcolor: '#D32F2F' }
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={formik.handleSubmit}
                                    sx={{
                                        width: '100px',
                                        bgcolor: '#754C27',
                                        '&:hover': { bgcolor: '#5A3D1E' }
                                    }}
                                >
                                    Update
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Drawer>
            </Box>
        </>
    );
}