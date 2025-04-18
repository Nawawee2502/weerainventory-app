import { Box, Button, InputAdornment, TextField, Typography, tableCellClasses, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Checkbox, IconButton } from '@mui/material';
import React, { useState, useEffect } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch } from "react-redux";
import Swal from 'sweetalert2';
import { wh_rfsAlljoindt, deleteWh_rfs, countwh_rfs, Wh_rfsByRefno } from '../../../api/warehouse/wh_rfsApi';
import { generateRFSPDF } from './ReceiptFromSupplierPDF.js';
import { pdf } from '@react-pdf/renderer';

const formatDate = (date) => {
    if (!date) return "";
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

const convertToLasVegasTime = (date) => {
    if (!date) return new Date();
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return new Date(newDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
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

export default function ReceiptFromSupplier({ onCreate, onEdit }) {
    const dispatch = useDispatch();
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState(new Date());
    const [whrfs, setWhrfs] = useState([]);
    const [itemsPerPage] = useState(5);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        loadData(page);
        console.log("Current filter date:", formatDate(filterDate));
    }, [page, filterDate]);


    const loadData = async (pageNumber) => {
        try {
            setWhrfs([]);
            const offset = (pageNumber - 1) * itemsPerPage;
            const limit = itemsPerPage;

            // Format date เป็น MM/DD/YYYY เหมือน POS
            const formattedDate = formatDate(filterDate);
            console.log("Querying for date:", formattedDate);

            // เรียก API แบบเดียวกับ POS
            const [dataRes, countRes] = await Promise.all([
                dispatch(wh_rfsAlljoindt({
                    offset,
                    limit,
                    rdate: formattedDate  // ส่งวันที่แบบเดียวกับ POS
                })).unwrap(),
                dispatch(countwh_rfs({
                    rdate: formattedDate
                })).unwrap()
            ]);

            console.log("API Response:", dataRes);

            if (dataRes.result && Array.isArray(dataRes.data)) {
                // ไม่ต้อง filter ข้อมูลที่ client อีก เพราะ API จะกรองให้แล้ว
                const resultData = dataRes.data.map((item, index) => ({
                    ...item,
                    id: offset + index + 1
                }));
                console.log("Processed data:", resultData);
                setWhrfs(resultData);
            }

            if (countRes.result) {
                const totalPages = Math.ceil(countRes.data / itemsPerPage);
                setCount(totalPages);
            }

        } catch (err) {
            console.error("Error loading data:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error loading data',
                text: err.message || 'An unknown error occurred',
            });
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDateChange = (date) => {
        const vegasDate = convertToLasVegasTime(date);
        setFilterDate(vegasDate);
        setPage(1);
    };

    const clearFilters = () => {
        setFilterDate(new Date());
        setSearchTerm("");
        setPage(1);
    };

    const handleDelete = (refno) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await dispatch(deleteWh_rfs({ refno })).unwrap();
                    await loadData(page);
                    Swal.fire('Deleted!', 'Record has been deleted.', 'success');
                } catch (error) {
                    Swal.fire('Error!', 'Failed to delete record.', 'error');
                }
            }
        });
    };

    const handleDeleteSelected = () => {
        if (selected.length === 0) return;

        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${selected.length} records`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete them!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Promise.all(
                        selected.map(refno => dispatch(deleteWh_rfs({ refno })).unwrap())
                    );
                    setSelected([]);
                    await loadData(page);
                    Swal.fire('Deleted!', 'Records have been deleted.', 'success');
                } catch (error) {
                    Swal.fire('Error!', 'Failed to delete records.', 'error');
                }
            }
        });
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleCheckboxChange = (event, refno) => {
        const selectedIndex = selected.indexOf(refno);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, refno);
        } else {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }

        setSelected(newSelected);
    };

    const PrintReceiptFromSupplierPDF = async (refno) => {
        try {
            Swal.fire({
                title: 'กำลังโหลดข้อมูล...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // 1. ดึงข้อมูล receipt
            const orderResponse = await dispatch(Wh_rfsByRefno(refno)).unwrap();
            console.log("API Response for RFS:", orderResponse);

            console.log("wh_rfsdts details:", orderResponse.data.wh_rfsdts);
            console.log("Number of products:", orderResponse.data.wh_rfsdts?.length || 0);


            if (orderResponse.result && orderResponse.data) {
                // 2. สร้าง PDF
                const pdfContent = await generateRFSPDF(refno, orderResponse.data);

                if (pdfContent) {
                    Swal.close();
                    const asBlob = await pdf(pdfContent).toBlob();
                    const url = URL.createObjectURL(asBlob);
                    window.open(url, '_blank');
                } else {
                    throw new Error("Failed to generate PDF content");
                }
            } else {
                throw new Error("Receipt data not found or invalid");
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
                        placeholderText="Filter by date"
                        customInput={<CustomInput />}
                        popperClassName="custom-popper"
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
                                    onChange={(event) => {
                                        if (event.target.checked) {
                                            setSelected(whrfs.map(row => row.refno));
                                        } else {
                                            setSelected([]);
                                        }
                                    }}
                                    checked={whrfs.length > 0 && selected.length === whrfs.length}
                                    indeterminate={selected.length > 0 && selected.length < whrfs.length}
                                />
                            </StyledTableCell>
                            <StyledTableCell width='1%'>No.</StyledTableCell>
                            <StyledTableCell align="center">Ref.no</StyledTableCell>
                            <StyledTableCell align="center">Date</StyledTableCell>
                            <StyledTableCell align="center">Supplier</StyledTableCell>
                            <StyledTableCell align="center">Total Due</StyledTableCell>
                            <StyledTableCell align="center">Username</StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {whrfs.map((row) => (
                            <StyledTableRow key={row.refno}>
                                <StyledTableCell padding="checkbox" align="center">
                                    <Checkbox
                                        checked={selected.includes(row.refno)}
                                        onChange={(event) => handleCheckboxChange(event, row.refno)}
                                    />
                                </StyledTableCell>
                                <StyledTableCell>{row.id}</StyledTableCell>
                                <StyledTableCell align="center">{row.refno}</StyledTableCell>
                                <StyledTableCell align="center">{row.rdate}</StyledTableCell>
                                <StyledTableCell align="center">{row.tbl_supplier?.supplier_name}</StyledTableCell>
                                <StyledTableCell align="center">
                                    ${typeof row.total_due === 'number' ? row.total_due.toFixed(2) : row.total_due}
                                </StyledTableCell>
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
                                        onClick={() => PrintReceiptFromSupplierPDF(row.refno)}
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
    );
}