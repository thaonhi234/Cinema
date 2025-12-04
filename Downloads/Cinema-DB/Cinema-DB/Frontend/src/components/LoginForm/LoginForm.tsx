import './LoginForm.css';
import { MdOutlineEmail } from "react-icons/md";
import { TbLockFilled } from "react-icons/tb";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";


export default function LoginForm() {
    return (
        <div className="login-container">
            <form action="">
                <h1>Login</h1>
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
                    <a href="#">Forgot password?</a>
                </div>

                <button type="submit" className="login-button">Sign in</button>

                <div className="register-link">
                    <p>Don't have an account? <a href="#">Register</a></p>
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