import React, { useState } from "react";
import { Form, Table } from "react-bootstrap";
import { TextField, Select, MenuItem, Card, CardContent, Typography, Paper, Grid, InputAdornment, Fab, Button,From,Box,IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode } from '@fortawesome/free-solid-svg-icons';
import { FaQrcode } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import { Checkbox, Switch, Divider } from '@mui/material';
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { tableCellClasses, TableContainer,  TableHead, TableRow, TableCell, TableBody,} from '@mui/material';
import { styled } from '@mui/material/styles';



const BillofLandingBranch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [currentPage, setCurrentPage] = useState("list"); // state
  const navigate = useNavigate();

    // StyledTableCell
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
    { refNo: '0001', supplier: "Supplier A", date: "2025-01-15", amount: 100, branch: "Branch A",kitchen:"Room4" },
    { refNo: '0002', supplier: "Supplier B", date: "2025-01-16", amount: 200, branch: "Branch B",kitchen:"Room5" },
    { refNo: '0003', supplier: "Supplier C", date: "2025-01-17", amount: 150, branch: "Branch C",kitchen:"Room4"},
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
      <div style={{ padding: "20px",paddingBottom: "300px", fontFamily: "Arial, sans-serif" , backgroundColor: "#fff"}}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          style={{ marginBottom: "20px" }}
        >
          Back
        </Button>

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
                  Cammissary Kitchen
                </Typography>
                <Box sx={{ position: 'relative', width: '100%' }}>
                  <Select
                    size="small"
                    value={selectedBranch} 
                    onChange={handleBranchChange} 
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
                      <em>Cammissary Kitchen</em> {/* Placeholder option */}
                    </MenuItem>
                    {/* {branches.map((branch, index) => (
                      <MenuItem key={index} value={branch}>
                        {branch}
                      </MenuItem>
                    ))} */}
                  </Select>
          </Box>
        
       

        <Typography sx={{ fontSize: '16px', fontWeight: '600', mt: '18px' }}>
          Username
        </Typography>
        <Box sx={{ position: 'relative', width: '100%' }}>
          <TextField
                size="small"
                placeholder="Username"
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
          Recorded date and time
        </Typography>
        <Box sx={{ position: 'relative', width: '100%' }}>
          <TextField
                size="small"
                placeholder="Recorded date and time"
                sx={{
                  mt: '8px',
                  width: '95%',
                  '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                  },
              }}
          
          />
        </Box>
        <div className="mb-4">
        <Typography sx={{ fontSize: '20px', fontWeight: '600', mt: '18px', color: '#754C27' }}>
          Current Orde
        </Typography>
        <Box sx={{textAlign:'right',paddingBottom: '15px',}}>
        <Button sx={{background:"rgba(192, 231, 243, 0.88)",color:'#3399FF'}} variant="danger" onClick={handleClearAll}>
          Clear All
        </Button>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <TextField
          placeholder="Search"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            mt: '15px',
            width: '80%',
            '& .MuiOutlinedInput-root': {
              borderRadius: '40px',
              bgcolor: 'white',
              // paddingRight:'10px'
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
      <button style={{ paddingRight: '5px', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
      <FontAwesomeIcon
        icon={faBarcode}
        size="2x"
        // style={{}}
      />
    </button>
       </Box>
       <div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '20px', margin: '10px 0', fontFamily: 'Arial, sans-serif', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#996633', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#fff', marginRight: '10px' }}>B</div>
      <div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>Brown Rice</div>
        <div style={{ fontSize: '14px', color: '#888' }}>0001</div>
      </div>
    </div>
    <button style={{ background: 'none', border: 'none', color: '#BEBEBE', cursor: 'pointer',paddingLeft:'80px' }}><DeleteIcon /></button> {/*🗑️*/}
    <button style={{ background: 'none', border: 'none', fontSize: '20px', color: '#f44336', cursor: 'pointer',paddingRight:'10px' }}><Checkbox /></button>
    {/* <button aria-label="empty"style={{color: '#d0d0d0', border: '1px solid #d0d0d0',borderRadius: '8px',width: '30px',height: '30px',}}></button> */}
  </div>
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Unit</span><span>Bag of</span></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <span>Unit Price</span>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button style={{ width: '30px', height: '30px', borderRadius: '5px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>➖</button>
        <span style={{ margin: '0 10px', fontWeight: 'bold' }}>$66.00</span>
        <button style={{ width: '30px', height: '30px', borderRadius: '5px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>➕</button>
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <span>Amount</span>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button style={{ width: '30px', height: '30px', borderRadius: '5px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>➖</button>
        <span style={{ margin: '0 10px', fontWeight: 'bold' }}>2</span>
        <button style={{ width: '30px', height: '30px', borderRadius: '5px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>➕</button>
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}><span>Total</span><span style={{ color: '#d4a373' }}>$132.00</span></div>
  </div>
</div>
<div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '20px', margin: '10px 0', fontFamily: 'Arial, sans-serif', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eab86c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#fff', marginRight: '10px' }}>E</div>
      <div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>Egg Noodle</div>
        <div style={{ fontSize: '14px', color: '#888' }}>0002</div>
      </div>
    </div>
    <button style={{ background: 'none', border: 'none', color: '#BEBEBE', cursor: 'pointer',paddingLeft:'80px' }}><DeleteIcon /></button> {/*🗑️*/}
    <button style={{ background: 'none', border: 'none', fontSize: '20px', color: '#f44336', cursor: 'pointer',paddingRight:'10px' }}><Checkbox /></button>
  </div>
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Unit</span><span>Bag of</span></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <span>Unit Price</span>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button style={{ width: '30px', height: '30px', borderRadius: '5px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>➖</button>
        <span style={{ margin: '0 10px', fontWeight: 'bold' }}>$66.00</span>
        <button style={{ width: '30px', height: '30px', borderRadius: '5px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>➕</button>
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <span>Amount</span>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button style={{ width: '30px', height: '30px', borderRadius: '5px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>➖</button>
        <span style={{ margin: '0 10px', fontWeight: 'bold' }}>2</span>
        <button style={{ width: '30px', height: '30px', borderRadius: '5px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>➕</button>
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}><span>Total</span><span style={{ color: '#d4a373' }}>$132.00</span></div>
  </div>
</div>
      <footer style={{borderRadius: "30px 30px 0px 0px", position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-around", padding: "20px 0", backgroundColor: " #eab86c",  boxShadow: "0 -2px 4px rgba(0, 0, 0, 0.1)" }}>
            <Box sx={{ width: '100%', height: 'auto', p: '18px' }}>
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
              
             <Button  style={{ color: "#754C27",backgroundColor:'white',borderRadius:50,padding: "10px 80px",display: "block",marginLeft: "auto", marginRight: "auto",}}>Save</Button> 
             </Box>
            </footer>
      </div>
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
      onClick={() => navigate("/liffKitchen")}
    >
      <ArrowBackIcon style={{ fontSize: "24px" }} />
    </button>
    

        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "bold", color: 'white', textAlign: 'left', paddingBottom: '20px' }}>
         Bill of Landing Branch
        </h2>

        <TextField
          placeholder="Bill of Landing  Search"
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



      <div
  style={{
    marginBottom: "20px",
    paddingTop: "20px",
    textAlign: "left",
    paddingLeft: "10px",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    width: "100%", 
  }}
>
  {/* Select Dropdown สำหรับ Supplier */}
  <Select
    value={selectedBranch}
    onChange={handleBranchChange}
    displayEmpty
    style={{
      width: "50%",
      borderRadius: "40px",
    }}
  >
    <MenuItem value="">
      <em>Commissary Kitchen</em>
    </MenuItem>
    {/* {branches.map((branch, index) => (
      <MenuItem key={index} value={branch}>
        {branch}
      </MenuItem>
    ))} */}
  </Select>

  {/* IconButton สำหรับ DatePicker */}
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <IconButton
      sx={{
        marginRight:"20px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        "&:hover": {
          backgroundColor: "#f0f0f0",
        },
      }}
    >
      <CalendarTodayIcon sx={{ color: "#aaa", fontSize: "1.8rem" }} />
    </IconButton>
  </LocalizationProvider>
</div>

      <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "bold", color: '#666666', textAlign: 'left', paddingBottom: '20px', padding: "20px" }}>
        Bill of Landing Branch
      </h2>


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
                            <StyledTableCell align="center">Kitchen</StyledTableCell>
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

      <Fab
        color="primary"
        aria-label="add"
        style={{
          position: "fixed",
          bottom: "16px",
          right: "16px",
          width: "70px",
          height: "70px",
          background: "#6f4f28",
        }}
        onClick={handleFabClick}
      >
        <AddIcon style={{ fontSize: "50px" }} />
      </Fab>
    </div>
  );
};

export default BillofLandingBranch;
