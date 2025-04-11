import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Button, 
    Typography, 
    Modal, 
    TextField, 
    Checkbox, 
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import { productAll } from '../../api/productrecordApi';
import { useDispatch } from 'react-redux';
import { generateBarcodePDF } from './BarcodeGenerator';
import Swal from 'sweetalert2';

const style = {
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
};

export default function PrintBarcodeModal({ open, handleClose, preloadedProducts = [] }) {
    const dispatch = useDispatch();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [barcodeCount, setBarcodeCount] = useState({});
    const [loading, setLoading] = useState(false);

    // When Modal opens and has preloaded data
    useEffect(() => {
        if (open) {
            // If there's preloaded data, use it immediately
            if (preloadedProducts && preloadedProducts.length > 0) {
                processProductsData(preloadedProducts);
            } else {
                // If no preloaded data, fetch new data
                fetchProducts();
            }
        } else {
            // Reset state when Modal closes
            setSearchTerm('');
            setSelectedProducts([]);
        }
    }, [open, preloadedProducts]);

    // Function to process product data
    const processProductsData = (productsData) => {
        // Initialize barcode counts for each product
        const initialCounts = {};
        productsData.forEach(product => {
            initialCounts[product.product_code] = 1;
        });
        
        setProducts(productsData);
        setFilteredProducts(productsData);
        setBarcodeCount(initialCounts);
    };

    // Filter products when search term changes
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredProducts([...products]);
        } else {
            const searchTermLower = searchTerm.toLowerCase();
            const filtered = products.filter(product => 
                product.product_name.toLowerCase().includes(searchTermLower) ||
                product.product_code.toLowerCase().includes(searchTermLower)
            );
            setFilteredProducts([...filtered]);
        }
    }, [searchTerm, products]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await dispatch(productAll({ offset: 0, limit: 999999 })).unwrap();
            if (response && response.data) {
                // Create a deep copy of the products array to avoid reference issues
                const productsCopy = JSON.parse(JSON.stringify(response.data));
                
                // Sort products alphabetically by name (case-insensitive)
                const sortedProducts = productsCopy.sort((a, b) => 
                    (a.product_name || "").toLowerCase().localeCompare((b.product_name || "").toLowerCase())
                );
                
                processProductsData(sortedProducts);
            }
        } catch (error) {
            console.error('Error fetching products for barcode printing:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load products. Please try again.',
                confirmButtonColor: '#754C27'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSelectProduct = (event, productCode) => {
        if (event.target.checked) {
            setSelectedProducts([...selectedProducts, productCode]);
        } else {
            setSelectedProducts(selectedProducts.filter(code => code !== productCode));
        }
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedProducts(filteredProducts.map(product => product.product_code));
        } else {
            setSelectedProducts([]);
        }
    };

    const handleCountChange = (productCode, value) => {
        // Ensure count is a positive integer
        const count = Math.max(1, parseInt(value) || 1);
        setBarcodeCount(prev => ({
            ...prev,
            [productCode]: count
        }));
    };

    const handlePrintBarcodes = async () => {
        try {
            if (selectedProducts.length === 0) {
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

            // Prepare data for PDF generation - find product from original products array
            const printData = selectedProducts.map(productCode => {
                const product = products.find(p => p.product_code === productCode);
                if (!product) {
                    console.error('Product not found:', productCode);
                    return null;
                }
                return {
                    product_code: productCode,
                    product_name: product.product_name || 'Unknown Product',
                    count: barcodeCount[productCode] || 1
                };
            }).filter(item => item !== null); // Remove any null items

            // Generate PDF
            await generateBarcodePDF(printData);
            
            // Close loading dialog on success
            Swal.close();
            
            // Close modal after successful print
            handleClose();
            
            // Reset selections
            setSelectedProducts([]);
            
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

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="barcode-print-modal-title"
        >
            <Box sx={style}>
                <Typography id="barcode-print-modal-title" variant="h6" component="h2" sx={{ mb: 2, color: '#754C27', fontWeight: 'bold' }}>
                    Print Product Barcodes
                </Typography>
                
                {/* Search and Actions */}
                <Box sx={{ display: 'flex', mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                    <TextField
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        sx={{ width: '50%' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#5A607F' }} />
                                </InputAdornment>
                            ),
                        }}
                        disabled={loading}
                    />
                    
                    <Button
                        variant="contained"
                        startIcon={<PrintIcon />}
                        onClick={handlePrintBarcodes}
                        disabled={selectedProducts.length === 0 || loading}
                        sx={{
                            background: 'linear-gradient(180deg, #AD7A2C 0%, #754C27 100%)',
                            '&:hover': {
                                background: 'linear-gradient(180deg, #8C5D1E 0%, #5D3A1F 100%)',
                            }
                        }}
                    >
                        Print Selected ({selectedProducts.length})
                    </Button>
                </Box>
                
                {/* Loading indicator within Modal */}
                {loading ? (
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
                                            indeterminate={selectedProducts.length > 0 && selectedProducts.length < filteredProducts.length}
                                            checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                                            onChange={handleSelectAll}
                                            sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: 'white' }}>Product ID</TableCell>
                                    <TableCell sx={{ color: 'white' }}>Product Name</TableCell>
                                    <TableCell sx={{ color: 'white' }}>Number of Barcodes</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredProducts.map((product) => (
                                    <TableRow key={product.product_code}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedProducts.includes(product.product_code)}
                                                onChange={(e) => handleSelectProduct(e, product.product_code)}
                                            />
                                        </TableCell>
                                        <TableCell>{product.product_code}</TableCell>
                                        <TableCell>{product.product_name}</TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                value={barcodeCount[product.product_code] || 1}
                                                onChange={(e) => handleCountChange(product.product_code, e.target.value)}
                                                inputProps={{ min: 1, max: 100 }}
                                                disabled={!selectedProducts.includes(product.product_code)}
                                                size="small"
                                                sx={{ width: '80px' }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredProducts.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">No products found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button 
                        onClick={handleClose}
                        variant="contained"
                        disabled={loading}
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
    );
}