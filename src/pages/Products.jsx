import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ShieldCheck, Zap, Star, ChevronRight, CheckCircle2, Lock, Clock, Activity, X, AlertCircle, CreditCard, Copy, Check } from 'lucide-react';
import { ethers } from 'ethers';
import api from '../api';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { fetchProfile } from '../redux/slices/authSlice';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';
import ValidatedInput from '../components/ValidatedInput';
import clsx from 'clsx';

const packages = [
  {
    id: 1,
    name: 'Package 1',
    investment: '$100 – $1,000',
    minInvestment: 100,
    maxInvestment: 1000,
    profit: '0.5%',
    duration: 'every 12 hours',
    description: 'You will receive as long as your live account remains active.',
    icon: TrendingUp,
    glowClass: 'shadow-[0_0_20px_rgba(0,198,255,0.2)] hover:shadow-[0_0_30px_rgba(0,198,255,0.4)]',
    borderClass: 'border-[#00C6FF]/30',
    iconBgClass: 'bg-[#00C6FF]/10',
    iconTextClass: 'text-[#00C6FF]',
    isPremium: false,
  },
  {
    id: 2,
    name: 'Package 2',
    investment: '$1,500 – $5,000',
    minInvestment: 1500,
    maxInvestment: 5000,
    profit: '0.6%',
    duration: 'every 12 hours',
    description: 'You will receive as long as your live account remains active.',
    icon: ShieldCheck,
    glowClass: 'shadow-[0_0_20px_rgba(127,0,255,0.2)] hover:shadow-[0_0_30px_rgba(127,0,255,0.4)]',
    borderClass: 'border-[#7F00FF]/30',
    iconBgClass: 'bg-[#7F00FF]/10',
    iconTextClass: 'text-[#7F00FF]',
    isPremium: false,
  },
  {
    id: 3,
    name: 'Package 3',
    investment: '$10,000 – $25,000',
    minInvestment: 10000,
    maxInvestment: 25000,
    profit: '0.7%',
    duration: 'every 12 hours',
    description: 'You will receive as long as your live account remains active.',
    icon: Zap,
    glowClass: 'shadow-[0_0_30px_rgba(160,32,240,0.4)] hover:shadow-[0_0_50px_rgba(255,0,255,0.6)] animate-pulse-slow',
    borderClass: 'border-[#FF00FF]/50',
    iconBgClass: 'bg-[#FF00FF]/10',
    iconTextClass: 'text-[#FF00FF]',
    isPremium: true,
  },
  {
    id: 4,
    name: 'Package 4',
    investment: '$50,000',
    minInvestment: 50000,
    maxInvestment: 50000,
    profit: '0.8%',
    duration: 'every 12 hours',
    description: 'You will receive as long as your live account remains active.',
    icon: Star,
    glowClass: 'shadow-[0_0_30px_rgba(255,0,255,0.5)] hover:shadow-[0_0_60px_rgba(255,0,255,0.8)] animate-pulse',
    borderClass: 'border-[#FF00FF]/60',
    iconBgClass: 'bg-[#FF00FF]/20',
    iconTextClass: 'text-[#FF00FF]',
    isPremium: true,
  },
  {
    id: 5,
    name: 'Referral Package',
    investment: '$20',
    minInvestment: 20,
    maxInvestment: 20,
    profit: '0.25%',
    duration: 'daily',
    description: 'Exclusive package for referred members. (Monday–Friday active earnings).',
    icon: Star,
    glowClass: 'shadow-[0_0_20px_rgba(255,165,0,0.4)] hover:shadow-[0_0_40px_rgba(255,165,0,0.6)] animate-pulse-slow',
    borderClass: 'border-orange-500/50',
    iconBgClass: 'bg-orange-500/10',
    iconTextClass: 'text-orange-500',
    isPremium: false,
  },
  {
    id: 6,
    name: 'Land Security Package',
    investment: '$5,000 – $50,000',
    minInvestment: 5000,
    maxInvestment: 50000,
    profit: '0.25%',
    duration: 'every 12 hours',
    description: 'Special premium package designed for higher capital growth with stable returns.',
    icon: ShieldCheck,
    glowClass: 'shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:shadow-[0_0_50px_rgba(251,191,36,0.5)] animate-pulse-slow',
    borderClass: 'border-amber-500/40',
    iconBgClass: 'bg-amber-500/10',
    iconTextClass: 'text-amber-500',
    isPremium: true,
  }
];

