import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Building2,
  Calendar,
  Eye
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [barbershopFilter, setBarbershopFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [barbershops, setBarbershops] = useState([]);

  useEffect(() => {
    fetchPayments();
    fetchBarbershops();
  }, [currentPage, statusFilter, barbershopFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined,
        barbershopId: barbershopFilter || undefined
      };

      const response = await api.get('/admin/payments', { params });
      setPayments(response.data.payments);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      toast.error('Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const fetchBarbershops = async () => {
    try {
      const response = await api.get('/admin/barbershops', { params: { limit: 100 } });
      setBarbershops(response.data.barbershops);
    } catch (error) {
      console.error('Erro ao buscar barbearias:', error);
    }
  };

  const handleMarkAsPaid = async (paymentId, method = 'CREDIT_CARD') => {
    try {
      await api.patch(`/admin/payments/${paymentId}/pay`, { method });
      toast.success('Pagamento confirmado com sucesso');
      fetchPayments();
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast.error('Erro ao confirmar pagamento');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        text: 'Pendente'
      },
      PAID: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        text: 'Pago'
      },
      OVERDUE: {
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        text: 'Vencido'
      },
      CANCELLED: {
        color: 'bg-gray-100 text-gray-800',
        icon: XCircle,
        text: 'Cancelado'
      }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getMethodBadge = (method) => {
    const methodConfig = {
      CREDIT_CARD: { color: 'bg-blue-100 text-blue-800', text: 'Cartão' },
      PIX: { color: 'bg-green-100 text-green-800', text: 'PIX' },
      BANK_TRANSFER: { color: 'bg-purple-100 text-purple-800', text: 'Transferência' },
      CASH: { color: 'bg-gray-100 text-gray-800', text: 'Dinheiro' }
    };

    const config = methodConfig[method];

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  if (loading && payments.length === 0) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão Financeira</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie pagamentos e cobranças das barbearias
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Relatório
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
              <CreditCard className="h-4 w-4 mr-2" />
              Nova Cobrança
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">Todos os status</option>
                <option value="PENDING">Pendentes</option>
                <option value="PAID">Pagos</option>
                <option value="OVERDUE">Vencidos</option>
                <option value="CANCELLED">Cancelados</option>
              </select>
            </div>

            {/* Barbershop Filter */}
            <div>
              <label htmlFor="barbershop" className="block text-sm font-medium text-gray-700">
                Barbearia
              </label>
              <select
                id="barbershop"
                value={barbershopFilter}
                onChange={(e) => setBarbershopFilter(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">Todas as barbearias</option>
                {barbershops.map((barbershop) => (
                  <option key={barbershop.id} value={barbershop.id}>
                    {barbershop.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <p className="text-sm text-gray-500">
                {payments.length} pagamento(s) encontrado(s)
              </p>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barbearia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pagamento
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    {/* Barbershop Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.barbershop.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.barbershop.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                      {payment.description && (
                        <div className="text-xs text-gray-500">
                          {payment.description}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                      {payment.status === 'PENDING' && isOverdue(payment.dueDate) && (
                        <div className="text-xs text-red-600 mt-1">
                          Vencido há {Math.ceil((new Date() - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24))} dias
                        </div>
                      )}
                    </td>

                    {/* Method */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getMethodBadge(payment.method)}
                    </td>

                    {/* Due Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(payment.dueDate)}
                      </div>
                      {payment.status === 'PENDING' && isOverdue(payment.dueDate) && (
                        <div className="text-xs text-red-600">
                          Vencido
                        </div>
                      )}
                    </td>

                    {/* Paid Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.paidAt ? (
                        <div className="text-sm text-gray-900">
                          {formatDate(payment.paidAt)}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Não pago
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {payment.status === 'PENDING' && (
                          <button
                            onClick={() => handleMarkAsPaid(payment.id)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                            title="Marcar como pago"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </button>
                        )}
                        <button className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200">
                          <Eye className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Página <span className="font-medium">{currentPage}</span> de{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pendentes</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {payments.filter(p => p.status === 'PENDING').length}
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
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pagos</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {payments.filter(p => p.status === 'PAID').length}
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
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Vencidos</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {payments.filter(p => p.status === 'OVERDUE').length}
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
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Pago</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(
                        payments
                          .filter(p => p.status === 'PAID')
                          .reduce((sum, p) => sum + parseFloat(p.amount), 0)
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments; 