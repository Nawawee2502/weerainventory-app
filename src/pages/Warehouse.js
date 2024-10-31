import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import ReceiptFromSupplier from '../components/warehouse/Receiptfromsupplier'
import ReceiptFromKitchen from '../components/warehouse/Receiptfromkitchen';
import { useNavigate } from "react-router-dom";
import HomePurchaseOrderToSupplier from '../components/warehouse/purchaseordertosupplier/HomePurchaseOrdertoSupplier';


const NAVIGATION = [
    {
        segment: 'purchase-order-to-supplier',
        title: 'Purchase Order to Supplier',
        icon: <DashboardIcon />,
    },
    {
        segment: 'receipt-from-supplier',
        title: 'Receipt From Supplier',
        icon: <DashboardIcon />,
    },
    {
        segment: 'receipt-from-kitchen',
        title: 'Receipt From Kitchen',
        icon: <DashboardIcon />,
    },
    {
        segment: 'dispatch-to-kitchen',
        title: 'Dispatch to Kitchen',
        icon: <DashboardIcon />,
    },
    {
        segment: 'dispatch-to-branch',
        title: 'Dispatch to Branch',
        icon: <DashboardIcon />,
    },
    {
        segment: 'stock-adjustment',
        title: 'Stock Adjustment',
        icon: <DashboardIcon />,
    },
    {
        segment: 'reports',
        title: 'Reports',
        icon: <BarChartIcon />,
        children: [
            {
                segment: 'purchase-order-to-supplier',
                title: 'Purchase Order to Supplier',
                icon: <DescriptionIcon />,
            },
            {
                segment: 'receipt-from-supplier',
                title: 'Receipt From Supplier',
                icon: <DescriptionIcon />,
            },
            {
                segment: 'receipt-from-kitchen',
                title: 'Receipt From Kitchen',
                icon: <DescriptionIcon />,
            },
            {
                segment: 'dispatch-to-kitchen',
                title: 'Dispatch to Kitchen',
                icon: <DescriptionIcon />,
            },
            {
                segment: 'dispatch-to-branch',
                title: 'Dispatch to Branch',
                icon: <DescriptionIcon />,
            },
            {
                segment: 'stock-adjustment',
                title: 'Stock Adjustment',
                icon: <DescriptionIcon />,
            },
            {
                segment: 'monthly-stock-card',
                title: 'Monthly Stock Card',
                icon: <DescriptionIcon />,
            },
            {
                segment: 'monthly-stock-balance',
                title: 'Monthly Stock Balance',
                icon: <DescriptionIcon />,
            },
        ],
    },
];


const demoTheme = createTheme({
    //   cssVariables: {
    //     colorSchemeSelector: 'data-toolpad-color-scheme',
    //   },
    //   colorSchemes: { light: true, dark: true },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 600,
            lg: 1200,
            xl: 1536,
        },
    },
});

function Warehouse(props) {
    const { window } = props;

    const [pathname, setPathname] = React.useState('/dashboard');
    let navigate = useNavigate();

    const handleDashboard = () => {
        navigate('/dashboard');
    };

    const router = React.useMemo(() => {
        return {
            pathname,
            searchParams: new URLSearchParams(),
            navigate: (path) => setPathname(String(path)),
        };
    }, [pathname]);

    const demoWindow = window !== undefined ? window() : undefined;

    // Render different components based on the current pathname
    const renderContent = () => {
        switch (pathname) {
            case '/purchase-order-to-supplier':
                return <HomePurchaseOrderToSupplier />;
            case '/receipt-from-supplier':
                return <ReceiptFromSupplier />;
            case '/receipt-from-kitchen':
                return <ReceiptFromKitchen />;
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
                        <Box sx={{ display:'flex', alignItems:'center' }}>
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
                title: '',
            }}
        >
            <DashboardLayout defaultSidebarCollapsed>
                {renderContent()}
            </DashboardLayout>
        </AppProvider>
    );
}

Warehouse.propTypes = {
    /**
     * Injected by the documentation to work in an iframe.
     * Remove this when copying and pasting into your project.
     */
    window: PropTypes.func,
};

export default Warehouse;
