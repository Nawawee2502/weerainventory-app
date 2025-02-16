import React, { useState } from "react";
import { Link } from "react-router-dom";  
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



const Menu = () => {
  const [activeTab, setActiveTab] = useState("Restaurant");

  const menuItems = [
    { label: "Inventory Update", icon: <ListAltIcon style={{ color: "#fff" }} />, to: "/InventoryUpdate" },
    { label: "Purchase order Warehouse", icon: <ListAltIcon style={{ color: "#fff" }} />, to: "/purchase-order-warehouse" },
    { label: "Goods Receipt Warehouse", icon: <ListAltIcon style={{ color: "#fff" }} />, to: "/goods-receipt-warehouse" },
    { label: "Goods Receipt Kitchen", icon: <ListAltIcon style={{ color: "#fff" }} />, to: "/goods-receipt-kitchen" },
    { label: "Goods Receipt Supplier", icon: <ListAltIcon style={{ color: "#fff" }} />, to: "/goods-receipt-supplier" },
    { label: "Goods Requisition", icon: <ListAltIcon style={{ color: "#fff" }} />, to: "/goods-requisition" },
    { label: "Bill of Landing Restaurant", icon: <ListAltIcon style={{ color: "#fff" }} />, to: "/bill-of-landing-branch" },
  ];

  const footerItems = [
    { label: "Home", icon: <HomeIcon />, to: "" },
    { label: "Restaurant", icon: <StorefrontIcon />, to: "/liffrestaurant" },
    { label: "Warehouse", icon: <WarehouseIcon />, to: "/liffWarehouse" },
    { label: "Kitchen", icon: <RestaurantMenuIcon />, to: "/liffkitchen" },
    { label: "Profile", icon: <AccountCircleIcon />, to: "" },
  ];

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f7f7f7", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ padding: "40px", backgroundColor: "#fff", borderBottom: "1px solid #ddd", textAlign: "center", position: "relative" }}>
        <button
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
        <h2 style={{ margin: 10, fontSize: "20px", fontWeight: "bold",paddingtop:'70px' }}>Restaurant</h2>
        
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

      {/* Section Title */}
      <div style={{ padding: "16px", paddingTop: "12px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "12px", color: "#555" }}>
          Menu
        </h3>

        {/* Menu List */}
        {menuItems.map((item, index) => (
          <Link to={item.to} key={index} style={{ textDecoration: 'none' }}>
            <div
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
          </Link>
        ))}
      </div>

      {/* Footer Navigation */}
      <footer style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-around", padding: "12px 0", backgroundColor: "#fff", borderTop: "1px solid #ddd", boxShadow: "0 -2px 4px rgba(0, 0, 0, 0.1)" }}>
        {footerItems.map((item) => (
          <Link to={item.to} key={item.label} style={{ textDecoration: 'none' }}>
            <div
              onClick={() => setActiveTab(item.label)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: activeTab === item.label ? "#EAB86C" : "#6b4226", // น้ำตาลเข้มและเหลือง
              }}
            >
              <div style={{ fontSize: "24px", color: activeTab === item.label ? "#EAB86C" : "#6b4226" }}>
                {React.cloneElement(item.icon, {
                  style: { color: activeTab === item.label ? "#EAB86C" : "#6b4226" },
                })}
              </div>
              <span style={{ fontSize: "12px" }}>{item.label}</span>
            </div>
          </Link>
        ))}
      </footer>
    </div>
  );
};

export default Menu;
