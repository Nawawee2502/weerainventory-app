import { Box, Button, InputAdornment, TextField, Typography, Drawer, IconButton, Select, MenuItem, FormControl, Backdrop, CircularProgress, Modal } from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';
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
import { exportToPdfProduct } from './ExportPdfProduct';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintBarcodeModal from './PrintBarcodeModal';
import { generateBarcodePDF } from './BarcodeGenerator';
import PrintIcon from '@mui/icons-material/Print';


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
    const [product, setProduct] = useState([]);
    const [typeproducts, setTypeproducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [unit, setUnit] = useState([]);
    const [page, setPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [count, setCount] = useState(0);
    const [productAllTypeproduct, setProductAllTypeproduct] = useState([]);
    const [selectedTypeProduct, setSelectedTypeProduct] = useState("");
    const [openDrawer, setOpenDrawer] = useState(false);
    const [openEditDrawer, setOpenEditDrawer] = useState(false);
    const [editProduct, setEditProduct] = useState(null);

    const [openBarcodeModal, setOpenBarcodeModal] = useState(false);
    const [loadingBarcode, setLoadingBarcode] = useState(false);
    const [barcodeProducts, setBarcodeProducts] = useState([]);
    const [searchTermBarcode, setSearchTermBarcode] = useState('');
    const [selectedBarcodeProducts, setSelectedBarcodeProducts] = useState([]);
    const [barcodeCount, setBarcodeCount] = useState({});
    const [filteredBarcodeProducts, setFilteredBarcodeProducts] = useState([]);

    const [barcodeModalPage, setBarcodeModalPage] = useState(1);
    const [barcodeItemsPerPage] = useState(5);
    const [totalBarcodePages, setTotalBarcodePages] = useState(0);
    const [searchTimeout, setSearchTimeout] = useState(null);

    const [barcodeSearchLoading, setBarcodeSearchLoading] = useState(false);
    const searchBarcodeInputRef = useRef(null);


    // Process barcode products when they change
    useEffect(() => {
        if (barcodeProducts.length > 0) {
            // Initialize barcode counts for each product
            const initialCounts = {};
            barcodeProducts.forEach(product => {
                initialCounts[product.product_code] = 1;
            });
            setBarcodeCount(initialCounts);
            setFilteredBarcodeProducts(barcodeProducts);
        }
    }, [barcodeProducts]);

    // Filter barcode products when search term changes
    useEffect(() => {
        if (searchTermBarcode.trim() === '') {
            setFilteredBarcodeProducts([...barcodeProducts]);
        } else {
            const searchTermLower = searchTermBarcode.toLowerCase();
            const filtered = barcodeProducts.filter(product =>
                product.product_name.toLowerCase().includes(searchTermLower) ||
                product.product_code.toLowerCase().includes(searchTermLower)
            );
            setFilteredBarcodeProducts([...filtered]);
        }
    }, [searchTermBarcode, barcodeProducts]);


    const sortProductsAlphabetically = (products) => {
        if (!products || products.length === 0) return [];

        // Create a copy of the array to avoid mutating the original
        return [...products].sort((a, b) => {
            // Case-insensitive sorting by product_name
            return a.product_name.toLowerCase().localeCompare(b.product_name.toLowerCase());
        });
    };

    const handleTypeChange = async (event) => {
        const newTypeProduct = event.target.value;
        setSelectedTypeProduct(newTypeProduct);
        setPage(1);

        try {
            // Load new data by selected type
            const [productResponse, countResponse] = await Promise.all([
                dispatch(productAlltypeproduct({
                    typeproduct_code: newTypeProduct || null,
                    offset: 0,
                    limit: itemsPerPage
                })).unwrap(),
                dispatch(countProduct({
                    typeproduct_code: newTypeProduct || null
                })).unwrap()
            ]);

            // Update table data with sorted products
            if (productResponse.data) {
                // Sort the products alphabetically
                const sortedProducts = sortProductsAlphabetically(productResponse.data);

                // Add IDs to sorted products
                const productsWithIds = sortedProducts.map((item, index) => ({
                    ...item,
                    id: index + 1
                }));

                setProductAllTypeproduct(productsWithIds);
            }

            // Update page count
            setCount(Math.ceil(countResponse.data / itemsPerPage));
        } catch (error) {
            console.error("Error fetching products by type:", error);
        }
    };

    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setPage(1); // Reset page when searching

        try {
            // Delay search to reduce API calls
            const delayDebounceFn = setTimeout(async () => {
                const [productResponse, countResponse] = await Promise.all([
                    dispatch(productAlltypeproduct({
                        typeproduct_code: selectedTypeProduct || null,
                        product_name: value,
                        offset: 0,
                        limit: itemsPerPage
                    })).unwrap(),
                    dispatch(countProduct({
                        typeproduct_code: selectedTypeProduct || null,
                        product_name: value
                    })).unwrap()
                ]);

                if (productResponse.data) {
                    // Sort the products alphabetically
                    const sortedProducts = sortProductsAlphabetically(productResponse.data);

                    // Add IDs to sorted products
                    const productsWithIds = sortedProducts.map((item, index) => ({
                        ...item,
                        id: index + 1
                    }));

                    setProductAllTypeproduct(productsWithIds);
                }

                setCount(Math.ceil(countResponse.data / itemsPerPage));
            }, 300);

            return () => clearTimeout(delayDebounceFn);
        } catch (error) {
            console.error("Error searching products:", error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                // โหลด Product Types
                const typeResponse = await dispatch(fetchAllTypeproducts({})).unwrap();
                setTypeproducts(typeResponse.data);

                // โหลด Units
                await fetchUnitData();

                // คำนวณ offset และ limit
                const offset = (page - 1) * itemsPerPage;
                const limit = itemsPerPage;

                // โหลดข้อมูลสินค้าและนับจำนวน
                const [productResponse, countResponse] = await Promise.all([
                    dispatch(productAlltypeproduct({
                        typeproduct_code: selectedTypeProduct || null,
                        product_name: searchTerm || null, // Add search term
                        offset,
                        limit
                    })).unwrap(),
                    dispatch(countProduct({
                        typeproduct_code: selectedTypeProduct || null,
                        product_name: searchTerm || null // Add search term
                    })).unwrap()
                ]);

                if (productResponse.data) {
                    // เรียงข้อมูลตามชื่อสินค้า A-Z ก่อนแสดงผล
                    const sortedProducts = [...productResponse.data].sort((a, b) =>
                        a.product_name.toLowerCase().localeCompare(b.product_name.toLowerCase())
                    );

                    const productsWithIds = sortedProducts.map((item, index) => ({
                        ...item,
                        id: offset + index + 1
                    }));
                    setProductAllTypeproduct(productsWithIds);
                }

                if (countResponse.data) {
                    setCount(Math.ceil(countResponse.data / itemsPerPage));
                }

            } catch (error) {
                console.error("Error loading data:", error);
            }
        };

        loadData();
    }, [dispatch, page, selectedTypeProduct, searchTerm, itemsPerPage]); // เพิ่ม dependencies

    const handleChange = (event, value) => {
        setPage(value);
    };

    const refetchData = async (targetPage = 1) => {
        try {
            const offset = (targetPage - 1) * itemsPerPage;
            const limit = itemsPerPage;

            const [productResponse, countResponse] = await Promise.all([
                dispatch(productAlltypeproduct({
                    typeproduct_code: selectedTypeProduct || null,
                    product_name: searchTerm || null,
                    offset,
                    limit
                })).unwrap(),
                dispatch(countProduct({
                    typeproduct_code: selectedTypeProduct || null,
                    product_name: searchTerm || null
                })).unwrap()
            ]);

            if (productResponse.data) {
                // Sort the products alphabetically
                const sortedProducts = sortProductsAlphabetically(productResponse.data);

                // Add IDs to sorted products
                const productsWithIds = sortedProducts.map((item, index) => ({
                    ...item,
                    id: offset + index + 1
                }));

                setProductAllTypeproduct(productsWithIds);
            }

            setCount(Math.ceil(countResponse.data / itemsPerPage));
            setPage(targetPage);
        } catch (error) {
            console.error("Error refetching data:", error);
        }
    };

    const handleCheckboxChange = (event, product_code) => {
        if (event.target.checked) {
            setSelected([...selected, product_code]);
        } else {
            setSelected(selected.filter((item) => item !== product_code));
        }
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            // Use productAllTypeproduct instead of product
            const newSelected = productAllTypeproduct.map((row) => row.product_code);
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
                            // Use current page instead of resetting to page 1
                            refetchData(page);
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

    // 2. Fix the handleDeleteSelected function
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
                            // Use current page instead of resetting to page 1
                            refetchData(page);
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

    const toggleDrawer = (openDrawer) => () => {
        setOpenDrawer(openDrawer);
        handleGetLastCode();
    };

    const toggleEditDrawer = (openEditDrawer) => () => {
        setOpenEditDrawer(openEditDrawer);
    };

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
                // Use current page instead of resetting to page 1
                refetchData(page);
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
            tax1: 'N',
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
        // Update the onSubmit function in formik configuration
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

                try {
                    await dispatch(addProduct(values)).unwrap();

                    // Show success message
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Product added successfully',
                        timer: 1500,
                        showConfirmButton: false,
                    });

                    // Update data with current type selection
                    const [productResponse, countResponse] = await Promise.all([
                        dispatch(productAlltypeproduct({
                            typeproduct_code: selectedTypeProduct || null,
                            offset: (page - 1) * itemsPerPage,
                            limit: itemsPerPage
                        })).unwrap(),
                        dispatch(countProduct({
                            typeproduct_code: selectedTypeProduct || null
                        })).unwrap()
                    ]);

                    // Update table data
                    if (productResponse.data) {
                        const productsWithIds = productResponse.data.map((item, index) => ({
                            ...item,
                            id: ((page - 1) * itemsPerPage) + index + 1
                        }));
                        setProductAllTypeproduct(productsWithIds);
                    }

                    // Update page count
                    if (countResponse.data) {
                        setCount(Math.ceil(countResponse.data / itemsPerPage));
                    }

                    formik.resetForm();
                    setOpenDrawer(false);

                } catch (err) {
                    // Check for duplicate product name error
                    if (err.message && err.message.includes('Product name already exists')) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Duplicate Product Name',
                            text: 'This product name already exists. Please use a different name.',
                            confirmButtonText: 'OK',
                            didOpen: () => {
                                const container = Swal.getContainer();
                                container.style.zIndex = "2000"; // กำหนดให้สูงกว่า z-index ของ Drawer
                            }
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Failed to save product. Please try again.',
                            timer: 3000,
                            showConfirmButton: false,
                        });
                    }
                }
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

    const handleCancelCreate = () => {
        formik.resetForm();
        setOpenDrawer(false);
    };

    const handleCancelEdit = () => {
        formik.resetForm();
        setOpenEditDrawer(false);
    };

    const handleRefresh = () => {
        setSearchTerm("");
        setSelectedTypeProduct("");
        setPage(1);
        refetchData(1);
    };

    const handleExportPdf = async () => {
        try {
            // Show loading message
            Swal.fire({
                title: 'Generating PDF',
                text: 'Please wait while we prepare your document...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Always fetch all data for PDF export, regardless of current pagination or filter
            const response = await dispatch(productAlltypeproduct({
                typeproduct_code: selectedTypeProduct || null,
                product_name: searchTerm || null,
                offset: 0,
                limit: 99999 // A large number to get all records
            })).unwrap();

            // Check if we have data to export
            if (!response.data || response.data.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No Data',
                    text: 'There is no data to export to PDF',
                    confirmButtonColor: '#754C27'
                });
                return;
            }

            // Prepare data with IDs
            const allProductsWithIds = response.data.map((item, index) => ({
                ...item,
                id: index + 1
            }));

            // Export the data to PDF
            await exportToPdfProduct(allProductsWithIds, selectedTypeProduct);

            // Close loading dialog on success
            Swal.close();

        } catch (error) {
            console.error("Error exporting to PDF:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to export to PDF. Please try again later.',
                confirmButtonColor: '#754C27'
            });
        }
    };

    const handleOpenBarcodeModal = async () => {
        setLoadingBarcode(true);
        setOpenBarcodeModal(true);
        setSearchTermBarcode(''); // รีเซ็ตค่าการค้นหา
        setBarcodeModalPage(1); // รีเซ็ตหน้าเป็นหน้าแรก

        try {
            // โหลดข้อมูลจำนวนสินค้าทั้งหมดเพื่อคำนวณจำนวนหน้าทั้งหมด
            const countResponse = await dispatch(countProduct({
                typeproduct_code: selectedTypeProduct || null
            })).unwrap();

            if (countResponse.data) {
                setTotalBarcodePages(Math.ceil(countResponse.data / barcodeItemsPerPage));
            } else {
                setTotalBarcodePages(0);
            }

            // โหลดข้อมูลหน้าแรก
            const response = await dispatch(productAlltypeproduct({
                typeproduct_code: selectedTypeProduct || null,
                offset: 0,
                limit: barcodeItemsPerPage
            })).unwrap();

            if (response.data && response.data.length > 0) {
                // Sort the products alphabetically
                const sortedProducts = sortProductsAlphabetically(response.data);

                // Add IDs to sorted products
                const productsWithIds = sortedProducts.map((item, index) => ({
                    ...item,
                    id: index + 1
                }));

                setBarcodeProducts(productsWithIds);
                setFilteredBarcodeProducts(productsWithIds);

                // Initialize barcode counts for each product
                const initialCounts = {};
                productsWithIds.forEach(product => {
                    initialCounts[product.product_code] = 1;
                });
                setBarcodeCount(initialCounts);

                // รีเซ็ตการเลือกสินค้า
                setSelectedBarcodeProducts([]);
            } else {
                setBarcodeProducts([]);
                setFilteredBarcodeProducts([]);
                setBarcodeCount({});
            }
        } catch (error) {
            console.error('Error preparing products for barcode printing:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to prepare products. Please try again.',
                confirmButtonColor: '#754C27'
            });
            setOpenBarcodeModal(false);
        } finally {
            setLoadingBarcode(false);

            // ตั้งโฟกัสที่ช่องค้นหาหลังจากโหลดเสร็จ
            setTimeout(() => {
                if (searchBarcodeInputRef.current) {
                    searchBarcodeInputRef.current.focus();
                }
            }, 100); 
        }
    };

    const loadBarcodeProductsPage = async (page) => {
        setLoadingBarcode(true);

        try {
            const offset = (page - 1) * barcodeItemsPerPage;

            const response = await dispatch(productAlltypeproduct({
                typeproduct_code: selectedTypeProduct || null,
                product_name: searchTermBarcode || null,
                offset: offset,
                limit: barcodeItemsPerPage
            })).unwrap();

            if (response.data && response.data.length > 0) {
                // Create a deep copy to avoid reference issues
                const productsCopy = JSON.parse(JSON.stringify(response.data));

                // Sort products alphabetically by name
                const sortedProducts = sortProductsAlphabetically(productsCopy);

                // Add IDs to sorted products
                const productsWithIds = sortedProducts.map((item, index) => ({
                    ...item,
                    id: offset + index + 1
                }));

                // Store loaded data
                setBarcodeProducts(productsWithIds);
                setFilteredBarcodeProducts(productsWithIds);

                // Initialize barcode counts for each product
                const initialCounts = {};
                productsWithIds.forEach(product => {
                    // ตรวจสอบว่ามีค่าเดิมหรือไม่ ถ้ามีให้ใช้ค่าเดิม ไม่มีตั้งเป็น 1
                    initialCounts[product.product_code] =
                        barcodeCount[product.product_code] || 1;
                });
                setBarcodeCount(prevCounts => ({ ...prevCounts, ...initialCounts }));

                // Update current page
                setBarcodeModalPage(page);
            } else {
                setBarcodeProducts([]);
                setFilteredBarcodeProducts([]);
            }
        } catch (error) {
            console.error('Error loading barcode products page:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load products. Please try again.',
                confirmButtonColor: '#754C27'
            });
        } finally {
            setLoadingBarcode(false);
        }
    };

    const handleBarcodeSearchChange = (e) => {
        const value = e.target.value;
        setSearchTermBarcode(value);

        // ใช้ debounce เหมือนในฟังก์ชัน handleSearchChange เดิมของหน้าแรก
        const delayDebounceFn = setTimeout(async () => {
            setBarcodeSearchLoading(true);

            try {
                // คำนวณจำนวนหน้าใหม่ตามผลการค้นหา
                const countResponse = await dispatch(countProduct({
                    typeproduct_code: selectedTypeProduct || null,
                    product_name: value
                })).unwrap();

                if (countResponse.data) {
                    setTotalBarcodePages(Math.ceil(countResponse.data / barcodeItemsPerPage));
                } else {
                    setTotalBarcodePages(0);
                }

                // โหลดข้อมูลหน้าแรกตามคำค้นหา
                const response = await dispatch(productAlltypeproduct({
                    typeproduct_code: selectedTypeProduct || null,
                    product_name: value || null,
                    offset: 0,
                    limit: barcodeItemsPerPage
                })).unwrap();

                if (response.data && response.data.length > 0) {
                    // Sort the products alphabetically
                    const sortedProducts = sortProductsAlphabetically(response.data);

                    // Add IDs to sorted products
                    const productsWithIds = sortedProducts.map((item, index) => ({
                        ...item,
                        id: index + 1
                    }));

                    setBarcodeProducts(productsWithIds);
                    setFilteredBarcodeProducts(productsWithIds);

                    // รักษาค่า barcodeCount เดิมและอัปเดตเฉพาะสินค้าใหม่
                    const initialCounts = {};
                    productsWithIds.forEach(product => {
                        if (!barcodeCount[product.product_code]) {
                            initialCounts[product.product_code] = 1;
                        }
                    });
                    setBarcodeCount(prevCounts => ({ ...prevCounts, ...initialCounts }));
                } else {
                    setBarcodeProducts([]);
                    setFilteredBarcodeProducts([]);
                }

                // รีเซ็ตหน้าเป็นหน้าแรกเมื่อค้นหา
                setBarcodeModalPage(1);

            } catch (error) {
                console.error("Error searching barcode products:", error);
            } finally {
                setBarcodeSearchLoading(false);

                // คงโฟกัสไว้ที่ช่องค้นหา
                if (searchBarcodeInputRef.current) {
                    searchBarcodeInputRef.current.focus();
                }
            }
        }, 300); // รอ 300ms เหมือนในหน้าแรก

        return () => clearTimeout(delayDebounceFn);
    };

    const handleSelectBarcodeProduct = (event, productCode) => {
        if (event.target.checked) {
            setSelectedBarcodeProducts([...selectedBarcodeProducts, productCode]);
        } else {
            setSelectedBarcodeProducts(selectedBarcodeProducts.filter(code => code !== productCode));
        }
    };

    const handleSelectAllBarcodes = (event) => {
        if (event.target.checked) {
            setSelectedBarcodeProducts(filteredBarcodeProducts.map(product => product.product_code));
        } else {
            setSelectedBarcodeProducts([]);
        }
    };

    const handleBarcodeCountChange = (productCode, value) => {
        // Ensure count is a positive integer
        const count = Math.max(1, parseInt(value) || 1);
        setBarcodeCount(prev => ({
            ...prev,
            [productCode]: count
        }));
    };

    const handleCloseBarcodeModal = () => {
        setOpenBarcodeModal(false);
        setSearchTermBarcode('');
        setSelectedBarcodeProducts([]);
        // Don't clear barcodeProducts as it could be reused
    };

    const handleBarcodePageChange = (event, value) => {
        loadBarcodeProductsPage(value);
    };

    // ส่วนที่ 6: แก้ไขฟังก์ชัน handlePrintBarcodes
    const handlePrintBarcodes = async () => {
        try {
            if (selectedBarcodeProducts.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No Products Selected',
                    text: 'Please select at least one product to print barcodes.',
                    confirmButtonColor: '#754C27'
                });
                return;
            }

            // Show loading message
            Swal.fire({
                title: 'Generating Barcodes',
                text: 'Please wait while we prepare your barcodes...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // โหลดข้อมูลเพิ่มเติมของสินค้าที่เลือกที่อาจอยู่คนละหน้า
            const selectedProductsData = [];

            for (const productCode of selectedBarcodeProducts) {
                // ตรวจสอบว่าสินค้าอยู่ในหน้าปัจจุบันหรือไม่
                const existingProduct = barcodeProducts.find(p => p.product_code === productCode);

                if (existingProduct) {
                    selectedProductsData.push({
                        product_code: productCode,
                        product_name: existingProduct.product_name || 'Unknown Product',
                        count: barcodeCount[productCode] || 1
                    });
                } else {
                    // ถ้าไม่มีในหน้าปัจจุบัน ดึงข้อมูลเพิ่มเติม
                    try {
                        // ค้นหาสินค้าตาม product_code
                        const productResponse = await dispatch(searchProduct({
                            product_code: productCode
                        })).unwrap();

                        if (productResponse.data && productResponse.data.length > 0) {
                            const product = productResponse.data[0];
                            selectedProductsData.push({
                                product_code: productCode,
                                product_name: product.product_name || 'Unknown Product',
                                count: barcodeCount[productCode] || 1
                            });
                        }
                    } catch (err) {
                        console.error(`Error fetching product ${productCode}:`, err);
                    }
                }
            }

            // Generate PDF
            await generateBarcodePDF(selectedProductsData);

            // Close loading dialog on success
            Swal.close();

            // Close modal after successful print
            handleCloseBarcodeModal();

        } catch (error) {
            console.error('Error generating barcode PDF:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to generate barcode PDF. Please try again.',
                confirmButtonColor: '#754C27'
            });
        }
    };

    const performBarcodeSearch = async (searchValue) => {
        setBarcodeModalPage(1); // รีเซ็ตกลับไปหน้าแรกเมื่อค้นหา
        setLoadingBarcode(true);

        try {
            // คำนวณจำนวนหน้าใหม่ตามผลการค้นหา
            const countResponse = await dispatch(countProduct({
                typeproduct_code: selectedTypeProduct || null,
                product_name: searchValue
            })).unwrap();

            if (countResponse.data) {
                setTotalBarcodePages(Math.ceil(countResponse.data / barcodeItemsPerPage));
            }

            // โหลดข้อมูลหน้าแรกตามคำค้นหา
            const response = await dispatch(productAlltypeproduct({
                typeproduct_code: selectedTypeProduct || null,
                product_name: searchValue || null,
                offset: 0,
                limit: barcodeItemsPerPage
            })).unwrap();

            if (response.data && response.data.length > 0) {
                // Create a deep copy to avoid reference issues
                const productsCopy = JSON.parse(JSON.stringify(response.data));

                // Sort products alphabetically by name
                const sortedProducts = sortProductsAlphabetically(productsCopy);

                // Add IDs to sorted products
                const productsWithIds = sortedProducts.map((item, index) => ({
                    ...item,
                    id: index + 1
                }));

                // Store loaded data
                setBarcodeProducts(productsWithIds);
                setFilteredBarcodeProducts(productsWithIds);

                // Initialize barcode counts for each product
                const initialCounts = {};
                productsWithIds.forEach(product => {
                    initialCounts[product.product_code] =
                        barcodeCount[product.product_code] || 1;
                });
                setBarcodeCount(prevCounts => ({ ...prevCounts, ...initialCounts }));
            } else {
                setBarcodeProducts([]);
                setFilteredBarcodeProducts([]);
            }
        } catch (error) {
            console.error("Error searching products:", error);
        } finally {
            setLoadingBarcode(false);
        }
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
                        width: '80%'
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
                            value={selectedTypeProduct}
                            onChange={handleTypeChange}
                            displayEmpty // เพิ่ม prop นี้
                            size="small"
                            sx={{
                                height: '38px',
                                bgcolor: 'white',
                                ml: '24px'
                            }}
                        >
                            <MenuItem value="">All Types</MenuItem>
                            {typeproducts.map((type) => (
                                <MenuItem key={type.typeproduct_code} value={type.typeproduct_code}>
                                    {type.typeproduct_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        onClick={handleExportPdf}
                        sx={{
                            height: '38px',
                            background: 'linear-gradient(180deg, #AD7A2C 0%, #754C27 100%)',
                            borderRadius: '5px',
                            boxShadow: '0px 4px 4px 0px #00000040',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            '&:hover': {
                                background: 'linear-gradient(180deg, #8C5D1E 0%, #5D3A1F 100%)',
                            },
                            ml: '24px'
                        }}
                    >
                        <PictureAsPdfIcon sx={{ fontSize: '20px', color: '#FFFFFF', mr: '12px' }} />
                        <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#FFFFFF' }}>
                            PDF
                        </Typography>
                    </Button>

                    {/* Barcode Print Button */}
                    <Button
                        onClick={handleOpenBarcodeModal}
                        sx={{
                            height: '38px',
                            background: 'linear-gradient(180deg, #AD7A2C 0%, #754C27 100%)',
                            borderRadius: '5px',
                            boxShadow: '0px 4px 4px 0px #00000040',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            '&:hover': {
                                background: 'linear-gradient(180deg, #8C5D1E 0%, #5D3A1F 100%)',
                            },
                            ml: '24px'
                        }}
                    >
                        <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#FFFFFF' }}>
                            Barcode
                        </Typography>
                    </Button>
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
                                        indeterminate={selected.length > 0 && selected.length < productAllTypeproduct.length}
                                        checked={productAllTypeproduct.length > 0 && selected.length === productAllTypeproduct.length}
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
                                {typeproducts
                                    .sort((a, b) => a.typeproduct_name.localeCompare(b.typeproduct_name))
                                    .map((item) => (
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
                                <option value="N">No</option>
                                <option value="Y">Yes</option>
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

            {/* Backdrop Loading for Barcode data */}
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: 9999,
                    flexDirection: 'column'
                }}
                open={loadingBarcode}
            >
                <CircularProgress
                    color="inherit"
                    size={60}
                    thickness={4}
                    sx={{ mb: 2 }}
                />
                <Box sx={{
                    p: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 2,
                    textAlign: 'center',
                    maxWidth: 400
                }}>
                    <Typography variant="h6" sx={{ color: '#754C27', fontWeight: 'bold' }}>
                        Loading Products
                    </Typography>
                    <Typography sx={{ color: '#754C27', mt: 1 }}>
                        Please wait while we prepare data for barcode printing...
                    </Typography>
                </Box>
            </Backdrop>

            {/* Modal ส่วนของ Barcode - ปรับปรุงเพิ่ม Pagination */}
            <Modal
                open={openBarcodeModal}
                onClose={handleCloseBarcodeModal}
                aria-labelledby="barcode-print-modal-title"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '70%',
                    maxHeight: '80vh',
                    bgcolor: 'background.paper',
                    borderRadius: '10px',
                    boxShadow: 24,
                    p: 4,
                    overflow: 'auto'
                }}>
                    <Typography id="barcode-print-modal-title" variant="h6" component="h2" sx={{ mb: 2, color: '#754C27', fontWeight: 'bold' }}>
                        Print Product Barcodes
                    </Typography>

                    {/* Search and Actions */}
                    <Box sx={{ display: 'flex', mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                        <TextField
                            placeholder="Search products..."
                            value={searchTermBarcode}
                            onChange={handleBarcodeSearchChange}
                            sx={{ width: '50%' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#5A607F' }} />
                                    </InputAdornment>
                                ),
                            }}
                            disabled={loadingBarcode}
                        />

                        <Button
                            variant="contained"
                            startIcon={<PrintIcon />}
                            onClick={handlePrintBarcodes}
                            disabled={selectedBarcodeProducts.length === 0 || loadingBarcode}
                            sx={{
                                background: 'linear-gradient(180deg, #AD7A2C 0%, #754C27 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(180deg, #8C5D1E 0%, #5D3A1F 100%)',
                                }
                            }}
                        >
                            Print Selected ({selectedBarcodeProducts.length})
                        </Button>
                    </Box>

                    {/* Loading indicator within Modal */}
                    {loadingBarcode ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                            <CircularProgress sx={{ color: '#754C27' }} />
                            <Typography sx={{ ml: 2, color: '#754C27' }}>
                                Loading products...
                            </Typography>
                        </Box>
                    ) : (
                        /* Product Table */
                        <TableContainer component={Paper} sx={{ mb: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#754C27' }}>
                                        <TableCell padding="checkbox" sx={{ color: 'white' }}>
                                            <Checkbox
                                                indeterminate={selectedBarcodeProducts.length > 0 && selectedBarcodeProducts.length < filteredBarcodeProducts.length}
                                                checked={filteredBarcodeProducts.length > 0 && selectedBarcodeProducts.length === filteredBarcodeProducts.length}
                                                onChange={handleSelectAllBarcodes}
                                                sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: 'white' }}>Product ID</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Product Name</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Number of Barcodes</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredBarcodeProducts.map((product) => (
                                        <TableRow key={product.product_code}>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedBarcodeProducts.includes(product.product_code)}
                                                    onChange={(e) => handleSelectBarcodeProduct(e, product.product_code)}
                                                />
                                            </TableCell>
                                            <TableCell>{product.product_code}</TableCell>
                                            <TableCell>{product.product_name}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    value={barcodeCount[product.product_code] || 1}
                                                    onChange={(e) => handleBarcodeCountChange(product.product_code, e.target.value)}
                                                    inputProps={{ min: 1, max: 100 }}
                                                    disabled={!selectedBarcodeProducts.includes(product.product_code)}
                                                    size="small"
                                                    sx={{ width: '80px' }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredBarcodeProducts.length === 0 && !loadingBarcode && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">No products found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Pagination Component */}
                    {!loadingBarcode && filteredBarcodeProducts.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
                            <Stack spacing={2}>
                                <Pagination
                                    count={totalBarcodePages}
                                    page={barcodeModalPage}
                                    onChange={handleBarcodePageChange}
                                    shape="rounded"
                                />
                            </Stack>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            onClick={handleCloseBarcodeModal}
                            variant="contained"
                            disabled={loadingBarcode}
                            sx={{
                                bgcolor: '#F62626',
                                '&:hover': {
                                    bgcolor: '#D32F2F',
                                }
                            }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
}
