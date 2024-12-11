import * as React from 'react';
import { useState } from 'react';
import { Box, Typography, TextField, Grid2, Button } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Checkbox, Switch, Divider } from '@mui/material';

export default function ReportMonthlyStockBalance() {
    const [startDate, setStartDate] = useState(new Date());
    
    const months = Array.from({ length: 12 }, (_, i) =>
        new Date(0, i).toLocaleString("en-US", { month: "long" })
      );
      

    return (
        <Box sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            bgcolor: 'white',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: '#F8F8F8'
        }}>
            <Box sx={{
                width: '70%',
                mt: '10px',
                flexDirection: 'column'
            }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        bgcolor: '#FFFFFF',
                        height: '100%',
                        p: '16px',
                        position: 'relative',
                        zIndex: 2,
                        mb: '50px',
                        bgcolor: '#F8F8F8'
                    }}
                >
                    <Box sx={{ width: '90%', mt: '24px' }}>
                        <Grid2 container spacing={2}>
                            
                            
                            <Grid2 item size={{ xs: 12, md: 10.6 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Year
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        placeholder="Year"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                            },
                                        }}
                                    />
                                    {/* <option value="">Year</option> */}
                                </Box>
                            </Grid2>
                            <Grid2 item size={{ xs: 12, md: 12 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                    Month
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                <Box
                                    component="select"
                                    sx={{
                                        mt: '8px',
                                        width: '100%',
                                        height: '40px',
                                        borderRadius: '10px',
                                        padding: '0 14px',
                                        border: '1px solid rgba(0, 0, 0, 0.23)',
                                        fontSize: '16px',
                                        '&:focus': {
                                            outline: 'none',
                                            borderColor: '#754C27',
                                        },
                                        '& option': {
                                            fontSize: '16px',
                                        },
                                    }}
                                    id="Month"
                                >
                                    <option value="">Select a  Month</option>
                                        {months.map((month, index) => (
                                        <option key={index} value={month}>
                                            {month}
                                        </option>
                                        ))}
                                </Box>
                                <Button
                                        variant="contained"
                                        sx={{
                                            bgcolor: '#754C27',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: '#5c3c1f',
                                            },
                                            borderRadius: '10px',
                                            minWidth: '100px'
                                        }}
                                    >
                                        Show
                                    </Button>
                                </Box>
                            </Grid2>
                        </Grid2>


                    </Box>
                </Box>


            </Box>


            <Box
                sx={{
                    width: '98%',
                    bgcolor: 'white',
                    p: '12px',
                    borderRadius: '24px',
                    mb: '24px',
                    position: 'relative', // เพิ่มเพื่อให้สามารถวาง Box หัวข้อแบบ absolute ได้
                    mt: '20px'
                }}
            >
                <Box sx={{
                    position: 'absolute',
                    top: '-20px', // ปรับตำแหน่งให้อยู่ด้านบนของ Box หลัก
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: '#EAB86C',
                    color: '#FFFFFF',
                    px: 3,
                    py: 2,
                    borderRadius: '8px',
                    zIndex: 3
                }}>
                    <Typography sx={{ fontWeight: 'bold', color: '#754C27' }}>
                    Monthly Stock Balance
                    </Typography>
                </Box>
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex' }}>
                            <Box>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C' }}>
                                    Date
                                </Typography>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C' }}>
                                    Supplier
                                </Typography>
                                <Typography sx={{ fontWeight: '700', color: '#AD7A2C' }}>
                                    Shop
                                </Typography>
                            </Box>
                            <Box sx={{ ml: '8px' }}>
                                <Typography>
                                    23/08/2567 - 25/08/2567
                                </Typography>
                                <Typography>
                                    Eleanor Pena
                                </Typography>
                                <Typography>
                                    Weera Thai
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Switch />
                                <Typography sx={{ fontWeight: '500', color: '#7E84A3' }}>
                                    Exclude price in file
                                </Typography>
                            </Box>
                            <Box>
                                <Button
                                    variant="outlined"
                                    sx={{
                                        color: '#754C27',
                                        borderColor: '#754C27',
                                        '&:hover': {
                                            borderColor: '#5c3c1f',
                                        }
                                    }}
                                >
                                    Export (Excel)
                                </Button>
                                <Button
                                    variant="outlined"
                                    sx={{
                                        color: '#754C27',
                                        borderColor: '#754C27',
                                        '&:hover': {
                                            borderColor: '#5c3c1f',
                                        },
                                        ml: '24px'
                                    }}
                                >
                                    PDF
                                </Button>
                            </Box>

                        </Box>
                    </Box>
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}>
                        <table style={{ width: '100%', marginTop: '24px' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>
                                        <Checkbox />
                                    </th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#754C27' }}>No.</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#754C27' }}>Date</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#754C27' }}>Ref.no</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#754C27' }}>Brought Forward</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#754C27' }}>Receive</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#754C27' }}>Issue</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#754C27' }}>Ramining</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#754C27' }}>UnitPrice</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#754C27' }}>Brought Forward 
                                        (Amount)
                                    </th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#754C27' }}>Receive
                                        (Amount)
                                    </th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#754C27' }}>Issue
                                        (Amount)
                                    </th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#754C27' }}>Ramining
                                        (Amount)
                                    </th>
                                </tr>
                                <tr>
                                    <td colSpan="15">
                                        <Divider sx={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Table data will go here */}
                            </tbody>
                        </table>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}