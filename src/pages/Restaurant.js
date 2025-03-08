import * as React from 'react';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import Button from '@mui/material/Button';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useNavigate } from "react-router-dom";
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CircleIcon from '@mui/icons-material/Circle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import InventoryIcon from '@mui/icons-material/Inventory';
import EventNoteIcon from '@mui/icons-material/EventNote';

import HomeSetMinimumStock from '../components/restaurant/setminimumstock/HomeSetMinimumStock';
import HomePurchaseOrdertoWarehouse from '../components/restaurant/purchaseordertowarehouse/HomePurchaseOrdertoWarehouse';
import HomeReceiptFromSupplier from '../components/restaurant/receiptfromsupplier/HomeReceiptFromSupplier';
import HomeReceiptFromWarehouse from '../components/restaurant/receiptfromwarehouse/HomeReceiptFromWarehouse';
import HomeReceiptFromKitchen from '../components/restaurant/receiptfromkitchen/HomeReceiptFromKitchen';
import HomeGoodsRequisition from '../components/restaurant/goodsrequisition/HomeGoodsRequisition';
import ReportPurchaseOrderToWarehouse from '../components/restaurant/report/ReportPurchaseOrderToWarehouse';
import ReportReceiptFromWarehouse from '../components/restaurant/report/ReportReceiptFromWarehouse';
import ReportReceiptFromKitchen from '../components/restaurant/report/ReportReceiptFromKitchen';
import ReportReceiptFromSupplier from '../components/restaurant/report/ReportReceiptFromSupplier';
import ReportGoodsRequisition from '../components/restaurant/report/ReportGoodsRequisition';
import ReportMonthlyStockCard from '../components/restaurant/report/ReportMonthlyStockCard';
import ReportMonthlyStockBalance from '../components/restaurant/report/ReportMonthlyStockBalance';
import HomeDailyClosing from '../components/restaurant/dailyclosing/Dailyclosing';
import BeginningInventory from '../components/restaurant/beginninginventory/Beginninginventory';

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

