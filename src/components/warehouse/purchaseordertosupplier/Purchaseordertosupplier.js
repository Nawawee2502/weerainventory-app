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
import { Wh_posdtAllinnerjoin } from '../../../api/warehouse/wh_posdtApi';
import { searchProductCode } from '../../../api/productrecordApi';
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Swal from 'sweetalert2';
import PrintIcon from '@mui/icons-material/Print';
import CancelIcon from '@mui/icons-material/Cancel';
import DatePicker from 'react-datepicker';

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


export default function PurchaseOrderToSupplier({ onCreate }) {
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const fetchData = () => {
    if (searchTerm) {
      // Mock API call with searchProductCode
      dispatch(searchProductCode({ product_code: searchTerm }))
        .unwrap()
        .then((res) => {
          // กรอง product ที่ product_code ขึ้นต้นด้วย searchTerm และยาวไม่เกินความยาวที่ถูกต้อง
          const filteredProducts = res.data.filter((product) =>
            product.product_code.startsWith(searchTerm)
          );

          setProducts(filteredProducts); // Set product data จาก API หลังกรอง
          const initialQuantities = {};
          const initialUnits = {};
          const initialTotals = {};
          filteredProducts.forEach((product) => {
            initialQuantities[product.product_code] = 1; // ตั้งค่าเริ่มต้นของ quantity เป็น 1
            initialUnits[product.product_code] = product.productUnit1.unit_code; // ตั้งค่า default unit เป็น bulk unit
            initialTotals[product.product_code] = calculateTotal(1, product.productUnit1.unit_code, product); // คำนวณ total
          });
          setQuantities(initialQuantities);
          setUnits(initialUnits);
          setTotals(initialTotals);
        })
        .catch((err) => console.log(err.message));
    }
  };


  useEffect(() => {
    fetchData();
  }, [searchTerm]);


  const calculateTotal = (quantity, unitCode, product) => {
    const unitPrice =
      unitCode === product.productUnit1.unit_code
        ? product.bulk_unit_price
        : product.retail_unit_price;
    return quantity * unitPrice;
  };

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
    console.log(value);
    let page = value - 1;
    let offset = page * 5;
    let limit = value * 5;
    console.log(limit, offset);
    dispatch(branchAll({ offset, limit }))
      .unwrap()
      .then((res) => {
        console.log(res.data);
        let resultData = res.data;
        for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
          resultData[indexArray].id = offset + indexArray + 1;
        }
        setBranch(resultData);
      })
      .catch((err) => err.message);
  };

  const refetchData = () => {
    let offset = 0;
    let limit = 5;
    dispatch(branchAll({ offset, limit }))
      .unwrap()
      .then((res) => {
        setBranch(res.data);
      })
      .catch((err) => console.log(err.message));
  };

  useEffect(() => {
    let offset = 0;
    let limit = 5;
    dispatch(wh_posAlljoindt({ offset, limit }))
      .unwrap()
      .then((res) => {
        console.log("---------whpos---------")
        console.log(res.data);
        let resultData = res.data;
        for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
          resultData[indexArray].id = indexArray + 1;
        }
        setWhpos(resultData);
        console.log(resultData);

      })
      .catch((err) => err.message);

    dispatch(branchAll({ offset, limit }))
      .unwrap()
      .then((res) => {
        console.log("Branch data", res.data);
        setBranch(res.data);
      })
      .catch((err) => console.log(err.message));

    dispatch(supplierAll({ offset, limit }))
      .unwrap()
      .then((res) => {
        console.log("Supplier data", res.data);
        setSupplier(res.data);
      })
      .catch((err) => console.log(err.message));

  }, [dispatch]); // ให้แน่ใจว่าค่าใน dependency มีการเปลี่ยนแปลงเมื่อจำเป็นเท่านั้น


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

  const handleDelete = (branch_code) => {
    Swal.fire({
      title: 'Are you sure you want to delete this branch?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteBranch({ branch_code }))
          .unwrap()
          .then((res) => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted successfully',
              timer: 1500,
              showConfirmButton: false,
            });
            setTimeout(() => {
              refetchData();
              let offset = 0;
              let limit = 5;
              dispatch(branchAll({ offset, limit }))
                .unwrap()
                .then((res) => setBranch(res.data));
            }, 2000);
          })
          .catch((err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error deleting branch',
              text: 'Please try again later',
              timer: 3000,
              showConfirmButton: false,
            });
          });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Deletion canceled',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };


  const handleDeleteSelected = () => {
    Swal.fire({
      title: 'Are you sure you want to delete the selected branches?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        Promise.all(selected.map(branch_code =>
          dispatch(deleteBranch({ branch_code })).unwrap()
        ))
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted successfully',
              timer: 1500,
              showConfirmButton: false,
            });
            setTimeout(() => {
              setSelected([]);
              refetchData();
              let offset = 0;
              let limit = 5;
              dispatch(branchAll({ offset, limit }))
                .unwrap()
                .then((res) => setBranch(res.data));
            }, 2000);
          })
          .catch((err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error deleting branches',
              text: 'Please try again later',
              timer: 3000,
              showConfirmButton: false,
            });
          });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Deletion canceled',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  // +++++++++++++++EDIT++++++++++++++++ 

  const [openEditDrawer, setOpenEditDrawer] = useState(false);

  const toggleEditDrawer = (openEditDrawer) => () => {
    setOpenEditDrawer(openEditDrawer);
  };
  const [startDate, setStartDate] = useState(new Date());


  const [editKitchen, setEditKitchen] = useState(null);

  const [wh_posByRefnoData, setWh_posByRefnoData] = useState([]);
  const [editRefno, setEditRefno] = useState('');
  const [editSupplier, setEditSupplier] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editProduct, setEditProduct] = useState([]);


  const handleEdit = (refnotmp) => {
    console.log("TEST", refnotmp)
    dispatch(Wh_posByRefno(refnotmp))
      .unwrap()
      .then((res) => {
        console.log(res.data);
        setWh_posByRefnoData(res.data);
        setEditRefno(res.data.refno);
        let tmpDate = res.data.rdate.split("/");
        setEditDate(
          new Date(tmpDate[2] + '-' + tmpDate[1] + '-' + tmpDate[0])
        );
        setEditSupplier(res.data.supplier_code);
        setEditBranch(res.data.branch_code);
        setEditProduct(res.data.wh_posdts);
      })
      .catch((err) => err.message);
    toggleEditDrawer(true)();
  };

  // const handleEditChange = (event, value) => {
  //   setPage(value);
  //   console.log(value);
  //   let page = value - 1;
  //   let offset = page * 5;
  //   let limit = value * 5;
  //   console.log(limit, offset);
  //   dispatch(setWh_posByRefno({ offset, limit }))
  //     .unwrap()
  //     .then((res) => {
  //       console.log(res.data);
  //       setWh_posByRefno(res.data);
  //     })
  //     .catch((err) => err.message);
  // };


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
                      onClick={() => handleEdit(row.refno)}
                      sx={{ border: '1px solid #AD7A2C', borderRadius: '7px' }}
                    >
                      <EditIcon sx={{ color: '#AD7A2C' }} />
                    </IconButton>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      color="danger"
                      size="md"
                      onClick={() => handleDelete(row.branch_code)} // Use handleDelete function for row deletion
                      sx={{ border: '1px solid #F62626', borderRadius: '7px' }}
                    >
                      <DeleteIcon sx={{ color: '#F62626' }} />
                    </IconButton>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      color="danger"
                      size="md"
                      // onClick={() => handlePrint(row.refno)} // Handle print functionality
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
          <Pagination count={count} shape="rounded" onChange={handleChange} page={page} />
        </Stack>
      </Box>
      <Drawer
        anchor="right"
        open={openEditDrawer}
        onClose={toggleEditDrawer(false)}
        ModalProps={{
          BackdropProps: {
            style: {
              backgroundColor: 'transparent',
            },
          },
        }}
        PaperProps={{
          sx: {
            boxShadow: 'none',
            width: '40%',
            borderRadius: '20px',
            border: '1px solid #E4E4E4',
            bgcolor: '#FAFAFA'
          },
        }}
      >
        <Box
          sx={{
            width: '100%',
            mt: '80px',
            flexDirection: 'column'
          }}
        >
          <Box
            sx={{
              width: '100%',
              mt: '10px',
              flexDirection: 'column'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                border: '1px solid #E4E4E4',
                borderRadius: '10px',
                bgcolor: '#FFFFFF',
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
                      Ref.no
                    </Typography>
                    <TextField
                      value={editRefno || ''}
                      disabled
                      size="small"
                      placeholder='Ref.no'
                      sx={{
                        mt: '8px',
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                          fontWeight: '700'
                        },
                      }}
                    />
                  </Grid2>
                  <Grid2 item size={{ xs: 12, md: 6 }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                      Date
                    </Typography>
                    <DatePicker
                      selected={editDate}
                      onChange={(date) => {
                        setStartDate(date);
                        // handleGetLastRefNo(date); // Call when the date is selected
                      }}
                      dateFormat="dd/MM/yyyy"
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
                      value={editSupplier}
                      // onChange={(e) => setSaveSupplier(e.target.value)}
                      component="select"
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
                      {supplier.map((supplierItem) => (
                        <option key={supplierItem.supplier_code} value={supplierItem.supplier_code}>
                          {supplierItem.supplier_name}
                        </option>
                      ))}
                    </Box>
                  </Grid2>
                  <Grid2 item size={{ xs: 12, md: 6 }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                      Branch
                    </Typography>
                    <Box
                      // onChange={(e) => setSaveBranch(e.target.value)}
                      value={editBranch}
                      component="select"
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
                      id="branch"
                    >
                      <option value="">Select a branch</option>
                      {branch.map((branchItem) => (
                        <option key={branchItem.branch_code} value={branchItem.branch_code}>
                          {branchItem.branch_name}
                        </option>
                      ))}

                    </Box>
                  </Grid2>
                </Grid2>
                <Divider sx={{ mt: '24px' }} />
                <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', p: '24px 0px' }}>
                  <Typography sx={{ fontSize: '20px', fontWeight: '600' }}>
                    Current Order
                  </Typography>
                  <Typography sx={{ ml: 'auto' }}>
                    Product Search
                  </Typography>
                  <TextField
                    value={searchTerm}
                    onKeyUp={handleSearchChange}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    // onChange={handleSearchChange}
                    placeholder="Search"
                    sx={{

                      '& .MuiInputBase-root': {
                        height: '30px',
                        width: '100%'
                      },
                      '& .MuiOutlinedInput-input': {
                        padding: '8.5px 14px',
                      },
                      width: '50%',
                      ml: '12px'
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#5A607F' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button sx={{ ml: 'auto', bgcolor: '#E2EDFB', borderRadius: '6px', width: '105px' }}>
                    Clear All
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', p: '12px 0px', justifyContent: 'center', alignItems: 'center' }}>

                </Box>

                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}>
                  <table style={{ width: '100%', marginTop: '24px' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '4px', fontSize: '14px', width: '1%', color: '#754C27', fontWeight: '800' }}>No.</th>
                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '15%', color: '#754C27', fontWeight: '800' }}>Product code</th>
                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '15%', color: '#754C27', fontWeight: '800' }}>Product name</th>
                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Quantity</th>
                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '10%', color: '#754C27', fontWeight: '800' }}>Unit</th>
                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Unit Price</th>
                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Total</th>
                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '1%', color: '#754C27', fontWeight: '800' }}></th>
                      </tr>
                      <tr>
                        <td colSpan="8">
                          <Divider sx={{ width: '100%', color: '#C6C6C6', border: '1px solid #C6C6C6' }} />
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      {editProduct.map((product, index) => (
                        <tr key={product.product_code}>
                          <td style={{ padding: '4px', fontSize: '12px', fontWeight: '800' }}>{index + 1}</td>
                          <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>{product.product_code}</td>
                          <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>{product.tbl_product.product_name}</td>
                          <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                            <input
                              type="number"
                              value={product.qty}
                              // onChange={(e) => handleQuantityChange(product.product_code, e.target.value)}
                              style={{ width: '50px', textAlign: 'center', fontWeight: '600' }}
                            />
                          </td>
                          <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                            <select
                              value={product.tbl_product.unit_code}
                            // onChange={(e) => handleUnitChange(product.product_code, e.target.value)}
                            >
                              <option value={product.tbl_product.productUnit1.unit_code}>{product.tbl_product.productUnit1.unit_name}</option>
                              <option value={product.tbl_product.productUnit2.unit_code}>{product.tbl_product.productUnit2.unit_name}</option>
                            </select>
                          </td>
                          <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                            {/* {units[product.product_code] === product.unit_code
                              ? product.bulk_unit_price
                              : product.retail_unit_price} */}
                            {product.uprice}
                          </td>
                          <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                            {product.amt}
                          </td>
                          <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
                            <IconButton
                            // onClick={() => handleDeleteWhProduct(product.product_code)}
                            >
                              <CancelIcon />
                            </IconButton>
                          </td> {/* เพิ่มช่องนี้สำหรับ IconButton */}
                        </tr>

                      ))}
                    </tbody>
                  </table>

                </Box>
                <Box sx={{ width: '100%', height: '145px', bgcolor: '#EAB86C', borderRadius: '10px', p: '18px' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Typography sx={{ color: '#FFFFFF' }}>
                      Subtotal
                    </Typography>
                    <Typography sx={{ color: '#FFFFFF', ml: 'auto' }}>
                      $100.50
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: '8px' }}>
                    <Typography sx={{ color: '#FFFFFF' }}>
                      Tax(12%)
                    </Typography>
                    <Typography sx={{ color: '#FFFFFF', ml: 'auto' }}>
                      $11.50
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: '8px' }}>
                    <Typography sx={{ color: '#FFFFFF', fontSize: '30px', fontWeight: '600' }}>
                      Total
                    </Typography>
                    <Typography sx={{ color: '#FFFFFF', ml: 'auto', fontSize: '30px', fontWeight: '600' }}>
                      $93.46
                    </Typography>
                  </Box>
                </Box>
                <Button
                  // onClick={handleSaveWhposdt}
                  sx={{ width: '100%', height: '48px', mt: '24px', bgcolor: '#754C27', color: '#FFFFFF' }}>
                  Save
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

