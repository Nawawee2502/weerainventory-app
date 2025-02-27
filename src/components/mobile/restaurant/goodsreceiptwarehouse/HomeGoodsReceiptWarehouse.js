import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useDemoRouter } from '@toolpad/core/internal';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

import GoodsReceiptWarehouse from './GoodsReceiptWarehouse';
import CreateGoodsReceiptWarehouse from './CreateGoodsReceiptWarehouse';
import EditGoodsReceiptWarehouse from './EditGoodsReceiptWarehouse';

const NAVIGATION = [
    { segment: '', title: '' },
    { segment: 'warehouse', title: 'Warehouse' },
];

export default function HomeGoodsReceiptWarehouse() {
    const router = useDemoRouter('/');
    const theme = useTheme();

    // Initialize with 'list' view
    const [currentView, setCurrentView] = React.useState('list');
    const [editRefno, setEditRefno] = React.useState(null);

    const handleCreate = React.useCallback(() => {
        console.log('Create button clicked');
        setCurrentView('create');
    }, []);

    const handleEdit = React.useCallback((refno) => {
        console.log(`Edit clicked for refno: ${refno}`);
        setEditRefno(refno);
        setCurrentView('edit');
    }, []);

    const handleBack = React.useCallback(() => {
        console.log('Back button clicked');
        setCurrentView('list');
        setEditRefno(null);
    }, []);

    React.useEffect(() => {
        if (currentView === 'create') {
            console.log('We are in create view!');
        }
    }, [currentView]);
    

    const renderComponent = () => {
        console.log('Rendering component for view:', currentView);
        switch (currentView) {
            case 'create':
                return <CreateGoodsReceiptWarehouse onBack={handleBack} />;
            case 'edit':
                return <EditGoodsReceiptWarehouse onBack={handleBack} editRefno={editRefno} />;
            case 'list':
            default:
                return <GoodsReceiptWarehouse onCreate={handleCreate} onEdit={handleEdit} />;
        }
    }

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