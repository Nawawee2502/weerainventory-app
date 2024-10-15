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
import { addBranch, deleteBranch, updateBranch, branchAll, countBranch, searchBranch, lastBranchCode } from '../../api/branchApi';
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { errorHelper } from "../handle-input-error";
import { Alert, AlertTitle } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Swal from 'sweetalert2';
import PrintIcon from '@mui/icons-material/Print';

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


export default function PurchaseOrderToSupplier() {
  const [selected, setSelected] = useState([]);
  const dispatch = useDispatch();
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [branch, setBranch] = useState([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [getLastBranchCode, setGetLastBranchCode] = useState([]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (searchTerm) {
      dispatch(searchBranch({ branch_name: searchTerm }))
        .unwrap()
        .then((res) => {
          setBranch(res.data);
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
    refetchData();
    let offset = 0;
    let limit = 5;
    let test = 10;
    dispatch(branchAll({ offset, limit }))
      .unwrap()
      .then((res) => {
        console.log(res.data);
        let resultData = res.data;
        for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
          resultData[indexArray].id = indexArray + 1;
        }
        setBranch(resultData);
        console.log(resultData);

      })
      .catch((err) => err.message);

    dispatch(lastBranchCode({ test }))
      .unwrap()
      .then((res) => {
        setGetLastBranchCode(res.data);
        console.log(res.data)
      })
      .catch((err) => err.message);

    dispatch(countBranch({ test }))
      .unwrap()
      .then((res) => {
        console.log(res.data);
        let resData = res.data;
        let countPaging = Math.floor(resData / 5);
        let modPaging = resData % 5;
        if (modPaging > 0) {
          countPaging++
        }
        console.log(countPaging, modPaging);
        setCount(countPaging);
      })
      .catch((err) => err.message);
  }, [dispatch]);

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


  const [openDrawer, setOpenDrawer] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);

  const toggleDrawer = (openDrawer) => () => {
    setOpenDrawer(openDrawer);
    handleGetLastCode();
  };

  const toggleEditDrawer = (openEditDrawer) => () => {
    setOpenEditDrawer(openEditDrawer);
  };

  const [editBranch, setEditBranch] = useState(null);

  const handleEdit = (row) => {
    setEditBranch(row);
    formik.setValues({
      branch_code: row.branch_code,
      branch_name: row.branch_name,
      addr1: row.addr1,
      addr2: row.addr2,
      tel1: row.tel1,
    });
    toggleEditDrawer(true)();
  };

  const handleSave = () => {
    dispatch(updateBranch(formik.values))
      .unwrap()
      .then((res) => {
        setAlert({ open: true, message: 'Updated success', severity: 'success' });
        refetchData();
        toggleEditDrawer(false)();
        setTimeout(() => {
          setAlert((prev) => ({ ...prev, open: false }));
        }, 3000);
      })
      .catch((err) => {
        setAlert({ open: true, message: 'Updated Error', severity: 'error' });
        setTimeout(() => {
          setAlert((prev) => ({ ...prev, open: false }));
        }, 3000);
      });
  };

  const handleGetLastCode = () => {
    let test = "";
    dispatch(lastBranchCode({ test }))
      .unwrap()
      .then((res) => {
        let lastBranchCode = "001";

        if (res.data && res.data.branch_code) {
          lastBranchCode = "" + (Number(res.data.branch_code) + 1);

          if (lastBranchCode.length === 1) {
            lastBranchCode = "00" + lastBranchCode;
          } else if (lastBranchCode.length === 2) {
            lastBranchCode = "0" + lastBranchCode;
          }
        }

        setGetLastBranchCode(lastBranchCode);
        formik.setValues({
          branch_code: lastBranchCode,
        });
      })
      .catch((err) => {
        console.error("Error fetching last branch code:", err.message);
      });
  };


  const formik = useFormik({
    initialValues: {
      branch_code: "",
      branch_name: "",
      addr1: "",
      addr2: "",
      tel1: "",
    },
    validate: (values) => {
      let errors = {};

      if (!values.branch_name) {
        errors.branch_name = 'branch_name cannot be empty';
      }
      if (!values.addr1) {
        errors.addr1 = 'addr1 cannot be empty';
      }
      if (!values.addr2) {
        errors.addr2 = 'addr2 cannot be empty';
      }
      if (!values.tel1) {
        errors.tel1 = 'tel1 cannot be empty';
      }

      return errors;
    },
    onSubmit: (values) => {
      dispatch(addBranch(values))
        .unwrap()
        .then((res) => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'เพิ่มข้อมูลสำเร็จ',
            timer: 1000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          formik.resetForm();
          refetchData();
          handleGetLastCode();

          setTimeout(() => {
            setAlert((prev) => ({ ...prev, open: false }));
          }, 3000);

        })
        .catch((err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        });
    },
  });

  return (
    <>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Button
          onClick={toggleDrawer(true)}
          sx={{
            width: '209px',
            height: '70px',
            background: 'linear-gradient(180deg, #AD7A2C 0%, #754C27 100%)',
            borderRadius: '15px',
            boxShadow: '0px 4px 4px 0px #00000040',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
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
            Branch Search
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
        <Box sx={{ width: '60%', mt: '24px' }}>
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
        <TableContainer component={Paper} sx={{ width: '80%', mt: '24px' }}>
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
              {branch.map((row) => (
                <StyledTableRow key={row.branch_code}>
                  <StyledTableCell padding="checkbox" align="center">
                    <Checkbox
                      checked={selected.includes(row.branch_code)}
                      onChange={(event) => handleCheckboxChange(event, row.branch_code)}
                    />
                  </StyledTableCell>
                  <StyledTableCell component="th" scope="row" >
                    {row.id}
                  </StyledTableCell>
                  <StyledTableCell align="center">{row.branch_code}</StyledTableCell>
                  <StyledTableCell align="center">{row.branch_name}</StyledTableCell>
                  <StyledTableCell align="center">{row.addr1} {row.addr2}</StyledTableCell>
                  <StyledTableCell align="center">{row.tel1}</StyledTableCell>
                  <StyledTableCell align="center">{row.tel1}</StyledTableCell>
                  <StyledTableCell align="center">{row.tel1}</StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      color="primary"
                      size="md"
                      onClick={() => handleEdit(row)} // เรียกใช้ฟังก์ชัน handleEdit
                      sx={{ border: '1px solid #AD7A2C', borderRadius: '7px' }}
                    >
                      <EditIcon sx={{ color: '#AD7A2C' }} />
                    </IconButton>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      color="danger"
                      size="md"
                      onClick={() => handleDelete(row.branch_code)} // Use a function to handle delete
                      sx={{ border: '1px solid #F62626', borderRadius: '7px' }}
                    >
                      <DeleteIcon sx={{ color: '#F62626' }} />
                    </IconButton>

                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      color="danger"
                      size="md"
                      // onClick={() => handleDelete(row.branch_code)} // Use a function to handle delete
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
        open={openDrawer}
        onClose={toggleDrawer(false)}
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
            width: '35%',
            borderRadius: '20px',
            // border: '1px solid #E4E4E4',
            bgcolor: '#FAFAFA',
          },
        }}
      >
        <Box
          sx={{
            width: '100%',
            mt: '60px',
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
            }}>
            <Box sx={{ width: '90%', mt: '24px' }}>
              <Grid2 container spacing={5}>
                <Grid2 item size={{ xs: 12, md: 6 }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                    Ref.no
                  </Typography>
                  <TextField
                    size="small"
                    placeholder='Ref.no'
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid2>
                <Grid2 item size={{ xs: 12, md: 6 }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                    Date
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="Date"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid2>
                <Grid2 item size={{ xs: 12, md: 6 }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                    Supplier
                  </Typography>
                  <TextField
                    size="small"
                    placeholder='Suppllier'
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid2>
                <Grid2 item size={{ xs: 12, md: 6 }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                    Branch
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="Branch"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid2>
                <Grid2 item size={{ xs: 12, md: 6 }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                    Username
                  </Typography>
                  <TextField
                    size="small"
                    placeholder='Username'
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid2>
                <Grid2 item size={{ xs: 12, md: 6 }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                    Recorded date and time
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="Recorded date and time"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid2>
              </Grid2>
              <Divider sx={{ mt: '24px' }} />
              <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', p: '24px 0px' }}>
                <Typography sx={{ fontSize: '20px', fontWeight: '600' }}>
                  Current Order
                </Typography>
                <Button sx={{ ml: 'auto', bgcolor: '#E2EDFB', borderRadius: '6px', width: '105px' }}>
                  Clear All
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', p: '12px 0px', justifyContent: 'center', alignItems: 'center' }}>
                <Typography>
                  Product Search
                </Typography>
                <TextField
                  // value={searchTerm}
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
              <Button sx={{ width:'100%', height:'48px', mt:'24px', bgcolor:'#754C27', color:'#FFFFFF' }}>
                Save
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
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
            width: '25%',
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
              position: 'absolute',
              top: '48px',
              left: '0',
              width: '129px',
              bgcolor: '#AD7A2C',
              color: '#FFFFFF',
              px: '8px',
              py: '4px',
              borderRadius: '20px',
              fontWeight: 'bold',
              zIndex: 1,
              height: '89px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontWeight: '600', fontSize: '14px' }} >
              Branch
            </Typography>
          </Box>
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
            }}>

            <Typography sx={{ display: 'flex', flexDirection: 'row' }}>
              Branch ID :
              <Typography sx={{ color: '#754C27', ml: '12px' }}>
                #011
              </Typography>
            </Typography>
            <Box sx={{ width: '80%', mt: '24px' }}>
              <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                EDIT Branch Id
              </Typography>
              <TextField
                size="small"
                placeholder="Id"
                sx={{
                  mt: '8px',
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
                {...formik.getFieldProps("branch_code")}
                {...errorHelper(formik, "branch_code")}
              />
              <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                Branch Name
              </Typography>
              <TextField
                size="small"
                placeholder="Name"
                sx={{
                  mt: '8px',
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
                {...formik.getFieldProps("branch_name")}
                {...errorHelper(formik, "branch_name")}
              />
              <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                Address
              </Typography>
              <TextField
                size="small"
                placeholder="Address"
                sx={{
                  mt: '8px',
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
                {...formik.getFieldProps("addr1")}
                {...errorHelper(formik, "addr1")}
              />
              <TextField
                size="small"
                placeholder="Address"
                sx={{
                  mt: '8px',
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
                {...formik.getFieldProps("addr2")}
                {...errorHelper(formik, "addr2")}
              />
              <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt: '18px' }}>
                Telephone
              </Typography>
              <TextField
                size="small"
                placeholder="Telephone"
                sx={{
                  mt: '8px',
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
                {...formik.getFieldProps("tel1")}
                {...errorHelper(formik, "tel1")}
              />
            </Box>
            <Box sx={{ mt: '24px' }} >
              <Button variant='contained'
                sx={{
                  width: '100px',
                  bgcolor: '#F62626',
                  '&:hover': {
                    bgcolor: '#D32F2F',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                sx={{
                  width: '100px',
                  backgroundColor: '#AD7A2C',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: '#8C5D1E',
                  },
                  ml: '24px'
                }}
              >
                Save
              </Button>

            </Box>
          </Box>
        </Box>
      </Drawer>
      {alert.open && (
        <Alert severity={alert.severity} onClose={() => setAlert({ ...alert, open: false })}>
          <AlertTitle>{alert.severity === 'success' ? 'Success' : 'Error'}</AlertTitle>
          {alert.message}
        </Alert>
      )}
    </>
  );
}

