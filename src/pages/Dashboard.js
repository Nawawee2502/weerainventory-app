import React from 'react'
import { useState } from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';
import { Button, Grid, Grid2 } from '@mui/material';
import { logout } from '../store/reducers/authentication';
// import { useRouter } from 'next/router';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));



export default function Dashboard() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
    let navigate = useNavigate();
    const dispatch = useDispatch();
    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const userData = JSON.parse(localStorage.getItem('userData2'));
    const permissions = userData?.tbl_typeuserpermission || {};

    const handleSettings = () => {
        navigate('/settings');
    };

    const handleWarehouse = () => {
        navigate('/warehouse');
    };

    const handleRestaurant = () => {
        navigate('/restaurant');
    };

    const handleRoom4Room5 = () => {
        navigate('/kitchen');
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };

    const handleMobileMenuOpen = (event) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const handleSettingsClick = () => {
        window.location.href = '/settings';
    };

    const menuId = 'primary-search-account-menu';
    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
    );

    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
        >
            <MenuItem>
                <IconButton size="large" aria-label="show 4 new mails" color="inherit">
                    <Badge badgeContent={4} color="error">
                        <SettingsIcon />
                    </Badge>
                </IconButton>
                <p>Messages</p>
            </MenuItem>
            <MenuItem>
                <IconButton
                    size="large"
                    aria-label="show 17 new notifications"
                    color="inherit"
                >
                    <Badge badgeContent={17} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
                <p>Notifications</p>
            </MenuItem>
            <MenuItem onClick={handleProfileMenuOpen}>
                <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="primary-search-account-menu"
                    aria-haspopup="true"
                    color="inherit"
                >
                    <AccountCircle />
                </IconButton>
                <p>Profile</p>
            </MenuItem>
        </Menu>
    );
    // test
    return (
        <div>
            <AppBar position="fixed" sx={{ bgcolor: '#FFFFFF', margin: 0, padding: 0 }}>
                <Toolbar>
                    <img
                        src='/logo1.png'
                        style={{
                            width: '52.78px',
                            height: '36',
                        }}
                    />
                    <img
                        src='/logo2.png'
                        style={{
                            width: '146.55',
                            height: '20px'
                        }}
                    />
                    <Search sx={{ bgcolor: '#F0F0F0', }}>
                        <SearchIconWrapper>
                            <SearchIcon sx={{ color: '#5A607F' }} />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                            sx={{
                                color: '#151B26'
                            }}
                        />
                    </Search>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                        <IconButton size="large" aria-label="show 4 new mails" color="inherit" >
                            <SettingsIcon onClick={handleSettings} sx={{ color: '#979797' }} />
                        </IconButton>
                        <IconButton
                            size="large"
                            aria-label="show 17 new notifications"
                            color="inherit"
                        >
                            <Badge badgeContent={17} color="error">
                                <NotificationsIcon sx={{ color: '#979797' }} />
                            </Badge>
                        </IconButton>
                        <IconButton
                            size="large"
                            edge="end"
                            aria-label="account of current user"
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
                        >
                            <AccountCircle sx={{ color: '#979797' }} />
                        </IconButton>
                    </Box>
                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="show more"
                            aria-controls={mobileMenuId}
                            aria-haspopup="true"
                            onClick={handleMobileMenuOpen}
                            color="inherit"
                        >
                            <MoreIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    // pl: '48px',
                    // pr: '48px',
                    flexWrap: 'wrap',
                    paddingTop: '90px',
                    bgcolor: '#EDEDED',
                    overflowX: 'hidden',
                }}>
                {/* Restaurant Button - แสดงเฉพาะเมื่อ menu_setbranch เป็น Y */}
                {permissions.menu_setbranch === 'Y' && (
                    <Button
                        onClick={handleRestaurant}
                        sx={{
                            width: '150px',
                            height: '130px',
                            bgcolor: '#FFFFFF',
                            boxShadow: '0px 4px 4px 0px #00000040',
                            borderRadius: '10px',
                            mt: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <img
                            style={{ width: '81px', height: '81px' }}
                            src='/shop.png'
                        />
                        <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#1D2A3A' }}>
                            Restaurant
                        </Typography>
                    </Button>
                )}

                {/* Warehouse Button - แสดงเฉพาะเมื่อ menu_setwarehouse เป็น Y */}
                {permissions.menu_setwarehouse === 'Y' && (
                    <Button
                        onClick={handleWarehouse}
                        sx={{
                            width: '150px',
                            height: '130px',
                            bgcolor: '#FFFFFF',
                            boxShadow: '0px 4px 4px 0px #00000040',
                            borderRadius: '10px',
                            mt: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            ml: '24px',
                        }}>
                        <img
                            style={{ width: '81px', height: '81px' }}
                            src='/warehouse.png'
                        />
                        <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#1D2A3A' }}>
                            Warehouse
                        </Typography>
                    </Button>
                )}

                {/* Kitchen Button - แสดงเฉพาะเมื่อ menu_setkitchen เป็น Y */}
                {permissions.menu_setkitchen === 'Y' && (
                    <Button
                        onClick={handleRoom4Room5}
                        sx={{
                            width: '150px',
                            height: '130px',
                            bgcolor: '#FFFFFF',
                            boxShadow: '0px 4px 4px 0px #00000040',
                            borderRadius: '10px',
                            mt: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            ml: '24px',
                        }}>
                        <img
                            style={{ width: '81px', height: '81px' }}
                            src='/room4,5.png'
                        />
                        <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#1D2A3A' }}>
                            Kitchen
                        </Typography>
                    </Button>
                )}
                <Box
                    sx={{
                        width: '98%',
                        height: '90%',
                        flexWrap: 'wrap',
                        bgcolor: 'white',
                        overflowX: 'hidden',
                        mt: '60px',
                        borderRadius: '15px',

                    }}
                >
                    <Box
                        sx={{
                            alignItems: 'center',
                            p: '48px'
                        }}
                    >
                        <Typography sx={{ fontSize: '32px', fontWeight: '700', color: '#464255' }}>
                            Dashboard
                        </Typography>
                        <Grid2 container spacing={3} sx={{ display: 'flex', flexDirection: 'row', mt: '24px', justifyContent: 'center' }}>
                            <Grid2 item >
                                <Box sx={{ width: '280px', height: '141px', bgcolor: '#EDEDED', borderRadius: '14px', boxShadow: '0px 4px 4px 0px #00000040' }}>

                                </Box>
                            </Grid2>
                            <Grid2 item >
                                <Box sx={{ width: '280px', height: '141px', bgcolor: '#EDEDED', borderRadius: '14px', boxShadow: '0px 4px 4px 0px #00000040' }}>

                                </Box>
                            </Grid2>
                            <Grid2 item >
                                <Box sx={{ width: '280px', height: '141px', bgcolor: '#EDEDED', borderRadius: '14px', boxShadow: '0px 4px 4px 0px #00000040' }}>

                                </Box>
                            </Grid2>
                            <Grid2 item >
                                <Box sx={{ width: '280px', height: '141px', bgcolor: '#EDEDED', borderRadius: '14px', boxShadow: '0px 4px 4px 0px #00000040' }}>

                                </Box>
                            </Grid2>
                        </Grid2>
                    </Box>
                </Box>
            </Box>
            {renderMenu}
        </div>
    )
}
