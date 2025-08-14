import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone, Instagram, Mail, User, CheckCircle, AlertCircle } from 'lucide-react';
import { format, addDays, startOfDay, isBefore, isAfter, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import toast from 'react-hot-toast';

const PublicBooking = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // Estados da página
  const [barbershop, setBarbershop] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados do formulário
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [barbers, setBarbers] = useState([]);
  
  // Dados do cliente
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // Horários de funcionamento (serão carregados da barbearia)
  const [workingHours, setWorkingHours] = useState(null);

  // Carregar dados da barbearia
  useEffect(() => {
    const loadBarbershopData = async () => {
      try {
        setLoading(true);
        
        // Buscar dados da barbearia
        const barbershopResponse = await api.get(`/barbershop/public/${slug}`);
        setBarbershop(barbershopResponse.data);
        
        // Configurar horários de funcionamento da barbearia
        const barbershopWorkingHours = barbershopResponse.data.workingHours;
        if (barbershopWorkingHours) {
          setWorkingHours(barbershopWorkingHours);
        } else {
          // Horários padrão caso não estejam configurados
          setWorkingHours({
            monday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
            tuesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
            wednesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
            thursday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
            friday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
            saturday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
            sunday: { isOpen: false, openTime: '08:00', closeTime: '18:00' }
          });
        }
        
        // Buscar serviços
        const servicesResponse = await api.get(`/barbershop/public/${slug}/services`);
        setServices(servicesResponse.data);
        
        // Buscar barbeiros
        const barbersResponse = await api.get(`/barbershop/public/${slug}/barbers`);
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

    if (slug) {
      loadBarbershopData();
    }
  }, [slug]);

  // Gerar horários disponíveis para uma data
  const generateTimeSlots = (date) => {
    if (!workingHours) return [];
    
    const dayOfWeek = date.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const daySchedule = workingHours[dayNames[dayOfWeek]];
    
    // Se a barbearia não funciona neste dia, retornar array vazio
    if (!daySchedule || !daySchedule.isOpen) {
      return [];
    }
    
    const slots = [];
    const startTime = new Date(date);
    startTime.setHours(parseInt(daySchedule.openTime.split(':')[0]), parseInt(daySchedule.openTime.split(':')[1]), 0);
    
    const endTime = new Date(date);
    endTime.setHours(parseInt(daySchedule.closeTime.split(':')[0]), parseInt(daySchedule.closeTime.split(':')[1]), 0);
    
    let currentTime = new Date(startTime);
    const interval = 30; // intervalo de 30 minutos
    
    while (currentTime < endTime) {
      slots.push(format(currentTime, 'HH:mm'));
      currentTime.setMinutes(currentTime.getMinutes() + interval);
    }
    
    return slots;
  };

  // Verificar se a data é válida (não passada e dia de funcionamento)
  const isValidDate = (date) => {
    if (!workingHours) return false;
    
    const today = startOfDay(new Date());
    const selectedDateStart = startOfDay(date);
    
    // Verificar se a data não é no passado
    if (isBefore(selectedDateStart, today)) {
      return false;
    }
    
    // Verificar se a barbearia funciona neste dia
    const dayOfWeek = date.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const daySchedule = workingHours[dayNames[dayOfWeek]];
    
    return daySchedule && daySchedule.isOpen;
  };

  // Gerar próximas datas disponíveis
  const getAvailableDates = () => {
    const dates = [];
    let currentDate = new Date();
    
    for (let i = 0; i < 14; i++) { // Próximas 2 semanas
      const date = addDays(currentDate, i);
      if (isValidDate(date)) {
        dates.push(date);
      }
    }
    
    return dates;
  };

  // Atualizar horários quando a data for selecionada
  useEffect(() => {
    if (selectedDate && workingHours) {
      const slots = generateTimeSlots(selectedDate);
      setAvailableSlots(slots);
      setSelectedTime(null);
    }
  }, [selectedDate, workingHours]);

  // Validar formulário
  const isFormValid = () => {
    return selectedService && 
           selectedDate && 
           selectedTime && 
           clientData.name.trim() && 
           clientData.phone.trim();
  };

  // Enviar agendamento
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSubmitting(true);
      
      const appointmentData = {
        clientName: clientData.name,
        clientEmail: clientData.email,
        clientPhone: clientData.phone,
        date: format(selectedDate, 'yyyy-MM-dd') + 'T' + selectedTime + ':00',
        barberId: barbers[0]?.id || '1', // Usar o primeiro barbeiro disponível
        serviceIds: [selectedService.id]
      };

      const response = await api.post(`/barbershop/public/${slug}/appointments`, appointmentData);
      
      // Preparar dados para a tela de confirmação
      const confirmationData = {
        ...response.data.appointment,
        service: selectedService,
        client: clientData
      };
      
      // Redirecionar para a tela de confirmação
      navigate(`/confirmacao/${slug}`, { 
        state: { appointment: confirmationData } 
      });
      
    } catch (error) {
      console.error('Erro ao realizar agendamento:', error);
      toast.error(error.response?.data?.message || 'Erro ao realizar agendamento');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Carregando...</h2>
          <p className="mt-2 text-gray-600">Preparando sua experiência de agendamento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Ops! Algo deu errado</h1>
          <p className="text-gray-600 mb-8 text-lg">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!barbershop) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header da Barbearia */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-6">
            {barbershop.logoImage ? (
              <img 
                src={barbershop.logoImage} 
                alt={barbershop.name}
                className="w-20 h-20 rounded-2xl object-cover shadow-lg border-4 border-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">{barbershop.name.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{barbershop.name}</h1>
              {barbershop.description && (
                <p className="text-gray-600 text-lg">{barbershop.description}</p>
              )}
            </div>
          </div>
          
          {/* Informações de contato */}
          <div className="flex flex-wrap items-center gap-6 mt-6">
            {barbershop.address && (
              <div className="flex items-center space-x-2 bg-white/60 px-4 py-2 rounded-full shadow-sm">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-gray-700 font-medium">{barbershop.address}</span>
              </div>
            )}
            {barbershop.phone && (
              <a 
                href={`https://wa.me/55${barbershop.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full shadow-sm hover:bg-green-600 transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span className="font-medium">{barbershop.phone}</span>
              </a>
            )}
            {barbershop.instagram && (
              <a 
                href={barbershop.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full shadow-sm hover:from-pink-600 hover:to-purple-600 transition-colors"
              >
                <Instagram className="h-4 w-4" />
                <span className="font-medium">Instagram</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Formulário de Agendamento */}
          <div className="xl:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Agendar Horário</h2>
                  <p className="text-gray-600">Escolha seu serviço e horário preferido</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
              {/* Seleção de Serviço */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Escolha o serviço</h3>
                    <p className="text-gray-600">Selecione o serviço desejado</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        selectedService?.id === service.id
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-2">{service.name}</h3>
                          {service.description && (
                            <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                          )}
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{service.duration} minutos</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-2xl text-blue-600">
                            R$ {parseFloat(service.price).toFixed(2)}
                          </p>
                          {selectedService?.id === service.id && (
                            <div className="mt-2">
                              <CheckCircle className="h-6 w-6 text-blue-500" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seleção de Data */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Escolha a data</h3>
                    <p className="text-gray-600">Selecione o dia para seu agendamento</p>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-3">
                  {getAvailableDates().map((date) => (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`p-4 text-center rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                        selectedDate?.toDateString() === date.toDateString()
                          ? 'border-blue-500 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                          : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-md'
                      }`}
                    >
                      <div className={`text-xs font-medium mb-1 ${
                        selectedDate?.toDateString() === date.toDateString() ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {format(date, 'EEE', { locale: ptBR })}
                      </div>
                      <div className={`text-xl font-bold ${
                        selectedDate?.toDateString() === date.toDateString() ? 'text-white' : 'text-gray-900'
                      }`}>
                        {format(date, 'dd')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seleção de Horário */}
              {selectedDate && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Escolha o horário</h3>
                      <p className="text-gray-600">Selecione o horário disponível</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`p-4 text-center rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                          selectedTime === time
                            ? 'border-purple-500 bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                            : 'border-gray-200 hover:border-purple-300 bg-white hover:shadow-md'
                        }`}
                      >
                        <span className={`font-bold text-lg ${
                          selectedTime === time ? 'text-white' : 'text-gray-900'
                        }`}>
                          {time}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dados do Cliente */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Seus dados</h3>
                    <p className="text-gray-600">Informações para contato</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      value={clientData.name}
                      onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg"
                      placeholder="Digite seu nome completo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Telefone/WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={clientData.phone}
                      onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 text-lg"
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    E-mail (opcional)
                  </label>
                  <input
                    type="email"
                    value={clientData.email}
                    onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 text-lg"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {/* Botão de Agendamento */}
              <button
                type="submit"
                disabled={!isFormValid() || submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {submitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Agendando...</span>
                  </div>
                ) : (
                  'Confirmar Agendamento'
                )}
              </button>
            </form>
          </div>
        </div>

          {/* Resumo do Agendamento */}
          <div className="space-y-6">
            {/* Card de Resumo */}
            {(selectedService || selectedDate || selectedTime) && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Resumo do Agendamento</h3>
                    <p className="text-gray-600">Confira os detalhes do seu agendamento</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {selectedService && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Serviço:</span>
                      <span className="font-bold text-gray-900">{selectedService.name}</span>
                    </div>
                  )}
                  
                  {selectedDate && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Data:</span>
                      <span className="font-bold text-gray-900">
                        {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  
                  {selectedTime && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Horário:</span>
                      <span className="font-bold text-gray-900">{selectedTime}</span>
                    </div>
                  )}
                  
                  {selectedService && (
                    <div className="flex justify-between items-center py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl px-4">
                      <span className="text-gray-700 font-bold text-lg">Valor Total:</span>
                      <span className="font-bold text-2xl text-blue-600">
                        R$ {parseFloat(selectedService.price).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Card de Informações */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Informações Importantes</h3>
                  <p className="text-gray-600">Dicas para um melhor atendimento</p>
                </div>
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">Chegue com 10 minutos de antecedência</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">Em caso de cancelamento, avise com antecedência</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">Você receberá uma confirmação por WhatsApp</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBooking; 