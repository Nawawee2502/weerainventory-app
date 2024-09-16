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

import { addToken } from "../store/reducers/authentication";

import { addUser, login } from "../api/loginApi";

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

export default function Register() {
    //const isAuth = useSelector((state) => state.authentication.token);
    const isAuth = useSelector((state) => state.authentication.token);
    let navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        // console.log('----------isAuth-----');
        // console.log(isAuth);
        if (isAuth) {
            navigate("/delete");
        } else {
            navigate("/");
        }
    }, [isAuth, navigate]);

    const formik = useFormik({
        initialValues: {
            user_code: "",
            username: "",
            password: "",
        },
        //validationSchema: ValidationSchema(),
        onSubmit: (values) => {
            dispatch(addUser(values))
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
            <Box sx={{ width: '100%' }}>
                <Grid container component="main" sx={{ height: "100vh", width: '100%' }}>

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
                                สมัครสมาชิก
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
                                    id="user_code"
                                    label="user_code"
                                    name="user_code"
                                    autoComplete="user_code"
                                    autoFocus
                                    {...formik.getFieldProps("user_code")}
                                    {...errorHelper(formik, "user_code")}
                                />
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
                                    เพิ่ม
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
                </Grid>
            </Box>
            <Grid container sx={{ bgcolor: '#1D2A3A', height: '100vh', width: 'auto' }}>
                <Grid
                    item
                    // xs={false}
                    // sm={4}
                    md={6}
                    sx={{
                        bgcolor: '#1D2A3A',
                        width: '100%',
                        height: '100%'
                    }}
                >

                </Grid>
            </Grid>
        </ThemeProvider>
    );
}