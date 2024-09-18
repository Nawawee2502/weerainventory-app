import { Box, Button, InputAdornment, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Checkbox from '@mui/joy/Checkbox';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Drawer from '@mui/material/Drawer';

function createData(no, id, comissarykitchen, address, telephone) {
    return {
        no,
        id,
        comissarykitchen,
        address,
        telephone,
        edit: (
            <IconButton color="primary" size="md" onClick={() => console.log('Edit', id)} sx={{ border: '1px solid #AD7A2C' }}>
                <EditIcon sx={{ color: '#AD7A2C' }} />
            </IconButton>
        ),
        deleteproduct: (
            <IconButton color="danger" size="md" onClick={() => console.log('Delete', id)} sx={{ border: '1px solid #F62626' }}>
                <DeleteIcon sx={{ color: '#F62626' }} />
            </IconButton>
        ),
    };
}

const rows = [
    createData('1', '001', 'Rice'),
    createData('2', '002', 'Wheat'),
    createData('3', '003', 'Corn'),
    // Add more rows as needed
];

function labelDisplayedRows({ from, to, count }) {
    return `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`;
}

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
    {
        id: 'no',
        numeric: false,
        disablePadding: true,
        label: 'No.',
    },
    {
        id: 'id',
        numeric: true,
        disablePadding: false,
        label: 'ID',
    },
    {
        id: 'comissarykitchen',
        numeric: true,
        disablePadding: false,
        label: 'Comissary Kitchen',
    },
    {
        id: 'address',
        numeric: true,
        disablePadding: false,
        label: 'Address',
    },
    {
        id: 'telephone',
        numeric: true,
        disablePadding: false,
        label: 'Telephone',
    },
    {
        id: 'edit',
        numeric: false,
        disablePadding: false,
        label: '',
    },
    {
        id: 'deleteproduct',
        numeric: false,
        disablePadding: false,
        label: '',
    },
];

function EnhancedTableHead({ onSelectAllClick, numSelected, rowCount }) {
    return (
        <thead>
            <tr>
                <th style={{ backgroundColor: '#AD7A2C' }}>
                    <Checkbox
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        slotProps={{
                            input: {
                                'aria-label': 'select all products',
                            },
                        }}
                        sx={{ verticalAlign: 'sub' }}
                    />
                </th>
                {headCells.map((headCell) => (
                    <th
                        key={headCell.id}
                        style={{ backgroundColor: '#AD7A2C', color: '#FFFFFF' }}
                    >
                        {headCell.label}
                    </th>
                ))}
            </tr>
        </thead>
    );
}

export default function ComissaryKitchen() {
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('id');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [openDrawer, setOpenDrawer] = React.useState(false);

    const toggleDrawer = (openDrawer) => () => {
        setOpenDrawer(openDrawer);
    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = rows.map((n) => n.no);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, no) => {
        const selectedIndex = selected.indexOf(no);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, no);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }
        setSelected(newSelected);
    };

    const handleChangePage = (newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event, newValue) => {
        setRowsPerPage(parseInt(newValue.toString(), 10));
        setPage(0);
    };

    const getLabelDisplayedRowsTo = () => {
        if (rows.length === -1) {
            return (page + 1) * rowsPerPage;
        }
        return rowsPerPage === -1
            ? rows.length
            : Math.min(rows.length, (page + 1) * rowsPerPage);
    };

    const isSelected = (no) => selected.indexOf(no) !== -1;

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

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
                        Product Type Search
                    </Typography>
                    <TextField
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
                <Box sx={{ mt: '18px' }}>
                    <Box sx={{ p: '24px' }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#5E5F5F' }}>
                            Product Type
                        </Typography>
                    </Box>
                    <Sheet
                        variant="outlined"
                        sx={{ width: '100%', boxShadow: 'sm', borderRadius: '5px' }}
                    >
                        <Table
                            aria-labelledby="tableTitle"
                            hoverRow
                            sx={{
                                '--TableCell-headBackground': 'transparent',
                                // '--TableCell-selectedBackground': (theme) =>
                                //     theme.vars.palette.success.softBg,
                                '& thead th:nth-child(1)': {
                                    width: '1px',
                                },
                                '& thead th:nth-child(2)': {
                                    width: '30px',
                                },
                                '& thead th:nth-child(3)': {
                                    width: '10%',
                                },
                                '& thead th:nth-child(4)': {
                                    width: '20%',
                                    textAlign: 'center'
                                },
                                '& thead th:nth-child(5)': {
                                    width: '20%',
                                },
                                '& thead th:nth-child(6)': {
                                    width: '20%',
                                },
                                '& thead th:nth-child(7)': {
                                    width: '0.1px',
                                },
                                '& thead th:nth-child(8)': {
                                    width: '0.1px',
                                },
                                
                                '& tr > *:nth-child(n+3)': { textAlign: 'center' },
                            }}
                        >
                            <EnhancedTableHead
                                numSelected={selected.length}
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={handleSelectAllClick}
                                rowCount={rows.length}
                            />
                            <tbody>
                                {rows
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, index) => {
                                        const isItemSelected = isSelected(row.no);
                                        return (
                                            <tr
                                                key={row.no}
                                                onClick={(event) => handleClick(event, row.no)}
                                                role="checkbox"
                                                aria-checked={isItemSelected}
                                                tabIndex={-1}
                                                selected={isItemSelected}
                                            >
                                                <td>
                                                    <Checkbox
                                                        checked={isItemSelected}
                                                        sx={{ verticalAlign: 'sub' }}
                                                    />
                                                </td>
                                                <td>{row.no}</td>
                                                <td>{row.id}</td>
                                                <td>{row.comissarykitchen}</td>
                                                <td>{row.address}</td>
                                                <td>{row.telephone}</td>
                                                <td>{row.edit}</td>
                                                <td>{row.deleteproduct}</td>
                                            </tr>
                                        );
                                    })}
                                {emptyRows > 0 && (
                                    <tr style={{ height: 53 * emptyRows }}>
                                        <td colSpan={6} />
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Sheet>
                </Box>
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
                            width: '150px',
                            bgcolor: '#AD7A2C',
                            color: '#FFFFFF',
                            px: '8px',
                            py: '4px',
                            borderRadius: '5px',
                            fontWeight: 'bold',
                            zIndex: 1,
                            borderRadius: '20px',
                            height: '89px',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography sx={{ fontWeight: '600', fontSize: '14px' }} >
                            Comissary Kitchen
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
                            Comissary Kitchen ID :
                            <Typography sx={{ color: '#754C27', ml: '12px' }}>
                                #011
                            </Typography>
                        </Typography>
                        <Box sx={{ width: '80%', mt: '24px' }}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                Comissary Kitchen
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Name"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px', // Set border-radius here
                                    },
                                }}
                            />
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt:'24px' }}>
                                Address
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Address"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px', // Set border-radius here
                                    },
                                }}
                            />
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27', mt:'24px' }}>
                                Telephone
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Telephone"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px', // Set border-radius here
                                    },
                                }}
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
                            <Button variant='contained'
                                sx={{
                                    width: '100px',
                                    bgcolor: '#754C27',
                                    '&:hover': {
                                        bgcolor: '#5A3D1E',
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
        </>
    );
}

