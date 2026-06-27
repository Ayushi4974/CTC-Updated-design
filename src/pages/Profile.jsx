import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Calendar, Link as LinkIcon, 
  Copy, Check, Shield, KeyRound, Edit3, ShieldCheck, QrCode
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../redux/slices/authSlice';
import { useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';
import ValidatedInput from '../components/ValidatedInput';
import clsx from 'clsx';

const InputField = ({ label, value, icon: Icon, fullWidth = false, colorClass = "text-[#F310FD]", editable = false, type = "text", name, onChange }) => (
  <div className={clsx(
    "group relative bg-white rounded-xl p-4 border border-[#E8E6F0] transition-all duration-300 shadow-[0_4px_12px_rgba(240,232,255,0.03)] hover:shadow-[0_8px_24px_rgba(240,232,255,0.06)] hover:border-[#F310FD]/20",
    fullWidth ? 'col-span-1 md:col-span-2' : 'col-span-1'
  )}>
    <div className="flex flex-col relative z-10 w-full">
      <label className="flex items-center gap-2 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1.5">
        <Icon size={12} className={`${colorClass}`} /> {label}
      </label>
      {editable ? (
        type === "textarea" ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows={2}
            className="bg-white border-[1.5px] border-[#E5E7EB] focus:border-[#F310FD] focus:ring-[3px] focus:ring-[#F310FD]/10 rounded-[10px] px-3 py-2 text-sm text-[#1A1A2E] focus:outline-none w-full transition-all"
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="bg-white border-[1.5px] border-[#E5E7EB] focus:border-[#F310FD] focus:ring-[3px] focus:ring-[#F310FD]/10 rounded-[10px] px-3 py-2 text-sm text-[#1A1A2E] focus:outline-none w-full transition-all"
          />
        )
      ) : (
        <div className="text-sm md:text-base font-bold text-[#1A1A2E] tracking-wide break-all w-full">{value}</div>
      )}
    </div>
  </div>
);

