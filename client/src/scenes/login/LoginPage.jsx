import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Package,
  User,
  Lock,
  BarChart3,
  Shield,
  TrendingUp,
  CheckCircle
} from "lucide-react";
import useLogin from "@/hooks/useAuth";
import { login } from "@/services/authServices";
import { useNavigate   } from "react-router-dom";
import useTheme from "@/hooks/useTheme";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const {theme, globalColors, orbColors: orbs } = useTheme();

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    setErrors({});

    // Simple validation
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    await login(formData);
    setIsLoading(false);
    navigate("/dashboard")
  
  };

  return (
   <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex overflow-auto">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-48 md:h-48 xl:w-64 xl:h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-32 h-32 md:w-48 md:h-48 xl:w-64 xl:h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 md:w-64 md:h-64 xl:w-96 xl:h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>

        {/* Animated Grid */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-y-12 animate-shimmer"></div>
      </div>

      {/* Left Side - Welcome Section (60%) */}
      <div className="w-full lg:w-3/5 relative z-10 p-6 md:p-8 xl:p-12 flex flex-col justify-center ">
        {/* Glassmorphism Background */}
        <div className="absolute inset-4 md:inset-6 bg-white/10 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl"></div>

        {/* Content */}
        <div className="relative z-20 max-w-2xl mx-auto text-white">
          {/* Logo and Brand - Animated Entry */}
          <div className="mb-6 md:mb-8 transform transition-all duration-1000 animate-fade-in-up">
            <div className="flex items-center mb-4 justify-center lg:justify-start">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-xl flex items-center justify-center mr-3 shadow-lg transform hover:scale-110 transition-transform duration-300">
                <Package className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  Invenso
                </h1>
                <p className="text-gray-300 text-sm">Inventory Management</p>
              </div>
            </div>
          </div>

          {/* Welcome Message - Staggered Animation */}
          <div className="mb-6 md:mb-8 transform transition-all duration-1000 animate-fade-in-up animation-delay-500 text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl xl:text-4xl font-bold mb-4 leading-tight">
              Welcome to the Future of
              <span className="block bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Inventory Management
              </span>
            </h2>
            <p className="text-base md:text-lg xl:text-xl text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Streamline operations, optimize stock, and grow your business with our comprehensive
              solution.
            </p>
          </div>

          {/* Features - Sequential Animation */}
          <div className="space-y-4 transform transition-all duration-1000 animate-fade-in-up animation-delay-1000 mb-6 md:mb-8">
            <div className="flex items-center group hover:bg-white/5 rounded-lg p-3 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Real-time Analytics</h3>
                <p className="text-gray-400 text-sm">Track inventory levels instantly</p>
              </div>
            </div>

            <div className="flex items-center group hover:bg-white/5 rounded-lg p-3 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Secure & Reliable</h3>
                <p className="text-gray-400 text-sm">Enterprise-grade security</p>
              </div>
            </div>

            <div className="flex items-center group hover:bg-white/5 rounded-lg p-3 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Smart Optimization</h3>
                <p className="text-gray-400 text-sm">AI-powered insights</p>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="pt-6 border-t border-white/20 transform transition-all duration-1000 animate-fade-in-up animation-delay-1500 text-center lg:text-left">
            <p className="text-gray-400 text-sm">Trusted by 10,000+ businesses worldwide</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form (40%) */}
      <div className="w-full lg:w-2/5 relative z-10 flex items-center justify-center p-6 lg:p-8">
        {/* Glassmorphism Login Card */}
        <div className="w-full max-w-md transform transition-all duration-1000 animate-fade-in-right">
          {/* Login Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg transform hover:scale-110 transition-all duration-300">
              <User className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">Sign In</h2>
            <p className="text-gray-300 text-sm">Access your dashboard</p>
          </div>

          {/* Login Form */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="space-y-5">
              {/* Username Field */}
              <div className="transform transition-all duration-500 animate-fade-in-up animation-delay-2000">
                <label className="block text-sm font-semibold text-gray-200 mb-2">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-200" />
                  </div>
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 hover:bg-white/20 transition-all duration-200"
                  />
                </div>
                {errors.username && (
                  <p className="text-red-400 text-xs mt-1 animate-shake">{errors.username}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="transform transition-all duration-500 animate-fade-in-up animation-delay-2500">
                <label className="block text-sm font-semibold text-gray-200 mb-2">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-200" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-11 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 hover:bg-white/20 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1 animate-shake">{errors.password}</p>
                )}
              </div>

              {/* Demo Info */}
              <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/30 rounded-lg p-3 transform transition-all duration-500 animate-fade-in-up animation-delay-3000">
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-white">Certified for Industry Use</p>
                    <p className="text-xs text-gray-300 mt-0.5">Credentials pre-filled for admin</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={onSubmit}
                disabled={isLoading}
                className="w-full py-3 cursor-pointer px-4 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl animate-fade-in-up animation-delay-3500"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Sign In</span>
                    <User className="w-4 h-4" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 text-center transform transition-all duration-1000 animate-fade-in-up animation-delay-4000">
            <p className="text-xs text-gray-400">Protected by enterprise security</p>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
        }

        .animate-fade-in-right {
          animation: fadeInRight 0.8s ease-out forwards;
          opacity: 0;
          transform: translateX(30px);
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-1500 {
          animation-delay: 1.5s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-2500 {
          animation-delay: 2.5s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-3500 {
          animation-delay: 3.5s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes shimmer {
          0%,
          100% {
            opacity: 0.3;
            transform: translateX(-100%) skewY(-12deg);
          }
          50% {
            opacity: 0.1;
            transform: translateX(100%) skewY(-12deg);
          }
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInRight {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @media (max-width: 1023px) {
          .w-full.lg\\:w-3\\/5 {
            display: none;
          }
          .w-full.lg\\:w-2\\/5 {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
