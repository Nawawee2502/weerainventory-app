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
import RefreshIcon from '@mui/icons-material/Refresh';

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
    const [itemsPerPage] = useState(5);
    const [selectedType, setSelectedType] = useState('all'); // Add new state for type filter

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
        setPage(1); // Reset to first page when changing type
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };


    useEffect(() => {
        if (searchTerm || selectedType !== 'all') {
            let query = {};

            if (searchTerm) {
                query.product_name = searchTerm;
            }

            if (selectedType !== 'all') {
                query.typeproduct_code = selectedType;
            }

            if (Object.keys(query).length > 0) {
                dispatch(searchProduct(query))
                    .unwrap()
                    .then((res) => {
                        const resultData = res.data.map((item, index) => ({
                            ...item,
                            id: index + 1
                        }));
                        setProductAllTypeproduct(resultData);
                    })
                    .catch((err) => {
                        console.log(err.message);
                        setProductAllTypeproduct([]); // Set empty array on error
                    });
            }
        } else {
            refetchData(1);
        }
    }, [searchTerm, selectedType, dispatch]);

    const handleChange = (event, value) => {
        setPage(value);
        let page = value - 1;
        let offset = page * 5;
        let limit = 5;

        dispatch(productAlltypeproduct({ offset, limit }))
            .unwrap()
            .then((res) => {
                let resultData = res.data;
                for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                    resultData[indexArray].id = offset + indexArray + 1;
                }
                setProductAllTypeproduct(resultData);
            })
            .catch((err) => err.message);
    };

    const refetchData = (targetPage = 1) => {
        const offset = (targetPage - 1) * itemsPerPage;
        const limit = itemsPerPage;

        // เรียก API เพื่อดึงข้อมูลสินค้า
        dispatch(productAlltypeproduct({ offset, limit }))
            .unwrap()
            .then((res) => {
                let resultData = res.data;
                for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                    resultData[indexArray].id = offset + indexArray + 1;
                }
                setProductAllTypeproduct(resultData);

                // หลังจากได้ข้อมูลสินค้าแล้ว ดึงจำนวนรายการทั้งหมด
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
        fetchUnitData();
        fetchTypeproducts();
        let offset = 0;
        let limit = 5;
        let test = 10;

        dispatch(productAlltypeproduct({ offset, limit }))
            .unwrap()
            .then((res) => {
                let resultData = res.data;
                for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
                    resultData[indexArray].id = indexArray + 1;
                }
                setProductAllTypeproduct(resultData);
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


    const toggleEditDrawer = (openEditDrawer) => () => {
        setOpenEditDrawer(openEditDrawer);
    };

    const [editProduct, setEditProduct] = useState(null);

    const handleEdit = (row) => {
        setEditProduct(row);
        // ตรวจสอบและแปลงค่า product_code ให้เป็น string
        const productCode = Array.isArray(row.product_code) ? row.product_code[0] : row.product_code;

        formik.setValues({
            product_code: productCode,
            product_name: row.product_name || '',
            typeproduct_code: row.typeproduct_code || '',
            bulk_unit_code: row.bulk_unit_code || '',
            bulk_unit_price: row.bulk_unit_price || '',
            retail_unit_code: row.retail_unit_code || '',
            retail_unit_price: row.retail_unit_price || '',
            unit_conversion_factor: row.unit_conversion_factor || '',
            tax1: row.tax1 || '',
        });
        toggleEditDrawer(true)();
    };

    const handleSave = () => {
        // Make sure to include product_code in the update data
        const updateData = {
            ...formik.values,
            product_code: editProduct?.product_code
        };

        dispatch(updateProduct(updateData))
            .unwrap()
            .then((res) => {
                Swal.fire({
                    icon: 'success',
                    title: 'Updated success',
                    timer: 1500,
                    showConfirmButton: false
                });
                refetchData();
                toggleEditDrawer(false)();
            })
            .catch((err) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Updated Error',
                    timer: 1500,
                    showConfirmButton: false
                });
            });
    };

    const [previewUrl, setPreviewUrl] = useState(null);



    const handleGetLastCode = async () => {
        try {
            const response = await dispatch(lastProductCode({ test: "" })).unwrap();
            const selectedTypeCode = formik.values.typeproduct_code;

            if (!selectedTypeCode) {
                return; // ถ้ายังไม่ได้เลือก typeproduct ให้ return ออกไป
            }

            let nextRunningNumber = "001"; // เริ่มต้นที่ 001 สำหรับ typeproduct ใหม่

            if (response.data && response.data.length > 0) {
                // กรองเฉพาะ product ที่มี typeproduct_code เดียวกับที่เลือก
                const productsWithSameType = response.data.filter(
                    product => product.product_code.startsWith(selectedTypeCode)
                );

                if (productsWithSameType.length > 0) {
                    // หาเลข running number สูงสุดของ typeproduct นี้
                    const maxRunningNumber = Math.max(
                        ...productsWithSameType.map(product =>
                            parseInt(product.product_code.slice(-3))
                        )
                    );
                    // เพิ่มค่าและแปลงเป็น format 3 หลัก
                    nextRunningNumber = (maxRunningNumber + 1).toString().padStart(3, '0');
                }
            }

            // สร้าง product_code ใหม่โดยรวม typeproduct_code กับ running number
            const newProductCode = selectedTypeCode + nextRunningNumber;
            formik.setFieldValue('product_code', newProductCode);

        } catch (err) {
            console.error("Error fetching last product code:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error generating product code',
                timer: 3000,
                showConfirmButton: false,
            });
        }
    };

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
            tax1: '',
        },
        validate: (values) => {
            const errors = {};

            // Check required fields
            if (!values.product_name) errors.product_name = 'Please enter product name';
            if (!values.typeproduct_code) errors.typeproduct_code = 'Please select product type';
            if (!values.bulk_unit_code) errors.bulk_unit_code = 'Please select large unit';
            if (!values.bulk_unit_price) errors.bulk_unit_price = 'Please enter large unit price';
            if (!values.retail_unit_code) errors.retail_unit_code = 'Please select small unit';
            if (!values.retail_unit_price) errors.retail_unit_price = 'Please enter small unit price';
            if (!values.unit_conversion_factor) errors.unit_conversion_factor = 'Please enter conversion quantity';
            if (!values.tax1) errors.tax1 = 'Please select tax option';

            // Validate numbers
            if (values.bulk_unit_price && (isNaN(values.bulk_unit_price) || Number(values.bulk_unit_price) <= 0)) {
                errors.bulk_unit_price = 'Large unit price must be greater than 0';
            }
            if (values.retail_unit_price && (isNaN(values.retail_unit_price) || Number(values.retail_unit_price) <= 0)) {
                errors.retail_unit_price = 'Small unit price must be greater than 0';
            }
            if (values.unit_conversion_factor && (isNaN(values.unit_conversion_factor) || Number(values.unit_conversion_factor) <= 0)) {
                errors.unit_conversion_factor = 'Conversion quantity must be greater than 0';
            }

            return errors;
        },
        onSubmit: async (values, { setSubmitting }) => {
            try {
                // Check validation errors
                const errors = await formik.validateForm(values);

                if (Object.keys(errors).length > 0) {
                    const errorMessages = Object.values(errors).join('\n');
                    Swal.fire({
                        icon: 'error',
                        title: 'Please Check Your Information',
                        html: errorMessages.replace(/\n/g, '<br>'),
                        confirmButtonText: 'OK'
                    });
                    return;
                }

                // Get latest code
                const response = await dispatch(lastProductCode({ test: "" })).unwrap();
                const selectedTypeCode = values.typeproduct_code;
                let nextRunningNumber = "001";

                if (response.data && response.data.length > 0) {
                    // Filter products with same type code
                    const productsWithSameType = response.data.filter(
                        product => product.product_code.startsWith(selectedTypeCode)
                    );

                    if (productsWithSameType.length > 0) {
                        const maxRunningNumber = Math.max(
                            ...productsWithSameType.map(product =>
                                parseInt(product.product_code.slice(-3))
                            )
                        );
                        nextRunningNumber = (maxRunningNumber + 1).toString().padStart(3, '0');
                    }
                }

                // Create product code and save
                values.product_code = selectedTypeCode + nextRunningNumber;
                await dispatch(addProduct(values)).unwrap();

                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Product added successfully',
                    timer: 1500,
                    showConfirmButton: false,
                });

                // Update data and close drawer
                const countRes = await dispatch(countProduct({ test: "" })).unwrap();
                const totalItems = countRes.data;
                const targetPage = Math.ceil(totalItems / itemsPerPage);

                formik.resetForm();
                refetchData(targetPage);
                handleGetLastCode();
                setOpenDrawer(false);

            } catch (err) {
                console.error("Error adding product:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to save product. Please try again.',
                    timer: 3000,
                    showConfirmButton: false,
                });
            } finally {
                setSubmitting(false);
            }
        }
    });


    // const handleGetLastCode = () => {
    //     let test = "";
    //     dispatch(lastProductCode({ test }))
    //         .unwrap()
    //         .then((res) => {
    //             let lastProductCode = "001";

    //             if (res.data && res.data.length > 0) {
    //                 // แยกเฉพาะตัวเลข 3 ตัวท้ายและแปลงเป็นตัวเลข
    //                 const allNumbers = res.data
    //                     .map(product => parseInt(product.product_code.slice(-3)))
    //                     .sort((a, b) => a - b); // เรียงจากน้อยไปมาก

    //                 let nextNumber = 1; // เริ่มจาก 1

    //                 // หาช่องว่างของตัวเลข
    //                 for (let i = 0; i < allNumbers.length; i++) {
    //                     if (allNumbers[i] === nextNumber) {
    //                         nextNumber++;
    //                     } else if (allNumbers[i] > nextNumber) {
    //                         break;
    //                     }
    //                 }

    //                 // แปลงกลับเป็น string และเติม 0 ข้างหน้า
    //                 lastProductCode = nextNumber.toString().padStart(3, '0');

    //                 // ตรวจสอบว่าเกิน 999 หรือไม่
    //                 if (nextNumber > 999) {
    //                     throw new Error('Running number exceeded maximum value (999)');
    //                 }
    //             }

    //             setGetLastProductCode(lastProductCode);

    //             // ถ้ามี typeproduct_code แล้ว ให้สร้าง product_code เต็ม
    //             if (formik.values.typeproduct_code) {
    //                 const newProductCode = `${formik.values.typeproduct_code}${lastProductCode}`;
    //                 formik.setFieldValue('product_code', newProductCode);
    //             } else {
    //                 formik.setFieldValue('product_code', lastProductCode);
    //             }
    //         })
    //         .catch((err) => {
    //             console.error(err.message);
    //             // แสดง error message ถ้าต้องการ
    //             Swal.fire({
    //                 icon: 'error',
    //                 title: 'Error',
    //                 text: err.message || 'Error generating product code',
    //                 timer: 3000,
    //                 timerProgressBar: true,
    //                 showConfirmButton: false,
    //             });
    //         });
    // };


    useEffect(() => {
        if (formik.values.typeproduct_code && getLastProductCode) {
            const newProductCode = `${formik.values.typeproduct_code}${getLastProductCode}`;
            formik.setFieldValue('product_code', newProductCode);
        }
    }, [formik.values.typeproduct_code, getLastProductCode]);

    const fetchUnitData = () => {
        let offset = 0;
        let limit = 999999;
        dispatch(unitAll({ offset, limit }))
            .unwrap()
            .then((res) => {
                setUnit(res.data);
            })
            .catch((err) => console.log(err.message));
    };

    const fetchTypeproducts = () => {
        let offset = 0;
        let limit = 999999;
        dispatch(fetchAllTypeproducts({}))
            .unwrap()
            .then((res) => {
                setTypeproducts(res.data);
            })
            .catch((err) => console.log(err.message));
    }

    const handleCancelCreate = () => {
        formik.resetForm();
        setOpenDrawer(false);
    };

    const handleCancelEdit = () => {
        formik.resetForm();
        setOpenEditDrawer(false);
    };

    const handleRefresh = () => {
        refetchData(1);
        setSearchTerm("");
        setSelectedType('all'); // Reset type filter
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
                <Box sx={{ display: 'flex', flexDirection: 'row' }} >
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
                    <IconButton
                        onClick={handleRefresh}
                        sx={{
                            width: '70px',
                            height: '70px',
                            background: 'linear-gradient(180deg, #AD7A2C 0%, #754C27 100%)',
                            borderRadius: '15px',
                            boxShadow: '0px 4px 4px 0px #00000040',
                            '&:hover': {
                                background: 'linear-gradient(180deg, #8C5D1E 0%, #5D3A1F 100%)',
                            },
                            ml: '24px'
                        }}
                    >
                        <RefreshIcon sx={{ fontSize: '32px', color: '#FFFFFF' }} />
                    </IconButton>
                </Box>

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
                    <FormControl sx={{ minWidth: 200 }}>
                        <Select
                            value={selectedType}
                            onChange={handleTypeChange}
                            size="small"
                            sx={{
                                height: '38px',
                                bgcolor: 'white',
                                ml: '24px'
                            }}
                        >
                            <MenuItem value="all">All Type Products</MenuItem>
                            {typeproducts.map((type) => (
                                <MenuItem key={type.typeproduct_code} value={type.typeproduct_code}>
                                    {type.typeproduct_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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
                                <StyledTableCell align="center">Tax</StyledTableCell>
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
                                        {row.tax1 === 'Y' ? 'Yes' : 'No'}
                                    </StyledTableCell>
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
                            {/* <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
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
                            /> */}
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
                                Tax
                            </Typography>
                            <select
                                name="tax1"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                    padding: '8px',
                                    marginTop: '8px',
                                    border: '1px solid #ccc',
                                    outline: 'none',
                                    height: '40px'
                                }}
                                {...formik.getFieldProps("tax1")}
                                {...errorHelper(formik, "tax1")}
                            >
                                <option value="" disabled>Select Tax Option</option>
                                <option value="Y">Yes</option>
                                <option value="N">No</option>
                            </select>
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
                                disabled
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
                                value={formik.values.typeproduct_code}
                            />
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
                                value={editProduct?.product_code || ''} // เปลี่ยนจาก formik.values.product_code เป็น editProduct?.product_code
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
                                Tax
                            </Typography>
                            <select
                                name="tax1"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                    padding: '8px',
                                    marginTop: '8px',
                                    border: '1px solid #ccc',
                                    outline: 'none',
                                    height: '40px'
                                }}
                                {...formik.getFieldProps("tax1")}
                                {...errorHelper(formik, "tax1")}
                            >
                                <option value="" disabled>Select Tax Option</option>
                                <option value="Y">Yes</option>
                                <option value="N">No</option>
                            </select>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                                Large unit
                            </Typography>
                            <select
                                name="bulk_unit_code"
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
                                <option value="" disabled>Select Large Unit</option>
                                {unit.map((item) => (
                                    <option
                                        key={item.unit_code}
                                        value={item.unit_code}
                                        selected={item.unit_code === formik.values.bulk_unit_code}
                                    >
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
                            <select
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
                                <option value="" disabled>Select Small Unit</option>
                                {unit.map((item) => (
                                    <option
                                        key={item.unit_code}
                                        value={item.unit_code}
                                        selected={item.unit_code === formik.values.retail_unit_code}
                                    >
                                        {item.unit_name}
                                    </option>
                                ))}
                            </select>
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
