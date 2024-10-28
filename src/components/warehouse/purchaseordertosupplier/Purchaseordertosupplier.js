import { Box, Button, InputAdornment, TextField, Typography, Drawer, IconButton, Grid2, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { addSupplier, deleteSupplier, updateSupplier, supplierAll, countSupplier, searchSupplier, lastSupplierCode } from '../../../api/supplierApi';
import { addBranch, deleteBranch, updateBranch, branchAll, countBranch, searchBranch, lastBranchCode } from '../../../api/branchApi';
import { addWh_pos, updateWh_pos, deleteWh_pos, wh_posAlljoindt, wh_posAllrdate, Wh_posByRefno } from '../../../api/warehouse/wh_posApi';
import { Wh_posdtAllinnerjoin } from '../../../api/warehouse/wh_posdtApi';
import { searchProductCode } from '../../../api/productrecordApi';
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Swal from 'sweetalert2';
import PrintIcon from '@mui/icons-material/Print';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

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


export default function PurchaseOrderToSupplier({ onCreate }) {
  const [selected, setSelected] = useState([]);
  const dispatch = useDispatch();
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [branch, setBranch] = useState([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [getLastBranchCode, setGetLastBranchCode] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [whpos, setWhpos] = useState([]);
  const [whposdt, setWhposdt] = useState([]);
  const [products, setProducts] = useState([]);



  const [quantities, setQuantities] = useState({});
  const [units, setUnits] = useState({});
  const [totals, setTotals] = useState({});

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const fetchData = () => {
    if (searchTerm) {
      // Mock API call with searchProductCode
      dispatch(searchProductCode({ product_code: searchTerm }))
        .unwrap()
        .then((res) => {
          // กรอง product ที่ product_code ขึ้นต้นด้วย searchTerm และยาวไม่เกินความยาวที่ถูกต้อง
          const filteredProducts = res.data.filter((product) =>
            product.product_code.startsWith(searchTerm)
          );

          setProducts(filteredProducts); // Set product data จาก API หลังกรอง
          const initialQuantities = {};
          const initialUnits = {};
          const initialTotals = {};
          filteredProducts.forEach((product) => {
            initialQuantities[product.product_code] = 1; // ตั้งค่าเริ่มต้นของ quantity เป็น 1
            initialUnits[product.product_code] = product.productUnit1.unit_code; // ตั้งค่า default unit เป็น bulk unit
            initialTotals[product.product_code] = calculateTotal(1, product.productUnit1.unit_code, product); // คำนวณ total
          });
          setQuantities(initialQuantities);
          setUnits(initialUnits);
          setTotals(initialTotals);
        })
        .catch((err) => console.log(err.message));
    }
  };


  useEffect(() => {
    fetchData();
  }, [searchTerm]);


  // const calculateTotal = (quantity, unitCode, product) => {
  //   const unitPrice =
  //     unitCode === product.productUnit1.unit_code
  //       ? product.bulk_unit_price
  //       : product.retail_unit_price;
  //   return quantity * unitPrice;
  // };

  useEffect(() => {
    if (searchTerm) {
      dispatch(searchProductCode({ product_code: searchTerm }))
        .unwrap()
        .then((res) => {
          setProducts(res.data);
        })
        .catch((err) => console.log(err.message));
    } else {
      refetchData();
    }
  }, [searchTerm, dispatch]);

  // const handleChange = (event, value) => {
  //   setPage(value);
  //   console.log(value);
  //   let page = value - 1;
  //   let offset = page * 5;
  //   let limit = value * 5;
  //   console.log(limit, offset);
  //   dispatch(branchAll({ offset, limit }))
  //     .unwrap()
  //     .then((res) => {
  //       console.log(res.data);
  //       let resultData = res.data;
  //       for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
  //         resultData[indexArray].id = offset + indexArray + 1;
  //       }
  //       setBranch(resultData);
  //     })
  //     .catch((err) => err.message);
  // };

  const refetchData = () => {
    let offset = 0;
    let limit = 5;
    dispatch(branchAll({ offset, limit }))
      .unwrap()
      .then((res) => {
        setBranch(res.data);
      })
      .catch((err) => console.log(err.message));
  };

  useEffect(() => {
    let offset = 0;
    let limit = 5;
    dispatch(wh_posAlljoindt({ offset, limit }))
      .unwrap()
      .then((res) => {
        console.log("---------whpos---------")
        console.log(res.data);
        let resultData = res.data;
        for (let indexArray = 0; indexArray < resultData.length; indexArray++) {
          resultData[indexArray].id = indexArray + 1;
        }
        setWhpos(resultData);
        console.log(resultData);

      })
      .catch((err) => err.message);

    // dispatch(branchAll({ offset, limit }))
    //   .unwrap()
    //   .then((res) => {
    //     console.log("Branch data", res.data);
    //     setBranch(res.data);
    //   })
    //   .catch((err) => console.log(err.message));

    // dispatch(supplierAll({ offset, limit }))
    //   .unwrap()
    //   .then((res) => {
    //     console.log("Supplier data", res.data);
    //     setSupplier(res.data);
    //   })
    //   .catch((err) => console.log(err.message));

  }, [dispatch]); // ให้แน่ใจว่าค่าใน dependency มีการเปลี่ยนแปลงเมื่อจำเป็นเท่านั้น


  const handleCheckboxChange = (event, branch_code) => {
    if (event.target.checked) {
      setSelected([...selected, branch_code]);
    } else {
      setSelected(selected.filter((item) => item !== branch_code));
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = branch.map((row) => row.branch_code);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleDelete = (branch_code) => {
    Swal.fire({
      title: 'Are you sure you want to delete this branch?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteBranch({ branch_code }))
          .unwrap()
          .then((res) => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted successfully',
              timer: 1500,
              showConfirmButton: false,
            });
            setTimeout(() => {
              refetchData();
              let offset = 0;
              let limit = 5;
              dispatch(branchAll({ offset, limit }))
                .unwrap()
                .then((res) => setBranch(res.data));
            }, 2000);
          })
          .catch((err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error deleting branch',
              text: 'Please try again later',
              timer: 3000,
              showConfirmButton: false,
            });
          });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Deletion canceled',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };


  const handleDeleteSelected = () => {
    Swal.fire({
      title: 'Are you sure you want to delete the selected branches?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        Promise.all(selected.map(branch_code =>
          dispatch(deleteBranch({ branch_code })).unwrap()
        ))
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted successfully',
              timer: 1500,
              showConfirmButton: false,
            });
            setTimeout(() => {
              setSelected([]);
              refetchData();
              let offset = 0;
              let limit = 5;
              dispatch(branchAll({ offset, limit }))
                .unwrap()
                .then((res) => setBranch(res.data));
            }, 2000);
          })
          .catch((err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error deleting branches',
              text: 'Please try again later',
              timer: 3000,
              showConfirmButton: false,
            });
          });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Deletion canceled',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const [editDate, setEditDate] = useState(new Date());
  const [saveSupplier, setSaveSupplier] = useState('');
  const [saveBranch, setSaveBranch] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [originalProducts, setOriginalProducts] = useState([]);

  const [rdate, setRdate] = useState('');
  const [monthh, setMonthh] = useState('');
  const [myear, setMyear] = useState('');
  const [refno, setRefno] = useState('');
  const [trDate, setTrDate] = useState('');
  const [userCode, setUserCode] = useState('');
  const [productForPrint, setProductForPrint] = useState([]);

  const calculateTotal = (quantity, unitCode, product) => {
    const unitPrice = unitCode === product.productUnit1.unit_code
      ? product.bulk_unit_price
      : product.retail_unit_price;
    return quantity * unitPrice;
  };

  const calculateOrderTotals = () => {
    const orderSubtotal = products.reduce((sum, product) => {
      const productCode = product.product_code;
      const quantity = quantities[productCode] || 1;
      const unitCode = units[productCode] || product.productUnit1.unit_code;
      const unitPrice = unitCode === product.productUnit1.unit_code
        ? product.bulk_unit_price
        : product.retail_unit_price;
      return sum + (quantity * unitPrice);
    }, 0);

    const orderTax = orderSubtotal * 0.12;
    const orderTotal = orderSubtotal + orderTax;

    setSubtotal(orderSubtotal);
    setTax(orderTax);
    setTotal(orderTotal);
  };

  const getDataForPrint = (refno) => {
    console.log("--------------DATAREFNO------------");
    console.log(refno);
    dispatch(Wh_posByRefno(refno))
      .unwrap()
      .then(async (res) => {
        // แปลงวันที่
        const [day, month, year] = res.data.rdate.split("/");
        setEditDate(new Date(year, month - 1, day));
        console.log("--------------DATA------------");
        console.log(res.data.supplier_code);


        // เซ็ตข้อมูล supplier และ branch
        setSaveSupplier(res.data.supplier_code);
        setSaveBranch(res.data.branch_code);
        
        // แปลงข้อมูล products
        const orderProducts = res.data.wh_posdts.map(item => ({
          product_code: item.product_code,
          product_name: item.tbl_product.product_name,
          bulk_unit_price: item.tbl_product.bulk_unit_price,
          retail_unit_price: item.tbl_product.retail_unit_price,
          productUnit1: item.tbl_product.productUnit1,
          productUnit2: item.tbl_product.productUnit2,
          qty: item.qty,
          unit_code: item.unit_code,
          uprice: item.uprice,
          amt: item.amt,
          isNewProduct: false // เพิ่ม flag สำหรับสินค้าเดิม
        }));

        // เซ็ต products และเก็บข้อมูลต้นฉบับ
        setProducts(orderProducts);
        setOriginalProducts(orderProducts);

        // // สร้าง objects สำหรับเก็บค่าต่างๆ
        // const initialQuantities = {};
        // const initialUnits = {};
        // const initialTotals = {};

        // // เก็บค่าเริ่มต้นของแต่ละ product
        // orderProducts.forEach(item => {
        //   initialQuantities[item.product_code] = parseInt(item.qty);
        //   initialUnits[item.product_code] = item.unit_code;
        //   initialTotals[item.product_code] = parseFloat(item.amt);
        // });

        // // เซ็ตค่าต่างๆ
        // setQuantities(initialQuantities);
        // setUnits(initialUnits);
        // setTotals(initialTotals);

        // // เซ็ตยอดรวมเริ่มต้น
        // setSubtotal(parseFloat(res.data.total));
        // setTax(parseFloat(res.data.total) * 0.12);
        // setTotal(parseFloat(res.data.total) * 1.12);
        console.log("--------------DATA2------------");
        console.log(orderProducts);

        setSupplier(res.data.supplier_code);
        setBranch(res.data.branch_code);
        setMonthh(res.data.monthh);
        setMyear(res.data.myear);
        setRdate(res.data.rdate);
        setRefno(res.data.refno);
        setTotal(res.data.total);
        setTrDate(res.data.trdate);
        setUserCode(res.data.user_code);
        console.log("--------------DATA------------");
        console.log(userCode);

        const doc = <PurchaseOrderPDF supplier={supplier} refNo={refno} date={rdate} branch={saveBranch} productArray={orderProducts} total={total}/>;
        const asBlob = await pdf(doc).toBlob();
        const url = URL.createObjectURL(asBlob);
        window.open(url, '_blank');
      })
      .catch((err) => {
        console.log(err.message);
        Swal.fire({
          icon: 'error',
          title: 'Error loading order data',
          text: err.message,
          confirmButtonText: 'OK'
        });
      });
  }

  const PrintPurchaseOrderPDF = async (refno) => {
    // const doc = <PurchaseOrderPDF />;
    // const asBlob = await pdf(doc).toBlob();
    // saveAs(asBlob, 'purchase_order.pdf');
    getDataForPrint(refno);


    // const doc = <PurchaseOrderPDF />;
    // const asBlob = await pdf(doc).toBlob();
    // const url = URL.createObjectURL(asBlob);
    // window.open(url, '_blank');
  };

  const PurchaseOrderPDF = ({ supplier, refNo, date, branch, productArray }) => (
    <Document>
      <Page style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text>WEERA THAI RAINBOW</Text>
          <Text>3111 Valley Blvd S-10 Las Vegas NV 8910</Text>
          <Text>โทร ......</Text>
        </View>

        {/* Supplier Info */}
        <View style={{ flexDirection: 'row', marginVertical: 10 }}>
          <View style={{ flex: 1 }}>
            <Text>Supplier: {supplier}</Text>
            <Text>Branch: {branch}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text>Ref No.: {refNo}</Text>
            <Text>Date: {date}</Text>
          </View>
        </View>

        {/* Table Header */}

        <View style={styles.tableHeader}>
          <Text style={[styles.cell, { flex: 0.5 }]}>Item</Text>
          <Text style={styles.cell}>Description</Text>
          <Text style={styles.cell}>QTY</Text>
          <Text style={styles.cell}>UPrice</Text>
          <Text style={styles.cell}>Unit</Text>
          <Text style={styles.cell}>Amount</Text>
        </View>

        {/* Table Rows */}
        {productArray.map((item, index) => (
          <View style={styles.row} key={index}>
            <Text style={[styles.cell, { flex: 0.5 }]}>{index + 1}</Text>
            <Text style={styles.cell}>Product Description</Text>
            <Text style={styles.cell}>{item.qty}</Text>
            <Text style={styles.cell}>{item.unit_code}</Text>
            <Text style={styles.cell}>{item.uprice}</Text>
            <Text style={styles.cell}>{item.amt}</Text>
          </View>
        ))}

        {/* Grand Total */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
          <Text>Grand Total: {total}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text>Authorized Signature: </Text>
            <Text>_________________________</Text>
          </View>
          <View>
            <Text>Quoted By:</Text>
            <Text>Sale:</Text>
            <Text>Mobile:</Text>
          </View>
          <View>
            <Text>Approved By:</Text>
            <Text>Date:</Text>
          </View>
        </View> 
      </Page>
    </Document>
  );


  return (
    <>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // justifyContent: 'center',
        }}
      >
        <Button
          // onClick={toggleDrawer(true)}
          onClick={() => {
            console.log("Create button clicked"); // ตรวจสอบว่าฟังก์ชันทำงาน
            onCreate();  // เรียก onCreate เมื่อกดปุ่ม
          }}
          sx={{
            width: '209px',
            height: '70px',
            background: 'linear-gradient(180deg, #AD7A2C 0%, #754C27 100%)',
            borderRadius: '15px',
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: '48px',
            width: '60%'
          }}
        >
          <Typography sx={{ fontSize: '16px', fontWeight: '600', mr: '24px' }}>
            Search
          </Typography>
          <TextField
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search"
            sx={{
              '& .MuiInputBase-root': {
                height: '38px',
                width: '100%'
              },
              '& .MuiOutlinedInput-input': {
                padding: '8.5px 14px',
              },
              width: '40%'
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#5A607F' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box sx={{ width: '100%', mt: '24px' }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteSelected}
            sx={{ mt: 2 }}
            disabled={selected.length === 0}
          >
            Delete Selected ({selected.length})
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ width: '100%', mt: '24px' }}>
          <Table sx={{}} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ width: '1%', textAlign: 'center' }}>
                  <Checkbox
                    sx={{ color: '#FFF' }}
                    indeterminate={selected.length > 0 && selected.length < branch.length}
                    checked={branch.length > 0 && selected.length === branch.length}
                    onChange={handleSelectAllClick}
                  />
                </StyledTableCell>
                <StyledTableCell width='1%' >No.</StyledTableCell>
                <StyledTableCell align="center">Ref.no</StyledTableCell>
                <StyledTableCell align="center">Date</StyledTableCell>
                <StyledTableCell align="center">Supplier</StyledTableCell>
                <StyledTableCell align="center">Branch</StyledTableCell>
                <StyledTableCell align="center">Amount</StyledTableCell>
                <StyledTableCell align="center">Username</StyledTableCell>
                <StyledTableCell width='1%' align="center"></StyledTableCell>
                <StyledTableCell width='1%' align="center"></StyledTableCell>
                <StyledTableCell width='1%' align="center"></StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {whpos.map((row) => (
                <StyledTableRow key={row.branch_code}>
                  <StyledTableCell padding="checkbox" align="center">
                    <Checkbox
                      checked={selected.includes(row.branch_code)}
                      onChange={(event) => handleCheckboxChange(event, row.branch_code)}
                    />
                  </StyledTableCell>
                  <StyledTableCell component="th" scope="row">
                    {row.id} {/* Row ID */}
                  </StyledTableCell>
                  <StyledTableCell align="center">{row.refno} {/* Reference Number */}</StyledTableCell>
                  <StyledTableCell align="center">{row.rdate} {/* Request Date */}</StyledTableCell>
                  <StyledTableCell align="center">{row.supplier_code} {/* Supplier Code */}</StyledTableCell>
                  <StyledTableCell align="center">{row.branch_code} {/* Branch Code */}</StyledTableCell>
                  <StyledTableCell align="center">{row.total} {/* Total Amount */}</StyledTableCell>
                  <StyledTableCell align="center">{row.user_code} {/* User Code */}</StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      color="primary"
                      size="md"
                      // onClick={() => handleEdit(row)} // Use handleEdit function for row editing
                      sx={{ border: '1px solid #AD7A2C', borderRadius: '7px' }}
                    >
                      <EditIcon sx={{ color: '#AD7A2C' }} />
                    </IconButton>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      color="danger"
                      size="md"
                      onClick={() => handleDelete(row.branch_code)} // Use handleDelete function for row deletion
                      sx={{ border: '1px solid #F62626', borderRadius: '7px' }}
                    >
                      <DeleteIcon sx={{ color: '#F62626' }} />
                    </IconButton>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      color="danger"
                      size="md"
                      onClick={() => PrintPurchaseOrderPDF(row.refno)} // Handle print functionality
                      sx={{ border: '1px solid #5686E1', borderRadius: '7px' }}
                    >
                      <PrintIcon sx={{ color: '#5686E1' }} />
                    </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* <Stack spacing={2} sx={{ mt: '8px' }}>
          <Pagination count={count} shape="rounded" onChange={handleChange} page={page} />
        </Stack> */}
      </Box>
    </>
  );
}




// const PrintPurchaseOrderPDF = (refNo) => (
//     <div>
//     <PDFDownloadLink document={<PurchaseOrderPDF />} fileName={refNo+".pdf"}>
//       {({ loading }) => (loading ? 'Loading document...' : 'Download PDF')}
//     </PDFDownloadLink>
//   </div>
// );



const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
  },
  header: {
    textAlign: 'center',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    padding: 5,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  footer: {
    marginTop: 20,
    fontSize: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});