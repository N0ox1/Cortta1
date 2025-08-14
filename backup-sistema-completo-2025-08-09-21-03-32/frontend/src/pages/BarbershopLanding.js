import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone, Mail, Star, ArrowRight, Scissors, Users, Award } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import toast from 'react-hot-toast';

const BarbershopLanding = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [barbershop, setBarbershop] = useState(null);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBarbershopData();
  }, [slug]);

  const loadBarbershopData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados da barbearia
      const barbershopResponse = await api.get(`/barbershop/${slug}`);
      setBarbershop(barbershopResponse.data);

      // Buscar serviços
      const servicesResponse = await api.get(`/barbershop/${slug}/services`);
      setServices(servicesResponse.data);

      // Buscar barbeiros
      const barbersResponse = await api.get(`/barbershop/${slug}/barbers`);
      setBarbers(barbersResponse.data);

    } catch (error) {
      console.error('Erro ao carregar dados da barbearia:', error);
      if (error.response?.status === 404) {
        setError('Barbearia não encontrada');
      } else {
        setError('Erro ao carregar dados da barbearia');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Barbearia não encontrada</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  if (!barbershop) {
    return null;
  }

  // Cores personalizáveis (com fallback)
  const primaryColor = barbershop.primaryColor || '#2563eb';
  const secondaryColor = barbershop.secondaryColor || '#1e40af';
  const accentColor = barbershop.accentColor || '#fbbf24';

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Hero Section */}
      <div 
        className="relative h-96 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: barbershop.bannerImage 
            ? `url(${barbershop.bannerImage})` 
            : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-4xl mx-auto px-4 text-center text-white">
            {barbershop.logoImage && (
              <img 
                src={barbershop.logoImage} 
                alt={barbershop.name}
                className="w-24 h-24 mx-auto mb-6 rounded-full object-cover border-4 border-white"
              />
            )}
            <h1 className="text-5xl font-bold mb-4">{barbershop.name}</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {barbershop.description || 'Barbearia de qualidade com os melhores profissionais'}
            </p>
            <button
              onClick={() => navigate(`/b/${slug}`)}
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center mx-auto"
              style={{ color: primaryColor }}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Agendar Horário
            </button>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Horário de Funcionamento */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-lg font-semibold">Horário de Funcionamento</h3>
              </div>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Segunda - Sexta:</span>
                  <span>{barbershop.workingHours?.weekdays || '08:00 - 18:00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sábado:</span>
                  <span>{barbershop.workingHours?.saturday || '08:00 - 17:00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingo:</span>
                  <span>{barbershop.workingHours?.sunday || 'Fechado'}</span>
                </div>
              </div>
            </div>

            {/* Localização */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-lg font-semibold">Localização</h3>
              </div>
              <p className="text-gray-600">
                {barbershop.address}
                {barbershop.city && barbershop.state && (
                  <>
                    <br />
                    {`${barbershop.city} - ${barbershop.state}`}
                  </>
                )}
              </p>
            </div>

            {/* Contato */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Phone className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-lg font-semibold">Contato</h3>
              </div>
              <div className="space-y-2 text-gray-600">
                {barbershop.phone && (
                  <a 
                    href={`tel:${barbershop.phone}`}
                    className="block hover:text-blue-600 transition-colors"
                  >
                    {barbershop.phone}
                  </a>
                )}
                {barbershop.email && (
                  <a 
                    href={`mailto:${barbershop.email}`}
                    className="block hover:text-blue-600 transition-colors"
                  >
                    {barbershop.email}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      {services.length > 0 && (
        <div className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossos Serviços</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Oferecemos uma ampla variedade de serviços para cuidar do seu visual
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    <span className="text-lg font-bold" style={{ color: primaryColor }}>
                      R$ {parseFloat(service.price).toFixed(2)}
                    </span>
                  </div>
                  {service.description && (
                    <p className="text-gray-600 mb-4">{service.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {service.duration || 30} min
                    </span>
                    <button
                      onClick={() => navigate(`/b/${slug}`)}
                      className="text-sm font-medium hover:underline"
                      style={{ color: primaryColor }}
                    >
                      Agendar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Team Section */}
      {barbers.length > 0 && (
        <div className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossa Equipe</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Conheça os profissionais que cuidarão do seu visual
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {barbers.map((barber) => (
                <div key={barber.id} className="bg-white rounded-lg p-6 text-center shadow-sm">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{barber.name}</h3>
                  <p className="text-gray-600">Barbeiro Profissional</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="py-16" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Pronto para um novo visual?</h2>
          <p className="text-xl mb-8 opacity-90">
            Agende seu horário agora e garanta seu espaço
          </p>
          <button
            onClick={() => navigate(`/b/${slug}`)}
            className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center mx-auto"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Agendar Agora
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2024 {barbershop.name}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default BarbershopLanding; 