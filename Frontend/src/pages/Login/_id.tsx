import {
    Box,
    Container,
    Card,
    Stack,
    Grid,
    TextField,
    Typography,
    Button,
    Checkbox,
    FormControlLabel,
    Link,
    InputAdornment 
} from "@mui/material";
import { useState } from "react";
import authApi from "../../api/authApi";
import { useNavigate } from "react-router-dom";
// Icons
import TheatersIcon from '@mui/icons-material/Theaters';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockIcon from '@mui/icons-material/Lock';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn reload trang

        try {
            const res = await authApi.login(email, password);

            // Lưu token
            localStorage.setItem("token", res.data.token);

            setMessage("Đăng nhập thành công!");
            console.log("Login success:", res.data);

            // TODO: điều hướng sang dashboard
            navigate("/dashboard");

        } catch (err: any) {
            setMessage(err.response?.data?.message || "Đăng nhập thất bại!");
            console.error(err);
        }
    };
    
    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundImage: "url('https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1350&q=80')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Container maxWidth="xs">
                <Card
                    sx={{
                        bgcolor: "rgba(0,0,0,0.9)",
                        color: "#fff",
                        borderRadius: 3,
                        p: 4,
                        boxShadow: 8,
                    }}
                >
                    <Stack spacing={3}>
                        {/* Logo + CINEMAX */}
                        <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            justifyContent="center"
                        >
                            <TheatersIcon sx={{ fontSize: 48, color: "#ff0099" }} />
                            <Typography variant="h4" fontWeight={700}>
                                CINEMAX
                            </Typography>
                        </Stack>

                        {/* Welcome text */}
                        <Stack spacing={0.5} textAlign="center">
                            <Typography variant="h5" fontWeight={600}>
                                Welcome Back
                            </Typography>
                            <Typography variant="body2" color="grey.400">
                                Sign in to continue your movie journey
                            </Typography>
                        </Stack>

                        {/* Form fields */}
                        <Stack spacing={2}>
                            <TextField
                                id="outlined-basic"
                                label="username"
                                variant="outlined"
                                fullWidth
                                size="medium"
                                color="secondary"
                                focused
                                value={email}
    onChange={(e) =>            setEmail(e.target.value)}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                        <InputAdornment position="end">
                                            <MailOutlineIcon sx={{ color: "#ffffffff"}}/>
                                        </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                            <TextField
                                label="password"
                                type="password"
                                variant="outlined"
                                fullWidth
                                size="medium"
                                color="secondary"
                                focused 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                        <InputAdornment position="end">
                                            <LockIcon sx={{ color: "#ffffffff"}}/>
                                        </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Stack>

                        {/* Remember + Forgot */}
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <FormControlLabel
                                control={<Checkbox size="small" />}
                                label="Remember me"
                            />
                            <Link href="#" variant="body2" color="secondary.main">
                                Forgot password?
                            </Link>
                        </Stack>

                        {/* Sign in button */}
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleSubmit}  
                            sx={{
                                py: 1.5,
                                borderRadius: 999,
                                background:
                                    "linear-gradient(90deg, #ff0040 0%, #ff00aa 50%, #7b2cff 100%)",
                            }}
                        >
                            Sign in
                        </Button>

                        {/* Sign up text */}
                        <Typography variant="body2" textAlign="center">
                            {"Don't have an account? "}
                            <Link href="#" color="secondary.main">
                                Sign Up
                            </Link>
                        </Typography>

                        {/* Or continue with + social buttons */}
                        <Stack spacing={1.5}>
                            <Typography
                                variant="body2"
                                textAlign="center"
                                color="grey.400"
                            >
                                or continue with
                            </Typography>

                            <Grid container spacing={2} justifyContent="center">
                                <Grid size={{ xs: 6, md: 6 }} >
                                    <Button fullWidth variant="outlined" sx={{ color: "#fff", borderColor: "#fff" }}>
                                        <GoogleIcon />
                                        Google
                                    </Button>
                                </Grid>
                                <Grid size={{ xs: 6, md: 6 }} >
                                    <Button fullWidth variant="outlined" sx={{ color: "#fff", borderColor: "#fff" }}>
                                        <FacebookIcon />
                                        Facebook
                                    </Button>
                                </Grid>
                            </Grid>
                        </Stack>
                    </Stack>
                </Card>
            </Container>
        </Box>
    );
}

export default Login;
