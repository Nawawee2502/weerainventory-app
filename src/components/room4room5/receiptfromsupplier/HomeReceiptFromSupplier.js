import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useDemoRouter } from '@toolpad/core/internal';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import ReceiptFromSupplier from './ReceiptFromSupplier';
import CreateReceiptFromSupplier from './CreateReceiptFromSupplier';
// import EditPurchaseOrderToWarehouse from './EditPruchaseordertoWarehouse';


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
  };

  const handleBack = () => {
    setCurrentView('list');
    setEditRefno(null);
  };

  const renderComponent = () => {
    switch(currentView) {
      case 'create':
        return <CreateReceiptFromSupplier onBack={handleBack} />;
      case 'edit':
        // return <EditPurchaseOrderToSupplier onBack={handleBack} editRefno={editRefno} />;
        // return <EditPurchaseOrderToSupplier onBack={handleBack} editRefno={editRefno} />
      default:
        return <ReceiptFromSupplier onCreate={handleCreate} onEdit={handleEdit} />;
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