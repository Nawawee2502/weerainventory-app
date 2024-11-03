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
import { addUnit, deleteUnit, updateUnit, unitAll, countUnit, searchUnit, lastUnitCode } from '../../api/productunitApi'
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { errorHelper } from "../handle-input-error";
import { Alert, AlertTitle } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
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


export default function SetCountingUnit() {
    const [selected, setSelected] = useState([]);
    const dispatch = useDispatch();
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [unit, setUnit] = useState([]);
    const [page, setPage] = useState(0);
    const [count, setCount] = useState();
    const [searchTerm, setSearchTerm] = useState("");
    const [getLastUnitCode, setLastUnitCode] = useState([]);
    const [itemsPerPage] = useState(5);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        if (searchTerm) {
            dispatch(searchUnit({ unit_name: searchTerm }))
                .unwrap()
                .then((res) => {
                    setUnit(res.data);
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

        dispatch(unitAll({ offset, limit }))
            .unwrap()
            .then((res) => {
                let resultData = res.data;
                for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                    resultData[indexArray].id = offset + indexArray + 1;
                }
                setUnit(resultData);
            })
            .catch((err) => err.message);
    };

    const refetchData = (targetPage = 1) => {
        const offset = (targetPage - 1) * itemsPerPage;
        const limit = itemsPerPage;

        dispatch(unitAll({ offset, limit }))
            .unwrap()
            .then((res) => {
                let resultData = res.data;
                for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                    resultData[indexArray].id = offset + indexArray + 1;
                }
                setUnit(resultData);

                // หลังจากได้ข้อมูลแล้ว ดึงจำนวนรายการทั้งหมด
                dispatch(countUnit({ test: "" }))
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

    useEffect(() => {
        refetchData(1);
        let offset = 0;
        let limit = 5;
        let test = 10;
        dispatch(unitAll({ offset, limit }))
            .unwrap()
            .then((res) => {
                console.log(res.data);
                let resultData = res.data;
                for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                    resultData[indexArray].id = indexArray + 1;
                }
                setUnit(resultData);
                console.log(resultData);

            })
            .catch((err) => err.message);

        dispatch(lastUnitCode({ test }))
            .unwrap()
            .then((res) => {
                setLastUnitCode(res.data);
                console.log(res.data)
            })
            .catch((err) => err.message);

        dispatch(countUnit({ test }))
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

    const handleCheckboxChange = (event, unit_code) => {
        if (event.target.checked) {
            setSelected([...selected, unit_code]);
        } else {
            setSelected(selected.filter((item) => item !== unit_code));
        }
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = unit.map((row) => row.unit_code);
            setSelected(newSelected);
        } else {
            setSelected([]);
        }
    };

    const handleDelete = (unit_code) => {
        Swal.fire({
            title: 'Are you sure you want to delete this unit?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(deleteUnit({ unit_code }))
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
                            dispatch(unitAll({ offset, limit }))
                                .unwrap()
                                .then((res) => {
                                    console.log(res.data);
                                    let resultData = res.data;
                                    for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                                        resultData[indexArray].id = indexArray + 1;
                                    }
                                    setUnit(resultData)
                                });
                        }, 2000);
                    })
                    .catch((err) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error deleting unit',
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
            title: 'Are you sure you want to delete the selected units?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                Promise.all(selected.map(unit_code =>
                    dispatch(deleteUnit({ unit_code })).unwrap()
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
                            dispatch(unitAll({ offset, limit }))
                                .unwrap()
                                .then((res) => {
                                    console.log(res.data);
                                    let resultData = res.data;
                                    for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                                        resultData[indexArray].id = indexArray + 1;
                                    }
                                    setUnit(resultData)
                                });
                        }, 2000);
                    })
                    .catch((err) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error deleting units',
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

    const [editUnit, setEditUnit] = useState(null);

    const handleEdit = (row) => {
        setEditUnit(row);
        formik.setValues({
            unit_code: row.unit_code,
            unit_name: row.unit_name,
        });
        toggleEditDrawer(true)();
    };

    const handleSave = () => {
        dispatch(updateUnit(formik.values))
            .unwrap()
            .then((res) => {
                setAlert({ open: true, message: 'Updated success', severity: 'success' });
                refetchData(page); // ใช้หน้าปัจจุบัน
                toggleEditDrawer(false)();
                setTimeout(() => {
                    setAlert((prev) => ({ ...prev, open: false }));
                }, 3000);
            })
            .catch((err) => {
                setAlert({ open: true, message: 'Updated Error', severity: 'error' });
                setTimeout(() => {
                    setAlert((prev) => ({ ...prev, open: false }));
                }, 3000);
            });
    };

    const handleGetLastCode = () => {
        let test = "";
        dispatch(lastUnitCode({ test }))
            .unwrap()
            .then((res) => {
                let getLastUnitCode = "01";

                if (res.data && res.data.unit_code) {
                    getLastUnitCode = "" + (Number(res.data.unit_code) + 1);

                    if (getLastUnitCode.length === 1) {
                        getLastUnitCode = "0" + getLastUnitCode;
                    }
                }

                setLastUnitCode(getLastUnitCode);
                formik.setValues({
                    unit_code: getLastUnitCode,
                });
            })
            .catch((err) => {
                console.error("Error fetching last unit code:", err.message);
            });
    };


    const formik = useFormik({
        initialValues: {
            unit_code: "",
            unit_name: "",
        },
        validate: (values) => {
            let errors = {};

            if (!values.unit_name) {
                errors.unit_name = 'unit_name cannot be empty';
            }

            return errors;
        },
        onSubmit: (values) => {
            dispatch(addUnit(values))
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
                    dispatch(countUnit({ test: "" }))
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
        }
    });

    const handleCancelCreate = () => {
        formik.resetForm();
        setOpenDrawer(false);
    };

    const handleCancelEdit = () => {
        formik.resetForm();
        setOpenEditDrawer(false);
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
                        Counting Unit Search
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
                                        indeterminate={selected.length > 0 && selected.length < unit.length}
                                        checked={unit.length > 0 && selected.length === unit.length}
                                        onChange={handleSelectAllClick}
                                    />
                                </StyledTableCell>
                                <StyledTableCell width='1%' >No.</StyledTableCell>
                                <StyledTableCell align="center">Counting ID</StyledTableCell>
                                <StyledTableCell align="center">Counting Unit</StyledTableCell>
                                <StyledTableCell width='1%' align="center"></StyledTableCell>
                                <StyledTableCell width='1%' align="center"></StyledTableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {unit.map((row) => (
                                <StyledTableRow key={row.unit_code}>
                                    <StyledTableCell padding="checkbox" align="center">
                                        <Checkbox
                                            checked={selected.includes(row.unit_code)}
                                            onChange={(event) => handleCheckboxChange(event, row.unit_code)}
                                        />

                                    </StyledTableCell>
                                    <StyledTableCell component="th" scope="row">
                                        {row.id}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">{row.unit_code}</StyledTableCell>
                                    <StyledTableCell align="center">{row.unit_name}</StyledTableCell>
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
                                            onClick={() => handleDelete(row.unit_code)} // Use a function to handle delete
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
                            borderRadius: '5px',
                            fontWeight: 'bold',
                            zIndex: 1,
                            borderRadius: '20px',
                            height: '89px',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography sx={{ fontWeight: '600', fontSize: '14px' }} >
                            Counting Unit
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
                                Counting Unit Id
                            </Typography>
                            <TextField
                                size="small"
                                // placeholder="Counting Unit Id"
                                disabled

                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("unit_code")}
                                {...errorHelper(formik, "unit_code")}
                                value={getLastUnitCode}
                            />
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Counting Unit Name
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Counting Unit Name"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("unit_name")}
                                {...errorHelper(formik, "unit_name")}
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
                                onClick={formik.handleSubmit}
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
                            Counting Unit ID
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
                                Counting Unit Id
                            </Typography>
                            <TextField
                                size="small"
                                disabled
                                placeholder="Counting Unit Id"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("unit_code")}
                                {...errorHelper(formik, "unit_code")}
                            />
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Counting Unit Name
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Counting Unit Name"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("unit_name")}
                                {...errorHelper(formik, "unit_name")}
                            />
                        </Box>
                        <Box sx={{ mt: '24px' }} >
                            onClick={handleCancelEdit}
                            <Button variant='contained'
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

