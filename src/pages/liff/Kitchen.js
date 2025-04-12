import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ListAltIcon from "@mui/icons-material/ListAlt";
import HomeIcon from "@mui/icons-material/Home";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';

// Import Components (ต้องสร้างหรือนำเข้าในโปรเจกต์จริง)
import HomePurchaseOrderWarehouse from "../../components/mobile/kitchen/purchaseorderwarehouse/HomePurchaseOrderWarehouse";
import HomeKitchenRequisition from "../../components/mobile/kitchen/goodsrequisition/HomeGoodsRequisition";
import HomeGoodsReceiptWarehouse from "../../components/mobile/kitchen/goodsreceiptwarehouse/HomeGoodsReceiptWarehouse";
import HomeGoodsReceiptSupplier from "../../components/mobile/kitchen/goodsreceiptsupplier/HomeGoodsReceiptSupplier";
import HomeTransferToWarehouse from "../../components/mobile/kitchen/transfertowarehouse/HomeTransferToWarehouse";
import HomeProductReceipt from "../../components/mobile/kitchen/productreceipt/HomeProductReceipt";
import HomeDispatchToRestaurant from "../../components/mobile/kitchen/dispatchtorestaurant/HomeDispatchToRestaurant";
import KitchenBeginningInventory from "../../components/mobile/kitchen/beginninginventory/Beginninginventory";
import ReportMonthlyKitchenStockCard from "../../components/mobile/kitchen/report/ReportStockcard";
import ReportStockbalance from "../../components/mobile/kitchen/report/ReportStockBalance";
import Dailyclosing from "../../components/mobile/kitchen/dailyclosing/Dailyclosing";
import HomeStockAdjustment from "../../components/mobile/kitchen/stockcadjustment/HomeStockAdjustment";
import KitchenSetMinimumStock from "../../components/mobile/kitchen/setminimumstock/Setminimumstock";

// import StockAdjustment from "../../components/mobile/kitchen/stockcadjustment/StockAdjustment";
// import HomeBillOfLading from "../../components/mobile/kitchen/billoflading/HomeBillOfLading";
// import HomeGoodsReceiptProduction from "../../components/mobile/kitchen/goodsreceiptproduction/HomeGoodsReceiptProduction";
// import HomeWarehouseTransferOrder from "../../components/mobile/kitchen/warehousetransferorder/HomeWarehouseTransferOrder";
// import HomeInvoiceToRestaurant from "../../components/mobile/kitchen/invoicetorestaurant/HomeInvoiceToRestaurant";
// import HomeInventoryUpdate from "../../components/mobile/kitchen/inventoryupdate/HomeInventoryUpdate";

const MKitchen = () => {
  const [activeTab, setActiveTab] = useState("Kitchen");
  const [currentPage, setCurrentPage] = useState(null);
  const navigate = useNavigate();

  const handleBack = () => {
    if (currentPage) {
      setCurrentPage(null);
    } else {
      navigate('/dashboard');
    }
  };

  const menuItems = [
    {
      label: "Kitchen Beginning Inventory",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <KitchenBeginningInventory />
    },
    {
      label: "Kitchen Set Minimum Stock",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <KitchenSetMinimumStock />
    },
    {
      label: "Kitchen Request to Warehouse",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <HomePurchaseOrderWarehouse />
    },
    {
      label: "Kitchen Goods Receipt Warehouse",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <HomeGoodsReceiptWarehouse />
    },
    {
      label: "Kitchen Goods Receipt Supplier",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <HomeGoodsReceiptSupplier />
    },
    {
      label: "Kitchen Transfer to Warehouse",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <HomeTransferToWarehouse />
    },
    {
      label: "Kitchen Dispatch To Restaurant",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <HomeDispatchToRestaurant />
    },
    {
      label: "Kitchen Goods Requisition",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <HomeKitchenRequisition />
    },
    {
      label: "Kitchen Production Receipt",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <HomeProductReceipt />
    },
    {
      label: "Kitchen Stock Adjustment",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <HomeStockAdjustment />
    },
    {
      label: "Kitchen Report Monthly Stockcard",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <ReportMonthlyKitchenStockCard />
    },
    {
      label: "Kitchen Report Monthly Stockbalance",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <ReportStockbalance />
    },
    {
      label: "Kitchen DailyClosing",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <Dailyclosing />
    },
  ];

  const footerItems = [
    { label: "Restaurant", icon: <StorefrontIcon />, to: "/Mrestaurant" },
    { label: "Warehouse", icon: <WarehouseIcon />, to: "/MWarehouse" },
    { label: "Kitchen", icon: <RestaurantMenuIcon />, to: "/Mkitchen" },
  ];

  return (
    <div style={{
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f7f7f7",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header */}
      <header style={{
        padding: "40px",
        backgroundColor: "#fff",
        borderBottom: "1px solid #ddd",
        textAlign: "center",
        position: "relative"
      }}>
        <button
          onClick={handleBack}
          style={{
            position: "absolute",
            left: "16px",
            top: "55px",
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          <ArrowBackIcon style={{ fontSize: "24px" }} />
        </button>
        <h2 style={{ margin: 10, fontSize: "20px", fontWeight: "bold", paddingTop: '70px' }}>
          {currentPage?.label || "Commissary Kitchen"}
        </h2>

        <div
          style={{
            position: "absolute",
            right: "16px",
            top: "55px",
            fontSize: "14px",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <IconButton
            size="large"
            aria-label="show 11 new notifications"
            color="inherit"
          >
            <Badge badgeContent={11} color="error">
              <NotificationsIcon sx={{ color: '#979797' }} />
            </Badge>
          </IconButton>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: "16px",
        paddingBottom: "80px" // Add padding to the bottom to make space for the fixed footer
      }}>
        {currentPage ? (
          // Show selected page component
          <div>
            {currentPage.component}
          </div>
        ) : (
          // Show menu list
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "12px", color: "#555" }}>
              Menu
            </h3>

            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={() => setCurrentPage(item)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px",
                  marginBottom: "8px",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#f4b84d",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: "12px",
                  }}
                >
                  {item.icon}
                </div>
                <span style={{ fontSize: "16px", color: "#333" }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <footer style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-around",
        padding: "12px 0",
        backgroundColor: "#fff",
        borderTop: "1px solid #ddd",
        boxShadow: "0 -2px 4px rgba(0, 0, 0, 0.1)",
        zIndex: 1000 // Ensure footer appears above other elements
      }}>
        {footerItems.map((item) => (
          <div
            key={item.label}
            onClick={() => {
              setActiveTab(item.label);
              if (item.to !== "/Mkitchen") {
                navigate(item.to);
              }
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: activeTab === item.label ? "#EAB86C" : "#6b4226",
            }}
          >
            <div style={{
              fontSize: "24px",
              color: activeTab === item.label ? "#EAB86C" : "#6b4226"
            }}>
              {React.cloneElement(item.icon, {
                style: { color: activeTab === item.label ? "#EAB86C" : "#6b4226" },
              })}
            </div>
            <span style={{ fontSize: "12px" }}>{item.label}</span>
          </div>
        ))}
      </footer>
    </div>
  );
};

export default MKitchen;