import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useDemoRouter } from '@toolpad/core/internal';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import StockAdjustment from './StockAdjustment';
import CreateStockAdjustment from './CreateStockAdjustment';
import EditStockAdjustment from './EditStockAdjustment';

const NAVIGATION = [
    { segment: '', title: '' },
    { segment: 'kitchen-stock-adjustments', title: 'Kitchen Stock Adjustments' },
];

export default function HomeStockAdjustment() {
    const router = useDemoRouter('/');
    const theme = useTheme();

    const [currentView, setCurrentView] = React.useState('list');
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
                return <CreateStockAdjustment onBack={handleBack} />;
            case 'edit':
                return <EditStockAdjustment onBack={handleBack} editRefno={editRefno} />;
            default:
                return <StockAdjustment onCreate={handleCreate} onEdit={handleEdit} />;
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