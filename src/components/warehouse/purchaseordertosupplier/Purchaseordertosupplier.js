import { Box, Button, InputAdornment, TextField, Typography, IconButton } from '@mui/material';
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
import PrintIcon from '@mui/icons-material/Print';
import { branchAll, deleteBranch } from '../../../api/branchApi';
import { wh_posAlljoindt } from '../../../api/warehouse/wh_posApi';
import { useDispatch } from "react-redux";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Swal from 'sweetalert2';

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
  const [branch, setBranch] = useState([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [whpos, setWhpos] = useState([]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleChange = (event, value) => {
    setPage(value);
    let page = value - 1;
    let offset = page * 5;
    let limit = value * 5;
    
    dispatch(branchAll({ offset, limit }))
      .unwrap()
      .then((res) => {
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
    dispatch(wh_posAlljoindt({ offset, limit }))
      .unwrap()
      .then((res) => {
        let resultData = res.data;
        for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
          resultData[indexArray].id = indexArray + 1;
        }
        setWhpos(resultData);
      })
      .catch((err) => console.log(err.message));
  };

  useEffect(() => {
    refetchData();
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
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted successfully',
              timer: 1500,
              showConfirmButton: false,
            });
            setTimeout(refetchData, 2000);
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
      }
    });
  };

  const handleEdit = (refno) => {
    onEdit(refno);
  };

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <Button
        onClick={onCreate}
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

      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mt: '48px',
        width: '60%'
      }}>
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
        <Table aria-label="customized table">
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
              <StyledTableCell width='1%'>No.</StyledTableCell>
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
                <StyledTableCell>{row.id}</StyledTableCell>
                <StyledTableCell align="center">{row.refno}</StyledTableCell>
                <StyledTableCell align="center">{row.rdate}</StyledTableCell>
                <StyledTableCell align="center">{row.supplier_code}</StyledTableCell>
                <StyledTableCell align="center">{row.branch_code}</StyledTableCell>
                <StyledTableCell align="center">{row.total}</StyledTableCell>
                <StyledTableCell align="center">{row.user_code}</StyledTableCell>
                <StyledTableCell align="center">
                  <IconButton
                    onClick={() => handleEdit(row.refno)}
                    sx={{ border: '1px solid #AD7A2C', borderRadius: '7px' }}
                  >
                    <EditIcon sx={{ color: '#AD7A2C' }} />
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <IconButton
                    onClick={() => handleDelete(row.branch_code)}
                    sx={{ border: '1px solid #F62626', borderRadius: '7px' }}
                  >
                    <DeleteIcon sx={{ color: '#F62626' }} />
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <IconButton
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
  );
}