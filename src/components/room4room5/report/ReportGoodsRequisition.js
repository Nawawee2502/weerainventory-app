import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Box, Typography, TextField, Grid2, Button } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Switch, Divider } from '@mui/material';
import { useDispatch } from 'react-redux';
import { Kt_grfAlljoindt } from '../../../api/kitchen/kt_grfApi';
import { exportToExcelGrf } from './ExportExcelGRF';
import { kitchenAll } from '../../../api/kitchenApi';
import { exportToPdfGrf } from './ExportPdfGRF';
import PrintLayout from './PrintPreviewGRF';
import Swal from 'sweetalert2';

export default function ReportGoodsRequisition() {
    const today = new Date();
    const dispatch = useDispatch();
    const [grfData, setGrfData] = useState([]);
    const [excludePrice, setExcludePrice] = useState(false);
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [selectedKitchen, setSelectedKitchen] = useState('');
    const [searchProduct, setSearchProduct] = useState('');
    const [kitchens, setKitchens] = useState([]);

    const formatDate = date =>
        date ? `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}` : null;

    const formatDisplayDate = date =>
        date ? `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}` : "";

    const fetchData = async (params) => {
        try {
            const response = await dispatch(Kt_grfAlljoindt(params)).unwrap();
            if (response.data) {
                const flattenedData = response.data.flatMap(order =>
                    order.kt_grfdts.map(detail => ({
                        date: order.rdate,
                        refno: order.refno,
                        kitchen: order.tbl_kitchen?.kitchen_name,
                        product_id: detail.product_code,
                        product_name: detail.tbl_product?.product_name,
                        quantity: detail.qty,
                        unit_price: detail.uprice,
                        expireDate: detail.expiry_date,
                        unit_code: detail.tbl_unit?.unit_name,
                        amount: detail.amt,
                        total: order.total,
                        user_code: order.user?.username
                    }))
                );
                setGrfData(flattenedData);
            } else {
                setGrfData([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setGrfData([]);
        }
    };

    useEffect(() => {
        const params = {
            offset: 0,
            limit: 10000,
            rdate1: formatDate(today),
            rdate2: formatDate(today)
        };
        fetchData(params);

        dispatch(kitchenAll({ offset: 0, limit: 1000 }))
            .unwrap()
            .then(res => setKitchens(res.data))
            .catch(err => console.error("Error fetching kitchens:", err));
    }, []);

    const handleDateChange = (type, date) => {
        if (type === 'start') {
            setStartDate(date);
            if (date && endDate) {
                fetchData({
                    offset: 0,
                    limit: 10000,
                    rdate1: formatDate(date),
                    rdate2: formatDate(endDate)
                });
            }
        } else {
            setEndDate(date);
            if (startDate && date) {
                fetchData({
                    offset: 0,
                    limit: 10000,
                    rdate1: formatDate(startDate),
                    rdate2: formatDate(date)
                });
            }
        }
    };

    const handleSearch = (productSearch = searchProduct) => {
        const params = {
            offset: 0,
            limit: 10000,
            ...(startDate && endDate && {
                rdate1: formatDate(startDate),
                rdate2: formatDate(endDate)
            }),
            ...(selectedKitchen && { kitchen_code: selectedKitchen }),
            ...(productSearch && { product_code: productSearch })
        };
        fetchData(params);
    };

    const handleExport = (type) => {
        if (grfData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data',
                text: `There is no data to ${type}`,
                confirmButtonColor: '#754C27'
            });
            return;
        }

        switch (type) {
            case 'print':
                const printWindow = window.open('', '_blank');
                const root = createRoot(printWindow.document.createElement('div'));
                printWindow.document.body.appendChild(root.container);

                printWindow.document.write(`
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
                                body {
                                    -webkit-print-color-adjust: exact !important;
                                    print-color-adjust: exact !important;
                                }
                            </style>
                        </head>
                        <body>
                            <div id="print-content"></div>
                        </body>
                    </html>
                `);

                root.render(
                    <PrintLayout
                        data={grfData}
                        excludePrice={excludePrice}
                        startDate={startDate}
                        endDate={endDate}
                    />
                );

                printWindow.setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 1000);
                break;

            case 'excel':
                exportToExcelGrf(grfData, excludePrice, startDate, endDate);
                break;

            case 'pdf':
                exportToPdfGrf(grfData, excludePrice, startDate, endDate);
                break;
        }
    };

    return (
        <Box sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            bgcolor: '#F8F8F8',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
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
                    mb: '50px'
                }}>
                    <Box sx={{ width: '90%', mt: '24px' }}>
                        <Grid2 container spacing={2}>
                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    From Date
                                </Typography>
                                <DatePicker
                                    selected={startDate}
                                    onChange={date => handleDateChange('start', date)}
                                    selectsStart
                                    startDate={startDate}
                                    endDate={endDate}
                                    dateFormat="MM/dd/yyyy"
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
                                    onChange={date => handleDateChange('end', date)}
                                    selectsEnd
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={startDate}
                                    dateFormat="MM/dd/yyyy"
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
                                        '& option': {
                                            fontSize: '16px',
                                        },
                                    }}
                                >
                                    <option value="">Select a Kitchen</option>
                                    {kitchens.map(kitchen => (
                                        <option key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                                            {kitchen.kitchen_name}
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
                        Goods Requisition
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
                                    Kitchen
                                </Typography>
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
                                    onClick={() => handleExport('print')}
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
                                    onClick={() => handleExport('excel')}
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
                                    onClick={() => handleExport('pdf')}
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
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Product ID</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Product Name</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Quantity</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Unit Price</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Expire Date</th>
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
                                {grfData.map((row, index) => (
                                    <tr key={`${row.refno}-${row.product_id}`}>
                                        <td style={{ padding: '12px 16px' }}>{index + 1}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.date}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.refno}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.kitchen}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.product_id}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.product_name}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.quantity}</td>
                                        <td style={{ padding: '12px 16px' }}>{Number(row.unit_price).toFixed(2)}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.expireDate}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.unit_code}</td>
                                        <td style={{ padding: '12px 16px' }}>{Number(row.amount).toFixed(2)}</td>
                                        <td style={{ padding: '12px 16px' }}>{Number(row.total).toFixed(2)}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.user_code}</td>
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