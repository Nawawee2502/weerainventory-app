import {
    Box,
    Button,
    Typography,
    TextField,
    Divider,
    CircularProgress,
    InputAdornment
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from "react-redux";
import { Br_stockcardAll, addBr_stockcard } from '../../../../api/restaurant/br_stockcardApi';
import Swal from 'sweetalert2';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const CustomInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
        <TextField
            value={value}
            onClick={onClick}
            placeholder={placeholder || "MM/DD/YYYY"}
            ref={ref}
            size="small"
            sx={{
                '& .MuiInputBase-root': {
                    height: '38px',
                    width: '100%',
                    backgroundColor: '#fff',
                    mt: '8px'
                },
                '& .MuiOutlinedInput-input': {
                    cursor: 'pointer',
                    paddingRight: '40px',
                }
            }}
            InputProps={{
                readOnly: true,
                endAdornment: (
                    <InputAdornment position="end">
                        <CalendarTodayIcon sx={{ color: '#754C27', cursor: 'pointer' }} />
                    </InputAdornment>
                ),
            }}
        />
    </Box>
));

const convertToLasVegasTime = (date) => {
    if (!date) return new Date();

    // Create a new date object and set to midnight in local time
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);

    // Return this date without timezone conversion
    return newDate;
};

const formatDate = (date) => {
    if (!date) return "";
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

export default function Dailyclosing() {
    const dispatch = useDispatch();
    const [selectedDate, setSelectedDate] = useState(convertToLasVegasTime(new Date()));
    const [stockBalanceData, setStockBalanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processingDone, setProcessingDone] = useState(false);
    const [branchCode, setBranchCode] = useState('');

    const fetchStockBalance = async () => {
        try {
            setLoading(true);
            const formattedDate = formatDate(selectedDate);

            const response = await dispatch(Br_stockcardAll({
                rdate: formattedDate,
                limit: 99999,
                branch_code: branchCode
            })).unwrap();

            if (response.result) {
                const processedData = processStockData(response.data);
                setStockBalanceData(processedData);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to fetch data',
                confirmButtonColor: '#754C27'
            });
        } finally {
            setLoading(false);
        }
    };

    // Process stock data similar to monthly stock balance
    const processStockData = (data) => {
        const groupedByType = {};

        // Sort data by date first
        const sortedData = data.sort((a, b) => {
            const dateCompare = a.trdate.localeCompare(b.trdate);
            if (dateCompare !== 0) return dateCompare;
            return a.refno.localeCompare(b.refno);
        });

        sortedData.forEach(item => {
            const typeProduct = item.tbl_product.type_product || 'Uncategorized';
            if (!groupedByType[typeProduct]) {
                groupedByType[typeProduct] = [];
            }
            groupedByType[typeProduct].push(item);
        });

        // Process each type group
        let processedData = [];
        Object.entries(groupedByType).forEach(([typeProduct, items]) => {
            const productGroups = items.reduce((acc, item) => {
                const key = item.product_code;
                if (!acc[key]) {
                    acc[key] = {
                        ...item,
                        type_product: typeProduct
                    };
                } else {
                    acc[key].beg1 += Number(item.beg1 || 0);
                    acc[key].in1 += Number(item.in1 || 0);
                    acc[key].out1 += Number(item.out1 || 0);
                    acc[key].upd1 += Number(item.upd1 || 0);
                    acc[key].balance = Number(item.balance || 0);
                    acc[key].balance_amount = Number(item.balance_amount || 0);
                }
                return acc;
            }, {});

            processedData = [...processedData, ...Object.values(productGroups)];
        });

        return processedData;
    };

    // Handle date change
    const handleDateChange = (date) => {
        setSelectedDate(convertToLasVegasTime(date));
        setProcessingDone(false);
    };

    // Handle Done button click
    const handleDone = async () => {
        try {
            setProcessingDone(true);
            const nextDay = new Date(selectedDate);
            nextDay.setDate(nextDay.getDate() + 1);

            const year = nextDay.getFullYear();
            const month = String(nextDay.getMonth() + 1).padStart(2, '0');
            const day = nextDay.getDate().toString().padStart(2, '0');

            // Process each product's balance
            for (const item of stockBalanceData) {
                const stockcardData = {
                    myear: year,
                    monthh: month,
                    product_code: item.product_code,
                    unit_code: item.unit_code,
                    branch_code: item.branch_code || branchCode, // Use branch code from item or state
                    refno: 'BEG',
                    rdate: `${month}/${day}/${year}`,
                    trdate: `${year}${month}${day}`,
                    beg1: item.balance,
                    in1: 0,
                    out1: 0,
                    upd1: 0,
                    uprice: item.uprice,
                    beg1_amt: item.balance_amount,
                    in1_amt: 0,
                    out1_amt: 0,
                    upd1_amt: 0,
                    balance: 0,
                    balance_amount: 0,
                };

                await dispatch(addBr_stockcard(stockcardData)).unwrap();
            }

            Swal.fire({
                icon: 'success',
                title: 'Branch Daily Closing Completed',
                text: 'All balances have been successfully carried forward.',
                confirmButtonColor: '#754C27'
            });

        } catch (error) {
            console.error("Error in daily closing:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to process daily closing',
                confirmButtonColor: '#754C27'
            });
            setProcessingDone(false);
        }
    };

    // Load data when date changes
    useEffect(() => {
        fetchStockBalance();
    }, [selectedDate]);

    return (
        <Box sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: '#F8F8F8'
        }}>
            {/* Date Selection Section */}
            <Box sx={{ width: '70%', mt: '10px', mb: '20px' }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    mt: '48px'
                }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                        Select Date:
                    </Typography>
                    <Box sx={{ width: '200px' }}>
                        <DatePicker
                            selected={selectedDate}
                            onChange={handleDateChange}
                            dateFormat="MM/dd/yyyy"
                            customInput={<CustomInput />}
                        />
                    </Box>
                    <Button
                        variant="contained"
                        onClick={handleDone}
                        disabled={processingDone || loading}
                        sx={{
                            bgcolor: '#754C27',
                            '&:hover': { bgcolor: '#5c3c1f' },
                            '&:disabled': { bgcolor: '#cccccc' }
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Done'}
                    </Button>
                </Box>
            </Box>

            {/* Results Section */}
            <Box sx={{
                width: '98%',
                bgcolor: 'white',
                p: '12px',
                borderRadius: '24px',
                mb: '24px'
            }}>
                <Box sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: '12px'
                }}>
                    <table style={{ width: '100%', marginTop: '24px' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>No</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Product</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Unit</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#754C27' }}>Restaurant</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27' }}>Beg</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27' }}>In</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27' }}>Out</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27' }}>Update</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#754C27' }}>Balance</th>
                            </tr>
                            <tr>
                                <td colSpan="9">
                                    <Divider sx={{ borderColor: '#754C27' }} />
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                                        <CircularProgress />
                                    </td>
                                </tr>
                            ) : stockBalanceData.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                                        No data found
                                    </td>
                                </tr>
                            ) : (
                                stockBalanceData.map((item, index) => (
                                    <tr key={`${item.product_code}-${index}`}>
                                        <td style={{ padding: '8px 16px' }}>{index + 1}</td>
                                        <td style={{ padding: '8px 16px' }}>{item.tbl_product.product_name}</td>
                                        <td style={{ padding: '8px 16px' }}>{item.tbl_unit?.unit_name}</td>
                                        <td style={{ padding: '8px 16px' }}>{item.tbl_branch?.branch_name}</td>
                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                                            {Number(item.beg1).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                                            {Number(item.in1).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                                            {Number(item.out1).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                                            {Number(item.upd1).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                                            {Number(item.balance).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Box>
            </Box>
        </Box>
    );
}