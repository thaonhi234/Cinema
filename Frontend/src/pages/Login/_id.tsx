import {
    Box,
    Container,
    Card,
    Stack,
    Grid,
    Typography,
    Button,
    Checkbox,
    FormControlLabel,
    Link,
    InputAdornment,
    CircularProgress
} from "@mui/material";
import { useState } from "react";
import authApi from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import CustomTextField from "../../components/CustomTextField"

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
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn reload trang

        if (!email || !password) {
            setMessage("Vui lòng nhập đầy đủ username và password");
            return;
        }

        try {
            setLoading(true);   // Bắt đầu loading
            setMessage("");     // clear message cũ

            const res = await authApi.login(email, password);

            // Lưu token
            localStorage.setItem("token", res.data.token);

            setMessage("Đăng nhập thành công!");
            console.log("Login success:", res.data);

            // TODO: điều hướng sang dashboard
            navigate("/dashboard");
            navigate("/dashboard");

        } catch (err: any) {
            setMessage(err.response?.data?.message || "Đăng nhập thất bại!");
            console.error(err);
        } finally {
            setLoading(false);  // Tắt loading dù thành công hay lỗi
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

                        {/* BẮT ĐẦU FORM */}
                        <Box component="form" onSubmit={handleSubmit}>
                            {/* Form fields */}
                            <Stack spacing={2}>
                                <CustomTextField
                                    id="outlined-basic"
                                    label="username"
                                    variant="outlined"
                                    fullWidth
                                    size="medium"
                                    color="secondary"
                                    focused
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                <CustomTextField
                                    label="password"
                                    type="password"
                                    variant="outlined"
                                    fullWidth
                                    size="medium"
                                    color="secondary"
                                    focused
                                    required
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
                                    label="Remember me"
                                    control={
                                        <Checkbox size="small" 
                                            sx={{
                                                color: "#fff",                       // màu viền checkbox
                                                '&.Mui-checked': {
                                                color: "#fff",                     // màu icon khi check
                                                },
                                                '& .MuiSvgIcon-root': {
                                                fill: "#fff",                      // màu icon SVG
                                                },
                                                '&:hover': {
                                                backgroundColor: "rgba(255,255,255,0.1)",  // nền khi hover (tùy chọn)
                                                }
                                            }}
                                        />
                                    }
                                />
                                <Link href="#" variant="body2" sx={{ color: "#ff07d6"}}>
                                    Forgot password?
                                </Link>
                            </Stack>

                            {/* Sign in button */}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 999,
                                    background:
                                        "linear-gradient(90deg, #ff0040 0%, #ff00aa 50%, #7b2cff 100%)",
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} sx={{ color: "#fff"}}/>
                                ) : (
                                    "Sign in"
                                )}
                            </Button>
                        </Box>
                        {/* KẾT THÚC FORM */}

                        {/* Hiển thị thông báo */}
                        {message && <p style={{ color: "red", marginTop: "10px" }}>{message}</p>}

                        {/* Sign up text */}
                        <Typography variant="body2" textAlign="center">
                            {"Don't have an account? "}
                            <Link href="#" sx={{ color: "#ff07d6"}}>
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
                                    <Button fullWidth variant="outlined" sx={{ 
                                        color: "#2f00ffff", 
                                        borderColor: "#fff",
                                        backgroundColor: "#ffff",
                                        borderRadius: 3
                                    }}>
                                        <GoogleIcon />
                                        Google
                                    </Button>
                                </Grid>
                                <Grid size={{ xs: 6, md: 6 }} >
                                    <Button fullWidth variant="outlined" sx={{ 
                                        color: "#2f00ffff", 
                                        borderColor: "#fff",
                                        backgroundColor: "#ffff",
                                        borderRadius: 3
                                    }}>
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
