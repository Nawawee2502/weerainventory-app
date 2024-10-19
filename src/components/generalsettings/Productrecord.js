import { Box, Button, InputAdornment, TextField, Typography, Drawer, IconButton, Select, MenuItem, FormControl } from '@mui/material';
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
import { unitAll } from '../../api/productunitApi'
import { fetchAllTypeproducts } from '../../api/producttypeApi';
import { addProduct, deleteProduct, updateProduct, productAll, countProduct, searchProduct, lastProductCode, productAlltypeproduct } from '../../api/productrecordApi';
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { errorHelper } from "../handle-input-error";
import { Alert, AlertTitle } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Swal from 'sweetalert2';
import AddIcon from '@mui/icons-material/Add';

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


export default function ProductRecord() {
    const [selected, setSelected] = useState([]);
    const dispatch = useDispatch();
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [product, setProduct] = useState([]);
    const [productAllTypeproduct, setProductAllTypeproduct] = useState([]);
    const [typeproducts, setTypeproducts] = useState([]);
    const [page, setPage] = useState(0);
    const [count, setCount] = useState();
    const [searchTerm, setSearchTerm] = useState("");
    const [getLastProductCode, setGetLastProductCode] = useState([]);
    const [unit, setUnit] = useState([]);


    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        if (searchTerm) {
            dispatch(searchProduct({ product_name: searchTerm }))
                .unwrap()
                .then((res) => {
                    setProduct(res.data);
                })
                .catch((err) => console.log(err.message));
        } else {
            refetchData();
        }
    }, [searchTerm, dispatch]);

    const handleChange = (event, value) => {
        setPage(value);
        console.log(value);
        let page = value - 1;
        let offset = page * 5;
        let limit = 5;
        console.log(limit, offset);
        dispatch(productAll({ offset, limit }))
            .unwrap()
            .then((res) => {
                console.log(res.data);
                let resultData = res.data;
                for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                    resultData[indexArray].id = offset + indexArray + 1;
                }
                setProduct(resultData);
            })
            .catch((err) => err.message);
    };

    const refetchData = () => {
        let offset = 0;
        let limit = 5;
        dispatch(productAll({ offset, limit }))
            .unwrap()
            .then((res) => {
                setProduct(res.data);
            })
            .catch((err) => console.log(err.message));

        dispatch(productAlltypeproduct({ offset, limit }))
            .unwrap()
            .then((res) => {
                console.log("productAlltypeproduct");
                console.log(res.data);
                let resultData = res.data;
                for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                    resultData[indexArray].id = indexArray + 1;
                }
                setProductAllTypeproduct(resultData);
                console.log(resultData);

            })
            .catch((err) => err.message);
    };

    useEffect(() => {
        refetchData();
        fetchUnitData();
        fetchTypeproducts();
        let offset = 0;
        let limit = 5;
        let test = 10;
        dispatch(productAll({ offset, limit }))
            .unwrap()
            .then((res) => {
                console.log(res.data);
                let resultData = res.data;
                for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                    resultData[indexArray].id = indexArray + 1;
                }
                setProduct(resultData);
                console.log(resultData);

            })
            .catch((err) => err.message);

        dispatch(productAlltypeproduct({ offset, limit }))
            .unwrap()
            .then((res) => {
                console.log("productAlltypeproduct");
                console.log(res.data);
                let resultData = res.data;
                for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                    resultData[indexArray].id = indexArray + 1;
                }
                setProductAllTypeproduct(resultData);
                console.log("data : ", resultData);

            })
            .catch((err) => err.message);

        dispatch(lastProductCode({ test }))
            .unwrap()
            .then((res) => {
                setGetLastProductCode(res.data);
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

    const handleCheckboxChange = (event, product_code) => {
        if (event.target.checked) {
            setSelected([...selected, product_code]);
        } else {
            setSelected(selected.filter((item) => item !== product_code));
        }
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = product.map((row) => row.product_code);
            setSelected(newSelected);
        } else {
            setSelected([]);
        }
    };

    const handleDelete = (product_code) => {
        Swal.fire({
            title: 'Are you sure you want to delete this product?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(deleteProduct({ product_code }))
                    .unwrap()
                    .then((res) => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted successfully',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                        setTimeout(() => {
                            refetchData();
                            let offset = 0;
                            let limit = 5;
                            dispatch(productAll({ offset, limit }))
                                .unwrap()
                                .then((res) => {
                                    console.log(res.data);
                                    let resultData = res.data;
                                    for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                                        resultData[indexArray].id = indexArray + 1;
                                    }
                                    setProduct(resultData)
                                });
                        }, 2000);
                    })
                    .catch((err) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error deleting product',
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
            title: 'Are you sure you want to delete the selected products?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                Promise.all(selected.map(product_code =>
                    dispatch(deleteProduct({ product_code })).unwrap()
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
                            refetchData();
                            let offset = 0;
                            let limit = 5;
                            dispatch(productAll({ offset, limit }))
                                .unwrap()
                                .then((res) => setProduct(res.data));
                        }, 2000);
                    })
                    .catch((err) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error deleting products',
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

    // const handleGetLastCode = () => {
    //     let test = "";
    //     dispatch(lastProductCode({ test }))
    //         .unwrap()
    //         .then((res) => {
    //             let lastProductCode = "001";

    //             if (res.data && res.data.product_code) {
    //                 // แปลงค่า product_code เป็นตัวเลขและเพิ่ม 1
    //                 lastProductCode = "" + (Number(res.data.product_code) + 1);

    //                 // การเติม 0 ข้างหน้าเพื่อให้มีความยาว 3 หลัก
    //                 if (lastProductCode.length === 1) {
    //                     lastProductCode = "00" + lastProductCode;
    //                 } else if (lastProductCode.length === 2) {
    //                     lastProductCode = "0" + lastProductCode;
    //                 }
    //             }

    //             setGetLastProductCode(lastProductCode);
    //             formik.setFieldValue('product_code', lastProductCode);
    //         })
    //         .catch((err) => {
    //             console.error(err.message);
    //         });
    // };


    const toggleEditDrawer = (openEditDrawer) => () => {
        setOpenEditDrawer(openEditDrawer);
    };

    const [editProduct, setEditProduct] = useState(null);

    const handleEdit = (row) => {
        setEditProduct(row);
        formik.setValues({
            product_img: row.product_img,
            product_code: row.product_code,
            product_name: row.product_name,
            typeproduct_code: row.typeproduct_code,
            bulk_unit_code: row.bulk_unit_code,
            bulk_unit_price: row.bulk_unit_price,
            retail_unit_code: row.retail_unit_code,
            retail_unit_price: row.retail_unit_price,
            unit_conversion_factor: row.unit_conversion_factor,
        });
        toggleEditDrawer(true)();
    };

    const handleSave = () => {
        dispatch(updateProduct(formik.values))
            .unwrap()
            .then((res) => {
                setAlert({ open: true, message: 'Updated success', severity: 'success' });
                refetchData();
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

    const [previewUrl, setPreviewUrl] = useState(null);



    const formik = useFormik({
        initialValues: {
            product_code: '',
            product_name: '',
            typeproduct_code: '',
            bulk_unit_code: '',
            bulk_unit_price: '',
            retail_unit_code: '',
            retail_unit_price: '',
            unit_conversion_factor: '',
        },
        validate: (values) => {
            const errors = {};
            if (!values.product_name) errors.product_name = 'product_name cannot be empty';
            if (!values.typeproduct_code) errors.typeproduct_code = 'typeproduct_code cannot be empty';
            if (!values.bulk_unit_code) errors.bulk_unit_code = 'bulk_unit_code cannot be empty';
            if (!values.bulk_unit_price) errors.bulk_unit_price = 'bulk_unit_price cannot be empty';
            if (!values.retail_unit_code) errors.retail_unit_code = 'retail_unit_code cannot be empty';
            if (!values.retail_unit_price) errors.retail_unit_price = 'retail_unit_price cannot be empty';
            if (!values.unit_conversion_factor) errors.unit_conversion_factor = 'unit_conversion_factor cannot be empty';
            return errors;
        },
        onSubmit: (values) => {
            // formik.setFieldValue("product_img", file);
            const formData = new FormData();
            formData.append('product_img', values.product_img);
            // formData.append('file',values.image)
            console.log(values.product_img)

            dispatch(addProduct(values))
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
                    formik.resetForm();
                    refetchData();
                    handleGetLastCode();

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
    // const formik = useFormik({
    //     initialValues: {
    //         product_img: null,
    //         product_code: '',
    //         product_name: '',
    //         typeproduct_code: '',
    //         bulk_unit_code: '',
    //         bulk_unit_price: '',
    //         retail_unit_code: '',
    //         retail_unit_price: '',
    //         unit_conversion_factor: '',
    //     },
    //     validate: (values) => {
    //         const errors = {};
    //         if (!values.product_img) errors.product_img = 'product_img cannot be empty';
    //         if (!values.product_name) errors.product_name = 'product_name cannot be empty';
    //         if (!values.typeproduct_code) errors.typeproduct_code = 'typeproduct_code cannot be empty';
    //         if (!values.bulk_unit_code) errors.bulk_unit_code = 'bulk_unit_code cannot be empty';
    //         if (!values.bulk_unit_price) errors.bulk_unit_price = 'bulk_unit_price cannot be empty';
    //         if (!values.retail_unit_code) errors.retail_unit_code = 'retail_unit_code cannot be empty';
    //         if (!values.retail_unit_price) errors.retail_unit_price = 'retail_unit_price cannot be empty';
    //         if (!values.unit_conversion_factor) errors.unit_conversion_factor = 'unit_conversion_factor cannot be empty';
    //         return errors;
    //     },
    //     onSubmit: async (values) => {
    //         const formData = new FormData();
    //         formData.append('product_img', values.product_img); 
    //         formData.append('product_code', values.product_code);
    //         formData.append('product_name', values.product_name);
    //         formData.append('typeproduct_code', values.typeproduct_code);
    //         formData.append('bulk_unit_code', values.bulk_unit_code);
    //         formData.append('bulk_unit_price', values.bulk_unit_price);
    //         formData.append('retail_unit_code', values.retail_unit_code);
    //         formData.append('retail_unit_price', values.retail_unit_price);
    //         formData.append('unit_conversion_factor', values.unit_conversion_factor);

    //         try {
    //             await dispatch(addProduct(formData)).unwrap();
    //             Swal.fire({
    //                 icon: 'success',
    //                 title: 'Success',
    //                 text: 'เพิ่มข้อมูลสำเร็จ',
    //                 timer: 1000,
    //                 timerProgressBar: true,
    //                 showConfirmButton: false,
    //             });
    //             formik.resetForm();
    //             refetchData();
    //             handleGetLastCode();
    //         } catch (err) {
    //             Swal.fire({
    //                 icon: 'error',
    //                 title: 'Error',
    //                 text: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล',
    //                 timer: 3000,
    //                 timerProgressBar: true,
    //                 showConfirmButton: false,
    //             });
    //         }
    //     },
    // });


    const handleGetLastCode = () => {
        let test = "";
        dispatch(lastProductCode({ test }))
            .unwrap()
            .then((res) => {
                let lastProductCode = "001";

                if (res.data && res.data.product_code) {

                    lastProductCode = res.data.product_code.slice(-3);
                    lastProductCode = (Number(lastProductCode) + 1).toString();
                    lastProductCode = lastProductCode.padStart(3, '0');
                }

                setGetLastProductCode(lastProductCode);
                formik.setFieldValue('product_code', lastProductCode);
            })
            .catch((err) => {
                console.error(err.message);
            });
    };

    useEffect(() => {
        if (formik.values.typeproduct_code && getLastProductCode) {
            const newProductCode = `${formik.values.typeproduct_code}${getLastProductCode}`;
            formik.setFieldValue('product_code', newProductCode);
        }
    }, [formik.values.typeproduct_code, getLastProductCode]);

    const fetchUnitData = () => {
        let offset = 0;
        let limit = 5;
        dispatch(unitAll({ offset, limit }))
            .unwrap()
            .then((res) => {
                setUnit(res.data);
            })
            .catch((err) => console.log(err.message));
    };

    const fetchTypeproducts = () => {
        let offset = 0;
        let limit = 5;
        dispatch(fetchAllTypeproducts({ offset, limit }))
            .unwrap()
            .then((res) => {
                setTypeproducts(res.data);
            })
            .catch((err) => console.log(err.message));
    }

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
                        Product Record Search
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
                <Box sx={{ width: '90%', mt: '24px' }}>
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
                <TableContainer component={Paper} sx={{ width: '90%', mt: '24px' }}>
                    <Table sx={{}} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell sx={{ width: '1%', textAlign: 'center' }}>
                                    <Checkbox
                                        sx={{ color: '#FFF' }}
                                        indeterminate={selected.length > 0 && selected.length < product.length}
                                        checked={product.length > 0 && selected.length === product.length}
                                        onChange={handleSelectAllClick}
                                    />
                                </StyledTableCell>
                                <StyledTableCell width='1%' >No.</StyledTableCell>
                                <StyledTableCell align="center">Type Product</StyledTableCell>
                                <StyledTableCell align="center">Product ID</StyledTableCell>
                                <StyledTableCell align="center">Product Name</StyledTableCell>
                                <StyledTableCell align="center">Large Unit</StyledTableCell>
                                <StyledTableCell align="center">Small Unit</StyledTableCell>
                                <StyledTableCell align="center">Conversion Quantity </StyledTableCell>
                                <StyledTableCell width='1%' align="center"></StyledTableCell>
                                <StyledTableCell width='1%' align="center"></StyledTableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {productAllTypeproduct.map((row) => (
                                <StyledTableRow key={row.product_code}>
                                    <StyledTableCell padding="checkbox" align="center">
                                        <Checkbox
                                            checked={selected.includes(row.product_code)}
                                            onChange={(event) => handleCheckboxChange(event, row.product_code)}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell component="th" scope="row">
                                        {row.id}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        {row.tbl_typeproduct?.typeproduct_name}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">{row.product_code}</StyledTableCell>
                                    <StyledTableCell align="center">{row.product_name}</StyledTableCell>
                                    <StyledTableCell align="center">
                                        {row.productUnit1?.unit_name}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        {row.productUnit2?.unit_name}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">{row.unit_conversion_factor}</StyledTableCell>
                                    <StyledTableCell align="center">
                                        <IconButton
                                            color="primary"
                                            size="md"
                                            onClick={() => handleEdit(row)}
                                            sx={{ border: '1px solid #AD7A2C', borderRadius: '7px' }}
                                        >
                                            <EditIcon sx={{ color: '#AD7A2C' }} />
                                        </IconButton>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <IconButton
                                            color="danger"
                                            size="md"
                                            onClick={() => handleDelete(row.product_code)}
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
                            Product
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
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Type Product
                            </Typography>
                            <select
                                id="typeproduct-select"
                                name="typeproduct_code"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                    padding: '8px',
                                    marginTop: '8px',
                                    border: '1px solid #ccc',
                                    outline: 'none',
                                    height: '40px'
                                }}
                                {...formik.getFieldProps("typeproduct_code")}
                                {...errorHelper(formik, "typeproduct_code")}
                            >
                                <option value="" disabled>Select Type Product</option>
                                {typeproducts.map((item) => (
                                    <option key={item.typeproduct_code} value={item.typeproduct_code}>
                                        {item.typeproduct_name}
                                    </option>
                                ))}
                            </select>
                            {/* <TextField
                                size="small"
                                placeholder="type product code"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("typeproduct_code")}
                                {...errorHelper(formik, "typeproduct_code")}
                            /> */}
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Product Id
                            </Typography>
                            <TextField
                                size="small"
                                disabled
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("product_code")}
                                {...errorHelper(formik, "product_code")}
                                value={formik.values.product_code}
                            />
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Product Name
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Name"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("product_name")}
                                {...errorHelper(formik, "product_name")}
                            />
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Large unit
                            </Typography>
                            <select
                                id="small-unit-select"
                                name="retail_unit_code"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                    padding: '8px',
                                    marginTop: '8px',
                                    border: '1px solid #ccc',
                                    outline: 'none',
                                    height: '40px'
                                }}
                                {...formik.getFieldProps("bulk_unit_code")}
                                {...errorHelper(formik, "bulk_unit_code")}
                            >
                                {/* <MenuItem value="" disabled>
                                        Select Small Unit
                                    </MenuItem> */}
                                <option value="" disabled>
                                    Select Large Unit
                                </option>
                                {unit.map((item) => (
                                    <option key={item.unit_code} value={item.unit_code}>
                                        {item.unit_name}
                                    </option>
                                ))}
                            </select>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Large unit price
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Large unit price"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("bulk_unit_price")}
                                {...errorHelper(formik, "bulk_unit_price")}
                            />
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Small unit
                            </Typography>
                            <FormControl sx={{ width: '100%' }}>
                                <select
                                    id="small-unit-select"
                                    name="retail_unit_code"
                                    style={{
                                        width: '100%',
                                        borderRadius: '10px',
                                        padding: '8px',
                                        marginTop: '8px',
                                        border: '1px solid #ccc',
                                        outline: 'none',
                                        height: '40px'
                                    }}
                                    {...formik.getFieldProps("retail_unit_code")}
                                    {...errorHelper(formik, "retail_unit_code")}
                                >
                                    {/* <MenuItem value="" disabled>
                                        Select Small Unit
                                    </MenuItem> */}
                                    <option value="" disabled >
                                        Select Small Unit
                                    </option>
                                    {unit.map((item) => (
                                        <option key={item.unit_code} value={item.unit_code}>
                                            {item.unit_name}
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Small unit price
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Small unit price"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("retail_unit_price")}
                                {...errorHelper(formik, "retail_unit_price")}
                            />
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Conversion Quantity
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Conversion Quantity"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("unit_conversion_factor")}
                                {...errorHelper(formik, "unit_conversion_factor")}
                            />
                        </Box>
                        <Box sx={{ mt: '24px' }} >
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
            </Drawer >
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
                            Product
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
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Type Product
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="type product code"
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
                                {...formik.getFieldProps("product_code")}
                                {...errorHelper(formik, "product_code")}
                                value={getLastProductCode}
                            />
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Product Name
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Name"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("product_name")}
                                {...errorHelper(formik, "product_name")}
                            />
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Large unit
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Large unit"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("bulk_unit_code")}
                                {...errorHelper(formik, "bulk_unit_code")}
                            />
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Large unit price
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Large unit price"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("bulk_unit_price")}
                                {...errorHelper(formik, "bulk_unit_price")}
                            />
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Small unit
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Small unit"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("retail_unit_code")}
                                {...errorHelper(formik, "retail_unit_code")}
                            />
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Small unit price
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Small unit price"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("retail_unit_price")}
                                {...errorHelper(formik, "retail_unit_price")}
                            />
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Conversion Quantity
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Conversion Quantity"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                                {...formik.getFieldProps("unit_conversion_factor")}
                                {...errorHelper(formik, "unit_conversion_factor")}
                            />
                        </Box>
                        <Box sx={{ mt: '24px' }} >
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
            {
                alert.open && (
                    <Alert severity={alert.severity} onClose={() => setAlert({ ...alert, open: false })}>
                        <AlertTitle>{alert.severity === 'success' ? 'Success' : 'Error'}</AlertTitle>
                        {alert.message}
                    </Alert>
                )
            }
        </>
    );
}

