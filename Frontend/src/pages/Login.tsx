import InputField from "../components/InputField.tsx";
import SocialButton from "../components/SocialButton.tsx";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

export default function Login() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1350&q=80')",
      }}
    >
      <div className="bg-black/70 border border-gray-700 rounded-2xl p-10 w-[420px] shadow-xl backdrop-blur-lg">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-4 rounded-xl mb-3">
            🎬
          </div>

          <h1 className="text-3xl text-white font-semibold">CINEMAX</h1>
          <p className="text-gray-400 mt-4">Welcome Back</p>
          <p className="text-gray-500 text-sm">
            Sign in to continue your movie journey
          </p>
        </div>

        {/* Form */}
        <div className="mt-8 space-y-5">
          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <InputField type="email" placeholder="Enter your email" />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Password</label>
            <InputField type="password" placeholder="Enter your password" />
          </div>

          <div className="flex justify-between items-center text-gray-400 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" />
              Remember me
            </label>
            <button className="text-purple-400 hover:underline">
              Forgot Password?
            </button>
          </div>

          <button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition">
            Sign In
          </button>

          <p className="text-center text-gray-400 text-sm">
            Don't have an account?
            <span className="text-purple-400 hover:underline cursor-pointer ml-1">
              Sign Up
            </span>
          </p>

          <div className="flex items-center my-4">
            <span className="w-full h-px bg-gray-700"></span>
            <span className="px-3 text-gray-500 text-sm">Or continue with</span>
            <span className="w-full h-px bg-gray-700"></span>
          </div>

          <div className="flex gap-4">
            <SocialButton icon={<FcGoogle size={22} />} label="Google" />
            <SocialButton icon={<FaFacebook size={22} />} label="Facebook" />
          </div>
        </div>
      </div>
    </div>
  );
}
