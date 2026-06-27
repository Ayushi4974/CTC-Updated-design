import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const ValidatedInput = React.forwardRef(({
  label,
  error,
  success,
  className = '',
  containerClassName = '',
  id,
  type = 'text',
  placeholder,
  ...props
}, ref) => {
  return (
    <div className={clsx("flex flex-col gap-2 w-full", containerClassName)}>
      {label && (
        <label 
          htmlFor={id} 
          className="text-xs font-bold text-[#4A4A6A] uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={type}
          ref={ref}
          placeholder={placeholder}
          className={clsx(
            "w-full bg-white border px-4 py-3.5 rounded-xl font-medium text-sm text-[#1A1A2E] placeholder-[#7A7A9A] transition-all duration-200 outline-none",
            error 
              ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-4 focus:ring-[#EF4444]/8 animate-[shake_0.4s_ease-in-out]" 
              : success 
              ? "border-[#10B981] focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/8" 
              : "border-[#E8E6F0] focus:border-[#F310FD] focus:ring-4 focus:ring-[#F310FD]/8",
            className
          )}
          {...props}
        />
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          {error && (
            <svg className="w-5 h-5 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {success && (
            <svg className="w-5 h-5 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-[#EF4444] font-medium mt-0.5"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

ValidatedInput.displayName = 'ValidatedInput';

export default ValidatedInput;
