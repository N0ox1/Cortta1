import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Não enviar token para rotas públicas
    if (config.url === '/auth/verify' || config.url === '/auth/login' || config.url === '/auth/register') {
      return config;
    }
    
    // Adicionar token se existir
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Removido redirecionamento automático
    return Promise.reject(error);
  }
);

export default api; 