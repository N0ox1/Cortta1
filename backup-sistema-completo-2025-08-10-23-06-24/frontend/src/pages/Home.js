import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone, Search, ArrowRight, Scissors, Users, Building2, Settings, Star, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Home = () => {
  // Teste de hot reload - verificar se barbearias continuam aparecendo
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [barbershops, setBarbershops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [filteredBarbershops, setFilteredBarbershops] = useState([]);
  const [showAllBarbershops, setShowAllBarbershops] = useState(false);

  useEffect(() => {
    loadBarbershops();
  }, []);

  // Função para normalizar texto (remover acentos)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  useEffect(() => {
    // Verificar se barbershops existe e é array
    if (!barbershops || !Array.isArray(barbershops)) {
      return;
    }
    
    // Filtrar barbearias baseado no termo de busca
    if (searchTerm.trim() === '') {
      setFilteredBarbershops(barbershops);
    } else {
      const normalizedSearchTerm = normalizeText(searchTerm);
      
      const filtered = barbershops.filter(barbershop => {
        const normalizedName = normalizeText(barbershop.name);
        const normalizedCity = barbershop.city ? normalizeText(barbershop.city) : '';
        const normalizedAddress = barbershop.address ? normalizeText(barbershop.address) : '';
        
        return (
          normalizedName.includes(normalizedSearchTerm) ||
          normalizedCity.includes(normalizedSearchTerm) ||
          normalizedAddress.includes(normalizedSearchTerm) ||
          // Busca também no texto original (para casos sem acentos)
          barbershop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          barbershop.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          barbershop.address?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredBarbershops(filtered);
    }
  }, [searchTerm, barbershops]);

  const loadBarbershops = async () => {
    try {
      setLoading(true);
      const response = await api.get('/barbershop/public');
      setBarbershops(response.data);
      setFilteredBarbershops(response.data);
    } catch (error) {
      console.error('Erro ao carregar barbearias:', error);
      // Não mostrar toast de erro para não poluir a interface
    } finally {
      setLoading(false);
    }
  };

  const handleBarbershopClick = (slug) => {
    navigate(`/b/${slug}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-200 to-blue-400">
      <style jsx>{`
        * {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
      
             {/* Header */}
       <header className="glass-effect sticky top-0 z-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex justify-between items-center py-4">
             {/* Logo */}
             <div className="flex items-center">
               <Scissors className="h-6 w-6 text-blue-600 mr-2" />
               <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                 Cortta
               </h1>
             </div>

             {/* Menu de Navegação */}
             <nav className="hidden md:flex items-center space-x-8">
               <a 
                 href="#barbershops-section" 
                 className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105"
               >
                 Funcionalidades
               </a>
               <a 
                 href="#vantagens-section" 
                 className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105"
               >
                 Para Seu Negócio
               </a>
                               <a 
                  href="#sobre-section" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105"
                >
                  Planos e Preços
                </a>
                <a 
                  onClick={() => navigate('/contact')}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  Sobre Nós
                </a>
                               
             </nav>

             {/* Botões de Ação */}
             <div className="flex items-center space-x-4">
               {user ? (
                 <>
                   <button
                     onClick={() => navigate('/dashboard')}
                     className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-900 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                   >
                     <Settings className="h-4 w-4 mr-2" />
                     Dashboard
                   </button>
                   <button
                     onClick={() => {
                       logout();
                       toast.success('Sessão encerrada com sucesso!');
                     }}
                     className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                     title="Encerrar sessão"
                   >
                     <LogOut className="h-4 w-4" />
                   </button>
                 </>
               ) : (
                 <>
                   <button
                     onClick={() => navigate('/register')}
                     className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-900 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                   >
                     <Building2 className="h-4 w-4 mr-2" />
                     CONHEÇA GRÁTIS
                   </button>
                   <button
                     onClick={() => navigate('/login')}
                     className="bg-white text-blue-600 hover:bg-blue-50 border-2 border-blue-600 hover:border-blue-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center shadow-md hover:shadow-lg transform hover:scale-105"
                   >
                     <Building2 className="h-4 w-4 mr-2" />
                     JÁ SOU CLIENTE
                   </button>
                 </>
               )}
             </div>
           </div>
         </div>
       </header>

      {/* Hero Section */}
      <div className="relative py-8">
        {/* Background com gradiente moderno */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-blue-300 to-blue-500">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_20%)]"></div>
          <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-blue-500/10 rounded-full blur-md animate-float"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-400/10 to-indigo-500/10 rounded-full blur-md animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-black text-blue-800 mb-6 leading-relaxed">
              Agende na Melhor Barbearia da Sua Região
            </h1>
            <p className="text-xl md:text-2xl text-blue-700 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Rápido, online e sem complicação.
            </p>
            
                         {/* Search Bar */}
             <div className="max-w-2xl mx-auto mb-12">
               <div className="relative group">
                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600 group-focus-within:text-blue-700 transition-colors z-10" />
                 <input
                   type="text"
                   placeholder="Digite o nome da barbearia ou cidade..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-12 pr-4 py-4 border-0 rounded-xl focus:ring-2 focus:ring-blue-300/50 text-lg shadow-xl bg-white/80 backdrop-blur-sm text-blue-800 placeholder-blue-400 transition-all duration-300"
                 />
               </div>
             </div>

            {/* CTA Button */}
            <button
              onClick={() => document.getElementById('barbershops-section').scrollIntoView({ behavior: 'smooth' })}
              className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 flex items-center justify-center mx-auto mb-12"
            >
              <Search className="h-5 w-5 mr-2 text-white" />
              Ver Barbearias Disponíveis
            </button>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="text-center group">
                <div className="text-4xl font-black text-blue-800 mb-2 group-hover:scale-105 transition-transform duration-300">
                  {barbershops.length}+
                </div>
                <div className="text-blue-900 text-base font-semibold">Barbearias Cadastradas</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-black text-blue-800 mb-2 group-hover:scale-105 transition-transform duration-300">
                  24/7
                </div>
                <div className="text-blue-900 text-base font-semibold">Agendamento Online</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barbershops List */}
      <div id="barbershops-section" className="py-20 bg-[#E8F2FF] relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-blue-200/10 to-blue-300/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-200/10 to-indigo-300/10 rounded-full blur-2xl"></div>
        
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text mb-4">
              Barbearias Disponíveis
            </h2>
                         <p className="text-lg text-gray-600 font-light">
               {searchTerm 
                 ? `Resultados para "${searchTerm}"` 
                 : 'Todas as barbearias cadastradas na plataforma'
               }
             </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : filteredBarbershops.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(showAllBarbershops ? filteredBarbershops : filteredBarbershops.slice(0, 3)).map((barbershop) => (
                  <div
                    key={barbershop.id}
                    onClick={() => handleBarbershopClick(barbershop.slug)}
                    className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 border border-white/20 overflow-hidden flex flex-col h-full"
                  >
                    {/* Imagem da barbearia */}
                    <div className="relative h-40 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Scissors className="h-12 w-12 text-white opacity-90 drop-shadow-lg" />
                      </div>
                      {/* Badge Premium */}
                      <div className="absolute top-4 right-4">
                        <span className="bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                          Premium
                        </span>
                      </div>
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-blue-800 group-hover:bg-clip-text transition-all duration-300">
                            {barbershop.name}
                          </h3>
                          {barbershop.description && (
                            <p className="text-gray-600 mb-3 line-clamp-2 leading-relaxed text-sm">
                              {barbershop.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 text-gray-600 mb-6 flex-1">
                        {barbershop.address && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="truncate text-sm">
                              {barbershop.address}
                              {barbershop.city && barbershop.state && `, ${barbershop.city} - ${barbershop.state}`}
                            </span>
                          </div>
                        )}
                        
                        {barbershop.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-green-500" />
                            <span className="text-sm">{barbershop.phone}</span>
                          </div>
                        )}

                        {barbershop.workingHours?.weekdays && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-purple-500" />
                            <span className="text-sm">{barbershop.workingHours.weekdays}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-center pt-4 border-t border-gray-200">
                        <button className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full max-w-xs">
                          Agendar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Botão Ver Mais */}
              {filteredBarbershops.length > 3 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowAllBarbershops(!showAllBarbershops)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center mx-auto"
                  >
                    {showAllBarbershops ? (
                      <>
                        <ArrowRight className="h-5 w-5 mr-2 rotate-180" />
                        Ver Menos
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-5 w-5 mr-2" />
                        Ver Mais ({filteredBarbershops.length - 3} barbearias)
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
                         <div className="text-center py-12">
               <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
               <h3 className="text-lg font-semibold text-gray-900 mb-2">
                 Nenhuma barbearia encontrada
               </h3>
               <p className="text-gray-600 mb-6">
                 {searchTerm 
                   ? `Não encontramos barbearias para "${searchTerm}". Tente outro termo de busca.`
                   : 'Nenhuma barbearia cadastrada no momento.'
                 }
               </p>
               {searchTerm && (
                 <button
                   onClick={() => setSearchTerm('')}
                   className="text-blue-600 hover:text-blue-700 font-medium"
                 >
                   Limpar busca
                 </button>
               )}
             </div>
          )}
        </div>
      </div>

             {/* Vantagens Section */}
       <div id="vantagens-section" className="py-20 bg-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-200/15 to-blue-300/15 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/15 to-indigo-300/15 rounded-full blur-2xl"></div>
        
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text mb-4">
              🧩 Por que usar a Cortta?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto font-light">
              A plataforma mais completa para agendamentos de barbearia
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="group p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Agendamento 100% online</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Reserve seu horário em poucos cliques, sem ligações ou filas</p>
                  </div>
                </div>
              </div>
              
              <div className="group p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Avaliações reais</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Veja o que outros clientes dizem sobre cada barbearia</p>
                  </div>
                </div>
              </div>
              
              <div className="group p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmação por WhatsApp</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Receba lembretes e confirmações direto no seu celular</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="group p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Barbearias verificadas</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Todas as barbearias são verificadas e aprovadas pela nossa equipe</p>
                  </div>
                </div>
              </div>
              
              <div className="group p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Funciona em qualquer horário</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Agende 24 horas por dia, 7 dias por semana</p>
                  </div>
                </div>
              </div>
              
              <div className="group p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Histórico completo</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Acompanhe todos os seus agendamentos e histórico de serviços</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
                 </div>
       </div>

       

       

       {/* Footer */}
      <footer className="bg-[#EFF6FF] text-gray-800 py-16 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.05),transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-blue-400/5 to-blue-500/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-400/5 to-indigo-500/5 rounded-full blur-2xl"></div>
        
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo e descrição */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <Scissors className="h-8 w-8 text-blue-600 mr-3" />
                <span className="text-2xl font-black text-blue-800">
                  Cortta
                </span>
              </div>
              <p className="text-gray-700 mb-6 max-w-lg text-base leading-relaxed">
                A plataforma que conecta clientes às melhores barbearias. 
                Agendamento online simples, rápido e confiável.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-500 hover:text-blue-600 transition-all duration-300 transform hover:scale-110">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600 transition-all duration-300 transform hover:scale-110">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600 transition-all duration-300 transform hover:scale-110">
                  <span className="sr-only">WhatsApp</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Links úteis */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-blue-800">Links Úteis</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover:translate-x-1 block text-sm">Sobre nós</a></li>
                <li><a href="#" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover:translate-x-1 block text-sm">Como funciona</a></li>
                <li><a href="#" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover:translate-x-1 block text-sm">Termos de uso</a></li>
                <li><a href="#" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover:translate-x-1 block text-sm">Política de privacidade</a></li>
              </ul>
            </div>

            {/* Suporte */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-blue-800">Suporte</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover:translate-x-1 block text-sm">Central de ajuda</a></li>
                <li><a href="#" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover:translate-x-1 block text-sm">Contato</a></li>
                <li><a href="#" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover:translate-x-1 block text-sm">FAQ</a></li>
                <li><a href="#" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover:translate-x-1 block text-sm">Status do sistema</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 mt-12 pt-6 text-center">
            <p className="text-gray-600 text-base">
              &copy; 2024 Cortta. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 