import * as React from 'react';
import { createRoot } from 'react-dom/client';
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
import { exportToPdfWhPos } from './ExportPdfPurchaseordertosupplier';
import PrintLayout from './PrintPreviewWhPos';
import Swal from 'sweetalert2';

export default function ReportPurchaseordertosupplier() {
    const today = new Date();
    const [whposData, setWhposData] = useState([]);
    const [excludePrice, setExcludePrice] = useState(false);
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [searchProduct, setSearchProduct] = useState('');
    const dispatch = useDispatch();


    const formatDisplayDate = (date) => {
        if (!date) return "";
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

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
        // สร้าง params ด้วยวันที่ปัจจุบัน
        const params = {
            offset: 0,
            limit: 10000,
            rdate1: formatDate(today),  // เพิ่มวันที่เริ่มต้น
            rdate2: formatDate(today)   // เพิ่มวันที่สิ้นสุด
        };

        // เรียก API ด้วย params ที่มีวันที่
        fetchData(params);

        // โหลดข้อมูล suppliers
        dispatch(supplierAll({ offset: 0, limit: 1000 }))
            .unwrap()
            .then(res => {
                setSuppliers(res.data);
            })
            .catch(err => console.error("Error fetching suppliers:", err));

        // โหลดข้อมูล branches
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

    const handlePrint = () => {
        if (whposData.length === 0) {
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
                /* เพิ่ม CSS สำหรับ print */
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
                thead { display: table-header-group; }
                tfoot { display: table-footer-group; }
                @media print {
                  @page { margin: 0; }
                  body { margin: 0; }
                  
                  /* สไตล์สำหรับเลขหน้า */
                  .page-number {
                    position: fixed;
                    bottom: 10px;
                    right: 10px;
                    font-size: 12px;
                  }
                }
                body {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                
                /* สไตล์สำหรับ wrapper ที่จะมีเลขหน้า */
                .page-container {
                  position: relative;
                  min-height: 100vh;
                }
              </style>
              <script>
                window.onload = function() {
                  // เพิ่มเลขหน้าให้กับทุกหน้า
                  let pages = document.querySelectorAll('.page-number');
                  pages.forEach((page, index) => {
                    page.textContent = (index + 1).toString();
                  });
                }
              </script>
            </head>
            <body>
              <div class="page-container">
                <div id="print-content"></div>
                <div class="page-number">1</div>
              </div>
            </body>
          </html>
        `);

        const root = createRoot(printDoc.getElementById('print-content'));
        root.render(
            <PrintLayout
                data={whposData}
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
        if (whposData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data',
                text: 'There is no data to export to Excel',
                confirmButtonColor: '#754C27'
            });
            return;
        }
        exportToExcelWhPos(whposData, excludePrice, startDate, endDate);
    };

    const handleExportPdf = () => {
        if (whposData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data',
                text: 'There is no data to export to PDF',
                confirmButtonColor: '#754C27'
            });
            return;
        }
        exportToPdfWhPos(whposData, excludePrice, startDate, endDate);
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
                                    dateFormat="MM/dd/yyyy"
                                    isClearable
                                    placeholderText="MM/DD/YYYY"
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
                                    dateFormat="MM/dd/yyyy"
                                    isClearable
                                    placeholderText="MM/DD/YYYY"
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
                                    Restaurant
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
                                    <option value="">Select a Restaurant</option>
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
                                    {suppliers.find(s => s.supplier_code === selectedSupplier)?.supplier_name || "Not selected"}
                                </Typography>
                                <Typography>
                                    {branches.find(b => b.branch_code === selectedBranch)?.branch_name || "Not selected"}
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
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Supplier</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Branch</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Product Name</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Quantity</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Unit Price</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Unit</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Amount</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Total</th>
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
                                        <td style={{ padding: '12px 16px' }}>{index + 1}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.date}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.refno}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.supplier_code}</td>
                                        <td style={{ padding: '12px 16px' }}>{row.branch_code}</td>
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
        </Box >
    );
}