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
// import InventoryUpdate from "../../components/mobile/restaurant/inventoryupdate/InventoryUpdate";
// import PurchaseOrderWarehouse from "../../components/mobile/restaurant/purchaseorderwarehouse/PurchaseOrderWarehouse";
// import GoodsReceiptWarehouse from "../../components/mobile/restaurant/goodsrequisition/GoodsRequisition";
// import GoodsReceiptKitchen from "../../components/mobile/restaurant/goodsreceiptkitchen/GoodsReceiptKitchen";
// import GoodsReceiptSupplier from "../../components/mobile/restaurant/goodsreceiptsupplier/GoodsReceiptSupplier";
import GoodsRequisition from "../../components/mobile/restaurant/goodsrequisition/GoodsRequisition";
import HomeGoodsRequisition from "../../components/mobile/restaurant/goodsrequisition/HomeGoodsRequisition";
import HomeGoodsReceiptKitchen from "../../components/mobile/restaurant/goodsreceiptkitchen/HomeGoodsReceiptKitchen";
import HomeGoodsReceiptSupplier from "../../components/mobile/restaurant/goodsreceiptsupplier/HomeGoodsReceiptSupplier";
import HomeGoodsReceiptWarehouse from "../../components/mobile/restaurant/goodsreceiptwarehouse/HomeGoodsReceiptWarehouse";
import HomePurchaseOrderToWarehouse from "../../components/mobile/restaurant/purchaseorderwarehouse/HomePurchaseOrderToWarehouse";
import MobileBranchBeginningInventory from "../../components/mobile/restaurant/beginninginventory/Beginninginventory";
import HomeSetMinimumStock from "../../components/mobile/restaurant/setminimumstock/Setminimumstock";
import GoodsAdjustment from "../../components/mobile/restaurant/goodsadjustment/GoodsAdjustment";
import ReportMonthlyStockCard from "../../components/mobile/restaurant/report/ReportStockcard";
import ReportMonthlyStockBalance from "../../components/mobile/restaurant/report/ReportStockBalance";
import Dailyclosing from "../../components/mobile/restaurant/dailyclosing/Dailyclosing";
import HomeRequestToKitchen from "../../components/mobile/restaurant/requesttokitchen/HomeRequestToKitchen";
import HomeStockAdjustment from "../../components/mobile/restaurant/stockadjustment/HomeStockAdjustment";
// import BillOfLandingBranch from "../../components/mobile/restaurant/billoflandingbranch/BillofLandingBranch";

const MRestaurant = () => {
  const [activeTab, setActiveTab] = useState("Restaurant");
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
      label: "Restaurant Beginning Inventory",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <MobileBranchBeginningInventory />
    },
    {
      label: "Restaurant Set minimum stock",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <HomeSetMinimumStock />
    },
    {
      label: "Restaurant Request to Warehouse",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <HomePurchaseOrderToWarehouse />
    },
    {
      label: "Restaurant Request to kitchen",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <HomeRequestToKitchen />
    },
    {
      label: "Restaurant Goods Receipt Warehouse",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <HomeGoodsReceiptWarehouse />
    },
    {
      label: "Restaurant Goods Receipt Kitchen",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <HomeGoodsReceiptKitchen />
    },
    {
      label: "Restaurant Goods Receipt Supplier",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <HomeGoodsReceiptSupplier />
    },
    {
      label: "Restaurant Goods Requisition",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <HomeGoodsRequisition />
    },
    {
      label: "Restaurant Stock Adjustment",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <HomeStockAdjustment />
    },
    {
      label: "Restaurant Report Stockcard",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <ReportMonthlyStockCard />
    },
    {
      label: "Restaurant Report Stockbalance",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <ReportMonthlyStockBalance />
    },
    {
      label: "Restaurant Dailyclosing",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <Dailyclosing />
    },

    // {
    //   label: "Bill of Landing Restaurant",
    //   icon: <ListAltIcon style={{ color: "#fff" }} />,
    //   component: <BillOfLandingBranch />
    // },
  ];

  const footerItems = [
    { label: "Restaurant", icon: <StorefrontIcon />, to: "/Mrestaurant" },
    { label: "Warehouse", icon: <WarehouseIcon />, to: "/MWarehouse" },
    { label: "Kitchen", icon: <RestaurantMenuIcon />, to: "/Mkitchen" },
  ];

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f7f7f7", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ padding: "40px", backgroundColor: "#fff", borderBottom: "1px solid #ddd", textAlign: "center", position: "relative" }}>
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
        <h2 style={{ margin: 10, fontSize: "20px", fontWeight: "bold", paddingtop: '70px' }}>
          {currentPage?.label || "Restaurant"}
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
        padding: "16px",
        paddingTop: currentPage ? "16px" : "12px",
        paddingBottom: "80px",  // เพิ่ม padding ด้านล่างเพื่อให้มีพื้นที่สำหรับ footer 
        overflowY: "auto",      // ให้สามารถเลื่อนได้ถ้าเนื้อหายาวเกินจอ
        height: "calc(100vh - 165px)"  // ปรับความสูงให้เหมาะสมกับ header และ footer
      }}>
        {currentPage ? (
          // Show selected page component
          <div>
            {currentPage.component}
          </div>
        ) : (
          // Show menu list
          <>
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
          </>
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
        zIndex: 100  // เพิ่ม zIndex เพื่อให้แน่ใจว่า footer จะอยู่ด้านบนเสมอ
      }}>
        {footerItems.map((item) => (
          <div
            key={item.label}
            onClick={() => {
              setActiveTab(item.label);
              if (item.to !== "/Mrestaurant") {
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

export default MRestaurant;