const Profile = () => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const dispatch = useDispatch();
  const { profile, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const currentUser = profile || user;

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    address: ''
  });

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setEditData({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        mobile: currentUser.mobile || '',
        address: currentUser.address || ''
      });
    }
  }, [currentUser]);

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    if (!editData.fullName || !editData.email) {
      toast.error('Name and Email are required');
      return;
    }
    try {
      const response = await api.put('/user/profile', editData);
      toast.success(response.data.message || 'Profile updated successfully!');
      dispatch(fetchProfile());
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All fields are required');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setIsSavingPassword(true);
      await api.put('/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password updated successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const profileData = {
    initial: currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U',
    name: currentUser?.fullName || 'User',
    email: currentUser?.email || 'N/A',
    mobile: currentUser?.mobile || 'Not set',
    address: currentUser?.address || 'Not set',
    memberSince: currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A',
    referralLink: currentUser?.userId ? `${window.location.origin}/register?ref=${currentUser.userId}` : 'N/A',
    isKYCVerified: currentUser?.isKYCVerified || false
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileData.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-12 pt-4 px-4 sm:px-6 lg:px-8 box-border">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6 mb-8 w-full">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-extrabold text-[#1A1A2E] tracking-tight"
        >
          Profile
        </motion.h1>
        
        {isEditing ? (
          <div className="flex gap-3 w-full md:w-auto">
            <PremiumButton 
              onClick={handleSaveProfile}
              variant="primary"
            >
              Save Changes
            </PremiumButton>
            <PremiumButton 
              onClick={() => {
                setIsEditing(false);
                setEditData({
                  fullName: currentUser?.fullName || '',
                  email: currentUser?.email || '',
                  mobile: currentUser?.mobile || '',
                  address: currentUser?.address || ''
                });
              }}
              variant="outline"
            >
              Cancel
            </PremiumButton>
          </div>
        ) : (
          <PremiumButton 
            onClick={() => setIsEditing(true)}
            variant="primary"
            className="w-full md:w-auto"
          >
            <Edit3 size={16} /> Edit Profile
          </PremiumButton>
        )}
      </div>

      <GlassCard 
        hoverable={false}
        className="p-6 md:p-10 shadow-custom relative overflow-hidden"
      >
        {/* User Top Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-10 w-full">
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6">
            
            {/* Dynamic Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full bg-[#FDE8FE] p-[3px] border border-[#FDE8FE] relative z-10">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#F310FD] to-[#C70AD1] flex items-center justify-center text-3xl font-black text-white shadow-sm">
                  {profileData.initial}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-start">
              <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2 flex items-center gap-2 tracking-tight">
                {profileData.name}
                {profileData.isKYCVerified && (
                  <div className="bg-[#E8FBF1] border border-[#10B981]/15 rounded-full p-1" title="Verified KYC">
                    <ShieldCheck size={14} className="text-[#10B981]" />
                  </div>
                )}
              </h2>
              
              <div className="inline-flex items-center gap-2 bg-[#FAF9FF] border border-[#E8E6F0] px-3 py-1.5 rounded-lg text-[11px] font-bold">
                <span className="text-[#7A7A9A] uppercase tracking-wider">User ID:</span>
                <span className="text-[#1A1A2E] font-mono">{currentUser?.userId || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-slate-100 my-8"></div>

        {/* Personal Information */}
        <div className="mb-10 relative">
          <h3 className="text-[#1A1A2E] font-extrabold text-sm mb-6 flex items-center gap-2 relative z-10 uppercase tracking-widest">
            <User size={16} className="text-[#F310FD]" /> Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
            <InputField 
              label="Full Name" 
              value={isEditing ? editData.fullName : profileData.name} 
              icon={User} 
              colorClass="text-[#F310FD]" 
              editable={isEditing}
              name="fullName"
              onChange={handleEditChange}
            />
            <InputField 
              label="Email" 
              value={isEditing ? editData.email : profileData.email} 
              icon={Mail} 
              colorClass="text-[#F310FD]" 
              editable={isEditing}
              name="email"
              onChange={handleEditChange}
            />
            <InputField 
              label="Mobile" 
              value={isEditing ? editData.mobile : profileData.mobile} 
              icon={Phone} 
              colorClass="text-[#F310FD]" 
              editable={isEditing}
              name="mobile"
              onChange={handleEditChange}
            />
            <InputField 
              label="Address" 
              value={isEditing ? editData.address : profileData.address} 
              icon={MapPin} 
              colorClass="text-[#F310FD]" 
              editable={isEditing}
              fullWidth 
              type="textarea"
              name="address"
              onChange={handleEditChange}
            />
            <InputField 
              label="Member Since" 
              value={profileData.memberSince} 
              icon={Calendar} 
              colorClass="text-[#F310FD]" 
            />
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-slate-100 my-8"></div>

        {/* Referral Link */}
        <div className="mb-12 relative">
          <h3 className="text-[#1A1A2E] font-extrabold text-sm mb-6 flex items-center gap-2 relative z-10 uppercase tracking-widest">
            <LinkIcon size={16} className="text-[#F310FD]" /> Referral Link
          </h3>
          
          <div className="bg-[#FAF9FF] border border-[#E8E6F0] rounded-2xl p-3 pl-4 md:pl-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 relative z-10 w-full overflow-hidden box-border shadow-sm">
            <div className="flex-1 w-full">
              <label className="block text-[10px] font-bold text-[#F310FD] uppercase tracking-wider mb-1 mt-1 md:mt-0">Your Unique Link</label>
              <div className="text-xs sm:text-sm font-mono text-[#1A1A2E] break-all pb-1 md:pb-0 tracking-wide w-full">{profileData.referralLink}</div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
              <PremiumButton 
                onClick={() => setShowQr(!showQr)}
                variant="outline"
                className="flex-1 sm:flex-none py-3"
                title="Generate QR Code"
              >
                <QrCode size={18} />
              </PremiumButton>
              
              <PremiumButton 
                onClick={handleCopyLink}
                variant="primary"
                className="flex-[2] sm:flex-none px-6 py-3 gap-2 relative overflow-hidden"
              >
                {copied ? <Check size={16} className="text-[#10B981] relative z-10" /> : <Copy size={16} className="relative z-10" />} 
                <span className="relative z-10">{copied ? 'Copied!' : 'Copy Link'}</span>
              </PremiumButton>
            </div>
          </div>
          
          {/* QR Code Dropdown */}
          <AnimatePresence>
            {showQr && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4 flex justify-center md:justify-end relative z-10"
              >
                <div className="bg-white p-3 rounded-2xl border border-[#E8E6F0] shadow-sm">
                  <div className="w-32 h-32 bg-white rounded flex items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(profileData.referralLink)}`} 
                      alt="Referral QR Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Security Actions */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative z-10 w-full">
          
          <PremiumButton 
            onClick={() => setShowPasswordModal(true)}
            variant="primary"
            className="flex-1 py-3.5 sm:py-4 gap-2"
          >
            <KeyRound size={20} /> 
            <span className="text-sm sm:text-base">Change Password</span>
          </PremiumButton>
          
          <div className="flex-1 bg-white border border-[#E8E6F0] py-3.5 sm:py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-between px-5 sm:px-6 shadow-sm">
            <div className="flex items-center gap-3 text-[#1A1A2E]">
              <Shield size={20} className="text-[#F310FD]" />
              <span className="text-[#1A1A2E] text-sm sm:text-base">Two-Factor Auth (2FA)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-[#10B981] font-bold">Enabled</span>
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
            </div>
          </div>
          
        </div>

      </GlassCard>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <GlassCard 
              hoverable={false}
              className="relative w-full max-w-md p-6 md:p-8 shadow-2xl overflow-hidden border border-[#E8E6F0]"
            >
              <h3 className="text-xl font-extrabold text-[#1A1A2E] mb-6 flex items-center gap-2">
                <KeyRound size={20} className="text-[#F310FD]" /> Change Password
              </h3>

              <form onSubmit={handleSavePassword} className="space-y-4">
                <ValidatedInput
                  label="Current Password"
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />

                <ValidatedInput
                  label="New Password"
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />

                <ValidatedInput
                  label="Confirm New Password"
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />

                <div className="flex gap-3 pt-4">
                  <PremiumButton
                    type="submit"
                    variant="primary"
                    disabled={isSavingPassword}
                    className="flex-1"
                  >
                    {isSavingPassword ? 'Updating...' : 'Update Password'}
                  </PremiumButton>
                  <PremiumButton
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </PremiumButton>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
