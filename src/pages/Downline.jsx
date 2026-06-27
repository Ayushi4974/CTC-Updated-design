import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, User, Mail, Shield, BarChart3, TrendingUp, 
  ChevronRight, Info, Timer,
  ShieldCheck, Lock, Copy, Check
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile } from '../redux/slices/authSlice';
import api from '../api';
import clsx from 'clsx';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';
import StatCard from '../components/StatCard';
import ValidatedInput from '../components/ValidatedInput';

const CircularProgress = ({ progress, label, total }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / total) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="60" height="60" className="transform -rotate-90">
        <circle cx="30" cy="30" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
        <circle 
          cx="30" cy="30" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" 
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          className="text-[#F310FD] transition-all duration-1000 ease-in-out" strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-[#1A1A2E]">
        <span className="font-extrabold text-xs leading-none">{label}</span>
      </div>
    </div>
  );
};

const LEVEL_PERCENTAGES = [
  15, 8, 7, 4, 4, 3, 3, 3, 3, 4, 
  5, 7, 8, 8, 12, 15, 8, 7, 4, 4, 
  3, 3, 3, 3, 4, 5, 7, 8, 8, 12
];

const LEVEL_REQUIREMENTS = [
  { staking: 20, directs: 2 }, { staking: 40, directs: 3 }, { staking: 60, directs: 4 }, { staking: 80, directs: 5 }, { staking: 120, directs: 6 },
  { staking: 200, directs: 7 }, { staking: 300, directs: 8 }, { staking: 400, directs: 9 }, { staking: 400, directs: 10 }, { staking: 500, directs: 11 },
  { staking: 600, directs: 12 }, { staking: 700, directs: 13 }, { staking: 900, directs: 14 }, { staking: 900, directs: 15 }, { staking: 1000, directs: 16 },
  { staking: 1100, directs: 17 }, { staking: 1200, directs: 18 }, { staking: 1300, directs: 19 }, { staking: 1400, directs: 20 }, { staking: 1500, directs: 21 },
  { staking: 1600, directs: 22 }, { staking: 1700, directs: 23 }, { staking: 1800, directs: 24 }, { staking: 1900, directs: 25 }, { staking: 2000, directs: 26 },
  { staking: 2200, directs: 27 }, { staking: 2400, directs: 28 }, { staking: 2700, directs: 29 }, { staking: 3000, directs: 30 }, { staking: 3000, directs: 30 }
];

