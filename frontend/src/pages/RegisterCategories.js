import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Scissors, Heart, Star, Sparkles, Users, Activity, Dumbbell, Cross, PawPrint, Grid } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const RegisterCategories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'cabeleireiro', name: 'Cabeleireiro', icon: Scissors, description: 'Serviços de cabelo' },
    { id: 'unhas', name: 'Unhas', icon: Heart, description: 'Manicure e pedicure' },
    { id: 'sobrancelhas-cilios', name: 'Sobrancelhas e cílios', icon: Star, description: 'Design e extensão' },
    { id: 'salao-beleza', name: 'Salão de beleza', icon: Sparkles, description: 'Beleza geral' },
    { id: 'spa-medico', name: 'Spa médico', icon: Star, description: 'Tratamentos estéticos' },
    { id: 'barbeiro', name: 'Barbeiro', icon: Scissors, description: 'Barbearia masculina' },
    { id: 'massagem', name: 'Massagem', icon: Users, description: 'Terapias corporais' },
    { id: 'spa-sauna', name: 'Spa e sauna', icon: Users, description: 'Relaxamento' },
    { id: 'salao-depilacao', name: 'Salão de depilação', icon: Heart, description: 'Depilação' },
    { id: 'tatuagem-piercing', name: 'Tatuagem e piercing', icon: Heart, description: 'Body art' },
    { id: 'bronzeamento', name: 'Bronzeamento', icon: Star, description: 'Bronzeamento artificial' },
    { id: 'fitness-reabilitacao', name: 'Fitness e reabilitação', icon: Activity, description: 'Exercícios' },
    { id: 'fisioterapia', name: 'Fisioterapia', icon: Dumbbell, description: 'Tratamento físico' },
    { id: 'consultorio-medico', name: 'Consultório médico', icon: Cross, description: 'Atendimento médico' },
    { id: 'banho-tosa-pets', name: 'Banho e tosa de pets', icon: PawPrint, description: 'Pet grooming' },
    { id: 'outro', name: 'Outro', icon: Grid, description: 'Outros serviços' }
  ];

  useEffect(() => {
    // Verificar se há dados no localStorage ou se o usuário está logado
    const registrationData = localStorage.getItem('registrationData');
    const token = localStorage.getItem('token');
    
    if (!registrationData && !token) {
      navigate('/register');
    }
  }, [navigate]);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        if (prev.length >= 4) {
          toast.error('Você pode selecionar no máximo 4 categorias');
          return prev;
        }
        return [...prev, categoryId];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedCategories.length === 0) {
      toast.error('Selecione pelo menos uma categoria');
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

      // Salvar categorias no localStorage e redirecionar para próxima etapa
      const updatedData = {
        ...userData,
        barbershop: {
          ...userData.barbershop,
          categories: selectedCategories
        }
      };
      
      localStorage.setItem('registrationData', JSON.stringify(updatedData));
      
      // Redirecionar para seleção do tamanho da equipe
      navigate('/register/team-size');

    } catch (error) {
      console.error('Erro ao salvar categorias:', error);
      toast.error('Erro ao salvar categorias. Tente novamente.');
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
               onClick={() => window.location.href = '/register/business'}
               className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
             >
               <ArrowLeft className="w-5 h-5" />
               <span>Voltar</span>
             </button>

             {/* Progress Bar */}
             <div className="flex-1 max-w-md mx-8">
               <div className="flex items-center space-x-2">
                 <div className="flex-1 bg-gray-200 rounded-full h-2">
                   <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: '66.67%' }}></div>
                 </div>
                 <span className="text-sm text-gray-500">2 de 3</span>
               </div>
             </div>

             {/* Botão Continuar */}
             <button
               onClick={handleSubmit}
               disabled={loading || selectedCategories.length === 0}
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Section Header */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Configuração da conta</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Selecione as categorias que melhor descrevem o seu negócio
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Escolha seu serviço principal e até três tipos de serviços relacionados
            </p>
          </div>

                     {/* Categories Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {categories.map((category) => {
               const IconComponent = category.icon;
               const isSelected = selectedCategories.includes(category.id);
               
               return (
                 <button
                   key={category.id}
                   onClick={() => handleCategoryToggle(category.id)}
                   className={`p-5 bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                     isSelected 
                       ? 'border-blue-500 bg-blue-50 shadow-md' 
                       : 'border-gray-200 hover:border-gray-300'
                   }`}
                 >
                   <div className="flex flex-col items-center text-center space-y-3">
                     <div className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors ${
                       isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                     }`}>
                       <IconComponent className="w-5 h-5" />
                     </div>
                     <div>
                       <h3 className={`font-semibold text-base transition-colors ${
                         isSelected ? 'text-blue-600' : 'text-gray-900'
                       }`}>
                         {category.name}
                       </h3>
                       <p className="text-sm text-gray-500 mt-1">
                         {category.description}
                       </p>
                     </div>
                   </div>
                 </button>
               );
             })}
           </div>

          
        </div>
      </main>
    </div>
  );
};

export default RegisterCategories; 