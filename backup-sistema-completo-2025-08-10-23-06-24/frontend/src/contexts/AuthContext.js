import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Listener para mudanças no localStorage (sincronização entre guias)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        const newToken = e.newValue;
        setToken(newToken);
        
        // Se o token foi removido, limpar usuário
        if (!newToken) {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // Se não há token, não tentar verificar
    if (!token) {
      setLoading(false);
      return;
    }
    
    // Só verificar token se não tivermos um usuário já definido
    if (!user) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/verify');
      setUser(response.data.user);
    } catch (error) {
      console.error('Erro na verificação do token:', error);
      
      // Só limpar o token se for erro 401 (não autorizado)
      // Não limpar em caso de erro de rede ou outros problemas
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isSuperAdmin = () => {
    return user?.role === 'SUPER_ADMIN';
  };

  const isBarbershopAdmin = () => {
    return user?.role === 'BARBERSHOP_ADMIN' || user?.role === 'PROFESSIONAL' || user?.role === 'SUPER_ADMIN';
  };

  const isBarber = () => {
    return user?.role === 'BARBER';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isSuperAdmin,
    isBarbershopAdmin,
    isBarber,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 