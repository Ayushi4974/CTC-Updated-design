import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

import logo from '../assets/logo.png';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      const userData = {
        _id: params.get('_id'),
        userId: params.get('userId'),
        fullName: params.get('fullName'),
        email: params.get('email'),
        role: params.get('role'),
        isKYCVerified: params.get('isKYCVerified') === 'true',
        token: token
      };
      localStorage.setItem('user', JSON.stringify(userData));
      window.location.href = '/dashboard';
    }
  }, []);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (isSuccess || user) {
      navigate('/dashboard');
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(login({ userId, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-surface-0 border border-border-subtle rounded-lg p-8 shadow-sm">
          <div className="text-center mb-8 flex flex-col items-center">
            <img src={logo} alt="CTC Logo" className="h-16 w-auto object-contain mb-4" />
            <h1 className="text-3xl font-bold text-ink-900 mb-2">
              Welcome <span className="text-brand-600">Back</span>
            </h1>
            <p className="text-ink-500 text-sm">Login to access your CTC dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">User ID / Referral ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-ink-300" />
                </div>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.toUpperCase())}
                  className="w-full bg-surface-0 border border-border-subtle focus:border-brand-500 focus:ring-[3px] focus:ring-brand-glow rounded-md pl-11 pr-4 py-3.5 text-ink-900 placeholder-ink-300 focus:outline-none transition-all font-semibold"
                  placeholder="Enter your User ID"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-ink-300" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-0 border border-border-subtle focus:border-brand-500 focus:ring-[3px] focus:ring-brand-glow rounded-md pl-11 pr-4 py-3.5 text-ink-900 placeholder-ink-300 focus:outline-none transition-all font-semibold"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-ink-500 cursor-pointer select-none">
                <input type="checkbox" className="form-checkbox h-4 w-4 rounded border-border-subtle text-brand-600 focus:ring-brand-500" />
                <span className="ml-2">Remember me</span>
              </label>
              <a href="#" className="text-brand-600 hover:text-brand-700 transition-colors font-bold">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-md font-bold text-white bg-brand-500 hover:bg-brand-600 shadow-sm shadow-brand transition-all duration-300 cursor-pointer"
            >
              <LogIn size={20} />
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-ink-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-600 font-bold hover:text-brand-700 transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
