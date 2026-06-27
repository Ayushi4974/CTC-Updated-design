import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const GlassCard = ({
  children,
  className = '',
  hoverable = true,
  animated = true,
  delay = 0,
  ...props
}) => {
  const cardClasses = clsx(
    "bg-white border border-[#E8E6F0] rounded-[16px] p-6 shadow-[0_4px_20px_rgba(26,26,46,0.08)]",
    hoverable && "hover:shadow-[0_8px_40px_rgba(243,16,253,0.12)] hover:border-[rgba(243,16,253,0.2)] hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
    className
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
          delay: delay
        }}
        className={cardClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default GlassCard;
