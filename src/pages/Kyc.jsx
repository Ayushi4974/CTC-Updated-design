import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CreditCard, FileText, Building, UploadCloud, ChevronRight, ChevronLeft, CheckCircle2, ShieldCheck, Lock, X, Clock } from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';
import ValidatedInput from '../components/ValidatedInput';

const steps = [
  { id: 1, name: 'Profile', icon: User },
  { id: 2, name: 'Primary ID', icon: CreditCard },
  { id: 3, name: 'Bill Proof', icon: FileText },
  { id: 4, name: 'Bank Details', icon: Building },
];

const FileUploadBox = ({ label, id, uploadedFiles, isUploading, handleRemoveFile, handleFileUpload }) => {
  const isUploaded = !!uploadedFiles[id];
  const isLoading = isUploading[id];
  
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-xs font-bold text-[#4A4A6A] uppercase tracking-wider mb-1">{label}</label>}
      
      {isLoading ? (
        <div className="relative border border-[#E8E6F0] bg-[#FAF9FF] rounded-2xl h-40 flex flex-col items-center justify-center overflow-hidden">
          <div className="w-full h-full bg-[#F0EEF6] animate-pulse absolute inset-0"></div>
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#F310FD] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[#F310FD] text-sm font-semibold animate-pulse">Encrypting & Uploading...</span>
          </div>
        </div>
      ) : isUploaded ? (
        <div className="relative border-2 border-[#00D4AA] bg-[#FAF9FF] rounded-2xl h-40 flex flex-col items-center justify-center overflow-hidden group shadow-sm">
          <img src={uploadedFiles[id]} alt={label} className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="relative z-10 flex flex-col items-center">
            <CheckCircle2 className="text-[#00D4AA] mb-2" size={32} />
            <span className="text-white font-bold drop-shadow-sm">Uploaded</span>
          </div>
          <button 
            onClick={() => handleRemoveFile(id)}
            className="absolute top-3 right-3 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white rounded-full p-1.5 transition-colors z-20 shadow cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label 
          htmlFor={`file-upload-${id}`}
          className="relative border-2 border-dashed border-[#F310FD]/20 bg-[rgba(243,16,253,0.03)] hover:border-[#F310FD] hover:bg-[rgba(243,16,253,0.06)] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 group hover:shadow-[0_4px_12px_rgba(243,16,253,0.06)] h-40 w-full"
        >
          <input 
            id={`file-upload-${id}`}
            type="file" 
            accept="image/*"
            className="hidden" 
            onChange={(e) => handleFileUpload(e, id)} 
          />
          <UploadCloud className="text-[#7A7A9A] group-hover:text-[#F310FD] transition-colors" size={32} />
          <div className="text-center">
            <p className="text-sm font-bold text-[#F310FD]">Click to upload</p>
            <p className="text-[10px] text-[#7A7A9A] mt-1">PNG, JPG, JPEG (MAX. 5MB)</p>
          </div>
        </label>
      )}
    </div>
  );
};

