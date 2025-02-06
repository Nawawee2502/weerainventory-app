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

const NAVIGATION = [
    {
        segment: 'beginning-inventory',
        title: 'Beginning Inventory',
        icon: <StoreIcon />,
    },
    {
        segment: 'purchase-order-to-warehouse',
        title: 'Purchase Order to Warehouse',
        icon: <ListAltIcon />,
    },
    {
        segment: 'receipt-from-supplier',
        title: 'Receipt From Supplier',
        icon: <ReceiptOutlinedIcon />,
    },
    {
        segment: 'receipt-from-warehouse',
        title: 'Receipt From Warehouse',
        icon: <MoveToInboxIcon />,
    },
    {
        segment: 'goods-requisition',
        title: 'Goods Requisition',
        icon: <RequestQuoteIcon />,
    },
    {
        segment: 'production-receipt',
        title: 'Production Receipt',
        icon: <ReceiptLongOutlinedIcon />,
    },
    {
        segment: 'transfer-to-warehouse',
        title: 'Transfer to Warehouse',
        icon: <DescriptionIcon />,
    },
    {
        segment: 'dispatch-to-restaurant',
        title: 'Dispatch to Restaurant',
        icon: <HouseSidingOutlinedIcon />,
    },
    {
        segment: 'daily-closing',
        title: 'Daily Closing',
        icon: <Inventory2OutlinedIcon />,
    },
    {
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
                segment: 'receipt-from-supplier',
                title: 'Receipt From Supplier',
                icon: <CircleIcon fontSize='small' />,
            },
            {
                segment: 'receipt-from-warehouse',
                title: 'Receipt From Warehouse',
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

function Room4Room5(props) {
    const { window } = props;
    const [pathname, setPathname] = React.useState('/beginning-inventory');
    const [currentTitle, setCurrentTitle] = React.useState('Kitchen - Beginning Inventory');
    let navigate = useNavigate();

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
                if (subMenu) return `Kitchen - ${subMenu.title}`;
            }
            return 'Kitchen - Reports';
        }

        // For other main menu items
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

    const renderContent = () => {
        switch (pathname) {
            case '/purchase-order-to-warehouse':
                return <HomePurchaseOrdertoWarehouse />;
            case '/receipt-from-supplier':
                return <HomeReceiptFromSupplier />;
            case '/receipt-from-warehouse':
                return <HomeReceiptFromWarehouse />;
            case '/goods-requisition':
                return <HomeGoodsRequisition />;
            case '/production-receipt':
                return <HomeProductionReceipt />;
            case '/transfer-to-warehouse':
                return <HomeTransferToWarehouse />;
            case '/dispatch-to-restaurant':
                return <HomeDispatchToRestaurant />;
            case '/stock-adjustment':
                return <HomeStockAdjustment />;
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
            case '/reports/monthly-stock-card':
                return <ReportMonthlyStockCard />
            case '/reports/monthly-stock-balance':
                return <ReportMonthlyStockBalance />;
            default:
                return <BeginningInventory />;
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