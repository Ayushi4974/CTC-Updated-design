import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ArrowUpRight, ArrowDownRight, Package, Users, Gift,
  CheckCircle2, Clock, XCircle, Copy, Check, Filter, Layers
} from 'lucide-react';
import api from '../api';
import { useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';

const filters = ['All', 'Deposit', 'Withdrawal', 'Investment', 'Level Income', 'Bonus'];

const Transactions = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/transaction/history');
        setTransactions(res.data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const handleCopy = (hash) => {
    if (hash === 'System') return;
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredTransactions = transactions.filter(txn => {
    const txnTypeMatch = txn.type ? txn.type.toLowerCase() : '';
    const activeFilterMatch = activeFilter.toLowerCase();

    const matchesFilter = activeFilter === 'All' ||
      txnTypeMatch === activeFilterMatch ||
      (activeFilter === 'Bonus' && (txnTypeMatch === 'bonus' || txnTypeMatch === 'salary'));

    const matchesSearch =
      (txn._id && txn._id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (txn.description && txn.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (txn.txHash && txn.txHash.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const getTypeIcon = (type) => {
    const lowerType = type ? type.toLowerCase() : '';
    switch (lowerType) {
      case 'deposit': return <ArrowDownRight size={16} className="text-emerald-500" />;
      case 'withdrawal': return <ArrowUpRight size={16} className="text-[#F310FD]" />;
      case 'investment': return <Package size={16} className="text-[#F310FD]" />;
      case 'referral': return <Users size={16} className="text-[#F310FD]" />;
      case 'level income': return <Layers size={16} className="text-[#F310FD]" />;
      case 'bonus': return <Gift size={16} className="text-amber-500" />;
      default: return <ArrowUpRight size={16} />;
    }
  };

  const getStatusBadge = (status) => {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus === 'completed' || lowerStatus === 'approved' || lowerStatus === 'success') {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8FBF1] text-[#10B981] border border-[#10B981]/15"><CheckCircle2 size={12} /> Completed</span>;
    } else if (lowerStatus === 'pending') {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FDE8FE] text-[#F310FD] border border-[#F310FD]/15 animate-pulse"><Clock size={12} /> Pending</span>;
    } else if (lowerStatus === 'failed' || lowerStatus === 'rejected') {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF5F5] text-[#FF6B35] border border-[#FF6B35]/15"><XCircle size={12} /> Failed</span>;
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 pt-4 px-4 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1A1A2E] mb-2 tracking-tight">
          Transaction History
        </h1>
        <p className="text-[#4A4A6A] text-sm font-medium">
          View and track all your financial activities, deposits, and withdrawals.
        </p>
      </div>

      <GlassCard
        hoverable={false}
        className="p-6 flex flex-col gap-6 border border-[#E8E6F0]"
      >
        {/* Filter & Search Bar */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-[#FAF9FF] p-3 rounded-2xl border border-[#E8E6F0]">

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border ${activeFilter === filter
                    ? 'bg-gradient-to-tr from-[#F310FD] to-[#C70AD1] hover:shadow-[0_8px_30px_rgba(243,16,253,0.3)] text-white border-transparent shadow-md'
                    : 'bg-white text-[#4A4A6A] border-[#E8E6F0] hover:text-[#F310FD] hover:border-[#F310FD]/30 shadow-sm'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full xl:w-[350px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-[1.5px] border-[#E8E6F0] focus:border-[#F310FD] focus:ring-[3px] focus:ring-[#F310FD]/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-[#1A1A2E] placeholder-[#7A7A9A] focus:outline-none transition-all duration-200 font-semibold"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto border border-[#E8E6F0] rounded-xl bg-white">
          <table className="w-full text-left border-collapse min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E8E6F0] text-[9px] md:text-[11px] font-bold text-[#7A7A9A] uppercase tracking-widest">
                <th className="p-3 md:p-4">Type</th>
                <th className="p-3 md:p-4 hidden md:table-cell">Description</th>
                <th className="p-3 md:p-4 text-right">Amount</th>
                <th className="p-3 md:p-4 text-center hidden sm:table-cell">Date</th>
                <th className="p-3 md:p-4 text-center">Status</th>
                <th className="p-3 md:p-4 text-right hidden md:table-cell">Hash / ID</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-[#7A7A9A] font-bold text-sm">Loading transactions...</td>
                  </tr>
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((txn, idx) => (
                    <motion.tr
                      key={txn._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-[#E8E6F0] hover:bg-[#FAF9FF] transition-colors duration-150 group"
                    >
                      {/* Type */}
                      <td className="p-3 md:p-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-6 h-6 md:w-8 md:h-8 shrink-0 rounded-full bg-[#FAF9FF] border border-[#E8E6F0] flex items-center justify-center">
                            {getTypeIcon(txn.type)}
                          </div>
                          <div className="truncate pr-1 md:pr-2">
                            <p className="text-xs md:text-sm font-extrabold text-[#1A1A2E] capitalize truncate">{txn.type}</p>
                            <p className="text-[9px] md:text-[10px] text-[#7A7A9A] font-bold truncate max-w-[80px] md:max-w-[150px]" title={txn._id}>{txn._id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="p-3 md:p-4 hidden md:table-cell">
                        <p className="text-sm font-semibold text-[#4A4A6A] truncate max-w-[200px]">{txn.description}</p>
                      </td>

                      {/* Amount */}
                      <td className="p-3 md:p-4 text-right">
                        <p className={`text-[11px] md:text-sm font-extrabold tracking-wide whitespace-nowrap ${txn.type.toLowerCase() !== 'withdrawal' && txn.type.toLowerCase() !== 'investment' ? 'text-[#00D4AA]' : 'text-[#1A1A2E]'}`}>
                          {txn.type.toLowerCase() !== 'withdrawal' && txn.type.toLowerCase() !== 'investment' ? '+' : '-'} ${txn.amount}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="p-3 md:p-4 text-center hidden sm:table-cell">
                        <p className="text-[10px] md:text-xs text-[#4A4A6A] font-bold whitespace-nowrap">{new Date(txn.createdAt).toLocaleDateString()}</p>
                      </td>

                      {/* Status */}
                      <td className="p-3 md:p-4 text-center">
                        <div className="flex justify-center">
                          {getStatusBadge(txn.status)}
                        </div>
                      </td>

                      {/* Hash / ID */}
                      <td className="p-3 md:p-4 hidden md:table-cell text-right">
                        <div className="flex justify-end items-center gap-2">
                          <span className="text-[11px] font-mono text-[#4A4A6A] bg-[#FAF9FF] px-2.5 py-1 rounded-xl border border-[#E8E6F0] font-bold truncate max-w-[120px]" title={txn.txHash || 'System'}>
                            {txn.txHash || 'System'}
                          </span>
                          {txn.txHash && txn.txHash !== 'System' && (
                            <button
                              onClick={() => handleCopy(txn.txHash)}
                              className="text-slate-400 hover:text-[#F310FD] transition-colors p-1"
                              title="Copy Hash"
                            >
                              {copiedHash === txn.txHash ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-20 flex flex-col items-center justify-center text-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-[#FAF9FF] border border-[#E8E6F0] flex items-center justify-center mb-4 text-[#7A7A9A]">
                          <Filter size={24} />
                        </div>
                        <h3 className="text-lg font-extrabold text-[#1A1A2E] mb-1">No transactions found</h3>
                        <p className="text-sm text-[#4A4A6A] font-semibold">We couldn't find any activities matching your criteria.</p>
                      </motion.div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </GlassCard>

    </div>
  );
};

export default Transactions;
