import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import loginSchema from "../../validation-schema/login.schema.js";
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

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: "accountant",
      password: "admin123"
    }
  });

  const onSubmit = async data => {
    setIsLoading(true);
    setTimeout(() => {
      console.log("Login successful:", data);
      alert(`Welcome to Invenso! Logged in as: ${data.username}`);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>

        {/* Animated Grid */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-y-12 animate-shimmer"></div>
      </div>

      {/* Left Side - Welcome Section (60%) */}
      <div className="flex-[3] relative z-10 p-8 flex flex-col justify-center">
        {/* Glassmorphism Background */}
        <div className="absolute inset-4 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl"></div>

        {/* Content */}
        <div className="relative z-20 max-w-lg mx-auto text-white">
          {/* Logo and Brand - Animated Entry */}
          <div className="mb-8 transform transition-all duration-1000 animate-fade-in-up">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-xl flex items-center justify-center mr-3 shadow-lg transform hover:scale-110 transition-transform duration-300">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  Invenso
                </h1>
                <p className="text-gray-300 text-sm">Inventory Management</p>
              </div>
            </div>
          </div>

          {/* Welcome Message - Staggered Animation */}
          <div className="mb-8 transform transition-all duration-1000 animate-fade-in-up animation-delay-500">
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              Welcome to the Future of
              <span className="block bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Inventory Management
              </span>
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Streamline operations, optimize stock, and grow your business with our comprehensive
              solution.
            </p>
          </div>

          {/* Features - Sequential Animation */}
          <div className="space-y-4 transform transition-all duration-1000 animate-fade-in-up animation-delay-1000">
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
          <div className="mt-8 pt-6 border-t border-white/20 transform transition-all duration-1000 animate-fade-in-up animation-delay-1500">
            <p className="text-gray-400 text-sm">Trusted by 10,000+ businesses worldwide</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form (40%) */}
      <div className="flex-[2] relative z-10 flex items-center justify-center p-6">
        {/* Glassmorphism Login Card */}
        <div className="w-full max-w-sm transform transition-all duration-1000 animate-fade-in-right">
          {/* Login Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg transform hover:scale-110 transition-all duration-300">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
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
                    {...register("username")}
                    type="text"
                    placeholder="Enter username"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 hover:bg-white/20 transition-all duration-200"
                  />
                </div>
                {errors.username && (
                  <p className="text-red-400 text-xs mt-1 animate-shake">
                    {errors.username.message}
                  </p>
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
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
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
                  <p className="text-red-400 text-xs mt-1 animate-shake">
                    {errors.password.message}
                  </p>
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
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl animate-fade-in-up animation-delay-3500"
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
      `}</style>
    </div>
  );
};

export default LoginPage;
