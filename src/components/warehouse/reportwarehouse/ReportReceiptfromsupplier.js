import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Grid2, Button } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Switch, Divider } from '@mui/material';
import { useDispatch } from 'react-redux';
import { queryWh_stockcard } from '../../../api/warehouse/wh_stockcard';
import Swal from 'sweetalert2';

export default function ReportMonthlyStockCard() {
    const dispatch = useDispatch();
    const today = new Date();

    // State
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [productSearch, setProductSearch] = useState('');
    const [stockcardData, setStockcardData] = useState([]);
    const [excludePrice, setExcludePrice] = useState(false);
    const [loading, setLoading] = useState(false);

    // Date formatting functions
    const formatDateForApi = (date) => {
        return date.toISOString().split('T')[0].replace(/-/g, '');
    };

    const formatDisplayDate = (date) => {
        return new Date(date).toLocaleDateString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Data fetching function
    const fetchData = async (params) => {
        try {
            setLoading(true);
            const response = await dispatch(queryWh_stockcard(params)).unwrap();
            if (response.result) {
                setStockcardData(response.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to fetch data',
                confirmButtonColor: '#754C27'
            });
        } finally {
            setLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        const initialParams = {
            offset: 0,
            limit: 10000,
            rdate1: formatDateForApi(today),
            rdate2: formatDateForApi(today)
        };
        fetchData(initialParams);
    }, []);

    // Event handlers
    const handleDateChange = (type, date) => {
        if (type === 'start') {
            setStartDate(date);
            if (date && endDate) handleSearch(date, endDate);
        } else {
            setEndDate(date);
            if (startDate && date) handleSearch(startDate, date);
        }
    };

    const handleSearch = async () => {
        const params = {
            offset: 0,
            limit: 10000,
            rdate1: formatDateForApi(startDate),
            rdate2: formatDateForApi(endDate)
        };

        if (productSearch) {
            params.product_name = productSearch;
        }

        await fetchData(params);
    };

    // Export handlers
    const handleExportExcel = () => {
        if (stockcardData.length === 0) {
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
        if (stockcardData.length === 0) {
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
                                    onChange={(date) => handleDateChange('start', date)}
                                    dateFormat="dd/MM/yyyy"
                                    customInput={
                                        <TextField
                                            size="small"
                                            fullWidth
                                            sx={{
                                                mt: '8px',
                                                width: '80%',
                                                '& .MuiInputBase-root': { width: '100%' },
                                                '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'white' },
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
                                    onChange={(date) => handleDateChange('end', date)}
                                    dateFormat="dd/MM/yyyy"
                                    customInput={
                                        <TextField
                                            size="small"
                                            fullWidth
                                            sx={{
                                                mt: '8px',
                                                width: '80%',
                                                '& .MuiInputBase-root': { width: '100%' },
                                                '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'white' },
                                            }}
                                        />
                                    }
                                />
                            </Grid2>

                            {/* Product Search */}
                            <Grid2 item size={{ xs: 12, md: 12 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Product
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        placeholder="Search..."
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                bgcolor: 'white'
                                            },
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleSearch}
                                        sx={{
                                            bgcolor: '#754C27',
                                            color: 'white',
                                            '&:hover': { bgcolor: '#5c3c1f' },
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
                {/* Title */}
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
                        Monthly Stock Card Report
                    </Typography>
                </Box>

                <Box sx={{ width: '100%' }}>
                    {/* Controls */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        {/* Date Display */}
                        <Box sx={{ display: 'flex' }}>
                            <Box>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C' }}>
                                    Date
                                </Typography>
                            </Box>
                            <Box sx={{ ml: '8px' }}>
                                <Typography>
                                    {`${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Export Controls */}
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
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>No.</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Date</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Ref.no</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Product</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Beg</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>In</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Out</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Update</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Unit Price</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Amount</th>
                                </tr>
                                <tr>
                                    <td colSpan="10">
                                        <Divider style={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                                    </tr>
                                ) : stockcardData.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>No data found</td>
                                    </tr>
                                ) : (
                                    stockcardData.map((item, index) => (
                                        <tr key={`${item.refno}-${index}`}>
                                            <td style={{ padding: '8px 16px' }}>{index + 1}</td>
                                            <td style={{ padding: '8px 16px' }}>{formatDisplayDate(item.rdate)}</td>
                                            <td style={{ padding: '8px 16px' }}>{item.refno}</td>
                                            <td style={{ padding: '8px 16px' }}>{item.tbl_product?.product_name}</td>
                                            <td style={{ padding: '8px 16px' }}>{item.beg1}</td>
                                            <td style={{ padding: '8px 16px' }}>{item.in1}</td>
                                            <td style={{ padding: '8px 16px' }}>{item.out1}</td>
                                            <td style={{ padding: '8px 16px' }}>{item.upd1}</td>
                                            <td style={{ padding: '8px 16px' }}>
                                                {!excludePrice ? item.uprice?.toFixed(2) : '-'}
                                            </td>
                                            <td style={{ padding: '8px 16px' }}>
                                                {!excludePrice ? item.beg1_amt?.toFixed(2) : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {stockcardData.length > 0 && (
                                <tfoot>
                                    <tr>
                                        <td colSpan="10">
                                            <Divider style={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 'bold', color: '#754C27' }}>
                                            Total:
                                        </td>
                                        <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#754C27' }}>
                                            {!excludePrice ? stockcardData.reduce((sum, item) => sum + (item.uprice || 0), 0).toFixed(2) : '-'}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#754C27' }}>
                                            {!excludePrice ? stockcardData.reduce((sum, item) => sum + (item.beg1_amt || 0), 0).toFixed(2) : '-'}
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
