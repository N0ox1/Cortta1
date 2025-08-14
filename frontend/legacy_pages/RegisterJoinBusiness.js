import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Scissors, ArrowLeft, Search, Building2, MapPin, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const RegisterJoinBusiness = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [filteredBarbershops, setFilteredBarbershops] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!location.state?.email) {
      navigate('/register');
    }
  }, [location.state, navigate]);

  // Removido o carregamento automático das barbearias

  useEffect(() => {
    // Buscar barbearias apenas quando digitar algo
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length >= 1) {
        loadBarbershops(searchTerm);
      } else {
        setFilteredBarbershops([]);
        setHasSearched(false);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadBarbershops = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 1) {
      setFilteredBarbershops([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/barbershop/public');
      const filtered = response.data.filter(barbershop => 
        barbershop.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBarbershops(filtered);
      setHasSearched(true);
    } catch (error) {
      console.error('Erro ao carregar barbearias:', error);
      toast.error('Erro ao carregar barbearias');
    } finally {
      setLoading(false);
    }
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleJoinBarbershop = async (barbershopId) => {
    try {
      // Recuperar dados do registro do localStorage
      const registrationData = localStorage.getItem('registrationData');
      if (!registrationData) {
        toast.error('Dados de registro não encontrados. Tente novamente.');
        navigate('/register');
        return;
      }

      const userData = JSON.parse(registrationData);

      // Enviar solicitação de participação
      const response = await api.post('/auth/request-join', {
        user: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          password: userData.password,
          phone: userData.phone,
          country: userData.country
        },
        barbershopId: barbershopId
      });

      // Limpar dados temporários
      localStorage.removeItem('registrationData');

      // Mostrar modal de sucesso
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast.error(error.response?.data?.message || 'Erro ao enviar solicitação. Tente novamente.');
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // Não redirecionar automaticamente, deixar o usuário decidir
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E5F0FE' }}>
      {/* Header - Seta de voltar simples */}
      <header className="p-6">
        <Link 
          to="/register/account-type" 
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
              <Search className="h-8 w-8 text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pesquisar uma empresa
            </h2>
            <p className="text-gray-600">
              Encontre uma empresa na Cortta e solicite acesso ao seu ambiente de trabalho
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder="Encontre uma empresa em Brasil"
            />
          </div>

          {/* Barbershops List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Carregando empresas...</p>
              </div>
            ) : searchTerm.trim().length > 0 && filteredBarbershops.length > 0 ? (
              filteredBarbershops.map((barbershop) => (
                <div
                  key={barbershop.id}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{barbershop.name}</h3>
                      <p className="text-sm text-gray-500">{barbershop.city}, {barbershop.state}</p>
                      <p className="text-xs text-gray-400 mt-1">Proprietário: {barbershop.ownerName || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleJoinBarbershop(barbershop.id)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Solicitar Participação
                  </button>
                </div>
              ))
            ) : searchTerm.trim().length > 0 && !loading && hasSearched && filteredBarbershops.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma empresa encontrada
                </h3>
                <p className="text-gray-600">
                  Não encontramos empresas para "{searchTerm}". Tente outro termo de busca.
                </p>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Não encontrou sua empresa?{' '}
              <Link to="/register/business" className="text-blue-600 hover:text-blue-700 font-medium">
                Criar nova empresa
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Solicitação enviada com sucesso!
            </h3>
            
            <p className="text-gray-600 mb-4">
              Agora é com a barbearia: ela vai analisar e aprovar (ou não) seu pedido de acesso.
              <br /><br />
              Você será avisado por e-mail assim que houver uma resposta.
              <br /><br />
              <strong>A equipe Cortta agradece.</strong>
            </p>
            
                         <div className="flex space-x-3">
               <button
                 onClick={handleCloseSuccessModal}
                 className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
               >
                 Fechar
               </button>
               <button
                 onClick={() => {
                   setShowSuccessModal(false);
                   navigate('/login');
                 }}
                 className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
               >
                 Ir para Login
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterJoinBusiness; 