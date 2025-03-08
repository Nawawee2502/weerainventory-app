import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useDemoRouter } from '@toolpad/core/internal';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

// Import components from the same directory
import ProductReceipt from './ProductReceipt';
import CreateProductReceipt from './CreateProductReceipt';
import EditProductReceipt from './EditProductReceipt';

const NAVIGATION = [
    { segment: '', title: '' },
    { segment: 'production', title: 'Product Receipts' },
];

export default function HomeProductReceipt() {
    const router = useDemoRouter('/');
    const theme = useTheme();

    const [currentView, setCurrentView] = React.useState('list'); // 'list', 'create', or 'edit'
    const [editRefno, setEditRefno] = React.useState(null);

    const handleCreate = () => {
        setCurrentView('create');
    };

    const handleEdit = (refno) => {
        setEditRefno(refno);
        setCurrentView('edit');
    };

    const handleBack = () => {
        setCurrentView('list');
        setEditRefno(null);
    };

    const renderComponent = () => {
        switch (currentView) {
            case 'create':
                return <CreateProductReceipt onBack={handleBack} />;
            case 'edit':
                return <EditProductReceipt onBack={handleBack} editRefno={editRefno} />;
            default:
                return <ProductReceipt onCreate={handleCreate} onEdit={handleEdit} />;
        }
    };

    return (
        <AppProvider navigation={NAVIGATION} router={router} theme={theme}>
            <Paper sx={{ width: '100%' }}>
                <PageContainer sx={{ width: '100%' }}>
                    {renderComponent()}
                </PageContainer>
            </Paper>
        </AppProvider>
    );
}