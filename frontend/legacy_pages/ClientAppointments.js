import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone, Search, ArrowLeft, X, CheckCircle, AlertCircle } from 'lucide-react';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import toast from 'react-hot-toast';

const ClientAppointments = () => {
  const { phone } = useParams();
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phoneInput, setPhoneInput] = useState(phone || '');
  const [isSearching, setIsSearching] = useState(false);

  // Buscar agendamentos quando o telefone é fornecido na URL
  useEffect(() => {
    if (phone) {
      searchAppointments(phone);
    }
  }, [phone]);

  const searchAppointments = async (phoneNumber) => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Digite um número de telefone válido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsSearching(true);

      const response = await api.get(`/client/appointments/${phoneNumber}`);
      setAppointments(response.data);
      
      if (response.data.length === 0) {
        toast.info('Nenhum agendamento encontrado para este telefone');
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      if (error.response?.status === 404) {
        setError('Nenhum agendamento encontrado para este telefone');
      } else {
        setError('Erro ao buscar agendamentos. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchAppointments(phoneInput);
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }

    try {
      await api.delete(`/appointments/${appointmentId}/cancel`);
      toast.success('Agendamento cancelado com sucesso!');
      
      // Atualizar lista de agendamentos
      searchAppointments(phoneInput);
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      toast.error('Erro ao cancelar agendamento. Tente novamente.');
    }
  };

  const getAppointmentStatus = (appointment) => {
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    
    if (appointment.status === 'CANCELLED') {
      return { text: 'Cancelado', color: 'text-red-600', bg: 'bg-red-50' };
    }
    
    if (appointment.status === 'COMPLETED') {
      return { text: 'Concluído', color: 'text-green-600', bg: 'bg-green-50' };
    }
    
    if (isBefore(appointmentDate, now)) {
      return { text: 'Expirado', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
    
    if (isAfter(startOfDay(appointmentDate), startOfDay(now))) {
      return { text: 'Agendado', color: 'text-blue-600', bg: 'bg-blue-50' };
    }
    
    return { text: 'Hoje', color: 'text-orange-600', bg: 'bg-orange-50' };
  };

  const canCancelAppointment = (appointment) => {
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    const hoursUntilAppointment = (appointmentDate - now) / (1000 * 60 * 60);
    
    return appointment.status === 'SCHEDULED' && 
           isAfter(appointmentDate, now) && 
           hoursUntilAppointment > 2; // Só pode cancelar se faltar mais de 2 horas
  };

  if (!isSearching) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Formulário de Busca */}
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Consultar Agendamentos</h1>
            <p className="text-gray-600">Digite seu número de telefone para ver seus agendamentos</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Telefone
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Buscando...' : 'Consultar Agendamentos'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Não tem agendamento?{' '}
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Fazer um agendamento
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setIsSearching(false);
                  setAppointments([]);
                  setError(null);
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Nova Consulta</span>
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Telefone: {phoneInput}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Buscando agendamentos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Nenhum agendamento encontrado</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => {
                setIsSearching(false);
                setError(null);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar outro telefone
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Seus Agendamentos</h1>
              <p className="text-gray-600">
                {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} encontrado{appointments.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-4">
              {appointments.map((appointment) => {
                const status = getAppointmentStatus(appointment);
                const canCancel = canCancelAppointment(appointment);
                
                return (
                  <div key={appointment.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                            {status.text}
                          </div>
                          {appointment.barbershop && (
                            <span className="text-sm text-gray-600">
                              {appointment.barbershop.name}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">
                              {format(new Date(appointment.date), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>

                          {appointment.services && appointment.services.length > 0 && (
                            <div className="flex items-center space-x-3">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <div>
                                {appointment.services.map((service, index) => (
                                  <span key={service.id} className="text-gray-900">
                                    {service.service.name}
                                    {index < appointment.services.length - 1 ? ', ' : ''}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {appointment.barbershop?.address && (
                            <div className="flex items-center space-x-3">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{appointment.barbershop.address}</span>
                            </div>
                          )}

                          {appointment.barbershop?.phone && (
                            <div className="flex items-center space-x-3">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <a 
                                href={`https://wa.me/55${appointment.barbershop.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-700 font-medium"
                              >
                                {appointment.barbershop.phone}
                              </a>
                            </div>
                          )}
                        </div>

                        {appointment.services && appointment.services.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Valor total:</span>
                              <span className="font-semibold text-lg text-gray-900">
                                R$ {appointment.services.reduce((total, service) => total + parseFloat(service.price), 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {canCancel && (
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="ml-4 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {appointments.length > 0 && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => navigate('/')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Fazer Novo Agendamento
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientAppointments; 