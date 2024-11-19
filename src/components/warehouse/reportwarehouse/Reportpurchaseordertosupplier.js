import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Grid2, Button } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Checkbox, Switch, Divider } from '@mui/material';
import { wh_posAlljoindt } from '../../../api/warehouse/wh_posApi';
import { useDispatch } from 'react-redux';
import { exportToExcelWhPos } from './ExportExcelPurchaseordertosupplier';
import { supplierAll } from '../../../api/supplierApi';
import { branchAll } from '../../../api/branchApi';

export default function ReportPurchaseordertosupplier() {
    const [whposData, setWhposData] = useState([]);
    const [excludePrice, setExcludePrice] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [searchProduct, setSearchProduct] = useState('');
    const dispatch = useDispatch();

    useEffect(() => {
        handleSearch();
    }, []);

    const formatDate = (date) => {
        if (!date) return null;
        return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    };

    // ฟังก์ชันเรียกข้อมูล
    const fetchData = async (params) => {
        try {
            const response = await dispatch(wh_posAlljoindt(params)).unwrap();
            console.log("API Response:", response);

            if (response.data) {
                const flattenedData = response.data.flatMap(order =>
                    order.wh_posdts.map(detail => ({
                        date: order.rdate,
                        refno: order.refno,
                        supplier_code: order.tbl_supplier?.supplier_name,
                        branch_code: order.tbl_branch?.branch_name,
                        product_code: detail.product_code,
                        product_name: detail.tbl_product?.product_name,
                        quantity: detail.qty,
                        unit_price: detail.uprice,
                        unit_code: detail.tbl_unit?.unit_name,
                        amount: detail.amt,
                        total: order.total,
                        user_code: order.user?.username
                    }))
                );
                setWhposData(flattenedData);
            } else {
                setWhposData([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setWhposData([]);
        }
    };

    // useEffect สำหรับโหลดข้อมูลครั้งแรก
    useEffect(() => {
        fetchData({
            offset: 0,
            limit: 10000
        });
        dispatch(supplierAll({ offset: 0, limit: 1000 }))
            .unwrap()
            .then(res => {
                setSuppliers(res.data);
            })
            .catch(err => console.error("Error fetching suppliers:", err));

        // ดึงข้อมูล branch
        dispatch(branchAll({ offset: 0, limit: 1000 }))
            .unwrap()
            .then(res => {
                setBranches(res.data);
            })
            .catch(err => console.error("Error fetching branches:", err));
    }, []);

    const handleDateChange = (type, date) => {
        if (type === 'start') {
            setStartDate(date);
            if (date && endDate) {
                const params = {
                    offset: 0,
                    limit: 10000,
                    rdate1: formatDate(date),
                    rdate2: formatDate(endDate)
                };
                console.log("Search with params:", params);
                fetchData(params);
            }
        } else {
            setEndDate(date);
            if (startDate && date) {
                const params = {
                    offset: 0,
                    limit: 10000,
                    rdate1: formatDate(startDate),
                    rdate2: formatDate(date)
                };
                console.log("Search with params:", params);
                fetchData(params);
            }
        }
    };

    const handleSearch = (productSearch = searchProduct) => {
        let params = {
            offset: 0,
            limit: 10000
        };

        if (startDate && endDate) {
            params.rdate1 = formatDate(startDate);
            params.rdate2 = formatDate(endDate);
        }

        if (selectedSupplier) params.supplier_code = selectedSupplier;
        if (selectedBranch) params.branch_code = selectedBranch;
        if (selectedProduct) params.product_code = selectedProduct;
        if (productSearch) params.product_code = productSearch;

        fetchData(params);


        dispatch(wh_posAlljoindt(params))
            .unwrap()
            .then(res => {

                if (!res.data) {
                    console.log('No data in response');
                    setWhposData([]);
                    return;
                }

                const flattenedData = res.data.flatMap(order =>
                    order.wh_posdts.map(detail => ({
                        date: order.rdate,
                        refno: order.refno,
                        supplier_code: order.tbl_supplier?.supplier_name,
                        branch_code: order.tbl_branch?.branch_name,
                        product_code: detail.product_code,
                        product_name: detail.tbl_product?.product_name,
                        quantity: detail.qty,
                        unit_price: detail.uprice,
                        unit_code: detail.tbl_unit?.unit_name,
                        amount: detail.amt,
                        total: order.total,
                        user_code: order.user?.username
                    }))
                );

                console.log('Flattened Data:', flattenedData); 
                setWhposData(flattenedData);
            })
            .catch(err => {
                console.error("Error fetching data:", err);
            });
    };

    return (
        <Box sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            bgcolor: 'white',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: '#F8F8F8'
        }}>
            <Box sx={{
                width: '70%',
                mt: '10px',
                flexDirection: 'column'
            }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        bgcolor: '#FFFFFF',
                        height: '100%',
                        p: '16px',
                        position: 'relative',
                        zIndex: 2,
                        mb: '50px',
                        bgcolor: '#F8F8F8'
                    }}
                >
                    <Box sx={{ width: '90%', mt: '24px' }}>
                        <Grid2 container spacing={2}>
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    From Date
                                </Typography>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => handleDateChange('start', date)}
                                    selectsStart
                                    startDate={startDate}
                                    endDate={endDate}
                                    dateFormat="dd/MM/yyyy"
                                    isClearable
                                    placeholderText="Select start date"
                                    customInput={
                                        <TextField
                                            size="small"
                                            fullWidth
                                            sx={{
                                                mt: '8px',
                                                width: '80%',
                                                '& .MuiInputBase-root': {
                                                    width: '100%',
                                                },
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '10px',
                                                },
                                            }}
                                        />
                                    }
                                />
                            </Grid2>
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    To Date
                                </Typography>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => handleDateChange('end', date)}
                                    selectsEnd
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={startDate}
                                    dateFormat="dd/MM/yyyy"
                                    isClearable
                                    placeholderText="Select end date"
                                    customInput={
                                        <TextField
                                            size="small"
                                            fullWidth
                                            sx={{
                                                mt: '8px',
                                                width: '80%',
                                                '& .MuiInputBase-root': {
                                                    width: '100%',
                                                },
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '10px',
                                                },
                                            }}
                                        />
                                    }
                                />
                            </Grid2>
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Supplier
                                </Typography>
                                <Box
                                    component="select"
                                    value={selectedSupplier}
                                    onChange={(e) => {
                                        setSelectedSupplier(e.target.value);
                                        handleSearch(); 
                                    }}
                                    sx={{
                                        mt: '8px',
                                        width: '100%',
                                        height: '40px',
                                        borderRadius: '10px',
                                        padding: '0 14px',
                                        border: '1px solid rgba(0, 0, 0, 0.23)',
                                        fontSize: '16px',
                                        '&:focus': {
                                            outline: 'none',
                                            borderColor: '#754C27',
                                        },
                                        '& option': {
                                            fontSize: '16px',
                                        },
                                    }}
                                    id="supplier"
                                >
                                    <option value="">Select a supplier</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.supplier_code} value={supplier.supplier_code}>
                                            {supplier.supplier_name}
                                        </option>
                                    ))}
                                </Box>
                            </Grid2>
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Branch
                                </Typography>
                                <Box
                                    component="select"
                                    value={selectedBranch}
                                    onChange={(e) => {
                                        setSelectedBranch(e.target.value);
                                        handleSearch();  // เรียก search ทันทีเมื่อเลือก branch
                                    }}
                                    sx={{
                                        mt: '8px',
                                        width: '100%',
                                        height: '40px',
                                        borderRadius: '10px',
                                        padding: '0 14px',
                                        border: '1px solid rgba(0, 0, 0, 0.23)',
                                        fontSize: '16px',
                                        '&:focus': {
                                            outline: 'none',
                                            borderColor: '#754C27',
                                        },
                                        '& option': {
                                            fontSize: '16px',
                                        },
                                    }}
                                    id="Branch"
                                >
                                    <option value="">Select a branch</option>
                                    {branches.map(branch => (
                                        <option key={branch.branch_code} value={branch.branch_code}>
                                            {branch.branch_name}
                                        </option>
                                    ))}
                                </Box>

                            </Grid2>
                            <Grid2 item size={{ xs: 12, md: 12 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Product
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={searchProduct}
                                        onChange={(e) => {
                                            setSearchProduct(e.target.value);
                                            if (e.target.value === '') {
                                                // ถ้าลบค่าออกจนหมด ให้ search ใหม่
                                                handleSearch('');
                                            }
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearch(searchProduct);
                                            }
                                        }}
                                        placeholder="Search product name..."
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                            },
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={() => handleSearch(searchProduct)}
                                        sx={{
                                            bgcolor: '#754C27',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: '#5c3c1f',
                                            },
                                            borderRadius: '10px',
                                            minWidth: '100px'
                                        }}
                                    >
                                        Show
                                    </Button>
                                </Box>
                            </Grid2>
                        </Grid2>


                    </Box>
                </Box>


            </Box>


            <Box
                sx={{
                    width: '98%',
                    bgcolor: 'white',
                    p: '12px',
                    borderRadius: '24px',
                    mb: '24px',
                    position: 'relative', // เพิ่มเพื่อให้สามารถวาง Box หัวข้อแบบ absolute ได้
                    mt: '20px'
                }}
            >
                <Box sx={{
                    position: 'absolute',
                    top: '-20px', // ปรับตำแหน่งให้อยู่ด้านบนของ Box หลัก
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: '#EAB86C',
                    color: '#FFFFFF',
                    px: 3,
                    py: 2,
                    borderRadius: '8px',
                    zIndex: 3
                }}>
                    <Typography sx={{ fontWeight: 'bold', color: '#754C27' }}>
                        Purchase Order to Supplier
                    </Typography>
                </Box>
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex' }}>
                            <Box>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C' }}>
                                    Date
                                </Typography>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C' }}>
                                    Supplier
                                </Typography>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C' }}>
                                    Shop
                                </Typography>
                            </Box>
                            <Box sx={{ ml: '8px' }}>
                                <Typography>
                                    23/08/2567 - 25/08/2567
                                </Typography>
                                <Typography>
                                    Eleanor Pena
                                </Typography>
                                <Typography>
                                    Weera Thai
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Switch
                                    checked={excludePrice}
                                    onChange={(e) => setExcludePrice(e.target.checked)}
                                />
                                <Typography sx={{ fontWeight: '500', color: '#7E84A3' }}>
                                    Exclude price in file
                                </Typography>
                            </Box>
                            <Box>
                                <Button
                                    onClick={() => exportToExcelWhPos(whposData, excludePrice)}
                                    variant="outlined"
                                    sx={{
                                        color: '#754C27',
                                        borderColor: '#754C27',
                                        '&:hover': {
                                            borderColor: '#5c3c1f',
                                        }
                                    }}
                                >
                                    Export (Excel)
                                </Button>
                                <Button
                                    variant="outlined"
                                    sx={{
                                        color: '#754C27',
                                        borderColor: '#754C27',
                                        '&:hover': {
                                            borderColor: '#5c3c1f',
                                        },
                                        ml: '24px'
                                    }}
                                >
                                    PDF
                                </Button>
                            </Box>

                        </Box>
                    </Box>
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}>
                        <table style={{ width: '100%', marginTop: '24px' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>
                                        <Checkbox />
                                    </th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>No.</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Date</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Ref.no</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Supplier</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Branch</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>ID</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Product Name</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Quantity</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Unit Price</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Unit</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Amount</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Total</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Username</th>
                                </tr>
                                <tr>
                                    <td colSpan="15">
                                        <Divider sx={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                {whposData.map((row, index) => (
                                    <tr key={`${row.refno}-${row.product_code}`}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Checkbox />
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>{index + 1}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.date}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.refno}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.supplier_code}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.branch_code}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.product_code}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.product_name}</td> {/* เพิ่มชื่อสินค้า */}
                                        <td style={{ padding: '12px 16px' }}>{row.quantity}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.unit_price}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.unit_code}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.amount}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.total}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.user_code}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                </Box>
            </Box>
        </Box >
    );
}