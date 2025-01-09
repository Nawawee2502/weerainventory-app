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
import { addWh_pos, updateWh_pos, deleteWh_pos, wh_posAlljoindt, wh_posAllrdate, Wh_posByRefno, countwh_pos } from '../../../api/warehouse/wh_posApi';
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
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Utility Functions
const convertToLasVegasTime = (date) => {
  if (!date) return new Date();
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return new Date(newDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
};

const formatDate = (date) => {
  if (!date) return "";
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const CustomInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
  <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
    <TextField
      value={value}
      onClick={onClick}
      placeholder={placeholder || "MM/DD/YYYY"}
      ref={ref}
      size="small"
      sx={{
        '& .MuiInputBase-root': {
          height: '38px',
          width: '100%',
          backgroundColor: '#fff',
        },
        '& .MuiOutlinedInput-input': {
          cursor: 'pointer',
          paddingRight: '40px',
        }
      }}
      InputProps={{
        readOnly: true,
        endAdornment: (
          <InputAdornment position="end">
            <CalendarTodayIcon sx={{ color: '#754C27', cursor: 'pointer' }} />
          </InputAdornment>
        ),
      }}
    />
  </Box>
));

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
  const [filterDate, setFilterDate] = useState(new Date());

  const datepickerStyles = `
  .react-datepicker {
    font-family: Arial, sans-serif;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  .react-datepicker__header {
    background-color: #754C27;
    border-bottom: none;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    padding-top: 10px;
  }
  .react-datepicker__current-month {
    color: white;
    font-weight: bold;
    font-size: 1rem;
  }
  .react-datepicker__day-name {
    color: white;
  }
  .react-datepicker__day--selected {
    background-color: #754C27;
    color: white;
  }
  .react-datepicker__day--selected:hover {
    background-color: #5d3a1f;
  }
  .react-datepicker__day:hover {
    background-color: #f0f0f0;
  }
  .react-datepicker__navigation {
    top: 13px;
  }
  .react-datepicker__navigation-icon::before {
    border-color: white;
  }
  .react-datepicker__triangle {
    display: none;
  }
`;

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };


  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchTerm) {
        dispatch(searchProductCode({ product_code: searchTerm }))
          .unwrap()
          .then((res) => {
            setProducts(res.data);
          })
          .catch((err) => console.log(err.message));
      }
    }, 500); // debounce search

    return () => clearTimeout(searchTimeout);
  }, [searchTerm, dispatch]);

  const handleChange = (event, value) => {
    refetchData(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentPage = Math.max(1, page);
        const offset = Math.max(0, (currentPage - 1) * itemsPerPage);
        const limit = itemsPerPage;

        // แปลงวันที่เป็น mm/dd/yyyy แล้วส่งไป API
        const formattedDate = filterDate ? formatDate(filterDate) : null;
        console.log("Date sending to API:", formattedDate); // ดูค่าที่ส่งไป API

        const [dataRes, countRes] = await Promise.all([
          dispatch(wh_posAlljoindt({
            offset,
            limit,
            rdate: formattedDate  // ส่งเป็น mm/dd/yyyy
          })).unwrap(),
          dispatch(countwh_pos({
            rdate: formattedDate  // ส่งเป็น mm/dd/yyyy
          })).unwrap()
        ]);

        console.log("API Response:", dataRes); // ดูข้อมูลที่ได้จาก API

        if (dataRes.result && Array.isArray(dataRes.data)) {
          const resultData = dataRes.data.map((item, index) => ({
            ...item,
            id: offset + index + 1
          }));
          setWhpos(resultData);
        }

        if (countRes.result) {
          const totalItems = countRes.data;
          const totalPages = Math.ceil(totalItems / itemsPerPage);
          setCount(totalPages);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        console.log("Error details:", err.response?.data);  // ดู error ที่ได้จาก API
      }
    };

    fetchData();
  }, [page, filterDate, dispatch, itemsPerPage]);

  const handleDateChange = (date) => {
    const vegasDate = convertToLasVegasTime(date);
    setFilterDate(vegasDate);
    setPage(1);
  };

  const clearFilters = () => {
    const today = convertToLasVegasTime(new Date());
    setFilterDate(today);
    setSearchTerm("");
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const refetchData = async (targetPage = 1) => {
    try {
      setWhpos([]); // clear old data

      const offset = (targetPage - 1) * itemsPerPage;
      const limit = itemsPerPage;

      const [res, countRes] = await Promise.all([
        dispatch(wh_posAlljoindt({ offset, limit })).unwrap(),
        dispatch(countwh_pos({ test: "" })).unwrap()
      ]);

      if (res.result && Array.isArray(res.data)) {
        const resultData = res.data.map((item, index) => ({
          ...item,
          id: offset + index + 1
        }));
        setWhpos(resultData);
      }

      if (countRes.result) {
        const totalItems = countRes.data;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        setCount(totalPages);
        setPage(targetPage);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      // อาจจะเพิ่ม error handling เช่น แสดง alert
      Swal.fire({
        icon: 'error',
        title: 'Error loading data',
        text: err.message || 'An unknown error occurred',
      });
    }
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
      // เคลียร์ข้อมูลเก่าก่อน
      setWhpos([]);

      const offset = (pageNumber - 1) * itemsPerPage;
      const limit = itemsPerPage;

      // ดึงข้อมูลหน้าที่ต้องการ
      const res = await dispatch(wh_posAlljoindt({ offset, limit })).unwrap();

      if (res.result && Array.isArray(res.data)) {
        const resultData = res.data.map((item, index) => ({
          ...item,
          id: offset + index + 1
        }));
        setWhpos(resultData);
        console.log("WH_POS DATA : ", resultData);
      }

      // นับจำนวนข้อมูลทั้งหมด
      const countRes = await dispatch(countwh_pos({ test: "" })).unwrap();
      if (countRes.result) {
        const totalItems = countRes.data;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        setCount(totalPages);

        // ตรวจสอบว่าหน้าที่จะแสดงถูกต้อง
        if (pageNumber > totalPages) {
          const newPage = Math.max(1, totalPages);
          setPage(newPage);
          await loadData(newPage);
        } else {
          setPage(pageNumber);
        }
      }
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

          // 4. นับจำนวนข้อมูลที่เหลือและคำนวณหน้า
          const countRes = await dispatch(countwh_pos({ test: "" })).unwrap();
          const remainingItems = countRes.data;
          const totalPages = Math.ceil(remainingItems / itemsPerPage);
          const newPage = page > totalPages ? Math.max(1, totalPages) : page;

          Swal.fire({
            icon: 'success',
            title: 'Order deleted successfully',
            timer: 1500,
            showConfirmButton: false,
          });

          // 5. โหลดข้อมูลใหม่
          await loadData(newPage);

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

        const selectedRows = whpos.filter(row => selected.includes(row.branch_code));
        const deletePromises = selectedRows.map(row =>
          dispatch(Wh_posByRefno(row.refno))
            .unwrap()
            .then(async (res) => {
              const deletePosdtPromises = res.data.wh_posdts.map(item =>
                dispatch(deleteWh_posdt({
                  refno: row.refno,
                  product_code: item.product_code
                })).unwrap()
              );

              await Promise.all(deletePosdtPromises);
              return dispatch(deleteWh_pos({ refno: row.refno })).unwrap();
            })
        );

        Promise.all(deletePromises)
          .then(async () => {
            // นับจำนวนข้อมูลที่เหลือและคำนวณหน้า
            const countRes = await dispatch(countwh_pos({ test: "" })).unwrap();
            const remainingItems = countRes.data;
            const totalPages = Math.ceil(remainingItems / itemsPerPage);
            const newPage = page > totalPages ? Math.max(1, totalPages) : page;

            setSelected([]);

            Swal.fire({
              icon: 'success',
              title: 'Selected orders deleted successfully',
              timer: 1500,
              showConfirmButton: false,
            });

            // โหลดข้อมูลใหม่
            setTimeout(() => {
              loadData(newPage);
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
          const currentRow = whpos.find(row => row.refno === refno);
          if (currentRow) {
            // ใส่ข้อมูล relationship หลักจากตาราง
            let mappedData = {
              ...res.data,
              tbl_supplier: currentRow.tbl_supplier,
              tbl_branch: currentRow.tbl_branch,
              user: currentRow.user,
              // แก้ไขข้อมูล wh_posdts ให้มี unit_name
              wh_posdts: currentRow.wh_posdts.map(item => ({
                ...item,
                tbl_unit: {
                  unit_code: item.unit_code,
                  unit_name: item.tbl_unit?.unit_name || item.unit_code
                },
                tbl_product: {
                  product_code: item.product_code,
                  product_name: item.tbl_product?.product_name || 'Product Description'
                }
              }))
            };

            console.log("Mapped Data for PDF:", mappedData); // For debugging

            const pdfContent = await generatePDF(refno, mappedData);
            if (pdfContent) {
              const asBlob = await pdf(pdfContent).toBlob();
              const url = URL.createObjectURL(asBlob);
              window.open(url, '_blank');
            }
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
            width: '90%', // เพิ่มความกว้างให้มากขึ้น
            gap: '20px' // เพิ่มระยะห่างระหว่าง elements
          }}
        >
          <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
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
              width: '35%' // ปรับความกว้างของช่อง search
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#5A607F' }} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ width: '200px' }}> {/* กำหนดความกว้างคงที่สำหรับ DatePicker */}
            <DatePicker
              selected={filterDate}
              onChange={handleDateChange}
              dateFormat="MM/dd/yyyy"  // ตรงกับฐานข้อมูล
              placeholderText="MM/DD/YYYY"
              customInput={<CustomInput />}
            />
          </Box>
          <Button
            onClick={clearFilters}
            variant="outlined"
            sx={{
              height: '38px',
              width: '120px', // กำหนดความกว้างคงที่
              borderColor: '#754C27',
              color: '#754C27',
              '&:hover': {
                borderColor: '#5d3a1f',
                backgroundColor: 'rgba(117, 76, 39, 0.04)'
              }
            }}
          >
            Clear
          </Button>
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
                <StyledTableCell align="center">Restaurant</StyledTableCell>
                <StyledTableCell align="center">Amount</StyledTableCell>
                <StyledTableCell align="center">Username</StyledTableCell>
                <StyledTableCell width='1%' align="center"></StyledTableCell>
                <StyledTableCell width='1%' align="center"></StyledTableCell>
                <StyledTableCell width='1%' align="center"></StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {whpos.map((row) => (
                <StyledTableRow key={row.refno}>
                  <StyledTableCell padding="checkbox" align="center">
                    <Checkbox
                      checked={selected.includes(row.branch_code)}
                      onChange={(event) => handleCheckboxChange(event, row.branch_code)}
                    />
                  </StyledTableCell>
                  <StyledTableCell component="th" scope="row">
                    {row.id}
                  </StyledTableCell>
                  <StyledTableCell align="center">{row.refno}</StyledTableCell>
                  <StyledTableCell align="center">{row.rdate}</StyledTableCell>
                  <StyledTableCell align="center">
                    {row.tbl_supplier?.supplier_name || row.supplier_code}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {row.tbl_branch?.branch_name || row.branch_code}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {typeof row.total === 'number'
                      ? row.total.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })
                      : row.total}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {row.user?.username || row.user_code}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      color="primary"
                      size="md"
                      onClick={() => onEdit(row.refno)}
                      sx={{ border: '1px solid #AD7A2C', borderRadius: '7px' }}
                    >
                      <EditIcon sx={{ color: '#AD7A2C' }} />
                    </IconButton>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      color="danger"
                      size="md"
                      onClick={() => handleDelete(row.refno)}
                      sx={{ border: '1px solid #F62626', borderRadius: '7px' }}
                    >
                      <DeleteIcon sx={{ color: '#F62626' }} />
                    </IconButton>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      color="danger"
                      size="md"
                      onClick={() => PrintPurchaseOrderPDF(row.refno)}
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
        <Stack spacing={2} sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <Pagination
            count={count}
            page={page}
            onChange={handlePageChange}
            shape="rounded"
            showFirstButton
            showLastButton
          />
        </Stack>
      </Box>
    </>
  );
}
