import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const PremiumButton = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline'
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  ...props
}) => {
  const baseClasses = "relative overflow-hidden rounded-xl font-bold tracking-wide transition-all duration-200 select-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  let variantClasses = "";
  let motionProps = {};

  if (variant === 'primary') {
    variantClasses = "bg-gradient-to-br from-[#F310FD] to-[#C70AD1] text-white border border-[rgba(243,16,253,0.3)] shadow-[0_8px_20px_rgba(243,16,253,0.25)] hover:from-[#C70AD1] hover:to-[#A508B0] hover:shadow-[0_12px_28px_rgba(243,16,253,0.35)] px-6 py-3";
    motionProps = {
      whileHover: { y: -2 },
      whileTap: { y: 0, scale: 0.98 }
    };
  } else if (variant === 'secondary') {
    variantClasses = "bg-[rgba(243,16,253,0.08)] border-2 border-[rgba(243,16,253,0.3)] text-[#F310FD] hover:border-[#F310FD] hover:bg-[rgba(243,16,253,0.15)] px-6 py-3";
    motionProps = {
      whileHover: { y: -1 },
      whileTap: { y: 0, scale: 0.98 }
    };
  } else if (variant === 'outline') {
    variantClasses = "bg-transparent border-2 border-[#E8E6F0] text-[#4A4A6A] hover:border-[#F310FD] hover:text-[#F310FD] px-6 py-3";
    motionProps = {
      whileHover: { y: -1 },
      whileTap: { y: 0, scale: 0.98 }
    };
  }

  const handleClick = (e) => {
    if (disabled) return;
    if (onClick) onClick(e);
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      className={clsx(baseClasses, variantClasses, className)}
      onClick={handleClick}
      {...(disabled ? {} : motionProps)}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default PremiumButton;
