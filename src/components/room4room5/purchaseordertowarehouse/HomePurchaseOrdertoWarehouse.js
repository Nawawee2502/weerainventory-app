import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useDemoRouter } from '@toolpad/core/internal';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import PurchaseOrderToWarehouse from './PurchaseOrderToWarehouse';
import CreatePurchaseOrderToWarehouse from './CreatePurchaseOrderToWarehouse';
import EditPurchaseOrderToWarehouse from './EditPurchaseorderToWarehouse'; // แก้การสะกดชื่อไฟล์ให้ถูกต้อง


const NAVIGATION = [
  { segment: '', title: '' },
  { segment: 'orders', title: 'Orders' },
];

export default function HomePurchaseOrdertoWarehouse() {
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
    console.log("Editing refno:", refno); // เพิ่ม log เพื่อดีบัก
  };

  const handleBack = () => {
    setCurrentView('list');
    setEditRefno(null);
  };

  const renderComponent = () => {
    switch (currentView) {
      case 'create':
        return <CreatePurchaseOrderToWarehouse onBack={handleBack} />;
      case 'edit':
        return <EditPurchaseOrderToWarehouse onBack={handleBack} editRefno={editRefno} />;
      default:
        return <PurchaseOrderToWarehouse onCreate={handleCreate} onEdit={handleEdit} />;
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