import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useDemoRouter } from '@toolpad/core/internal';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import ReceiptFromKitchen from './ReceiptFromKitchen';
import CreateReceiptFromKitchen from './CreateReceiptFromKitchen';
import EditReceiptFromKitchen from './EditReceiptFromKitchen';

const NAVIGATION = [
  { segment: '', title: '' },
  { segment: 'receipts', title: 'Receipts' },
];

export default function HomeReceiptFromKitchen() {
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
    switch(currentView) {
      case 'create':
        return <CreateReceiptFromKitchen onBack={handleBack} />;
      case 'edit':
        return <EditReceiptFromKitchen onBack={handleBack} editRefno={editRefno} />;
      default:
        return <ReceiptFromKitchen onCreate={handleCreate} onEdit={handleEdit} />;
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