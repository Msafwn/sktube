import React, { useState, useEffect } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import {
  SettingsHeader,
  SettingsAlert,
  SettingsTabs,
  SettingsProfileTab,
  SettingsMediaTab,
  SettingsPasswordTab
} from '../components/settings';

const Settings = () => {
  const { user, updateUser } = useAuth();

  // Tab State: 'profile' | 'media' | 'password'
  const [activeTab, setActiveTab] = useState('profile');

  // Profile fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Media files
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(user?.coverImage || null);

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error', text: '' }

  // Keep state in sync if user changes
  useEffect(() => {
    if (user?.avatar && !avatarFile) {
      setAvatarPreview(user.avatar);
    }
    if (user?.coverImage && !coverFile) {
      setCoverPreview(user.coverImage);
    }
    if (user?.fullName) {
      setFullName(user.fullName);
    }
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // 1. Update Profile Details (Name & Email)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setAlert({ type: 'error', text: 'Full Name and Email are required.' });
      return;
    }

    try {
      setLoading(true);
      setAlert(null);
      const res = await userService.updateAccountDetails({ fullName, email });
      if (res?.data) {
        updateUser(res.data);
      }
      setAlert({ type: 'success', text: 'Account details updated successfully!' });
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Selected Avatar File
  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setAlert({ type: 'error', text: 'Please select a valid image file (JPG, PNG, WEBP).' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setAlert({ type: 'error', text: 'Avatar size must be under 5MB.' });
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setAlert(null);
    }
  };

  // 3. Save Avatar to Backend & Cloudinary
  const handleSaveAvatar = async () => {
    if (!avatarFile) {
      setAlert({ type: 'error', text: 'Please select a new profile picture first.' });
      return;
    }

    try {
      setLoading(true);
      setAlert(null);
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const res = await userService.updateAvatar(formData);
      if (res?.data) {
        updateUser(res.data);
        setAvatarPreview(res.data.avatar);
      }
      setAvatarFile(null);
      setAlert({ type: 'success', text: 'Profile picture saved and updated successfully on Cloudinary!' });
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.message || err.message || 'Avatar upload failed.' });
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Selected Cover File
  const handleCoverSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setAlert({ type: 'error', text: 'Please select a valid image file (JPG, PNG, WEBP).' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setAlert({ type: 'error', text: 'Cover banner size must be under 5MB.' });
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setAlert(null);
    }
  };

  // 5. Save Cover Banner to Backend & Cloudinary
  const handleSaveCover = async () => {
    if (!coverFile) {
      setAlert({ type: 'error', text: 'Please select a new cover banner image first.' });
      return;
    }

    try {
      setLoading(true);
      setAlert(null);
      const formData = new FormData();
      formData.append('coverImage', coverFile);
      const res = await userService.updateCoverImage(formData);
      if (res?.data) {
        updateUser(res.data);
        setCoverPreview(res.data.coverImage);
      }
      setCoverFile(null);
      setAlert({ type: 'success', text: 'Channel cover banner saved and updated successfully!' });
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.message || err.message || 'Cover banner upload failed.' });
    } finally {
      setLoading(false);
    }
  };

  // 6. Change Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setAlert({ type: 'error', text: 'Please provide both current and new password.' });
      return;
    }
    if (newPassword.length < 8) {
      setAlert({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setAlert({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    try {
      setLoading(true);
      setAlert(null);
      await userService.changePassword({ oldPassword, newPassword });
      setAlert({ type: 'success', text: 'Password changed successfully! Keep it secure.' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to change password.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-3 sm:p-4 container-4k">
        <div className="text-center glass-panel rounded-2xl sm:rounded-3xl 2xl:rounded-[2rem] border border-white/10 p-6 sm:p-8 2xl:p-12 max-w-md 2xl:max-w-xl w-full shadow-2xl animate-fadeIn flex flex-col items-center gap-3.5 2xl:gap-5">
          <div className="w-14 h-14 2xl:w-20 2xl:h-20 rounded-2xl 2xl:rounded-3xl bg-gradient-to-tr from-[#FF0055] via-[#FF2E7E] to-[#7928CA] flex items-center justify-center text-white shadow-lg shadow-[#FF0055]/30">
            <Lock className="w-7 h-7 2xl:w-10 2xl:h-10" />
          </div>
          <h2 className="text-lg sm:text-xl 2xl:text-3xl font-black text-white">Sign In Required</h2>
          <p className="text-xs sm:text-sm 2xl:text-base text-neutral-400 leading-relaxed max-w-sm">
            Please log in to your account to update your profile and channel settings.
          </p>
          <div className="flex items-center gap-2.5 sm:gap-3 2xl:gap-4 w-full mt-2">
            <Link
              to="/login"
              className="btn-primary flex-1 py-2.5 sm:py-3 2xl:py-4 text-xs sm:text-sm 2xl:text-base font-bold rounded-xl 2xl:rounded-2xl shadow-lg shadow-[#FF0055]/30 flex items-center justify-center gap-1.5 2xl:gap-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 2xl:w-5 2xl:h-5" />
            </Link>
            <Link
              to="/register"
              className="flex-1 py-2.5 sm:py-3 2xl:py-4 text-xs sm:text-sm 2xl:text-base font-bold rounded-xl 2xl:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-center transition-all"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative container-4k px-3 sm:px-4 2xl:px-8">
      {/* Background Ambient Glows */}
      <div className="ambient-glow top-0 right-1/4 w-[300px] sm:w-[500px] 2xl:w-[700px] h-[300px] 2xl:h-[700px] bg-[#FF0055]/10 rounded-full pointer-events-none"></div>
      <div className="ambient-glow bottom-10 left-10 w-[300px] sm:w-[500px] 2xl:w-[700px] h-[300px] 2xl:h-[700px] bg-[#7928CA]/10 rounded-full pointer-events-none"></div>

      <div className="flex flex-col gap-3.5 sm:gap-6 2xl:gap-8 pb-24 sm:pb-16 max-w-3xl 2xl:max-w-4xl min-[2560px]:max-w-5xl min-[3840px]:max-w-6xl mx-auto relative z-10 pt-1 sm:pt-2 2xl:pt-4">
        <SettingsHeader />
        <SettingsAlert alert={alert} onClose={() => setAlert(null)} />
        <SettingsTabs activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setAlert(null); }} />

        {activeTab === 'profile' && (
          <SettingsProfileTab
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            username={user.username}
            loading={loading}
            onSubmit={handleProfileSubmit}
          />
        )}

        {activeTab === 'media' && (
          <SettingsMediaTab
            avatarFile={avatarFile}
            avatarPreview={avatarPreview}
            onAvatarSelect={handleAvatarSelect}
            onSaveAvatar={handleSaveAvatar}
            coverFile={coverFile}
            coverPreview={coverPreview}
            onCoverSelect={handleCoverSelect}
            onSaveCover={handleSaveCover}
            loading={loading}
          />
        )}

        {activeTab === 'password' && (
          <SettingsPasswordTab
            oldPassword={oldPassword}
            setOldPassword={setOldPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showOldPass={showOldPass}
            setShowOldPass={setShowOldPass}
            showNewPass={showNewPass}
            setShowNewPass={setShowNewPass}
            loading={loading}
            onSubmit={handlePasswordSubmit}
          />
        )}
      </div>
    </div>
  );
};

// Compound attachments
Settings.Header = SettingsHeader;
Settings.Alert = SettingsAlert;
Settings.Tabs = SettingsTabs;
Settings.ProfileTab = SettingsProfileTab;
Settings.MediaTab = SettingsMediaTab;
Settings.PasswordTab = SettingsPasswordTab;

export default Settings;
