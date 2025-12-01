import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && localStorage.getItem('token')) {
      const token = localStorage.getItem('token');
      const newSocket = io('/notifications', {
        auth: { token },
        transports: ['websocket']
      });

      newSocket.on('connect', () => {
        console.log('Connected to notifications namespace');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from notifications namespace');
        setConnected(false);
      });

      newSocket.on('task_assigned', (data) => {
        toast.success(data.message, {
          duration: 5000,
          icon: '📋'
        });
      });

      newSocket.on('task_updated', (data) => {
        toast(data.message, {
          duration: 4000,
          icon: '🔄'
        });
      });

      newSocket.on('alert', (data) => {
        toast(data.message, {
          duration: 6000,
          icon: data.type === 'reminder' ? '⏰' : '🔔'
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const value = {
    socket,
    connected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
