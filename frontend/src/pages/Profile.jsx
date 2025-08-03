import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiMail, FiPhone, FiEdit, FiSave, FiX, FiCamera, FiShield, FiCalendar } from 'react-icons/fi';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = React.useRef(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    username: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        username: user.username || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      username: user.username || ''
    });
    setIsEditing(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await authAPI.uploadAvatar(formData);
      updateUser(response.data.data);
      setSelectedFile(null);
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload profile picture';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName[0].toUpperCase() : '';
    const last = lastName ? lastName[0].toUpperCase() : '';
    return first + last;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Avatar Section */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-200">
                      {getInitials(user.first_name, user.last_name)}
                    </div>
                  )}
                  <button 
                    onClick={triggerFileInput}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <div className="loading-spinner h-4 w-4" />
                    ) : (
                      <FiCamera className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <h2 className="text-xl font-semibold mt-4">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-gray-600">{user.username}</p>
                {uploading && (
                  <p className="text-sm text-blue-600 mt-2">Uploading...</p>
                )}
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FiCalendar className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-600">Member since</span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatDate(user.created_at)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FiShield className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-600">Status</span>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    user.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {user.is_verified && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FiShield className="h-5 w-5 text-green-400 mr-3" />
                      <span className="text-sm text-gray-600">Verification</span>
                    </div>
                    <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-800">
                      Verified
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <FiEdit className="mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    >
                      <FiX className="mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="loading-spinner h-4 w-4 mr-2" />
                      ) : (
                        <FiSave className="mr-2" />
                      )}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              {/* Form */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter first name"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-md">
                        <FiUser className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{user.first_name || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter last name"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-md">
                        <FiUser className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{user.last_name || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter username"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-md">
                        <FiUser className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{user.username}</span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter email address"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-md">
                        <FiMail className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{user.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 h-[42px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-md">
                        <FiPhone className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{user.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  {/* Last Login */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Login
                    </label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <FiCalendar className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">
                        {user.last_login ? formatDate(user.last_login) : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Security</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <button 
                    onClick={() => setIsChangePasswordModalOpen(true)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Change Password</h4>
                        <p className="text-sm text-gray-600">Update your account password</p>
                      </div>
                      <FiEdit className="h-5 w-5 text-gray-400" />
                    </div>
                  </button>

                  <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security</p>
                      </div>
                      <FiShield className="h-5 w-5 text-gray-400" />
                    </div>
                  </button>

                  <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Login Sessions</h4>
                        <p className="text-sm text-gray-600">Manage your active sessions</p>
                      </div>
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default Profile; 