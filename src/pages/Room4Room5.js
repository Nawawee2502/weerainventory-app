import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import BarChartIcon from '@mui/icons-material/BarChart';
import Button from '@mui/material/Button';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useNavigate } from "react-router-dom";
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import HouseSidingOutlinedIcon from '@mui/icons-material/HouseSidingOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CircleIcon from '@mui/icons-material/Circle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import DescriptionIcon from '@mui/icons-material/Description';
import StoreIcon from '@mui/icons-material/Store';

import HomePurchaseOrdertoWarehouse from '../components/room4room5/purchaseordertowarehouse/HomePurchaseOrdertoWarehouse';
import HomeReceiptFromSupplier from '../components/room4room5/receiptfromsupplier/HomeReceiptFromSupplier';
import HomeReceiptFromWarehouse from '../components/room4room5/receiptfromwarehouse/HomeReceiptFromWarehouse';
import HomeGoodsRequisition from '../components/room4room5/goodsrequisition/HomeGoodsRequisition';
import HomeProductionReceipt from '../components/room4room5/productionreceipt/HomeProductionReceipt';
import HomeTransferToWarehouse from '../components/room4room5/transfertowarehouse/HomeTransferToWarehouse';
import HomeDispatchToRestaurant from '../components/room4room5/dispatchtorestaurant/HomeDispatchToRestaurant';
import HomeStockAdjustment from '../components/room4room5/stockadjustment/HomeStockAdjustment';
import HomeDailyClosing from '../components/room4room5/dailyclosing/Dailyclosing';
import ReportPurchaseOrderToWarehouse from '../components/room4room5/report/ReportPurchaseOrderToWarehouse';
import ReportReceiptFromSupplier from '../components/room4room5/report/ReportReceiptFromSupplier';
import ReportReceiptFromWarehouse from '../components/room4room5/report/ReportReceiptFromWarehouse';
import ReportGoodsRequisition from '../components/room4room5/report/ReportGoodsRequisition';
import ReportProductionReceipt from '../components/room4room5/report/ReportProductionReceipt';
import ReportTransferToWarehouse from '../components/room4room5/report/ReportTransferToWarehouse';
import ReportDispatchToRestaurant from '../components/room4room5/report/ReportDispatchToRestaurant';
import ReportStockAdjustment from '../components/room4room5/report/ReportStockAdjustment';
import ReportMonthlyStockCard from '../components/room4room5/report/ReportMonthlyStockCard';
import ReportMonthlyStockBalance from '../components/room4room5/report/ReportMonthlyStockBalance';
import BeginningInventory from '../components/room4room5/beginninginventory/BeginningInventory';

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

