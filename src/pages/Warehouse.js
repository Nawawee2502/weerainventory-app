import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import Button from '@mui/material/Button';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useNavigate } from "react-router-dom";
import HomePurchaseOrderToSupplier from '../components/warehouse/purchaseordertosupplier/HomePurchaseOrdertoSupplier';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CountertopsOutlinedIcon from '@mui/icons-material/CountertopsOutlined';
import HouseSidingOutlinedIcon from '@mui/icons-material/HouseSidingOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CircleIcon from '@mui/icons-material/Circle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeReceiptFromSupplier from '../components/warehouse/receiptfromsupplier/HomeReceiptFromSupplier';
import HomeReceiptFromKitchen from '../components/warehouse/receiptfromkitchen/HomeReceiptFromKitchen';
import HomeDispatchToKitchen from '../components/warehouse/dispatchtokitchen/HomeDispatchToKitchen';
import HomeDispatchToBranch from '../components/warehouse/dispatchtobranch/HomeDispatchToBranch';
import HomeStockAdjustment from '../components/warehouse/stockadjustment/HomeStockAdjustMent';

const NAVIGATION = [
    {
        segment: 'purchase-order-to-supplier',
        title: 'Purchase Order to Supplier',
        icon: <ReceiptLongOutlinedIcon />,
    },
    {
        segment: 'receipt-from-supplier',
        title: 'Receipt From Supplier',
        icon: <ReceiptOutlinedIcon />,
    },
    {
        segment: 'receipt-from-kitchen',
        title: 'Receipt From Kitchen',
        icon: <LocalShippingOutlinedIcon />,
    },
    {
        segment: 'dispatch-to-kitchen',
        title: 'Dispatch to Kitchen',
        icon: <CountertopsOutlinedIcon />,
    },
    {
        segment: 'dispatch-to-branch',
        title: 'Dispatch to Branch',
        icon: <HouseSidingOutlinedIcon />,
    },
    {
        segment: 'stock-adjustment',
        title: 'Stock Adjustment',
        icon: <Inventory2OutlinedIcon />,
    },
    {
        segment: 'reports',
        title: 'Reports',
        icon: <BarChartIcon />,
        children: [
            {
                segment: 'purchase-order-to-supplier',
                title: 'Purchase Order to Supplier',
                icon: <CircleIcon fontSize='small' />,
            },
            {
                segment: 'receipt-from-supplier',
                title: 'Receipt From Supplier',
                icon: <CircleIcon fontSize='small' />,
            },
            {
                segment: 'receipt-from-kitchen',
                title: 'Receipt From Kitchen',
                icon: <CircleIcon fontSize='small' />,
            },
            {
                segment: 'dispatch-to-kitchen',
                title: 'Dispatch to Kitchen',
                icon: <CircleIcon fontSize='small' />,
            },
            {
                segment: 'dispatch-to-branch',
                title: 'Dispatch to Branch',
                icon: <CircleIcon fontSize='small' />,
            },
            {
                segment: 'stock-adjustment',
                title: 'Stock Adjustment',
                icon: <CircleIcon fontSize='small' />,
            },
            {
                segment: 'monthly-stock-card',
                title: 'Monthly Stock Card',
                icon: <CircleIcon fontSize='small' />,
            },
            {
                segment: 'monthly-stock-balance',
                title: 'Monthly Stock Balance',
                icon: <CircleIcon fontSize='small' />,
            },
        ],
    },
];

const demoTheme = createTheme({
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 600,
            lg: 1200,
            xl: 1536,
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    '& .MuiToolbar-root': {
                        justifyContent: 'space-between',
                        '& .MuiTypography-root': {
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontWeight: 'bold',
                            color: 'black',
                        },
                    },
                },
            },
        },
    },
});

function Warehouse(props) {
    const { window } = props;
    const [pathname, setPathname] = React.useState('/purchase-order-to-supplier');
    const [currentTitle, setCurrentTitle] = React.useState('Purchase Order to Supplier');
    let navigate = useNavigate();

    const handleDashboard = () => {
        navigate('/dashboard');
        setCurrentTitle('Dashboard');
    };

    const findMenuTitle = (path) => {
        const segment = path.substring(1);

        const mainMenu = NAVIGATION.find(item => item.segment === segment);
        if (mainMenu) return mainMenu.title;

        for (const menu of NAVIGATION) {
            if (menu.children) {
                const subMenu = menu.children.find(item => item.segment === segment);
                if (subMenu) return subMenu.title;
            }
        }

        return 'Purchase Order to Supplier'; // เปลี่ยน default return
    };

    function SidebarFooter({ mini }) {
        const navigate = useNavigate();

        return (
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Button
                    variant="text"
                    startIcon={!mini && <ArrowBackIcon />}
                    onClick={() => {
                        navigate('/dashboard');
                        setCurrentTitle('Dashboard');
                    }}
                    sx={{
                        minWidth: 0,
                        p: mini ? 1 : 2,
                        color: 'text.secondary',
                        '&:hover': {
                            color: 'primary.main'
                        }
                    }}
                >
                    {mini ? <ArrowBackIcon /> : 'Back to Dashboard'}
                </Button>
            </Box>
        );
    }

    SidebarFooter.propTypes = {
        mini: PropTypes.bool.isRequired,
    };

    const router = React.useMemo(() => {
        return {
            pathname,
            searchParams: new URLSearchParams(),
            navigate: (path) => {
                setPathname(String(path));
                setCurrentTitle(findMenuTitle(String(path)));
            },
        };
    }, [pathname]);

    const demoWindow = window !== undefined ? window() : undefined;

    const renderContent = () => {
        switch (pathname) {
            case '/purchase-order-to-supplier':
                return <HomePurchaseOrderToSupplier />;
            case '/receipt-from-supplier':
                return <HomeReceiptFromSupplier />;
            case '/receipt-from-kitchen':
                return <HomeReceiptFromKitchen />;
            case '/dispatch-to-kitchen':
                return <HomeDispatchToKitchen />;
            case '/dispatch-to-branch':
                return <HomeDispatchToBranch />;
            case '/stock-adjustment':
                return <HomeStockAdjustment />;
            default:
                return <HomePurchaseOrderToSupplier />;
        }
    };

    return (
        <AppProvider
            navigation={NAVIGATION}
            router={router}
            window={demoWindow}
            theme={demoTheme}
            branding={{
                logo: (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                        </Box>
                    </>
                ),
                title: currentTitle,
            }}
        >
            <DashboardLayout
                defaultSidebarCollapsed
                slots={{ sidebarFooter: SidebarFooter }}
            >
                {renderContent()}
            </DashboardLayout>
        </AppProvider>
    );
}

Warehouse.propTypes = {
    window: PropTypes.func,
};

export default Warehouse;