const Products = () => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [dbPackages, setDbPackages] = useState([]);
  const [txHash, setTxHash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('metamask'); // 'metamask' or 'manual'
  const [networkType, setNetworkType] = useState('Bep20'); // 'Bep20' or 'TRC 20'
  const [senderAddress, setSenderAddress] = useState('');
  const [depositAddresses, setDepositAddresses] = useState({
    depositAddressMetaMask: '0x185018c5f26B2cE105e0B80b231178CE5913b621',
    depositAddressBep20: '0x8e4143b46eb1e1a6cbd71b5d57da95b985219f0b',
    depositAddressTrc20: 'TWJjGZJ73Q9x2hWpLRRreaxyvR9Eveoiv5'
  });
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchDepositAddresses = async () => {
      try {
        const res = await api.get('/user/deposit-addresses');
        setDepositAddresses(res.data);
      } catch (err) {
        console.error('Failed to fetch deposit addresses:', err);
      }
    };
    fetchDepositAddresses();
  }, []);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await api.get('/package/all');
        if (res.data.length > 0) {
          setDbPackages(res.data);
        } else {
          setDbPackages(packages.map((p, i) => ({ ...p, _id: `temp_${i}` }))); // Fallback for UI if db empty
        }
      } catch (err) {
        console.error('Failed to fetch packages:', err);
        setDbPackages(packages.map((p, i) => ({ ...p, _id: `temp_${i}` })));
      }
    };
    fetchPackages();
  }, []);

  const connectWalletAndPay = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      return;
    }

    try {
      setIsProcessing(true);

      // 1. Connect to MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      // 2. Switch to Binance Smart Chain (Mainnet: 56, Testnet: 97)
      const targetChainId = '0x38'; // 56 in hex
      const chainId = await provider.send('eth_chainId', []);

      if (chainId !== targetChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: targetChainId,
                  chainName: 'Binance Smart Chain',
                  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
                  rpcUrls: ['https://bsc-dataseed.binance.org/'],
                  blockExplorerUrls: ['https://bscscan.com/'],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      // 3. Send USDT
      const USDT_CONTRACT = "0x55d398326f99059fF775485246999027B3197955";
      const ADMIN_WALLET = depositAddresses.depositAddressMetaMask || "0x185018c5f26B2cE105e0B80b231178CE5913b621"; 

      const abi = [
        "function transfer(address to, uint256 amount) public returns (bool)",
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];
      const usdtContract = new ethers.Contract(USDT_CONTRACT, abi, signer);

      // Check USDT balance and BNB balance (for gas)
      const userAddress = await signer.getAddress();
      const [balance, decimals, bnbBalance] = await Promise.all([
        usdtContract.balanceOf(userAddress),
        usdtContract.decimals(),
        provider.getBalance(userAddress)
      ]);

      const amount = ethers.parseUnits(investmentAmount.toString(), decimals);

      // Require at least a tiny bit of BNB for gas (e.g., 0.0005 BNB is usually enough for a simple transfer, but we'll check if it's strictly > 0)
      if (bnbBalance === 0n) {
        throw new Error("Insufficient BNB for gas fees. You must have some BNB in your wallet to cover the Binance Smart Chain transaction fee.");
      }

      if (balance < amount) {
        const readableBalance = ethers.formatUnits(balance, decimals);
        throw new Error(`Insufficient USDT balance. You have ${readableBalance} USDT, but need ${investmentAmount} USDT.`);
      }

      toast.info("Please confirm the transaction in MetaMask...");
      const tx = await usdtContract.transfer(ADMIN_WALLET, amount);

      toast.info("Transaction sent! Waiting for confirmation...");
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        // 4. Send TxHash to Backend
        const response = await api.post('/package/buy', {
          packageId: selectedPackage._id || selectedPackage.id,
          amount: Number(investmentAmount),
          txHash: tx.hash,
          senderAddress: userAddress, // Security requirement: matching sender
        });

        toast.success(response.data.message || 'Package Activated Successfully!');
        dispatch(fetchProfile());
        setSelectedPackage(null);
      } else {
        throw new Error("Transaction failed on-chain");
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.reason || error.message || "Payment failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const submitManualPurchase = async () => {
    if (!txHash) {
      toast.error('Transaction Hash is required for manual purchase verification.');
      return;
    }

    try {
      setIsProcessing(true);
      const response = await api.post('/package/manual-buy', {
        packageId: selectedPackage._id || selectedPackage.id,
        amount: Number(investmentAmount),
        txHash,
        networkType,
        senderAddress,
      });

      toast.success(response.data.message || 'Manual purchase request submitted successfully!');
      setSelectedPackage(null);
      setTxHash('');
      setSenderAddress('');
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to submit request. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setInvestmentAmount(pkg.minInvestment);
    setAmountError('');
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setInvestmentAmount(val);
    const num = Number(val);

    if (!val) {
      setAmountError('Investment amount is required');
    } else if (num < selectedPackage.minInvestment) {
      setAmountError(`Minimum investment is $${selectedPackage.minInvestment.toLocaleString()}`);
    } else if (num > selectedPackage.maxInvestment) {
      setAmountError(`Maximum investment is $${selectedPackage.maxInvestment.toLocaleString()}`);
    } else {
      setAmountError('');
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Header Section */}
      <div className="text-center mb-12 relative py-8 overflow-hidden rounded-[24px] bg-white border border-[#E8E6F0] px-4 md:px-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F310FD]/5 rounded-full blur-[70px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00D4AA]/5 rounded-full blur-[70px] animate-pulse"></div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#F310FD] to-[#00D4AA] mb-4 tracking-tight leading-tight"
        >
          Premium Trading Packages
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-[#4A4A6A] text-sm md:text-base max-w-2xl mx-auto font-medium"
        >
          Select a structured financial growth opportunity that aligns with your goals.
        </motion.p>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
        {[...dbPackages]
          .sort((a, b) => {
            const getOrder = (name) => {
              const lower = name.toLowerCase();
              if (lower === 'package') return 0;
              if (lower.includes('package 1') || lower.includes('100 package')) return 1;
              if (lower.includes('package 2') || lower.includes('500 package')) return 2;
              if (lower.includes('package 3')) return 3;
              if (lower.includes('package 4')) return 4;
              if (lower.includes('land security')) return 5;
              if (lower.includes('referral')) return 6;
              return 99;
            };
            return getOrder(a.name) - getOrder(b.name);
          })
          .map((pkgDb, idx) => {
            let uiConfig = packages.find(p => p.name.toLowerCase() === pkgDb.name.toLowerCase());
            if (!uiConfig) {
              if (pkgDb.name.toLowerCase() === 'package') {
                uiConfig = {
                  name: 'Package',
                  icon: TrendingUp,
                  glowClass: 'shadow-sm',
                  borderClass: 'border-border-subtle',
                  iconBgClass: 'bg-brand-50',
                  iconTextClass: 'text-brand-600',
                  isPremium: false,
                  description: 'Investment package for 0-Pin members.'
                };
              } else {
                uiConfig = packages[idx % packages.length];
              }
            }
          
          const isReferral = pkgDb.isReferralOnly || pkgDb.name.toLowerCase().includes('referral');
          const profitDisplay = isReferral 
            ? `${pkgDb.dailyProfit}%` 
            : `${(pkgDb.dailyProfit / 2)}%`;
          const durationDisplay = isReferral 
            ? 'daily' 
            : 'every 12 hours';

          const minAmtStr = pkgDb.minAmount ? pkgDb.minAmount.toLocaleString() : '0';
          const maxAmtStr = pkgDb.maxAmount ? pkgDb.maxAmount.toLocaleString() : '0';
          const investmentDisplay = pkgDb.minAmount === pkgDb.maxAmount 
            ? `$${minAmtStr}` 
            : `$${minAmtStr} – $${maxAmtStr}`;

          const pkg = { 
            ...uiConfig, 
            ...pkgDb,
            minInvestment: pkgDb.minAmount ?? uiConfig?.minInvestment ?? 0,
            maxInvestment: pkgDb.maxAmount ?? uiConfig?.maxInvestment ?? 0,
            profit: profitDisplay,
            duration: durationDisplay,
            investment: investmentDisplay
          };

          const isLastItem = idx === dbPackages.length - 1;
          const isOddCount = dbPackages.length % 2 !== 0;

          // Tiered color variations for visual hierarchy
          const getTierStyles = (name) => {
            const lower = name.toLowerCase();
            if (lower.includes('package 2')) return { bg: 'bg-[#E8FBF1] text-[#10B981] border-[#10B981]/15' };
            if (lower.includes('package 3') || lower.includes('land security')) return { bg: 'bg-[#FFF6E8] text-[#F59E0B] border-[#F59E0B]/15' };
            if (lower.includes('package 4')) return { bg: 'bg-[#FEEAEE] text-[#EF4444] border-[#EF4444]/15' };
            return { bg: 'bg-[#FDE8FE] text-[#F310FD] border-[rgba(243,16,253,0.15)]' };
          };

          const tierStyle = getTierStyles(pkg.name);
          const isSelected = selectedPackage?._id === pkg._id;

          return (
            <GlassCard
              key={pkg._id || pkg.id}
              delay={idx * 0.08}
              onClick={() => handleSelectPackage(pkg)}
              className={clsx(
                "relative cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden group",
                isSelected && 'ring-2 ring-[#F310FD] border-transparent shadow-[0_12px_40px_rgba(243,16,253,0.15)]',
                isLastItem && isOddCount && 'md:col-span-2 md:w-[calc(50%-16px)] md:mx-auto'
              )}
            >
              {/* Top expanding gradient bar on hover */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#F310FD] to-[#00D4AA] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  {/* Top Row: Icon & Selection */}
                  <div className="flex justify-between items-start mb-6">
                    {/* Icon Badge */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border shrink-0 transition-transform group-hover:scale-115 duration-300 ${tierStyle.bg}`}>
                      <pkg.icon size={24} />
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="text-[#10B981]"
                      >
                        <CheckCircle2 size={28} className="drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                      </motion.div>
                    )}
                  </div>

                  {/* Content */}
                  <h2 className="text-2xl font-extrabold text-[#1A1A2E] mb-4 tracking-tight group-hover:text-[#F310FD] transition-colors">
                    {pkg.name}
                  </h2>

                  <div className="mb-6">
                    <p className="text-[11px] text-[#7A7A9A] font-bold mb-1 uppercase tracking-widest">Investment Range</p>
                    <p className="text-xl font-bold text-[#1A1A2E]">{pkg.investment}</p>
                  </div>

                  {/* Profit Rate Box */}
                  <div className="bg-[#FAF9FF] border border-[#E8E6F0] rounded-xl p-5 mb-6 relative overflow-hidden transition-all group-hover:border-[#F310FD]/30">
                    <p className="text-[11px] text-[#7A7A9A] font-bold mb-1 uppercase tracking-widest">Profit Rate</p>
                    <p className="text-[32px] font-black text-[#F310FD] leading-none">
                      {pkg.profit} <span className="text-xs font-bold text-[#4A4A6A] ml-1">{pkg.duration}</span>
                    </p>
                  </div>

                  <p className="text-[#4A4A6A] text-sm mb-8 leading-relaxed font-medium">
                    {pkg.description}
                  </p>
                </div>

                {/* Bottom Actions & Trust Indicators */}
                <div className="mt-auto">
                  <PremiumButton
                    variant={isSelected ? 'primary' : 'primary'}
                    className="w-full mb-5"
                    onClick={() => handleSelectPackage(pkg)}
                  >
                    {isSelected ? 'Selected' : 'Buy Now'}
                    {!isSelected && <ChevronRight size={18} />}
                  </PremiumButton>

                  {/* Trust & Transparency Indicators */}
                  <div className="flex items-center justify-between border-t border-[#E8E6F0] pt-4">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#7A7A9A] font-bold">
                      <Activity size={12} className="text-[#00D4AA]" />
                      <span>Real-time Secure</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#7A7A9A] font-bold cursor-help" title="Withdraw your funds anytime">
                      <Clock size={12} className="text-[#00D4AA]" />
                      <span>Withdraw anytime</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Purchase Modal Overlay */}
      <AnimatePresence>
        {selectedPackage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPackage(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-y-auto max-h-[90vh] z-10"
            >
              {/* Decorative Blur Orbs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F310FD]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F310FD]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedPackage(null)}
                className="absolute top-6 right-6 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors z-20 border border-slate-200"
              >
                <X size={20} />
              </button>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                  <Zap className="text-[#F310FD]" /> Complete Purchase: {selectedPackage.name}
                </h3>

                {/* Payment Method Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-500 mb-3">Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('metamask')}
                      className={`py-3 px-4 rounded-xl font-bold border transition-all text-sm flex items-center justify-center gap-2 ${
                        paymentMethod === 'metamask'
                          ? 'bg-[#F310FD]/5 border-[#F310FD] text-[#F310FD] shadow-[0_0_15px_rgba(243,16,253,0.1)]'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350 hover:text-slate-700'
                      }`}
                    >
                      <Zap size={16} /> Pay via MetaMask
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('manual')}
                      className={`py-3 px-4 rounded-xl font-bold border transition-all text-sm flex items-center justify-center gap-2 ${
                        paymentMethod === 'manual'
                          ? 'bg-[#F310FD]/5 border-[#F310FD] text-[#F310FD] shadow-[0_0_15px_rgba(243,16,253,0.1)]'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350 hover:text-slate-700'
                      }`}
                    >
                      <CreditCard size={16} /> Manual Deposit
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Selected Package Display */}
                  <div>
                    <label className="block text-sm font-bold text-[#4A4A6A] mb-2 uppercase tracking-wider">Selected Package</label>
                    <div className="w-full bg-[#FAF9FF] border border-[#E8E6F0] rounded-xl px-4 py-3.5 text-[#1A1A2E] font-bold">
                      {selectedPackage.name} ({selectedPackage.profit} {selectedPackage.duration})
                    </div>
                  </div>

                  {/* Investment Amount Input */}
                  <div>
                    <ValidatedInput
                      label="Investment Amount (USD)"
                      type="number"
                      value={investmentAmount}
                      onChange={handleAmountChange}
                      error={amountError}
                      success={investmentAmount && !amountError}
                    />
                    {!amountError && (
                      selectedPackage.minInvestment === selectedPackage.maxInvestment ? (
                        <p className="text-xs text-[#7A7A9A] mt-2 font-medium">Required Investment: ${selectedPackage.minInvestment.toLocaleString()}</p>
                      ) : (
                        <p className="text-xs text-[#7A7A9A] mt-2 font-medium">Allowed Range: ${selectedPackage.minInvestment.toLocaleString()} - ${selectedPackage.maxInvestment.toLocaleString()}</p>
                      )
                    )}
                  </div>
                </div>

                {/* Manual Payment Fields */}
                {paymentMethod === 'manual' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 mb-6"
                  >
                    {/* Network Selection */}
                    <div>
                      <label className="block text-xs font-bold text-[#4A4A6A] uppercase tracking-wider mb-2">Select Network</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setNetworkType('Bep20')}
                          className={`py-3 px-4 rounded-xl font-bold border transition-all text-xs flex items-center justify-center gap-1.5 ${
                            networkType === 'Bep20'
                              ? 'bg-[#F310FD]/5 border-[#F310FD] text-[#F310FD]'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          BEP20 (Binance Smart Chain)
                        </button>
                        <button
                          type="button"
                          onClick={() => setNetworkType('TRC 20')}
                          className={`py-3 px-4 rounded-xl font-bold border transition-all text-xs flex items-center justify-center gap-1.5 ${
                            networkType === 'TRC 20'
                              ? 'bg-[#F310FD]/5 border-[#F310FD] text-[#F310FD]'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          TRC20 (TRON Network)
                        </button>
                      </div>
                    </div>

                    {/* Deposit Address Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500">USDT Deposit Address ({networkType})</span>
                        <button
                          type="button"
                          onClick={() => {
                            const addr = networkType === 'Bep20' 
                              ? depositAddresses.depositAddressBep20 
                              : depositAddresses.depositAddressTrc20;
                            navigator.clipboard.writeText(addr);
                            toast.success('Address copied to clipboard!');
                          }}
                          className="text-xs text-[#F310FD] hover:underline flex items-center gap-1 font-bold"
                        >
                          <Copy size={12} /> Copy Address
                        </button>
                      </div>
                      <div className="text-sm font-mono text-slate-800 select-all break-all bg-white border border-slate-200 p-3 rounded-xl text-center mb-4">
                        {networkType === 'Bep20' 
                          ? depositAddresses.depositAddressBep20 
                          : depositAddresses.depositAddressTrc20}
                      </div>
                      
                      {/* QR Code Container */}
                      <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl p-4 mb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Scan to Pay</span>
                        <div className="bg-white p-2.5 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${
                              networkType === 'Bep20' 
                                ? depositAddresses.depositAddressBep20 
                                : depositAddresses.depositAddressTrc20
                            }`} 
                            alt="Payment QR Code" 
                            className="w-[130px] h-[130px]"
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-[#7A7A9A] leading-relaxed">
                        ⚠️ Send only USDT ({networkType}) to this address. Sending other tokens or using the wrong network may result in permanent loss.
                      </p>
                    </div>

                    {/* Sender Wallet Address */}
                    <div>
                      <ValidatedInput
                        label="Sender Wallet Address (Optional)"
                        type="text"
                        value={senderAddress}
                        onChange={(e) => setSenderAddress(e.target.value)}
                        placeholder="Your wallet address from which payment is sent"
                        className="font-mono text-sm"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 gap-6 mb-6">
                  {/* TxHash Input */}
                  <div>
                    <ValidatedInput
                      label={`Transaction Hash ${paymentMethod === 'manual' ? '(Required)' : '(Optional if using MetaMask)'}`}
                      type="text"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="0x... or TRON transaction ID"
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 mb-8">
                  <p className="text-xs text-[#7A7A9A] font-medium">
                    {paymentMethod === 'manual'
                      ? 'Enter the transaction hash/id of your USDT transfer to submit for verification.'
                      : 'Enter transaction hash manually if you paid outside of this browser session.'}
                  </p>
                </div>

                <div className="flex justify-end gap-4">
                  <PremiumButton
                    variant="outline"
                    onClick={() => {
                      setSelectedPackage(null);
                      setTxHash('');
                      setSenderAddress('');
                    }}
                  >
                    Cancel
                  </PremiumButton>
                  {paymentMethod === 'metamask' ? (
                    <PremiumButton
                      variant="primary"
                      disabled={!!amountError || !investmentAmount || isProcessing}
                      onClick={connectWalletAndPay}
                      className="px-10"
                    >
                      {isProcessing ? 'Processing...' : 'Pay via MetaMask'} <ChevronRight size={16} />
                    </PremiumButton>
                  ) : (
                    <PremiumButton
                      variant="primary"
                      disabled={!!amountError || !investmentAmount || !txHash || isProcessing}
                      onClick={submitManualPurchase}
                      className="px-10"
                    >
                      {isProcessing ? 'Submitting...' : 'Submit Manual Purchase'} <ChevronRight size={16} />
                    </PremiumButton>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
