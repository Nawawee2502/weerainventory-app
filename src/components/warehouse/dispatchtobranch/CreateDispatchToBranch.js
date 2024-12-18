// Imports แยกเฉพาะที่ใช้เพื่อลด bundle size
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Grid2 from '@mui/material/Grid2';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';

import React, { useState, useEffect, useCallback, useMemo, memo, useReducer } from 'react';
import { useDispatch } from "react-redux";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import debounce from 'lodash/debounce';
import { format } from 'date-fns';

import { addWh_dpb, wh_dpbrefno } from '../../../api/warehouse/wh_dpbApi';
import { branchAll } from '../../../api/branchApi';
import { searchProductName } from '../../../api/productrecordApi';

// Constants
const TAX_RATE = 0.07;
const INITIAL_STATE = {
    products: [],
    quantities: {},
    units: {},
    unitPrices: {},
    totals: {},
    taxableAmount: 0,
    nonTaxableAmount: 0,
    total: 0,
    instantSaving: 0,
    deliverySurcharge: 0,
    saleTax: 0,
    totalDue: 0,
    expiryDates: {}
};

// Action Types
const ACTIONS = {
    SET_PRODUCT: 'SET_PRODUCT',
    UPDATE_QUANTITY: 'UPDATE_QUANTITY',
    UPDATE_UNIT: 'UPDATE_UNIT',
    UPDATE_PRICE: 'UPDATE_PRICE',
    DELETE_PRODUCT: 'DELETE_PRODUCT',
    RESET_FORM: 'RESET_FORM',
    UPDATE_TOTALS: 'UPDATE_TOTALS',
    UPDATE_EXPIRY_DATE: 'UPDATE_EXPIRY_DATE'
};

// Reducer
function formReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_PRODUCT:
            return {
                ...state,
                products: [...state.products, action.payload.product],
                quantities: { ...state.quantities, [action.payload.productCode]: 1 },
                units: { ...state.units, [action.payload.productCode]: action.payload.unit },
                unitPrices: { ...state.unitPrices, [action.payload.productCode]: action.payload.price }
            };
        case ACTIONS.UPDATE_QUANTITY:
            return {
                ...state,
                quantities: { ...state.quantities, [action.payload.productCode]: action.payload.quantity }
            };
        case ACTIONS.UPDATE_UNIT:
            return {
                ...state,
                units: { ...state.units, [action.payload.productCode]: action.payload.unit },
                unitPrices: { ...state.unitPrices, [action.payload.productCode]: action.payload.price }
            };
        case ACTIONS.UPDATE_PRICE:
            return {
                ...state,
                unitPrices: { ...state.unitPrices, [action.payload.productCode]: action.payload.price }
            };
        case ACTIONS.DELETE_PRODUCT:
            const { [action.payload]: _, ...restQuantities } = state.quantities;
            const { [action.payload]: __, ...restUnits } = state.units;
            const { [action.payload]: ___, ...restPrices } = state.unitPrices;
            return {
                ...state,
                products: state.products.filter(p => p.product_code !== action.payload),
                quantities: restQuantities,
                units: restUnits,
                unitPrices: restPrices
            };
        case ACTIONS.RESET_FORM:
            return INITIAL_STATE;
        case ACTIONS.UPDATE_TOTALS:
            return {
                ...state,
                taxableAmount: action.payload.taxableAmount,
                nonTaxableAmount: action.payload.nonTaxableAmount,
                total: action.payload.total
            };
        case ACTIONS.UPDATE_EXPIRY_DATE:
            return {
                ...state,
                expiryDates: {
                    ...state.expiryDates,
                    [action.payload.productCode]: action.payload.date
                }
            };
        default:
            return state;
    }
}

// Memoized Components
const CustomInput = memo(React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <TextField
        value={value}
        onClick={onClick}
        placeholder={placeholder}
        ref={ref}
        size="small"
        fullWidth
        sx={{
            mt: '8px',
            '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
            }
        }}
    />
)));

