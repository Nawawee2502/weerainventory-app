import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ListAltIcon from "@mui/icons-material/ListAlt";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';

import HomeReceiptFromSupplier from "../../components/mobile/warehouse/goodsreceiptfromsupplier/HomeReceiptFromSupplier";
// import HomeGoodsReceiptFromSupplier from "../../components/mobile/warehouse/goodsreceiptfromsupplier/HomeGoodsReceiptFromSupplier";
// import HomeStockCount from "../../components/mobile/warehouse/stockcount/HomeStockCount";
// เพิ่ม component อื่นๆ ที่จำเป็นสำหรับ Warehouse

const MWareHouse = () => {
  const [activeTab, setActiveTab] = useState("Warehouse");
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
      label: "Goods Receipt from Supplier",
      icon: <ListAltIcon style={{ color: "#fff" }} />,
      component: <HomeReceiptFromSupplier />
    },
    // {
    //   label: "Stock Count",
    //   icon: <ListAltIcon style={{ color: "#fff" }} />,
    //   component: <HomeStockCount />
    // },
    // สามารถเพิ่มรายการเมนูอื่นๆ ได้ตามต้องการ
  ];

  const footerItems = [
    { label: "Restaurant", icon: <StorefrontIcon />, to: "/MRestaurant" },
    { label: "Warehouse", icon: <WarehouseIcon />, to: "/MWarehouse" },
    { label: "Kitchen", icon: <RestaurantMenuIcon />, to: "/MKitchen" },
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
        <h2 style={{ margin: 10, fontSize: "20px", fontWeight: "bold", paddingtop: "70px" }}>
          {currentPage?.label || "WareHouse"}
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
      {currentPage ? (
        // Show selected page component
        <div style={{ padding: "16px" }}>
          {currentPage.component}
        </div>
      ) : (
        // Show menu list
        <div style={{ padding: "16px", paddingTop: "12px" }}>
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
        boxShadow: "0 -2px 4px rgba(0, 0, 0, 0.1)"
      }}>
        {footerItems.map((item) => (
          <div
            key={item.label}
            onClick={() => {
              setActiveTab(item.label);
              if (item.to !== "/MWarehouse") {
                navigate(item.to);
              } else {
                setCurrentPage(null);
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

export default MWareHouse;