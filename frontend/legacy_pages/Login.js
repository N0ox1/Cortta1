import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Scissors, ArrowLeft, Globe, HelpCircle, Lock, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [barbershopName, setBarbershopName] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Primeiro, verificar se existe uma solicitação pendente ou rejeitada
      const requestResponse = await api.get(`/auth/check-request-status/${data.email}`);
      
      if (requestResponse.data.hasRequest) {
        const { status, barbershopName } = requestResponse.data;
        
        setRequestStatus(status);
        setBarbershopName(barbershopName);
        setShowRequestModal(true);
        setIsLoading(false);
        return;
      }

      const result = await login(data.email, data.password);
      
      if (result.success) {
        toast.success('Login realizado com sucesso!');
        // Redirecionar baseado no papel do usuário
        const userRole = result.user?.role;
        if (userRole === 'SUPER_ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/barbershop/dashboard');
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col">
      {/* Header com background estendido */}
      <div className="w-full border-b border-primary-200 bg-white/80 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between p-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-primary-100 transition-colors text-primary-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            {/* Logo Cortta */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Scissors className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary-600">Cortta</span>
            </div>
            
            <div className="w-10"></div> {/* Espaçador para centralizar o logo */}
          </div>
        </div>
      </div>

      {/* Container principal com largura máxima */}
      <div className="max-w-[1280px] mx-auto flex-1 flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-6 py-2">
          {/* Title Section */}
          <div className="text-center mb-4">
            <div className="mx-auto h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center mb-2">
              <Scissors className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-1">
              Faça login
            </h1>
            <p className="text-gray-600 text-sm">
              Acesse sua conta para gerenciar sua empresa
            </p>
          </div>

          {/* Form */}
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-3">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'E-mail é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'E-mail inválido'
                    }
                  })}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Senha é obrigatória',
                      minLength: {
                        value: 6,
                        message: 'Senha deve ter pelo menos 6 caracteres'
                      }
                    })}
                    className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>

            {/* Demo Credentials */}
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Credenciais de Demonstração:</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Super Admin:</strong> admin@barbeariasaas.com / admin123</p>
                <p><strong>Barbearia:</strong> joao@barbearia.com / 123456</p>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center mt-3">
              <p className="text-gray-600 text-sm">
                Não tem uma conta?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Footer com background estendido */}
      <div className="w-full border-t border-primary-200 bg-white/80 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-[1280px] mx-auto">
          <div className="px-6 py-3">
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-500">
                Este site é protegido por reCAPTCHA
              </p>
              <p className="text-xs text-gray-500">
                Aplicam-se a Política de Privacidade e os Termos de Serviço do Google
              </p>
              
              {/* Footer Links */}
              <div className="flex items-center justify-center space-x-4 text-xs">
                <button className="flex items-center text-primary-600 hover:text-primary-700">
                  <Globe className="h-3 w-3 mr-1" />
                  português (Brasil)
                </button>
                <span className="text-gray-400">•</span>
                <button className="flex items-center text-primary-600 hover:text-primary-700">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Ajuda
                </button>
                <span className="text-gray-400">•</span>
                <button className="flex items-center text-primary-600 hover:text-primary-700">
                  <Lock className="h-3 w-3 mr-1" />
                  Política de privacidade
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Status da Solicitação */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Status da Solicitação
                </h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              {requestStatus === 'PENDING' ? (
                <div>
                  <p className="text-gray-700 mb-3">
                    Você ainda não foi aprovado pela barbearia <strong>"{barbershopName}"</strong>.
                  </p>
                  <p className="text-gray-600 text-sm">
                    Aguarde a aprovação do administrador. Você será notificado assim que sua solicitação for analisada.
                  </p>
                </div>
              ) : requestStatus === 'REJECTED' ? (
                <div>
                  <p className="text-gray-700 mb-3">
                    Sua solicitação foi recusada pela barbearia <strong>"{barbershopName}"</strong>.
                  </p>
                  <p className="text-gray-600 text-sm">
                    Entre em contato com o administrador da barbearia para mais informações sobre a recusa.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Fechar
              </button>
              {requestStatus === 'REJECTED' && (
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    navigate('/register/join-business');
                  }}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Nova Solicitação
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login; 