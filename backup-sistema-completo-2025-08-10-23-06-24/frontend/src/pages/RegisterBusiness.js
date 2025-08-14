import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Scissors, ArrowLeft, Building2, MapPin, Phone, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const RegisterBusiness = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
       const [formData, setFormData] = useState({
    businessName: '',
    businessPhone: '',
    businessAddress: '',
    businessCity: '',
    businessState: '',
    businessDescription: '',
    businessWebsite: '',
    onlineOnly: false,
    businessNumber: '',
    businessComplement: ''
  });
  const [cep, setCep] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Apenas definir o email se estiver disponível no state
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

           const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Limpar erro do campo quando o usuário começa a digitar
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    };

               const handleCepChange = (e) => {
       const value = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
       setCep(value);
       
       // Limpar erro de localização quando o usuário digita CEP
       if (errors.location) {
         setErrors(prev => ({ ...prev, location: null }));
       }
       
       // Se o CEP foi apagado, limpar os campos de endereço
       if (value.length === 0) {
         setFormData(prev => ({
           ...prev,
           businessAddress: '',
           businessCity: '',
           businessState: ''
         }));
       }
       
       // Buscar CEP quando tiver 8 dígitos
       if (value.length === 8) {
         searchCep(value);
       }
     };

       const searchCep = async (cepValue) => {
      try {
        setLoadingCep(true);
        const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            businessAddress: data.logradouro,
            businessCity: data.localidade,
            businessState: data.uf
          }));
        } else {
          toast.error('CEP não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast.error('Erro ao buscar CEP');
      } finally {
        setLoadingCep(false);
      }
    };

       const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpar erros anteriores
    setErrors({});

    // Validações básicas
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Nome da empresa é obrigatório';
    }

    // Validar se tem CEP OU checkbox marcado
    const hasCep = cep.length > 0;
    const hasOnlineOnly = formData.onlineOnly;
    
    if (!hasCep && !hasOnlineOnly) {
      newErrors.location = 'Digite um CEP ou marque a opção "Eu não tenho um endereço comercial"';
    }
    
    // Se tem CEP, validar se o número foi preenchido
    if (hasCep && !formData.onlineOnly && !formData.businessNumber.trim()) {
      newErrors.businessNumber = 'Preencha o número do endereço.';
    }

    // Se há erros, mostrar e parar
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    

    try {
      setLoading(true);

            // Recuperar dados do registro do localStorage
      const registrationData = localStorage.getItem('registrationData');
      if (!registrationData) {
        toast.error('Dados de registro não encontrados. Tente novamente.');
        navigate('/register/account-type');
        return;
      }

      const userData = JSON.parse(registrationData);

      // Salvar dados da barbearia no localStorage para usar na próxima etapa
      const businessData = {
        ...userData,
        barbershop: {
          name: formData.businessName,
          phone: formData.businessPhone,
          address: formData.businessAddress,
          city: formData.businessCity,
          state: formData.businessState,
          description: formData.businessDescription,
          website: formData.businessWebsite,
          number: formData.businessNumber,
          complement: formData.businessComplement,
          onlineOnly: formData.onlineOnly
        }
      };
      
      localStorage.setItem('registrationData', JSON.stringify(businessData));
      
      // Redirecionar para seleção de categorias
      navigate('/register/categories');

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
               onClick={() => window.location.href = '/register/account-type'}
               className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
             >
               <ArrowLeft className="w-5 h-5" />
               <span>Voltar</span>
             </button>

             {/* Progress Bar */}
             <div className="flex-1 max-w-md mx-8">
               <div className="flex items-center space-x-2">
                 <div className="flex-1 bg-gray-200 rounded-full h-2">
                   <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: '33.33%' }}></div>
                 </div>
                 <span className="text-sm text-gray-500">1 de 3</span>
               </div>
             </div>

             {/* Botão Continuar */}
             <button
               type="submit"
               form="business-form"
               disabled={loading}
               className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
             >
               <span>Continuar</span>
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
               </svg>
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
              Qual é o nome da sua empresa?
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Este é o nome que seus clientes verão. Seu endereço de cobrança e razão social podem ser adicionados mais tarde.
            </p>
          </div>

          {/* Form */}
          <form id="business-form" onSubmit={handleSubmit} className="space-y-6">
                         <div>
               <label className="block text-sm font-medium text-gray-900 mb-2">
                 Nome da empresa
               </label>
                              <input
                 type="text"
                 name="businessName"
                 value={formData.businessName}
                 onChange={handleInputChange}
                 className={`w-full px-4 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-lg ${
                   errors.businessName ? 'border-red-500' : 'border-gray-300'
                 }`}
                 placeholder="Ex: Barbearia do João"
                 required
               />
               {errors.businessName && (
                 <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
               )}
             </div>

                         <div>
               <label className="block text-sm font-medium text-gray-900 mb-2">
                 Site (opcional)
               </label>
               <input
                 type="url"
                 name="businessWebsite"
                 value={formData.businessWebsite || ''}
                 onChange={handleInputChange}
                 className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-lg"
                 placeholder="www.seusite.com"
               />
             </div>

                                                                                                                                <div>
                   <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                     Onde está localizada a sua empresa?
                   </h2>
                  
                  {/* Campo CEP */}
                  <div className={`mb-4 ${errors.location ? 'border-2 border-red-500 rounded-lg p-4' : ''}`}>
                    {errors.location && (
                      <p className="mb-2 text-sm text-red-600 font-medium">{errors.location}</p>
                    )}
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     CEP (digite para buscar o endereço automaticamente)
                   </label>
                   <div className="relative">
                                          <input
                        type="text"
                        value={cep}
                        onChange={handleCepChange}
                        className="w-full px-4 py-4 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-lg"
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      <MapPin className="absolute left-4 text-gray-400 w-5 h-5" style={{ top: '1.125rem' }} />
                     {loadingCep && (
                       <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                       </div>
                     )}
                   </div>
                 </div>

                                                                   {/* Campos de Endereço - Só aparecem após digitar CEP e se não for online only */}
                  {formData.businessAddress && !formData.onlineOnly && (
                   <>
                                           {/* Campo Endereço */}
                                             <div className="relative mt-6">
                         <label className="block text-sm font-medium text-gray-700 mb-2">
                           Endereço
                         </label>
                         <div className="relative flex items-center">
                           <input
                             type="text"
                             name="businessAddress"
                             value={formData.businessAddress}
                             onChange={handleInputChange}
                             className="w-full px-4 py-4 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-lg"
                             placeholder="Endereço"
                           />
                           <MapPin className="absolute left-4 text-gray-400 w-5 h-5" />
                         </div>
                       </div>

                      {/* Campos Número e Complemento */}
                      <div className="grid grid-cols-2 gap-4 mt-6">
                                               <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Número
                          </label>
                          <input
                            type="text"
                            name="businessNumber"
                            value={formData.businessNumber}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-lg ${
                              errors.businessNumber ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="123"
                          />
                          {errors.businessNumber && (
                            <p className="mt-1 text-sm text-red-600">{errors.businessNumber}</p>
                          )}
                        </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">
                           Complemento
                         </label>
                         <input
                           type="text"
                           name="businessComplement"
                           value={formData.businessComplement}
                           onChange={handleInputChange}
                           className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-lg"
                           placeholder="Apto, Sala, etc."
                         />
                       </div>
                     </div>

                                           {/* Campos Cidade e Estado */}
                      <div className="grid grid-cols-2 gap-4 mt-6">
                                               <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cidade
                          </label>
                                                     <input
                             type="text"
                             name="businessCity"
                             value={formData.businessCity}
                             readOnly
                             className="w-full px-4 py-4 border border-gray-300 rounded-lg text-lg cursor-not-allowed"
                             style={{ backgroundColor: '#E8F2FF' }}
                             placeholder="Cidade"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Estado
                           </label>
                           <input
                             type="text"
                             name="businessState"
                             value={formData.businessState}
                             readOnly
                             className="w-full px-4 py-4 border border-gray-300 rounded-lg text-lg cursor-not-allowed"
                             style={{ backgroundColor: '#E8F2FF' }}
                             placeholder="UF"
                           />
                        </div>
                     </div>
                   </>
                 )}
                               <div className="mt-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="onlineOnly"
                      checked={formData.onlineOnly}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setFormData(prev => ({
                          ...prev,
                          onlineOnly: isChecked
                        }));
                        
                        // Se marcou o checkbox, limpar CEP e campos de endereço
                        if (isChecked) {
                          setCep('');
                          setFormData(prev => ({
                            ...prev,
                            businessAddress: '',
                            businessCity: '',
                            businessState: '',
                            businessNumber: '',
                            businessComplement: ''
                          }));
                        }
                        
                        // Limpar erro de localização quando checkbox é marcado
                        if (isChecked && errors.location) {
                          setErrors(prev => ({ ...prev, location: null }));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Eu não tenho um endereço comercial (apenas serviços online e por telefone)
                    </span>
                  </label>
                </div>

             </div>

                         
          </form>

          
        </div>
      </main>
    </div>
  );
};

export default RegisterBusiness; 