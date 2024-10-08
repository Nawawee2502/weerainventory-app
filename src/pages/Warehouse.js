import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import LayersIcon from '@mui/icons-material/Layers';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import PurchaseOrderToSupplier from '../components/warehouse/Purchaseordertosupplier'
import ReceiptFromSupplier from '../components/warehouse/Receiptfromsupplier'
import ReceiptFromKitchen from '../components/warehouse/Receiptfromkitchen';

const NAVIGATION = [
    {
        kind: 'header',
        title: 'Main items',
    },
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


// const demoTheme = createTheme({
//   cssVariables: {
//     colorSchemeSelector: 'data-toolpad-color-scheme',
//   },
//   colorSchemes: { light: true, dark: true },
//   breakpoints: {
//     values: {
//       xs: 0,
//       sm: 600,
//       md: 600,
//       lg: 1200,
//       xl: 1536,
//     },
//   },
// });

// function DemoPageContent({ pathname }) {
//     return (
//         <Box
//             sx={{
//                 py: 4,
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 textAlign: 'center',
//             }}
//         >
//             <Typography>Dashboard content for {pathname}</Typography>
//         </Box>
//     );
// }

// DemoPageContent.propTypes = {
//     pathname: PropTypes.string.isRequired,
// };

function Warehouse(props) {
    const { window } = props;

    const [pathname, setPathname] = React.useState('/dashboard');

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
                return <PurchaseOrderToSupplier />;
            case '/receipt-from-supplier':
                return <ReceiptFromSupplier />;
            case '/receipt-from-kitchen':
                return <ReceiptFromKitchen />;
            default:
                return <PurchaseOrderToSupplier />;
        }
    };


    return (
        <AppProvider
            navigation={NAVIGATION}
            router={router}
            window={demoWindow}
        >
            <DashboardLayout>
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