function Restaurant(props) {
    const { window } = props;

    const NAVIGATION = React.useMemo(() => {
        const userData = JSON.parse(localStorage.getItem('userData2'));
        const permissions = userData?.tbl_typeuserpermission || {};

        const menu = [];

        // Beginning Inventory
        if (permissions.menu_setbr_beginninginventory === 'Y') {
            menu.push({
                segment: 'beginning-inventory',
                title: 'Beginning Inventory',
                icon: <InventoryIcon />,
            });
        }

        // Set Minimum Stock
        if (permissions.menu_setbr_minmum_stock === 'Y') {
            menu.push({
                segment: 'set-minimum-stock',
                title: 'Set Minimum Stock',
                icon: <ReceiptLongOutlinedIcon />,
            });
        }

        // Purchase Order to Warehouse
        if (permissions.menu_setbr_purchase_order_to_wh === 'Y') {
            menu.push({
                segment: 'purchase-order-to-warehouse',
                title: 'Purchase Order to Warehouse',
                icon: <ListAltIcon />,
            });
        }

        // Receipt From Warehouse
        if (permissions.menu_setbr_receipt_from_warehouse === 'Y') {
            menu.push({
                segment: 'receipt-from-warehouse',
                title: 'Receipt From Warehouse',
                icon: <MoveToInboxIcon />,
            });
        }

        // Receipt From Kitchen
        if (permissions.menu_setbr_receipt_from_kitchen === 'Y') {
            menu.push({
                segment: 'receipt-from-kitchen',
                title: 'Receipt From Kitchen',
                icon: <LocalShippingOutlinedIcon />,
            });
        }

        // Receipt From Supplier
        if (permissions.menu_setbr_receipt_from_supplier === 'Y') {
            menu.push({
                segment: 'receipt-from-supplier',
                title: 'Receipt From Supplier',
                icon: <ReceiptOutlinedIcon />,
            });
        }

        // Goods Requisition
        if (permissions.menu_setbr_goods_requisition === 'Y') {
            menu.push({
                segment: 'goods-requisition',
                title: 'Goods Requisition',
                icon: <RequestQuoteIcon />,
            });
        }

        // Daily Closing
        if (permissions.menu_setbr_dailyclosing === 'Y') {
            menu.push({
                segment: 'daily-closing',
                title: 'Daily Closing',
                icon: <EventNoteIcon />,
            });
        }

        // Reports
        if (permissions.menu_setbr_report === 'Y') {
            menu.push({
                segment: 'reports',
                title: 'Reports',
                icon: <BarChartIcon />,
                children: [
                    {
                        segment: 'purchase-order-to-warehouse',
                        title: 'Purchase Order to Warehouse',
                        icon: <CircleIcon fontSize='small' />,
                    },
                    {
                        segment: 'receipt-from-warehouse',
                        title: 'Receipt From Warehouse',
                        icon: <CircleIcon fontSize='small' />,
                    },
                    {
                        segment: 'receipt-from-kitchen',
                        title: 'Receipt From Kitchen',
                        icon: <CircleIcon fontSize='small' />,
                    },
                    {
                        segment: 'receipt-from-supplier',
                        title: 'Receipt From Supplier',
                        icon: <CircleIcon fontSize='small' />,
                    },
                    {
                        segment: 'goods-requisition',
                        title: 'Goods Requisition',
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
            });
        }

        return menu;
    }, []);

    const firstMenuItem = NAVIGATION[0]?.segment || '/set-minimum-stock';
    const [pathname, setPathname] = React.useState(`/${firstMenuItem}`);
    const [currentTitle, setCurrentTitle] = React.useState(`Restaurant - ${NAVIGATION[0]?.title || 'Set Minimum Stock'}`);
    let navigate = useNavigate();



    const handleDashboard = () => {
        navigate('/dashboard');
        setCurrentTitle('Dashboard');
    };

    const findMenuTitle = (path) => {
        if (path.startsWith('/reports/')) {
            const reportSegment = path.substring('/reports/'.length);
            const reportsMenu = NAVIGATION.find(item => item.segment === 'reports');
            if (reportsMenu && reportsMenu.children) {
                const subMenu = reportsMenu.children.find(item => item.segment === reportSegment);
                if (subMenu) return `Restaurant - ${subMenu.title}`;
            }
            return 'Restaurant - Reports';
        }

        const segment = path.substring(1);
        const mainMenu = NAVIGATION.find(item => item.segment === segment);
        if (mainMenu) return `Restaurant - ${mainMenu.title}`;

        return 'Restaurant - Set Minimum Stock';
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
            case '/reports/purchase-order-to-warehouse':
                return <ReportPurchaseOrderToWarehouse />;
            case '/reports/receipt-from-warehouse':
                return <ReportReceiptFromWarehouse />;
            case '/reports/receipt-from-kitchen':
                return <ReportReceiptFromKitchen />;
            case '/reports/receipt-from-supplier':
                return <ReportReceiptFromSupplier />;
            case '/reports/goods-requisition':
                return <ReportGoodsRequisition />;
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
                return permissions.menu_setbr_beginninginventory === 'Y' ? <BeginningInventory /> : null;
            case '/set-minimum-stock':
                return permissions.menu_setbr_minmum_stock === 'Y' ? <HomeSetMinimumStock /> : null;
            case '/purchase-order-to-warehouse':
                return permissions.menu_setbr_purchase_order_to_wh === 'Y' ? <HomePurchaseOrdertoWarehouse /> : null;
            case '/receipt-from-warehouse':
                return permissions.menu_setbr_receipt_from_warehouse === 'Y' ? <HomeReceiptFromWarehouse /> : null;
            case '/receipt-from-kitchen':
                return permissions.menu_setbr_receipt_from_kitchen === 'Y' ? <HomeReceiptFromKitchen /> : null;
            case '/receipt-from-supplier':
                return permissions.menu_setbr_receipt_from_supplier === 'Y' ? <HomeReceiptFromSupplier /> : null;
            case '/goods-requisition':
                return permissions.menu_setbr_goods_requisition === 'Y' ? <HomeGoodsRequisition /> : null;
            case '/daily-closing':
                return permissions.menu_setbr_dailyclosing === 'Y' ? <HomeDailyClosing /> : null;
            case '/reports/purchase-order-to-warehouse':
            case '/reports/receipt-from-warehouse':
            case '/reports/receipt-from-kitchen':
            case '/reports/receipt-from-supplier':
            case '/reports/goods-requisition':
            case '/reports/monthly-stock-card':
            case '/reports/monthly-stock-balance':
                return permissions.menu_setbr_report === 'Y' ? renderReportContent(pathname) : null;
            default:
                return null;
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

Restaurant.propTypes = {
    window: PropTypes.func,
};

export default Restaurant;