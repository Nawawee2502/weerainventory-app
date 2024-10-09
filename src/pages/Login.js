import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { errorHelper } from "../components/handle-input-error";
import { showUser } from "../api/loginApi"

import { addToken } from "../store/reducers/authentication";

import { login } from "../api/loginApi";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://www.facebook.com/ideasoft999/">
        ideasoft
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function Login() {
  //const isAuth = useSelector((state) => state.authentication.token);
  const isAuth = useSelector((state) => state.authentication.token);
  let navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('----------isAuth-----');
    console.log(isAuth);
    console.log('----------isAuth2-----');
    dispatch(showUser())
      .unwrap()
      .then((res) => {
        console.log("----------// TOKEN KEY //-------------");
        console.log(res.tokenKey);
      })
      .catch((err) => err.message);
    if (isAuth) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  }, [isAuth, navigate]);

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validate: (values) => {
      let errors = {};

      if (!values.username) {
        errors.username = 'Username cannot be empty';
      }

      if (!values.password) {
        errors.password = 'Password cannot be empty';
      }

      return errors;
    },
    onSubmit: (values) => {
      dispatch(login(values))
        .unwrap()
        .then((res) => {
          console.log("----------// TOKEN KEY //-------------");
          console.log(res.tokenKey);
        })
        .catch((err) => err.message);
    },
  });





  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      {/* <Box sx={{ width: '100%' }}> */}
      {/* <Grid container component="main" sx={{ height: "100vh", width: '100%' }}>

          <Grid
            item
            // xs={false}
            // sm={4}
            md={6}
            sx={{
              bgcolor: '#1D2A3A'
            }}
          >

          </Grid>
          <Grid item md={6} component={Paper} elevation={6} square>
            <Box
              sx={{
                my: 8,
                mx: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                เข้าสู่ระบบ
              </Typography>
              <Box
                component="form"
                noValidate
                sx={{ mt: 1 }}
                onSubmit={formik.handleSubmit}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  {...formik.getFieldProps("username")}
                  {...errorHelper(formik, "username")}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  {...formik.getFieldProps("password")}
                  {...errorHelper(formik, "password")}
                />
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Remember me"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  เข้าสู่ระบบ
                </Button>
                <Button

                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  userShow
                </Button>
                <Grid container>
                  <Grid item xs>
                    <Link href="#" variant="body2">
                      ลืมรหัสผ่าน?
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link href="SignUp" variant="body2">
                      {"Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid>
                <Copyright sx={{ mt: 5 }} />
              </Box>
            </Box>
          </Grid>
        </Grid> */}
      <Grid container sx={{ height: '100vh', width: '100%' }}>
        <Grid item md={6} sm={12} xs={12}
          sx={{
            bgcolor: '#1D2A3A',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ mt: '-100px', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src='logologin.png'
              style={{
                width: '50%',
              }}
            />
          </Box>
        </Grid>
        <Grid item md={6} sm={12} xs={12}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
          }}
        >
          <Box
            component="form"
            noValidate
            onSubmit={formik.handleSubmit}
            sx={{
              width: '70%',
              display: 'flex',
              justifyContent: 'center',
              // alignItems: 'center',
              flexDirection: 'column'
            }}
          >
            <Typography sx={{
              fontSize: '36px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #F49300 0%, #754C27 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Sign in
            </Typography>
            <Typography sx={{
              fontSize: '14px',
              color: '#8392AB'
            }}>
              Enter your username and password to sign in.
            </Typography>
            <Typography sx={{
              fontSize: '14px',
              color: '#1D2A3A',
              fontWeight: '600',
              mt: '36px'
            }}>
              Username
            </Typography>
            <TextField
              size="small"
              placeholder="Username"
              sx={{
                mt: '8px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px', // Set border-radius here
                },
              }}
              autoFocus
              {...formik.getFieldProps("username")}
              {...errorHelper(formik, "username")}
            />
            <Typography sx={{
              fontSize: '14px',
              color: '#1D2A3A',
              fontWeight: '600',
              mt: '24px'
            }}>
              Password
            </Typography>
            <TextField
              size="small"
              placeholder="Password"
              sx={{
                mt: '8px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px', 
                },
              }}
              {...formik.getFieldProps("password")}
              {...errorHelper(formik, "password")}
            />
            <Button
              variant="contained"
              type="submit"
              sx={{
                background: 'linear-gradient(135deg, #F49300 0%, #754C27 100%)',
                color: '#fff',
                mt: '16px',
                height: '40px',
                borderRadius: '10px',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #F49300 0%, #754C27 100%)',
                },
              }}>
              Sign in
            </Button>
            <Box sx={{ display: 'flex', fontSize: '14px', color: '#8392AB', mt: '16px' }}>
              Don’t have an account?
              <Typography sx={{
                fontWeight: '600',
                background: 'linear-gradient(135deg, #F49300 0%, #754C27 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                ml: '8px'
              }}>
                Sign up
              </Typography>
            </Box>

          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}