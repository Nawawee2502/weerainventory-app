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
import DailyClosing from '../components/warehouse/dailyclosing/DailyClosing';
import ReportPurchaseordertosupplier from '../components/warehouse/reportwarehouse/Reportpurchaseordertosupplier';
import ReportReceiptFromSupplier from '../components/warehouse/reportwarehouse/ReportReceiptfromsupplier';
import ReportReceiptFromKitchen from '../components/warehouse/reportwarehouse/ReportReceiptFromKitchen';
import ReportDispatchToKitchen from '../components/warehouse/reportwarehouse/ReportDispatchToKitchen';
import ReportDispatchToBranch from '../components/warehouse/reportwarehouse/ReportDispatchToBranch';
import ReportMonthlyStockCard from '../components/warehouse/reportwarehouse/ReportMonthlyStockCard';
import ReportMonthlyStockBalance from '../components/warehouse/reportwarehouse/ReportMonthlyStockBalance';
import BeginningInventory from '../components/warehouse/beginninginventory/BeginningInventory';

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
    const [pathname, setPathname] = React.useState('/beginning-inventory');
    const [currentTitle, setCurrentTitle] = React.useState('Warehouse - Beginning Inventory');
    let navigate = useNavigate();

    const NAVIGATION = React.useMemo(() => {
        const userData = JSON.parse(localStorage.getItem('userData2'));
        const permissions = userData?.tbl_typeuserpermission || {};

        const menu = [];

        // Beginning Inventory
        if (permissions.menu_setwarehouse === 'Y') {
            menu.push({
                segment: 'beginning-inventory',
                title: 'Beginning Inventory',
                icon: <ReceiptLongOutlinedIcon />,
            });
        }

        // Purchase Order to Supplier
        if (permissions.menu_setwh_purchase_order_to_supplier === 'Y') {
            menu.push({
                segment: 'purchase-order-to-supplier',
                title: 'Purchase Order To Supplier',
                icon: <ReceiptLongOutlinedIcon />,
            });
        }

        // Receipt From Supplier
        if (permissions.menu_setwh_receipt_from_supplier === 'Y') {
            menu.push({
                segment: 'receipt-from-supplier',
                title: 'Receipt From Supplier',
                icon: <ReceiptOutlinedIcon />,
            });
        }

        // Receipt From Kitchen
        if (permissions.menu_setwh_receipt_from_kitchen === 'Y') {
            menu.push({
                segment: 'receipt-from-kitchen',
                title: 'Receipt From Kitchen',
                icon: <LocalShippingOutlinedIcon />,
            });
        }

        // Dispatch to Kitchen
        if (permissions.menu_setwh_dispatch_to_kitchen === 'Y') {
            menu.push({
                segment: 'dispatch-to-kitchen',
                title: 'Dispatch to Kitchen',
                icon: <CountertopsOutlinedIcon />,
            });
        }

        // Dispatch to Branch
        if (permissions.menu_setwh_dispatch_to_branch === 'Y') {
            menu.push({
                segment: 'dispatch-to-branch',
                title: 'Dispatch to Restaurant',
                icon: <HouseSidingOutlinedIcon />,
            });
        }

        // Daily Closing
        if (permissions.menu_setwh_daily_closing === 'Y') {
            menu.push({
                segment: 'daily-closing',
                title: 'Daily Closing',
                icon: <Inventory2OutlinedIcon />,
            });
        }

        // Reports
        if (permissions.menu_setwh_report === 'Y') {
            menu.push({
                segment: 'reports',
                title: 'Reports',
                icon: <BarChartIcon />,
                children: [
                    {
                        segment: 'purchase-order-to-supplier',
                        title: 'Purchase Order',
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
                        title: 'Dispatch to Restaurant',
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
                    }
                ],
            });
        }

        return menu;
    }, []);

    const handleDashboard = () => {
        navigate('/dashboard');
        setCurrentTitle('Dashboard');
    };

    const findMenuTitle = (path) => {
        // For reports with path format /reports/xxx
        if (path.startsWith('/reports/')) {
            const reportSegment = path.substring('/reports/'.length);
            const reportsMenu = NAVIGATION.find(item => item.segment === 'reports');
            if (reportsMenu && reportsMenu.children) {
                const subMenu = reportsMenu.children.find(item => item.segment === reportSegment);
                if (subMenu) return `Warehouse - ${subMenu.title}`;
            }
            return 'Warehouse - Reports';
        }

        // For other main menu items
        const segment = path.substring(1);
        const mainMenu = NAVIGATION.find(item => item.segment === segment);
        if (mainMenu) return `Warehouse - ${mainMenu.title}`;

        return 'Warehouse - Beginning Inventory';
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

    const renderReportContent = (path) => {
        switch (path) {
            case '/reports/purchase-order-to-supplier':
                return <ReportPurchaseordertosupplier />;
            case '/reports/receipt-from-supplier':
                return <ReportReceiptFromSupplier />;
            case '/reports/receipt-from-kitchen':
                return <ReportReceiptFromKitchen />;
            case '/reports/dispatch-to-kitchen':
                return <ReportDispatchToKitchen />;
            case '/reports/dispatch-to-branch':
                return <ReportDispatchToBranch />;
            case '/reports/monthly-stock-card':
                return <ReportMonthlyStockCard />;
            case '/reports/monthly-stock-balance':
                return <ReportMonthlyStockBalance />;
            default:
                return null;
        }
    };

    const renderContent = () => {
        const userData = JSON.parse(localStorage.getItem('userData2'));
        const permissions = userData?.tbl_typeuserpermission || {};

        switch (pathname) {
            case '/beginning-inventory':
                return permissions.menu_setwarehouse === 'Y' ? <BeginningInventory /> : null;
            case '/purchase-order-to-supplier':
                return permissions.menu_setwh_purchase_order_to_supplier === 'Y' ? <HomePurchaseOrderToSupplier /> : null;
            case '/receipt-from-supplier':
                return permissions.menu_setwh_receipt_from_supplier === 'Y' ? <HomeReceiptFromSupplier /> : null;
            case '/receipt-from-kitchen':
                return permissions.menu_setwh_receipt_from_kitchen === 'Y' ? <HomeReceiptFromKitchen /> : null;
            case '/dispatch-to-kitchen':
                return permissions.menu_setwh_dispatch_to_kitchen === 'Y' ? <HomeDispatchToKitchen /> : null;
            case '/dispatch-to-branch':
                return permissions.menu_setwh_dispatch_to_branch === 'Y' ? <HomeDispatchToBranch /> : null;
            case '/daily-closing':
                return permissions.menu_setwh_daily_closing === 'Y' ? <DailyClosing /> : null;
            case '/reports/purchase-order-to-supplier':
            case '/reports/receipt-from-supplier':
            case '/reports/receipt-from-kitchen':
            case '/reports/dispatch-to-kitchen':
            case '/reports/dispatch-to-branch':
            case '/reports/monthly-stock-card':
            case '/reports/monthly-stock-balance':
                return permissions.menu_setwh_report === 'Y' ? renderReportContent(pathname) : null;
            default:
                return permissions.menu_setwarehouse === 'Y' ? <BeginningInventory /> : null;
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