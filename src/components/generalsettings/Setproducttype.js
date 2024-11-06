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
import { addTypeproduct, countProduct, fetchAllTypeproducts, deleteTypeproduct, updateTypeproduct, searchTypeproduct, lastTypeproductCode } from '../../api/producttypeApi';
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


export default function SetProductType() {
    const [selected, setSelected] = useState([]);
    const dispatch = useDispatch();
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [typeproducts, setTypeproducts] = useState([]);
    const [page, setPage] = useState(0);
    const [count, setCount] = useState();
    const [searchTerm, setSearchTerm] = useState("");
    const [getLastTypeproductCode, setGetLastTypeproductCode] = useState([]);
    const [itemsPerPage] = useState(5);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        if (searchTerm) {
            dispatch(searchTypeproduct({ typeproduct_name: searchTerm }))
                .unwrap()
                .then((res) => {
                    setTypeproducts(res.data);
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

        dispatch(fetchAllTypeproducts({ offset, limit }))
            .unwrap()
            .then((res) => {
                let resultData = res.data;
                for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                    resultData[indexArray].id = offset + indexArray + 1;
                }
                setTypeproducts(resultData);
            })
            .catch((err) => err.message);
    };

    const refetchData = (targetPage = 1) => {
        const offset = (targetPage - 1) * itemsPerPage;
        const limit = itemsPerPage;

        dispatch(fetchAllTypeproducts({ offset, limit }))
            .unwrap()
            .then((res) => {
                let resultData = res.data;
                for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                    resultData[indexArray].id = offset + indexArray + 1;
                }
                setTypeproducts(resultData);

                // หลังจากได้ข้อมูลแล้ว ดึงจำนวนรายการทั้งหมด
                dispatch(countProduct({ test: "" }))
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
        dispatch(fetchAllTypeproducts({ offset, limit }))
            .unwrap()
            .then((res) => {
                console.log(res.data);
                let resultData = res.data;
                for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                    resultData[indexArray].id = indexArray + 1;
                }
                setTypeproducts(resultData);
                console.log(resultData);

            })
            .catch((err) => err.message);

        dispatch(lastTypeproductCode({ test }))
            .unwrap()
            .then((res) => {
                setGetLastTypeproductCode(res.data);
                console.log(res.data)
            })
            .catch((err) => err.message);

        dispatch(countProduct({ test }))
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

    const handleCheckboxChange = (event, typeproduct_code) => {
        if (event.target.checked) {
            setSelected([...selected, typeproduct_code]);
        } else {
            setSelected(selected.filter((item) => item !== typeproduct_code));
        }
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = typeproducts.map((row) => row.typeproduct_code);
            setSelected(newSelected);
        } else {
            setSelected([]);
        }
    };

    const handleDelete = (typeproduct_code) => {
        Swal.fire({
            title: 'Are you sure you want to delete this product?',
            text: 'You will not be able to recover this information!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(deleteTypeproduct({ typeproduct_code }))
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
                            dispatch(fetchAllTypeproducts({ offset, limit }))
                                .unwrap()
                                .then((res) => {
                                    console.log(res.data);
                                    let resultData = res.data;
                                    for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                                        resultData[indexArray].id = indexArray + 1;
                                    }
                                    setPage(1);
                                    setTypeproducts(resultData)
                                });
                        }, 2000);
                    })
                    .catch((err) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error deleting data',
                            text: 'Please try again',
                            timer: 3000,
                            showConfirmButton: false,
                        });
                    });
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Delete action cancelled',
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
        });
    };

    const handleDeleteSelected = () => {
        Swal.fire({
            title: 'Are you sure you want to delete the selected items?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                Promise.all(selected.map(typeproduct_code =>
                    dispatch(deleteTypeproduct({ typeproduct_code })).unwrap()
                ))
                    .then(() => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Selected items deleted successfully',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                        setTimeout(() => {
                            setSelected([]);
                            refetchData(page);
                            let offset = 0;
                            let limit = 5;
                            dispatch(fetchAllTypeproducts({ offset, limit }))
                                .unwrap()
                                .then((res) => {
                                    console.log(res.data);
                                    let resultData = res.data;
                                    for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                                        resultData[indexArray].id = indexArray + 1;
                                    }
                                    setPage(1);
                                    setTypeproducts(resultData)
                                });
                        }, 2000);
                    })
                    .catch((err) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error deleting items',
                            text: 'Please try again',
                            timer: 3000,
                            showConfirmButton: false,
                        });
                    });
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Delete action canceled',
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

    const [editProduct, setEditProduct] = useState(null);

    const handleEdit = (row) => {
        setEditProduct(row);
        formik.setValues({
            typeproduct_code: row.typeproduct_code,
            typeproduct_name: row.typeproduct_name,
        });
        toggleEditDrawer(true)();
    };

    const handleSave = () => {
        dispatch(updateTypeproduct(formik.values))
            .unwrap()
            .then((res) => {
                setAlert({ open: true, message: 'อัปเดตข้อมูลสำเร็จ', severity: 'success' });
                refetchData(page); // ใช้หน้าปัจจุบัน
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
        dispatch(lastTypeproductCode({ test }))
            .unwrap()
            .then((res) => {
                let lastTypeCode = "001";

                if (res.data && res.data.typeproduct_code) {
                    lastTypeCode = "" + (Number(res.data.typeproduct_code) + 1);

                    if (lastTypeCode.length === 1) {
                        lastTypeCode = "00" + lastTypeCode;
                    } else if (lastTypeCode.length === 2) {
                        lastTypeCode = "0" + lastTypeCode;
                    }
                }

                setGetLastTypeproductCode(lastTypeCode);
                formik.setValues({
                    typeproduct_code: lastTypeCode,
                });
            })
            .catch((err) => {
                console.error("Error fetching last typeproduct code:", err.message);
            });
    };

    const errorHelper = (formik, fieldName) => {
        return {
            error: formik.touched[fieldName] && Boolean(formik.errors[fieldName]),
            helperText: formik.touched[fieldName] && formik.errors[fieldName],
        };
    };


    const formik = useFormik({
        initialValues: {
            typeproduct_code: "",
            typeproduct_name: "",
        },
        validate: (values) => {
            let errors = {};

            if (!values.typeproduct_name) {
                errors.typeproduct_name = 'typeproduct_name cannot be empty';
            }

            return errors;
        },
        onSubmit: (values) => {
            dispatch(addTypeproduct(values))
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
                    dispatch(countProduct({ test: "" }))
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
                        Product Type Search
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
                                        indeterminate={selected.length > 0 && selected.length < typeproducts.length}
                                        checked={typeproducts.length > 0 && selected.length === typeproducts.length}
                                        onChange={handleSelectAllClick}
                                    />
                                </StyledTableCell>
                                <StyledTableCell width='1%' >No.</StyledTableCell>
                                <StyledTableCell align="center">Product Type Code</StyledTableCell>
                                <StyledTableCell align="center">Product Type</StyledTableCell>
                                <StyledTableCell width='1%' align="center"></StyledTableCell>
                                <StyledTableCell width='1%' align="center"></StyledTableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {typeproducts.map((row) => (
                                <StyledTableRow key={row.typeproduct_code}>
                                    <StyledTableCell padding="checkbox" align="center">
                                        <Checkbox
                                            checked={selected.includes(row.typeproduct_code)}
                                            onChange={(event) => handleCheckboxChange(event, row.typeproduct_code)}
                                        />

                                    </StyledTableCell>
                                    <StyledTableCell component="th" scope="row">
                                        {row.id}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">{row.typeproduct_code}</StyledTableCell>
                                    <StyledTableCell align="center">{row.typeproduct_name}</StyledTableCell>
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
                                            onClick={() => handleDelete(row.typeproduct_code)} // Use a function to handle delete
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
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            zIndex: 1,
                            height: '89px',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography sx={{ fontWeight: '600', fontSize: '14px' }} >
                            Product Type
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
                                Product Id
                            </Typography>
                            <TextField
                                size="small"
                                // placeholder={getLastTypeproductCode}
                                disabled

                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("typeproduct_code")}
                                {...errorHelper(formik, "typeproduct_code")}
                                value={getLastTypeproductCode}
                            />
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Product Type
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Product Type"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("typeproduct_name")}
                                {...errorHelper(formik, "typeproduct_name")}
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
                            Product Type
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
                                Product Id
                            </Typography>
                            <TextField
                                disabled
                                size="small"
                                placeholder="Product Id"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("typeproduct_code")}
                                {...errorHelper(formik, "typeproduct_code")}
                            />

                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Product Type
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Product Name"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("typeproduct_name")}
                                {...errorHelper(formik, "typeproduct_name")}
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
