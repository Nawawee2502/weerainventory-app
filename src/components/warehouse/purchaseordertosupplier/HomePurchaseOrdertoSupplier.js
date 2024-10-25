import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useDemoRouter } from '@toolpad/core/internal';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import PurchaseOrderToSupplier from './Purchaseordertosupplier';
import CreatePurchaseOrderToSupplier from './CreatePurchaseOrderToSupplier';

const NAVIGATION = [
  { segment: '', title: '' },
  { segment: 'orders', title: 'Orders' },
];

export default function HomePurchaseOrderToSupplier() {
  const router = useDemoRouter('/');
  const theme = useTheme();

  // State to control the display of CreatePurchaseOrderToSupplier
  const [showCreateComponent, setShowCreateComponent] = React.useState(false);
  const [showEditComponent, setShowEditComponent] = React.useState(false);

  const handleCreate = () => {
    setShowCreateComponent(true); // Show the CreatePurchaseOrderToSupplier component
  };

  const handleBack = () => {
    setShowCreateComponent(false); // Go back to PurchaseOrderToSupplier component
  };

  return (
    <AppProvider navigation={NAVIGATION} router={router} theme={theme}>
      <Paper sx={{ width: '100%' }}>
        <PageContainer sx={{ width:'100%' }}>
          {!showCreateComponent ? (
            <PurchaseOrderToSupplier onCreate={handleCreate} />
          ) : (
            <CreatePurchaseOrderToSupplier onBack={handleBack} />
          )}
          
        </PageContainer>
      </Paper>
    </AppProvider>
  );
}
