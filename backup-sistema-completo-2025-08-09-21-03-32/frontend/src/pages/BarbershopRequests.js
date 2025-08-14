import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, User, Mail, Phone, Clock, Shield, ShieldOff, Trash2, Users, UserCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import BarbershopLayout from '../components/BarbershopLayout';
import { useNotifications } from '../contexts/NotificationContext';
import api from '../services/api';

const BarbershopRequests = () => {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' ou 'users'
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { clearNotifications } = useNotifications();

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/barbershop/join-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
      toast.error('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/barbershop/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'requests') {
      loadRequests();
      clearNotifications();
    } else {
      loadUsers();
    }
  }, [activeTab, loadRequests, loadUsers]);

  const handleApprove = async (requestId) => {
    try {
      setProcessingId(requestId);
      await api.post(`/barbershop/join-requests/${requestId}/approve`);
      toast.success('Solicitação aprovada com sucesso!');
      loadRequests();
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
      toast.error('Erro ao aprovar solicitação');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setProcessingId(requestId);
      await api.post(`/barbershop/join-requests/${requestId}/reject`);
      toast.success('Solicitação rejeitada com sucesso!');
      loadRequests();
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      toast.error('Erro ao rejeitar solicitação');
    } finally {
      setProcessingId(null);
    }
  };

  const handleBlockUser = (user) => {
    setSelectedUser(user);
    setShowBlockModal(true);
  };

  const confirmBlockUser = async () => {
    try {
      setProcessingId(selectedUser.id);
      await api.post(`/barbershop/users/${selectedUser.id}/block`);
      toast.success('Usuário bloqueado com sucesso!');
      loadUsers();
      setShowBlockModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Erro ao bloquear usuário:', error);
      toast.error(error.response?.data?.message || 'Erro ao bloquear usuário');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      setProcessingId(userId);
      await api.post(`/barbershop/users/${userId}/unblock`);
      toast.success('Usuário desbloqueado com sucesso!');
      loadUsers();
    } catch (error) {
      console.error('Erro ao desbloquear usuário:', error);
      toast.error('Erro ao desbloquear usuário');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      setProcessingId(selectedUser.id);
      await api.delete(`/barbershop/users/${selectedUser.id}`);
      toast.success('Usuário excluído com sucesso!');
      loadUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error(error.response?.data?.message || 'Erro ao excluir usuário');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      'APPROVED': { label: 'Aprovada', className: 'bg-green-100 text-green-800' },
      'REJECTED': { label: 'Rejeitada', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || statusConfig['PENDING'];
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getUserStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Ativo' : 'Bloqueado'}
      </span>
    );
  };

  const getUserRoleBadge = (role) => {
    const roleConfig = {
      'PROFESSIONAL': { label: 'Profissional', className: 'bg-blue-100 text-blue-800' },
      'BARBER': { label: 'Barbeiro', className: 'bg-purple-100 text-purple-800' }
    };

    const config = roleConfig[role] || roleConfig['PROFESSIONAL'];
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <BarbershopLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Acesso</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gerencie solicitações de acesso e usuários da barbearia
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <UserCheck className="h-4 w-4 mr-2" />
                Solicitações ({requests.filter(r => r.status === 'PENDING').length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Usuários ({users.length})
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'requests' ? (
          <RequestsTab 
            requests={requests}
            loading={loading}
            processingId={processingId}
            onApprove={handleApprove}
            onReject={handleReject}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
          />
        ) : (
          <UsersTab 
            users={users}
            loading={loading}
            processingId={processingId}
            onBlock={handleBlockUser}
            onUnblock={handleUnblockUser}
            onDelete={handleDeleteUser}
            formatDate={formatDate}
            getUserStatusBadge={getUserStatusBadge}
            getUserRoleBadge={getUserRoleBadge}
          />
                 )}
       </div>

       {/* Modal de Confirmação de Exclusão */}
       {showDeleteModal && selectedUser && (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
           <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
             <div className="mt-3 text-center">
               <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                 <AlertTriangle className="h-6 w-6 text-red-600" />
               </div>
               <h3 className="text-lg font-medium text-gray-900 mt-4">Confirmar Exclusão</h3>
               <div className="mt-2 px-7 py-3">
                 <p className="text-sm text-gray-500">
                   Tem certeza que deseja excluir o usuário <strong>{selectedUser.name}</strong>?
                 </p>
                 <p className="text-sm text-gray-500 mt-2">
                   Esta ação não pode ser desfeita.
                 </p>
               </div>
               <div className="flex justify-center space-x-3 mt-4">
                 <button
                   onClick={() => {
                     setShowDeleteModal(false);
                     setSelectedUser(null);
                   }}
                   className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                 >
                   Cancelar
                 </button>
                 <button
                   onClick={confirmDeleteUser}
                   disabled={processingId === selectedUser.id}
                   className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                 >
                   {processingId === selectedUser.id ? (
                     <div className="flex items-center">
                       <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                       Excluindo...
                     </div>
                   ) : (
                     'Excluir'
                   )}
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Modal de Confirmação de Bloqueio */}
       {showBlockModal && selectedUser && (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
           <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
             <div className="mt-3 text-center">
               <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                 <ShieldOff className="h-6 w-6 text-yellow-600" />
               </div>
               <h3 className="text-lg font-medium text-gray-900 mt-4">Confirmar Bloqueio</h3>
               <div className="mt-2 px-7 py-3">
                 <p className="text-sm text-gray-500">
                   Tem certeza que deseja bloquear o usuário <strong>{selectedUser.name}</strong>?
                 </p>
                 <p className="text-sm text-gray-500 mt-2">
                   O usuário não conseguirá acessar o sistema até ser desbloqueado.
                 </p>
               </div>
               <div className="flex justify-center space-x-3 mt-4">
                 <button
                   onClick={() => {
                     setShowBlockModal(false);
                     setSelectedUser(null);
                   }}
                   className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                 >
                   Cancelar
                 </button>
                 <button
                   onClick={confirmBlockUser}
                   disabled={processingId === selectedUser.id}
                   className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                 >
                   {processingId === selectedUser.id ? (
                     <div className="flex items-center">
                       <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                       Bloqueando...
                     </div>
                   ) : (
                     'Bloquear'
                   )}
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
     </BarbershopLayout>
   );
 };

// Componente para a aba de solicitações
const RequestsTab = ({ requests, loading, processingId, onApprove, onReject, formatDate, getStatusBadge }) => {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Solicitações</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aprovadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'APPROVED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Solicitações Recentes</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Carregando solicitações...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma solicitação encontrada
            </h3>
            <p className="text-gray-600">
              Não há solicitações de acesso pendentes no momento.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profissional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data da Solicitação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {request.userFirstName} {request.userLastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {request.userEmail}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {request.userPhone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onApprove(request.id)}
                            disabled={processingId === request.id}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            {processingId === request.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                            ) : (
                              <Check className="h-3 w-3 mr-1" />
                            )}
                            Aprovar
                          </button>
                          <button
                            onClick={() => onReject(request.id)}
                            disabled={processingId === request.id}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                          >
                            {processingId === request.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                            ) : (
                              <X className="h-3 w-3 mr-1" />
                            )}
                            Rejeitar
                          </button>
                        </div>
                      )}
                      {request.status !== 'PENDING' && (
                        <span className="text-gray-400">Processado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para a aba de usuários
const UsersTab = ({ users, loading, processingId, onBlock, onUnblock, onDelete, formatDate, getUserStatusBadge, getUserRoleBadge }) => {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ShieldOff className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bloqueados</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => !u.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Usuários da Barbearia</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Carregando usuários...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum usuário encontrado
            </h3>
            <p className="text-gray-600">
              Não há usuários cadastrados na barbearia.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Cadastro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getUserRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getUserStatusBadge(user.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                                                 {user.isActive ? (
                           <button
                             onClick={() => onBlock(user)}
                             disabled={processingId === user.id}
                             className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
                           >
                             {processingId === user.id ? (
                               <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                             ) : (
                               <ShieldOff className="h-3 w-3 mr-1" />
                             )}
                             Bloquear
                           </button>
                         ) : (
                           <button
                             onClick={() => onUnblock(user.id)}
                             disabled={processingId === user.id}
                             className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                           >
                             {processingId === user.id ? (
                               <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                             ) : (
                               <Shield className="h-3 w-3 mr-1" />
                             )}
                             Desbloquear
                           </button>
                         )}
                         <button
                           onClick={() => onDelete(user)}
                           disabled={processingId === user.id}
                           className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                         >
                           {processingId === user.id ? (
                             <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                           ) : (
                             <Trash2 className="h-3 w-3 mr-1" />
                           )}
                           Excluir
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarbershopRequests; 