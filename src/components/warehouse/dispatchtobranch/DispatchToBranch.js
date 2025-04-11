import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import { tableCellClasses } from '@mui/material/TableCell';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import { pdf } from '@react-pdf/renderer';
import { generatePDF } from './Wh_dpbPDF';
import { Wh_dpbByRefno } from '../../../api/warehouse/wh_dpbApi';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import { styled } from '@mui/material/styles';
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useDispatch } from 'react-redux';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { wh_dpbAlljoindt, deleteWh_dpb } from '../../../api/warehouse/wh_dpbApi';
import Swal from 'sweetalert2';
import debounce from 'lodash/debounce';

const formatDate = (date) => {
    if (!date) return "";
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

// Styles
const STYLES = {
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    createButton: {
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
    },
    searchContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mt: '48px',
        width: '90%',
        gap: '20px'
    }
};

// Styled Components
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

// Custom Components
const CustomInput = memo(React.forwardRef(({ value, onClick, placeholder }, ref) => (
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
)));

// Memoized Table Row Component


// Main Component
export default function DispatchToBranch({ onCreate, onEdit }) {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState(new Date());
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(1);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const limit = 5;

    const [excludePrice, setExcludePrice] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const offset = (page - 1) * limit;
            const formattedDate = filterDate.toISOString().slice(0, 10).replace(/-/g, '');

            const response = await dispatch(wh_dpbAlljoindt({
                offset,
                limit,
                rdate1: formattedDate,
                rdate2: formattedDate,
                product_code: searchTerm
            })).unwrap();

            if (response.result && response.data) {
                setData(response.data);
                setCount(Math.ceil(response.data.length / limit) || 1);
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
    }, [dispatch, page, searchTerm, filterDate, limit]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handlers
    const handleDelete = useCallback(async (refno) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                await dispatch(deleteWh_dpb({ refno })).unwrap();
                Swal.fire('Deleted!', 'Record has been deleted.', 'success');
                fetchData();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete record'
            });
        }
    }, [dispatch, fetchData]);

    const handleSelectAll = useCallback((event) => {
        setSelected(event.target.checked ? data.map(row => row.refno) : []);
    }, [data]);

    const handleSelectOne = useCallback((event, refno) => {
        setSelected(prev =>
            prev.includes(refno)
                ? prev.filter(id => id !== refno)
                : [...prev, refno]
        );
    }, []);

    const handleDeleteSelected = useCallback(async () => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete them!'
            });

            if (result.isConfirmed) {
                await Promise.all(
                    selected.map(refno => dispatch(deleteWh_dpb({ refno })).unwrap())
                );
                Swal.fire('Deleted!', 'Records have been deleted.', 'success');
                setSelected([]);
                fetchData();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete records'
            });
        }
    }, [dispatch, selected, fetchData]);

    const debouncedSearch = useCallback(
        debounce((value) => {
            setSearchTerm(value);
            setPage(1);
        }, 500),
        []
    );

    const handleSearchChange = (e) => {
        debouncedSearch(e.target.value);
    };

    const handleDateChange = useCallback((date) => {
        setFilterDate(date);
        setPage(1);
    }, []);

    const clearFilters = useCallback(() => {
        setSearchTerm("");
        setFilterDate(new Date());
        setPage(1);
    }, []);

    // Memoized Values
    const memoizedData = useMemo(() => {
        return data.map((row, index) => ({
            ...row,
            rowNumber: ((page - 1) * limit) + index + 1,
            isSelected: selected.includes(row.refno)
        }));
    }, [data, page, limit, selected]);

    const handlePrintPDF = async (refno) => {
        try {
            Swal.fire({
                title: 'กำลังโหลดข้อมูล...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const orderResponse = await dispatch(Wh_dpbByRefno({ refno })).unwrap();

            console.log("API Response Data (Complete):", orderResponse);

            if (orderResponse.result && orderResponse.data) {
                const data = orderResponse.data;

                console.log("Products data:", data.wh_dpbdts);

                if (data.wh_dpbdts) {
                    console.log("Number of products:",
                        Array.isArray(data.wh_dpbdts) ?
                            data.wh_dpbdts.length :
                            (typeof data.wh_dpbdts === 'object' ?
                                Object.keys(data.wh_dpbdts).length :
                                'Not an array or object'));

                    // ข้อมูลตัวอย่าง
                    if (Array.isArray(data.wh_dpbdts) && data.wh_dpbdts.length > 0) {
                        console.log("First product:", data.wh_dpbdts[0]);
                    } else if (typeof data.wh_dpbdts === 'object') {
                        console.log("First product:", data.wh_dpbdts[Object.keys(data.wh_dpbdts)[0]]);
                    }
                } else {
                    console.log("No products data found in API response");
                }

                // ตรงนี้ต้องส่งพารามิเตอร์ includePrices ไปด้วย (เป็น false เมื่อ excludePrice เป็น true)
                // เพิ่ม parameter ตัวที่ 3 เป็น !excludePrice
                const pdfContent = await generatePDF(refno, data, !excludePrice);

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

    // Render
    return (
        <Box sx={STYLES.container}>
            <Button onClick={onCreate} sx={STYLES.createButton}>
                <AddCircleIcon sx={{ fontSize: '42px', color: '#FFFFFF', mr: '12px' }} />
                <Typography sx={{ fontSize: '24px', fontWeight: '600', color: '#FFFFFF' }}>
                    Create
                </Typography>
            </Button>

            <Box sx={STYLES.searchContainer}>
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

            {selected.length > 0 && (
                <Box sx={{ width: '100%', mt: '24px' }}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteSelected}
                    >
                        Delete Selected ({selected.length})
                    </Button>
                </Box>
            )}

            <TableContainer component={Paper} sx={{ width: '100%', mt: '24px' }}>
                <Table>
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
                            <StyledTableCell align="center">Restaurant</StyledTableCell>
                            <StyledTableCell align="center">Total Due</StyledTableCell>
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
                        ) : memoizedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} align="center">No data found</TableCell>
                            </TableRow>
                        ) : (
                            memoizedData.map((row) => (
                                <StyledTableRow key={row.refno}>
                                    <StyledTableCell padding="checkbox">
                                        <Checkbox
                                            checked={row.isSelected}
                                            onChange={(event) => handleSelectOne(event, row.refno)}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell component="th" scope="row">{row.rowNumber}</StyledTableCell>
                                    <StyledTableCell align="center">{row.refno1}</StyledTableCell>
                                    <StyledTableCell align="center">{row.refno}</StyledTableCell>
                                    <StyledTableCell align="center">{row.rdate}</StyledTableCell>
                                    <StyledTableCell align="center">{row.tbl_branch?.branch_name}</StyledTableCell>
                                    <StyledTableCell align="center">{row.total.toFixed(2)}</StyledTableCell>
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
                            ))
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