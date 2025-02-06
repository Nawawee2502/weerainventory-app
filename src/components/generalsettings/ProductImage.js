import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Drawer,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Pagination,
    Stack
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { updateProductImage, searchProductsForImage } from '../../api/productrecordApi';
import { fetchAllTypeproducts } from '../../api/producttypeApi';
import Swal from 'sweetalert2';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import { tableCellClasses } from '@mui/material/TableCell';
import { styled } from '@mui/material/styles';

// Styled Components
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

export default function ProductImage() {
    const dispatch = useDispatch();
    const [products, setProducts] = useState([]);
    const [typeproducts, setTypeproducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [imageErrors, setImageErrors] = useState({});
    const itemsPerPage = 10;

    useEffect(() => {
        loadData();
    }, [page, searchTerm, selectedType]);

    const loadData = async () => {
        try {
            const typeResponse = await dispatch(fetchAllTypeproducts({})).unwrap();
            setTypeproducts(typeResponse.data);

            const offset = (page - 1) * itemsPerPage;
            const productsResponse = await dispatch(searchProductsForImage({
                typeproduct_code: selectedType || null,
                product_name: searchTerm || null,
                offset,
                limit: itemsPerPage
            })).unwrap();

            if (productsResponse.data) {
                setProducts(productsResponse.data);
                setTotalPages(Math.ceil(productsResponse.total / itemsPerPage));
            }
        } catch (error) {
            console.error("Error loading data:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error loading data',
                text: error.message,
                timer: 3000
            });
        }
    };

    const handleImageUpload = async (product_code, file) => {
        if (!product_code || !file) return;

        try {
            const response = await dispatch(updateProductImage({
                product_code,
                image: file  // ส่ง File object โดยตรง
            })).unwrap();

            if (response.result) {
                Swal.fire({
                    icon: 'success',
                    title: 'Image uploaded successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
                loadData();
                setSelectedProduct(null);
            }
        } catch (error) {
            console.error('Upload error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Upload failed',
                text: error.message,
                timer: 3000
            });
        }
    };

    const renderProductImage = (product, size = 'small') => {
        // ถ้าไม่มีรูป
        if (!product?.product_img) {
            return (
                <Box sx={{
                    width: size === 'small' ? 50 : 200,
                    height: size === 'small' ? 50 : 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: size === 'small' ? 1 : 2
                }}>
                    No Image
                </Box>
            );
        }

        // ตรวจสอบว่ารูปนี้เคย error แล้วหรือไม่
        if (imageErrors[product.product_code]) {
            return (
                <Box sx={{
                    width: size === 'small' ? 50 : 200,
                    height: size === 'small' ? 50 : 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: size === 'small' ? 1 : 2
                }}>
                    Image Error
                </Box>
            );
        }

        const baseUrl = process.env.REACT_APP_URL_API || 'http://localhost:4001';
        const imageUrl = `${baseUrl}/public/images/${product.product_img}`;
        console.log('Loading image from:', imageUrl);

        return (
            <Box sx={{
                width: size === 'small' ? 50 : 200,
                height: size === 'small' ? 50 : 200,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <img
                    src={imageUrl}
                    alt={product.product_name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: size === 'small' ? '4px' : '8px'
                    }}
                    onError={(e) => {
                        console.error('Image load error:', imageUrl);
                        setImageErrors(prev => ({
                            ...prev,
                            [product.product_code]: true
                        }));
                    }}
                />
            </Box>
        );
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search product name"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <FormControl sx={{ minWidth: 200 }}>
                    <Select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        displayEmpty
                    >
                        <MenuItem value="">All Types</MenuItem>
                        {typeproducts.map((type) => (
                            <MenuItem key={type.typeproduct_code} value={type.typeproduct_code}>
                                {type.typeproduct_name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>No.</StyledTableCell>
                            <StyledTableCell>Product Code</StyledTableCell>
                            <StyledTableCell>Product Name6</StyledTableCell>
                            <StyledTableCell>Image</StyledTableCell>
                            <StyledTableCell>Action</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product, index) => (
                            <StyledTableRow key={product.product_code}>
                                <StyledTableCell>{(page - 1) * itemsPerPage + index + 1}</StyledTableCell>
                                <StyledTableCell>{product.product_code}</StyledTableCell>
                                <StyledTableCell>{product.product_name}</StyledTableCell>
                                <StyledTableCell>
                                    {renderProductImage(product, 'small')}
                                </StyledTableCell>
                                <StyledTableCell>
                                    <IconButton
                                        onClick={() => setSelectedProduct(product)}
                                        sx={{ border: '1px solid #AD7A2C' }}
                                    >
                                        <EditIcon sx={{ color: '#AD7A2C' }} />
                                    </IconButton>
                                </StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Stack spacing={2} sx={{ mt: 2 }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                />
            </Stack>

            <Drawer
                anchor="right"
                open={Boolean(selectedProduct)}
                onClose={() => setSelectedProduct(null)}
                PaperProps={{
                    sx: { width: '25%' }
                }}
            >
                {selectedProduct && (
                    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Update Product Image</Typography>
                        <Typography sx={{ mb: 2 }}>{selectedProduct.product_name}</Typography>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1">Current Image</Typography>
                            {renderProductImage(selectedProduct, 'large')}
                        </Box>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && selectedProduct?.product_code) {
                                    handleImageUpload(selectedProduct.product_code, file);
                                }
                            }}
                        />
                    </Box>
                )}
            </Drawer>
        </Box>
    );
}