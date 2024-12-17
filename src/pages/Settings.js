import React, { useState } from 'react';
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
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';
import { Button } from '@mui/material';
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

export default function Settings() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
    let navigate = useNavigate();

    const userData = JSON.parse(localStorage.getItem('userData2'));
    const permissions = userData?.tbl_typeuserpermission || {};

    const showGeneralSettings = permissions.menu_setgeneral === 'Y';
    const showUserSettings = permissions.menu_setuser === 'Y';

    if (!showGeneralSettings && !showUserSettings) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Typography>You don't have permission to access settings.</Typography>
            </Box>
        );
    }

    const handleGeneralSettings = () => {
        navigate('/generalsettings');
    };

    const handleUserSettings = () => {
        navigate('/usersettings');
    };

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

    const handleBackToDashboard = () => {
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
                        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
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
                    height: '360px',
                    bgcolor: '#1D2A3A',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <img
                    src='/logo1.png'
                    style={{ width: '120px' }}
                />
                <img
                    src='/logo2.png'
                    style={{ width: '320px' }}
                />
            </Box>
            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    paddingTop: 'px',
                    overflowX: 'hidden',
                    position: 'relative',
                    zIndex: 2,
                    mt: '-80px',
                    p: '24px 0px'
                }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',  // เพิ่มความกว้างเต็ม
                        flexDirection: 'column',  // เปลี่ยนเป็น column
                        alignItems: 'center',     // จัดให้อยู่กลาง
                    }}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                        mb: '24px'  // เพิ่มระยะห่างด้านล่าง
                    }}>
                        {/* Conditional rendering for buttons */}
                        {showGeneralSettings && (
                            <Button
                                onClick={handleGeneralSettings}
                                sx={{
                                    width: '413px',
                                    height: '333px',
                                    bgcolor: '#FFFFFF',
                                    boxShadow: '0px 4px 4px 0px #00000040',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    '&:hover': {
                                        bgcolor: '#F0F0F0',
                                    },
                                }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#1D2A3A' }}>
                                    General settings
                                </Typography>
                                <img
                                    style={{ width: '245px', height: '245px' }}
                                    src='/generalsetting.png'
                                />
                            </Button>
                        )}

                        {showUserSettings && (
                            <Button
                                onClick={handleUserSettings}
                                sx={{
                                    width: '413px',
                                    height: '333px',
                                    bgcolor: '#FFFFFF',
                                    boxShadow: '0px 4px 4px 0px #00000040',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    ml: showGeneralSettings ? '24px' : '0px', // ปรับ margin ตามการแสดงปุ่ม
                                    '&:hover': {
                                        bgcolor: '#F0F0F0',
                                    },
                                }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#1D2A3A' }}>
                                    User settings
                                </Typography>
                                <img
                                    style={{ width: '245px', height: '245px' }}
                                    src='/usersetting.png'
                                />
                            </Button>
                        )}
                    </Box>

                    <Box
                        sx={{
                            position: 'fixed',  // ใช้ fixed positioning
                            bottom: '24px',     // ห่างจากด้านล่าง 24px
                            left: '24px',       // ห่างจากด้านซ้าย 24px
                            zIndex: 10,         // ให้อยู่ด้านหน้าสุด
                        }}
                    >
                        <Button
                            onClick={handleBackToDashboard}
                            sx={{
                                width: '100px',
                                height: '30px',
                                bgcolor: '#FFFFFF',
                                color: '#754C27',
                                borderRadius: '10px',
                                border: '1px solid #754C27',
                                boxShadow: '0px 4px 4px 0px #00000040',
                                textTransform: 'none',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                minWidth: 'unset',  // ยกเลิกความกว้างขั้นต่ำของ Button
                                minHeight: 'unset', // ยกเลิกความสูงขั้นต่ำของ Button
                                padding: 0,         // ลบ padding
                                '&:hover': {
                                    bgcolor: '#F5F5F5',  // สีเมื่อ hover แบบอ่อนๆ
                                },
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            Back
                        </Button>
                    </Box>
                </Box>

            </Box>
            {renderMobileMenu}
            {/* test */}
        </>
    );
}
