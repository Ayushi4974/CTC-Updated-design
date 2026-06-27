import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const s = status ? status.toLowerCase() : '';
  
  if (s === 'completed' || s === 'credited' || s === 'success' || s === 'active' || s === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8FBF1] text-[#10B981] border border-[#10B981]/15 shadow-[0_0_10px_rgba(16,185,129,0.1)] relative">
        <CheckCircle2 size={12} />
        <span className="capitalize">{status}</span>
        <span className="absolute inset-0 rounded-full border border-[#10B981] opacity-0 scale-100 animate-[statusPulse_2s_infinite]"></span>
      </span>
    );
  }
  
  if (s === 'rejected' || s === 'failed' || s === 'expired' || s === 'inactive') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEEAEE] text-[#EF4444] border border-[#EF4444]/15">
        <XCircle size={12} />
        <span className="capitalize">{status}</span>
      </span>
    );
  }
  
  if (s === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF6E8] text-[#F59E0B] border border-[#F59E0B]/15">
        <span className="flex gap-0.5 mr-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
        <span className="capitalize">{status}</span>
      </span>
    );
  }

  if (s === 'processing') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF6E8] text-[#FF6B35] border border-[#FF6B35]/15">
        <svg className="animate-spin h-3.5 w-3.5 text-[#FF6B35]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="capitalize">{status}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF9FF] text-[#4A4A6A] border border-[#E8E6F0]">
      <span className="capitalize">{status}</span>
    </span>
  );
};

const ModernTable = ({
  headers,
  data,
  renderRow,
  loading = false,
  emptyMessage = "No data available",
  className = ""
}) => {
  return (
    <div className={clsx("w-full overflow-hidden border border-[#E8E6F0] rounded-xl bg-white shadow-[0_4px_20px_rgba(26,26,46,0.08)]", className)}>
      <div className="overflow-x-auto hide-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#F8F7FF] to-[#F0EEFF] border-b border-[#E8E6F0] text-xs font-bold text-[#1A1A2E] uppercase tracking-wider">
              {headers.map((h, i) => (
                <th key={i} className="p-4 md:p-5 font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={rIdx} className="border-b border-[#E8E6F0] h-[60px]">
                  {headers.map((_, cIdx) => (
                    <td key={cIdx} className="p-4 md:p-5">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="p-12 text-center text-[#7A7A9A]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle size={32} className="text-[#B8B8D0]" />
                    <p className="font-semibold text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, idx) => {
                if (renderRow) {
                  return renderRow(item, idx);
                }
                
                return (
                  <tr 
                    key={idx} 
                    className="border-b border-[#E8E6F0] hover:bg-[rgba(243,16,253,0.04)] active:border-l-2 active:border-l-[#F310FD] active:bg-[rgba(243,16,253,0.08)] transition-all duration-200 h-[60px]"
                  >
                    {Object.values(item).map((val, cellIdx) => (
                      <td key={cellIdx} className="p-4 md:p-5 text-sm text-[#1A1A2E]">
                        {typeof val === 'string' && (val.toLowerCase() === 'completed' || val.toLowerCase() === 'credited' || val.toLowerCase() === 'success' || val.toLowerCase() === 'approved' || val.toLowerCase() === 'pending' || val.toLowerCase() === 'rejected' || val.toLowerCase() === 'failed') ? (
                          <StatusBadge status={val} />
                        ) : (
                          val
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModernTable;
