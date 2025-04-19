import React, { useState, useEffect } from 'react';
import { styled, alpha } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from '@mui/material';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Badge,
    MenuItem,
    Menu,
    Button,
    CircularProgress,
    Grid2,
    Switch,
    FormControlLabel,
    Paper,
    Divider
} from '@mui/material';
import {
    AccountCircle,
    Settings as SettingsIcon,
    Notifications as NotificationsIcon,
    MoreVert as MoreIcon,
    Logout as LogoutIcon,
    PhoneIphone as PhoneIcon,
    Laptop as LaptopIcon,
    RestaurantMenu,
    Inventory,
    Kitchen,
    StorefrontOutlined,
    WarehouseOutlined
} from '@mui/icons-material';
import { logout } from '../store/reducers/authentication';
import axios from 'axios';

// Import APIs for stockcard data
// import { countKt_stockcard } from '../store/api/kt_stockcardApi';
// import { countBr_stockcard } from '../store/api/br_stockcardApi';
// import { countWh_stockcard } from '../store/api/wh_stockcardApi';
import { countKt_stockcard } from '../api/kitchen/kt_stockcardApi';
import { countBr_stockcard } from '../api/restaurant/br_stockcardApi';
import { countWh_stockcard } from '../api/warehouse/wh_stockcard';

// Custom styled switch
const ModeSwitch = styled(Switch)(({ theme }) => ({
    width: 62,
    height: 34,
    padding: 7,
    '& .MuiSwitch-switchBase': {
        margin: 1,
        padding: 0,
        transform: 'translateX(6px)',
        '&.Mui-checked': {
            color: '#fff',
            transform: 'translateX(22px)',
            '& .MuiSwitch-thumb:before': {
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
                    '#fff',
                )}" d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>')`,
            },
            '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
            },
        },
    },
    '& .MuiSwitch-thumb': {
        backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
        width: 32,
        height: 32,
        '&:before': {
            content: "''",
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
                '#fff',
            )}" d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>')`,
        },
    },
    '& .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
        borderRadius: 20 / 2,
    },
}));

// Dashboard card with gradient background
const DashboardCard = styled(Paper)(({ theme, color }) => ({
    padding: theme.spacing(2),
    borderRadius: '14px',
    boxShadow: '0px 4px 4px 0px #00000040',
    background: color || '#EDEDED',
    color: color ? '#FFFFFF' : theme.palette.text.primary,
    height: '141px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
}));

const StockCountCard = styled(Paper)(({ theme, color }) => ({
    padding: theme.spacing(3),
    borderRadius: '14px',
    boxShadow: '0px 4px 4px 0px #00000040',
    background: color || '#FFFFFF',
    color: theme.palette.text.primary,
    height: '220px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
}));

