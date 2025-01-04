import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Grid2, Button } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Switch, Divider } from '@mui/material';
import { useDispatch } from 'react-redux';
import { queryWh_stockcard } from '../../../api/warehouse/wh_stockcard';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

export default function ReportMonthlyStockBalance() {
    const dispatch = useDispatch();
    const today = new Date();

    // States
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [stockBalanceData, setStockBalanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [excludePrice, setExcludePrice] = useState(false);


    // เพิ่ม useEffect นี้
    useEffect(() => {
        fetchStockBalance();
    }, [startDate, endDate]);

    // ลบ handleSearch ออกเพราะไม่ได้ใช้แล้ว

    // Format date functions
    const formatDateForApi = (date) => {
        return format(date, 'yyyyMMdd');
    };

    const formatDateForDisplay = (date) => {
        return format(new Date(date), 'dd/MM/yyyy');
    };

    const fetchStockBalance = async () => {
        try {
            setLoading(true);
            setError(null);
    
            const response = await dispatch(queryWh_stockcard({
                rdate1: formatDateForApi(startDate),
                rdate2: formatDateForApi(endDate),
                limit: 99999  // เพิ่มค่า limit สูงๆ เพื่อให้ได้ข้อมูลทั้งหมด
            })).unwrap();

            console.log("Data :", response);
    
            if (response.result) {
                setStockBalanceData(response.data);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch data');
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to fetch data',
                confirmButtonColor: '#754C27'
            });
        } finally {
            setLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        fetchStockBalance();
    }, []);

    // Handle search
    const handleSearch = () => {
        fetchStockBalance();
    };

    // Handle exports
    const handleExportExcel = () => {
        if (stockBalanceData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data',
                text: 'No data available to export',
                confirmButtonColor: '#754C27'
            });
            return;
        }
        // Add Excel export logic
    };

    const handleExportPdf = () => {
        if (stockBalanceData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data',
                text: 'No data available to export',
                confirmButtonColor: '#754C27'
            });
            return;
        }
        // Add PDF export logic
    };

    return (
        <Box sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: '#F8F8F8'
        }}>
            {/* Search Section */}
            <Box sx={{ width: '70%', mt: '10px', flexDirection: 'column' }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    bgcolor: '#F8F8F8',
                    height: '100%',
                    p: '16px',
                    position: 'relative',
                    zIndex: 2,
                    mb: '50px',
                }}>
                    <Box sx={{ width: '90%', mt: '24px' }}>
                        <Grid2 container spacing={2}>
                            {/* From Date */}
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    From Date
                                </Typography>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
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
                                                '& .MuiInputBase-root': { width: '100%' },
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '10px',
                                                    bgcolor: 'white'
                                                },
                                            }}
                                        />
                                    }
                                />
                            </Grid2>

                            {/* To Date */}
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    To Date
                                </Typography>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
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
                                                '& .MuiInputBase-root': { width: '100%' },
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '10px',
                                                    bgcolor: 'white'
                                                },
                                            }}
                                        />
                                    }
                                />
                            </Grid2>
                        </Grid2>
                    </Box>
                </Box>
            </Box>

            {/* Results Section */}
            <Box sx={{
                width: '98%',
                bgcolor: 'white',
                p: '12px',
                borderRadius: '24px',
                mb: '24px',
                position: 'relative',
                mt: '20px'
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: '#EAB86C',
                    px: 3,
                    py: 2,
                    borderRadius: '8px',
                    zIndex: 3
                }}>
                    <Typography sx={{ fontWeight: 'bold', color: '#754C27' }}>
                        Monthly stock balance
                    </Typography>
                </Box>

                <Box sx={{ width: '100%' }}>
                    {/* Controls */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex' }}>
                            <Box>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C' }}>
                                    Date
                                </Typography>
                            </Box>
                            <Box sx={{ ml: '8px' }}>
                                <Typography>
                                    {`${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`}
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
                                    variant="outlined"
                                    onClick={handleExportExcel}
                                    sx={{
                                        color: '#754C27',
                                        borderColor: '#754C27',
                                        '&:hover': { borderColor: '#5c3c1f' }
                                    }}
                                >
                                    Excel
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={handleExportPdf}
                                    sx={{
                                        color: '#754C27',
                                        borderColor: '#754C27',
                                        '&:hover': { borderColor: '#5c3c1f' },
                                        ml: '24px'
                                    }}
                                >
                                    PDF
                                </Button>
                            </Box>
                        </Box>
                    </Box>

                    {/* Table */}
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}>
                        <table style={{ width: '100%', marginTop: '24px' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>No</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Product</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Unit</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27' }}>Remainning</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27' }}>Total</th>
                                </tr>
                                <tr>
                                    <td colSpan="5">
                                        <Divider style={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</td>
                                    </tr>
                                ) : stockBalanceData.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No data found</td>
                                    </tr>
                                ) : (
                                    stockBalanceData.map((item, index) => {
                                        const remainingQty = (item.beg1 || 0) + (item.in1 || 0) +
                                            (item.upd1 || 0) - (item.out1 || 0);
                                        const totalAmount = remainingQty * (item.uprice || 0);
                                        return (
                                            <tr key={`${item.refno}-${index}`}>
                                                <td style={{ padding: '8px 16px' }}>{index + 1}</td>
                                                <td style={{ padding: '8px 16px' }}>{item.tbl_product.product_name}</td>
                                                <td style={{ padding: '8px 16px' }}>{item.tbl_unit.unit_name}</td>
                                                <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                                                    {remainingQty.toLocaleString()}
                                                </td>
                                                <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                                                    {!excludePrice ? totalAmount.toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }) : '-'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                            {stockBalanceData.length > 0 && (
                                <tfoot>
                                    <tr>
                                        <td colSpan="5">
                                            <Divider style={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 'bold', color: '#754C27' }}>
                                            Total:
                                        </td>
                                        <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#754C27', textAlign: 'right' }}>
                                            {stockBalanceData.reduce((sum, item) => {
                                                const qty = (item.beg1 || 0) + (item.in1 || 0) +
                                                    (item.upd1 || 0) - (item.out1 || 0);
                                                return sum + qty;
                                            }, 0).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#754C27', textAlign: 'right' }}>
                                            {!excludePrice ? stockBalanceData.reduce((sum, item) => {
                                                const qty = (item.beg1 || 0) + (item.in1 || 0) +
                                                    (item.upd1 || 0) - (item.out1 || 0);
                                                return sum + (qty * (item.uprice || 0));
                                            }, 0).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            }) : '-'}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}