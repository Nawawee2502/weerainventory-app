import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useDemoRouter } from '@toolpad/core/internal';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

// Import components from the same directory
import DispatchToRestaurant from './DispatchToRestaurant';
import CreateDispatchToRestaurant from './CreateDispatchToRestaurant';
import EditDispatchToRestaurant from './EditDispatchToRestaurant';

const NAVIGATION = [
    { segment: '', title: '' },
    { segment: 'production', title: 'Dispatch to Restaurant' },
];

export default function HomeDispatchToRestaurant() {
    const router = useDemoRouter('/');
    const theme = useTheme();

    const [currentView, setCurrentView] = React.useState('list'); // 'list', 'create', or 'edit'
    const [editRefno, setEditRefno] = React.useState(null);

    const handleCreate = () => {
        console.log("Create button clicked");
        setCurrentView('create');
    };

    const handleEdit = (refno) => {
        console.log("Edit button clicked for refno:", refno);
        setEditRefno(refno);
        setCurrentView('edit');
    };

    const handleBack = () => {
        console.log("Back button clicked");
        setCurrentView('list');
        setEditRefno(null);
    };

    // เพิ่ม useEffect เพื่อตรวจสอบการเปลี่ยนแปลงของ state
    React.useEffect(() => {
        console.log("Current view:", currentView);
        console.log("Edit refno:", editRefno);
    }, [currentView, editRefno]);

    // ปรับปรุงเงื่อนไขการเรนเดอร์ให้ชัดเจนขึ้น
    let componentToRender;
    if (currentView === 'create') {
        componentToRender = <CreateDispatchToRestaurant onBack={handleBack} />;
    } else if (currentView === 'edit' && editRefno) {
        componentToRender = <EditDispatchToRestaurant onBack={handleBack} editRefno={editRefno} />;
    } else {
        componentToRender = <DispatchToRestaurant onCreate={handleCreate} onEdit={handleEdit} />;
    }

    return (
        <AppProvider navigation={NAVIGATION} router={router} theme={theme}>
            <Paper sx={{ width: '100%' }}>
                <PageContainer sx={{ width: '100%' }}>
                    {componentToRender}
                </PageContainer>
            </Paper>
        </AppProvider>
    );
}