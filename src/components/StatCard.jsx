import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import GlassCard from './GlassCard';

const AnimatedCounter = ({ value, duration = 1.0, format = 'number' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value) || 0;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const startTime = performance.now();
    const durationMs = duration * 1000;

    const updateCount = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      
      const currentVal = start + (end - start) * easeProgress;
      setDisplayValue(currentVal);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(updateCount);
  }, [value, duration]);

  const formatted = () => {
    if (format === 'currency') {
      return `$${displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (format === 'percentage') {
      return `${displayValue.toFixed(2)}%`;
    }
    return displayValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return <span>{formatted()}</span>;
};

const StatCard = ({
  icon,
  label,
  value,
  format = 'number',
  change,
  changeType = 'increase',
  animated = true,
  iconColor = 'primary',
  delay = 0,
  className = '',
  ...props
}) => {
  return (
    <GlassCard
      hoverable={true}
      animated={animated}
      delay={delay}
      className={clsx(
        "flex flex-col justify-between group overflow-hidden relative",
        className
      )}
      {...props}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs text-[#7A7A9A] uppercase tracking-[0.1em] font-bold leading-none">
            {label}
          </p>
        </div>
        <motion.div
          initial={animated ? { rotate: 0 } : false}
          animate={animated ? { rotate: 360 } : false}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay }}
          className={clsx(
            "w-12 h-12 rounded-[14px] flex items-center justify-center border transition-all duration-300 shrink-0",
            iconColor === 'primary' 
              ? "bg-gradient-to-br from-[rgba(243,16,253,0.08)] to-[rgba(0,212,170,0.08)] border-[rgba(243,16,253,0.15)] text-[#F310FD] group-hover:bg-[rgba(243,16,253,0.15)] group-hover:scale-110"
              : "bg-gradient-to-br from-[rgba(0,212,170,0.08)] to-[rgba(243,16,253,0.08)] border-[rgba(0,212,170,0.15)] text-[#00D4AA] group-hover:bg-[rgba(0,212,170,0.15)] group-hover:scale-110"
          )}
        >
          {icon}
        </motion.div>
      </div>

      <div className="mt-2">
        <h3 className="text-3xl font-extrabold text-[#1A1A2E] tracking-tight leading-none">
          {animated ? (
            <AnimatedCounter value={value} format={format} duration={1.0} />
          ) : (
            format === 'currency' 
              ? `$${parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : format === 'percentage'
              ? `${parseFloat(value).toFixed(2)}%`
              : parseFloat(value).toLocaleString()
          )}
        </h3>
        
        {change !== undefined && (
          <div className={clsx(
            "flex items-center gap-1 mt-2 text-xs font-semibold",
            changeType === 'increase' ? "text-[#10B981]" : "text-[#EF4444]"
          )}>
            <span>{changeType === 'increase' ? '▲' : '▼'}</span>
            <span>{Math.abs(change)}%</span>
            <span className="text-[#7A7A9A] font-normal">vs last week</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default StatCard;
export { AnimatedCounter };
