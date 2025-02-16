import React, { useState } from "react";
import { Form, Table } from "react-bootstrap";
import { TextField, Select, MenuItem, Card, CardContent, Typography, Paper, Grid, InputAdornment, Fab, Button,From,List,ListItem ,ListItemText} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode } from '@fortawesome/free-solid-svg-icons';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import { CheckBox } from "@mui/icons-material";
import { Checkbox, Switch, Divider } from '@mui/material';
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {CardMedia, AppBar,Tabs,Tab,tableCellClasses, TableContainer,  TableHead, TableRow, TableCell, TableBody,IconButton} from '@mui/material';
import { styled } from '@mui/material/styles';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const GoodsReceiptWarehouse = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [currentPage, setCurrentPage] = useState("list"); // state 
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [order, setOrder] = useState([]);
  const clearAll = () => setOrder([]);


  const [selectedProducts, setSelectedProducts] = useState([]);

  const toggleSelectProduct = (product) => {
    if (selectedProducts.includes(product.id)) {
      // ยกเลิกการเลือกสินค้า
      setSelectedProducts(selectedProducts.filter(id => id !== product.id));
  
      // ลบสินค้าออกจากคำสั่งซื้อ
      setOrder((prevOrder) => prevOrder.filter(item => item.id !== product.id));
    } else {
      // เลือกสินค้า
      setSelectedProducts([...selectedProducts, product.id]);
  
      // เพิ่มสินค้าในคำสั่งซื้อ
      setOrder((prevOrder) => {
        const existingProduct = prevOrder.find((item) => item.id === product.id);
        if (existingProduct) {
          // ถ้ามีสินค้าอยู่แล้ว เพิ่มจำนวน
          return prevOrder.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          // ถ้ายังไม่มีสินค้า เพิ่มใหม่พร้อมจำนวน 1
          return [...prevOrder, { ...product, quantity: 1 }];
        }
      });
    }
  };
  
  // ฟังก์ชันสำหรับเช็คว่าผลิตภัณฑ์ถูกเลือกหรือไม่
  const isSelected = (productId) => selectedProducts.includes(productId);

  const products = [
    { id: '0001', name: 'Spicy seasoned seafood noodles', price: 2.29 },
    { id: '0002', name: 'Salted Pasta with mushroom sauce', price: 2.29 },
    { id: '0003', name: 'Beef dumpling in hot and sour soup', price: 2.29 },
    { id: '0004', name: 'Healthy noodle with spinach leaf', price: 2.29 },
    { id: '0005', name: 'Spicy instant noodle with special omelette', price: 2.29 },
    { id: '0006', name: 'Hot spicy fried rice with omelet', price: 2.29 },
  ];
  
//   const OrderManagement = () => {
    // const [tabIndex, setTabIndex] = useState(0);
    // const [order, setOrder] = useState([]);
  
    const addProduct = (product) => {
      setOrder((prevOrder) => {
        const existingProduct = prevOrder.find((item) => item.id === product.id);
        if (existingProduct) {
          return prevOrder.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          return [...prevOrder, { ...product, quantity: 1 }];
        }
      });
    };
  
    const removeProduct = (id) => {
      setOrder((prevOrder) => prevOrder.filter((item) => item.id !== id));
    };
  
    const updateQuantity = (id, delta) => {
      setOrder((prevOrder) =>
        prevOrder.map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(item.quantity + delta, 1) }
            : item
        )
      );
    };
  
    // const clearAll = () => setOrder([]);
    // const total = order.reduce((acc, item) => acc + item.price * item.quantity, 0);
