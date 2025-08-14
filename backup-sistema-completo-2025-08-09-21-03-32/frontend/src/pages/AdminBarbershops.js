import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Lock,
  Unlock,
  Calendar,
  Users,
  MapPin,
  Mail,
  Phone,
  Trash2
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminBarbershops = () => {
  const [barbershops, setBarbershops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBarbershops();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchBarbershops = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: statusFilter || undefined
      };

      const response = await api.get('/admin/barbershops', { params });
      setBarbershops(response.data.barbershops);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Erro ao buscar barbearias:', error);
      toast.error('Erro ao carregar barbearias');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockToggle = async (barbershopId, isBlocked) => {
    try {
      await api.patch(`/admin/barbershops/${barbershopId}/block`, {
        isBlocked: !isBlocked,
        reason: !isBlocked ? 'Pagamento pendente' : 'Pagamento regularizado'
      });

      toast.success(`Barbearia ${!isBlocked ? 'bloqueada' : 'desbloqueada'} com sucesso`);
      fetchBarbershops();
    } catch (error) {
      console.error('Erro ao alterar status da barbearia:', error);
      toast.error('Erro ao alterar status da barbearia');
    }
  };

  const handleDeleteBarbershop = async (barbershopId, barbershopName) => {
    // Confirmação de segurança
    const confirmMessage = `ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\nVocê está prestes a remover permanentemente a barbearia "${barbershopName}" e TODOS os seus dados:\n\n• Todos os usuários\n• Todos os agendamentos\n• Todos os clientes\n• Todos os serviços\n• Todos os pagamentos\n\nEsta ação não pode ser desfeita. Tem certeza que deseja continuar?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    // Segunda confirmação
    const finalConfirm = window.confirm('ÚLTIMA CONFIRMAÇÃO: Digite "DELETAR" para confirmar a remoção permanente.');
    if (finalConfirm !== true) {
      return;
    }

    try {
      const response = await api.delete(`/admin/barbershops/${barbershopId}`);
      
      toast.success(`Barbearia "${barbershopName}" removida com sucesso!`, {
        duration: 5000
      });
      
      // Mostrar detalhes do que foi removido
      if (response.data.removedData) {
        const { removedData } = response.data;
        console.log('Dados removidos:', removedData);
        
        // Opcional: mostrar toast com detalhes
        setTimeout(() => {
          toast.success(
            `Removidos: ${removedData.users} usuários, ${removedData.appointments} agendamentos, ${removedData.clients} clientes, ${removedData.services} serviços, ${removedData.payments} pagamentos`,
            { duration: 4000 }
          );
        }, 1000);
      }
      
      fetchBarbershops();
    } catch (error) {
      console.error('Erro ao remover barbearia:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erro ao remover barbearia');
      }
    }
  };

  const getStatusBadge = (barbershop) => {
    if (barbershop.isBlocked) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Bloqueada
        </span>
      );
    }
    if (!barbershop.isActive) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          Inativa
        </span>
      );
    }
    return (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        Ativa
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

  if (loading && barbershops.length === 0) {
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
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Barbearias</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie todas as barbearias cadastradas na plataforma
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
            <Building2 className="h-4 w-4 mr-2" />
            Nova Barbearia
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Buscar
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nome, e-mail ou URL..."
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

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
                <option value="active">Ativas</option>
                <option value="inactive">Inativas</option>
                <option value="blocked">Bloqueadas</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <p className="text-sm text-gray-500">
                {barbershops.length} barbearia(s) encontrada(s)
              </p>
            </div>
          </div>
        </div>

        {/* Barbershops Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barbearia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Métricas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assinatura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cadastro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {barbershops.map((barbershop) => (
                  <tr key={barbershop.id} className="hover:bg-gray-50">
                    {/* Barbearia Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {barbershop.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {barbershop.slug}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {barbershop.city}, {barbershop.state}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          {barbershop.email}
                        </div>
                        <div className="flex items-center mt-1">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {barbershop.phone}
                        </div>
                      </div>
                    </td>

                    {/* Metrics */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1 text-gray-400" />
                          {barbershop._count.users} usuários
                        </div>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          {barbershop._count.appointments} agendamentos
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {barbershop._count.clients} clientes
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(barbershop)}
                    </td>

                    {/* Subscription */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{barbershop.subscriptionPlan}</div>
                        <div className="text-gray-500">
                          {formatCurrency(barbershop.monthlyFee)}/mês
                        </div>
                        {barbershop.payments[0] && (
                          <div className="text-xs text-gray-400 mt-1">
                            Próximo: {formatDate(barbershop.payments[0].dueDate)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Registration Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(barbershop.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleBlockToggle(barbershop.id, barbershop.isBlocked)}
                          className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded ${
                            barbershop.isBlocked
                              ? 'text-green-700 bg-green-100 hover:bg-green-200'
                              : 'text-red-700 bg-red-100 hover:bg-red-200'
                          }`}
                          title={barbershop.isBlocked ? 'Desbloquear' : 'Bloquear'}
                        >
                          {barbershop.isBlocked ? (
                            <Unlock className="h-3 w-3" />
                          ) : (
                            <Lock className="h-3 w-3" />
                          )}
                        </button>
                        <button className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200">
                          <Eye className="h-3 w-3" />
                        </button>
                        <button className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200">
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteBarbershop(barbershop.id, barbershop.name)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                          title="Remover barbearia permanentemente"
                        >
                          <Trash2 className="h-3 w-3" />
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
      </div>
    </AdminLayout>
  );
};

export default AdminBarbershops; 