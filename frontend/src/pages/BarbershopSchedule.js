import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Save, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import BarbershopLayout from '../components/BarbershopLayout';
import api from '../services/api';
import toast from 'react-hot-toast';

const BarbershopSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingHours, setWorkingHours] = useState({});

  // Dias da semana
  const daysOfWeek = [
    { key: 'monday', label: 'Segunda-feira', short: 'SEG' },
    { key: 'tuesday', label: 'Terça-feira', short: 'TER' },
    { key: 'wednesday', label: 'Quarta-feira', short: 'QUA' },
    { key: 'thursday', label: 'Quinta-feira', short: 'QUI' },
    { key: 'friday', label: 'Sexta-feira', short: 'SEX' },
    { key: 'saturday', label: 'Sábado', short: 'SAB' },
    { key: 'sunday', label: 'Domingo', short: 'DOM' }
  ];

  // Horários padrão
  const defaultSchedule = {
    monday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
    tuesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
    wednesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
    thursday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
    friday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
    saturday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
    sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await api.get('/barbershop/profile');
      let schedule = response.data.workingHours || {};
      
      // Garantir que todos os dias tenham estrutura completa
      const completeSchedule = {};
      daysOfWeek.forEach(day => {
        completeSchedule[day.key] = {
          isOpen: schedule[day.key]?.isOpen ?? defaultSchedule[day.key].isOpen,
          openTime: schedule[day.key]?.openTime || defaultSchedule[day.key].openTime,
          closeTime: schedule[day.key]?.closeTime || defaultSchedule[day.key].closeTime
        };
      });
      setWorkingHours(completeSchedule);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      
      // Se for erro de autenticação, não mostrar erro genérico
      if (error.response?.status === 401) {
        console.log('Usuário não autenticado. Redirecionando...');
        // Não fazer nada aqui, deixar o ProtectedRoute tratar
        return;
      }
      
      toast.error('Erro ao carregar horários');
      setWorkingHours(defaultSchedule);
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (dayKey) => {
    setWorkingHours(prev => {
      const currentDay = prev[dayKey] || {};
      const isCurrentlyOpen = currentDay.isOpen;
      
      return {
        ...prev,
        [dayKey]: {
          ...currentDay,
          isOpen: !isCurrentlyOpen,
          // Se estiver abrindo o dia e não tiver horários, definir padrão
          openTime: currentDay.openTime || '08:00',
          closeTime: currentDay.closeTime || '18:00'
        }
      };
    });
  };

  const handleTimeChange = (dayKey, timeType, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        isOpen: prev[dayKey]?.isOpen ?? true,
        openTime: prev[dayKey]?.openTime || '08:00',
        closeTime: prev[dayKey]?.closeTime || '18:00',
        [timeType]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validar horários
      const validation = validateSchedule();
      if (!validation.isValid) {
        toast.error(validation.message);
        return;
      }

      await api.put('/barbershop/profile', {
        workingHours: workingHours
      });

      toast.success('Horários salvos com sucesso!');
      
      // Recarregar horários após salvar para garantir sincronização
      setTimeout(() => {
        fetchSchedule();
      }, 1000);
    } catch (error) {
      console.error('Erro ao salvar horários:', error);
      toast.error('Erro ao salvar horários');
    } finally {
      setSaving(false);
    }
  };

  const validateSchedule = () => {
    for (const day of daysOfWeek) {
      const schedule = workingHours[day.key];
      if (schedule?.isOpen) {
        if (!schedule.openTime || !schedule.closeTime) {
          return {
            isValid: false,
            message: `Horário de abertura e fechamento são obrigatórios para ${day.label}`
          };
        }
        if (schedule.openTime >= schedule.closeTime) {
          return {
            isValid: false,
            message: `Horário de fechamento deve ser após o de abertura em ${day.label}`
          };
        }
      }
    }
    return { isValid: true };
  };

  const resetToDefault = () => {
    setWorkingHours(defaultSchedule);
    toast.success('Horários redefinidos para o padrão');
  };

  const copyToAll = (dayKey) => {
    const sourceSchedule = workingHours[dayKey];
    const newSchedule = {};
    
    daysOfWeek.forEach(day => {
      newSchedule[day.key] = { ...sourceSchedule };
    });
    
    setWorkingHours(newSchedule);
    toast.success('Horário copiado para todos os dias');
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Horários de Funcionamento</h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure os horários de funcionamento da sua barbearia
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={resetToDefault}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Padrão
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        {/* Horários */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Configurar Horários</h3>
            <p className="mt-1 text-sm text-gray-500">
              Defina os horários para cada dia da semana
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {daysOfWeek.map((day) => {
                const daySchedule = workingHours[day.key] || { isOpen: false, openTime: '08:00', closeTime: '18:00' };
                
                return (
                  <div key={day.key} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    {/* Dia da semana */}
                    <div className="w-24 flex-shrink-0">
                      <div className="text-sm font-medium text-gray-900">{day.short}</div>
                      <div className="text-xs text-gray-500">{day.label}</div>
                    </div>

                    {/* Toggle Aberto/Fechado */}
                    <div className="flex items-center">
                      <button
                        onClick={() => handleDayToggle(day.key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          daySchedule.isOpen ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            daySchedule.isOpen ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {daySchedule.isOpen ? 'Aberto' : 'Fechado'}
                      </span>
                    </div>

                    {/* Horários */}
                    {daySchedule.isOpen ? (
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-700">Abertura:</label>
                          <input
                            type="time"
                            value={daySchedule.openTime || '08:00'}
                            onChange={(e) => handleTimeChange(day.key, 'openTime', e.target.value)}
                            className="block w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-700">Fechamento:</label>
                          <input
                            type="time"
                            value={daySchedule.closeTime || '18:00'}
                            onChange={(e) => handleTimeChange(day.key, 'closeTime', e.target.value)}
                            className="block w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <button
                          onClick={() => copyToAll(day.key)}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Copiar para todos
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 text-sm text-gray-500">
                        Fechado neste dia
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Resumo */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Resumo dos Horários
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <div className="grid grid-cols-2 gap-2">
                      {daysOfWeek.map((day) => {
                        const schedule = workingHours[day.key];
                        return (
                          <div key={day.key} className="flex justify-between">
                            <span className="font-medium">{day.short}:</span>
                            <span>
                              {schedule?.isOpen 
                                ? `${schedule.openTime} - ${schedule.closeTime}`
                                : 'Fechado'
                              }
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dicas */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Dicas importantes:
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Os horários são utilizados para controlar quando clientes podem fazer agendamentos</li>
                      <li>Use "Copiar para todos" para aplicar o mesmo horário a todos os dias</li>
                      <li>Certifique-se de que o horário de fechamento seja após o de abertura</li>
                      <li>Dias marcados como "Fechado" não aparecerão disponíveis para agendamento</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BarbershopLayout>
  );
};

export default BarbershopSchedule;
