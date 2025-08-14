import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Scissors, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const RegisterComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    phone: '',
    country: 'Brasil'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // Se não tem email, redirecionar para registro inicial
      navigate('/register');
    }
  }, [location.state, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (!formData.firstName.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!formData.lastName.trim()) {
      toast.error('Sobrenome é obrigatório');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Telefone é obrigatório');
      return;
    }



    try {
      setLoading(true);

      // Salvar dados temporariamente no localStorage
      const registrationData = {
        email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        phone: formData.phone,
        country: formData.country,
        step: 'personal_data_complete'
      };

      localStorage.setItem('registrationData', JSON.stringify(registrationData));

      toast.success('Dados pessoais salvos!');
      
      // Redirecionar para seleção do tipo de conta
      navigate('/register/account-type', { state: { email } });

    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error('Erro ao salvar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E5F0FE' }}>
      {/* Header - Seta de voltar simples */}
      <header className="p-6">
        <Link 
          to="/register" 
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
              Crie uma conta profissional
            </h2>
            <p className="text-gray-600">
              Quase lá! Crie sua nova conta com{' '}
              <span className="font-bold">{email}</span>{' '}
              preenchendo estes dados.
            </p>
          </div>

                     {/* Form */}
           <div className="p-8" style={{ backgroundColor: '#E5F0FE' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="Insira seu nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Sobrenome
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="Insira seu sobrenome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white pr-12"
                    placeholder="Digite uma senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Número de celular
                </label>
                <div className="flex space-x-2">
                  <div className="w-20">
                    <select className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm">
                      <option value="+55">+55</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="Insira seu número de celular"
                    />
                  </div>
                </div>
              </div>

                             <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  País
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="Brazil"
                  />
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Editar
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  defaultChecked
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  Concordo com a{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-700">Política de privacidade</Link>
                  , os{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-700">Termos de serviço</Link>
                  {' '}e os{' '}
                  <Link to="/commercial-terms" className="text-blue-600 hover:text-blue-700">Termos comerciais</Link>.
                </label>
              </div>

                             <button
                 type="submit"
                 disabled={loading}
                 className="w-full bg-blue-600 text-white py-4 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {loading ? (
                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                 ) : (
                   'Criar conta'
                 )}
               </button>
                           </form>
            </div>
          </div>
        </main>
      </div>
  );
};

export default RegisterComplete; 