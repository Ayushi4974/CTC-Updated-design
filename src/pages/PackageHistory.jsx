import React, { useState, useEffect } from 'react';
import { Package, Calendar, DollarSign, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import api from '../api';
import clsx from 'clsx';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';

const PackageHistory = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriods, setSelectedPeriods] = useState({});
  const [stakingLoading, setStakingLoading] = useState({});

  const handleSelectPeriod = (pkgId, period) => {
    setSelectedPeriods(prev => ({ ...prev, [pkgId]: period }));
  };

  const handleStartStaking = async (pkgId) => {
    const period = selectedPeriods[pkgId];
    if (!period) {
      toast.error('Please select a staking duration first.');
      return;
    }
    try {
      setStakingLoading(prev => ({ ...prev, [pkgId]: true }));
      const res = await api.post('/package/start-staking', { userPackageId: pkgId, period });
      toast.success(res.data.message || 'Staking activated successfully!');
      const refreshed = await api.get('/package/my-packages');
      setPackages(refreshed.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to activate staking.');
    } finally {
      setStakingLoading(prev => ({ ...prev, [pkgId]: false }));
    }
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await api.get('/package/my-packages');
        setPackages(res.data);
      } catch (err) {
        console.error('Error fetching package history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  return (
    <div className="max-w-7xl mx-auto pb-12 pt-4 px-4 sm:px-6 lg:px-8 min-h-screen">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-[#FDE8FE] border border-[#F310FD]/15 flex items-center justify-center text-[#F310FD] shrink-0">
          <Package size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A2E] tracking-tight">
            Package History
          </h1>
          <p className="text-[#4A4A6A] text-sm font-medium">
            Manage and track all your active and past investment packages
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F310FD]"></div>
        </div>
      ) : packages.length === 0 ? (
        <GlassCard 
          hoverable={false}
          className="p-16 flex flex-col items-center justify-center text-center relative overflow-hidden border border-[#E8E6F0]"
        >
          <div className="w-20 h-20 rounded-full bg-[#FAF9FF] flex items-center justify-center mb-4 border border-[#E8E6F0] text-[#F310FD]">
            <Package size={32} />
          </div>
          <h3 className="text-xl font-extrabold text-[#1A1A2E] mb-2">No packages found</h3>
          <p className="text-[#4A4A6A] max-w-sm mb-6 text-sm leading-relaxed font-semibold">You haven't purchased any investment packages yet. Start your journey by choosing a plan.</p>
          <Link to="/products">
            <PremiumButton variant="primary">
              View All Packages
            </PremiumButton>
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg, index) => (
            <GlassCard
              key={index}
              hoverable={true}
              className="p-6 relative overflow-hidden group border border-[#E8E6F0] transition-all duration-300"
            >
              <div className="absolute top-0 right-0 p-4">
                <span className={clsx(
                  "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  pkg.status === 'active' 
                    ? 'bg-[#E8FBF1] text-[#10B981] border-[#10B981]/15' 
                    : pkg.status === 'upgraded'
                      ? 'bg-[#FDE8FE] text-[#F310FD] border-[#F310FD]/15'
                      : pkg.status === 'completed'
                        ? 'bg-slate-100 text-[#7A7A9A] border-[#E8E6F0]'
                        : pkg.status === 'pending'
                          ? 'bg-[#FFF6E8] text-[#FF6B35] border-[#FF6B35]/15'
                          : 'bg-[#FFF5F5] text-[#FF6B35] border-[#FF6B35]/15'
                )}>
                  {pkg.status}
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#FDE8FE] flex items-center justify-center border border-[#F310FD]/15 text-[#F310FD] shrink-0">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#1A1A2E] tracking-tight">{pkg.packageId?.name || 'Standard Package'}</h3>
                    <p className="text-sm font-extrabold text-[#00D4AA]">${pkg.amount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-[#FAF9FF] p-3 rounded-xl border border-[#E8E6F0]">
                    <p className="text-[10px] text-[#7A7A9A] uppercase font-bold mb-1">Daily ROI</p>
                    <p className="text-sm font-extrabold text-[#1A1A2E]">{pkg.dailyProfitPercent}%</p>
                  </div>
                  <div className="bg-[#FAF9FF] p-3 rounded-xl border border-[#E8E6F0]">
                    <p className="text-[10px] text-[#7A7A9A] uppercase font-bold mb-1">Total Earned</p>
                    <p className="text-sm font-extrabold text-[#00D4AA]">${pkg.totalEarned.toFixed(2)}</p>
                  </div>
                </div>

                {!pkg.isManual ? (
                  (pkg.stakingEnabled || pkg.isStaked) ? (
                    <div className="bg-[#FDE8FE]/30 p-4 rounded-xl border border-[#F310FD]/15 mt-2">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] text-[#F310FD] uppercase font-extrabold tracking-wider">Auto-Compounding Staking</p>
                        <span className="px-2 py-0.5 rounded-full bg-[#E8FBF1] border border-[#10B981]/15 text-[#10B981] text-[9px] font-bold uppercase">Active</span>
                      </div>
                      <div className="flex justify-between items-center mb-1.5 text-xs">
                        <span className="text-[#7A7A9A] font-semibold">Duration:</span>
                        <span className="font-bold text-[#1A1A2E]">{pkg.stakingPeriod || pkg.stakingDuration} Days (Locked)</span>
                      </div>
                      <div className="flex justify-between items-center mb-1.5 text-xs">
                        <span className="text-[#7A7A9A] font-semibold">Compound Bal:</span>
                        <span className="font-extrabold text-[#F310FD]">${Number(pkg.compoundingBalance || pkg.amount).toFixed(2)}</span>
                      </div>
                      {pkg.stakingStartDate && (
                        <div className="flex justify-between items-center mb-1.5 text-xs">
                          <span className="text-[#7A7A9A] font-semibold">Start Date:</span>
                          <span className="font-semibold text-[#4A4A6A]">{new Date(pkg.stakingStartDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {pkg.stakingEndDate && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#7A7A9A] font-semibold">End Date:</span>
                          <span className="font-semibold text-[#4A4A6A]">{new Date(pkg.stakingEndDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  ) : pkg.status === 'active' ? (
                    <div className="bg-[#FAF9FF] p-4 rounded-xl border border-[#E8E6F0] mt-2 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] text-[#7A7A9A] uppercase font-bold tracking-wider">Auto-Compounding Staking</p>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[#7A7A9A] text-[9px] font-bold uppercase">Disabled</span>
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-[#7A7A9A] font-bold uppercase">Select Staking Duration</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[30, 90, 180, 360].map((d) => (
                            <PremiumButton
                              key={d}
                              type="button"
                              onClick={() => handleSelectPeriod(pkg._id, d)}
                              variant={selectedPeriods[pkg._id] === d ? "primary" : "outline"}
                              className="py-1 px-1 text-xs justify-center font-bold"
                            >
                              {d}d
                            </PremiumButton>
                          ))}
                        </div>
                      </div>

                      <PremiumButton
                        type="button"
                        onClick={() => handleStartStaking(pkg._id)}
                        disabled={!selectedPeriods[pkg._id] || stakingLoading[pkg._id]}
                        variant="primary"
                        className="w-full text-xs font-bold justify-center"
                      >
                        {stakingLoading[pkg._id] ? 'Activating...' : 'Enable Staking'}
                      </PremiumButton>
                    </div>
                  ) : (
                    <div className="bg-[#FAF9FF] p-4 rounded-xl border border-[#E8E6F0] mt-2 flex justify-between items-center text-xs">
                      <span className="text-[#7A7A9A] uppercase text-[9px] font-bold tracking-wider">Auto-Compounding Staking</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[#7A7A9A] text-[9px] font-bold uppercase">Not Activated</span>
                    </div>
                  )
                ) : (
                  <div className="bg-[#FAF9FF] p-4 rounded-xl border border-[#E8E6F0] mt-2 flex flex-col gap-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#7A7A9A] font-bold uppercase text-[9px] tracking-wider">Manual Payment Info</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[#7A7A9A] text-[9px] font-bold uppercase">{pkg.networkType}</span>
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-[10px] text-[#7A7A9A] uppercase font-bold">Transaction Hash</span>
                      <span className="font-mono text-[#1A1A2E] select-all break-all bg-white border border-[#E8E6F0] p-1.5 rounded-md leading-relaxed text-[11px]">
                        {pkg.txHash}
                      </span>
                    </div>
                    {pkg.status === 'rejected' && (
                      <div className="bg-[#FFF5F5] border border-[#FF6B35]/15 rounded-xl p-2.5 mt-2 space-y-1">
                        <span className="text-[#FF6B35] font-bold text-[10px] block">REJECTION REASON:</span>
                        <p className="text-[#FF6B35] italic text-[11px]">"{pkg.rejectionReason || 'Details incorrect or not matching deposit wallet.'}"</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7A7A9A] flex items-center gap-1 font-semibold"><Calendar size={12}/> Purchase Date</span>
                    <span className="text-[#1A1A2E] font-bold">{new Date(pkg.startDate || pkg.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {!pkg.isManual && (() => {
                  const isZeroPin = pkg.isZeroPin || pkg.packageId?.isZeroPin;
                  const multiplier = isZeroPin ? 1 : 4;
                  return (
                    <>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                        <div 
                          className="h-full bg-gradient-to-r from-[#F310FD] to-[#C70AD1] rounded-full" 
                          style={{ width: `${Math.min((pkg.totalEarned / (pkg.amount * multiplier)) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-[#7A7A9A] text-center font-bold">Earnings Cap: {multiplier}x (${pkg.amount * multiplier} Max)</p>
                    </>
                  );
                })()}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Footer Notes */}
      <div className="mt-12 text-center border-t border-[#E8E6F0] pt-8">
        <p className="text-xs text-[#7A7A9A] font-bold flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-[#10B981]" />
          All investments are secured and tracked on the BEP-20 blockchain network.
        </p>
      </div>
    </div>
  );
};

export default PackageHistory;
