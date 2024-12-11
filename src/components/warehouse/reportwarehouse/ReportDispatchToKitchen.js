import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Grid2, Button } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Switch, Divider } from '@mui/material';
import { useDispatch } from 'react-redux';
import { wh_dpkAlljoindt } from '../../../api/warehouse/wh_dpkApi';
import { kitchenAll } from '../../../api/kitchenApi';
import Swal from 'sweetalert2';
import { exportToExcelWhDpk } from './ExportExcelDispatchToKitchen';
import { exportToPdfWhDpk } from './ExportPdfDispatchToKitchen';
import PrintLayout from './PrintPreviewWhDpk';
import { createRoot } from 'react-dom/client';

export default function ReportDispatchToKitchen() {
    const today = new Date();
    const [dpkData, setDpkData] = useState([]);
    const [excludePrice, setExcludePrice] = useState(false);
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [selectedKitchen, setSelectedKitchen] = useState('');
    const [searchProduct, setSearchProduct] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [kitchens, setKitchens] = useState([]);

    const dispatch = useDispatch();

    const formatDisplayDate = (date) => {
        if (!date) return "";
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDate = (date) => {
        if (!date) return null;
        return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    };

    const fetchData = async (params) => {
        try {
            console.log("Fetching data with params:", params);
            const response = await dispatch(wh_dpkAlljoindt(params)).unwrap();
            console.log("Raw API Response:", response);

            if (!response || !response.data) {
                console.log("No data received from API");
                setDpkData([]);
                return;
            }

            if (!Array.isArray(response.data)) {
                console.log("API response data is not an array:", response.data);
                setDpkData([]);
                return;
            }

            const flattenedData = response.data.flatMap(dispatch => {
                if (!dispatch.wh_dpkdts || !Array.isArray(dispatch.wh_dpkdts)) {
                    console.log("Invalid dispatch or missing wh_dpkdts:", dispatch);
                    return [];
                }

                return dispatch.wh_dpkdts.map(detail => ({
                    date: dispatch.rdate,
                    refno: dispatch.refno,
                    kitchen_code: dispatch.tbl_kitchen?.kitchen_name || 'N/A',
                    product_code: detail.product_code,
                    product_name: detail.tbl_product?.product_name || 'N/A',
                    quantity: detail.qty || 0,
                    unit_price: detail.uprice || 0,
                    unit_code: detail.tbl_unit?.unit_name || 'N/A',
                    amount: detail.amt || 0,
                    total: dispatch.total || 0
                }));
            });

            console.log("Processed data:", flattenedData);
            setDpkData(flattenedData);
        } catch (error) {
            console.error("Error in fetchData:", error);
            setDpkData([]);
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            const initialParams = {
                offset: 0,
                limit: 10000,
                rdate1: formatDate(today),
                rdate2: formatDate(today)
            };

            try {
                await Promise.all([
                    fetchData(initialParams),
                    dispatch(kitchenAll({ offset: 0, limit: 1000 }))
                        .unwrap()
                        .then(res => setKitchens(res.data))
                        .catch(err => console.error("Error fetching kitchens:", err))
                ]);
            } catch (error) {
                console.error("Error initializing data:", error);
            }
        };

        initializeData();
    }, [dispatch]);

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

        if (selectedKitchen) params.kitchen_code = selectedKitchen;
        if (productSearch) params.product_code = productSearch;

        fetchData(params);
    };

    const handlePrint = () => {
        if (dpkData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data',
                text: 'There is no data to print',
                confirmButtonColor: '#754C27'
            });
            return;
        }

        const printWindow = window.open('', '_blank');
        const printDoc = printWindow.document;

        printDoc.write(`
            <html>
                <head>
                    <style>
                        @media print {
                            body { margin: 0; }
                            @page { size: landscape; }
                        }
                        table { page-break-inside: auto; }
                        tr { page-break-inside: avoid; page-break-after: auto; }
                        thead { display: table-header-group; }
                        tfoot { display: table-footer-group; }
                    </style>
                </head>
                <body>
                    <div id="print-content"></div>
                </body>
            </html>
        `);

        const root = createRoot(printDoc.getElementById('print-content'));
        root.render(
            <PrintLayout
                data={dpkData}
                excludePrice={excludePrice}
                startDate={startDate}
                endDate={endDate}
            />
        );

        printWindow.setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 1000);
    };

    const handleExportExcel = () => {
        if (dpkData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data',
                text: 'There is no data to export to Excel',
                confirmButtonColor: '#754C27'
            });
            return;
        }
        exportToExcelWhDpk(dpkData, excludePrice, startDate, endDate);
    };

    const handleExportPdf = () => {
        if (dpkData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data',
                text: 'There is no data to export to PDF',
                confirmButtonColor: '#754C27'
            });
            return;
        }
        exportToPdfWhDpk(dpkData, excludePrice, startDate, endDate);
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', bgcolor: '#F8F8F8' }}>
            {/* Search Form Section */}
            <Box sx={{ width: '70%', mt: '10px', flexDirection: 'column' }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    height: '100%',
                    p: '16px',
                    position: 'relative',
                    zIndex: 2,
                    mb: '50px',
                    bgcolor: '#F8F8F8'
                }}>
                    <Box sx={{ width: '90%', mt: '24px' }}>
                        <Grid2 container spacing={2}>
                            {/* Date Pickers */}
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
                                                    bgcolor: 'white'
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
                                                    bgcolor: 'white'
                                                },
                                            }}
                                        />
                                    }
                                />
                            </Grid2>

                            {/* Kitchen Select */}
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Kitchen
                                </Typography>
                                <Box
                                    component="select"
                                    value={selectedKitchen}
                                    onChange={(e) => {
                                        setSelectedKitchen(e.target.value);
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
                                        bgcolor: 'white',
                                        '&:focus': {
                                            outline: 'none',
                                            borderColor: '#754C27',
                                        },
                                    }}
                                >
                                    <option value="">All Kitchens</option>
                                    {kitchens.map(kitchen => (
                                        <option key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                                            {kitchen.kitchen_name}
                                        </option>
                                    ))}
                                </Box>
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
                                        value={searchProduct}
                                        onChange={(e) => {
                                            setSearchProduct(e.target.value);
                                            if (e.target.value === '') {
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
                                                bgcolor: 'white'
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
                        Dispatch To Kitchen
                    </Typography>
                </Box>

                <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex' }}>
                            <Box>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C' }}>Date</Typography>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C' }}>Kitchen</Typography>
                            </Box>
                            <Box sx={{ ml: '8px' }}>
                                <Typography>
                                    {startDate && endDate
                                        ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
                                        : "Not specified"}
                                </Typography>
                                <Typography>
                                    {kitchens.find(k => k.kitchen_code === selectedKitchen)?.kitchen_name || "Not selected"}
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
                                    onClick={handlePrint}
                                    variant="outlined"
                                    sx={{
                                        color: '#754C27',
                                        borderColor: '#754C27',
                                        '&:hover': {
                                            borderColor: '#5c3c1f',
                                        }
                                    }}
                                >
                                    Print
                                </Button>
                                <Button
                                    onClick={handleExportExcel}
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
                                    Excel
                                </Button>
                                <Button
                                    onClick={handleExportPdf}
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
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>No.</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Date</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Ref.no</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Kitchen</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Product Name</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Quantity</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Unit Price</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Unit</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Amount</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Total</th>
                                </tr>
                                <tr>
                                    <td colSpan="10">
                                        <Divider sx={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                {dpkData.map((row, index) => (
                                    <tr key={`${row.refno}-${row.product_code}-${index}`}>
                                        <td style={{ padding: '12px 16px' }}>{index + 1}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.date}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.refno}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.kitchen_code}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.product_name}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.quantity}</td>
                                        <td style={{ padding: '12px 16px' }}>{Number(row.unit_price).toFixed(2)}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.unit_code}</td>
                                        <td style={{ padding: '12px 16px' }}>{Number(row.amount).toFixed(2)}</td>
                                        <td style={{ padding: '12px 16px' }}>{Number(row.total).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}