import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { useSocket } from './SocketContext.jsx';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user } = useAuth();
  const { socket } = useSocket();

  // Load notifications on mount
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  // Listen for real-time notifications
  useEffect(() => {
    if (socket) {
      socket.on('notification', (data) => {
        addNotification({
          id: Date.now(),
          type: data.type || 'info',
          title: data.title || 'Notification',
          message: data.message,
          timestamp: new Date().toISOString(),
          read: false,
          action: data.action,
          targetId: data.targetId,
        });
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [socket]);

  const loadNotifications = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // TODO: Implement API call to load notifications
      // const response = await axios.get('/api/notifications');
      // dispatch({ type: 'SET_NOTIFICATIONS', payload: response.data.data });
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addNotification = (notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    
    // Show toast notification
    toast(notification.message, {
      icon: getNotificationIcon(notification.type),
      duration: 5000,
    });
  };

  const markAsRead = async (notificationId) => {
    try {
      // TODO: Implement API call to mark notification as read
      // await axios.patch(`/api/notifications/${notificationId}/read`);
      dispatch({ type: 'MARK_AS_READ', payload: notificationId });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // TODO: Implement API call to mark all notifications as read
      // await axios.patch('/api/notifications/mark-all-read');
      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const removeNotification = async (notificationId) => {
    try {
      // TODO: Implement API call to remove notification
      // await axios.delete(`/api/notifications/${notificationId}`);
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
    } catch (error) {
      console.error('Failed to remove notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const showSuccess = (message, title = 'Success') => {
    addNotification({
      id: Date.now(),
      type: 'success',
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    });
  };

  const showError = (message, title = 'Error') => {
    addNotification({
      id: Date.now(),
      type: 'error',
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    });
  };

  const showWarning = (message, title = 'Warning') => {
    addNotification({
      id: Date.now(),
      type: 'warning',
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    });
  };

  const showInfo = (message, title = 'Information') => {
    addNotification({
      id: Date.now(),
      type: 'info',
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    });
  };

  const value = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading: state.loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    loadNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 