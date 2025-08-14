import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const NotificationContext = createContext({});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Conectar ao WebSocket
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      // Se for admin de barbearia, juntar-se à sala da barbearia
      if (user.barbershopId && (user.role === 'BARBERSHOP_ADMIN' || user.role === 'SUPER_ADMIN')) {
        newSocket.emit('join-barbershop', user.barbershopId);
      }

      // Ouvir novas solicitações de acesso
      newSocket.on('new-join-request', (data) => {
        console.log('Nova solicitação recebida:', data);
        
        // Adicionar à lista de notificações
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'NEW_REQUEST',
          message: data.message,
          data: data.request,
          timestamp: new Date(),
          read: false
        }]);

        // Mostrar toast
        toast.success(data.message, {
          duration: 5000,
          icon: '🔔'
        });
      });

      // Ouvir aprovação de solicitação (para o usuário que solicitou)
      newSocket.on('request-approved', (data) => {
        if (data.userEmail === user.email) {
          console.log('Solicitação aprovada:', data);
          
          toast.success('🎉 Sua solicitação foi aprovada! Você já pode fazer login.', {
            duration: 8000,
            icon: '✅'
          });
        }
      });

      // Ouvir rejeição de solicitação (para o usuário que solicitou)
      newSocket.on('request-rejected', (data) => {
        if (data.userEmail === user.email) {
          console.log('Solicitação rejeitada:', data);
          
          toast.error('❌ Sua solicitação foi rejeitada.', {
            duration: 8000,
            icon: '❌'
          });
        }
      });



      return () => {
        if (user.barbershopId) {
          newSocket.emit('leave-barbershop', user.barbershopId);
        }
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const value = {
    socket,
    notifications,
    markAsRead,
    clearNotifications,
    getUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 