function Room4Room5(props) {
    const { window } = props;
    const [pathname, setPathname] = React.useState('/beginning-inventory');
    const [currentTitle, setCurrentTitle] = React.useState('Kitchen - Beginning Inventory');
    let navigate = useNavigate();

    const NAVIGATION = React.useMemo(() => {
        const userData = JSON.parse(localStorage.getItem('userData2'));
        const permissions = userData?.tbl_typeuserpermission || {};

        // รายการเมนูที่เรียงตาม MKitchen และใช้ชื่อตาม MKitchen
        const menu = [];

        // 1. Beginning Inventory
        if (permissions.menu_setkt_beginninginventory === 'Y') {
            menu.push({
                segment: 'beginning-inventory',
                title: 'Beginning Inventory',
                icon: <StoreIcon />,
            });
        }

        // 2. Purchase Order to Warehouse
        if (permissions.menu_setkt_purchase_order_to_wh === 'Y') {
            menu.push({
                segment: 'purchase-order-to-warehouse',
                title: 'Request to Warehouse',
                icon: <ListAltIcon />,
            });
        }

        // 3. Receipt From Warehouse (เทียบเท่ากับ Goods Receipt Warehouse ใน M
        if (permissions.menu_setkt_receipt_from_wh === 'Y') {
            menu.push({
                segment: 'receipt-from-warehouse',
                title: 'Goods Receipt Warehouse',
                icon: <MoveToInboxIcon />,
            });
        }

        // 4. Receipt From Supplier (เทียบเท่ากับ Goods Receipt Supplier ใน M
        if (permissions.menu_setkt_receipt_from_supplier === 'Y') {
            menu.push({
                segment: 'receipt-from-supplier',
                title: 'Goods Receipt Supplier',
                icon: <ReceiptOutlinedIcon />,
            });
        }

        // 5. Transfer to Warehouse
        if (permissions.menu_setkt_transfer_to_wh === 'Y') {
            menu.push({
                segment: 'transfer-to-warehouse',
                title: 'Transfer to Warehouse',
                icon: <DescriptionIcon />,
            });
        }

        // 6. Dispatch to Restaurant
        if (permissions.menu_setkt_dispatch_to_branch === 'Y') {
            menu.push({
                segment: 'dispatch-to-restaurant',
                title: 'Dispatch To Restaurant',
                icon: <HouseSidingOutlinedIcon />,
            });
        }

        // 7. Goods Requisition
        if (permissions.menu_setkt_goods_requisition === 'Y') {
            menu.push({
                segment: 'goods-requisition',
                title: 'Goods Requisition',
                icon: <RequestQuoteIcon />,
            });
        }

        // 8. Production Receipt
        if (permissions.menu_setkt_product_receipt === 'Y') {
            menu.push({
                segment: 'production-receipt',
                title: 'Production Receipt',
                icon: <ReceiptLongOutlinedIcon />,
            });
        }

        // 9. Stock Adjustment
        if (permissions.menu_setkt_stock_adjustment === 'Y') {
            menu.push({
                segment: 'stock-adjustment',
                title: 'Stock Adjustment',
                icon: <Inventory2OutlinedIcon />,
            });
        }

        // 10. Reports - Monthly Stock Card
        // 11. Reports - Monthly Stock Balance
        // 12. Daily Closing
        if (permissions.menu_setkt_report === 'Y') {
            menu.push({
                segment: 'reports',
                title: 'Reports',
                icon: <BarChartIcon />,
                children: [
                    {
                        segment: 'monthly-stock-card',
                        title: 'Report Monthly Stockcard',
                        icon: <CircleIcon fontSize='small' />,
                    },
                    {
                        segment: 'monthly-stock-balance',
                        title: 'Report Monthly Stockbalance',
                        icon: <CircleIcon fontSize='small' />,
                    },
                    {
                        segment: 'purchase-order-to-warehouse',
                        title: 'Request to Warehouse',
                        icon: <CircleIcon fontSize='small' />,
                    },
                    {
                        segment: 'receipt-from-supplier',
                        title: 'Goods Receipt Supplier',
                        icon: <CircleIcon fontSize='small' />,
                    },
                    {
                        segment: 'receipt-from-warehouse',
                        title: 'Goods Receipt Warehouse',
                        icon: <CircleIcon fontSize='small' />,
                    },
                    {
                        segment: 'goods-requisition',
                        title: 'Goods Requisition',
                        icon: <CircleIcon fontSize='small' />,
                    },
                    {
                        segment: 'production-receipt',
                        title: 'Production Receipt',
                        icon: <CircleIcon fontSize='small' />,
                    },
                    {
                        segment: 'transfer-to-warehouse',
                        title: 'Transfer to Warehouse',
                        icon: <CircleIcon fontSize='small' />,
                    },
                    {
                        segment: 'dispatch-to-restaurant',
                        title: 'Dispatch To Restaurant',
                        icon: <CircleIcon fontSize='small' />,
                    },
                    {
                        segment: 'stock-adjustment',
                        title: 'Stock Adjustment',
                        icon: <CircleIcon fontSize='small' />,
                    },
                ],
            });
        }

        // Daily Closing (เป็นเมนูที่แยกออกมาต่างหากใน MKitchen)
        if (permissions.menu_setkt_dailyclosing === 'Y') {
            menu.push({
                segment: 'daily-closing',
                title: 'Kitchen DailyClosing',
                icon: <Inventory2OutlinedIcon />,
            });
        }

        return menu;
    }, []);

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
                if (subMenu) return `Kitchen - ${subMenu.title}`;
            }
            return 'Kitchen - Reports';
        }

        const segment = path.substring(1);
        const mainMenu = NAVIGATION.find(item => item.segment === segment);
        if (mainMenu) return `Kitchen - ${mainMenu.title}`;

        return 'Kitchen - Beginning Inventory';
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
        const userData = JSON.parse(localStorage.getItem('userData2'));
        const permissions = userData?.tbl_typeuserpermission || {};

        if (permissions.menu_setkt_report !== 'Y') return null;

        switch (path) {
            case '/reports/purchase-order-to-warehouse':
                return <ReportPurchaseOrderToWarehouse />;
            case '/reports/receipt-from-supplier':
                return <ReportReceiptFromSupplier />;
            case '/reports/receipt-from-warehouse':
                return <ReportReceiptFromWarehouse />;
            case '/reports/goods-requisition':
                return <ReportGoodsRequisition />;
            case '/reports/production-receipt':
                return <ReportProductionReceipt />;
            case '/reports/transfer-to-warehouse':
                return <ReportTransferToWarehouse />;
            case '/reports/dispatch-to-restaurant':
                return <ReportDispatchToRestaurant />;
            case '/reports/stock-adjustment':
                return <ReportStockAdjustment />;
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
                return permissions.menu_setkt_beginninginventory === 'Y' ? <BeginningInventory /> : null;
            case '/purchase-order-to-warehouse':
                return permissions.menu_setkt_purchase_order_to_wh === 'Y' ? <HomePurchaseOrdertoWarehouse /> : null;
            case '/receipt-from-supplier':
                return permissions.menu_setkt_receipt_from_supplier === 'Y' ? <HomeReceiptFromSupplier /> : null;
            case '/receipt-from-warehouse':
                return permissions.menu_setkt_receipt_from_wh === 'Y' ? <HomeReceiptFromWarehouse /> : null;
            case '/goods-requisition':
                return permissions.menu_setkt_goods_requisition === 'Y' ? <HomeGoodsRequisition /> : null;
            case '/production-receipt':
                return permissions.menu_setkt_product_receipt === 'Y' ? <HomeProductionReceipt /> : null;
            case '/transfer-to-warehouse':
                return permissions.menu_setkt_transfer_to_wh === 'Y' ? <HomeTransferToWarehouse /> : null;
            case '/dispatch-to-restaurant':
                return permissions.menu_setkt_dispatch_to_branch === 'Y' ? <HomeDispatchToRestaurant /> : null;
            case '/stock-adjustment':
                return permissions.menu_setkt_stock_adjustment === 'Y' ? <HomeStockAdjustment /> : null;
            case '/daily-closing':
                return permissions.menu_setkt_dailyclosing === 'Y' ? <HomeDailyClosing /> : null;
            case '/reports/purchase-order-to-warehouse':
            case '/reports/receipt-from-supplier':
            case '/reports/receipt-from-warehouse':
            case '/reports/goods-requisition':
            case '/reports/production-receipt':
            case '/reports/transfer-to-warehouse':
            case '/reports/dispatch-to-restaurant':
            case '/reports/stock-adjustment':
            case '/reports/monthly-stock-card':
            case '/reports/monthly-stock-balance':
                return renderReportContent(pathname);
            default:
                return permissions.menu_setkt_beginninginventory === 'Y' ? <BeginningInventory /> : null;
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

Room4Room5.propTypes = {
    window: PropTypes.func,
};

export default Room4Room5;