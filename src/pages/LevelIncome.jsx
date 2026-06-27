import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Layers, ChevronDown, ChevronRight, User, TrendingUp,
  Lock, Info, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../api';
import clsx from 'clsx';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';
import StatCard from '../components/StatCard';
import ValidatedInput from '../components/ValidatedInput';

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

const getLevelStatus = (levelIndex, userStaking, activeDirects, manualLevelQualified = 0) => {
  if (manualLevelQualified && (levelIndex + 1) <= manualLevelQualified) {
    return {
      status: "active",
      badge: "Active",
      color: "emerald"
    };
  }

  const requirement = LEVEL_REQUIREMENTS[levelIndex] || { staking: 0, directs: 0 };
  const hasStaking = userStaking >= requirement.staking;
  const hasDirects = activeDirects >= requirement.directs;

  if (hasStaking && hasDirects) {
    return {
      status: "active",
      badge: "Active",
      color: "emerald"
    };
  }

  return {
    status: "locked",
    badge: `Locked (Need ${requirement.staking}$ & ${requirement.directs} dir)`,
    color: "ink-500"
  };
};

const Counter = ({ value, prefix, suffix }) => {
  const [count, setCount] = useState(0);
  const isFloat = value % 1 !== 0;

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    if (start === end) return;

    let totalMilSecDur = 1500;
    const step = end / 60; 

    let timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{isFloat ? count.toFixed(3) : Math.floor(count).toLocaleString()}{suffix}</span>;
};

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

