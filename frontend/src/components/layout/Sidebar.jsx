import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiX,
  FiHome,
  FiFolder,
  FiCheckSquare,
  FiUsers,
  FiClock,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiBell,
  FiUser
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Projects', href: '/projects', icon: FiFolder },
    { name: 'Tasks', href: '/tasks', icon: FiCheckSquare },
    { name: 'Team', href: '/team', icon: FiUsers },
    { name: 'Time Tracking', href: '/time-tracking', icon: FiClock },
  ];

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <FiMenu className="w-5 h-5 text-white" />
          </div>
          <h1 className="ml-3 text-xl font-bold text-gray-900">ProjectHub</h1>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold">
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500 break-all">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <motion.div
              key={item.name}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={item.href}
                onClick={onClose}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  active
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 ${
                    active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
                {item.name === 'Team' && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link
          to="/profile"
          onClick={onClose}
          className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
        >
          <FiSettings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
          Settings
        </Link>
        
        <button
          onClick={handleLogout}
          className="group w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
        >
          <FiLogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 