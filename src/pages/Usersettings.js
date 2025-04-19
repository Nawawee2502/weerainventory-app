import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';
import InputBase from '@mui/material/InputBase';
import { AppBar, Badge, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import UserType from '../components/usersettings/Usertype';
import ManageUser from '../components/usersettings/Manageuser';
import UserPermission from '../components/usersettings/Userpermission';
import { useNavigate } from "react-router-dom";


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
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

function samePageLinkNavigation(event) {
    if (
        event.defaultPrevented ||
        event.button !== 0 || // ignore everything but left-click
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
    ) {
        return false;
    }
    return true;
}

function LinkTab(props) {
    return (
        <Tab
            component="a"
            onClick={(event) => {
                if (samePageLinkNavigation(event)) {
                    event.preventDefault();
                }
            }}
            aria-current={props.selected && 'page'}
            {...props}
        />
    );
}

export default function UserSettings() {
    const [value, setValue] = useState('1');
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
    const navigate = useNavigate();

    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const userData = JSON.parse(localStorage.getItem('userData2'));
    const permissions = userData?.tbl_typeuserpermission || {};

    if (permissions.menu_setuser !== 'Y') {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Typography>You don't have permission to access this page.</Typography>
            </Box>
        );
    }

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
        // Use window.location.href instead of router.push
        window.location.href = '/settings';
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleBackToSettings = () => {
        navigate('/settings');
    };

    const handleDashboard = () => {
        navigate('/dashboard');
    };

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
                <IconButton size="large" aria-label="show 4 new mails" color="inherit" onClick={handleSettingsClick}>
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

    return (
        <>
            <AppBar position="fixed" sx={{ bgcolor: '#FFFFFF', margin: 0, padding: 0 }}>
                <Toolbar>
                    <img
                        src="/logo1.png"
                        alt="Logo 1"
                        onClick={handleDashboard}
                        style={{
                            width: '52.78px',
                            height: '36',
                        }}
                    />
                    <img
                        src="/logo2.png"
                        alt="Logo 2"
                        onClick={handleDashboard}
                        style={{
                            width: '146.55',
                            height: '20px'
                        }}
                    />
                    <Search sx={{ bgcolor: '#F0F0F0' }}>
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
                        <IconButton size="large" aria-label="show 4 new mails" color="inherit" onClick={handleSettingsClick}>
                            <SettingsIcon sx={{ color: '#979797' }} />
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
                    flexWrap: 'wrap',
                    mt: '24px',
                    bgcolor: '#EDEDED',
                    overflowX: 'hidden',
                }}
            >
                <Box
                    sx={{
                        width: '98%',
                        height: '100%',
                        flexWrap: 'wrap',
                        bgcolor: 'white',
                        overflowX: 'hidden',
                        mt: '60px',
                        borderRadius: '15px',
                        mr: 'auto',
                        ml: 'auto',
                    }}
                >
                    <Box
                        sx={{
                            alignItems: 'center',
                            p: '24px'
                        }}
                    >
                        <TabContext value={value}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <TabList onChange={handleChange}>
                                    {/* แสดง tabs ตาม permissions */}
                                    {permissions.menu_setuser_typeuser === 'Y' &&
                                        <Tab label="User Type" value="1" />
                                    }
                                    {permissions.menu_setuser_typeuserpermission === 'Y' &&
                                        <Tab label="User Permission" value="2" />
                                    }
                                    {permissions.menu_setuser_user === 'Y' &&
                                        <Tab label="Manage User" value="3" />
                                    }
                                    <Tab
                                        label="Back"
                                        value="4"
                                        onClick={handleBackToSettings}
                                        sx={{
                                            marginLeft: 'auto',
                                            color: '#F62626',
                                            '&:hover': {
                                                color: '#D32F2F'
                                            }
                                        }}
                                    />
                                </TabList>
                            </Box>

                            {/* TabPanels with permission checks */}
                            {permissions.menu_setuser_typeuser === 'Y' &&
                                <TabPanel value="1">
                                    <UserType />
                                </TabPanel>
                            }
                            {permissions.menu_setuser_typeuserpermission === 'Y' &&
                                <TabPanel value="2">
                                    <UserPermission />
                                </TabPanel>
                            }
                            {permissions.menu_setuser_user === 'Y' &&
                                <TabPanel value="3">
                                    <ManageUser />
                                </TabPanel>
                            }
                            <TabPanel value="4">
                                {/* Empty panel for back button */}
                            </TabPanel>
                        </TabContext>
                    </Box>
                </Box>
            </Box>
            {renderMobileMenu}
        </>
    );
}
