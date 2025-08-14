import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Settings,
  Save,
  DollarSign,
  Mail,
  Building2,
  Shield,
  Bell,
  Globe
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState({});

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/config');
      const configData = response.data;
      setConfigs(configData);

      // Set form values
      setValue('appName', configData.appName || 'Barbearia SaaS');
      setValue('monthlyFee', configData.monthlyFee || '99.90');
      setValue('supportEmail', configData.supportEmail || 'suporte@barbeariasaas.com');
      setValue('appUrl', configData.appUrl || 'http://localhost:3000');
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      await api.put('/admin/config', data);
      toast.success('Configurações salvas com sucesso!');
      fetchConfigs(); // Refresh data
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie as configurações gerais da plataforma
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* General Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-primary-600" />
                Configurações Gerais
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Configurações básicas da aplicação
              </p>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* App Name */}
              <div>
                <label htmlFor="appName" className="block text-sm font-medium text-gray-700">
                  Nome da Aplicação
                </label>
                <input
                  type="text"
                  id="appName"
                  {...register('appName', {
                    required: 'Nome da aplicação é obrigatório'
                  })}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.appName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Barbearia SaaS"
                />
                {errors.appName && (
                  <p className="mt-1 text-sm text-red-600">{errors.appName.message}</p>
                )}
              </div>

              {/* App URL */}
              <div>
                <label htmlFor="appUrl" className="block text-sm font-medium text-gray-700">
                  URL da Aplicação
                </label>
                <input
                  type="url"
                  id="appUrl"
                  {...register('appUrl', {
                    required: 'URL da aplicação é obrigatória',
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'URL deve começar com http:// ou https://'
                    }
                  })}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.appUrl ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://app.barbeariasaas.com"
                />
                {errors.appUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.appUrl.message}</p>
                )}
              </div>

              {/* Support Email */}
              <div>
                <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700">
                  E-mail de Suporte
                </label>
                <input
                  type="email"
                  id="supportEmail"
                  {...register('supportEmail', {
                    required: 'E-mail de suporte é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'E-mail inválido'
                    }
                  })}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.supportEmail ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="suporte@barbeariasaas.com"
                />
                {errors.supportEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.supportEmail.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Financial Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Configurações Financeiras
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Configurações de preços e cobranças
              </p>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Monthly Fee */}
              <div>
                <label htmlFor="monthlyFee" className="block text-sm font-medium text-gray-700">
                  Taxa Mensal Padrão (R$)
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">R$</span>
                  </div>
                  <input
                    type="number"
                    id="monthlyFee"
                    step="0.01"
                    min="0"
                    {...register('monthlyFee', {
                      required: 'Taxa mensal é obrigatória',
                      min: {
                        value: 0,
                        message: 'Taxa deve ser maior que zero'
                      },
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: 'Formato inválido (ex: 99.90)'
                      }
                    })}
                    className={`block w-full pl-12 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      errors.monthlyFee ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="99.90"
                  />
                </div>
                {errors.monthlyFee && (
                  <p className="mt-1 text-sm text-red-600">{errors.monthlyFee.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Esta será a taxa padrão para novas barbearias
                </p>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-red-600" />
                Configurações de Segurança
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Configurações de segurança e privacidade
              </p>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Autenticação de Dois Fatores</h4>
                  <p className="text-sm text-gray-500">
                    Exigir 2FA para administradores
                  </p>
                </div>
                <button
                  type="button"
                  className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-gray-200"
                  role="switch"
                  aria-checked="false"
                >
                  <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Logs de Auditoria</h4>
                  <p className="text-sm text-gray-500">
                    Manter logs de todas as ações administrativas
                  </p>
                </div>
                <button
                  type="button"
                  className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-primary-600"
                  role="switch"
                  aria-checked="true"
                >
                  <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-yellow-600" />
                Configurações de Notificações
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Configurações de e-mails e notificações automáticas
              </p>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">E-mails de Cobrança</h4>
                  <p className="text-sm text-gray-500">
                    Enviar lembretes de pagamento automaticamente
                  </p>
                </div>
                <button
                  type="button"
                  className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-primary-600"
                  role="switch"
                  aria-checked="true"
                >
                  <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Notificações de Bloqueio</h4>
                  <p className="text-sm text-gray-500">
                    Notificar quando uma barbearia for bloqueada
                  </p>
                </div>
                <button
                  type="button"
                  className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-primary-600"
                  role="switch"
                  aria-checked="true"
                >
                  <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Relatórios Semanais</h4>
                  <p className="text-sm text-gray-500">
                    Enviar relatórios semanais por e-mail
                  </p>
                </div>
                <button
                  type="button"
                  className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-gray-200"
                  role="switch"
                  aria-checked="false"
                >
                  <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                </button>
              </div>
            </div>
          </div>

          {/* Current Configuration Display */}
          <div className="bg-gray-50 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-gray-600" />
                Configuração Atual
              </h3>
            </div>
            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nome da Aplicação</dt>
                  <dd className="mt-1 text-sm text-gray-900">{configs.appName || 'Não configurado'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Taxa Mensal Padrão</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {configs.monthlyFee ? `R$ ${configs.monthlyFee}` : 'Não configurado'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">E-mail de Suporte</dt>
                  <dd className="mt-1 text-sm text-gray-900">{configs.supportEmail || 'Não configurado'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">URL da Aplicação</dt>
                  <dd className="mt-1 text-sm text-gray-900">{configs.appUrl || 'Não configurado'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings; 