// }

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#754C27',
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: '16px',
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

  // Mock data for demonstration
  const branches = ["Branch A", "Branch B", "Branch C"];
  const suppliers = ["Branch A", "Branch B", "Branch C"];

  const goodsReceiptData = [
    { refNo: '0001', supplier: "Supplier A", date: "2025-01-15", amount: 100, branch: "Branch A" },
    { refNo: '0002', supplier: "Supplier B", date: "2025-01-16", amount: 200, branch: "Branch B" },
    { refNo: '0003', supplier: "Supplier C", date: "2025-01-17", amount: 150, branch: "Branch C" },
  ];

  // Filtered data based on search and branch
  const filteredData = goodsReceiptData.filter(
    (item) =>
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedBranch === "" || selectedBranch === item.branch)
  );

  const handleBranchChange = (event) => {
    setSelectedBranch(event.target.value);
  };
  const handleSupplierChange = (event) => {
    setSelectedBranch(event.target.value);
  };

  const handleFabClick = () => {
    setCurrentPage("add"); // เปลี่ยนหน้าเป็น 'add'
  };

  const handleBackClick = () => {
    setCurrentPage("list"); // กลับไปยังหน้า 'list'
  };


  const [orders, setOrders] = useState([
    { id: 1, name: "Brown Rice", unit: "Bag", unitPrice: 66, quantity: 2 },
    { id: 2, name: "Egg Noodles", unit: "Bag", unitPrice: 66, quantity: 2 },
    { id: 3, name: "Frying Oil", unit: "Bottle", unitPrice: 66, quantity: 2 },
  ]);

  const calculateTotal = () =>
    orders.reduce(
      (total, order) => total + order.unitPrice * order.quantity,
      0
    );

  const calculateTax = (subtotal) => subtotal * 0.07; // Assuming 7% tax

  const handleQuantityChange = (id, newQuantity) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, quantity: newQuantity } : order
      )
    );
  };

  const handleClearAll = () => setOrders([]);

  const subtotal = calculateTotal();
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;

  // หน้า "Add Inventory"
  if (currentPage === "add") {
    return (
      <div style={{ padding: "10px", paddingBottom: "300px", fontFamily: "Arial, sans-serif" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          style={{ marginBottom: "20px" }}
        >
          Back
        </Button>
       
        <Box display="flex" p={2} bgcolor="#F9F9F9">
      {/* Left Panel */}
      <Box flex={2} pr={2}>
              <div style={{ marginBottom: "20px", paddingTop: '20px', textAlign: 'left', paddingLeft: '10px'}}>
              <Select
                  value={selectedBranch}
                  onChange={handleBranchChange}
                  displayEmpty
                  style={{ width: "25%", borderRadius: '40px' }}
                >
                  <MenuItem value="">
                    <em>All types</em>
                  </MenuItem>
                  {/* {branches.map((branch, index) => (
                    <MenuItem key={index} value={branch}>
                      {branch}
                    </MenuItem>
                  ))} */}
                </Select>
                <TextField
          placeholder="Search"
          size="big"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            paddingLeft:'10px',
            mt: '3px',
            width: '70%',
            '& .MuiOutlinedInput-root': {
              borderRadius: '40px',
              bgcolor: 'white',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#5A607F' }} />
              </InputAdornment>
            ),
          }}
        />
              </div>
        <AppBar position="static" sx={{ bgcolor: '#D9A05B', borderRadius: '12px 12px 0 0' }}>
          <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} centered textColor="inherit" indicatorColor="secondary" sx={{ '& .MuiTabs-indicator': { backgroundColor: '#A0522D' }}}>
            <Tab label="Hot Dishes" />
            <Tab label="Cold Dishes" />
            <Tab label="Soup" />
            <Tab label="Grill" />
            <Tab label="Appetizer" />
            <Tab label="Dessert" />
          </Tabs>
        </AppBar>

        {/* <Box display="flex" flexWrap="wrap" mt={2} gap={2} justifyContent="center">
          {products.map((product) => (
            <Card key={product.id} sx={{ width: 180, borderRadius: '16px', boxShadow: 3 }}>
    
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{product.name}</Typography>
                <Typography variant="h6" sx={{ color: '#D9A05B', mt: 1 }}>${product.price.toFixed(2)}</Typography>
                <Button variant="contained" sx={{ mt: 1, bgcolor: '#D9A05B', borderRadius: '20px', px: 3 }} onClick={() => addProduct(product)}>
                  Add
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box> */}

        <Box display="flex" flexWrap="wrap" mt={2} gap={2} justifyContent="center">
      {products.map((product) => (
        <Card 
          key={product.id} 
          sx={{ 
            width: 180, 
            borderRadius: '16px', 
            boxShadow: 3, 
            position: 'relative', 
            cursor: 'pointer', 
            border: isSelected(product.id) ? '2px solid #4caf50' : 'none' // ขอบเขียวเมื่อถูกเลือก
          }}
          onClick={() => toggleSelectProduct(product)}
        >
          <CardMedia
            component="img"
            height="100"
            // image={product.image || 'https://via.placeholder.com/160x120'} 
            // alt={product.name}
            sx={{ objectFit: 'cover', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
          />
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{product.name}</Typography>
            <Typography variant="h6" sx={{ color: '#D9A05B', mt: 1 }}>${product.price.toFixed(2)}</Typography>
          </CardContent>

          {/* แสดงเครื่องหมายติ๊กถูกเมื่อถูกเลือก */}
          {isSelected(product.id) && (
            <CheckCircleIcon 
              sx={{ 
                color: '#4caf50', //'#4caf50'
                position: 'absolute', 
                top: 8, 
                right: 8, 
                fontSize: 30 
              }} 
            />
          )}
        </Card>
      ))}
    </Box>

        </Box>
         {/* Right Panel */}
      <Box flex={1} pl={1} bgcolor="#FFF" p={1} borderRadius="12px" boxShadow={3}>
        <div>
        <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
          Ref.no
        </Typography>
        <Box sx={{ position: 'relative', width: '100%' }}>
          <TextField
                size="small"
                placeholder="Ref.no"
                sx={{
                  mt: '8px',
                  width: '95%',
                  '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                  },
              }}
          
          />
        </Box>
        <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
          Date
        </Typography>
        <Box sx={{ position: 'relative', width: '100%' }}>
          <TextField
                size="small"
                placeholder="Date"
                sx={{
                  mt: '8px',
                  width: '95%',
                  '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                  },
              }}
          
          />
        </Box>
        <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
                  Restaurant
                </Typography>
                <Box sx={{ position: 'relative', width: '100%' }}>
                  <Select
                    size="small"
                    value={selectedBranch} // You will need to define `selectedBranch` in the state
                    onChange={handleBranchChange} // Define `handleBranchChange` to update the selected value
                    displayEmpty
                    sx={{
                      mt: '8px',
                      width: '95%',
                      borderRadius: '10px',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Restaurant</em> {/* Placeholder option */}
                    </MenuItem>
                    {/* {branches.map((branch, index) => (
                      <MenuItem key={index} value={branch}>
                        {branch}
                      </MenuItem>
                    ))} */}
                  </Select>
          </Box>
        </div>
        <Divider sx={{ my: 2 }} />
        <Typography sx={{ fontSize: '20px', fontWeight: '600', mt: '18px', color: '#754C27' }}>Current Order</Typography>
        <Box sx={{textAlign:'right',paddingBottom: '15px',}}>
        <Button sx={{background:"rgba(192, 231, 243, 0.88)",color:'#3399FF'}} variant="danger" onClick={handleClearAll}>
          Clear All
        </Button>
        </Box>

        <Box sx={{ width: '98%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}>
                            <table style={{ width: '80%', marginTop: '24px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '4px', fontSize: '14px', width: '1%', color: '#754C27', fontWeight: '700' }}>No.</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center',  color: '#754C27', fontWeight: '700' }}>ID</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center',  color: '#754C27', fontWeight: '700' }}>Product</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '700' }}>Quantity</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '700' }}>Unit</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '700' }}>Unit Price</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '700' }}>Tax</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '700' }}>Total</th>
                                        <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '1%', color: '#754C27', fontWeight: '700' }}></th>
                                    </tr>
                                    <tr>
                                        <td colSpan="10">
                                            <Divider sx={{ width: '100%', color: '#C6C6C6', border: '1px solid #C6C6C6' }} />
                                        </td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Table data will go here */}
                                    {order.map((item, index) => (
                                    <TableRow key={item.id}>
                                      <td style={{ padding: '4px', fontSize: '12px', fontWeight: '500' }}>{index + 1}</td>
                                      <td style={{ padding: '4px', fontSize: '12px', fontWeight: '500' }}>{item.id}</td>
                                      <td style={{ padding: '4px', fontSize: '12px', fontWeight: '500' }}>{item.name}</td>
                                      <td style={{ padding: '4px', fontSize: '12px', fontWeight: '500' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <IconButton onClick={() => updateQuantity(item.id, -1)} sx={{ bgcolor: '#E0D8CC', borderRadius: '5px',fontSize:'5px', p: 0.2,display: 'flex', alignItems: 'center' }}>
                                          <RemoveIcon  fontSize="small" />
                                        </IconButton>
                                        <Typography  sx={{ mx: 1 }}>{item.quantity}</Typography>
                                        <IconButton onClick={() => updateQuantity(item.id, 1)} sx={{ bgcolor: '#E0D8CC', borderRadius: '5px', p: 0.2 }}>
                                          <AddIcon  fontSize="small" />
                                        </IconButton>
                                        </Box>
                                        </td>
                                        <td style={{ padding: '4px', fontSize: '12px', fontWeight: '500' }}>Bag of</td>
                                      <td style={{ padding: '4px', fontSize: '12px', fontWeight: '500' }}>${item.price.toFixed(2)}</td>
                                      <td style={{ padding: '4px', fontSize: '12px', fontWeight: '500' }}>{item.tax ? 'Y' : 'N'}</td>
                                      <td style={{ padding: '4px', fontSize: '12px', fontWeight: '500' }}>
                                        <Typography fontWeight="bold">
                                          ${(item.price * item.quantity).toFixed(2)}
                                        </Typography>
                                        </td>
                                        <td style={{ padding: '4px', fontSize: '12px', fontWeight: '500' }}>
                                        <IconButton onClick={() => removeProduct(item.id)} sx={{ color: '#D9534F' }}>
                                          <DeleteIcon />
                                        </IconButton>
                                        </td>
                                    </TableRow>
                                  ))}
                                </tbody>
                            </table>
                        </Box>
        <Box sx={{ width: '90%', height: 'auto', bgcolor: '#EAB86C', borderRadius: '10px', p: '18px' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <Typography sx={{ color: '#FFFFFF' }}>Subtotal</Typography>
                                <Typography sx={{ color: '#FFFFFF', ml: 'auto' }}>
                                $00
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: '8px' }}>
                                <Typography sx={{ color: '#FFFFFF' }}>Tax(12%)</Typography>
                                <Typography sx={{ color: '#FFFFFF', ml: 'auto' }}>
                                $00
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: '8px' }}>
                                <Typography sx={{ color: '#FFFFFF', fontSize: '30px', fontWeight: '600' }}>
                                Total
                                </Typography>
                                <Typography sx={{ color: '#FFFFFF', ml: 'auto', fontSize: '30px', fontWeight: '600' }}>
                                $00
                                </Typography>
                            </Box>
                            </Box>
                            <Button
                            // onClick={}
                            sx={{ width: '100%', height: '48px', mt: '24px', bgcolor: '#754C27', color: '#FFFFFF' }}>
                            Save
                            </Button>
      </Box>
    </Box>

      </div>
    );
  }

  // หน้า "List Inventory"
  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <header
        style={{
          padding: "50px",
          background: "linear-gradient(to bottom, rgb(142, 84, 34) 0%, rgb(240, 173, 74) 100%)",
          borderBottom: "1px solid #ddd",
          textAlign: "center",
          position: "relative",
          borderRadius: "0 0 70px 70px",
        }}
      >
     <button
      style={{
        position: "absolute",
        left: "16px",
        top: "16px",
        background: "none",
        border: "none",
        fontSize: "20px",
        cursor: "pointer",
      }}
      onClick={() => navigate("/liffRestaurant")}
    >
      <ArrowBackIcon style={{ fontSize: "24px" }} />
    </button>

        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "bold", color: 'white', textAlign: 'left', paddingBottom: '20px' }}>
        Goods Requisition
        </h2>

        <TextField
          placeholder="Goods Requisition  Search"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            mt: '15px',
            width: '90%',
            '& .MuiOutlinedInput-root': {
              borderRadius: '40px',
              bgcolor: 'white',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#5A607F' }} />
              </InputAdornment>
            ),
          }}
        />
      </header>

      

      <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div
        style={{
          marginBottom: "20px",
          paddingTop: "20px",
          textAlign: "left",
          paddingLeft: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Select Dropdown */}
        <Select
          value={selectedBranch}
          onChange={handleBranchChange}
          displayEmpty
          style={{
            width: "60%", 
            borderRadius: "40px",
          }}
        >
          <MenuItem value="">
            <em>Restaurant</em>
          </MenuItem>
          {/* {branches.map((branch, index) => (
            <MenuItem key={index} value={branch}>
              {branch}
            </MenuItem>
          ))} */}
        </Select>

        {/* IconButton สำหรับ DatePicker */}
        {/* <DatePicker
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              id="date-picker"
              style={{ display: "none" }} // ซ่อน TextField
            />
          )}
        /> */}

        <IconButton
          // onClick={() => document.getElementById("date-picker").click()} // เปิดปฏิทินเมื่อคลิก
          sx={{
            marginRight: "15px", // ขยับไอคอนไปทางซ้าย
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            "&:hover": {
              backgroundColor: "#f0f0f0",
            },
          }}
        >
          <CalendarTodayIcon sx={{ color: "#aaa", fontSize: "1.8rem" }} />
        </IconButton>
      </div>
    </LocalizationProvider>

      <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "bold", color: '#666666', textAlign: 'left', paddingBottom: '1px', padding: "10px" }}>
        Goods Requisition
      </h2>
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Button
                onClick={handleFabClick}
                sx={{
                    width: '209px',
                    height: '70px',
                    background: 'linear-gradient(180deg, #AD7A2C 0%, #754C27 100%)',
                    borderRadius: '40px',
                    boxShadow: '0px 4px 4px 0px #00000040',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: '48px',
                    '&:hover': {
                        background: 'linear-gradient(180deg, #8C5D1E 0%, #5D3A1F 100%)',
                    }
                }}
            >
                <AddCircleIcon sx={{ fontSize: '42px', color: '#FFFFFF', mr: '12px' }} />
                <Typography sx={{ fontSize: '24px', fontWeight: '600', color: '#FFFFFF' }}>
                    Create
                </Typography>
            </Button>
            </Box>


<TableContainer component={Paper} sx={{ width: '80%', mt: '10px',mx: 'auto' }}>
                <Table sx={{}} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell sx={{ width: '1%', textAlign: 'center' }}>
                                <Checkbox
                                />
                            </StyledTableCell>
                            <StyledTableCell width='1%'>No.</StyledTableCell>
                            <StyledTableCell align="center">Ref.no</StyledTableCell>
                            <StyledTableCell align="center">Date</StyledTableCell>
                            <StyledTableCell align="center">Restaurant</StyledTableCell>
                            <StyledTableCell align="center">Amount</StyledTableCell>
                            <StyledTableCell align="center">Username</StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                            <StyledTableCell width='1%' align="center"></StyledTableCell>
                            {/* <StyledTableCell width='1%' align="center"></StyledTableCell> */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Table data will go here */}
                    </TableBody>
                </Table>
            </TableContainer>

    </div>
  );
};

export default GoodsReceiptWarehouse;
