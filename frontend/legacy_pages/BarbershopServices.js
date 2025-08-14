import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Scissors,
  Clock,
  DollarSign
} from 'lucide-react';
import BarbershopLayout from '../components/BarbershopLayout';
import api from '../services/api';
import toast from 'react-hot-toast';

const BarbershopServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/barbershop/services');
      setServices(response.data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingService) {
        await api.put(`/barbershop/services/${editingService.id}`, formData);
        toast.success('Serviço atualizado com sucesso');
      } else {
        await api.post('/barbershop/services', formData);
        toast.success('Serviço criado com sucesso');
      }
      
      setShowModal(false);
      setEditingService(null);
      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      toast.error('Erro ao salvar serviço');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) {
      return;
    }

    try {
      await api.delete(`/barbershop/services/${serviceId}`);
      toast.success('Serviço excluído com sucesso');
      fetchServices();
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      toast.error('Erro ao excluir serviço');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: ''
    });
  };

  const openModal = () => {
    setEditingService(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    resetForm();
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie os serviços oferecidos pela sua barbearia
            </p>
          </div>
          <button
            onClick={openModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
          </button>
        </div>

        {/* Lista de serviços */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {services.length === 0 ? (
              <div className="text-center py-12">
                <Scissors className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum serviço</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece criando seu primeiro serviço.
                </p>
                <div className="mt-6">
                  <button
                    onClick={openModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Serviço
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-sm text-gray-500 mb-4">
                            {service.description}
                          </p>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="h-4 w-4 mr-2" />
                            {formatCurrency(service.price)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {service.duration} minutos
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal de criação/edição */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Serviço *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Corte masculino"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descrição opcional do serviço"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preço (R$) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0,00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duração (min) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="30"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      {editingService ? 'Atualizar' : 'Criar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </BarbershopLayout>
  );
};

export default BarbershopServices; 