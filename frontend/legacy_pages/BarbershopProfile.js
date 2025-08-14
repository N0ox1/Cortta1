import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Upload, 
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  MessageCircle
} from 'lucide-react';
import BarbershopLayout from '../components/BarbershopLayout';
import api from '../services/api';
import toast from 'react-hot-toast';

const BarbershopProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [barbershop, setBarbershop] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    description: '',
    whatsapp: '',
    instagram: '',
    slug: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    fetchBarbershopData();
  }, []);

  const fetchBarbershopData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/barbershop/profile');
      setBarbershop(response.data);
      if (response.data.logo) {
        setLogoPreview(response.data.logo);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da barbearia:', error);
      toast.error('Erro ao carregar dados da barbearia');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const formData = new FormData();
      Object.keys(barbershop).forEach(key => {
        if (barbershop[key] !== null && barbershop[key] !== undefined) {
          formData.append(key, barbershop[key]);
        }
      });
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      await api.put('/barbershop/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Dados atualizados com sucesso');
      fetchBarbershopData();
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      toast.error('Erro ao atualizar dados');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setBarbershop({
      ...barbershop,
      name,
      slug: generateSlug(name)
    });
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
          <h1 className="text-2xl font-bold text-gray-900">Perfil da Barbearia</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure as informações da sua barbearia
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações básicas */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Barbearia *
                  </label>
                  <input
                    type="text"
                    required
                    value={barbershop.name}
                    onChange={handleNameChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome da sua barbearia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={barbershop.email}
                    onChange={(e) => setBarbershop({ ...barbershop, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="contato@barbearia.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={barbershop.phone || ''}
                    onChange={(e) => setBarbershop({ ...barbershop, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug da URL *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      localhost:3000/
                    </span>
                    <input
                      type="text"
                      required
                      value={barbershop.slug}
                      onChange={(e) => setBarbershop({ ...barbershop, slug: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="minha-barbearia"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    URL única da sua barbearia para agendamentos online
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={barbershop.description || ''}
                  onChange={(e) => setBarbershop({ ...barbershop, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva sua barbearia..."
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Endereço
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={barbershop.address || ''}
                    onChange={(e) => setBarbershop({ ...barbershop, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Rua, número, bairro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={barbershop.city || ''}
                    onChange={(e) => setBarbershop({ ...barbershop, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="São Paulo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={barbershop.state || ''}
                    onChange={(e) => setBarbershop({ ...barbershop, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={barbershop.zipCode || ''}
                    onChange={(e) => setBarbershop({ ...barbershop, zipCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="01234-567"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Redes sociais */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Redes Sociais
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="url"
                    value={barbershop.whatsapp || ''}
                    onChange={(e) => setBarbershop({ ...barbershop, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://wa.me/5511999999999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={barbershop.instagram || ''}
                    onChange={(e) => setBarbershop({ ...barbershop, instagram: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://instagram.com/minhabarbearia"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Logo da Barbearia
              </h3>
              
              <div className="flex items-center space-x-6">
                {logoPreview && (
                  <div className="flex-shrink-0">
                    <img
                      src={logoPreview}
                      alt="Logo da barbearia"
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload da Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Formatos aceitos: JPG, PNG. Tamanho máximo: 2MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botão de salvar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </BarbershopLayout>
  );
};

export default BarbershopProfile; 