const ProductRow = memo(({
    product,
    index,
    quantity,
    unit,
    unitPrice,
    total,
    expiryDate,
    onQuantityChange,
    onUnitChange,
    onPriceChange,
    onDelete,
    onExpiryDateChange
}) => (
    <tr>
        <td style={{ padding: '4px', fontSize: '12px', fontWeight: '800' }}>{index + 1}</td>
        <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>{product.product_code}</td>
        <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>{product.product_name}</td>
        <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
            <DatePicker
                selected={expiryDate}
                onChange={(date) => onExpiryDateChange(product.product_code, date)}
                dateFormat="MM/dd/yyyy"
                placeholderText="Select exp date"
                customInput={<CustomInput />}
            />
        </td>
        <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
            <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => onQuantityChange(product.product_code, parseInt(e.target.value))}
                style={{
                    width: '50px',
                    textAlign: 'center',
                    fontWeight: '600',
                    padding: '4px'
                }}
            />
        </td>
        <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
            <select
                value={unit}
                onChange={(e) => onUnitChange(product.product_code, e.target.value)}
                style={{
                    padding: '4px',
                    borderRadius: '4px'
                }}
            >
                <option value={product.productUnit1.unit_code}>{product.productUnit1.unit_name}</option>
                <option value={product.productUnit2.unit_code}>{product.productUnit2.unit_name}</option>
            </select>
        </td>
        <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
            <input
                type="number"
                min="0"
                value={unitPrice}
                onChange={(e) => onPriceChange(product.product_code, parseFloat(e.target.value))}
                style={{
                    width: '80px',
                    textAlign: 'right',
                    fontWeight: '600',
                    padding: '4px'
                }}
            />
        </td>
        <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
            {product.tax1 === 'Y' ? 'Yes' : 'No'}
        </td>
        <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
            {total.toFixed(2)}
        </td>
        <td style={{ padding: '4px', fontSize: '12px', textAlign: 'center', fontWeight: '800' }}>
            <IconButton onClick={() => onDelete(product.product_code)} size="small">
                <CancelIcon />
            </IconButton>
        </td>
    </tr>
));

