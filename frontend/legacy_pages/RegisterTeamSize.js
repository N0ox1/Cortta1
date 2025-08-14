import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const RegisterTeamSize = () => {
  const navigate = useNavigate();
  const [selectedTeamSize, setSelectedTeamSize] = useState('');
  const [loading, setLoading] = useState(false);

  const teamSizeOptions = [
    { id: 'only-me', label: 'Somente eu' },
    { id: '2-5', label: '2-5 pessoas' },
    { id: '6-10', label: '6-10 pessoas' },
    { id: '11-plus', label: 'Mais de 11 pessoas' }
  ];

  useEffect(() => {
    // Verificar se há dados no localStorage
    const registrationData = localStorage.getItem('registrationData');
    if (!registrationData) {
      navigate('/register');
    }
  }, [navigate]);

  const handleTeamSizeSelect = (teamSizeId) => {
    setSelectedTeamSize(teamSizeId);
  };

  const handleSubmit = async () => {
    if (!selectedTeamSize) {
      toast.error('Selecione o tamanho da sua equipe');
      return;
    }

    try {
      setLoading(true);

      // Recuperar dados do registro do localStorage
      const registrationData = localStorage.getItem('registrationData');
      if (!registrationData) {
        toast.error('Dados de registro não encontrados. Tente novamente.');
        navigate('/register');
        return;
      }

      const userData = JSON.parse(registrationData);

      console.log('📝 Dados sendo enviados:', {
        user: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          password: userData.password,
          phone: userData.phone,
          country: userData.country
        },
        barbershop: {
          name: userData.barbershop.name,
          phone: userData.phone,
          address: userData.barbershop.address,
          city: userData.barbershop.city,
          state: userData.barbershop.state,
          description: userData.barbershop.description,
          website: userData.barbershop.website,
          number: userData.barbershop.number,
          complement: userData.barbershop.complement,
          onlineOnly: userData.barbershop.onlineOnly,
          categories: userData.barbershop.categories,
          teamSize: selectedTeamSize
        }
      });

      // Criar usuário e barbearia com todas as informações coletadas
      const response = await api.post('/auth/register-complete', {
        user: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          password: userData.password,
          phone: userData.phone,
          country: userData.country
        },
        barbershop: {
          name: userData.barbershop.name,
          phone: userData.phone, // Usar o telefone pessoal como telefone da barbearia
          address: userData.barbershop.address,
          city: userData.barbershop.city,
          state: userData.barbershop.state,
          description: userData.barbershop.description,
          website: userData.barbershop.website,
          number: userData.barbershop.number,
          complement: userData.barbershop.complement,
          onlineOnly: userData.barbershop.onlineOnly,
          categories: userData.barbershop.categories,
          teamSize: selectedTeamSize
        }
      });

      // Limpar dados temporários
      localStorage.removeItem('registrationData');

      toast.success('Conta criada com sucesso!');
      
      // Fazer login automático
      const loginResponse = await api.post('/auth/login', {
        email: userData.email,
        password: userData.password
      });

      // Salvar token
      localStorage.setItem('token', loginResponse.data.token);
      
      // Redirecionar para dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header com Progress Bar */}
      <header className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Botão Voltar */}
            <button
              onClick={() => navigate('/register/categories')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>

            {/* Progress Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <span className="text-sm text-gray-500">3 de 3</span>
              </div>
            </div>

            {/* Botão Continuar */}
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedTeamSize}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Linha gradiente azul */}
        <div className="h-0.5 bg-gradient-to-r from-blue-500 to-blue-600"></div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Section Header */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Configuração da conta</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Qual é o tamanho da sua equipe?
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Isso nos ajudará a configurar seu calendário corretamente
            </p>
          </div>

          {/* Team Size Options */}
          <div className="space-y-4">
            {teamSizeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleTeamSizeSelect(option.id)}
                className={`w-full p-6 bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-lg text-left ${
                  selectedTeamSize === option.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className={`font-medium text-lg transition-colors ${
                  selectedTeamSize === option.id ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterTeamSize; 