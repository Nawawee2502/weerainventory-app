import React from "react";
import { useDispatch } from "react-redux";
import axios from 'axios';
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { addToken, addUserData, addUserData2 } from "../store/reducers/authentication";

export default function Login() {
  const dispatch = useDispatch();
  const BASE_URL = process.env.REACT_APP_URL_API;

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validate: (values) => {
      const errors = {};
      if (!values.username) errors.username = 'Username required';
      if (!values.password) errors.password = 'Password required';
      return errors;
    },
    onSubmit: async (values) => {
      try {
        const response = await axios.post(`${BASE_URL}/api/login`, {
          username: values.username,
          password: values.password
        });

        if (response.data.success) {
          // Store authentication data
          localStorage.setItem('token', response.data.tokenKey);
          localStorage.setItem('userData2', JSON.stringify(response.data.data));

          // Update Redux store
          dispatch(addToken(response.data.tokenKey));
          dispatch(addUserData(response.data.data));

          // Redirect to dashboard
          window.location.replace('/dashboard');
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Login failed');
      }
    }
  });

  return (
    <Grid container sx={{ height: '100vh' }}>
      {/* Left side with logo */}
      <Grid item md={6} sm={12} xs={12}
        sx={{
          bgcolor: '#1D2A3A',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box sx={{ width: '50%' }}>
          <img
            src='logologin.png'
            alt="Logo"
            style={{ width: '100%' }}
          />
        </Box>
      </Grid>

      {/* Right side with login form */}
      <Grid item md={6} sm={12} xs={12}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ width: '70%' }}
        >
          <Typography sx={{
            fontSize: '36px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #F49300 0%, #754C27 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Sign In
          </Typography>

          <TextField
            fullWidth
            label="Username"
            margin="normal"
            {...formik.getFieldProps('username')}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            {...formik.getFieldProps('password')}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              background: 'linear-gradient(135deg, #F49300 0%, #754C27 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #F49300 0%, #754C27 100%)',
                opacity: 0.9
              }
            }}
          >
            Sign In
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}