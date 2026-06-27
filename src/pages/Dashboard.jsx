import React from 'react';
import { 
  Zap, 
  Cpu, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  Wallet, 
  Gift, 
  Users, 
  BarChart2, 
  Briefcase,
  UserCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Rocket,
  Trophy,
  Copy,
  CreditCard,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../redux/slices/authSlice';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import api from '../api';
import clsx from 'clsx';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';
import StatCard from '../components/StatCard';
import ValidatedInput from '../components/ValidatedInput';

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  if (apiUrl) {
    const serverUrl = apiUrl.replace(/\/api$/, '');
    return `${serverUrl}${cleanPath}`;
  }
  return cleanPath;
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, profile, walletAddress } = useSelector((state) => state.auth);

  const [miningProgress, setMiningProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const [activePackages, setActivePackages] = useState([]);
  const [announcementImages, setAnnouncementImages] = useState([]);
  const [announcementContent, setAnnouncementContent] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  const [stakingAmount, setStakingAmount] = useState(100);
  const [dbPackages, setDbPackages] = useState([]);
  const [depositAddresses, setDepositAddresses] = useState({
    depositAddressMetaMask: '0x185018c5f26B2cE105e0B80b231178CE5913b621',
    depositAddressBep20: '0x8e4143b46eb1e1a6cbd71b5d57da95b985219f0b',
    depositAddressTrc20: 'TWJjGZJ73Q9x2hWpLRRreaxyvR9Eveoiv5'
  });
  const [walletUSDTBalance, setWalletUSDTBalance] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('metamask');
  const [networkType, setNetworkType] = useState('Bep20');
  const [senderAddress, setSenderAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const currentUser = profile || user;
  const balance = currentUser?.availableBalance || 0;
  const totalEarning = currentUser?.totalEarning || 0;
  const levelIncome = currentUser?.levelIncome || 0;
  const referralIncome = currentUser?.referralIncome || 0;
  const miningIncome = currentUser?.miningIncome || 0;
  const directTeam = currentUser?.directTeam || 0;
  const sponsor = currentUser?.sponsorId || 'None';
  const isActive = currentUser?.isActive || false;
  const activePackageName = activePackages.length > 0 
    ? activePackages.map(p => p.packageId?.name || 'Standard Package').join(', ')
    : (currentUser?.activePackage?.name || 'None');
  const promotionalIncome = currentUser?.promotionalIncome || 0;
  const fastrackQualified = currentUser?.fastrackQualified ? 'Active' : 'Inactive';

  useEffect(() => {
    const fetchDepositAddresses = async () => {
      try {
        const res = await api.get('/user/deposit-addresses');
        if (res.data) setDepositAddresses(res.data);
      } catch (err) {
        console.error('Failed to fetch deposit addresses:', err);
      }
    };
    fetchDepositAddresses();

    const fetchAllPackages = async () => {
      try {
        const res = await api.get('/package/all');
        if (res.data && res.data.length > 0) {
          setDbPackages(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch packages:', err);
      }
    };
    fetchAllPackages();
  }, []);

  useEffect(() => {
    const getUSDTBalance = async () => {
      if (walletAddress && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const USDT_CONTRACT = "0x55d398326f99059fF775485246999027B3197955";
          const abi = [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)"
          ];
          const contract = new ethers.Contract(USDT_CONTRACT, abi, provider);
          const [balanceVal, decimals] = await Promise.all([
            contract.balanceOf(walletAddress),
            contract.decimals()
          ]);
          setWalletUSDTBalance(parseFloat(ethers.formatUnits(balanceVal, decimals)).toFixed(2));
        } catch (e) {
          console.error('Failed to fetch USDT balance:', e);
        }
      } else {
        setWalletUSDTBalance(null);
      }
    };
    getUSDTBalance();
  }, [walletAddress]);

  const getMatchedPackage = () => {
    if (!dbPackages || dbPackages.length === 0) return null;
    const sorted = [...dbPackages].sort((a, b) => (a.minAmount || 0) - (b.minAmount || 0));
    const matched = sorted.find(p => stakingAmount >= (p.minAmount || 0) && stakingAmount <= (p.maxAmount || 999999999));
    return matched || sorted[0];
  };

  const matchedPackage = getMatchedPackage();
  const dailyProfitRate = matchedPackage ? (matchedPackage.dailyProfit || 1.0) : 1.0;

  const calculatePercentAmount = (percent) => {
    const maxVal = walletUSDTBalance ? parseFloat(walletUSDTBalance) : 2500;
    const calculated = Math.round(maxVal * (percent / 100));
    setStakingAmount(Math.max(100, calculated));
  };

  useEffect(() => {
    const checkAnnouncement = async () => {
      try {
        const res = await api.get('/user/announcement');
        if (res.data) {
          const images = res.data.announcementImages && res.data.announcementImages.length > 0
            ? res.data.announcementImages
            : (res.data.announcementImage ? [res.data.announcementImage] : []);
          const content = res.data.announcementContent || '';
          if (images.length > 0 || content) {
            const announcementKey = `${images.join(',')}||${content}`;
            const lastSeen = localStorage.getItem('last_seen_announcement');
            if (lastSeen !== announcementKey) {
              setAnnouncementImages(images);
              setAnnouncementContent(content);
              setShowAnnouncement(true);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching announcement:', err);
      }
    };
    checkAnnouncement();
  }, []);

  const handleCloseAnnouncement = () => {
    const announcementKey = `${announcementImages.join(',')}||${announcementContent}`;
    localStorage.setItem('last_seen_announcement', announcementKey);
    setShowAnnouncement(false);
  };

  const handleCarouselScroll = (e) => {
    const width = e.target.offsetWidth;
    const scrollLeft = e.target.scrollLeft;
    const index = Math.round(scrollLeft / width);
    setActiveCarouselIndex(index);
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await api.get('/package/my-packages');
        setActivePackages(res.data.filter(p => p.status === 'active'));
      } catch (err) {
        console.error('Error fetching packages:', err);
      }
    };
    fetchPackages();

    const updateProgress = () => {
      const today = new Date();
      const day = today.getDay();
      if (day === 0 || day === 6) {
        setMiningProgress(0);
        setTimeLeft('Resumes Monday');
        return;
      }

      const now = today.getTime();
      const cycleMs = 12 * 60 * 60 * 1000;
      const elapsed = now % cycleMs;
      const progress = (elapsed / cycleMs) * 100;
      setMiningProgress(progress);

      const remainingMs = cycleMs - elapsed;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };
    
    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPackageProfit = () => {
    if (activePackages.length === 0) {
      if (currentUser?.totalInvestment >= 20) return '0.25%';
      return '0%';
    }
    const totalProfit = activePackages.reduce((sum, p) => sum + (p.dailyProfitPercent || 0), 0);
    return `${totalProfit.toFixed(1)}%`;
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          dispatch({ type: 'auth/setWalletAddress', payload: accounts[0] });
          toast.success("Wallet connected successfully!");
        } else {
          toast.error("No active wallet found. Please unlock your wallet.");
        }
      } catch (error) {
        console.error("Wallet connection error:", error);
        toast.error(error?.message || "Failed to connect wallet.");
      }
    } else {
      toast.error("Please install MetaMask to use this feature!");
    }
  };

  const connectWalletAndPay = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      return;
    }

    try {
      setIsProcessing(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const targetChainId = '0x38';
      const chainId = await provider.send('eth_chainId', []);

      if (chainId !== targetChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
        } catch (switchError) {
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

      const USDT_CONTRACT = "0x55d398326f99059fF775485246999027B3197955";
      const ADMIN_WALLET = depositAddresses.depositAddressMetaMask || "0x185018c5f26B2cE105e0B80b231178CE5913b621"; 

      const abi = [
        "function transfer(address to, uint256 amount) public returns (bool)",
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];
      const usdtContract = new ethers.Contract(USDT_CONTRACT, abi, signer);

      const userAddress = await signer.getAddress();
      const [balanceVal, decimals, bnbBalance] = await Promise.all([
        usdtContract.balanceOf(userAddress),
        usdtContract.decimals(),
        provider.getBalance(userAddress)
      ]);

      const amount = ethers.parseUnits(stakingAmount.toString(), decimals);

      if (bnbBalance === 0n) {
        throw new Error("Insufficient BNB for gas fees on Binance Smart Chain.");
      }

      if (balanceVal < amount) {
        const readableBalance = ethers.formatUnits(balanceVal, decimals);
        throw new Error(`Insufficient USDT balance. You have ${readableBalance} USDT, but need ${stakingAmount} USDT.`);
      }

      toast.info("Please confirm the transaction in MetaMask...");
      const tx = await usdtContract.transfer(ADMIN_WALLET, amount);

      toast.info("Transaction sent! Waiting for confirmation...");
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        const response = await api.post('/package/buy', {
          packageId: matchedPackage._id,
          amount: Number(stakingAmount),
          txHash: tx.hash,
          senderAddress: userAddress,
        });

        toast.success(response.data.message || 'Staking Package Activated Successfully!');
        dispatch(fetchProfile());
        setShowPurchaseModal(false);
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
      toast.error('Transaction Hash is required for verification.');
      return;
    }

    try {
      setIsProcessing(true);
      const response = await api.post('/package/manual-buy', {
        packageId: matchedPackage._id,
        amount: Number(stakingAmount),
        txHash,
        networkType,
        senderAddress,
      });

      toast.success(response.data.message || 'Manual purchase request submitted!');
      setShowPurchaseModal(false);
      setTxHash('');
      setSenderAddress('');
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to submit request.';
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmStake = () => {
    if (!matchedPackage) {
      toast.error("No package matches this staking amount.");
      return;
    }
    
    if (stakingAmount < matchedPackage.minAmount) {
      toast.error(`Minimum investment for this package is $${matchedPackage.minAmount}`);
      return;
    }
    if (stakingAmount > matchedPackage.maxAmount) {
      toast.error(`Maximum investment for this package is $${matchedPackage.maxAmount}`);
      return;
    }

    setShowPurchaseModal(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-[#E8E6F0] rounded-[20px] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(26,26,46,0.08)] relative overflow-hidden bg-white backdrop-blur-[20px]"
      >
        {/* Floating Orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-72 h-72 bg-[#F310FD]/5 rounded-full blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-72 h-72 bg-[#00D4AA]/5 rounded-full blur-[80px] animate-pulse"></div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A1A2E] tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F310FD] to-[#C70AD1]">{currentUser?.fullName || 'User'}</span>
          </h1>
          <p className="text-[#4A4A6A] text-sm mt-1.5 font-medium">Monitor copy trading outputs, verify balances, and lock new stakes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <span className={clsx(
            "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm",
            isActive ? 'bg-[#E0F9F7] text-[#00B8A1] border border-[#00B8A1]/10' : 'bg-red-50 text-red-500 border border-red-100'
          )}>
            <span className={clsx("w-2 h-2 rounded-full", isActive ? 'bg-[#00D4AA] animate-pulse' : 'bg-red-500')}></span>
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
          {currentUser?.pins === 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-500 rounded-full text-xs font-bold uppercase tracking-wider border border-red-100">
              0 Pin
            </span>
          )}
          {currentUser?.achieverBadge && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFF6E8] text-[#F59E0B] rounded-full text-xs font-bold uppercase tracking-wide border border-[#F59E0B]/10">
              <Trophy size={14} className="text-[#F59E0B] fill-[#FFF6E8]" /> {currentUser.achieverBadge}
            </span>
          )}
        </div>
      </motion.div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Wallet size={24} />}
          label="Available Balance"
          value={currentUser?.availableBalance || 0}
          format="currency"
          iconColor="primary"
          delay={0.05}
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          label="Total Earnings"
          value={currentUser?.totalEarning || 0}
          format="currency"
          iconColor="secondary"
          delay={0.1}
        />
        <StatCard
          icon={<Cpu size={24} />}
          label="Copy Trade Income"
          value={currentUser?.miningIncome || 0}
          format="currency"
          iconColor="primary"
          delay={0.15}
        />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <GlassCard hoverable={false} className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider">Profit Sync Status</h3>
            <span className="text-[10px] font-bold text-[#F310FD] font-mono bg-[#FDE8FE] border border-[#FDE8FE] px-2 py-0.5 rounded-full">
              {timeLeft}
            </span>
          </div>
          <div className="mb-4">
            <div className="h-3.5 w-full bg-[#F0EEF6] rounded-full overflow-hidden p-0.5 border border-[#E8E6F0]">
              <div 
                className="h-full bg-gradient-to-r from-[#F310FD] to-[#00D4AA] rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(243,16,253,0.2)]"
                style={{ width: `${miningProgress}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-[#4A4A6A] font-semibold">
            <span className="flex items-center gap-1.5 text-[#10B981] font-bold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              Synced Live
            </span>
            <span>Return Rate: {getPackageProfit()} / 12h</span>
          </div>
        </GlassCard>

        <GlassCard hoverable={false} className="p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs text-[#4A4A6A] mb-4">
            <span className="font-bold uppercase tracking-wider">Active Portfolio Returns</span>
            <span className="font-bold">Total Trading ROI: <span className="text-[#10B981] font-bold">${miningIncome.toFixed(2)}</span></span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#FAF9FF] border border-[#E8E6F0] rounded-xl p-3">
              <p className="text-[10px] text-[#7A7A9A] font-bold uppercase mb-1">Mined (This Month)</p>
              <h4 className="text-base font-bold text-[#1A1A2E]">{isActive ? '12 Sessions' : '0 Sessions'}</h4>
            </div>
            <div className="bg-[#FAF9FF] border border-[#E8E6F0] rounded-xl p-3">
              <p className="text-[10px] text-[#7A7A9A] font-bold uppercase mb-1">Mining Rate</p>
              <h4 className="text-base font-bold text-[#1A1A2E]">{isActive ? '45.8 TH/s' : '0 TH/s'}</h4>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wallet className="text-[#F310FD]" size={24} />
              <h2 className="text-xl font-bold text-[#1A1A2E]">Income Analysis</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#4A4A6A] font-bold">Total: ${totalEarning.toFixed(2)}</span>
              <PremiumButton variant="outline" className="px-4 py-2 text-xs">
                <BarChart2 size={14} /> Analytics
              </PremiumButton>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Active Package', value: activePackageName, icon: Briefcase, iconColor: 'text-[#10B981]', iconBg: 'bg-[#E8FBF1] border-[#10B981]/15 text-[#10B981]' },
              { title: 'ROI Daily Profit', value: `$${miningIncome.toFixed(2)}`, icon: Cpu, iconColor: 'text-[#F310FD]', iconBg: 'bg-[#FDE8FE] border-[rgba(243,16,253,0.15)] text-[#F310FD]' },
              { title: 'Fastrack Bonus', value: fastrackQualified, icon: Zap, iconColor: 'text-[#F310FD]', iconBg: 'bg-[#FDE8FE] border-[rgba(243,16,253,0.15)] text-[#F310FD]' },
              { title: 'Level Bonus', value: `$${levelIncome.toFixed(2)}`, icon: TrendingUp, iconColor: 'text-[#F310FD]', iconBg: 'bg-[#FDE8FE] border-[rgba(243,16,253,0.15)] text-[#F310FD]' },
              { title: 'Promotion Bonus', value: `$${promotionalIncome.toFixed(2)}`, icon: Gift, iconColor: 'text-[#F310FD]', iconBg: 'bg-[#FDE8FE] border-[rgba(243,16,253,0.15)] text-[#F310FD]' },
            ].map((item, idx) => (
              <GlassCard 
                key={idx}
                delay={0.2 + idx * 0.05}
                className="p-6 flex items-center justify-between group"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs text-[#7A7A9A] font-bold mb-2 uppercase tracking-wide truncate">{item.title}</p>
                  <h3 className="text-lg font-bold text-[#1A1A2E] break-words">{item.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${item.iconBg} border shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon size={22} />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <Users className="text-[#F310FD]" size={24} />
            <h2 className="text-xl font-bold text-[#1A1A2E]">Network</h2>
          </div>
          
          <GlassCard className="p-6">
            <div className="bg-gradient-to-br from-[#FDE8FE] via-white to-[#FAF9FF] border border-[#FDE8FE] rounded-2xl p-6 text-center mb-6 relative overflow-hidden shadow-inner">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F310FD]/5 rounded-full blur-2xl"></div>
              <p className="text-xs text-[#F310FD] uppercase font-bold tracking-widest mb-2 relative z-10">Your Referral ID</p>
              <h3 className="text-3xl font-extrabold text-[#1A1A2E] tracking-wider relative z-10">{currentUser?.userId || 'N/A'}</h3>
            </div>
            
            <div className="space-y-3 mb-6">
              {[
                ...(currentUser?.pins === 0 ? [{ title: 'My Pins', value: '0', icon: ShieldCheck, color: 'text-[#EF4444]', bg: 'bg-[#FEEAEE] border-[#EF4444]/15 text-[#EF4444]' }] : []),
                { title: 'Direct Team', value: directTeam.toString(), icon: Briefcase, color: 'text-[#F310FD]', bg: 'bg-[#FDE8FE] border-[rgba(243,16,253,0.15)] text-[#F310FD]' },
                { title: 'Sponsor', value: sponsor, icon: ShieldCheck, color: 'text-[#F310FD]', bg: 'bg-[#FDE8FE] border-[rgba(243,16,253,0.15)] text-[#F310FD]' },
                { title: 'Referral Income', value: `$${referralIncome.toFixed(2)}`, icon: Users, color: 'text-[#F310FD]', bg: 'bg-[#FDE8FE] border-[rgba(243,16,253,0.15)] text-[#F310FD]' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#E8E6F0] hover:border-[#F310FD]/30 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center ${item.bg} border shrink-0`}>
                      <item.icon size={16} />
                    </div>
                    <span className="text-sm text-[#4A4A6A] font-semibold">{item.title}</span>
                  </div>
                  <span className="text-[#1A1A2E] font-bold">{item.value}</span>
                </div>
              ))}
            </div>
            
            <PremiumButton variant="outline" className="w-full text-sm">
              View Full Network
            </PremiumButton>
          </GlassCard>
        </div>
      </div>

      <AnimatePresence>
        {showPurchaseModal && matchedPackage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPurchaseModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-y-auto max-h-[90vh] z-10"
            >
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors border border-slate-200"
              >
                <X size={20} />
              </button>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                  <Zap className="text-[#F310FD]" /> Complete Staking Purchase: {matchedPackage.name}
                </h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-500 mb-3">Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('metamask')}
                      className={`py-3 px-4 rounded-xl font-bold border transition-all text-sm flex items-center justify-center gap-2 ${
                        paymentMethod === 'metamask'
                          ? 'bg-[#F310FD]/5 border-[#F310FD] text-[#F310FD] shadow-[0_0_15px_rgba(243,16,253,0.1)]'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
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
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <CreditCard size={16} /> Manual Deposit
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-2">Matched Package</label>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 font-bold">
                      {matchedPackage.name} ({dailyProfitRate.toFixed(2)}% ROI / 12h)
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-2">Total Staking Amount</label>
                    <div className="w-full bg-[#F310FD]/5 border border-[#F310FD]/20 rounded-xl px-4 py-3.5 text-[#F310FD] font-black text-lg">
                      ${stakingAmount.toLocaleString()} USDT
                    </div>
                  </div>
                </div>

                {paymentMethod === 'manual' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 mb-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-2">Select Network</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setNetworkType('Bep20')}
                          className={`py-2 px-3 rounded-lg font-bold border transition-all text-xs flex items-center justify-center gap-1.5 ${
                            networkType === 'Bep20'
                              ? 'bg-[#F310FD]/5 border-[#F310FD] text-[#F310FD]'
                              : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}
                        >
                          BEP20 (Binance Smart Chain)
                        </button>
                        <button
                          type="button"
                          onClick={() => setNetworkType('TRC 20')}
                          className={`py-2 px-3 rounded-lg font-bold border transition-all text-xs flex items-center justify-center gap-1.5 ${
                            networkType === 'TRC 20'
                              ? 'bg-[#F310FD]/5 border-[#F310FD] text-[#F310FD]'
                              : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}
                        >
                          TRC20 (TRON Network)
                        </button>
                      </div>
                    </div>

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

                      <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl p-4 mb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Scan to Pay</span>
                        <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-center shadow-sm">
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

                      <p className="text-[11px] text-slate-400 leading-normal">
                        ⚠️ Send only USDT ({networkType}) to this address. Sending other tokens or using the wrong network may result in permanent loss.
                      </p>
                    </div>

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

                <div className="flex justify-end gap-4 border-t border-slate-100 pt-6">
                  <PremiumButton
                    variant="outline"
                    onClick={() => {
                      setShowPurchaseModal(false);
                      setTxHash('');
                      setSenderAddress('');
                    }}
                  >
                    Cancel
                  </PremiumButton>
                  {paymentMethod === 'metamask' ? (
                    <PremiumButton
                      variant="primary"
                      disabled={isProcessing}
                      onClick={connectWalletAndPay}
                      className="px-10"
                    >
                      {isProcessing ? 'Processing...' : 'Pay via MetaMask'} <ChevronRight size={16} />
                    </PremiumButton>
                  ) : (
                    <PremiumButton
                      variant="primary"
                      disabled={!txHash || isProcessing}
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

      <AnimatePresence>
        {showAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseAnnouncement}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F310FD] animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Important Announcement</span>
                </div>
                <button
                  onClick={handleCloseAnnouncement}
                  className="text-slate-500 hover:text-slate-800 bg-slate-200/50 p-1.5 rounded-full transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto hide-scrollbar">
                {announcementImages.length > 0 && (
                  <div className="relative group/carousel">
                    <div
                      id="announcement-carousel"
                      onScroll={handleCarouselScroll}
                      className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 w-full rounded-2xl"
                      style={{ scrollSnapType: 'x mandatory' }}
                    >
                      {announcementImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="snap-center shrink-0 w-full flex items-center justify-center bg-slate-50 min-h-[200px]"
                        >
                          <img
                            src={getImageUrl(imgUrl)}
                            alt={`Announcement ${idx + 1}`}
                            className="w-full max-h-[40vh] object-contain rounded-2xl border border-slate-100 shadow-sm"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/600x400/F8FAFC/F310FD?text=Announcement+Image';
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {announcementImages.length > 1 && (
                      <>
                        <button
                          onClick={() => {
                            const container = document.getElementById('announcement-carousel');
                            if (container) {
                              container.scrollBy({ left: -container.offsetWidth, behavior: 'smooth' });
                            }
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 text-slate-700 p-2 rounded-full border border-slate-200 shadow hover:scale-105 transition-all z-10 cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={() => {
                            const container = document.getElementById('announcement-carousel');
                            if (container) {
                              container.scrollBy({ left: container.offsetWidth, behavior: 'smooth' });
                            }
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 text-slate-700 p-2 rounded-full border border-slate-200 shadow hover:scale-105 transition-all z-10 cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}

                    {announcementImages.length > 1 && (
                      <div className="flex justify-center gap-1.5 mt-3">
                        {announcementImages.map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              activeCarouselIndex === idx ? 'bg-[#F310FD] w-4' : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {announcementContent && (
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap select-text">
                    {announcementContent}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50">
                <button
                  onClick={handleCloseAnnouncement}
                  className="w-full bg-[#F310FD] text-white px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide uppercase transition-all shadow-[0_2px_12px_rgba(243,16,253,0.15)] hover:bg-[#F310FD]/90"
                >
                  Acknowledge & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default Dashboard;
