import React, { useState, useEffect } from "react";
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
  const [needsLineLogin, setNeedsLineLogin] = useState(false);
  const dispatch = useDispatch();
  const BASE_URL = process.env.REACT_APP_URL_API;
  const LINE_LOGIN_URL = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=2006891227&redirect_uri=https://weerainventory.com/liff&state=weera&scope=profile%20openid%20email`;

  useEffect(() => {
    const handleLineCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          // Get LINE UID
          const lineResponse = await axios.post(`${BASE_URL}/api/callback`, { code });

          if (lineResponse.data.success) {
            const tempUserData = JSON.parse(localStorage.getItem('tempUserData'));

            if (tempUserData) {
              // Update user with LINE UID
              const updateResponse = await axios.post(`${BASE_URL}/api/updateLineUID`, {
                user_code: tempUserData.user_code,
                line_uid: lineResponse.data.line_uid
              });

              if (updateResponse.data.success) {
                // Store authentication data
                localStorage.setItem('token', updateResponse.data.tokenKey);
                localStorage.setItem('userData', JSON.stringify(updateResponse.data.data));
                localStorage.setItem('userData2', JSON.stringify(updateResponse.data.userData2));

                // Clean up temp data
                localStorage.removeItem('tempUserData');

                // Redirect to dashboard
                window.location.replace('/dashboard');
              }
            }
          }
        } catch (error) {
          console.error('LINE login error:', error);
          alert('Error connecting with LINE');
        }
      }
    };

    handleLineCallback();
  }, [BASE_URL]);

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
          if (response.data.requireLineLogin) {
            setNeedsLineLogin(true);
            // Store temp user data
            localStorage.setItem('tempUserData', JSON.stringify(response.data.tempUserData));
            // Redirect to LINE login
            window.location.href = LINE_LOGIN_URL;
            return;
          }

          // User already has LINE UID, proceed with login
          localStorage.setItem('token', response.data.tokenKey);
          localStorage.setItem('userData', JSON.stringify(response.data.data));
          localStorage.setItem('userData2', JSON.stringify(response.data.userData2));

          dispatch(addToken(response.data.tokenKey));
          dispatch(addUserData(response.data.data));
          dispatch(addUserData2(response.data.userData2));

          window.location.replace('/dashboard');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert(error.response?.data?.message || 'Login error');
      }
    }
  });

  // Show loading state while processing LINE callback
  if (window.location.search.includes('code')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing login...</p>
        </div>
      </div>
    );
  }

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
            {needsLineLogin ? 'Connect LINE Account' : 'Sign In'}
          </Typography>

          {!needsLineLogin && (
            <Button
              fullWidth
              variant="contained"
              href={LINE_LOGIN_URL}
              sx={{
                mt: 3,
                mb: 2,
                bgcolor: '#00B900',
                '&:hover': {
                  bgcolor: '#009900'
                }
              }}
            >
              Login with LINE8
            </Button>
          )}

          <Typography sx={{ color: '#8392AB', mt: 2 }}>
            {needsLineLogin ? 'Please sign in to connect your LINE account' : 'Or sign in with your account'}
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
            {needsLineLogin ? 'Connect Account' : 'Sign In'}
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}