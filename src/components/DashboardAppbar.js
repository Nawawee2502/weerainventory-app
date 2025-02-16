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
import MenuIcon from '@mui/icons-material/Menu';
import { Button, CircularProgress, useMediaQuery, useTheme } from '@mui/material';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(1),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
    [theme.breakpoints.down('sm')]: {
        display: 'none', // Hide search on mobile
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
            width: '20ch',
        },
        [theme.breakpoints.down('md')]: {
            width: '15ch',
        },
    },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
        '& img:nth-of-type(2)': {
            display: 'none', // Hide second logo on mobile
        },
    },
}));

export default function DashboardAppbar() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
    const [searchAnchorEl, setSearchAnchorEl] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // ... (keep existing useEffect and other state management code)

    const handleSearchMobile = (event) => {
        setSearchAnchorEl(event.currentTarget);
    };

    const handleSearchClose = () => {
        setSearchAnchorEl(null);
    };

    const renderMobileSearch = (
        <Menu
            anchorEl={searchAnchorEl}
            open={Boolean(searchAnchorEl)}
            onClose={handleSearchClose}
            PaperProps={{
                sx: {
                    width: '100%',
                    maxWidth: '100%',
                    mt: 1,
                    ml: -2,
                }
            }}
        >
            <Box sx={{ p: 2, width: '100%' }}>
                <InputBase
                    placeholder="Search…"
                    fullWidth
                    startAdornment={<SearchIcon sx={{ mr: 1, color: '#5A607F' }} />}
                    sx={{ bgcolor: '#F0F0F0', p: 1, borderRadius: 1 }}
                />
            </Box>
        </Menu>
    );

    // Modified mobile menu items
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={Boolean(mobileMoreAnchorEl)}
            onClose={() => setMobileMoreAnchorEl(null)}
        >
            <MenuItem onClick={handleSearchMobile}>
                <IconButton size="large" color="inherit">
                    <SearchIcon />
                </IconButton>
                <p>Search</p>
            </MenuItem>
            <MenuItem onClick={() => navigate('/settings')}>
                <IconButton size="large" color="inherit">
                    <SettingsIcon />
                </IconButton>
                <p>Settings</p>
            </MenuItem>
            <MenuItem>
                <IconButton size="large" color="inherit">
                    <Badge badgeContent={17} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
                <p>Notifications</p>
            </MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>
                <IconButton size="large" color="inherit">
                    <AccountCircle />
                </IconButton>
                <p>Profile</p>
            </MenuItem>
        </Menu>
    );

    return (
        <AppBar position="fixed" sx={{ bgcolor: '#FFFFFF' }}>
            <Toolbar sx={{
                justifyContent: 'space-between',
                minHeight: { xs: '56px', sm: '64px' },
                px: { xs: 1, sm: 2, md: 3 }
            }}>
                <LogoContainer>
                    <img
                        src='/logo1.png'
                        alt="Logo 1"
                        style={{
                            width: isMobile ? '40px' : '52.78px',
                            height: isMobile ? '28px' : '36px',
                        }}
                    />
                    <img
                        src='/logo2.png'
                        alt="Logo 2"
                        style={{
                            width: '146.55px',
                            height: '20px',
                            marginLeft: '8px'
                        }}
                    />
                </LogoContainer>

                <Search sx={{
                    bgcolor: '#F0F0F0',
                    display: { xs: 'none', sm: 'flex' },
                    width: { sm: '200px', md: '300px' }
                }}>
                    <SearchIconWrapper>
                        <SearchIcon sx={{ color: '#5A607F' }} />
                    </SearchIconWrapper>
                    <StyledInputBase
                        placeholder="Search…"
                        inputProps={{ 'aria-label': 'search' }}
                        sx={{ color: '#151B26' }}
                    />
                </Search>

                {/* Desktop Icons */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                    <IconButton
                        size="large"
                        color="inherit"
                        onClick={() => navigate('/settings')}
                    >
                        <SettingsIcon sx={{ color: '#979797' }} />
                    </IconButton>
                    <IconButton size="large" color="inherit">
                        <Badge badgeContent={17} color="error">
                            <NotificationsIcon sx={{ color: '#979797' }} />
                        </Badge>
                    </IconButton>
                    <IconButton
                        size="large"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        color="inherit"
                    >
                        <AccountCircle sx={{ color: '#979797' }} />
                    </IconButton>
                </Box>

                {/* Mobile Menu Icon */}
                <IconButton
                    size="large"
                    onClick={(e) => setMobileMoreAnchorEl(e.currentTarget)}
                    sx={{ display: { xs: 'flex', md: 'none' }, color: '#979797' }}
                >
                    <MoreIcon />
                </IconButton>
            </Toolbar>
            {renderMobileMenu}
            {renderMobileSearch}
        </AppBar>
    );
}