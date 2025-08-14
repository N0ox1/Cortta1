import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Scissors, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import BarbershopLayout from '../components/BarbershopLayout';
import api from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BarbershopDashboard = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weekAppointments: 0,
    totalClients: 0,
    totalRevenue: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentPending, setPaymentPending] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas
      const statsResponse = await api.get('/barbershop/dashboard/stats');
      setStats(statsResponse.data);

      // Buscar agendamentos de hoje
      const appointmentsResponse = await api.get('/barbershop/dashboard/today-appointments');
      setTodayAppointments(appointmentsResponse.data);

      // Buscar serviços mais agendados
      const servicesResponse = await api.get('/barbershop/dashboard/top-services');
      setTopServices(servicesResponse.data);

      // Verificar pendência de pagamento
      const paymentResponse = await api.get('/barbershop/dashboard/payment-status');
      setPaymentPending(paymentResponse.data.pending);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'SCHEDULED':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Visão geral da sua barbearia
          </p>
        </div>

        {/* Notificação de pagamento pendente */}
        {paymentPending && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Pagamento pendente
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Regularize sua assinatura para continuar usando o sistema sem interrupções.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Agendamentos Hoje
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.todayAppointments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Agendamentos da Semana
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.weekAppointments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total de Clientes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalClients}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Scissors className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Receita Mensal
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(stats.totalRevenue)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Próximos agendamentos */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Próximos Agendamentos
              </h3>
              {todayAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhum agendamento para hoje
                </p>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(appointment.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.client.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(appointment.date), 'HH:mm', { locale: ptBR })} - {appointment.barber.name}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Serviços mais agendados */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Serviços Mais Agendados
              </h3>
              {topServices.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhum serviço agendado ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {topServices.map((service, index) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {service.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {service.count} agendamentos
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(service.totalRevenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BarbershopLayout>
  );
};

export default BarbershopDashboard; 