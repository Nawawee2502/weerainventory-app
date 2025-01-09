import React from 'react';
import { TextField, InputAdornment, Box } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const CustomDateInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
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

export default CustomDateInput;