import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Search
} from 'lucide-react';
import BarbershopLayout from '../components/BarbershopLayout';
import api from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const BarbershopAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Horários do grid (03:00 às 23:00) - apenas horas cheias
  const timeSlots = [];
  for (let hour = 3; hour <= 23; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, statusFilter]);

  // Carregar barbeiros/equipe uma vez (rota protegida)
  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const staffRes = await api.get('/barbershop/staff');
        setBarbers(staffRes.data || []);
      } catch (error) {
        console.error('Erro ao carregar barbeiros:', error);
      }
    };
    fetchBarbers();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/barbershop/appointments', {
        params: {
          date: selectedDate,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      setAppointments(response.data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.patch(`/barbershop/appointments/${appointmentId}/status`, {
        status: newStatus
      });
      
      toast.success('Status atualizado com sucesso');
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  // Encontrar agendamento para um barbeiro em um horário específico (:00 ou :30)
  const findAppointmentForSlot = (barberId, timeSlot) => {
    return appointments.find((appointment) => {
      const appointmentTime = format(new Date(appointment.date), 'HH:mm');
      return appointment.barber.id === barberId && appointmentTime === timeSlot;
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'SCHEDULED':
        return <Clock className="h-3 w-3 text-blue-500" />;
      case 'CANCELLED':
        return <XCircle className="h-3 w-3 text-red-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      default:
        return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmado';
      case 'SCHEDULED':
        return 'Agendado';
      case 'CANCELLED':
        return 'Cancelado';
      case 'COMPLETED':
        return 'Concluído';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Nome compacto: "Primeiro Nome" + "Inicial do Sobrenome"
  const getCompactName = (fullName = '') => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return '';
    const first = parts[0];
    const lastInitial = parts.length > 1 ? `${parts[parts.length - 1][0].toUpperCase()}.` : '';
    return `${first} ${lastInitial}`.trim();
  };

  // Cores únicas para cada barbeiro baseadas no ID
  const getBarberColor = (barberId, index) => {
    const colors = [
      'bg-blue-100 border-blue-400 text-blue-700',
      'bg-green-100 border-green-400 text-green-700',
      'bg-purple-100 border-purple-400 text-purple-700',
      'bg-red-100 border-red-400 text-red-700',
      'bg-yellow-100 border-yellow-400 text-yellow-700',
      'bg-indigo-100 border-indigo-400 text-indigo-700',
      'bg-pink-100 border-pink-400 text-pink-700',
      'bg-teal-100 border-teal-400 text-teal-700',
      'bg-orange-100 border-orange-400 text-orange-700',
      'bg-cyan-100 border-cyan-400 text-cyan-700',
      'bg-lime-100 border-lime-400 text-lime-700',
      'bg-emerald-100 border-emerald-400 text-emerald-700',
      'bg-violet-100 border-violet-400 text-violet-700',
      'bg-rose-100 border-rose-400 text-rose-700',
      'bg-amber-100 border-amber-400 text-amber-700',
      'bg-slate-100 border-slate-400 text-slate-700'
    ];
    return colors[index % colors.length];
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.barber.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <BarbershopLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </BarbershopLayout>
    );
  }

  return (
    <BarbershopLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os agendamentos da sua barbearia
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white shadow rounded-none p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="SCHEDULED">Agendado</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="COMPLETED">Concluído</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>

            {/* Busca */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, email ou barbeiro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Agenda */}
        <div className="bg-white shadow rounded-none overflow-hidden">
          <div className="px-2 sm:px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Agenda - {format(new Date(selectedDate), 'dd/MM/yyyy', { locale: ptBR })}
            </h3>

            {barbers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum barbeiro cadastrado</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr>
                      <th className="sticky left-0 bg-white px-2 sm:px-3 py-2 text-left text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-16 sm:w-20">
                        Horário
                      </th>
                      {barbers.map((barber, index) => (
                        <th
                          key={barber.id}
                          className="px-1 sm:px-2 py-2 text-center text-[10px] sm:text-xs font-medium text-gray-500 tracking-wider align-top whitespace-nowrap"
                        >
                          <div className="flex flex-col items-center justify-start gap-1">
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 ${getBarberColor(barber.id, index)}`}>
                              <span className="text-xs sm:text-sm font-bold">
                                {barber.name?.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                              </span>
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium text-gray-900 leading-tight">
                              {getCompactName(barber.name)}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {timeSlots.map((timeSlot) => (
                      <tr key={timeSlot} className="hover:bg-gray-50">
                        <td className="sticky left-0 bg-white px-2 sm:px-3 py-0.5 text-xs sm:text-sm font-medium text-gray-900 border-r border-gray-200 w-16 sm:w-20">
                          <div className="flex flex-col h-16 sm:h-20 justify-center">
                            <div className="flex-1 flex items-center justify-center text-[10px] sm:text-xs">
                              {timeSlot}
                            </div>
                            <div className="border-t border-gray-200"></div>
                            <div className="flex-1 flex items-center justify-center text-[10px] sm:text-xs text-gray-500">
                              {timeSlot.replace(':00', ':30')}
                            </div>
                          </div>
                        </td>
                        {barbers.map((barber, index) => {
                          const baseHour = timeSlot.split(':')[0];
                          const appointment00 = findAppointmentForSlot(barber.id, `${baseHour}:00`);
                          const appointment30 = findAppointmentForSlot(barber.id, `${baseHour}:30`);
                          
                          return (
                            <td
                              key={`${barber.id}-${timeSlot}`}
                              className="px-1 sm:px-2 py-0.5 text-sm text-gray-900"
                            >
                              <div className="flex flex-col h-16 sm:h-20">
                                {/* Parte superior - :00 */}
                                <div className="flex-1 flex items-center">
                                  {appointment00 ? (
                                    <div
                                      className={`w-full p-1 rounded border-2 cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(appointment00.status)} ${getBarberColor(barber.id, index).split(' ')[1]}`}
                                      onClick={() => {
                                        setSelectedAppointment(appointment00);
                                        setShowDetails(true);
                                      }}
                                    >
                                      <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-[9px] sm:text-[10px] font-medium truncate">
                                          {appointment00.client.name}
                                        </span>
                                        <div className="w-3 h-3 flex-shrink-0">
                                          {getStatusIcon(appointment00.status)}
                                        </div>
                                      </div>
                                      <div className="text-[8px] sm:text-[9px] text-gray-600 truncate">
                                        {appointment00.services.map((s) => s.service.name).join(', ')}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full h-full" />
                                  )}
                                </div>
                                
                                {/* Linha divisória sutil */}
                                <div className="border-t border-gray-100"></div>
                                
                                {/* Parte inferior - :30 */}
                                <div className="flex-1 flex items-center">
                                  {appointment30 ? (
                                    <div
                                      className={`w-full p-1 rounded border-2 cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(appointment30.status)} ${getBarberColor(barber.id, index).split(' ')[1]}`}
                                      onClick={() => {
                                        setSelectedAppointment(appointment30);
                                        setShowDetails(true);
                                      }}
                                    >
                                      <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-[9px] sm:text-[10px] font-medium truncate">
                                          {appointment30.client.name}
                                        </span>
                                        <div className="w-3 h-3 flex-shrink-0">
                                          {getStatusIcon(appointment30.status)}
                                        </div>
                                      </div>
                                      <div className="text-[8px] sm:text-[9px] text-gray-600 truncate">
                                        {appointment30.services.map((s) => s.service.name).join(', ')}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full h-full" />
                                  )}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Lista de agendamentos */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Agendamentos - {format(new Date(selectedDate), 'dd/MM/yyyy', { locale: ptBR })}
            </h3>
            
            {filteredAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum agendamento encontrado para esta data
              </p>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(appointment.status)}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {appointment.client.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {appointment.client.email} • {appointment.client.phone}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(appointment.date), 'HH:mm', { locale: ptBR })} - {appointment.barber.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                        
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowDetails(true);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="mt-3 flex items-center space-x-2">
                      {appointment.status === 'SCHEDULED' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'CONFIRMED')}
                            className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'CANCELLED')}
                            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      
                      {appointment.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'COMPLETED')}
                          className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                        >
                          Marcar como Concluído
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal de detalhes */}
        {showDetails && selectedAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Detalhes do Agendamento
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cliente</label>
                    <p className="text-sm text-gray-900">{selectedAppointment.client.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{selectedAppointment.client.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefone</label>
                    <p className="text-sm text-gray-900">{selectedAppointment.client.phone}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data e Hora</label>
                    <p className="text-sm text-gray-900">
                      {format(new Date(selectedAppointment.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Barbeiro</label>
                    <p className="text-sm text-gray-900">{selectedAppointment.barber.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Serviços</label>
                    <div className="space-y-1">
                      {selectedAppointment.services.map((appointmentService) => (
                        <div key={appointmentService.id} className="flex justify-between">
                          <span className="text-sm text-gray-900">
                            {appointmentService.service.name}
                          </span>
                          <span className="text-sm text-gray-900">
                            {formatCurrency(appointmentService.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">Total</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(selectedAppointment.services.reduce((total, service) => total + service.price, 0))}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BarbershopLayout>
  );
};

export default BarbershopAppointments; 