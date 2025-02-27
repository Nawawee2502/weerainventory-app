import { Box, Button, InputAdornment, TextField, Typography, tableCellClasses, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Checkbox, IconButton, Switch } from '@mui/material';
import React, { useState, useEffect } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import { styled } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import { useDispatch } from 'react-redux';
import { Kt_rfwAlljoindt, deleteKt_rfw } from '../../../../api/kitchen/kt_rfwApi';
import { branchAll } from '../../../../api/branchApi';
import { supplierAll } from '../../../../api/supplierApi';
import { searchProductName } from '../../../../api/productrecordApi';
import Swal from 'sweetalert2';

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
      placeholder={placeholder}
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

export default function GoodsReceiptWarehouse({ onCreate, onEdit }) {
  const dispatch = useDispatch();
  const [searchBranch, setSearchBranch] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [branches, setBranches] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date());
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [excludePrice, setExcludePrice] = useState(false);
  const limit = 5;

  // Load branches and suppliers on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load branches
        const branchResponse = await dispatch(branchAll({ offset: 0, limit: 100 })).unwrap();
        if (branchResponse.result && branchResponse.data) {
          setBranches(branchResponse.data);
        }

        // Load suppliers
        const supplierResponse = await dispatch(supplierAll({ offset: 0, limit: 100 })).unwrap();
        if (supplierResponse.result && supplierResponse.data) {
          setSuppliers(supplierResponse.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load initial data'
        });
      }
    };
    loadData();
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [page, searchBranch, searchSupplier, searchProduct, filterDate]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const offset = (page - 1) * limit;

      const formattedDate = filterDate.toISOString().slice(0, 10).replace(/-/g, '');

      const response = await dispatch(Kt_rfwAlljoindt({
        offset,
        limit,
        rdate1: formattedDate,
        rdate2: formattedDate,
        branch_code: searchBranch,
        supplier_code: searchSupplier,
        product_code: searchProduct
      })).unwrap();

      if (response.result && response.data) {
        setData(response.data);
        const totalPages = Math.ceil(response.data.length / limit);
        setCount(totalPages || 1);
        console.log(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch data'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (refno) => {
    try {
      await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await dispatch(deleteKt_rfw({ refno })).unwrap();
          Swal.fire(
            'Deleted!',
            'Record has been deleted.',
            'success'
          );
          fetchData();
        }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete record'
      });
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = data.map(row => row.refno);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (event, refno) => {
    const selectedIndex = selected.indexOf(refno);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, refno);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleDeleteSelected = async () => {
    try {
      await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete them!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await Promise.all(
            selected.map(refno => dispatch(deleteKt_rfw({ refno })).unwrap())
          );
          Swal.fire(
            'Deleted!',
            'Records have been deleted.',
            'success'
          );
          setSelected([]);
          fetchData();
        }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete records'
      });
    }
  };

  const handleSearchBranchChange = (e) => {
    setSearchBranch(e.target.value);
    setPage(1);
  };

  const handleSearchSupplierChange = (e) => {
    setSearchSupplier(e.target.value);
    setPage(1);
  };

  const handleSearchProductChange = async (e) => {
    const value = e.target.value;
    setSearchProduct(value);
    setPage(1);

    if (value.length > 0) {
      try {
        const response = await dispatch(searchProductName({ product_name: value })).unwrap();
        if (response.data) {
          setSearchResults(response.data);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Error searching products:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to search products'
        });
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleDateChange = (date) => {
    setFilterDate(date);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchBranch("");
    setSearchSupplier("");
    setSearchProduct("");
    setFilterDate(new Date());
    setPage(1);
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: '48px', width: '90%', gap: '20px' }}>
        {/* Branch Dropdown */}
        <Box
          component="select"
          value={searchBranch}
          onChange={handleSearchBranchChange}
          sx={{
            height: '38px',
            width: '25%',
            borderRadius: '4px',
            border: '1px solid rgba(0, 0, 0, 0.23)',
            padding: '0 14px',
            backgroundColor: '#fff'
          }}
        >
          <option value="">All Branches</option>
          {branches.map((branch) => (
            <option key={branch.branch_code} value={branch.branch_code}>
              {branch.branch_name}
            </option>
          ))}
        </Box>

        {/* Supplier Dropdown */}
        <Box
          component="select"
          value={searchSupplier}
          onChange={handleSearchSupplierChange}
          sx={{
            height: '38px',
            width: '25%',
            borderRadius: '4px',
            border: '1px solid rgba(0, 0, 0, 0.23)',
            padding: '0 14px',
            backgroundColor: '#fff'
          }}
        >
          <option value="">All Suppliers</option>
          {suppliers.map((supplier) => (
            <option key={supplier.supplier_code} value={supplier.supplier_code}>
              {supplier.supplier_name}
            </option>
          ))}
        </Box>

        {/* Product Search with Autocomplete */}
        <Box sx={{ position: 'relative' }}>
          <TextField
            value={searchProduct}
            onChange={handleSearchProductChange}
            placeholder="Search Product"
            sx={{
              '& .MuiInputBase-root': { height: '38px', width: '100%' },
              '& .MuiOutlinedInput-input': { padding: '8.5px 14px' }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#5A607F' }} />
                </InputAdornment>
              ),
            }}
          />
          {showDropdown && searchResults.length > 0 && (
            <Box sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              borderRadius: '4px',
              zIndex: 1000,
              maxHeight: '200px',
              overflowY: 'auto',
              mt: '4px'
            }}>
              {searchResults.map((product) => (
                <Box
                  key={product.product_code}
                  onClick={() => {
                    setSearchProduct(product.product_name);
                    setShowDropdown(false);
                    fetchData();
                  }}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    },
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <Typography>{product.product_name}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        <Box sx={{ width: '200px' }}>
          <DatePicker
            selected={filterDate}
            onChange={handleDateChange}
            dateFormat="MM/dd/yyyy"
            placeholderText="MM/DD/YYYY"
            customInput={<CustomInput />}
            popperClassName="custom-popper"
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={excludePrice}
              onChange={(e) => setExcludePrice(e.target.checked)}
            />
            <Typography sx={{ fontWeight: '500', color: '#7E84A3' }}>
              Exclude price in file
            </Typography>
          </Box>
        </Box>
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
                  checked={data.length > 0 && selected.length === data.length}
                  onChange={handleSelectAll}
                />
              </StyledTableCell>
              <StyledTableCell width='1%'>No.</StyledTableCell>
              <StyledTableCell align="center">Ref.no</StyledTableCell>
              <StyledTableCell align="center">Date</StyledTableCell>
              <StyledTableCell align="center">Branch</StyledTableCell>
              <StyledTableCell align="center">Supplier</StyledTableCell>
              <StyledTableCell align="center">Total Amount</StyledTableCell>
              <StyledTableCell align="center">Username</StyledTableCell>
              <StyledTableCell width='1%' align="center"></StyledTableCell>
              <StyledTableCell width='1%' align="center"></StyledTableCell>
              <StyledTableCell width='1%' align="center"></StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} align="center">Loading...</TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">No data found</TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const isSelected = selected.indexOf(row.refno) !== -1;
                const branchName = row.branch_name || row.branch?.branch_name || '-';
                const supplierName = row.supplier_name || row.supplier?.supplier_name || '-';

                return (
                  <StyledTableRow key={row.refno}>
                    <StyledTableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) => handleSelectOne(event, row.refno)}
                      />
                    </StyledTableCell>
                    <StyledTableCell component="th" scope="row">
                      {((page - 1) * limit) + index + 1}
                    </StyledTableCell>
                    <StyledTableCell align="center">{row.refno}</StyledTableCell>
                    <StyledTableCell align="center">{row.rdate}</StyledTableCell>
                    <StyledTableCell align="center">{branchName}</StyledTableCell>
                    <StyledTableCell align="center">{supplierName}</StyledTableCell>
                    <StyledTableCell align="center">{row.total.toFixed(2)}</StyledTableCell>
                    <StyledTableCell align="center">{row.user?.username || '-'}</StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton
                        onClick={() => onEdit(row.refno)}
                        sx={{ border: '1px solid #AD7A2C', borderRadius: '7px' }}
                      >
                        <EditIcon sx={{ color: '#AD7A2C' }} />
                      </IconButton>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton
                        onClick={() => handleDelete(row.refno)}
                        sx={{ border: '1px solid #F62626', borderRadius: '7px' }}
                      >
                        <DeleteIcon sx={{ color: '#F62626' }} />
                      </IconButton>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton
                        onClick={() => {/* Add print functionality later */ }}
                        sx={{ border: '1px solid #5686E1', borderRadius: '7px' }}
                      >
                        <PrintIcon sx={{ color: '#5686E1' }} />
                      </IconButton>
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack spacing={2} sx={{ mt: 2, mb: 4, display: 'flex', alignItems: 'center' }}>
        <Pagination
          count={count}
          page={page}
          onChange={(event, value) => setPage(value)}
          shape="rounded"
          showFirstButton
          showLastButton
        />
      </Stack>
    </Box>
  );
}