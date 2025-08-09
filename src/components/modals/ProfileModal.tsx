import React, { useState } from 'react';
import { X, User, Mail, Key, Shield, Calendar, Edit } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';

interface ProfileModalProps {
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { user, signOut } = useApp();
  const { success, info } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  });

  if (!user) return null;

  const handleSave = () => {
    // In a real app, this would update the user profile
    info('Profile editing will be available in a future update');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });
    setIsEditing(false);
  };

  const handleSignOut = () => {
    signOut();
    onClose();
    success('Successfully signed out');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editData.firstName}
                      onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editData.lastName}
                      onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Full Name</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Key className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">User ID</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {user.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Plan Status</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Free Plan</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Member Since</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <button
            onClick={() => info('Password change will be available in a future update')}
            className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Change Password
          </button>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};