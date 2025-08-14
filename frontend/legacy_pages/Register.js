import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scissors, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Digite um email válido');
      return;
    }

    try {
      setLoading(true);
      
      // Verificar se email já existe
      const response = await api.post('/auth/check-email', { email });
      
      if (response.data.exists) {
        // Se existe, redirecionar para login
        toast.success('Email encontrado! Redirecionando para login...');
        navigate('/login', { state: { email } });
      } else {
        // Se não existe, redirecionar para cadastro completo
        navigate('/register/complete', { state: { email } });
      }
      
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      toast.error('Erro ao verificar email. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    toast.info(`Login com ${provider} será implementado em breve`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Logo centralizado com seta de voltar */}
      <header className="h-[59px] flex items-center justify-center relative" style={{ backgroundColor: '#FBFDFF' }}>
        {/* Seta de voltar */}
        <Link 
          to="/" 
          className="absolute left-8 inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Link>
        
        <div className="flex items-center">
          <Scissors className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-blue-600">Cortta</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12" style={{ backgroundColor: '#E5F0FE' }}>
        <div className="max-w-lg w-full space-y-8">
          {/* Form Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scissors className="h-8 w-8 text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Cortta para profissionais
            </h2>
            <p className="text-gray-600">
              Crie uma conta ou inicie a sessão para gerenciar sua empresa.
            </p>
          </div>

          {/* Form */}
          <div className="p-8" style={{ backgroundColor: '#E5F0FE' }}>
            <div className="space-y-6">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center bg-white"
                  placeholder="teste@testecortta.com.br"
                />
              </div>

              <button
                onClick={handleContinue}
                disabled={loading || !email}
                className="w-full bg-blue-600 text-white py-4 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                ) : (
                  'Continuar'
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2" style={{ backgroundColor: '#E5F0FE' }}>OU</span>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleSocialLogin('Facebook')}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-4 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continuar com o Facebook
                </button>

                <button
                  onClick={() => handleSocialLogin('Google')}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-4 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com o Google
                </button>

                <button
                  onClick={() => handleSocialLogin('Apple')}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-4 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#000000">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Continuar com a Apple
                </button>
              </div>

              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Você é um cliente querendo agendar um horário?{' '}
                  <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
                    Acessar Cortta para clientes
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Exatamente como na imagem */}
      <footer className="h-[79px] flex items-center justify-center" style={{ backgroundColor: '#F9FBFF' }}>
        <div className="text-center text-xs text-gray-500 space-y-2">
          <p>Este site é protegido por reCAPTCHA</p>
          <p>Aplicam-se a Política de Privacidade e os Termos de Serviço do Google</p>
          <div className="flex items-center justify-center space-x-4 text-sm" style={{ color: '#4A90E2' }}>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              <span>português (Brasil)</span>
            </div>
            <span>•</span>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
              </svg>
              <Link to="/help" className="hover:opacity-80">Ajuda</Link>
            </div>
            <span>•</span>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10z"/>
              </svg>
              <Link to="/privacy" className="hover:opacity-80">Política de privacidade</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Register; 