import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useDemoRouter } from '@toolpad/core/internal';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

// Import components from the same directory
import TransferToWarehouse from './TransferToWarehouse';
import CreateTransferToWarehouse from './CreateTransferToWarehouse';
import EditTransferToWarehouse from './EditTransferToWarehouse';

const NAVIGATION = [
    { segment: '', title: '' },
    { segment: 'transfer', title: 'Transfer to Warehouse' },
];

export default function HomeTransferToWarehouse() {
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
                return <CreateTransferToWarehouse onBack={handleBack} />;
            case 'edit':
                return <EditTransferToWarehouse onBack={handleBack} editRefno={editRefno} />;
            default:
                return <TransferToWarehouse onCreate={handleCreate} onEdit={handleEdit} />;
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