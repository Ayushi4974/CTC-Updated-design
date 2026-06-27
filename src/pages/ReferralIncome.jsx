import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, User, Mail, Shield, ShieldCheck, Globe, Copy, Check,
  DollarSign, ArrowUpRight, TrendingUp, Gift, Calendar, ExternalLink, Activity, Car,
  CheckCircle2, Clock
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../redux/slices/authSlice';
import api from '../api';
import { toast } from 'react-toastify';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';

const defaultProfileData = {
  id: 'N/A',
  name: 'User',
  email: '',
  totalNetwork: 0,
};

const Counter = ({ value, prefix, suffix }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (start === end) return;

    let totalMilSecDur = 1000;
    let incrementTime = (totalMilSecDur / end) * 2;
    if (incrementTime < 10) incrementTime = 10;

    let timer = setInterval(() => {
      start += Math.ceil(end / 20);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const ReferralIncome = () => {
  const [copied, setCopied] = useState(false);
  const [directTeam, setDirectTeam] = useState([]);
  
  const dispatch = useDispatch();
  const { profile, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProfile());
    const fetchTeam = async () => {
      try {
        const res = await api.get('/user/team');
        setDirectTeam(res.data.directTeam || []);
      } catch (err) {
        console.error('Error fetching team:', err);
      }
    };
    fetchTeam();
  }, [dispatch]);

  const currentUser = profile || user;

  const profileData = {
    id: currentUser?.userId || defaultProfileData.id,
    name: currentUser?.fullName || defaultProfileData.name,
    email: currentUser?.email || defaultProfileData.email,
    totalNetwork: currentUser?.directTeam || 0,
  };

  const dynamicReferralStats = [
    { title: 'Total Direct Referrals', value: profileData.totalNetwork, prefix: '', suffix: '', icon: Users, color: 'text-[#F310FD]', bg: 'bg-[#FDF0FF]', border: 'border-[#F0E8FF]' },
    { title: 'Total Referral Income', value: currentUser?.referralIncome || 0, prefix: '$', suffix: '', icon: DollarSign, color: 'text-[#F310FD]', bg: 'bg-[#FDF0FF]', border: 'border-[#F0E8FF]' },
    { title: 'Total Investment', value: currentUser?.totalInvestment || 0, prefix: '$', suffix: '', icon: Gift, color: 'text-amber-500', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(profileData.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 pt-4 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A2E] mb-2 tracking-tight">
            Referral Income
          </h1>
          <p className="text-[#4A4A6A] text-sm font-medium">
            Track your direct referral bonuses and historical earnings.
          </p>
        </div>
        
        <PremiumButton 
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/register?ref=${profileData.id}`);
            toast.success("Referral link copied!");
          }}
          variant="primary"
          className="py-3 px-6 text-sm font-bold gap-2"
        >
          <Users size={18} /> <span>Copy Invite Link</span>
        </PremiumButton>
      </div>

      {/* Earning Potential & Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Earning Potential Tracker */}
        <GlassCard 
          hoverable={false}
          className="lg:col-span-1 p-6 flex flex-col justify-center border border-[#E8E6F0]"
        >
          <h3 className="text-[11px] font-bold text-[#7A7A9A] uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Activity size={14} className="text-[#10B981]" /> 4X Earning Potential
          </h3>
          
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * Math.min((currentUser?.totalEarning || 0) / ((currentUser?.totalInvestment || 0) * 4 || 1000), 1))} className="text-[#F310FD]" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-[#1A1A2E]">{Math.min(Math.round(((currentUser?.totalEarning || 0) / ((currentUser?.totalInvestment || 0) * 4 || 1000)) * 100), 100)}%</span>
              <span className="text-[9px] text-[#7A7A9A] uppercase tracking-widest font-bold">Reached</span>
            </div>
          </div>
          
          <p className="text-xs text-center text-[#4A4A6A] font-semibold">Earned: <span className="text-[#1A1A2E] font-extrabold">${currentUser?.totalEarning || 0}</span> / ${(currentUser?.totalInvestment || 0) * 4 || 1000}</p>
        </GlassCard>

        {/* Profile Information */}
        <GlassCard 
          hoverable={false}
          className="lg:col-span-3 p-8 relative overflow-hidden group border border-[#E8E6F0] flex flex-col justify-center"
        >
          <h2 className="text-xs font-bold text-[#7A7A9A] uppercase tracking-wider mb-6 relative z-10">YOUR PROFILE INFORMATION</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#7A7A9A] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Shield size={12} className="text-[#F310FD]" /> User ID
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-[#1A1A2E] tracking-tight">{profileData.id}</span>
                <button 
                  onClick={handleCopy}
                  className="w-7 h-7 rounded-xl bg-[#FAF9FF] flex items-center justify-center border border-[#E8E6F0] hover:border-[#F310FD]/20 text-[#7A7A9A] hover:text-[#F310FD] transition-all"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#7A7A9A] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User size={12} className="text-[#10B981]" /> Full Name
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-[#1A1A2E] tracking-tight">{profileData.name}</span>
                <div className="bg-[#E8FBF1] rounded-full p-0.5" title="Verified KYC">
                  <ShieldCheck size={12} className="text-[#10B981]" />
                </div>
              </div>
            </div>

            <div className="flex flex-col col-span-2 md:col-span-1">
              <span className="text-[10px] font-bold text-[#7A7A9A] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail size={12} className="text-blue-500" /> Email
              </span>
              <span className="text-base font-extrabold text-[#1A1A2E] truncate leading-tight tracking-tight mt-1">{profileData.email}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#7A7A9A] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Users size={12} className="text-[#F310FD]" /> Total Network
              </span>
              <span className="text-xl font-extrabold text-[#1A1A2E] tracking-tight">{profileData.totalNetwork} members</span>
            </div>

          </div>
        </GlassCard>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {dynamicReferralStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (idx * 0.1) }}
              className="bg-white border border-[#E8E6F0] rounded-xl p-6 relative overflow-hidden shadow-sm hover:border-[#F310FD]/35 transition-colors"
            >
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-[#7A7A9A] uppercase tracking-wider mb-1">{stat.title}</p>
                  <p className="text-2xl font-extrabold text-[#1A1A2E] tracking-tight">
                    <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#FAF9FF] border border-[#E8E6F0] flex items-center justify-center">
                  <Icon size={22} className="text-[#F310FD]" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Referral History Table */}
      <GlassCard 
        hoverable={false}
        className="overflow-hidden p-0 border border-[#E8E6F0] mb-8"
      >
        <div className="p-6 border-b border-[#E8E6F0] bg-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-extrabold text-[#1A1A2E]">Direct Referrals Earnings</h3>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-8 gap-4 px-6 py-4 border-b border-[#E8E6F0] text-[10px] font-bold text-[#7A7A9A] uppercase tracking-widest bg-slate-50">
          <div className="col-span-2">Partner Details</div>
          <div className="col-span-2">Investment Tier</div>
          <div className="col-span-1 text-center">Comm. %</div>
          <div className="col-span-1 text-right">Earned</div>
          <div className="col-span-1 text-center">Date</div>
          <div className="col-span-1 text-center">Status</div>
        </div>

        {/* Table Content */}
        <div className="flex flex-col relative z-10">
          {directTeam.length > 0 ? directTeam.map((row, idx) => (
            <div 
              key={idx} 
              className="group grid grid-cols-1 md:grid-cols-8 gap-4 px-6 py-4 border-b border-[#E8E6F0] items-center hover:bg-[#FAF9FF] transition-colors duration-150"
            >
              {/* Partner Details */}
              <div className="col-span-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FDE8FE] border border-[#F310FD]/15 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#F310FD]">{row.fullName?.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#1A1A2E]">{row.fullName}</p>
                  <p className="text-[10px] text-[#7A7A9A] font-bold">{row.userId}</p>
                </div>
              </div>

              {/* Investment */}
              <div className="col-span-2">
                <p className="text-sm font-extrabold text-[#1A1A2E] mb-1">${parseFloat(row.totalInvestment || 0).toLocaleString()}</p>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border text-[#10B981] bg-[#E8FBF1] border-[#10B981]/15">
                  Active
                </span>
              </div>

              {/* Comm % */}
              <div className="col-span-1 md:text-center text-sm font-extrabold text-[#4A4A6A]">
                <span>5%</span>
              </div>

              {/* Earned */}
              <div className="col-span-1 md:text-right">
                <p className="text-sm font-extrabold text-[#10B981]">
                  +${((row.totalInvestment || 0) * 0.05).toFixed(2)}
                </p>
              </div>

              {/* Date */}
              <div className="col-span-1 md:text-center flex items-center md:justify-center gap-1.5 text-xs text-[#4A4A6A] font-bold">
                <Calendar size={12} className="text-[#7A7A9A] hidden md:block" />
                <span>{new Date(row.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Status */}
              <div className="col-span-1 md:text-center flex justify-end md:justify-center items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E8FBF1] text-[#10B981] border border-[#10B981]/15">
                  <CheckCircle2 size={12} /> Active
                </span>
              </div>

            </div>
          )) : (
            <div className="p-10 text-center text-[#4A4A6A] font-bold text-sm">No direct referrals yet. Share your link to start earning!</div>
          )}
        </div>
      </GlassCard>

      {/* Reward Milestones Bottom Tracker */}
      <GlassCard 
        hoverable={false}
        className="p-6 border border-[#E8E6F0] flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FDE8FE] border border-[#F310FD]/15 flex items-center justify-center">
            <Car size={20} className="text-[#F310FD]" />
          </div>
          <div>
            <p className="text-[10px] text-[#7A7A9A] font-bold uppercase tracking-wider mb-0.5">Next Milestone Reward</p>
            <h4 className="text-lg font-extrabold text-[#1A1A2E]">Unlock Premium Rewards</h4>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="flex justify-between text-xs text-[#4A4A6A] font-bold mb-2">
            <span>Progress: 30% Achieved</span>
            <span>Target: 100%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#F310FD] to-[#C70AD1] w-[30%]"></div>
          </div>
        </div>
      </GlassCard>

    </div>
  );
};

export default ReferralIncome;
