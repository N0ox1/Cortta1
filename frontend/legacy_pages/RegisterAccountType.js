import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Scissors, ArrowLeft, ArrowRight, Building2, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RegisterAccountType = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // Verificar se há dados no localStorage antes de redirecionar
      const registrationData = localStorage.getItem('registrationData');
      if (registrationData) {
        try {
          const userData = JSON.parse(registrationData);
          setEmail(userData.email);
        } catch (error) {
          console.error('Erro ao parsear dados do localStorage:', error);
          navigate('/register');
        }
      } else {
        // Se não tem email nem dados no localStorage, redirecionar para registro inicial
        navigate('/register');
      }
    }
  }, [location.state, navigate]);

  const handleCreateNewBusiness = () => {
    // Redirecionar para criação de nova barbearia
    navigate('/register/business', { state: { email, accountType: 'new' } });
  };

  const handleJoinExistingBusiness = () => {
    // Redirecionar para busca de barbearias existentes
    navigate('/register/join-business', { state: { email, accountType: 'join' } });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E5F0FE' }}>
      {/* Header - Seta de voltar simples */}
      <header className="p-6">
        <Link 
          to="/register/complete" 
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-lg w-full space-y-8">
          {/* Form Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scissors className="h-8 w-8 text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Como você gostaria de configurar sua conta profissional?
            </h2>
            <p className="text-gray-600">
              Escolha a opção que melhor se adequa ao seu negócio
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {/* Option 1: Create New Business */}
            <button
              onClick={handleCreateNewBusiness}
              className="w-full p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      Criar uma nova conta comercial
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Comece do zero com sua própria barbearia
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </button>

            {/* Option 2: Join Existing Business */}
            <button
              onClick={handleJoinExistingBusiness}
              className="w-full p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      Faça parte de uma empresa que já está na Cortta
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Encontre a empresa da qual deseja fazer parte
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterAccountType; 