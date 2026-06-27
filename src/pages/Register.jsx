import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Shield } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import logo from '../assets/logo.png';
import clsx from 'clsx';

const extractSponsorId = (text) => {
  if (!text) return '';
  const cleanText = text.trim();
  try {
    if (cleanText.includes('?ref=') || cleanText.includes('&ref=')) {
      const urlParams = new URLSearchParams(cleanText.split('?')[1]);
      const ref = urlParams.get('ref');
      if (ref) return ref.toUpperCase();
    }
    if (cleanText.includes('?sponsor=') || cleanText.includes('&sponsor=')) {
      const urlParams = new URLSearchParams(cleanText.split('?')[1]);
      const sponsor = urlParams.get('sponsor');
      if (sponsor) return sponsor.toUpperCase();
    }
    if (cleanText.includes('?sponsorId=') || cleanText.includes('&sponsorId=')) {
      const urlParams = new URLSearchParams(cleanText.split('?')[1]);
      const sponsorId = urlParams.get('sponsorId');
      if (sponsorId) return sponsorId.toUpperCase();
    }
    if (cleanText.startsWith('http://') || cleanText.startsWith('https://')) {
      const url = new URL(cleanText);
      const ref = url.searchParams.get('ref') || url.searchParams.get('sponsor') || url.searchParams.get('sponsorId');
      if (ref) return ref.toUpperCase();
    }
  } catch (error) {
    console.error('Failed parsing referral link:', error);
  }
  return cleanText.toUpperCase();
};

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    sponsorId: '',
    password: '',
    confirmPassword: ''
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref') || params.get('sponsor') || params.get('sponsorId');
    if (ref) {
      setFormData((prev) => ({ ...prev, sponsorId: ref.toUpperCase() }));
    }
  }, [location.search]);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'sponsorId') {
      value = extractSponsorId(value);
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handlePaste = (e) => {
    if (e.target.name === 'sponsorId') {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text');
      const extractedId = extractSponsorId(pastedText);
      setFormData((prev) => ({ ...prev, sponsorId: extractedId }));
    }
  };

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (isSuccess || user) {
      navigate('/dashboard');
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const handleRegister = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        sponsorId: formData.sponsorId
      };
      dispatch(register(userData));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10 my-8"
      >
        <div className="bg-surface-0 border border-border-subtle rounded-lg p-8 shadow-sm">
          <div className="text-center mb-8 flex flex-col items-center">
            <img src={logo} alt="CTC Logo" className="h-16 w-auto object-contain mb-4" />
            <h1 className="text-3xl font-bold text-ink-900 mb-2">
              Create <span className="text-brand-600">Account</span>
            </h1>
            <p className="text-ink-500 text-sm">Join CTC and start your journey</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-ink-300" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-surface-0 border border-border-subtle focus:border-brand-500 focus:ring-[3px] focus:ring-brand-glow rounded-md pl-11 pr-4 py-3.5 text-ink-900 placeholder-ink-300 focus:outline-none transition-all font-semibold"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-ink-300" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-surface-0 border border-border-subtle focus:border-brand-500 focus:ring-[3px] focus:ring-brand-glow rounded-md pl-11 pr-4 py-3.5 text-ink-900 placeholder-ink-300 focus:outline-none transition-all font-semibold"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">Sponsor ID / Referral ID (Required)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-ink-300" />
                </div>
                <input
                  type="text"
                  name="sponsorId"
                  required
                  value={formData.sponsorId}
                  onChange={handleChange}
                  onPaste={handlePaste}
                  className="w-full bg-surface-0 border border-border-subtle focus:border-brand-500 focus:ring-[3px] focus:ring-brand-glow rounded-md pl-11 pr-4 py-3.5 text-ink-900 placeholder-ink-300 focus:outline-none transition-all font-semibold uppercase font-mono"
                  placeholder="Enter Sponsor ID"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-ink-300" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-surface-0 border border-border-subtle focus:border-brand-500 focus:ring-[3px] focus:ring-brand-glow rounded-md pl-11 pr-4 py-3.5 text-ink-900 placeholder-ink-300 focus:outline-none transition-all font-semibold"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-ink-300" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-surface-0 border border-border-subtle focus:border-brand-500 focus:ring-[3px] focus:ring-brand-glow rounded-md pl-11 pr-4 py-3.5 text-ink-900 placeholder-ink-300 focus:outline-none transition-all font-semibold"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start text-ink-500 text-sm cursor-pointer select-none">
                <input type="checkbox" required className="form-checkbox h-4 w-4 mt-0.5 rounded border-border-subtle text-brand-600 focus:ring-brand-500" />
                <span className="ml-2 leading-tight">
                  I agree to the <a href="#" className="text-brand-600 hover:text-brand-700 transition-colors font-bold">Terms of Service</a> and <a href="#" className="text-brand-600 hover:text-brand-700 transition-colors font-bold">Privacy Policy</a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-md font-bold text-white bg-brand-500 hover:bg-brand-600 shadow-sm shadow-brand transition-all duration-300 cursor-pointer"
            >
              <UserPlus size={20} />
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-ink-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 font-bold hover:text-brand-700 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
