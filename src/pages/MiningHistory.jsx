import React, { useState, useEffect } from 'react';
import { Cpu, Gem, Play, Calendar, DollarSign, Percent, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import clsx from 'clsx';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';

const MiningHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/user/mining-history');
        setHistory(res.data);
      } catch (err) {
        console.error('Error fetching mining history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-7xl mx-auto pb-12 pt-4 px-4 sm:px-6 lg:px-8 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#FDE8FE] border border-[#F310FD]/15 flex items-center justify-center text-[#F310FD] shrink-0">
            <Cpu size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#1A1A2E] tracking-tight">
              Copy Trade History
            </h1>
            <p className="text-[#4A4A6A] text-sm font-medium">
              Detailed logs of all your copy trading sessions
            </p>
          </div>
        </div>

        <Link
          to="/package-history"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E8E6F0] text-[#1A1A2E] hover:text-[#F310FD] hover:border-[#F310FD]/15 hover:shadow-md transition-all font-bold text-sm shadow-sm group"
        >
          <History size={16} className="group-hover:rotate-[-20deg] transition-transform text-[#F310FD]" />
          View Package History
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F310FD]"></div>
        </div>
      ) : history.length === 0 ? (
        <GlassCard
          hoverable={false}
          className="p-16 flex flex-col items-center justify-center text-center relative overflow-hidden group border border-[#E8E6F0]"
        >
          <div className="w-20 h-20 rounded-full bg-[#FAF9FF] border border-[#E8E6F0] flex items-center justify-center mb-6 shadow-sm text-[#F310FD]">
            <Gem size={36} />
          </div>

          <h3 className="text-xl font-extrabold text-[#1A1A2E] mb-2 tracking-tight">
            No copy trade history found
          </h3>
          <p className="text-[#4A4A6A] mb-8 max-w-sm text-sm leading-relaxed font-semibold">
            You haven't initiated any copy trade sessions yet. Start your first session today to begin earning rewards!
          </p>

          <Link 
            to="/products" 
            className="bg-gradient-to-tr from-[#F310FD] to-[#C70AD1] hover:shadow-[0_8px_30px_rgba(243,16,253,0.3)] text-white px-8 py-3.5 rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Play size={16} fill="currentColor" />
            <span>Start Copy Trade Session</span>
          </Link>
        </GlassCard>
      ) : (
        <GlassCard
          hoverable={false}
          className="overflow-hidden p-0 border border-[#E8E6F0]"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E8E6F0] text-[10px] font-bold text-[#7A7A9A] uppercase tracking-widest">
                  <th className="p-4 md:p-5 md:pl-6">Date</th>
                  <th className="p-4 md:p-5">Amount</th>
                  <th className="p-4 md:p-5 hidden sm:table-cell">Yield %</th>
                  <th className="p-4 md:p-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E6F0]">
                {history.map((record, index) => (
                  <tr key={index} className="hover:bg-[#FAF9FF] transition-colors duration-150">
                    <td className="p-4 md:p-5 md:pl-6 text-sm text-[#4A4A6A] font-medium">
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                         <span className="flex items-center gap-1.5 whitespace-nowrap"><Calendar size={14} className="text-slate-400 shrink-0" /> {new Date(record.createdAt).toLocaleDateString()}</span>
                         <span className="text-xs text-[#7A7A9A] font-semibold whitespace-nowrap">{new Date(record.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="p-4 md:p-5">
                      <div className="flex items-center gap-0.5 text-sm font-extrabold text-[#00D4AA]">
                        <DollarSign size={14} />
                        {record.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="p-4 md:p-5 text-sm font-extrabold text-[#1A1A2E] hidden sm:table-cell">
                      <div className="flex items-center gap-0.5">
                        {(record.percentage / 2).toFixed(2)} <Percent size={10} className="text-slate-400" />
                      </div>
                    </td>
                    <td className="p-4 md:p-5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E8FBF1] text-[#10B981] border border-[#10B981]/15">
                        Credited
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

    </div>
  );
};

export default MiningHistory;
