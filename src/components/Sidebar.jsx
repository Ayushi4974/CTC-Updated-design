import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import {
  Home,
  Package,
  ShieldCheck,
  ArrowDownCircle,
  Users,
  BarChart2,
  Cpu,
  LogOut,
  Wallet,
  FileText,
  User,
  X,
  Trophy
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import logo from '../assets/logo.png';

const navigationGroups = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: Home },
      { name: 'Packages', path: '/products', icon: Package },
    ]
  },
  {
    title: 'ACCOUNT',
    items: [
      { name: 'KYC Verification', path: '/kyc', icon: ShieldCheck },
      { name: 'Withdrawal', path: '/withdrawal', icon: ArrowDownCircle },
      { name: 'Profile', path: '/profile', icon: User },
    ]
  },
  {
    title: 'NETWORK',
    items: [
      { name: 'Downline', path: '/downline', icon: Users },
      { name: 'Level Income', path: '/level-income', icon: BarChart2 },
      { name: 'Promotional Bonus', path: '/promotional-bonus', icon: Trophy },
    ]
  },
  {
    title: 'HISTORY',
    items: [
      { name: 'Copy Trade History', path: '/mining', icon: Cpu },
      { name: 'Package History', path: '/package-history', icon: Package },
      { name: 'Transactions', path: '/transactions', icon: FileText },
    ]
  }
];

const Sidebar = ({ isOpen, closeSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { walletAddress } = useSelector((state) => state.auth);

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
        toast.error(error?.message || "Failed to connect wallet. Please check your extension.");
      }
    } else {
      toast.error("Please install MetaMask to use this feature!");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className={clsx(
      "w-[264px] h-screen bg-surface-0 border-r border-border-subtle flex flex-col fixed left-0 top-0 overflow-y-auto hide-scrollbar z-50 transition-transform duration-300 ease-in-out lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Mobile Close Button */}
      <button
        onClick={closeSidebar}
        className="lg:hidden absolute top-4 right-4 p-2 text-ink-500 hover:text-ink-900 bg-surface-100 rounded-md"
      >
        <X size={20} />
      </button>

      {/* Logo Lockup */}
      <div className="flex items-center gap-3 p-6 border-b border-border-subtle shrink-0">
        <div className="w-11 h-11 shrink-0 rounded-md bg-brand-50 flex items-center justify-center p-1.5 border border-brand-100">
          <img src={logo} alt="CTC" className="w-full h-full object-contain" />
        </div>
        <div>
          <h3 className="text-base font-bold text-ink-900 leading-tight">CTC</h3>
          <p className="text-[9px] font-bold text-ink-500 uppercase tracking-widest leading-none mt-0.5">COPY TRADE COMPARE</p>
        </div>
      </div>

      {/* Nav Groups */}
      <div className="flex-1 px-4 py-6 space-y-6">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            <span className="block px-3 text-[10px] font-bold text-ink-300 uppercase tracking-wider">
              {group.title}
            </span>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) closeSidebar();
                    }}
                    className={({ isActive }) =>
                      clsx(
                        'group flex items-center gap-3 px-3 h-11 rounded-md text-sm font-medium transition-all duration-200 relative',
                        isActive
                          ? 'bg-brand-50 text-brand-600 font-semibold'
                          : 'text-ink-700 hover:text-brand-600 hover:bg-surface-100'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 w-[3px] h-5 rounded-pill bg-brand-500" />
                        )}
                        <Icon size={20} className={clsx('shrink-0 transition-colors', isActive ? 'text-brand-600' : 'text-ink-500 group-hover:text-brand-600')} />
                        <span className="truncate">{item.name}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Wallet Status Block */}
      <div className="p-4 border-t border-border-subtle shrink-0">
        <div className="p-4 bg-surface-50 rounded-md border border-border-subtle">
          <p className="text-[10px] text-ink-500 font-bold uppercase tracking-wider mb-2">Wallet Status</p>
          <div className="flex items-center gap-2 mb-4 text-sm font-medium">
            <div className="relative flex h-2 w-2">
              <span className={clsx(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-40",
                walletAddress ? 'bg-success-500' : 'bg-danger-500'
              )}></span>
              <span className={clsx(
                "relative inline-flex rounded-full h-2 w-2",
                walletAddress ? 'bg-success-500' : 'bg-danger-500'
              )}></span>
            </div>
            <span className={clsx("text-sm font-medium", walletAddress ? "text-ink-900" : "text-ink-700")}>
              {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : 'Disconnected'}
            </span>
          </div>
          {!walletAddress ? (
            <button
              onClick={connectWallet}
              className="w-full bg-brand-500 text-white rounded-md py-2.5 text-sm font-bold shadow-sm hover:bg-brand-600 hover:shadow-brand transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wallet size={16} />
              Connect Wallet
            </button>
          ) : (
            <div className="text-[11px] text-success-500 font-semibold flex items-center gap-1">
              ✓ Connected & Secure
            </div>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 pb-6 border-t border-border-subtle shrink-0">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-ink-500 hover:text-danger-500 hover:bg-danger-50 rounded-md transition-all text-sm font-medium w-full text-left cursor-pointer">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
