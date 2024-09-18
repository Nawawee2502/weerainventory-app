import { Box, Button, InputAdornment, TextField, Typography, Drawer, IconButton } from '@mui/material';
import React, { useState } from 'react';
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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        background: '#754C27',
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

function createData(no, id, producttype) {
    return {
        no,
        id,
        producttype,
        edit: (
            <IconButton color="primary" size="md" onClick={() => console.log('Edit', id)} sx={{ border: '1px solid #AD7A2C', borderRadius: '7px' }}>
                <EditIcon sx={{ color: '#AD7A2C' }} />
            </IconButton>
        ),
        delete: (
            <IconButton color="danger" size="md" onClick={() => console.log('Delete', id)} sx={{ border: '1px solid #F62626', borderRadius: '7px' }}>
                <DeleteIcon sx={{ color: '#F62626' }} />
            </IconButton>
        ),
    };
}

const rows = [
    createData('1', '001', 'Rice',),
    createData('2', '002', 'Soup',),
    createData('3', '003', 'Noodle',),
    createData('4', '004', 'Coconut',),
    createData('5', '005', 'Oil',),
];

export default function SetProductType() {
    const [selected, setSelected] = React.useState([]);
    const isAllSelected = selected.length === rows.length;

    const handleCheckboxChange = (event, no) => {
        if (event.target.checked) {
            setSelected([...selected, no]);
        } else {
            setSelected(selected.filter((item) => item !== no));
        }
    };

    const handleSelectAllChange = (event) => {
        if (event.target.checked) {
            setSelected(rows.map(row => row.no));
        } else {
            setSelected([]);
        }
    };

    const [openDrawer, setOpenDrawer] = React.useState(false);

    const toggleDrawer = (openDrawer) => () => {
        setOpenDrawer(openDrawer);
    };

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
                <TableContainer component={Paper} sx={{ width: '60%', mt:'36px', }}>
                    <Table sx={{}} aria-label="customized table">
                    <TableHead  sx={{  }}>
                            <TableRow sx={{  }}>
                                <StyledTableCell sx={{ width: '1%', textAlign: 'center' }}>
                                    <Checkbox
                                        checked={isAllSelected}
                                        onChange={handleSelectAllChange}
                                        sx={{ color: '#FFF' }}
                                    />
                                </StyledTableCell>
                                <StyledTableCell width='1%' >No.</StyledTableCell>
                                <StyledTableCell align="center">ID</StyledTableCell>
                                <StyledTableCell align="center">Product Type</StyledTableCell>
                                <StyledTableCell width='1%' align="center"></StyledTableCell>
                                <StyledTableCell width='1%' align="center"></StyledTableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <StyledTableRow key={row.no}>
                                    <StyledTableCell padding="checkbox" align="center">
                                        <Checkbox
                                            checked={selected.includes(row.no)}
                                            onChange={(event) => handleCheckboxChange(event, row.no)}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell component="th" scope="row" >
                                        {row.no}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">{row.id}</StyledTableCell>
                                    <StyledTableCell align="center">{row.producttype}</StyledTableCell>
                                    <StyledTableCell align="center">{row.edit}</StyledTableCell>
                                    <StyledTableCell align="center">{row.delete}</StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
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
                            width: '129px',
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
                            Product Type
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
                            Product Type ID :
                            <Typography sx={{ color: '#754C27', ml: '12px' }}>
                                #011
                            </Typography>
                        </Typography>
                        <Box sx={{ width: '80%', mt: '24px' }}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                Product Type
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Product Type"
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