const Kyc = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [kycStatus, setKycStatus] = useState(null); // 'none', 'pending', 'approved', 'rejected'
  const [loading, setLoading] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [actualFiles, setActualFiles] = useState({});
  const [isUploading, setIsUploading] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    aadharNumber: '',
    panNumber: ''
  });

  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const res = await api.get('/kyc/status');
        if (res.data) {
          setKycStatus(res.data.status);
          if (res.data.status === 'approved') setCurrentStep(6);
          else if (res.data.status === 'pending') setCurrentStep(5);
        } else {
          setKycStatus('none');
        }
      } catch (err) {
        console.error('Error fetching KYC status:', err);
        setKycStatus('none');
      } finally {
        setLoading(false);
      }
    };
    fetchKycStatus();
  }, []);

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        payload.append(key, formData[key]);
      });
      
      Object.keys(actualFiles).forEach(key => {
        payload.append(key, actualFiles[key]);
      });

      const response = await api.post('/kyc/upload', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success(response.data.message || 'KYC submitted successfully!');
      setCurrentStep(5);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleFileUpload = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      setActualFiles(prev => ({ ...prev, [key]: file }));
      setIsUploading(prev => ({ ...prev, [key]: true }));
      
      const previewUrl = URL.createObjectURL(file);
      
      setTimeout(() => {
        setUploadedFiles(prev => ({
          ...prev,
          [key]: previewUrl
        }));
        setIsUploading(prev => ({ ...prev, [key]: false }));
      }, 600);
    }
  };

  const handleRemoveFile = (key) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[key];
      return newFiles;
    });
    setActualFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[key];
      return newFiles;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 pt-4 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-ink-900 mb-3"
        >
          KYC <span className="text-brand-600">Verification</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-ink-500 max-w-2xl text-sm"
        >
          Complete your identity verification to unlock full platform access and secure your account.
        </motion.p>
      </div>

      {/* Stepper */}
      <div className="mb-8 md:mb-12 relative px-2 md:px-12">
        <div className="absolute top-5 md:top-7 left-[28px] right-[28px] md:left-[76px] md:right-[76px] z-0 flex items-center">
          <div className="w-full h-[3px] bg-[#E8E6F0] rounded-full relative">
            <div 
              className="h-full bg-gradient-to-r from-[#F310FD] to-[#00D4AA] rounded-full transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(243,16,253,0.2)]"
              style={{ width: `${Math.min(((currentStep - 1) / 3) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-start relative z-10">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const Icon = step.icon;
            const isClickable = step.id < currentStep;

            return (
              <button 
                key={step.id} 
                onClick={isClickable ? () => setCurrentStep(step.id) : undefined}
                disabled={!isClickable}
                className="flex flex-col items-center gap-2 md:gap-3 focus:outline-none group cursor-default disabled:cursor-default"
              >
                <div 
                  className={clsx(
                    "w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 relative border-2",
                    isActive 
                      ? 'bg-gradient-to-br from-[#F310FD] to-[#C70AD1] border-white text-white scale-110 shadow-[0_0_15px_rgba(243,16,253,0.3)]' 
                      : isCompleted
                        ? 'bg-[#00D4AA] border-transparent text-white shadow-sm cursor-pointer group-hover:scale-105'
                        : 'bg-white border-[#E8E6F0] text-[#7A7A9A]'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-white animate-pulse" />
                  ) : (
                    <Icon className={clsx("w-5 h-5 md:w-6 md:h-6 transition-transform", isActive ? 'text-white scale-110' : 'text-[#7A7A9A]')} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content Container */}
      <GlassCard 
        hoverable={false}
        className="p-6 md:p-10 overflow-hidden"
      >
        <div className="min-h-[350px] relative z-10">
          {/* Step 1: Profile */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center h-full py-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[rgba(243,16,253,0.03)] border border-[#F310FD]/15 rounded-full text-xs font-bold text-[#F310FD] mb-6">
                  <ShieldCheck size={14} />
                  KYC Mandatory Requirement
                </div>
                
                <h2 className="text-2xl font-extrabold text-[#1A1A2E] mb-4">Profile Verification</h2>
                <p className="text-[#4A4A6A] mb-6 leading-relaxed text-sm font-medium">
                  Your profile photo is used to securely verify your identity. This is required to process withdrawals and ensure platform integrity.
                </p>
                
                <div className="flex items-center gap-3 bg-[#E8FBF1] border border-[#10B981]/15 p-4 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#10B981]/25 text-[#10B981]">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h4 className="text-[#10B981] font-bold text-sm">SSL Secured</h4>
                    <p className="text-xs text-[#4A4A6A] font-semibold">Encrypted 256-bit Connection</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                {isUploading['profile'] ? (
                  <div className="relative w-56 h-56 rounded-full border-4 border-[#E8E6F0] bg-[#FAF9FF] overflow-hidden flex flex-col items-center justify-center">
                    <div className="w-full h-full bg-[#F0EEF6] animate-pulse absolute inset-0"></div>
                    <div className="w-10 h-10 border-4 border-[#F310FD] border-t-transparent rounded-full animate-spin relative z-10 mb-2"></div>
                    <span className="text-[#F310FD] text-xs font-bold animate-pulse relative z-10">Encrypting...</span>
                  </div>
                ) : uploadedFiles['profile'] ? (
                  <div className="relative w-56 h-56 rounded-full border-4 border-[#00D4AA] overflow-hidden shadow-md group">
                    <img src={uploadedFiles['profile']} alt="Profile Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => handleRemoveFile('profile')}
                        className="bg-white text-[#1A1A2E] px-4 py-2 rounded-xl font-bold text-xs hover:scale-105 transition-transform shadow-md cursor-pointer"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <label 
                    htmlFor="profile-upload"
                    className="relative group cursor-pointer"
                  >
                    <input 
                      id="profile-upload"
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, 'profile')} 
                    />
                    <div className="absolute inset-0 bg-[#F310FD]/5 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    <div className="relative w-56 h-56 rounded-full border-2 border-dashed border-[#F310FD]/20 bg-[rgba(243,16,253,0.03)] backdrop-blur-sm flex flex-col items-center justify-center gap-3 hover:border-[#F310FD] hover:bg-[rgba(243,16,253,0.06)] transition-all duration-300 shadow-sm">
                      <UploadCloud className="text-[#7A7A9A] group-hover:text-[#F310FD] transition-colors" size={40} />
                      <div className="text-center">
                        <span className="block text-sm font-bold text-[#4A4A6A] group-hover:text-[#1A1A2E]">Select Photo</span>
                        <span className="block text-[10px] text-[#7A7A9A] mt-1">Click to browse</span>
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Primary ID */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-extrabold text-[#1A1A2E]">Primary Photo ID</h2>
                <div className="px-2.5 py-1 bg-[#E8FBF1] rounded-md text-[10px] font-bold text-[#10B981] uppercase tracking-wider flex items-center gap-1.5 border border-[#10B981]/10"><Lock size={12}/> Secured</div>
              </div>
              <p className="text-[#4A4A6A] mb-8 text-sm font-medium">Upload a valid government-issued photo ID (Passport, National ID, or Driver's License).</p>
              
              <div className="mb-8">
                <ValidatedInput 
                  label="ID Document / Passport / License Number"
                  type="text" 
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your document number"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUploadBox label="Front Side (ID / License) or Passport Photo Page" id="aadharFront" uploadedFiles={uploadedFiles} isUploading={isUploading} handleRemoveFile={handleRemoveFile} handleFileUpload={handleFileUpload} />
                <FileUploadBox label="Back Side of Document (if applicable)" id="aadharBack" uploadedFiles={uploadedFiles} isUploading={isUploading} handleRemoveFile={handleRemoveFile} handleFileUpload={handleFileUpload} />
              </div>
            </div>
          )}

          {/* Step 3: Address Proof */}
          {currentStep === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-extrabold text-[#1A1A2E]">Proof of Address</h2>
                <div className="px-2.5 py-1 bg-[#E8FBF1] rounded-md text-[10px] font-bold text-[#10B981] uppercase tracking-wider flex items-center gap-1.5 border border-[#10B981]/10"><Lock size={12}/> Secured</div>
              </div>
              <p className="text-[#4A4A6A] mb-8 text-sm font-medium">Upload a document showing your current address (Utility Bill or Bank Statement, issued within the last 3 months).</p>
              
              <div className="mb-8">
                <ValidatedInput 
                  label="Document Reference Number (Optional)"
                  type="text" 
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. Account Number, Invoice Number, Ref No"
                  className="uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUploadBox label="Utility Bill / Bank Statement Page 1" id="panFront" uploadedFiles={uploadedFiles} isUploading={isUploading} handleRemoveFile={handleRemoveFile} handleFileUpload={handleFileUpload} />
                <FileUploadBox label="Bill / Statement Additional Page (if any) or Selfie with ID" id="panAgreement" uploadedFiles={uploadedFiles} isUploading={isUploading} handleRemoveFile={handleRemoveFile} handleFileUpload={handleFileUpload} />
              </div>
            </div>
          )}

          {/* Step 4: Bank Details */}
          {currentStep === 4 && (
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-extrabold text-[#1A1A2E]">Bank Account Details</h2>
                <div className="px-2.5 py-1 bg-[#E8FBF1] rounded-md text-[10px] font-bold text-[#10B981] uppercase tracking-wider flex items-center gap-1.5 border border-[#10B981]/10"><Lock size={12}/> Secured</div>
              </div>
              <p className="text-[#4A4A6A] mb-8 text-sm font-medium">Provide bank details for your future withdrawals.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <ValidatedInput 
                  label="Account Holder Name"
                  type="text" 
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  placeholder="Name as per Bank"
                />
                <ValidatedInput 
                  label="Bank Name"
                  type="text" 
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="e.g. State Bank of India"
                />
                <ValidatedInput 
                  label="Account Number"
                  type="text" 
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter Account Number"
                />
                <ValidatedInput 
                  label="IFSC Code"
                  type="text" 
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  placeholder="SBIN0001234"
                  className="uppercase font-mono"
                />
              </div>
              
              <div>
                <ValidatedInput 
                  label="Branch Name"
                  type="text" 
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  placeholder="Enter Branch Name"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-10 pt-6 border-t border-[#E8E6F0] flex items-center justify-between relative z-10">
          <div>
            {currentStep > 1 && currentStep < 5 && (
              <PremiumButton 
                variant="outline"
                onClick={prevStep}
              >
                <ChevronLeft size={18} /> Back
              </PremiumButton>
            )}
          </div>
          
          {currentStep < 5 && (
            <PremiumButton 
              variant="primary"
              onClick={currentStep === 4 ? handleSubmit : nextStep}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : currentStep === 4 ? 'Submit Verification' : 'Next Step'} 
              {currentStep < 4 && <ChevronRight size={18} />}
              {currentStep === 4 && !isSubmitting && <CheckCircle2 size={18} />}
            </PremiumButton>
          )}
        </div>

        {/* Step 5: Pending State */}
        {currentStep === 5 && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 z-50 text-center animate-[pageEnterLight_0.4s_ease]">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-[#FFF6E8] rounded-full flex items-center justify-center mb-6 border border-[#F59E0B]/15 text-[#F59E0B] shadow-sm"
            >
              <Clock size={40} />
            </motion.div>
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-4">Verification Pending</h2>
            <p className="text-[#4A4A6A] mb-8 max-w-md text-sm leading-relaxed font-medium">
              Your KYC details are currently under review by our team. This usually takes 24-48 hours. We will notify you once verified.
            </p>
            <button 
              onClick={() => setKycStatus('none') || setCurrentStep(1)}
              className="text-[#F310FD] hover:underline text-xs font-bold transition-colors cursor-pointer"
            >
              Need to update details? Click here to re-upload (will reset status)
            </button>
          </div>
        )}

        {/* Step 6: Verified State */}
        {currentStep === 6 && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 z-50 text-center animate-[pageEnterLight_0.4s_ease]">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-[#E8FBF1] rounded-full flex items-center justify-center mb-6 border border-[#10B981]/15 shadow-sm text-[#10B981]"
            >
              <ShieldCheck size={40} />
            </motion.div>
            
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-2">Account Verified</h2>
            <p className="text-[#10B981] font-bold mb-6 tracking-widest uppercase text-xs">Level 1 Verified</p>
            
            <p className="text-[#4A4A6A] mb-10 max-w-md leading-relaxed text-sm font-medium font-sans">
              Congratulations! Your identity has been successfully verified. You now have full access to all platform features, including withdrawals.
            </p>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="bg-[#FAF9FF] border border-[#E8E6F0] p-4 rounded-xl">
                <p className="text-[10px] text-[#7A7A9A] font-bold uppercase mb-1">Status</p>
                <p className="text-[#10B981] font-bold text-sm">Active</p>
              </div>
              <div className="bg-[#FAF9FF] border border-[#E8E6F0] p-4 rounded-xl">
                <p className="text-[10px] text-[#7A7A9A] font-bold uppercase mb-1">Withdraw Limit</p>
                <p className="text-[#1A1A2E] font-bold text-sm">Unlimited</p>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default Kyc;
