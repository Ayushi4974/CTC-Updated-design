import React, { useEffect, useState } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { Award, DollarSign, Calendar, Clock, Trophy, Users, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';

const PromotionalBonusHistory = () => {
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(bonuses.length / itemsPerPage);
  const paginatedBonuses = bonuses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [bonuses.length]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }
      
      if (start > 2) {
        pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const promoRules = [
    { level: 'L1', team: '5 DIRECT', salary: '$30', margin: '0.50%', bonus: '$100' },
    { level: 'L2', team: '2 DIRECT L1 / 25 TEAM', salary: '$150', margin: '1.00%', bonus: '$300' },
    { level: 'L3', team: '3 DIRECT L1 / 125 TEAM', salary: '$500', margin: '2.00%', bonus: '$800' },
    { level: 'L4', team: '4 DIRECT L1 / 500 TEAM', salary: '$1200', margin: '2.50%', bonus: '$2000' },
    { level: 'L5', team: '5 DIRECT L1 / 1000 TEAM', salary: '$2400', margin: '3.00%', bonus: '$5000' },
    { level: 'L6', team: '6 DIRECT L1 / 2000 TEAM', salary: '$5000', margin: '3.50%', bonus: '$12000' },
    { level: 'L7', team: '7 DIRECT L1 / 5000 TEAM', salary: '$10000', margin: '4.00%', bonus: '$25000' },
    { level: 'L8', team: '3 DIRECT L7 / 20,000 TEAM', salary: '$60000', margin: '4.50%', bonus: '$100000' },
    { level: 'L9', team: '4 DIRECT L7 / 50,000 TEAM', salary: '$100000', margin: '5.00%', bonus: '$200000' },
    { level: 'L10', team: '3 DIRECT L8 / 1,000,000 TEAM', salary: '$300000', margin: '5.50%', bonus: '$500000' },
    { level: 'L11', team: '4 DIRECT L8 / 2,000,000 TEAM', salary: '$600000', margin: '6.00%', bonus: '$1000000' },
    { level: 'L12', team: '5 DIRECT L9 / 3,000,000 TEAM', salary: '$1000000', margin: '6.50%', bonus: '$2000000' },
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [profileRes, txRes] = await Promise.all([
          api.get('/user/profile'),
          api.get('/transaction/history')
        ]);
        
        const user = profileRes.data;
        const userRank = user.rank || 'None';

        const promoData = txRes.data.filter(tx => tx.type === 'bonus' || tx.type === 'salary');
        
        const ranks = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11', 'L12'];
        const rankBonusMap = {
          'L1': 100, 'L2': 300, 'L3': 800, 'L4': 2000, 'L5': 5000, 'L6': 12000,
          'L7': 25000, 'L8': 100000, 'L9': 200000, 'L10': 500000, 'L11': 1000000, 'L12': 2000000
        };

        const currentRankIndex = ranks.indexOf(userRank);
        const virtualRankBonuses = [];

        if (currentRankIndex !== -1) {
          for (let i = 0; i <= currentRankIndex; i++) {
            const rank = ranks[i];
            const bonusAmount = rankBonusMap[rank];
            
            const existingApprovedTx = promoData.find(
              tx => tx.type === 'bonus' && 
                    tx.amount === bonusAmount && 
                    (tx.status?.toLowerCase() === 'success' || tx.status?.toLowerCase() === 'approved')
            );
            
            const existingPendingTx = promoData.find(
              tx => tx.type === 'bonus' && 
                    tx.amount === bonusAmount && 
                    tx.status?.toLowerCase() === 'pending'
            );

            if (existingApprovedTx) {
              existingApprovedTx.status = 'Approved';
            } else if (existingPendingTx) {
              existingPendingTx.status = 'Pending';
            } else {
              virtualRankBonuses.push({
                _id: `virtual_bonus_${rank}`,
                type: 'bonus',
                amount: bonusAmount,
                status: 'Pending',
                createdAt: user.createdAt || new Date().toISOString(),
                level: rank
              });
            }
          }
        }

        const processedPromoData = promoData.map(tx => {
          const lowerStatus = tx.status?.toLowerCase();
          let statusText = tx.status;
          if (lowerStatus === 'success' || lowerStatus === 'approved') {
            statusText = 'Approved';
          } else if (lowerStatus === 'pending') {
            statusText = 'Pending';
          } else if (lowerStatus === 'failed' || lowerStatus === 'rejected') {
            statusText = 'Failed';
          }
          return {
            ...tx,
            status: statusText
          };
        });

        const combined = [...processedPromoData, ...virtualRankBonuses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBonuses(combined);
      } catch (error) {
        console.error('Error fetching promotion history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return new Date(dateString).toLocaleTimeString('en-US', options);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 pt-4 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-[#1A1A2E] mb-2 tracking-tight">
          Promotion Bonus History
        </h1>
        <p className="text-[#4A4A6A] text-sm font-medium">
          Track your rank achievement rewards and bi-monthly salary payouts.
        </p>
      </div>

      {/* Promotional Bonus Structure Table */}
      <GlassCard 
        hoverable={false}
        className="mb-10 p-6 md:p-8"
      >
        <div>
          <h2 className="text-lg font-extrabold text-[#1A1A2E] mb-6 flex items-center gap-2">
            <Trophy className="text-[#F310FD]" size={24} />
            Promotional Bonus Structure
          </h2>
          
          <div className="overflow-x-auto border border-[#E8E6F0] rounded-xl bg-white">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-[#E8E6F0] bg-slate-50 text-[10px] font-bold text-[#7A7A9A] uppercase tracking-widest">
                  <th className="px-6 py-4">Position / Level</th>
                  <th className="px-6 py-4">Team Requirement</th>
                  <th className="px-6 py-4">Salary Upto</th>
                  <th className="px-6 py-4">Bonus Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E6F0] text-xs font-semibold text-[#4A4A6A]">
                {promoRules.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF9FF] transition-colors duration-150">
                    <td className="px-6 py-3.5 text-[#1A1A2E] font-extrabold">{rule.level}</td>
                    <td className="px-6 py-3.5 text-[#4A4A6A] font-mono font-medium">{rule.team}</td>
                    <td className="px-6 py-3.5 text-[#F310FD] font-extrabold">{rule.salary}</td>
                    <td className="px-6 py-3.5 text-[#00D4AA] font-extrabold">{rule.bonus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-[#E8E6F0]">
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-[#E8E6F0] shadow-sm">
              <Calendar className="text-[#F310FD] shrink-0" size={20} />
              <p className="text-[11px] text-[#4A4A6A] font-semibold leading-normal">
                Salary is paid 2 times per month, on the 15th & month end.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-[#E8E6F0] shadow-sm">
              <Users className="text-[#F310FD] shrink-0" size={20} />
              <p className="text-[11px] text-[#4A4A6A] font-semibold leading-normal">
                Team count 30% strong leg - 70% from the other legs.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-[#FFF5F5] p-4 rounded-xl border border-[#FF6B35]/15 shadow-sm">
              <ShieldAlert className="text-[#FF6B35] shrink-0" size={20} />
              <p className="text-[11px] text-[#FF6B35] leading-normal font-extrabold uppercase">
                ONLY APPLY ON 300$ AND ABOVE ID'S.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* History List */}
      <GlassCard 
        hoverable={false}
        className="p-6 md:p-8"
      >
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-[#F310FD] animate-pulse font-bold text-sm">Loading promotion history...</div>
          ) : bonuses.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="mx-auto h-16 w-16 text-[#F310FD] mb-4" />
              <p className="text-[#1A1A2E] text-base font-extrabold">No promotion bonuses recorded yet.</p>
              <p className="text-[#4A4A6A] text-sm font-semibold mt-2">Achieve leadership ranks to unlock bonuses and salary.</p>
            </div>
          ) : (
            paginatedBonuses.map((tx, idx) => (
              <motion.div 
                key={tx._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-[#E8E6F0] rounded-xl p-4 sm:p-5 hover:border-[#F310FD]/15 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                    tx.type === 'bonus' 
                      ? 'bg-[#FDE8FE] text-[#F310FD] border-[#F310FD]/15' 
                      : tx.type === 'level_split'
                        ? 'bg-[#E8FBF1] text-[#00D4AA] border-[#00D4AA]/15'
                        : 'bg-[#FDE8FE] text-[#F310FD] border-[#F310FD]/15'
                  )}>
                    {tx.type === 'bonus' ? <Trophy size={24} /> : tx.type === 'level_split' ? <Award size={24} /> : <DollarSign size={24} />}
                  </div>
                  <div>
                    <h3 className="text-[#1A1A2E] font-extrabold text-sm sm:text-base">
                      {tx.type === 'bonus' ? 'Rank Achievement Bonus' : tx.type === 'level_split' ? `Level ${tx.level} Promo Split` : 'Leadership Salary'}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center text-xs text-[#7A7A9A] gap-1 font-bold">
                        <Calendar size={12} />
                        {formatDate(tx.createdAt)}
                      </div>
                      <div className="flex items-center text-xs text-[#7A7A9A] gap-1 font-bold">
                        <Clock size={12} />
                        {formatTime(tx.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right ml-auto md:ml-0">
                  <p className="text-lg sm:text-xl font-extrabold text-[#1A1A2E]">
                    +${tx.amount.toFixed(2)}
                  </p>
                  {(() => {
                    const status = tx.status?.toLowerCase();
                    if (status === 'approved' || status === 'success' || status === 'completed') {
                      return (
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8FBF1] text-[#10B981] border border-[#10B981]/15 uppercase tracking-wider">
                          Approved
                        </span>
                      );
                    } else if (status === 'pending') {
                      return (
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDE8FE] text-[#F310FD] border border-[#F310FD]/15 uppercase tracking-wider animate-pulse">
                          Pending
                        </span>
                      );
                    } else {
                      return (
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF5F5] text-[#FF6B35] border border-[#FF6B35]/15 uppercase tracking-wider">
                          {tx.status || 'Failed'}
                        </span>
                      );
                    }
                  })()}
                </div>
              </motion.div>
            ))
          )}

          {/* Pagination */}
          {!loading && bonuses.length > 0 && totalPages > 1 && (
            <div className="border-t border-[#E8E6F0] pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 relative z-10">
              <span className="text-xs text-[#7A7A9A] font-bold">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, bonuses.length)} of {bonuses.length} entries
              </span>

              <div className="flex items-center gap-1.5">
                <PremiumButton
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="py-1 px-3 text-xs"
                >
                  Previous
                </PremiumButton>
                
                {getPageNumbers().map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-2 text-xs text-slate-300 font-bold select-none">
                        ...
                      </span>
                    );
                  }
                  
                  return (
                    <PremiumButton
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      variant={currentPage === page ? "primary" : "outline"}
                      className="py-1 px-3 text-xs min-w-[32px] justify-center"
                    >
                      {page}
                    </PremiumButton>
                  );
                })}

                <PremiumButton
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="py-1 px-3 text-xs"
                >
                  Next
                </PremiumButton>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default PromotionalBonusHistory;
