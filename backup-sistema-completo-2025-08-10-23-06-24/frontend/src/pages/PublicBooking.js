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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header da Barbearia */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            {barbershop.logo && (
              <img 
                src={`/uploads/logos/${barbershop.logo}`} 
                alt={barbershop.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{barbershop.name}</h1>
              {barbershop.description && (
                <p className="text-gray-600 mt-1">{barbershop.description}</p>
              )}
            </div>
          </div>
          
          {/* Informações de contato */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
            {barbershop.address && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{barbershop.address}</span>
              </div>
            )}
            {barbershop.phone && (
              <a 
                href={`https://wa.me/55${barbershop.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-green-600 hover:text-green-700"
              >
                <Phone className="h-4 w-4" />
                <span>{barbershop.phone}</span>
              </a>
            )}
            {barbershop.instagram && (
              <a 
                href={barbershop.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-pink-600 hover:text-pink-700"
              >
                <Instagram className="h-4 w-4" />
                <span>Instagram</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Agendamento */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Agendar Horário</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seleção de Serviço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escolha o serviço
                </label>
                <div className="space-y-2">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedService?.id === service.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{service.name}</h3>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            R$ {parseFloat(service.price).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">{service.duration} min</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seleção de Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escolha a data
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {getAvailableDates().map((date) => (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`p-3 text-center rounded-lg border transition-colors ${
                        selectedDate?.toDateString() === date.toDateString()
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xs text-gray-500">
                        {format(date, 'EEE', { locale: ptBR })}
                      </div>
                      <div className="font-medium">
                        {format(date, 'dd')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seleção de Horário */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escolha o horário
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 text-center rounded-lg border transition-colors ${
                          selectedTime === time
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dados do Cliente */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Seus dados</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    value={clientData.name}
                    onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone/WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={clientData.phone}
                    onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail (opcional)
                  </label>
                  <input
                    type="email"
                    value={clientData.email}
                    onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {/* Botão de Agendamento */}
              <button
                type="submit"
                disabled={!isFormValid() || submitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Agendando...' : 'Confirmar Agendamento'}
              </button>
            </form>
          </div>

          {/* Resumo do Agendamento */}
          <div className="space-y-6">
            {/* Card de Resumo */}
            {(selectedService || selectedDate || selectedTime) && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Agendamento</h3>
                
                <div className="space-y-3">
                  {selectedService && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Serviço:</span>
                      <span className="font-medium">{selectedService.name}</span>
                    </div>
                  )}
                  
                  {selectedDate && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Data:</span>
                      <span className="font-medium">
                        {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  
                  {selectedTime && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Horário:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                  )}
                  
                  {selectedService && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Valor:</span>
                      <span className="font-semibold text-lg text-blue-600">
                        R$ {parseFloat(selectedService.price).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Card de Informações */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Informações Importantes</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Chegue com 10 minutos de antecedência</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Em caso de cancelamento, avise com antecedência</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Você receberá uma confirmação por WhatsApp</span>
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