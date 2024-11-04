import { Box, Button, InputAdornment, TextField, Typography, Drawer, IconButton, Grid2, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
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
import { addSupplier, deleteSupplier, updateSupplier, supplierAll, countSupplier, searchSupplier, lastSupplierCode } from '../../../api/supplierApi';
import { addBranch, deleteBranch, updateBranch, branchAll, countBranch, searchBranch, lastBranchCode } from '../../../api/branchApi';
import { addWh_pos, updateWh_pos, deleteWh_pos, wh_posAlljoindt, wh_posAllrdate, Wh_posByRefno } from '../../../api/warehouse/wh_posApi';
import { Wh_posdtAllinnerjoin, deleteWh_posdt } from '../../../api/warehouse/wh_posdtApi';
import { searchProductCode } from '../../../api/productrecordApi';
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Swal from 'sweetalert2';
import PrintIcon from '@mui/icons-material/Print';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { generatePDF } from './Pdf.js'

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


export default function PurchaseOrderToSupplier({ onCreate, onEdit }) {
  const [selected, setSelected] = useState([]);
  const dispatch = useDispatch();
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [branch, setBranch] = useState([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [getLastBranchCode, setGetLastBranchCode] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [whpos, setWhpos] = useState([]);
  const [whposdt, setWhposdt] = useState([]);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [units, setUnits] = useState({});
  const [totals, setTotals] = useState({});
  const [itemsPerPage] = useState(5);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    // Initial data load
    refetchData(1);
  }, [dispatch]);

  useEffect(() => {
    if (searchTerm) {
      dispatch(searchProductCode({ product_code: searchTerm }))
        .unwrap()
        .then((res) => {
          setProducts(res.data);
        })
        .catch((err) => console.log(err.message));
    } else {
      refetchData();
    }
  }, [searchTerm, dispatch]);

  const handleChange = (event, value) => {
    setPage(value);
    const offset = (value - 1) * itemsPerPage;
    const limit = itemsPerPage;

    // Clear existing data before fetching new page
    setWhpos([]);

    dispatch(wh_posAlljoindt({ offset, limit }))
      .unwrap()
      .then((res) => {
        const resultData = res.data.map((item, index) => ({
          ...item,
          id: offset + index + 1
        }));
        setWhpos(resultData); // Replace old data instead of accumulating
      })
      .catch((err) => console.log(err.message));
  };

  useEffect(() => {
    const fetchInitialData = () => {
      const offset = 0;
      const limit = itemsPerPage;

      dispatch(wh_posAlljoindt({ offset, limit }))
        .unwrap()
        .then((res) => {
          const resultData = res.data.map((item, index) => ({
            ...item,
            id: index + 1
          }));
          setWhpos(resultData);

          // Calculate total pages
          const totalItems = res.total || resultData.length * 2; // Adjust based on your API
          const totalPages = Math.ceil(totalItems / itemsPerPage);
          setCount(totalPages);
        })
        .catch((err) => console.log(err.message));
    };

    fetchInitialData();
  }, [dispatch, itemsPerPage]);

  const refetchData = (targetPage = 1) => {
    const offset = (targetPage - 1) * itemsPerPage;
    const limit = itemsPerPage;

    // setWhpos([]); // Clear existing data

    dispatch(wh_posAlljoindt({ offset, limit }))
      .unwrap()
      .then((res) => {
        const resultData = res.data.map((item, index) => ({
          ...item,
          id: offset + index + 1
        }));
        setWhpos(resultData);

        const totalItems = res.total || resultData.length * 2;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        setCount(totalPages);
        setPage(targetPage);
      })
      .catch((err) => console.log(err.message));
  };

  const handleCheckboxChange = (event, branch_code) => {
    if (event.target.checked) {
      setSelected([...selected, branch_code]);
    } else {
      setSelected(selected.filter((item) => item !== branch_code));
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = branch.map((row) => row.branch_code);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const loadData = async (pageNumber) => {
    try {
      const offset = (pageNumber - 1) * itemsPerPage;
      const limit = itemsPerPage;

      const res = await dispatch(wh_posAlljoindt({ offset, limit })).unwrap();

      const resultData = res.data.map((item, index) => ({
        ...item,
        id: offset + index + 1
      }));

      setWhpos(resultData);
      const totalPages = Math.ceil(res.total / itemsPerPage);
      setCount(totalPages);
      setPage(pageNumber);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const handleDelete = (refno) => {
    Swal.fire({
      title: 'Are you sure you want to delete this order?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: 'Deleting order...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          // 1. ดึงข้อมูล order
          const orderData = await dispatch(Wh_posByRefno(refno)).unwrap();

          // 2. ลบข้อมูลใน wh_posdt
          for (const item of orderData.data.wh_posdts) {
            await dispatch(deleteWh_posdt({
              refno: refno,
              product_code: item.product_code
            })).unwrap();
          }

          // 3. ลบข้อมูลใน wh_pos
          await dispatch(deleteWh_pos({ refno })).unwrap();

          Swal.fire({
            icon: 'success',
            title: 'Order deleted successfully',
            timer: 1500,
            showConfirmButton: false,
          });

          // 4. โหลดข้อมูลใหม่
          await loadData(page);

        } catch (err) {
          console.error("Error:", err);
          Swal.fire({
            icon: 'error',
            title: 'Error deleting order',
            text: err.message || 'An unknown error occurred',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  };

  const handleDeleteSelected = () => {
    Swal.fire({
      title: 'Are you sure you want to delete the selected orders?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Deleting orders...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // กรองเฉพาะ rows ที่ถูกเลือก
        const selectedRows = whpos.filter(row => selected.includes(row.branch_code));

        // สร้าง array ของ promises สำหรับการลบแต่ละ order
        const deletePromises = selectedRows.map(row =>
          dispatch(Wh_posByRefno(row.refno))
            .unwrap()
            .then(async (res) => {
              // 1. ลบข้อมูลใน wh_posdt ทั้งหมดที่มี refno นี้
              const deletePosdtPromises = res.data.wh_posdts.map(item =>
                dispatch(deleteWh_posdt({
                  refno: row.refno,
                  product_code: item.product_code
                })).unwrap()
              );

              await Promise.all(deletePosdtPromises);

              // 2. ลบข้อมูลใน wh_pos
              return dispatch(deleteWh_pos({ refno: row.refno })).unwrap();
            })
        );

        // รอให้การลบทั้งหมดเสร็จสิ้น
        Promise.all(deletePromises)
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Selected orders deleted successfully',
              timer: 1500,
              showConfirmButton: false,
            });

            // Reset selection และโหลดข้อมูลใหม่
            setSelected([]);
            setTimeout(() => {
              refetchData(page);
            }, 1500);
          })
          .catch((err) => {
            console.error("Error details:", err);
            Swal.fire({
              icon: 'error',
              title: 'Error deleting orders',
              text: err.message || 'An unknown error occurred',
              confirmButtonText: 'OK'
            });
          });
      }
    });
  };


  const [saveSupplier, setSaveSupplier] = useState('');
  const [saveBranch, setSaveBranch] = useState('');
  const [editDate, setEditDate] = useState(new Date());
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [originalProducts, setOriginalProducts] = useState([]);



  const PrintPurchaseOrderPDF = async (refno) => {
    try {
      dispatch(Wh_posByRefno(refno))
        .unwrap()
        .then(async (res) => {
          const pdfContent = await generatePDF(refno, res.data);
          if (pdfContent) {
            const asBlob = await pdf(pdfContent).toBlob();
            const url = URL.createObjectURL(asBlob);
            window.open(url, '_blank');
          }
        })
        .catch((err) => {
          console.log(err.message);
          Swal.fire({
            icon: 'error',
            title: 'Error loading order data',
            text: err.message,
            confirmButtonText: 'OK'
          });
        });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error generating PDF',
        text: 'Please try again later',
        confirmButtonText: 'OK'
      });
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
          // justifyContent: 'center',
        }}
      >
        <Button
          // onClick={toggleDrawer(true)}
          onClick={() => {
            console.log("Create button clicked"); // ตรวจสอบว่าฟังก์ชันทำงาน
            onCreate();  // เรียก onCreate เมื่อกดปุ่ม
          }}
          sx={{
            width: '209px',
            height: '70px',
            background: 'linear-gradient(180deg, #AD7A2C 0%, #754C27 100%)',
            borderRadius: '15px',
            boxShadow: '0px 4px 4px 0px #00000040',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: '48px',
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: '48px',
            width: '60%'
          }}
        >
          <Typography sx={{ fontSize: '16px', fontWeight: '600', mr: '24px' }}>
            Search
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
        </Box>
        <Box sx={{ width: '100%', mt: '24px' }}>
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
        <TableContainer component={Paper} sx={{ width: '100%', mt: '24px' }}>
          <Table sx={{}} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ width: '1%', textAlign: 'center' }}>
                  <Checkbox
                    sx={{ color: '#FFF' }}
                    indeterminate={selected.length > 0 && selected.length < branch.length}
                    checked={branch.length > 0 && selected.length === branch.length}
                    onChange={handleSelectAllClick}
                  />
                </StyledTableCell>
                <StyledTableCell width='1%' >No.</StyledTableCell>
                <StyledTableCell align="center">Ref.no</StyledTableCell>
                <StyledTableCell align="center">Date</StyledTableCell>
                <StyledTableCell align="center">Supplier</StyledTableCell>
                <StyledTableCell align="center">Branch</StyledTableCell>
                <StyledTableCell align="center">Amount</StyledTableCell>
                <StyledTableCell align="center">Username</StyledTableCell>
                <StyledTableCell width='1%' align="center"></StyledTableCell>
                <StyledTableCell width='1%' align="center"></StyledTableCell>
                <StyledTableCell width='1%' align="center"></StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {whpos.map((row) => (
                <StyledTableRow key={row.branch_code}>
                  <StyledTableCell padding="checkbox" align="center">
                    <Checkbox
                      checked={selected.includes(row.branch_code)}
                      onChange={(event) => handleCheckboxChange(event, row.branch_code)}
                    />
                  </StyledTableCell>
                  <StyledTableCell component="th" scope="row">
                    {row.id} {/* Row ID */}
                  </StyledTableCell>
                  <StyledTableCell align="center">{row.refno} {/* Reference Number */}</StyledTableCell>
                  <StyledTableCell align="center">{row.rdate} {/* Request Date */}</StyledTableCell>
                  <StyledTableCell align="center">{row.supplier_code} {/* Supplier Code */}</StyledTableCell>
                  <StyledTableCell align="center">{row.branch_code} {/* Branch Code */}</StyledTableCell>
                  <StyledTableCell align="center">{row.total} {/* Total Amount */}</StyledTableCell>
                  <StyledTableCell align="center">{row.user_code} {/* User Code */}</StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      color="primary"
                      size="md"
                      onClick={() => onEdit(row.refno)} // เรียกใช้ onEdit prop พร้อมส่ง refno
                      sx={{ border: '1px solid #AD7A2C', borderRadius: '7px' }}
                    >
                      <EditIcon sx={{ color: '#AD7A2C' }} />
                    </IconButton>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      color="danger"
                      size="md"
                      onClick={() => handleDelete(row.refno)}  // เปลี่ยนจาก branch_code เป็น refno
                      sx={{ border: '1px solid #F62626', borderRadius: '7px' }}
                    >
                      <DeleteIcon sx={{ color: '#F62626' }} />
                    </IconButton>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      color="danger"
                      size="md"
                      onClick={() => PrintPurchaseOrderPDF(row.refno)} // Handle print functionality
                      sx={{ border: '1px solid #5686E1', borderRadius: '7px' }}
                    >
                      <PrintIcon sx={{ color: '#5686E1' }} />
                    </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack spacing={2} sx={{ mt: '8px' }}>
          <Pagination
            count={count}
            shape="rounded"
            onChange={handleChange}
            page={page}
          />
        </Stack>
      </Box>
    </>
  );
}
