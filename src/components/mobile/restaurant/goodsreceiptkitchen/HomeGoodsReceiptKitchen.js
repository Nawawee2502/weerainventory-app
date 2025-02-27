import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useDemoRouter } from '@toolpad/core/internal';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import GoodsReceiptKitchen from './GoodsReceiptKitchen';
import CreateGoodsReceiptKitchen from './CreateGoodsReceiptKitchen';
import EditGoodsReceiptKitchen from './EditGoodsReceiptKitchen';

const NAVIGATION = [
    { segment: '', title: '' },
    { segment: 'kitchen', title: 'Kitchen' },
];

export default function HomeGoodsReceiptKitchen() {
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
                return <CreateGoodsReceiptKitchen onBack={handleBack} />;
            case 'edit':
                return <EditGoodsReceiptKitchen onBack={handleBack} editRefno={editRefno} />;
            default:
                return <GoodsReceiptKitchen onCreate={handleCreate} onEdit={handleEdit} />;
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