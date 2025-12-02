import './LoginForm.css';
import { MdOutlineEmail } from "react-icons/md";
import { TbLockFilled } from "react-icons/tb";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FiFilm } from "react-icons/fi";


export default function LoginForm() {
    return (
        <div className="login-container">
            <form action="">
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
                    {/* <label htmlFor="username">Username</label> */}
                    <MdOutlineEmail className="icon"/>
                    <input type="text" id="username" placeholder="username" required />
                </div>

                <div className="input-box">
                    {/* <label htmlFor="password">Password</label> */}
                    <TbLockFilled className="icon"/>
                    <input type="password" id="password" placeholder="password" required />
                </div>

                <div className="remember-forgot">
                    <label><input type="checkbox"/>Remember me</label>
                    <a className='forgot' href="#">Forgot password?</a>
                </div>

                <button type="submit" className="login-button">Sign in</button>

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