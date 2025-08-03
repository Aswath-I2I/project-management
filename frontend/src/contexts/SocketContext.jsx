import React, { createContext, useContext, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection
      socketRef.current = io('http://localhost:3000', {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
      });

      // Connection events
      socketRef.current.on('connect', () => {
        console.log('Socket connected');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      // Join user's personal room
      socketRef.current.emit('join-user-room', { userId: user.id });

      // Listen for notifications
      socketRef.current.on('notification', (data) => {
        toast(data.message, {
          icon: data.type === 'success' ? '✅' : data.type === 'error' ? '❌' : 'ℹ️',
        });
      });

      // Listen for project updates
      socketRef.current.on('project-update', (data) => {
        toast(`Project "${data.projectName}" has been updated`, {
          icon: '📋',
        });
      });

      // Listen for task updates
      socketRef.current.on('task-update', (data) => {
        toast(`Task "${data.taskTitle}" has been updated`, {
          icon: '✅',
        });
      });

      // Listen for new comments
      socketRef.current.on('new-comment', (data) => {
        toast(`New comment on task "${data.taskTitle}"`, {
          icon: '💬',
        });
      });

      // Listen for time log updates
      socketRef.current.on('time-log-update', (data) => {
        toast(`Time log updated for task "${data.taskTitle}"`, {
          icon: '⏱️',
        });
      });

      // Listen for team member updates
      socketRef.current.on('team-update', (data) => {
        toast(`Team member ${data.action} in project "${data.projectName}"`, {
          icon: '👥',
        });
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user, token]);

  const joinProjectRoom = (projectId) => {
    if (socketRef.current) {
      socketRef.current.emit('join-project-room', { projectId });
    }
  };

  const leaveProjectRoom = (projectId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-project-room', { projectId });
    }
  };

  const emitProjectUpdate = (projectId, updateData) => {
    if (socketRef.current) {
      socketRef.current.emit('project-update', { projectId, ...updateData });
    }
  };

  const emitTaskUpdate = (taskId, updateData) => {
    if (socketRef.current) {
      socketRef.current.emit('task-update', { taskId, ...updateData });
    }
  };

  const emitNewComment = (commentData) => {
    if (socketRef.current) {
      socketRef.current.emit('new-comment', commentData);
    }
  };

  const emitTimeLogUpdate = (timeLogData) => {
    if (socketRef.current) {
      socketRef.current.emit('time-log-update', timeLogData);
    }
  };

  const emitTeamUpdate = (teamData) => {
    if (socketRef.current) {
      socketRef.current.emit('team-update', teamData);
    }
  };

  const value = {
    socket: socketRef.current,
    joinProjectRoom,
    leaveProjectRoom,
    emitProjectUpdate,
    emitTaskUpdate,
    emitNewComment,
    emitTimeLogUpdate,
    emitTeamUpdate,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 