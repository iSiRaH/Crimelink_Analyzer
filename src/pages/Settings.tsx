// src/pages/Settings.tsx
import React, { useState, useEffect } from "react";
import {
  getProfile,
  updateProfile,
  changePassword,
  type ProfileData,
  type ProfileUpdateRequest,
  type PasswordChangeRequest,
} from "../api/profileService";
import { useAuth } from "../contexts/useAuth";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import { FaEye, FaEyeSlash, FaSave, FaTimes, FaKey, FaUser } from "react-icons/fa";

const Settings: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Profile form state
  const [profileForm, setProfileForm] = useState<ProfileUpdateRequest>({
    name: "",
    email: "",
    dob: "",
    gender: "",
    address: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState<PasswordChangeRequest>({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // Password visibility toggles
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load profile data on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfileData(data);
      setProfileForm({
        name: data.name,
        email: data.email,
        dob: data.dob || "",
        gender: data.gender || "",
        address: data.address || "",
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);
      const response = await updateProfile(profileForm);
      setSuccess(response.message);
      setProfileData(response.profile);
      
      // Update auth context with new user data
      if (updateUserProfile) {
        updateUserProfile({
          userId: response.profile.userId,
          name: response.profile.name,
          role: response.profile.role,
        });
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate password match
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await changePassword(passwordForm);
      setSuccess(response.message);
      
      // Clear password form
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelProfile = () => {
    if (profileData) {
      setProfileForm({
        name: profileData.name,
        email: profileData.email,
        dob: profileData.dob || "",
        gender: profileData.gender || "",
        address: profileData.address || "",
      });
    }
    setError("");
    setSuccess("");
  };

  const handleCancelPassword = () => {
    setPasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setError("");
    setSuccess("");
  };

  if (loading && !profileData) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Profile Information Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <FaUser className="text-2xl text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-800">Profile Information</h2>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) =>
                setProfileForm({ ...profileForm, name: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) =>
                setProfileForm({ ...profileForm, email: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={profileForm.dob}
              onChange={(e) =>
                setProfileForm({ ...profileForm, dob: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={profileForm.gender}
              onChange={(e) =>
                setProfileForm({ ...profileForm, gender: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={profileForm.address}
              onChange={(e) =>
                setProfileForm({ ...profileForm, address: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Read-only fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Role
              </label>
              <input
                type="text"
                value={profileData?.role || ""}
                disabled
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Badge Number
              </label>
              <input
                type="text"
                value={profileData?.badgeNo || "N/A"}
                disabled
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              <FaSave /> {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancelProfile}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              <FaTimes /> Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <FaKey className="text-2xl text-red-600" />
          <h2 className="text-2xl font-semibold text-gray-800">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Old Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showOldPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <PasswordStrengthIndicator password={passwordForm.newPassword} />
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmNewPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmNewPassword: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              <FaKey /> {loading ? "Changing..." : "Change Password"}
            </button>
            <button
              type="button"
              onClick={handleCancelPassword}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              <FaTimes /> Cancel
            </button>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Security Note:</strong> After changing your password, all other active
              sessions will be logged out for security purposes.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
