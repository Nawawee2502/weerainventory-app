import { Box, Button, InputAdornment, TextField, Typography, tableCellClasses, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Checkbox, IconButton, Switch, FormControlLabel } from '@mui/material';
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
import { kitchenAll } from '../../../../api/kitchenApi';
import { branchAll } from '../../../../api/branchApi';
import { searchProductName } from '../../../../api/productrecordApi';
import { Br_rfkAlljoindt, deleteBr_rfk, Br_rfkByRefno } from '../../../../api/restaurant/br_rfkApi';
import Swal from 'sweetalert2';
import { pdf } from '@react-pdf/renderer';
import { generateKitchenGoodsReceiptPDF } from './Br_rfkPDF';

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
                    borderRadius: '10px'
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

export default function GoodsReceiptKitchen({ onCreate, onEdit }) {
    const dispatch = useDispatch();
    const [searchBranch, setSearchBranch] = useState("");
    const [searchKitchen, setSearchKitchen] = useState("");
    const [searchProduct, setSearchProduct] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [branches, setBranches] = useState([]);
    const [kitchens, setKitchens] = useState([]);
    const [filterDate, setFilterDate] = useState(new Date());
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(1);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [excludePrice, setExcludePrice] = useState(false);
    const limit = 5;

    // Load branches and kitchens on component mount
    useEffect(() => {
        const loadBranches = async () => {
            try {
                const response = await dispatch(branchAll({ offset: 0, limit: 100 })).unwrap();
                if (response.result && response.data) {
                    setBranches(response.data);
                }
            } catch (error) {
                console.error('Error loading branches:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load branches'
                });
            }
        };

        const loadKitchens = async () => {
            try {
                const response = await dispatch(kitchenAll({ offset: 0, limit: 100 })).unwrap();
                if (response.result && response.data) {
                    setKitchens(response.data);
                }
            } catch (error) {
                console.error('Error loading kitchens:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load kitchens'
                });
            }
        };

        loadBranches();
        loadKitchens(); // Load kitchens when component mounts
    }, [dispatch]);

    useEffect(() => {
        fetchData();
    }, [page, searchBranch, searchKitchen, searchProduct, filterDate]); // Added searchKitchen to dependency array

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const offset = (page - 1) * limit;

            const localDate = new Date(filterDate);
            localDate.setHours(0, 0, 0, 0);

            const year = localDate.getFullYear();
            const month = String(localDate.getMonth() + 1).padStart(2, '0');
            const day = String(localDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}${month}${day}`;

            console.log("กำลังเรียก API ด้วยพารามิเตอร์:", {
                offset: 0,
                limit: 1000, // ดึงข้อมูลจำนวนมาก
                rdate1: formattedDate,
                rdate2: formattedDate,
                branch_code: searchBranch,
                kitchen_code: searchKitchen,
            });

            const response = await dispatch(Br_rfkAlljoindt({
                offset: 0,
                limit: 1000, // ดึงข้อมูลจำนวนมาก
                rdate1: formattedDate,
                rdate2: formattedDate,
                branch_code: searchBranch,
                kitchen_code: searchKitchen,
            })).unwrap();

            console.log("ผลลัพธ์จาก API:", response);
            console.log("จำนวนข้อมูลที่ได้รับ:", response.data ? response.data.length : 0);

            if (response.result && response.data) {
                // จัดการข้อมูลเพื่อแสดงผล pagination
                const allData = response.data;
                const startIdx = offset;
                const endIdx = startIdx + limit;
                const paginatedData = allData.slice(startIdx, endIdx);

                setData(paginatedData);
                console.log(`แสดงข้อมูล ${paginatedData.length} รายการ จากทั้งหมด ${allData.length} รายการ`);

                // คำนวณจำนวนหน้าจากข้อมูลทั้งหมด
                const totalItems = allData.length;
                const totalPages = Math.ceil(totalItems / limit);
                setCount(totalPages || 1);
            } else {
                setData([]);
                setCount(1);
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
                    await dispatch(deleteBr_rfk({ refno })).unwrap();
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
                        selected.map(refno => dispatch(deleteBr_rfk({ refno })).unwrap())
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

    const handleSearchKitchenChange = (e) => {
        setSearchKitchen(e.target.value);
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
        setSearchKitchen("");
        setSearchProduct("");
        setFilterDate(new Date());
        setPage(1);
    };

    // Handle Print PDF function
    const handlePrintPDF = async (refno) => {
        try {
            Swal.fire({
                title: 'กำลังโหลดข้อมูล...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const orderResponse = await dispatch(Br_rfkByRefno({ refno })).unwrap();

            console.log("API Response Data (Complete):", orderResponse);

            if (orderResponse.result && orderResponse.data) {
                const data = orderResponse.data;

                console.log("Products data:", data.br_rfkdts);

                if (data.br_rfkdts) {
                    console.log("Number of products:",
                        Array.isArray(data.br_rfkdts) ?
                            data.br_rfkdts.length :
                            (typeof data.br_rfkdts === 'object' ?
                                Object.keys(data.br_rfkdts).length :
                                'Not an array or object'));

                    // Sample data
                    if (Array.isArray(data.br_rfkdts) && data.br_rfkdts.length > 0) {
                        console.log("First product:", data.br_rfkdts[0]);
                    } else if (typeof data.br_rfkdts === 'object') {
                        console.log("First product:", data.br_rfkdts[Object.keys(data.br_rfkdts)[0]]);
                    }
                } else {
                    console.log("No products data found in API response");
                }

                // Pass the includePrices parameter (false when excludePrice is true)
                const pdfContent = await generateKitchenGoodsReceiptPDF(refno, data, !excludePrice);

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
                {/* Branch Dropdown */}
                <Box
                    component="select"
                    value={searchBranch}
                    onChange={handleSearchBranchChange}
                    sx={{
                        height: '38px',
                        width: '20%',
                        borderRadius: '4px',
                        border: '1px solid rgba(0, 0, 0, 0.23)',
                        padding: '0 14px',
                        backgroundColor: '#fff'
                    }}
                >
                    <option value="">All Restaurant</option>
                    {branches.map((branch) => (
                        <option key={branch.branch_code} value={branch.branch_code}>
                            {branch.branch_name}
                        </option>
                    ))}
                </Box>

                {/* Kitchen Dropdown */}
                <Box
                    component="select"
                    value={searchKitchen}
                    onChange={handleSearchKitchenChange}
                    sx={{
                        height: '38px',
                        width: '20%',
                        borderRadius: '4px',
                        border: '1px solid rgba(0, 0, 0, 0.23)',
                        padding: '0 14px',
                        backgroundColor: '#fff'
                    }}
                >
                    <option value="">All Kitchens</option>
                    {kitchens.map((kitchen) => (
                        <option key={kitchen.kitchen_code} value={kitchen.kitchen_code}>
                            {kitchen.kitchen_name}
                        </option>
                    ))}
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
                            <StyledTableCell align="center">Restaurant</StyledTableCell>
                            <StyledTableCell align="center">Kitchen</StyledTableCell>
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
                                        <StyledTableCell align="center">{row.tbl_branch?.branch_name}</StyledTableCell>
                                        <StyledTableCell align="center">{row.tbl_kitchen?.kitchen_name}</StyledTableCell>
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
}