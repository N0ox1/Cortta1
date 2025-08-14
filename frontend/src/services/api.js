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
    const publicRoutes = [
      '/auth/verify', 
      '/auth/login', 
      '/auth/register',
      '/barbershop/public',
      '/client'
    ];
    
    const isPublicRoute = publicRoutes.some(route => config.url.startsWith(route));
    
    if (isPublicRoute) {
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
    // Não fazer redirecionamento automático aqui
    // Deixar que cada componente trate seus próprios erros de autenticação
    return Promise.reject(error);
  }
);

export default api; 