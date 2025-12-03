import './LoginForm.css';
import { MdOutlineEmail } from "react-icons/md";
import { TbLockFilled } from "react-icons/tb";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FiFilm } from "react-icons/fi";

import { useState } from "react";
import authApi from "../../api/authApi";

export default function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn reload trang

        try {
            const res = await authApi.login(username, password);

            // Lưu token
            localStorage.setItem("token", res.data.token);

            setMessage("Đăng nhập thành công!");
            console.log("Login success:", res.data);

            // TODO: điều hướng sang dashboard
            // navigate("/dashboard");

        } catch (err: any) {
            setMessage(err.response?.data?.message || "Đăng nhập thất bại!");
            console.error(err);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} noValidate>
                <div className='login-titile'>
                    <button className='logo-icon'>
                        <FiFilm />
                    </button>
                    <h1>CINEMAX</h1>
                </div>

                <div className='login-description'>
                    <h2>Welcome Back</h2>
                    <p>Sign in to continue your movie journey</p>
                </div>

                <div className="input-box">
                    <MdOutlineEmail className="icon"/>
                    <input 
                      type="text"
                      placeholder="username"
                      required 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="input-box">
                    <TbLockFilled className="icon"/>
                    <input 
                      type="password" 
                      placeholder="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="remember-forgot">
                    <label><input type="checkbox"/>Remember me</label>
                    <a className='forgot' href="#">Forgot password?</a>
                </div>

                <button type="submit" className="login-button">Sign in</button>

                {/* Hiển thị thông báo */}
                {message && <p style={{ color: "red", marginTop: "10px" }}>{message}</p>}

                <div className="register-link">
                    <p>Don't have an account? <a href="#">Sign Up</a></p>
                </div>
                <div className="continue-with">
                    <p>or continue with</p>
                </div>
                <div className="social-icons">
                    <button>
                        <FcGoogle className='social-icon'/> Google
                    </button>
                    <button>
                        <FaFacebook className='social-icon'/> Facebook
                    </button>
                </div>
            </form>
        </div> 
    );
};
