import { Box, Button, InputAdornment, TextField, Typography, Drawer, IconButton } from '@mui/material';
import React, { useEffect, useState } from 'react';
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
import { useDispatch, useSelector } from "react-redux";
import { addTypeuser, countTypeuser, fetchAlltypeuser, deletetypeuser, updateTypeuser, searchtypeuser, lastTypeuserCode } from "../../api/usertypeApi"
import { errorHelper } from "../handle-input-error";
import { Alert, AlertTitle } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Swal from 'sweetalert2';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        background: '#754C27',
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


export default function UserType() {
    const [selected, setSelected] = useState([]);
    const dispatch = useDispatch();
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [typeuser, setTypeuser] = useState([]);
    const [page, setPage] = useState(0);
    const [count, setCount] = useState();
    const [searchTerm, setSearchTerm] = useState("");
    const [getLastTypeuserCode, setGetLastTypeuserCode] = useState([]);
    const [itemsPerPage] = useState(5);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        if (searchTerm) {
            dispatch(searchtypeuser({ typeuser_name: searchTerm }))
                .unwrap()
                .then((res) => {
                    setTypeuser(res.data);
                })
                .catch((err) => console.log(err.message));
        } else {
            refetchData();
        }
    }, [searchTerm, dispatch]);


    const handleChange = (event, value) => {
        setPage(value);
        const page = value - 1;
        const offset = page * itemsPerPage;
        const limit = itemsPerPage;

        dispatch(fetchAlltypeuser({ offset, limit }))
            .unwrap()
            .then((res) => {
                let resultData = res.data;
                for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                    resultData[indexArray].id = offset + indexArray + 1;
                }
                setTypeuser(resultData);
            })
            .catch((err) => err.message);
    };




    useEffect(() => {
        refetchData();
        let offset = 0;
        let limit = 5;
        let test = 10;
        dispatch(fetchAlltypeuser({ offset, limit }))
            .unwrap()
            .then((res) => {
                console.log(res.data);
                let resultData = res.data;
                for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                    resultData[indexArray].id = indexArray + 1;
                }
                setTypeuser(resultData);
                console.log(resultData);

            })
            .catch((err) => err.message);

        dispatch(lastTypeuserCode({ test }))
            .unwrap()
            .then((res) => {
                setGetLastTypeuserCode(res.data);
                console.log(res.data)
            })
            .catch((err) => err.message);

        dispatch(countTypeuser({ test }))
            .unwrap()
            .then((res) => {
                console.log(res.data);
                let resData = res.data;
                let countPaging = Math.floor(resData / 5);
                let modPaging = resData % 5;
                if (modPaging > 0) {
                    countPaging++
                }
                console.log(countPaging, modPaging);
                setCount(countPaging);
            })
            .catch((err) => err.message);
    }, [dispatch]);

    const handleCheckboxChange = (event, typeuser_code) => {
        if (event.target.checked) {
            setSelected([...selected, typeuser_code]);
        } else {
            setSelected(selected.filter((item) => item !== typeuser_code));
        }
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = typeuser.map((row) => row.typeuser_code);
            setSelected(newSelected);
        } else {
            setSelected([]);
        }
    };

    const handleDelete = (typeuser_code) => {
        Swal.fire({
            title: 'Are you sure you want to delete this user type?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(deletetypeuser({ typeuser_code }))
                    .unwrap()
                    .then((res) => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted successfully',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                        setTimeout(() => {
                            refetchData(page);
                            let offset = 0;
                            let limit = 5;
                            dispatch(fetchAlltypeuser({ offset, limit }))
                                .unwrap()
                                .then((res) => {
                                    let resultData = res.data;
                                    for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                                        resultData[indexArray].id = indexArray + 1;
                                    }
                                    setTypeuser(resultData)
                                });
                        }, 2000);
                    })
                    .catch((err) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error deleting user type',
                            text: 'Please try again later',
                            timer: 3000,
                            showConfirmButton: false,
                        });
                    });
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Deletion canceled',
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
        });
    };

    const handleDeleteSelected = () => {
        Swal.fire({
            title: 'Are you sure you want to delete the selected user types?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                Promise.all(selected.map(typeuser_code =>
                    dispatch(deletetypeuser({ typeuser_code })).unwrap()
                ))
                    .then(() => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted successfully',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                        setTimeout(() => {
                            setSelected([]);
                            refetchData(page);
                            let offset = 0;
                            let limit = 5;
                            dispatch(fetchAlltypeuser({ offset, limit }))
                                .unwrap()
                                .then((res) => {
                                    let resultData = res.data;
                                    for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                                        resultData[indexArray].id = indexArray + 1;
                                    }
                                    setTypeuser(resultData)
                                });
                        }, 2000);
                    })
                    .catch((err) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error deleting user types',
                            text: 'Please try again later',
                            timer: 3000,
                            showConfirmButton: false,
                        });
                    });
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Deletion canceled',
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
        });
    };


    const [openDrawer, setOpenDrawer] = useState(false);
    const [openEditDrawer, setOpenEditDrawer] = useState(false);

    const toggleDrawer = (openDrawer) => () => {
        setOpenDrawer(openDrawer);
        handleGetLastCode();
    };

    const toggleEditDrawer = (openEditDrawer) => () => {
        setOpenEditDrawer(openEditDrawer);
    };

    const [editUser, setEditUser] = useState(null);

    const handleEdit = (row) => {
        setEditUser(row);
        formik.setValues({
            typeuser_code: row.typeuser_code,
            typeuser_name: row.typeuser_name,
        });
        toggleEditDrawer(true)();
    };

    const handleSave = () => {
        dispatch(updateTypeuser(formik.values))
            .unwrap()
            .then((res) => {
                setAlert({ open: true, message: 'อัปเดตข้อมูลสำเร็จ', severity: 'success' });
                refetchData();
                toggleEditDrawer(false)();
                setTimeout(() => {
                    setAlert((prev) => ({ ...prev, open: false }));
                }, 3000);
            })
            .catch((err) => {
                setAlert({ open: true, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล', severity: 'error' });
                setTimeout(() => {
                    setAlert((prev) => ({ ...prev, open: false }));
                }, 3000);
            });
    };

    const handleGetLastCode = () => {
        let test = "";
        dispatch(lastTypeuserCode({ test }))
            .unwrap()
            .then((res) => {
                let lastTypeCode = "01";

                if (res.data && res.data.typeuser_code) {
                    lastTypeCode = "" + (Number(res.data.typeuser_code) + 1);

                    if (lastTypeCode.length === 1) {
                        lastTypeCode = "0" + lastTypeCode;
                    }
                }

                setGetLastTypeuserCode(lastTypeCode);
                formik.setValues({
                    typeuser_code: lastTypeCode,
                });
            })
            .catch((err) => {
                console.error("Error fetching last user type code:", err.message);
            });
    };

    const formik = useFormik({
        initialValues: {
            typeuser_code: "",
            typeuser_name: "",
        },
        validate: (values) => {
            let errors = {};
            if (!values.typeuser_name) {
                errors.typeuser_name = 'User type name cannot be empty';
            }
            return errors;
        },
        onSubmit: (values) => {
            dispatch(addTypeuser(values))
                .unwrap()
                .then((res) => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'เพิ่มข้อมูลสำเร็จ',
                        timer: 1000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });

                    // Calculate which page the new item will be on
                    dispatch(countTypeuser({ test: "" }))
                        .unwrap()
                        .then((countRes) => {
                            const totalItems = countRes.data;
                            const targetPage = Math.ceil(totalItems / itemsPerPage);

                            // Reset form and refresh data with the new page
                            formik.resetForm();
                            refetchData(targetPage);
                            handleGetLastCode();
                            setOpenDrawer(false);
                        });
                })
                .catch((err) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล',
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                });
        },
    });

    const handleCancelCreate = () => {
        formik.resetForm();
        setOpenDrawer(false);
    };

    const handleCancelEdit = () => {
        formik.resetForm();
        setOpenEditDrawer(false);
    };

    const refetchData = (targetPage = 1) => {
        const offset = (targetPage - 1) * itemsPerPage;
        const limit = itemsPerPage;

        dispatch(fetchAlltypeuser({ offset, limit }))
            .unwrap()
            .then((res) => {
                let resultData = res.data;
                for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                    resultData[indexArray].id = offset + indexArray + 1;
                }
                setTypeuser(resultData);

                // หลังจากได้ข้อมูลแล้ว ดึงจำนวนรายการทั้งหมด
                dispatch(countTypeuser({ test: "" }))
                    .unwrap()
                    .then((countRes) => {
                        const totalItems = countRes.data;
                        const totalPages = Math.ceil(totalItems / itemsPerPage);
                        setCount(totalPages);
                        setPage(targetPage);
                    })
                    .catch((err) => console.log(err.message));
            })
            .catch((err) => console.log(err.message));
    };

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
                    onClick={toggleDrawer(true)}
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
                        User Type Search
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
                <Box sx={{ width: '60%', mt: '24px' }}>
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
                <TableContainer component={Paper} sx={{ width: '60%', mt: '24px', }}>
                    <Table sx={{}} aria-label="customized table">
                        <TableHead sx={{}}>
                            <TableRow sx={{}}>
                                <StyledTableCell sx={{ width: '1%', textAlign: 'center' }}>
                                    <Checkbox
                                        sx={{ color: '#FFF' }}
                                        indeterminate={selected.length > 0 && selected.length < typeuser.length}
                                        checked={typeuser.length > 0 && selected.length === typeuser.length}
                                        onChange={handleSelectAllClick}
                                    />
                                </StyledTableCell>
                                <StyledTableCell width='1%' >No.</StyledTableCell>
                                <StyledTableCell align="center">User Type Code</StyledTableCell>
                                <StyledTableCell align="center">User Type</StyledTableCell>
                                <StyledTableCell width='1%' align="center"></StyledTableCell>
                                <StyledTableCell width='1%' align="center"></StyledTableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {typeuser.map((row) => (
                                <StyledTableRow key={row.typeuser_code}>
                                    <StyledTableCell padding="checkbox" align="center">
                                        <Checkbox
                                            checked={selected.includes(row.typeuser_code)}
                                            onChange={(event) => handleCheckboxChange(event, row.typeuser_code)}
                                        />

                                    </StyledTableCell>
                                    <StyledTableCell component="th" scope="row">
                                        {row.id}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">{row.typeuser_code}</StyledTableCell>
                                    <StyledTableCell align="center">{row.typeuser_name}</StyledTableCell>
                                    <StyledTableCell align="center">
                                        <IconButton
                                            color="primary"
                                            size="md"
                                            onClick={() => handleEdit(row)} // เรียกใช้ฟังก์ชัน handleEdit
                                            sx={{ border: '1px solid #AD7A2C', borderRadius: '7px' }}
                                        >
                                            <EditIcon sx={{ color: '#AD7A2C' }} />
                                        </IconButton>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <IconButton
                                            color="danger"
                                            size="md"
                                            onClick={() => handleDelete(row.typeuser_code)} // Use a function to handle delete
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
                <Stack spacing={2}>
                    <Pagination count={count} shape="rounded" onChange={handleChange} page={page} />
                </Stack>
            </Box>
            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={toggleDrawer(false)}
                ModalProps={{
                    BackdropProps: {
                        style: {
                            backgroundColor: 'transparent',
                        },
                    },
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
                <Box
                    sx={{
                        width: '100%',
                        mt: '80px',
                        flexDirection: 'column'
                    }}
                >
                    <Box
                        sx={{
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
                        }}
                    >
                        <Typography sx={{ fontWeight: '600', fontSize: '14px' }} >
                            User Type
                        </Typography>
                    </Box>
                    <Box
                        sx={{
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

                        <Typography sx={{ display: 'flex', flexDirection: 'row' }}>
                            User Type ID :
                            <Box component="span" sx={{ color: '#754C27', ml: '12px' }}>
                                #011
                            </Box>
                        </Typography>

                        <Box sx={{ width: '80%', mt: '24px' }}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                User Id
                            </Typography>
                            <TextField
                                size="small"
                                // placeholder={getLasttypeuserCode}
                                disabled

                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("typeuser_code")}
                                {...errorHelper(formik, "typeuser_code")}
                                value={getLastTypeuserCode}
                            />
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                User Type
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="User Type"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("typeuser_name")}
                                {...errorHelper(formik, "typeuser_name")}
                            />
                        </Box>
                        <Box sx={{ mt: '24px' }} >
                            <Button variant='contained'
                                onClick={handleCancelCreate}
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
                            <Button variant='contained'
                                onClick={formik.handleSubmit} // ใช้ onClick แทน
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
                    </Box>
                </Box>
            </Drawer>
            <Drawer
                anchor="right"
                open={openEditDrawer}
                onClose={toggleEditDrawer(false)}
                ModalProps={{
                    BackdropProps: {
                        style: {
                            backgroundColor: 'transparent',
                        },
                    },
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
                <Box
                    sx={{
                        width: '100%',
                        mt: '80px',
                        flexDirection: 'column'
                    }}
                >
                    <Box
                        sx={{
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
                        }}
                    >
                        <Typography sx={{ fontWeight: '600', fontSize: '14px' }} >
                            User Type
                        </Typography>
                    </Box>
                    <Box
                        sx={{
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
                                User Id
                            </Typography>
                            <TextField
                                disabled
                                size="small"
                                placeholder="User Id"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("typeuser_code")}
                                {...errorHelper(formik, "typeuser_code")}
                            />

                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                User Type
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="User Name"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("typeuser_name")}
                                {...errorHelper(formik, "typeuser_name")}
                            />
                        </Box>
                        <Box sx={{ mt: '24px' }} >
                            <Button variant='contained'
                            onClick={handleCancelEdit}
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
                                onClick={handleSave}
                                sx={{
                                    width: '100px',
                                    backgroundColor: '#AD7A2C',
                                    color: '#FFFFFF',
                                    '&:hover': {
                                        backgroundColor: '#8C5D1E',
                                    },
                                    ml: '24px'
                                }}
                            >
                                Save
                            </Button>

                        </Box>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
}
