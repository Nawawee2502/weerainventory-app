import { Box, Button, InputAdornment, TextField, Typography, tableCellClasses, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Checkbox,Switch } from '@mui/material';
import React, { useState } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';

// Custom DatePicker Input Component
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
                    <InputAdornment position="start">
                        <CalendarTodayIcon
                            sx={{
                                color: '#754C27',
                                cursor: 'pointer'
                            }}
                        />
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

export default function PurchaseOrderToWarehouse({ onCreate }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState(new Date());
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(1);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDateChange = (date) => {
        setFilterDate(date);
    };

    const clearFilters = () => {
        setFilterDate(new Date());
        setSearchTerm("");
    };

    const handleDeleteSelected = () => {
        // Add delete functionality here
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button
                onClick={() => {
                    console.log("Create button clicked");
                    onCreate();
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
                    width: '90%',
                    gap: '20px'
                }}
            >
                {/* <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                    Search
                </Typography> */}
                <TextField
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search"
                    sx={{
                        '& .MuiInputBase-root': {
                            height: '40px',
                            width: '100%'
                        },
                        '& .MuiOutlinedInput-input': {
                            padding: '8.5px 14px',
                        },
                        width: '35%'
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#5A607F' }} />
                            </InputAdornment>
                        ),
                    }}
                />
                
                {/* <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                    Restaurant
                </Typography> */}
                <Box
                  component="select"
                  sx={{
                    mt: '0px',
                    width: '40%',
                    height: '40px',
                    borderRadius: '4px',
                    padding: '0 14px',
                    // border: '1px solid rgba(0, 0, 0, 0.23)',
                    fontSize: '16px',
                    '&:focus': {
                      outline: 'none',
                      borderColor: '#754C27',
                    },
                    '& option': {
                      fontSize: '16px',
                    },
                  }}
                  id="cammisary kitchen"
                >
                  <option value="">Select a cammisary Kitchen</option>
                  {/* {branch.map((branchItem) => (
                    <option key={branchItem.branch_code} value={branchItem.branch_code}>
                      {branchItem.branch_name}
                    </option>
                  ))} */}

                </Box>
                <Box sx={{ width: '230px' }}>
                    <DatePicker
                        selected={filterDate}
                        onChange={handleDateChange}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Filter by date"
                        customInput={<CustomInput />}
                        popperClassName="custom-popper"
                    />
                </Box>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Switch
                                //  checked={excludePrice}
                                //  onChange={(e) => setExcludePrice(e.target.checked)}
                                />
                                <Typography sx={{ fontWeight: '500', color: '#7E84A3' }}>
                                    Exclude price in file
                                </Typography>
                            </Box>
                           </Box> 
            </Box>
                

            {/* <Box sx={{ width: '100%', mt: '24px' }}>
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteSelected}
                    sx={{ mt: 2 }}
                    disabled={selected.length === 0}
                >
                    Delete Selected ({selected.length})
                </Button>
            </Box> */}

           

            <TableContainer component={Paper} sx={{ width: '100%', mt: '24px' }}>
                <Table sx={{}} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell sx={{ width: '1%', textAlign: 'center' }}>
                                <Checkbox
                                />
                            </StyledTableCell>
                            <StyledTableCell width='1%'>No.</StyledTableCell>
                            <StyledTableCell align="center">Ref.no</StyledTableCell>
                            <StyledTableCell align="center">Date</StyledTableCell>
                            <StyledTableCell align="center">Kitchen</StyledTableCell>
                            <StyledTableCell align="center">Amount</StyledTableCell>
                            <StyledTableCell align="center">Username</StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Table data will go here */}
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
    );
}