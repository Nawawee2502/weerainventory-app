import React, { useState, useEffect } from 'react';
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
import LogoutIcon from '@mui/icons-material/Logout';
import { Button, CircularProgress, Grid2 } from '@mui/material';
import { logout } from '../store/reducers/authentication';

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
        width: '300px', // เพิ่มความกว้างสำหรับ tablet
    },
    [theme.breakpoints.down('sm')]: {
        display: 'none', // ซ่อนช่องค้นหาบน mobile
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
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '40ch',
        },
        [theme.breakpoints.between('sm', 'md')]: {
            width: '20ch',
        },
    },
}));

// เพิ่ม component searchMobile
const renderMobileSearch = (
    <Box sx={{
        display: { xs: 'flex', sm: 'none' },
        alignItems: 'center',
        bgcolor: '#F0F0F0',
        borderRadius: 1,
        p: 1,
        mx: 1,
    }}>
        <SearchIcon sx={{ color: '#5A607F', mr: 1 }} />
        <InputBase
            placeholder="Search…"
            sx={{ color: '#151B26', flex: 1 }}
        />
    </Box>
);

export default function Dashboard() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState({});
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        const storedPermissions = localStorage.getItem('userData2');

        if (storedUserData) {
            try {
                const parsedUserData = JSON.parse(storedUserData);
                setUser(parsedUserData);

                // แยกการ parse permissions
                if (storedPermissions) {
                    try {
                        const parsedPermissions = JSON.parse(storedPermissions);
                        setPermissions(parsedPermissions?.tbl_typeuserpermission || {});
                    } catch (e) {
                        console.warn('Invalid permissions data:', e);
                        setPermissions({});
                    }
                } else {
                    setPermissions({});
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                // Redirect to login if data is invalid
                localStorage.clear();
                window.location.replace('/');
            }
        } else {
            // Redirect to login if no data
            window.location.replace('/');
        }
    }, []);

    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const handleSettings = () => {
        window.location.href = '/settings';
    };

    const handleWarehouse = () => {
        window.location.href = '/warehouse';
    };

    const handleRestaurant = () => {
        window.location.href = '/restaurant';
    };

    const handleRoom4Room5 = () => {
        window.location.href = '/kitchen';
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

    const menuId = 'primary-search-account-menu';

    const handleLogout = () => {
        dispatch(logout());
        window.location.replace('/');
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
            <MenuItem onClick={handleSettings}>
                <IconButton size="large" color="inherit">
                    <SettingsIcon sx={{ color: '#979797' }} />
                </IconButton>
                <Typography>Settings</Typography>
            </MenuItem>
            <MenuItem>
                <IconButton size="large" color="inherit">
                    <Badge badgeContent={17} color="error">
                        <NotificationsIcon sx={{ color: '#979797' }} />
                    </Badge>
                </IconButton>
                <Typography>Notifications</Typography>
            </MenuItem>
            <MenuItem onClick={handleProfileMenuOpen}>
                <IconButton size="large" color="inherit">
                    <AccountCircle sx={{ color: '#979797' }} />
                </IconButton>
                <Typography>Profile</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
                <IconButton size="large" color="inherit">
                    <LogoutIcon sx={{ color: '#979797' }} />
                </IconButton>
                <Typography>Logout</Typography>
            </MenuItem>
        </Menu>
    );

    if (!user || !permissions) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div>
            <AppBar position="fixed" sx={{ bgcolor: '#FFFFFF', margin: 0, padding: 0 }}>
                <Toolbar sx={{
                    minHeight: { xs: '56px', sm: '64px' },
                    px: { xs: 1, sm: 2 }
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 1, sm: 2 }
                    }}>
                        <img
                            src='/logo1.png'
                            alt="Logo 1"
                            style={{
                                width: '52.78px',
                                height: '36px',
                                maxWidth: '100%',
                            }}
                        />
                        <img
                            src='/logo2.png'
                            alt="Logo 2"
                            style={{
                                width: '146.55px',
                                height: '20px',
                                display: { xs: 'none', sm: 'block' }
                            }}
                        />
                    </Box>

                    {/* Desktop Search
                    <Search sx={{ bgcolor: '#F0F0F0', display: { xs: 'none', sm: 'flex' } }}>
                        <SearchIconWrapper>
                            <SearchIcon sx={{ color: '#5A607F' }} />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                            sx={{ color: '#151B26' }}
                        />
                    </Search> */}

                    {/* Mobile Search */}
                    {/* {renderMobileSearch} */}

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Desktop Icons */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                        <IconButton
                            size="large"
                            aria-label="settings"
                            color="inherit"
                            onClick={handleSettings}
                        >
                            <SettingsIcon sx={{ color: '#979797' }} />
                        </IconButton>
                        <IconButton
                            size="large"
                            aria-label="show notifications"
                            color="inherit"
                        >
                            <Badge badgeContent={17} color="error">
                                <NotificationsIcon sx={{ color: '#979797' }} />
                            </Badge>
                        </IconButton>
                        <IconButton
                            size="large"
                            edge="end"
                            aria-label="account"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
                        >
                            <AccountCircle sx={{ color: '#979797' }} />
                        </IconButton>
                    </Box>

                    {/* Mobile Menu Icon */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="show more"
                            aria-controls={mobileMenuId}
                            aria-haspopup="true"
                            onClick={handleMobileMenuOpen}
                            color="inherit"
                        >
                            <MoreIcon sx={{ color: '#979797' }} />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                paddingTop: '90px',
                bgcolor: '#EDEDED',
                overflowX: 'hidden',
            }}>
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
                            alt="Restaurant"
                        />
                        <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#1D2A3A' }}>
                            Restaurant
                        </Typography>
                    </Button>
                )}

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
                            alt="Warehouse"
                        />
                        <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#1D2A3A' }}>
                            Warehouse
                        </Typography>
                    </Button>
                )}

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
                            alt="Kitchen"
                        />
                        <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#1D2A3A' }}>
                            Kitchen
                        </Typography>
                    </Button>
                )}

                <Box sx={{
                    width: '98%',
                    height: '90%',
                    flexWrap: 'wrap',
                    bgcolor: 'white',
                    overflowX: 'hidden',
                    mt: '60px',
                    borderRadius: '15px',
                }}>
                    <Box sx={{
                        alignItems: 'center',
                        p: '48px'
                    }}>
                        <Typography sx={{ fontSize: '32px', fontWeight: '700', color: '#464255' }}>
                            Dashboard
                        </Typography>
                        <Grid2 container spacing={3} sx={{ display: 'flex', flexDirection: 'row', mt: '24px', justifyContent: 'center' }}>
                            <Grid2 item>
                                <Box sx={{ width: '280px', height: '141px', bgcolor: '#EDEDED', borderRadius: '14px', boxShadow: '0px 4px 4px 0px #00000040' }}>
                                </Box>
                            </Grid2>
                            <Grid2 item>
                                <Box sx={{ width: '280px', height: '141px', bgcolor: '#EDEDED', borderRadius: '14px', boxShadow: '0px 4px 4px 0px #00000040' }}>
                                </Box>
                            </Grid2>
                            <Grid2 item>
                                <Box sx={{ width: '280px', height: '141px', bgcolor: '#EDEDED', borderRadius: '14px', boxShadow: '0px 4px 4px 0px #00000040' }}>
                                </Box>
                            </Grid2>
                            <Grid2 item>
                                <Box sx={{ width: '280px', height: '141px', bgcolor: '#EDEDED', borderRadius: '14px', boxShadow: '0px 4px 4px 0px #00000040' }}>
                                </Box>
                            </Grid2>
                        </Grid2>
                    </Box>
                </Box>
            </Box>
            {renderMobileMenu}
            {renderMenu}
        </div>
    );
}