// Main Component
export default function CreateDispatchToBranch({ onBack }) {
    const dispatch = useDispatch();
    const [state, formDispatch] = useReducer(formReducer, INITIAL_STATE);
    const [startDate, setStartDate] = useState(new Date());
    const [lastRefNo, setLastRefNo] = useState('');
    const [branches, setBranches] = useState([]);
    const [saveBranch, setSaveBranch] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    // Memoized Functions
    const debouncedSearch = useCallback(
        debounce((value) => {
            if (value.length > 0) {
                dispatch(searchProductName({ product_name: value }))
                    .unwrap()
                    .then((res) => {
                        if (res.data) {
                            const sortedResults = [...res.data].sort((a, b) => {
                                const aExact = a.product_name.toLowerCase() === value.toLowerCase();
                                const bExact = b.product_name.toLowerCase() === value.toLowerCase();
                                if (aExact && !bExact) return -1;
                                if (!aExact && bExact) return 1;
                                return a.product_name.length - b.product_name.length;
                            });
                            setSearchResults(sortedResults);
                            setShowDropdown(true);
                        }
                    })
                    .catch((err) => console.error(err));
            } else {
                setSearchResults([]);
                setShowDropdown(false);
            }
        }, 300),
        []
    );

    const calculateOrderTotals = useCallback(() => {
        const { products, quantities, unitPrices } = state;
        let taxable = 0;
        let nonTaxable = 0;

        products.forEach(product => {
            const quantity = quantities[product.product_code] || 0;
            const price = unitPrices[product.product_code] || 0;
            const total = quantity * price;

            if (product.tax1 === 'Y') {
                taxable += total;
            } else {
                nonTaxable += total;
            }
        });

        const total = taxable + nonTaxable;

        formDispatch({
            type: ACTIONS.UPDATE_TOTALS,
            payload: { taxableAmount: taxable, nonTaxableAmount: nonTaxable, total }
        });
    }, [state.products, state.quantities, state.unitPrices]);

    // Effects
    useEffect(() => {
        const init = async () => {
            const currentDate = new Date();
            await handleGetLastRefNo(currentDate);

            try {
                const res = await dispatch(branchAll({ offset: 0, limit: 100 })).unwrap();
                setBranches(res.data || []);
            } catch (err) {
                console.error("Error loading branches:", err);
            }
        };

        init();
    }, [dispatch]);

    useEffect(() => {
        calculateOrderTotals();
    }, [state.products, state.quantities, state.unitPrices, calculateOrderTotals]);

    // Handlers
    const handleGetLastRefNo = async (selectedDate) => {
        try {
            const res = await dispatch(wh_dpbrefno({ test: 10 })).unwrap();
            const year = selectedDate.getFullYear().toString().slice(-2);
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');

            if (!res.data?.refno) {
                setLastRefNo(`WDPB${year}${month}001`);
                return;
            }

            const lastRefNo = res.data.refno;
            const lastRefMonth = lastRefNo.substring(6, 8);
            const lastRefYear = lastRefNo.substring(4, 6);

            if (lastRefMonth !== month || lastRefYear !== year) {
                setLastRefNo(`WDPB${year}${month}001`);
                return;
            }

            const lastNumber = parseInt(lastRefNo.slice(-3));
            setLastRefNo(`WDPB${year}${month}${String(lastNumber + 1).padStart(3, '0')}`);
        } catch (err) {
            console.error("Error generating refno:", err);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleQuantityChange = useCallback((productCode, quantity) => {
        if (quantity >= 1) {
            formDispatch({
                type: ACTIONS.UPDATE_QUANTITY,
                payload: { productCode, quantity }
            });
        }
    }, []);

    const handleUnitChange = useCallback((productCode, unit) => {
        const product = state.products.find(p => p.product_code === productCode);
        const defaultPrice = unit === product.productUnit1.unit_code
            ? product.bulk_unit_price
            : product.retail_unit_price;

        formDispatch({
            type: ACTIONS.UPDATE_UNIT,
            payload: { productCode, unit, price: defaultPrice }
        });
    }, [state.products]);

    const handleSave = async () => {
        if (!saveBranch) {
            Swal.fire({
                icon: 'warning',
                title: 'Please select a branch',
                timer: 1500
            });
            return;
        }

        if (state.products.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Please add at least one product',
                timer: 1500
            });
            return;
        }

        try {
            Swal.fire({
                title: 'Saving dispatch...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const orderData = prepareOrderData();
            await dispatch(addWh_dpb(orderData)).unwrap();

            await Swal.fire({
                icon: 'success',
                title: 'Created dispatch successfully',
                text: `Reference No: ${lastRefNo}`,
                timer: 1500
            });

            formDispatch({ type: ACTIONS.RESET_FORM });
            await handleGetLastRefNo(startDate);

        } catch (error) {
            console.error('Save error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error saving dispatch'
            });
        }
    };
    // Helper Functions
    const prepareOrderData = () => {
        const formattedDate = format(startDate, 'dd/MM/yyyy');
        const year = startDate.getFullYear();
        const month = String(startDate.getMonth() + 1).padStart(2, '0');
        const day = String(startDate.getDate()).padStart(2, '0');

        const headerData = {
            refno: lastRefNo,
            rdate: formattedDate,
            branch_code: saveBranch,
            trdate: `${year}${month}${day}`,
            monthh: month,
            myear: year,
            user_code: JSON.parse(localStorage.getItem("userData2")).user_code
        };

        const productArrayData = state.products.map(product => {
            const productCode = product.product_code;
            const expDate = state.expiryDates[productCode];

            return {
                refno: lastRefNo,
                product_code: productCode,
                qty: state.quantities[productCode].toString(),
                unit_code: state.units[productCode],
                uprice: state.unitPrices[productCode].toString(),
                tax1: product.tax1,
                amt: (state.quantities[productCode] * state.unitPrices[productCode]).toString(),
                ...(expDate && {
                    expire_date: format(expDate, 'MMddyyyy'),
                    texpire_date: format(expDate, 'yyyyMMdd')
                })
            };
        });

        return {
            headerData,
            productArrayData,
            footerData: {
                taxable: state.taxableAmount.toFixed(2),
                nontaxable: state.nonTaxableAmount.toFixed(2),
                total: state.total.toFixed(2)
            }
        };
    };

    const handleProductSelect = useCallback((product) => {
        formDispatch({
            type: ACTIONS.SET_PRODUCT,
            payload: {
                product,
                productCode: product.product_code,
                unit: product.productUnit1.unit_code,
                price: product.bulk_unit_price
            }
        });
        setSearchTerm('');
        setShowDropdown(false);
    }, []);

    // Render Functions
    const renderSearchDropdown = () => {
        if (!showDropdown || !searchResults.length) return null;

        return (
            <Box sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                bgcolor: 'white',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                borderRadius: '4px',
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto',
                mt: '4px'
            }}>
                {searchResults.map((product) => (
                    <Box
                        key={product.product_code}
                        onClick={() => handleProductSelect(product)}
                        sx={{
                            p: 1.5,
                            cursor: 'pointer',
                            '&:hover': {
                                bgcolor: '#f5f5f5'
                            },
                            borderBottom: '1px solid #eee'
                        }}
                    >
                        <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                            {product.product_name}
                        </Typography>
                    </Box>
                ))}
            </Box>
        );
    };

    const renderProductTable = () => (
        <table style={{ width: '100%', marginTop: '24px' }}>
            <thead>
                <tr>
                    <th style={{ padding: '4px', fontSize: '14px', width: '1%', color: '#754C27', fontWeight: '800' }}>No.</th>
                    <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '15%', color: '#754C27', fontWeight: '800' }}>Product code</th>
                    <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '15%', color: '#754C27', fontWeight: '800' }}>Product name</th>
                    <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Expiry Date</th>
                    <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Quantity</th>
                    <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '10%', color: '#754C27', fontWeight: '800' }}>Unit</th>
                    <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Unit Price</th>
                    <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Tax</th>
                    <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', color: '#754C27', fontWeight: '800' }}>Total</th>
                    <th style={{ padding: '4px', fontSize: '14px', textAlign: 'center', width: '1%', color: '#754C27', fontWeight: '800' }}></th>
                </tr>
            </thead>
            <tbody>
                {state.products.map((product, index) => (
                    <ProductRow
                        key={product.product_code}
                        product={product}
                        index={index}
                        quantity={state.quantities[product.product_code]}
                        unit={state.units[product.product_code]}
                        unitPrice={state.unitPrices[product.product_code]}
                        total={state.totals[product.product_code] || 0}
                        expiryDate={state.expiryDates[product.product_code]}
                        onQuantityChange={handleQuantityChange}
                        onUnitChange={handleUnitChange}
                        onPriceChange={(code, price) => formDispatch({
                            type: ACTIONS.UPDATE_PRICE,
                            payload: { productCode: code, price }
                        })}
                        onDelete={(code) => formDispatch({
                            type: ACTIONS.DELETE_PRODUCT,
                            payload: code
                        })}
                        onExpiryDateChange={(code, date) => formDispatch({
                            type: ACTIONS.UPDATE_EXPIRY_DATE,
                            payload: { productCode: code, date }
                        })}
                    />
                ))}
            </tbody>
        </table>
    );

    return (
        <Box sx={{ width: '100%' }}>
            <Button
                onClick={onBack}
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2, mr: 'auto' }}
            >
                Back to Dispatch to Restaurant
            </Button>

            <Box sx={{
                width: '100%',
                mt: '10px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                border: '1px solid #E4E4E4',
                borderRadius: '10px',
                bgcolor: '#FFFFFF',
                p: '16px'
            }}>
                <Box sx={{ width: '90%', mt: '24px' }}>
                    <Grid2 container spacing={2}>
                        {/* Reference Number Field */}
                        <Grid2 item xs={12} md={6}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                Ref.no
                            </Typography>
                            <TextField
                                value={lastRefNo}
                                disabled
                                size="small"
                                placeholder='Ref.no'
                                fullWidth
                                sx={{ mt: 1 }}
                            />
                        </Grid2>

                        {/* Date Picker */}
                        <Grid2 item xs={12} md={6}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                Date
                            </Typography>
                            <DatePicker
                                selected={startDate}
                                onChange={setStartDate}
                                dateFormat="dd/MM/yyyy"
                                customInput={<CustomInput />}
                            />
                        </Grid2>

                        {/* Branch Select */}
                        <Grid2 item xs={12} md={6}>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#754C27' }}>
                                Restaurant
                            </Typography>
                            <Box
                                component="select"
                                value={saveBranch}
                                onChange={(e) => setSaveBranch(e.target.value)}
                                sx={{
                                    mt: 1,
                                    width: '100%',
                                    height: '40px',
                                    borderRadius: '10px',
                                    padding: '0 14px',
                                    border: '1px solid rgba(0, 0, 0, 0.23)',
                                    fontSize: '16px',
                                    '&:focus': {
                                        outline: 'none',
                                        borderColor: '#754C27',
                                    }
                                }}
                            >
                                <option value="">Select a Restaurant</option>
                                {branches.map((branch) => (
                                    <option key={branch.branch_code} value={branch.branch_code}>
                                        {branch.branch_name}
                                    </option>
                                ))}
                            </Box>
                        </Grid2>
                    </Grid2>

                    <Divider sx={{ my: 3 }} />

                    {/* Product Search Section */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Typography sx={{ fontSize: '20px', fontWeight: '600' }}>
                            Current Order
                        </Typography>
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography>Product Search</Typography>
                            <Box sx={{ position: 'relative', width: '300px' }}>
                                <TextField
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Search"
                                    size="small"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: '#5A607F' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                {renderSearchDropdown()}
                            </Box>
                            <Button
                                onClick={() => formDispatch({ type: ACTIONS.RESET_FORM })}
                                sx={{ bgcolor: '#E2EDFB', borderRadius: '6px', width: '105px' }}
                            >
                                Clear All
                            </Button>
                        </Box>
                    </Box>

                    {/* Products Table */}
                    {renderProductTable()}

                    {/* Totals Section */}
                    <Box sx={{
                        width: '100%',
                        bgcolor: '#EAB86C',
                        borderRadius: '10px',
                        p: '18px',
                        mt: 3
                    }}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: 'white'
                        }}>
                            <Box>
                                <Typography>Taxable</Typography>
                                <Typography>Non-Taxable</Typography>
                                <Typography>Total</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography>${state.taxableAmount.toFixed(2)}</Typography>
                                <Typography>${state.nonTaxableAmount.toFixed(2)}</Typography>
                                <Typography>${state.total.toFixed(2)}</Typography>
                            </Box>
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 2
                        }}>
                            <Typography sx={{ color: 'white', fontSize: '30px', fontWeight: '600' }}>
                                Total due
                            </Typography>
                            <Typography sx={{ color: 'white', fontSize: '30px', fontWeight: '600' }}>
                                ${state.total.toFixed(2)}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Save Button */}
                    <Button
                        onClick={handleSave}
                        fullWidth
                        sx={{
                            mt: 3,
                            height: '48px',
                            bgcolor: '#754C27',
                            color: 'white',
                            '&:hover': {
                                bgcolor: '#5C3D1F'
                            }
                        }}
                    >
                        Save
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};