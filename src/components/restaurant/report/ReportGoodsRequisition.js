import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Box, Typography, TextField, Grid2, Button } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Switch, Divider } from '@mui/material';
import { useDispatch } from 'react-redux';
import { Br_grfAlljoindt } from '../../../api/restaurant/br_grfApi';
import { Br_grfdtAlljoindt } from '../../../api/restaurant/br_grfdtApi';
import { exportToExcelGrf } from './ExportExcelGRF';
import { branchAll } from '../../../api/branchApi';
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
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const formatDisplayDate = (date) => {
        if (!date) return "";
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const formatDate = (date) => {
        if (!date) return null;
        return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    };

    // ฟังก์ชันเรียกข้อมูล
    const fetchData = async (params) => {
        setIsLoading(true);
        try {
            console.log("Fetching header data with params:", params);
            const response = await dispatch(Br_grfAlljoindt(params)).unwrap();
            console.log("API Response for headers:", response);

            if (response.result && Array.isArray(response.data)) {
                // สร้างอาร์เรย์เพื่อเก็บข้อมูลสุดท้าย
                let allDetailedData = [];

                // ไล่ดึงข้อมูลรายละเอียดสำหรับแต่ละ refno
                for (const order of response.data) {
                    console.log("Fetching details for refno:", order.refno);
                    try {
                        const detailResponse = await dispatch(Br_grfdtAlljoindt({ refno: order.refno })).unwrap();
                        console.log("Detail response for refno:", order.refno, detailResponse);

                        if (detailResponse.result && detailResponse.data && Array.isArray(detailResponse.data)) {

                            // แปลงข้อมูลรายละเอียดให้อยู่ในรูปแบบที่ต้องการ
                            const orderDetails = detailResponse.data.map(detail => ({
                                date: order.rdate,
                                refno: order.refno,
                                restaurant: order.tbl_branch?.branch_name || 'N/A',
                                product_id: detail.product_code,
                                product_name: detail.product_name || detail.tbl_product?.product_name || 'N/A',
                                quantity: detail.qty,
                                unit_price: detail.uprice,
                                expireDate: detail.expire_date,
                                unit_code: detail.unit_name || detail.tbl_unit?.unit_name || 'N/A',
                                amount: detail.amt,
                                total: order.total,
                                user_code: order.user?.username || 'N/A'
                            }));

                            // เพิ่มข้อมูลรายละเอียดเข้าไปในอาร์เรย์รวม
                            allDetailedData = [...allDetailedData, ...orderDetails];
                        }
                    } catch (detailError) {
                        console.error("Error fetching details for refno:", order.refno, detailError);
                    }
                }

                console.log("All detailed data:", allDetailedData);
                setGrfData(allDetailedData);
            } else {
                setGrfData([]);
                console.warn("API response doesn't contain expected data array:", response);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setGrfData([]);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to fetch data',
                confirmButtonColor: '#754C27'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // useEffect สำหรับโหลดข้อมูลครั้งแรก
    useEffect(() => {
        console.log("Initial loading...");

        // สร้าง params ด้วยวันที่ปัจจุบัน
        const params = {
            offset: 0,
            limit: 10000,
            rdate1: formatDate(today),
            rdate2: formatDate(today)
        };

        console.log("Initial fetch params:", params);

        // โหลดข้อมูล branches
        const fetchBranches = async () => {
            try {
                const res = await dispatch(branchAll({ offset: 0, limit: 1000 })).unwrap();
                console.log("Branches response:", res);
                if (res.data && Array.isArray(res.data)) {
                    setBranches(res.data);
                } else {
                    setBranches([]);
                    console.warn("Branch API response doesn't contain expected data array");
                }
            } catch (err) {
                console.error("Error fetching branches:", err);
                setBranches([]);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch restaurants',
                    confirmButtonColor: '#754C27'
                });
            }
        };

        fetchBranches();
        fetchData(params);
    }, []);

    const handleDateChange = (type, date) => {
        if (type === 'start') {
            setStartDate(date);
            if (date && endDate) {
                console.log("Date range changed - start date:", date);
                const params = {
                    offset: 0,
                    limit: 10000,
                    rdate1: formatDate(date),
                    rdate2: formatDate(endDate),
                    ...(selectedBranch && { branch_code: selectedBranch })
                };
                console.log("Fetching with params:", params);
                fetchData(params);
            }
        } else {
            setEndDate(date);
            if (startDate && date) {
                console.log("Date range changed - end date:", date);
                const params = {
                    offset: 0,
                    limit: 10000,
                    rdate1: formatDate(startDate),
                    rdate2: formatDate(date),
                    ...(selectedBranch && { branch_code: selectedBranch })
                };
                console.log("Fetching with params:", params);
                fetchData(params);
            }
        }
    };

    const handleSearch = () => {
        const params = {
            offset: 0,
            limit: 10000,
            ...(startDate && endDate && {
                rdate1: formatDate(startDate),
                rdate2: formatDate(endDate)
            }),
            ...(selectedBranch && { branch_code: selectedBranch })
        };
        console.log("Search params:", params);
        fetchData(params);
    };

    const handleBranchChange = (e) => {
        const newBranchCode = e.target.value;
        setSelectedBranch(newBranchCode);

        const params = {
            offset: 0,
            limit: 10000,
            ...(startDate && endDate && {
                rdate1: formatDate(startDate),
                rdate2: formatDate(endDate)
            }),
            ...(newBranchCode && { branch_code: newBranchCode })
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
                if (!printWindow) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Pop-up was blocked. Please allow pop-ups for this site.',
                        confirmButtonColor: '#754C27'
                    });
                    return;
                }

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

    // หาชื่อของร้านอาหาร/สาขาที่เลือก
    const getSelectedBranchName = () => {
        if (!selectedBranch || !Array.isArray(branches)) return "Not selected";
        const branch = branches.find(b => b.branch_code === selectedBranch);
        return branch ? branch.branch_name : "Not selected";
    };

    // คำนวณผลรวม
    const calculateTotalAmount = () => {
        if (!Array.isArray(grfData)) return 0;
        return Number(grfData.reduce((sum, item) => sum + Number(item.amount || 0), 0)).toFixed(2);
    };

    const calculateTotalPrice = () => {
        if (!Array.isArray(grfData)) return 0;
        return Number(grfData.reduce((sum, item) => sum + Number(item.total || 0), 0)).toFixed(2);
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
                                    Restaurant
                                </Typography>
                                <Box
                                    component="select"
                                    value={selectedBranch}
                                    onChange={handleBranchChange}
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
                                    <option value="">Select a Restaurant</option>
                                    {Array.isArray(branches) && branches.map(branch => (
                                        <option key={branch.branch_code} value={branch.branch_code}>
                                            {branch.branch_name}
                                        </option>
                                    ))}
                                </Box>
                            </Grid2>

                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleSearch()}
                                        disabled={isLoading}
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
                                        {isLoading ? 'Loading...' : 'Show'}
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
                                    Restaurant
                                </Typography>
                            </Box>
                            <Box sx={{ ml: '8px' }}>
                                <Typography>
                                    {startDate && endDate
                                        ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
                                        : "Not specified"}
                                </Typography>
                                <Typography>
                                    {getSelectedBranchName()}
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
                                    disabled={isLoading || !Array.isArray(grfData) || grfData.length === 0}
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
                                    disabled={isLoading || !Array.isArray(grfData) || grfData.length === 0}
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
                                    disabled={isLoading || !Array.isArray(grfData) || grfData.length === 0}
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
                        {isLoading ? (
                            <Typography sx={{ py: 4, textAlign: 'center' }}>Loading data...</Typography>
                        ) : (
                            <table style={{ width: '100%', marginTop: '24px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>No.</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Date</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Ref.no</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Restaurant</th>
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
                                    {Array.isArray(grfData) && grfData.length > 0 ? (
                                        grfData.map((row, index) => (
                                            <tr key={`${row.refno}-${row.product_id}-${index}`}>
                                                <td style={{ padding: '12px 16px' }}>{index + 1}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.date || 'N/A'}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.refno || 'N/A'}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.restaurant || 'N/A'}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.product_id || 'N/A'}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.product_name || 'N/A'}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.quantity || 0}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.unit_price ? Number(row.unit_price).toFixed(2) : '0.00'}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.expireDate || '-'}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.unit_code || '-'}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.amount ? Number(row.amount).toFixed(2) : '0.00'}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.total ? Number(row.total).toFixed(2) : '0.00'}</td>
                                                <td style={{ padding: '12px 16px' }}>{row.user_code || 'N/A'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="13" style={{ textAlign: 'center', padding: '20px' }}>
                                                {isLoading ? 'Loading data...' : 'No data available'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {Array.isArray(grfData) && grfData.length > 0 && (
                                    <tfoot>
                                        <tr>
                                            <td colSpan="15">
                                                <Divider sx={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="10" style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 'bold', color: '#754C27' }}>
                                                Total:
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                                {calculateTotalAmount()}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#754C27' }}>
                                                {calculateTotalPrice()}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}