export default function Dashboard() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [forceMobileMode, setForceMobileMode] = useState(false);

    // State for storing stockcard count data
    const [stockcardData, setStockcardData] = useState({
        kitchen: 0,
        restaurant: 0,
        warehouse: 0,
        loading: true
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const systemIsMobileOrTablet = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const systemIsMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    // Determine if we should use mobile UI based on device OR user preference
    const isMobileOrTablet = forceMobileMode || systemIsMobileOrTablet;
    const isMobile = forceMobileMode || systemIsMobile;

    // Function to format date to YYYY-MM-DD
    // แก้ไขเป็น MM/DD/YYYY ตามรูปแบบในฐานข้อมูล
    const formatDate = (date) => {
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        return `${month}/${day}/${year}`;
    };

    // Get today's date in YYYY-MM-DD format
    const today = formatDate(new Date());

    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        const storedPermissions = localStorage.getItem('userData2');
        const storedModePreference = localStorage.getItem('mobileMode');

        if (storedModePreference) {
            setForceMobileMode(storedModePreference === 'true');
        }

        if (storedUserData) {
            try {
                const parsedUserData = JSON.parse(storedUserData);
                setUser(parsedUserData);

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
                localStorage.clear();
                window.location.replace('/');
            }
        } else {
            window.location.replace('/');
        }

        // Load stockcard data for today
        fetchStockcardData();
    }, []);

    const fetchStockcardData = async () => {
        setStockcardData(prev => ({ ...prev, loading: true }));
        try {
            // Fetch kitchen stockcard count
            const kitchenRes = await dispatch(countKt_stockcard({ rdate: today })).unwrap();

            // Fetch restaurant stockcard count
            const restaurantRes = await dispatch(countBr_stockcard({ rdate: today })).unwrap();

            // Fetch warehouse stockcard count
            const warehouseRes = await dispatch(countWh_stockcard({ rdate: today })).unwrap();

            setStockcardData({
                kitchen: kitchenRes.data || 0,
                restaurant: restaurantRes.data || 0,
                warehouse: warehouseRes.data || 0,
                loading: false
            });
        } catch (error) {
            console.error('Error fetching stockcard data:', error);
            setStockcardData({
                kitchen: 0,
                restaurant: 0,
                warehouse: 0,
                loading: false
            });
        }
    };

    const handleModeChange = (event) => {
        const newMode = event.target.checked;
        setForceMobileMode(newMode);
        localStorage.setItem('mobileMode', newMode.toString());
    };

    // Navigation handlers - updated to respect mode preference
    const handleSettings = () => {
        window.location.href = '/settings';
    };

    const handleRestaurant = () => {
        window.location.href = isMobileOrTablet ? '/mrestaurant' : '/restaurant';
    };

    const handleWarehouse = () => {
        window.location.href = isMobileOrTablet ? '/mwarehouse' : '/warehouse';
    };

    const handleKitchen = () => {
        window.location.href = isMobileOrTablet ? '/mkitchen' : '/kitchen';
    };

    // Menu handlers
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

    const handleLogout = () => {
        dispatch(logout());
        window.location.replace('/');
    };

    const menuId = 'primary-search-account-menu';
    const mobileMenuId = 'primary-search-account-menu-mobile';

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
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
    );

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
            open={Boolean(mobileMoreAnchorEl)}
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

    // Navigation Button Component
    const NavButton = ({ onClick, icon, label, permission }) => {
        if (!permission) return null;

        return (
            <Button
                onClick={onClick}
                sx={{
                    width: { xs: '130px', sm: '150px', md: '150px' },
                    height: { xs: '110px', sm: '130px', md: '130px' },
                    bgcolor: '#FFFFFF',
                    boxShadow: '0px 4px 4px 0px #00000040',
                    borderRadius: '10px',
                    mt: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mx: { xs: 1, sm: 2 },
                    position: 'relative',
                    '&::after': isMobileOrTablet ? {
                        content: '""',
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#4CAF50'
                    } : {}
                }}
            >
                <img
                    style={{
                        width: isMobileOrTablet ? '60px' : '81px',
                        height: isMobileOrTablet ? '60px' : '81px'
                    }}
                    src={icon}
                    alt={label}
                />
                <Typography sx={{
                    fontSize: { xs: '14px', sm: '16px', md: '16px' },
                    fontWeight: '700',
                    color: '#1D2A3A',
                    mt: 1
                }}>
                    {label}
                    {isMobileOrTablet && (
                        <Typography component="span" sx={{
                            fontSize: '10px',
                            fontWeight: '400',
                            color: '#4CAF50',
                            display: 'block'
                        }}>
                            (Mobile View)
                        </Typography>
                    )}
                </Typography>
            </Button>
        );
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="fixed" sx={{ bgcolor: '#FFFFFF' }}>
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
                                display: isMobileOrTablet ? 'none' : 'block'
                            }}
                        />
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Mode Switch */}
                    <FormControlLabel
                        control={
                            <ModeSwitch
                                checked={forceMobileMode}
                                onChange={handleModeChange}
                                inputProps={{ 'aria-label': 'toggle device mode' }}
                            />
                        }
                        label={
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                ml: -1
                            }}>
                                {forceMobileMode ? (
                                    <PhoneIcon fontSize="small" sx={{ color: '#4CAF50' }} />
                                ) : (
                                    <LaptopIcon fontSize="small" />
                                )}
                                <Typography
                                    sx={{
                                        fontSize: '12px',
                                        display: { xs: 'none', sm: 'block' },
                                        color: forceMobileMode ? '#4CAF50' : 'text.secondary'
                                    }}
                                >
                                    {forceMobileMode ? 'Mobile' : 'Desktop'}
                                </Typography>
                            </Box>
                        }
                        labelPlacement="end"
                        sx={{ mr: 2, ml: 0 }}
                    />

                    {/* Desktop Icons */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                        <IconButton
                            size="large"
                            onClick={handleSettings}
                            sx={{ color: '#979797' }}
                        >
                            <SettingsIcon />
                        </IconButton>
                        <IconButton
                            size="large"
                            sx={{ color: '#979797' }}
                        >
                            <Badge badgeContent={17} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        <IconButton
                            size="large"
                            edge="end"
                            aria-label="account"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            sx={{ color: '#979797' }}
                        >
                            <AccountCircle />
                        </IconButton>
                    </Box>

                    {/* Mobile/Tablet Menu Icon */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="show more"
                            aria-controls={mobileMenuId}
                            aria-haspopup="true"
                            onClick={handleMobileMenuOpen}
                            sx={{ color: '#979797' }}
                        >
                            <MoreIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box sx={{
                flexGrow: 1,
                width: '100%',
                pt: '90px',
                bgcolor: '#EDEDED',
                minHeight: '100vh'
            }}>
                {/* Mode indicator banner when in mobile mode */}
                {forceMobileMode && (
                    <Box sx={{
                        width: '100%',
                        py: 1,
                        bgcolor: '#E8F5E9',
                        textAlign: 'center',
                        mb: 2
                    }}>
                        <Typography sx={{ color: '#4CAF50', fontWeight: 'medium', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PhoneIcon sx={{ mr: 1, fontSize: 20 }} />
                            Mobile Mode Active - All links will direct to mobile versions
                        </Typography>
                    </Box>
                )}

                {/* Navigation Buttons */}
                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: { xs: 1, sm: 2 },
                    px: { xs: 2, sm: 3 }
                }}>
                    <NavButton
                        onClick={handleRestaurant}
                        icon="/shop.png"
                        label="Restaurant"
                        permission={permissions.menu_setbranch === 'Y'}
                    />
                    <NavButton
                        onClick={handleWarehouse}
                        icon="/warehouse.png"
                        label="Warehouse"
                        permission={permissions.menu_setwarehouse === 'Y'}
                    />
                    <NavButton
                        onClick={handleKitchen}
                        icon="/room4,5.png"
                        label="Kitchen"
                        permission={permissions.menu_setkitchen === 'Y'}
                    />
                </Box>

                {/* Dashboard Content */}
                <Box sx={{
                    width: '95%',
                    margin: '60px auto',
                    bgcolor: 'white',
                    borderRadius: '15px',
                    p: { xs: 2, sm: 4 }
                }}>
                    <Typography sx={{
                        fontSize: { xs: '24px', sm: '32px' },
                        fontWeight: '700',
                        color: '#464255',
                        mb: 3
                    }}>
                        Dashboard {forceMobileMode && <Typography component="span" color="primary">(Mobile Mode)</Typography>}
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ color: '#464255', mb: 1 }}>
                            Today's Stockcard Entries ({today})
                        </Typography>
                        <Divider />
                    </Box>

                    {stockcardData.loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid2 container spacing={3} sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center'
                        }}>
                            {/* Kitchen Stockcard */}
                            <Grid2 item xs={12} sm={6} md={4}>
                                <StockCountCard>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center'
                                    }}>
                                        <Kitchen sx={{ fontSize: 60, color: '#4CAF50', mb: 2 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Kitchen Stockcard
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                                            {stockcardData.kitchen}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                            Entries today
                                        </Typography>
                                    </Box>
                                </StockCountCard>
                            </Grid2>

                            {/* Restaurant Stockcard */}
                            <Grid2 item xs={12} sm={6} md={4}>
                                <StockCountCard>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center'
                                    }}>
                                        <StorefrontOutlined sx={{ fontSize: 60, color: '#2196F3', mb: 2 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Restaurant Stockcard
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                                            {stockcardData.restaurant}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                            Entries today
                                        </Typography>
                                    </Box>
                                </StockCountCard>
                            </Grid2>

                            {/* Warehouse Stockcard */}
                            <Grid2 item xs={12} sm={6} md={4}>
                                <StockCountCard>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center'
                                    }}>
                                        <WarehouseOutlined sx={{ fontSize: 60, color: '#FF9800', mb: 2 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Warehouse Stockcard
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                                            {stockcardData.warehouse}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                            Entries today
                                        </Typography>
                                    </Box>
                                </StockCountCard>
                            </Grid2>
                        </Grid2>
                    )}


                    {/* Button to refresh data */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={fetchStockcardData}
                            disabled={stockcardData.loading}
                            startIcon={stockcardData.loading ? <CircularProgress size={20} /> : null}
                        >
                            {stockcardData.loading ? 'Refreshing...' : 'Refresh Data'}
                        </Button>
                    </Box>
                </Box>
            </Box>

            {renderMobileMenu}
            {renderMenu}
        </Box>
    );
}