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
import { AppBar, Badge, IconButton, Menu, MenuItem, Toolbar } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import SetProductType from '../components/Setproducttype';
import SetCountingUnit from '../components/Setcountingunit';
import Branch from '../components/Branch';
import ComissaryKitchen from '../components/Comissarykitchen';
import Supplier from '../components/Supplier';

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

export default function GeneralSettings() {
    const [value, setValue] = useState('1');
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);

    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

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
                        src='/logo1.png'
                        style={{
                            width: '52.78px',
                            height: '36px',
                        }}
                    />
                    <img
                        src='/logo2.png'
                        style={{
                            width: '146.55px',
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
                                <TabList onChange={handleChange} aria-label="lab API tabs example">
                                    <Tab label="Set product type" value="1" />
                                    <Tab label="Set counting unit" value="2" />
                                    <Tab label="Product record" value="3" />
                                    <Tab label="Branch" value="4" />
                                    <Tab label="Comissary Kitchen" value="5" />
                                    <Tab label="Supplier" value="6" />
                                </TabList>
                            </Box>
                            <TabPanel value="1">
                                <SetProductType />
                            </TabPanel>
                            <TabPanel value="2">
                                <SetCountingUnit />
                            </TabPanel>
                            <TabPanel value="3">
                                {/* <ProductRecord /> */}
                            </TabPanel>
                            <TabPanel value="4">
                                <Branch />
                            </TabPanel>
                            <TabPanel value="5">
                                <ComissaryKitchen />
                            </TabPanel>
                            <TabPanel value="6">
                                <Supplier />
                            </TabPanel>
                        </TabContext>
                    </Box>
                </Box>
            </Box>
            {renderMobileMenu}
        </>
    );
}
