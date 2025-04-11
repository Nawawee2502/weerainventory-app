import { Box, Button, InputAdornment, TextField, Typography, tableCellClasses, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Checkbox, IconButton } from '@mui/material';
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
import { wh_dpkAlljoindt, deleteWh_dpk } from '../../../api/warehouse/wh_dpkApi';
import Swal from 'sweetalert2';
import { pdf } from '@react-pdf/renderer';
import { generateKitchenPDF } from './Wh_dpkPDF';
import { Wh_dpkByRefno } from '../../../api/warehouse/wh_dpkApi';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

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

export default function DispatchToKitchen({ onCreate, onEdit }) {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState(new Date());
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(1);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [excludePrice, setExcludePrice] = useState(false);

    const limit = 5;

    useEffect(() => {
        fetchData();
    }, [page, searchTerm, filterDate]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const offset = (page - 1) * limit;

            // Format date for API
            const formattedDate = filterDate.toISOString().slice(0, 10).replace(/-/g, '');
            console.log("Querying for date:", formattedDate);

            const response = await dispatch(wh_dpkAlljoindt({
                offset,
                limit,
                rdate1: formattedDate,  // Using YYYYMMDD format for API
                rdate2: formattedDate,
                product_code: searchTerm
            })).unwrap();

            if (response.result && response.data) {
                setData(response.data);
                const totalPages = Math.ceil(response.data.length / limit);
                setCount(totalPages || 1);
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
                    await dispatch(deleteWh_dpk({ refno })).unwrap();
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
                        selected.map(refno => dispatch(deleteWh_dpk({ refno })).unwrap())
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

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleDateChange = (date) => {
        setFilterDate(date);
        setPage(1);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilterDate(new Date());
        setPage(1);
    };

    const handlePrintPDF = async (refno) => {
        try {
            Swal.fire({
                title: 'กำลังโหลดข้อมูล...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const orderResponse = await dispatch(Wh_dpkByRefno({ refno })).unwrap();

            console.log("API Response Data (Complete):", orderResponse);

            if (orderResponse.result && orderResponse.data) {
                const data = orderResponse.data;

                console.log("Products data:", data.wh_dpkdts);

                if (data.wh_dpkdts) {
                    console.log("Number of products:",
                        Array.isArray(data.wh_dpkdts) ?
                            data.wh_dpkdts.length :
                            (typeof data.wh_dpkdts === 'object' ?
                                Object.keys(data.wh_dpkdts).length :
                                'Not an array or object'));

                    // Sample data
                    if (Array.isArray(data.wh_dpkdts) && data.wh_dpkdts.length > 0) {
                        console.log("First product:", data.wh_dpkdts[0]);
                    } else if (typeof data.wh_dpkdts === 'object') {
                        console.log("First product:", data.wh_dpkdts[Object.keys(data.wh_dpkdts)[0]]);
                    }
                } else {
                    console.log("No products data found in API response");
                }

                // Pass the includePrices parameter (false when excludePrice is true)
                const pdfContent = await generateKitchenPDF(refno, data, !excludePrice);

                if (pdfContent) {
                    Swal.close();
                    const asBlob = await pdf(pdfContent).toBlob();
                    const url = URL.createObjectURL(asBlob);
                    window.open(url, '_blank');
                } else {
                    throw new Error("Failed to generate PDF content");
                }
            } else {
                throw new Error("Order data not found or invalid");
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error generating PDF',
                text: error.message || 'Please try again later',
                confirmButtonText: 'OK'
            });
        }
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
                <Box sx={{ width: '200px' }}>
                    <DatePicker
                        selected={filterDate}
                        onChange={handleDateChange}
                        dateFormat="MM/dd/yyyy"
                        placeholderText="MM/DD/YYYY"
                        customInput={<CustomInput />}
                    />
                </Box>
                <Button
                    onClick={clearFilters}
                    variant="outlined"
                    sx={{
                        height: '38px',
                        width: '120px',
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
                <FormControlLabel
                    control={
                        <Switch
                            checked={excludePrice}
                            onChange={(e) => setExcludePrice(e.target.checked)}
                        />
                    }
                    label="Exclude price in PDF"
                    sx={{ color: '#7E84A3', '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
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
                                    checked={data.length > 0 && selected.length === data.length}
                                    onChange={handleSelectAll}
                                />
                            </StyledTableCell>
                            <StyledTableCell width='1%'>No.</StyledTableCell>
                            <StyledTableCell align="center">From Ref.no</StyledTableCell>
                            <StyledTableCell align="center">Ref.no</StyledTableCell>
                            <StyledTableCell align="center">Date</StyledTableCell>
                            <StyledTableCell align="center">Kitchen</StyledTableCell>
                            <StyledTableCell align="center">Total Due</StyledTableCell>
                            <StyledTableCell align="center">Username</StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={11} align="center">Loading...</TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} align="center">No data found</TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, index) => {
                                const isSelected = selected.indexOf(row.refno) !== -1;
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
                                        <StyledTableCell align="center">{row.refno1}</StyledTableCell>
                                        <StyledTableCell align="center">{row.refno}</StyledTableCell>
                                        <StyledTableCell align="center">{row.rdate}</StyledTableCell>
                                        <StyledTableCell align="center">{row.tbl_kitchen?.kitchen_name}</StyledTableCell>
                                        <StyledTableCell align="center">{row.total.toFixed(2)}</StyledTableCell>
                                        <StyledTableCell align="center">{row.user?.username}</StyledTableCell>
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
                                                onClick={() => handlePrintPDF(row.refno)}
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
};