import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Users, AlertTriangle, CheckCircle2, 
  Lock, Coins, ArrowRight,
  Info, ShieldCheck, Database, XCircle, Clock,
  Wallet, Cpu, Layers, Gift
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../redux/slices/authSlice';
import api from '../api';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';
import StatCard from '../components/StatCard';
import ValidatedInput from '../components/ValidatedInput';

const getStatusBadge = (status) => {
  const lowerStatus = status?.toLowerCase() || '';
  if (lowerStatus === 'completed' || lowerStatus === 'approved' || lowerStatus === 'success') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8FBF1] text-[#10B981] border border-[#10B981]/15"><CheckCircle2 size={12} /> Completed</span>;
  } else if (lowerStatus === 'pending') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FAF9FF] text-[#F310FD] border border-[#F310FD]/15 animate-pulse"><Clock size={12} /> Pending</span>;
  } else if (lowerStatus === 'failed' || lowerStatus === 'rejected') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEE2E2] text-[#EF4444] border border-[#EF4444]/15"><XCircle size={12} /> Rejected</span>;
  }
  return null;
};

const Withdrawal = () => {
  const dispatch = useDispatch();
  const { profile, user, walletAddress: connectedWallet } = useSelector(state => state.auth);
  const currentUser = profile || user;

  const [activePackages, setActivePackages] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [history, setHistory] = useState([]);
  const [withdrawalPin, setWithdrawalPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalWithdrawn = history
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const totalPending = history
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    if (currentUser?.withdrawalWallet) {
      setWalletAddress(currentUser.withdrawalWallet);
    }
  }, [currentUser]);

  const dynamicSources = [
    { id: 'balance', name: 'Available Balance', balance: currentUser?.availableBalance || 0, icon: TrendingUp, color: '#F310FD', type: 'profit', locked: false },
    ...activePackages.map(pkg => {
      const isStakingActive = pkg.stakingEnabled || (pkg.isStaked && (!pkg.stakingEndDate || new Date(pkg.stakingEndDate) > new Date()));
      return {
        id: pkg._id,
        name: `SOS: ${pkg.packageId?.name || 'Package'}${isStakingActive ? ' (LOCKED)' : ''}`,
        balance: pkg.amount,
        icon: isStakingActive ? Lock : AlertTriangle,
        color: isStakingActive ? '#9CA3AF' : '#F23656',
        type: 'principal',
        userPackageId: pkg._id,
        locked: isStakingActive
      };
    })
  ];

  useEffect(() => {
    if (!selectedSource && dynamicSources.length > 0) {
      setSelectedSource(dynamicSources[0]);
    }
  }, [activePackages, currentUser, selectedSource]);

  useEffect(() => {
    if (selectedSource?.type === 'principal') {
      setAmount(selectedSource.balance);
    } else {
      setAmount('');
    }
  }, [selectedSource]);

  useEffect(() => {
    dispatch(fetchProfile());
    fetchHistory();
    fetchPackages();
  }, [dispatch]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/withdrawal/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await api.get('/package/my-packages');
      setActivePackages(res.data.filter(p => p.status === 'active'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUseMax = () => {
    setAmount(selectedSource?.balance || 0);
  };

  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!walletAddress) {
      toast.error('Please enter receiving USDT wallet address');
      return;
    }
    if (!withdrawalPin) {
      toast.error('Please enter your 6-digit withdrawal PIN');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        amount: Number(amount),
        walletAddress,
        withdrawalPin,
        type: selectedSource.type // 'profit' or 'principal'
      };

      if (selectedSource.type === 'principal') {
        payload.userPackageId = selectedSource.userPackageId;
      }

      const res = await api.post('/withdrawal/request', payload);
      toast.success(res.data.message || 'Withdrawal request submitted successfully!');
      setAmount('');
      setWithdrawalPin('');
      dispatch(fetchProfile());
      fetchHistory();
      fetchPackages();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 pt-4 px-4 sm:px-6 lg:px-8">
      
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A2E] mb-2">Withdrawal Center</h1>
          <p className="text-[#4A4A6A] text-sm font-medium">
            Withdraw trading ROI dividends, direct commission income, or principal packages.
          </p>
        </div>

        {/* Secure Release Badge */}
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#E8FBF1] text-[#10B981] border border-[#10B981]/15">
          <ShieldCheck size={14} /> SECURE RELEASING ACTIVE
        </span>
      </div>

      {/* 6 Stats Mini Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { 
            title: 'Available Balance', 
            value: currentUser?.availableBalance || 0, 
            icon: <TrendingUp size={18} />,
            iconColor: 'primary',
            onClick: () => {
              if (dynamicSources.length > 0) {
                setSelectedSource(dynamicSources[0]);
              }
            }
          },
          { title: 'Total Earnings', value: currentUser?.totalEarning || 0, icon: <TrendingUp size={18} />, iconColor: 'primary' },
          { title: 'Copy Trade ROI', value: currentUser?.miningIncome || 0, icon: <Cpu size={18} />, iconColor: 'secondary' },
          { 
            title: 'Principal Staked', 
            value: activePackages.reduce((acc, pkg) => acc + pkg.amount, 0), 
            icon: <Lock size={18} />, 
            iconColor: 'secondary',
            onClick: () => {
              if (dynamicSources.length > 1) {
                setSelectedSource(dynamicSources[1]);
              }
            }
          },
          { title: 'Level Income', value: currentUser?.levelIncome || 0, icon: <Layers size={18} />, iconColor: 'primary' },
          { title: 'Promotion Income', value: currentUser?.promotionalIncome || 0, icon: <Gift size={18} />, iconColor: 'secondary' },
        ].map((item, idx) => (
          <StatCard
            key={idx}
            label={item.title}
            value={item.value}
            format="currency"
            icon={item.icon}
            iconColor={item.iconColor}
            delay={idx * 0.05}
            onClick={item.onClick}
            className={clsx(
              "p-4 cursor-pointer",
              item.onClick ? "hover:border-[#F310FD]/30" : ""
            )}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Withdrawal Request Form */}
        <GlassCard 
          hoverable={false}
          className="lg:col-span-1 p-6 overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-2xl font-extrabold text-[#1A1A2E] mb-1">Withdrawal Request</h2>
            <p className="text-sm text-[#4A4A6A] font-medium mb-6">Request withdrawal from your available wallets</p>
            
            {/* Source Selection */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#4A4A6A] uppercase tracking-wider mb-3">Select Source</label>
              
              {/* Available Balance Source (Full Width) */}
              {dynamicSources.length > 0 && (() => {
                const source = dynamicSources[0];
                const isSelected = selectedSource?.id === source.id;
                const Icon = source.icon;
                return (
                  <button
                    key={source.id}
                    onClick={() => setSelectedSource(source)}
                    className={clsx(
                      "w-full relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 border cursor-pointer mb-3",
                      isSelected 
                        ? 'bg-[#F310FD]/5 border-[#F310FD] shadow-[0_4px_20px_rgba(243,16,253,0.06)]' 
                        : 'bg-white border-[#E8E6F0] hover:border-[#F310FD]/30 text-[#4A4A6A]'
                    )}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 text-[#10B981] font-bold text-[10px] bg-[#E8FBF1] border border-[#10B981]/15 px-2.5 py-0.5 rounded-full">Selected</span>
                    )}
                    <div className={clsx(
                      "w-10 h-10 rounded-xl flex items-center justify-center mb-2 border transition-all duration-300",
                      isSelected ? 'bg-white text-[#F310FD] border-[#F310FD]/15' : 'bg-slate-50 text-[#7A7A9A] border-[#E8E6F0]'
                    )}>
                      <Icon size={18} />
                    </div>
                    <span className={clsx("text-xs font-bold tracking-wider uppercase mb-1", isSelected ? 'text-[#1A1A2E]' : 'text-[#7A7A9A]')}>{source.name}</span>
                    <span className={clsx("text-2xl font-extrabold tracking-tight", isSelected ? 'text-[#F310FD]' : 'text-[#4A4A6A]')}>${Number(source.balance || 0).toFixed(3)}</span>
                  </button>
                );
              })()}

              {/* SOS Package Sources (Grid of 2 columns) */}
              {dynamicSources.length > 1 && (
                <div className="grid grid-cols-2 gap-3">
                  {dynamicSources.slice(1).map((source) => {
                    const isSelected = selectedSource?.id === source.id;
                    const Icon = source.icon;
                    const isLocked = source.locked;
                    return (
                      <button
                        key={source.id}
                        onClick={() => !isLocked && setSelectedSource(source)}
                        disabled={isLocked}
                        className={clsx(
                          "relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 border cursor-pointer",
                          isLocked
                            ? 'bg-slate-50 border-[#E8E6F0] cursor-not-allowed opacity-50 text-[#7A7A9A]'
                            : isSelected 
                              ? 'bg-[#F310FD]/5 border-[#F310FD] shadow-[0_4px_20px_rgba(243,16,253,0.06)]' 
                              : 'bg-white border-[#E8E6F0] hover:border-[#F310FD]/30 text-[#4A4A6A]'
                        )}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#F310FD]"></span>
                        )}
                        <div className={clsx(
                          "w-10 h-10 rounded-xl flex items-center justify-center mb-2 border transition-all duration-300",
                          isLocked 
                            ? 'bg-slate-50 text-slate-350 border-[#E8E6F0]' 
                            : isSelected 
                              ? 'bg-white text-[#F310FD] border-[#F310FD]/15' 
                              : 'bg-slate-50 text-[#7A7A9A] border-[#E8E6F0]'
                        )}>
                          <Icon size={18} />
                        </div>
                        <span className={clsx(
                          "text-[10px] font-bold text-center tracking-wider uppercase mb-1 truncate w-full",
                          isLocked ? 'text-slate-350' : isSelected ? 'text-[#1A1A2E]' : 'text-[#7A7A9A]'
                        )}>{source.name}</span>
                        <span className={clsx(
                          "text-sm font-bold tracking-tight",
                          isLocked ? 'text-slate-350' : isSelected ? 'text-[#F310FD]' : 'text-[#4A4A6A]'
                        )}>${Number(source.balance || 0).toFixed(3)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-[#E8E6F0] my-6"></div>

            {/* Amount Input */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#4A4A6A] uppercase tracking-wider">Withdrawal Amount (USD)</label>
                {selectedSource?.type !== 'principal' && (
                  <button 
                    onClick={handleUseMax}
                    className="text-[11px] px-2.5 py-1 bg-[#FAF9FF] text-[#F310FD] rounded-xl font-bold border border-[#F310FD]/15 transition-all shadow-sm cursor-pointer hover:bg-[#F310FD]/10"
                  >
                    Use Max: ${Number(selectedSource?.balance || 0).toFixed(3)}
                  </button>
                )}
              </div>
              <ValidatedInput 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={selectedSource?.type === 'principal'}
                className={selectedSource?.type === 'principal' ? 'bg-slate-50 text-[#EF4444] font-bold' : ''}
              />
              <div className="flex justify-between text-[11px] mt-2 font-medium font-sans">
                {selectedSource?.type === 'principal' ? (
                  <span className="text-[#EF4444] font-semibold">★ Full package capital must be withdrawn.</span>
                ) : (
                  <>
                    <span className="text-[#7A7A9A]">Minimum: $10</span>
                    <span className="text-[#F310FD] font-bold">Available: ${Number(selectedSource?.balance || 0).toFixed(3)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Receiving Wallet */}
            <div className="mb-6">
              <ValidatedInput 
                label="Receiving Wallet Address (USDT BEP-20)"
                type="text" 
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                disabled={!!currentUser?.withdrawalWallet}
                className={currentUser?.withdrawalWallet ? 'bg-slate-50 text-[#4A4A6A] font-mono text-sm' : 'font-mono text-sm'}
              />
              <span className="text-[10px] text-[#7A7A9A] mt-1.5 block leading-normal font-semibold font-sans">
                {currentUser?.withdrawalWallet 
                  ? "★ Receiver address is locked. To modify it, please contact support/admin." 
                  : "★ Important: Once submitted, this wallet address will be locked to your account."
                }
              </span>
            </div>

            {/* Withdrawal PIN */}
            <div className="mb-6">
              <ValidatedInput 
                label={currentUser?.withdrawalPin ? "Enter 6-digit Withdrawal PIN" : "Set 6-digit Withdrawal PIN (First-time setup)"}
                type="password" 
                maxLength={6}
                placeholder="******"
                value={withdrawalPin}
                onChange={(e) => setWithdrawalPin(e.target.value.replace(/\D/g, ''))}
                className="font-mono tracking-widest text-center"
              />
            </div>

            {/* Withdrawal Method */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#4A4A6A] uppercase tracking-wider mb-2">Withdrawal Method</label>
              <div className="flex items-center justify-between bg-[#FAF9FF] border border-[#E8E6F0] rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-[#E8E6F0] text-[#F310FD] shrink-0">
                    <Coins size={16} />
                  </div>
                  <div>
                    <p className="text-[#1A1A2E] text-sm font-bold">USDT</p>
                    <p className="text-[10px] text-[#7A7A9A] font-bold tracking-wide uppercase">BEP-20 Network</p>
                  </div>
                </div>
                <CheckCircle2 size={18} className="text-[#10B981]" />
              </div>
            </div>

            {/* Fee Alert */}
            <div className="bg-[#FFF6E8] border border-[#F59E0B]/15 rounded-xl p-4 mb-6">
              <div className="flex gap-3 mb-2">
                <Info className="text-[#D97706] shrink-0 mt-0.5" size={16} />
                <h4 className="text-xs font-bold text-[#D97706] uppercase tracking-wider">Deduction Policy</h4>
              </div>
              <ul className="text-[11px] text-[#D97706]/90 space-y-2 pl-7 list-disc leading-normal font-semibold font-sans">
                <li>A <strong className="text-[#D97706] font-bold">10% releasing reserve</strong> is applied to every withdrawal.</li>
                <li>For Principal withdrawals, a <strong className="text-[#D97706] font-bold">20% processing deduction</strong> applies.</li>
              </ul>
            </div>

            {/* Calculation Preview */}
            {(Number(amount) || 0) > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                <h4 className="text-xs font-bold text-[#4A4A6A] uppercase tracking-wider mb-3">Estimated Settlement</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#7A7A9A] font-semibold font-sans">
                    <span>Requested Amount:</span>
                    <span className="font-bold text-[#1A1A2E]">${(Number(amount) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#EF4444] font-semibold font-sans">
                    <span>Deduction ({selectedSource?.type === 'principal' ? 20 : 10}%):</span>
                    <span className="font-bold">-${((Number(amount) || 0) * (selectedSource?.type === 'principal' ? 20 : 10) / 100).toFixed(2)}</span>
                  </div>
                  <div className="h-[1px] bg-slate-200 my-2"></div>
                  <div className="flex justify-between text-[#00D4AA] font-bold text-sm font-sans">
                    <span>You Receive:</span>
                    <span>${((Number(amount) || 0) * (1 - (selectedSource?.type === 'principal' ? 0.20 : 0.10))).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <PremiumButton
              variant="primary"
              onClick={handleWithdraw}
              disabled={isSubmitting}
              className="w-full py-4 text-center justify-center shadow-[0_8px_25px_rgba(243,16,253,0.15)] mb-4"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>Submit Withdrawal Request <ArrowRight size={18} /></>
              )}
            </PremiumButton>
            
            <div className="flex items-center justify-center gap-2 mt-2">
              <ShieldCheck size={14} className="text-[#10B981]" />
              <p className="text-[11px] text-[#10B981] font-bold tracking-wide">
                Secure Transaction • Processed within 24-48 hours
              </p>
            </div>
          </div>
        </GlassCard>
        
        {/* Right Column: History & Summary */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Withdrawal History Table */}
          <GlassCard 
            hoverable={false}
            className="flex-1 p-6 flex flex-col overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div>
                <h2 className="text-xl font-extrabold text-[#1A1A2E] mb-1">Withdrawal History</h2>
                <p className="text-sm text-[#4A4A6A] font-medium">Track all your withdrawal requests</p>
              </div>
              <PremiumButton 
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                className="py-1.5 px-3 text-xs"
              >
                Toggle View
              </PremiumButton>
            </div>
            
            {/* Table Header */}
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-6 gap-4 border-b border-[#E8E6F0] pb-3 text-[10px] font-bold text-[#7A7A9A] uppercase tracking-widest px-2 relative z-10">
                  <div className="col-span-1">Source / Wallet</div>
                  <div className="col-span-1 text-center">Amount</div>
                  <div className="col-span-1 text-center">Date</div>
                  <div className="col-span-1 text-center">Method</div>
                  <div className="col-span-1 text-center">Status</div>
                  <div className="col-span-1 text-right">Action</div>
                </div>
 
                {/* Table Content */}
                <div className="flex-1 flex flex-col relative z-10">
                  {history.length > 0 ? (
                    <div className="flex flex-col gap-1 py-2">
                      {history.map((row, i) => (
                        <div key={i} className="grid grid-cols-6 gap-4 py-4 px-2 hover:bg-[#FAF9FF] rounded-xl items-center border-b border-[#F0EEF6] transition-colors">
                          <div className="col-span-1 flex flex-col justify-center">
                            <span className="text-sm text-[#1A1A2E] font-bold capitalize">
                              {row.type === 'principal' ? 'SOS Capital' : 'Available Balance'}
                            </span>
                            <span className="text-[10px] text-[#7A7A9A] font-mono mt-0.5 select-all truncate" title={row.walletAddress}>
                              {row.walletAddress ? `${row.walletAddress.substring(0, 6)}...${row.walletAddress.substring(row.walletAddress.length - 4)}` : 'N/A'}
                            </span>
                          </div>
                          <div className="col-span-1 text-center text-sm font-extrabold text-[#1A1A2E]">${row.amount}</div>
                          <div className="col-span-1 text-center text-sm text-[#4A4A6A] font-medium">{new Date(row.createdAt).toLocaleDateString()}</div>
                          <div className="col-span-1 text-center flex justify-center">
                            <span className="inline-block px-2.5 py-1 text-[11px] text-[#F310FD] font-bold bg-[#F310FD]/5 border border-[#F310FD]/15 rounded-full uppercase">USDT</span>
                          </div>
                          <div className="col-span-1 text-center flex justify-center">
                            {getStatusBadge(row.status === 'pending' ? 'Pending' : row.status === 'approved' ? 'Completed' : 'Rejected')}
                          </div>
                          <div className="col-span-1 text-right">
                            <span className="text-[11px] font-bold text-[#7A7A9A]">Deduct: ${row.deduction}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 opacity-85">
                      <div className="relative mb-4">
                        <div className="w-20 h-20 rounded-full bg-[#FAF9FF] border border-[#E8E6F0] flex items-center justify-center relative z-10 shadow-sm text-[#F310FD]">
                          <Database size={36} />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">No Transactions Yet</h3>
                      <p className="text-sm text-[#4A4A6A] mb-6 text-center max-w-sm font-medium">
                        You haven't made any withdrawal requests. Your transaction history will populate here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
 
            <div className="border-t border-[#E8E6F0] pt-4 flex justify-between items-center mt-auto relative z-10">
              <span className="text-xs text-[#7A7A9A] font-bold">Showing {history.length} withdrawals</span>
              <div className="flex gap-2">
                <PremiumButton variant="outline" className="py-1 px-3 text-xs">Previous</PremiumButton>
                <PremiumButton variant="primary" className="py-1 px-3 text-xs">1</PremiumButton>
                <PremiumButton variant="outline" className="py-1 px-3 text-xs">Next</PremiumButton>
              </div>
            </div>
          </GlassCard>
 
          {/* Bottom Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard 
              hoverable={true}
              className="p-5 flex justify-between items-center"
            >
              <div>
                <h3 className="text-[#1A1A2E] font-bold text-sm">Total Withdrawn</h3>
                <p className="text-xs text-[#7A7A9A] mt-1 font-semibold">All Time</p>
              </div>
              <span className="text-2xl font-extrabold text-[#00D4AA]">$ {totalWithdrawn.toFixed(2)}</span>
            </GlassCard>
            
            <GlassCard 
              hoverable={true}
              className="p-5 flex justify-between items-center"
            >
              <div>
                <h3 className="text-[#1A1A2E] font-bold text-sm">Pending</h3>
                <p className="text-xs text-[#7A7A9A] mt-1 font-semibold">Awaiting Processing</p>
              </div>
              <span className="text-2xl font-extrabold text-[#FF6B35]">$ {totalPending.toFixed(2)}</span>
            </GlassCard>
 
            <GlassCard 
              hoverable={true}
              className="p-5 flex justify-between items-center"
            >
              <div>
                <h3 className="text-[#1A1A2E] font-bold text-sm">Withdrawal Fee</h3>
                <p className="text-xs text-[#7A7A9A] mt-1 font-semibold">Standard Charge</p>
              </div>
              <span className="text-2xl font-extrabold text-[#F310FD]">10%</span>
            </GlassCard>
          </div>
 
        </div>
      </div>
 
    </div>
  );
};

export default Withdrawal;