const LevelIncome = () => {
  const { user, profile } = useSelector((state) => state.auth);
  const currentUser = profile || user;

  const [levelIncomeData, setLevelIncomeData] = useState([]);
  const [expandedLevel, setExpandedLevel] = useState(null);
  const [teamByLevel, setTeamByLevel] = useState([]);
  const [directTeam, setDirectTeam] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incomeRes, teamRes] = await Promise.all([
          api.get('/user/level-income'),
          api.get('/user/team')
        ]);
        setLevelIncomeData(incomeRes.data || []);
        
        setDirectTeam(teamRes.data.directTeam || []);
        
        const levels = Array.from({ length: 30 }, (_, index) => {
          const lvl = index + 1;
          const membersAtThisLvl = (teamRes.data.allLevels || []).filter(m => m.level === lvl) || [];
          const actualMembers = lvl === 1 ? (teamRes.data.directTeam || []) : membersAtThisLvl;
          return {
            level: lvl,
            members: actualMembers
          };
        });
        setTeamByLevel(levels);
      } catch (err) {
        console.error('Failed to fetch level income data', err);
      }
    };
    fetchData();
  }, []);

  const totalEarnings = levelIncomeData.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalNetworkMembers = teamByLevel.reduce((sum, item) => sum + item.members.length, 0);

  const activeDirectsCount = directTeam.filter(member => member.status === 'active' || member.totalInvestment > 0).length;
  const userStaking = currentUser?.totalInvestment || 0;

  const getLevelBadgeClass = (lvl) => {
    return 'bg-[#FDE8FE] border-[#F310FD]/15 text-[#F310FD] rounded-full';
  };

  const toggleLevel = (lvl) => {
    setExpandedLevel(expandedLevel === lvl ? null : lvl);
  };

  const dynamicStats = [
    { title: 'Total Level Income', value: totalEarnings, prefix: '$', suffix: '', icon: Layers },
    { title: 'Total Network Members', value: totalNetworkMembers, prefix: '', suffix: '', icon: Users },
    { title: 'Active Levels', value: 0, prefix: '', suffix: '', icon: TrendingUp, isProgress: true }
  ];

  const dynamicLevelData = teamByLevel.map((lvl) => {
    const levelStatus = getLevelStatus(lvl.level - 1, userStaking, activeDirectsCount, currentUser?.manualLevelQualified);
    const isUnlocked = levelStatus.status === 'active';
    const reqs = LEVEL_REQUIREMENTS[lvl.level - 1] || { staking: 0, directs: 0 };

    const totalLevelIncomeSum = levelIncomeData
      .filter(income => income.level === lvl.level)
      .reduce((sum, item) => sum + (item.amount || 0), 0)
      .toFixed(2);

    return {
      level: lvl.level,
      members: lvl.members.length,
      income: totalLevelIncomeSum,
      bonusPercent: LEVEL_PERCENTAGES[lvl.level - 1] || 0,
      isLocked: !isUnlocked,
      badgeText: levelStatus.badge,
      badgeColor: levelStatus.color,
      reqDirects: reqs.directs,
      reqVol: reqs.staking,
      users: lvl.members.map(member => {
        const earnedFromMember = levelIncomeData
          .filter(income => income.fromUser && income.fromUser._id === member._id)
          .reduce((sum, item) => sum + item.amount, 0);

        return {
          name: member.fullName,
          id: member.userId,
          vol: member.totalInvestment || 0,
          earned: earnedFromMember > 0 ? earnedFromMember.toFixed(3) : '0.000'
        };
      })
    };
  });

  const activeLevels = dynamicLevelData.filter(l => !l.isLocked).length;
  dynamicStats[2].value = activeLevels;

  return (
    <div className="max-w-7xl mx-auto pb-12 pt-4 px-4 sm:px-6 lg:px-8 min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1A1A2E] mb-2 tracking-tight">Level Income</h1>
        <p className="text-[#4A4A6A] text-sm font-medium">
          View your income generated from your network levels.
        </p>
      </div>

      {/* Volume Warning Alert */}
      <div className="mb-6 bg-[#FFF5F5] border border-[#FF6B35]/15 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#FF6B35]/20">
            <AlertTriangle size={18} className="text-[#FF6B35]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#FF6B35] uppercase tracking-widest mb-0.5">Attention Required</p>
            <p className="text-sm font-bold text-[#1A1A2E] leading-normal">
              You have not met the <span className="font-extrabold text-[#FF6B35]">10% monthly business volume</span> required for salary and bonus eligibility.
            </p>
          </div>
        </div>
        <div className="text-right hidden md:block w-[180px]">
          <p className="text-[10px] text-[#7A7A9A] uppercase tracking-widest mb-1 font-bold">Current Status</p>
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#FF6B35] w-[0%]"></div>
            </div>
            <span className="text-xs font-extrabold text-[#FF6B35]">0%</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {dynamicStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <GlassCard 
              key={idx}
              hoverable={true}
              className="p-6 flex flex-col justify-between"
            >
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FDE8FE] border border-[#F310FD]/15 flex items-center justify-center text-[#F310FD] shrink-0">
                      <Icon size={20} />
                    </div>
                    <p className="text-[11px] font-extrabold text-[#7A7A9A] uppercase tracking-wider">{stat.title}</p>
                  </div>
                  <p className="text-3xl font-extrabold text-[#1A1A2E] tracking-tight leading-none">
                    {stat.isProgress ? (
                      stat.value
                    ) : (
                      <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                    )}
                  </p>
                </div>

                {stat.isProgress && (
                  <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-[#E8E6F0]">
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#1A1A2E]">Unlocked</p>
                      <p className="text-[9px] text-[#7A7A9A] uppercase tracking-wider">Out of 30</p>
                    </div>
                    <CircularProgress progress={stat.value} label={stat.value} total={30} />
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Level Income Breakdown */}
      <div>
        <h3 className="text-xl font-extrabold text-[#1A1A2E] mb-6">
          Level Income Breakdown
        </h3>

        <div className="flex flex-col gap-4">
          {dynamicLevelData.map((data) => (
            <div 
              key={data.level}
              className={clsx(
                "border rounded-xl overflow-hidden transition-all duration-300",
                data.isLocked 
                  ? 'bg-[#FAF9FF]/40 border-[#E8E6F0] opacity-75' 
                  : 'bg-white border-[#E8E6F0] shadow-sm hover:border-[#F310FD]/15 hover:shadow-md'
              )}
            >
              {/* Accordion Header */}
              <button 
                onClick={() => !data.isLocked && toggleLevel(data.level)}
                disabled={data.isLocked}
                className={clsx(
                  "w-full flex flex-col md:flex-row items-start md:items-center justify-between p-5 transition-colors group",
                  !data.isLocked ? 'hover:bg-[#FAF9FF] cursor-pointer' : ''
                )}
              >
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                  <div className={clsx(
                    "px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2",
                    data.isLocked ? 'bg-slate-100 border-[#E8E6F0] text-slate-400' : 'bg-[#FDE8FE] border-[#F310FD]/15 text-[#F310FD]'
                  )}>
                    Level {data.level}
                    {data.isLocked && <Lock size={12} className="text-slate-400" />}
                  </div>
                  
                  <span className={clsx("text-sm font-extrabold", data.isLocked ? 'text-slate-400' : 'text-[#7A7A9A]')}>
                    {data.members} Members
                  </span>
                </div>
                
                <div className="flex items-center justify-between w-full md:w-auto gap-6">
                  {data.isLocked ? (
                    <div className="relative flex items-center gap-1.5 text-[10px] text-[#7A7A9A] uppercase tracking-widest font-bold border border-[#E8E6F0] bg-slate-50 px-2.5 py-1 rounded-full">
                      <Lock size={10} className="text-slate-400" />
                      <span>Locked (Need ${data.reqVol} & {data.reqDirects} dir)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-6">
                      <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] text-[#7A7A9A] uppercase tracking-wider font-extrabold">Bonus Target</span>
                        <span className="text-sm font-bold text-[#4A4A6A]">{data.bonusPercent}%</span>
                      </div>
                      <span className="text-xl font-extrabold text-[#00D4AA]">
                        ${data.income}
                      </span>
                    </div>
                  )}
                  
                  {!data.isLocked && (
                    <div className={clsx("text-slate-400 transition-transform duration-300", expandedLevel === data.level ? 'rotate-180' : '')}>
                      <ChevronDown size={20} />
                    </div>
                  )}
                </div>
              </button>

              {/* Accordion Content */}
              <AnimatePresence>
                {expandedLevel === data.level && !data.isLocked && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-[#FAF9FF]/40 border-t border-[#E8E6F0]"
                  >
                    <div className="p-6">
                      
                      {/* Sub-table Header */}
                      <div className="grid grid-cols-4 gap-4 pb-3 border-b border-[#E8E6F0] text-[10px] font-bold text-[#7A7A9A] uppercase tracking-wider mb-3 px-2">
                        <div className="col-span-2">Contributing Member</div>
                        <div className="col-span-1 text-right">Business Vol.</div>
                        <div className="col-span-1 text-right">Income Earned</div>
                      </div>
                      
                      {/* Sub-table Rows */}
                      <div className="flex flex-col gap-2">
                        {data.users.map((user, i) => (
                          <div key={i} className="grid grid-cols-4 gap-4 items-center p-3 rounded-xl bg-white border border-[#E8E6F0] shadow-sm hover:border-[#F310FD]/15 transition-colors duration-200">
                            <div className="col-span-2 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#FAF9FF] flex items-center justify-center border border-[#F310FD]/15">
                                <User size={14} className="text-[#F310FD]" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#1A1A2E] leading-tight">{user.name}</p>
                                <p className="text-[10px] text-[#7A7A9A] font-mono font-medium">{user.id}</p>
                              </div>
                            </div>
                            <div className="col-span-1 text-right text-xs font-bold text-[#4A4A6A]">
                              ${user.vol}
                            </div>
                            <div className="col-span-1 text-right text-sm font-extrabold text-[#10B981]">
                              +${user.earned}
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Notes */}
      <div className="mt-12 text-center border-t border-[#E8E6F0] pt-8">
        <p className="text-xs text-[#7A7A9A] font-bold flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-[#10B981]" />
          Level bonuses are distributed as per the package profit percentage structure.
        </p>
      </div>

    </div>
  );
};

export default LevelIncome;