const Downline = () => {
  const dispatch = useDispatch();
  const { user, profile } = useSelector((state) => state.auth);
  const currentUser = profile || user;
  
  const [directTeam, setDirectTeam] = useState([]);
  const [allLevels, setAllLevels] = useState([]);
  const [levelIncomeData, setLevelIncomeData] = useState([]);
  const [copied, setCopied] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [hasActivePackage, setHasActivePackage] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
    const fetchData = async () => {
      try {
        const [teamRes, incomeRes, packagesRes] = await Promise.all([
          api.get('/user/team'),
          api.get('/user/level-income'),
          api.get('/package/my-packages')
        ]);
        setDirectTeam(teamRes.data.directTeam || []);
        setAllLevels(teamRes.data.allLevels || []);
        setLevelIncomeData(incomeRes.data || []);

        const activePkg = (packagesRes.data || []).find(pkg => pkg.status === 'active');
        if (activePkg) {
          setHasActivePackage(true);
          const start = new Date(activePkg.startDate || activePkg.createdAt);
          const deadline = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
          const now = new Date();
          const diffMs = deadline.getTime() - now.getTime();
          const diffSec = Math.max(0, Math.floor(diffMs / 1000));
          setTimeLeft(diffSec);
        } else {
          setHasActivePackage(false);
          setTimeLeft(0);
        }
      } catch (err) {
        console.error('Failed to fetch team data', err);
      }
    };
    fetchData();
  }, [dispatch]);

  const profileData = {
    id: currentUser?.userId || 'N/A',
    name: currentUser?.fullName || 'N/A',
    email: currentUser?.email || 'N/A',
    totalNetwork: currentUser?.totalTeam || 0,
    overallBusiness: currentUser?.totalInvestment || 0,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(profileData.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleRow = (lvl) => {
    setExpandedRow(expandedRow === lvl ? null : lvl);
  };

  const formatTime = (seconds) => {
    const d = Math.floor(seconds / (24 * 3600));
    const h = Math.floor((seconds % (24 * 3600)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  const dynamicLevelsData = Array.from({ length: 30 }, (_, index) => {
    const level = index + 1;
    const req = LEVEL_REQUIREMENTS[index] || { staking: 0, directs: 0 };
    
    const countRequiredDirectsForLevel = req.directs;
    const currentDirectsCount = directTeam.filter(member => member.status === 'active' || member.totalInvestment > 0).length;
    const currentPersonalStaking = currentUser?.totalInvestment || 0;

    const isDirectsEligible = currentDirectsCount >= countRequiredDirectsForLevel;
    const isStakingEligible = currentPersonalStaking >= req.staking;
    const isActive = isDirectsEligible && isStakingEligible;

    const membersAtThisLevel = allLevels.filter(m => m.level === level) || [];
    const partners = level === 1 
      ? directTeam.map(d => ({ name: d.fullName, id: d.userId, vol: d.totalInvestment || 0 }))
      : membersAtThisLevel.map(m => ({ name: m.fullName, id: m.userId, vol: m.totalInvestment || 0 }));

    const totalVolume = partners.reduce((acc, p) => acc + Number(p.vol), 0);

    const commEarned = levelIncomeData
      .filter(income => income.level === level)
      .reduce((sum, item) => sum + (item.amount || 0), 0)
      .toFixed(2);

    return {
      level,
      members: partners.length,
      maxMembers: level === 1 ? 100 : level * 150,
      volume: totalVolume.toFixed(2),
      commPercent: LEVEL_PERCENTAGES[index] || 0,
      commEarned,
      isActive,
      reqDirects: req.directs,
      reqVol: req.staking,
      partners: partners
    };
  });

  const activeLevelsCount = dynamicLevelsData.filter(l => l.isActive).length;
  const totalMembers = directTeam.length + allLevels.length;
  const totalBusiness = dynamicLevelsData.reduce((sum, l) => sum + parseFloat(l.volume), 0).toFixed(2);
  const totalCommission = levelIncomeData.reduce((sum, i) => sum + (i.amount || 0), 0).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto pb-12 pt-4 px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A2E] mb-2 tracking-tight">My Network Node</h1>
          <p className="text-[#4A4A6A] text-sm font-medium">
            Monitor and track your multi-level affiliate network growth, structure, and volumes.
          </p>
        </div>

        {/* Fastrack Growth Timer */}
        <div className="bg-[#FFF6E8] border border-[#FF6B35]/15 rounded-xl p-3.5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#FF6B35]/20">
            <Timer className="text-[#FF6B35]" size={18} />
          </div>
          <div>
            <p className="text-[10px] text-[#FF6B35] font-bold uppercase tracking-wider mb-0.5">Fastrack Salary Timer</p>
            {currentUser?.fastrackQualified ? (
              <p className="text-sm font-bold text-[#10B981] flex items-center gap-1">
                <ShieldCheck size={14} /> Active
              </p>
            ) : timeLeft === null ? (
              <p className="text-sm font-semibold text-slate-400">Loading...</p>
            ) : !hasActivePackage ? (
              <p className="text-sm font-bold text-[#4A4A6A]">No Active Package</p>
            ) : timeLeft > 0 ? (
              <p className="text-sm font-extrabold text-[#1A1A2E] font-mono">{formatTime(timeLeft)}</p>
            ) : (
              <p className="text-sm font-bold text-[#FF6B35]">Expired</p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Information Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        {/* Left Stats Grid */}
        <GlassCard 
          hoverable={false}
          className="lg:col-span-3 p-6 md:p-8"
        >
          <h2 className="text-[10px] font-extrabold text-[#7A7A9A] uppercase tracking-widest mb-6">YOUR PROFILE INFORMATION</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#7A7A9A] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Shield size={12} className="text-[#F310FD]" /> User ID
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-[#1A1A2E] tracking-tight">{profileData.id}</span>
                <PremiumButton 
                  onClick={handleCopy}
                  variant="outline"
                  className="w-7 h-7 !p-0"
                >
                  {copied ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} />}
                </PremiumButton>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#7A7A9A] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User size={12} className="text-[#00D4AA]" /> Full Name
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-[#1A1A2E] tracking-tight">{profileData.name}</span>
                <div className="bg-[#E8FBF1] border border-[#10B981]/15 rounded-full p-0.5" title="Verified KYC">
                  <ShieldCheck size={12} className="text-[#10B981]" />
                </div>
              </div>
            </div>

            <div className="flex flex-col col-span-1 sm:col-span-2 md:col-span-1">
              <span className="text-[10px] font-bold text-[#7A7A9A] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Mail size={12} className="text-[#F310FD]" /> Email
              </span>
              <span className="text-sm font-bold text-[#1A1A2E] truncate leading-tight tracking-tight mt-1">{profileData.email}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#7A7A9A] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Users size={12} className="text-[#F310FD]" /> Total Network
              </span>
              <span className="text-xl font-extrabold text-[#1A1A2E] tracking-tight">{profileData.totalNetwork} members</span>
            </div>

          </div>
        </GlassCard>

        {/* Overall Business Card */}
        <GlassCard 
          hoverable={true}
          className="lg:col-span-1 p-6 relative overflow-hidden flex flex-col justify-center border border-[#F310FD]/15 bg-[#FDE8FE]/10"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-[#F310FD]/5 rounded-full blur-2xl"></div>
          <div className="relative z-10 h-full flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-[#E8E6F0] shrink-0">
                <BarChart3 size={14} className="text-[#F310FD]" />
              </div>
              <span className="text-xs font-bold text-[#F310FD] uppercase tracking-wider">Overall Business</span>
            </div>
            <span className="text-3xl font-extrabold text-[#1A1A2E] tracking-tight">
              ${parseFloat(profileData.overallBusiness).toLocaleString()}
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Network Performance Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-6 px-2">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A2E] mb-1">Network Performance Breakdown</h2>
          <p className="text-sm text-[#4A4A6A] font-medium">Track and unlock affiliate earnings across 30 levels</p>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Eligibility Tracker */}
          <div className="flex items-center gap-3 bg-white border border-[#E8E6F0] rounded-xl py-2.5 px-4 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B35] animate-pulse"></div>
            <div>
              <p className="text-[10px] text-[#7A7A9A] font-bold uppercase tracking-wider mb-0.5">Salary Active Vol.</p>
              <p className="text-xs font-bold text-[#1A1A2E]">0% of 10% target</p>
            </div>
          </div>

          {/* Active Levels Ring */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-[#1A1A2E]">Active Levels</p>
              <p className="text-[10px] text-[#7A7A9A] uppercase tracking-wider">Out of 30</p>
            </div>
            <CircularProgress progress={activeLevelsCount} label={activeLevelsCount} total={30} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <GlassCard 
        hoverable={false}
        className="overflow-hidden mb-10 !p-0"
      >
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-4 border-b border-[#E8E6F0] text-[10px] font-bold text-[#7A7A9A] uppercase tracking-widest bg-slate-50">
          <div className="col-span-2">Level Details</div>
          <div className="col-span-1 text-center">Members</div>
          <div className="col-span-1">Business Vol.</div>
          <div className="col-span-1 text-center">Comm. %</div>
          <div className="col-span-1">Your Commission</div>
        </div>

        {/* Table Rows */}
        <div className="flex flex-col">
          {dynamicLevelsData.map((row) => (
            <React.Fragment key={row.level}>
              <div 
                onClick={() => row.members > 0 && toggleRow(row.level)}
                className={clsx(
                  "grid grid-cols-1 md:grid-cols-6 gap-4 px-6 py-4 border-b border-[#E8E6F0] items-center transition-colors duration-200",
                  row.members > 0 ? 'hover:bg-[#FAF9FF] cursor-pointer' : 'hover:bg-[#FAF9FF]/40'
                )}
              >
                {/* Level Details */}
                <div className="col-span-2 flex items-center gap-4">
                  <div className={clsx(
                    "w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0",
                    row.isActive 
                      ? 'bg-[#FDE8FE] text-[#F310FD] border border-[#F310FD]/15' 
                      : 'bg-slate-100 text-slate-400'
                  )}>
                    {`L${row.level}`}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <p className={clsx("font-extrabold text-sm", row.isActive ? 'text-[#1A1A2E]' : 'text-[#7A7A9A]')}>
                        {`Level ${row.level}`}
                      </p>
                      {row.members > 0 && <ChevronRight size={14} className={clsx("text-slate-400 transition-transform", expandedRow === row.level ? 'rotate-90' : '')} />}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={clsx("h-full", row.isActive ? 'bg-[#F310FD]' : 'bg-slate-300')} 
                          style={{ width: `${Math.min((row.members / row.maxMembers) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-[#7A7A9A] font-medium">{row.members} / {row.maxMembers}</span>
                    </div>
                  </div>
                </div>

                {/* Members */}
                <div className="col-span-1 flex justify-start md:text-center md:justify-center items-center gap-1">
                  <span className="text-base font-extrabold text-[#1A1A2E]">{row.members}</span>
                  <span className="text-[10px] text-[#7A7A9A] mt-1 md:hidden font-semibold">members</span>
                </div>

                {/* Business Volume */}
                <div className="col-span-1">
                  <p className="text-sm font-extrabold text-[#1A1A2E] mb-0.5">${parseFloat(row.volume).toLocaleString()}</p>
                  {row.isActive ? (
                    <p className="text-[10px] text-[#10B981] bg-[#E8FBF1] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 font-bold border border-[#10B981]/15">Unlocked</p>
                  ) : (
                    <p className="text-[10px] text-[#7A7A9A] bg-slate-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1.5 font-bold border border-[#E8E6F0]" title={`Requires $${row.reqVol} Personal Staking & ${row.reqDirects} Direct Referrals`}>
                      <Lock size={10} /> Locked (Need {row.reqDirects} Dir & ${row.reqVol})
                    </p>
                  )}
                </div>

                {/* Comm % */}
                <div className="col-span-1 md:text-center text-sm font-bold text-[#7A7A9A]">
                  <span>{row.commPercent}%</span>
                </div>

                {/* Your Commission */}
                <div className="col-span-1">
                  <p className={clsx("text-sm font-extrabold mb-0.5", parseFloat(row.commEarned) > 0 ? 'text-[#10B981]' : 'text-slate-300')}>
                    ${row.commEarned}
                  </p>
                  <p className="text-[10px] text-[#7A7A9A] hidden md:block">Level earnings</p>
                </div>
              </div>

              {/* Expandable Content for Direct Partners */}
              <AnimatePresence>
                {expandedRow === row.level && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-[#FAF9FF]/40 border-b border-[#E8E6F0]"
                  >
                    <div className="p-4 md:px-20">
                      <p className="text-xs font-bold text-[#7A7A9A] uppercase tracking-widest mb-3">Direct Partners in Level {row.level}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {row.partners.map((partner, i) => (
                          <div key={i} className="bg-white border border-[#E8E6F0] rounded-xl p-3 flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#FAF9FF] flex items-center justify-center text-[#F310FD] border border-[#F310FD]/15">
                                <User size={14} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#1A1A2E] leading-tight">{partner.name}</p>
                                <p className="text-[10px] text-[#7A7A9A] font-medium">{partner.id}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-[#7A7A9A] uppercase tracking-wider mb-0.5 font-bold">Staked Vol.</p>
                              <p className="text-xs font-bold text-[#F310FD]">${parseFloat(partner.vol).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </React.Fragment>
          ))}
        </div>
      </GlassCard>

      {/* Floating Bottom Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard 
          hoverable={true}
          className="p-6 flex flex-col items-start justify-center"
        >
          <span className="text-[10px] font-bold text-[#7A7A9A] uppercase tracking-wider mb-1">Total Active Network Members</span>
          <span className="text-2xl font-extrabold text-[#1A1A2E]">{totalMembers} Members</span>
        </GlassCard>
        
        <GlassCard 
          hoverable={true}
          className="p-6 flex flex-col items-start justify-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDE8FE]/30 rounded-full blur-2xl pointer-events-none"></div>
          <span className="text-[10px] font-bold text-[#F310FD] uppercase tracking-wider mb-1 relative z-10 flex items-center gap-1.5"><TrendingUp size={12}/> Total Business Volume</span>
          <span className="text-2xl font-extrabold text-[#1A1A2E] relative z-10">${parseFloat(totalBusiness).toLocaleString()}</span>
        </GlassCard>

        <GlassCard 
          hoverable={true}
          className="p-6 flex flex-col items-start justify-center relative overflow-hidden"
        >
          <span className="text-[10px] font-bold text-[#00D4AA] uppercase tracking-wider mb-1 relative z-10">Total Network Commission Earned</span>
          <span className="text-2xl font-extrabold text-[#00D4AA] relative z-10 tracking-tight">
            ${parseFloat(totalCommission).toLocaleString()}
          </span>
        </GlassCard>
      </div>

    </div>
  );
};

export default Downline;
