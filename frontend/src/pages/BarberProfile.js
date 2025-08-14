'use client';

import React, { useState, useEffect } from 'react';
import { User, Scissors, Clock, Save, Camera, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import BarbershopLayout from '../components/BarbershopLayout';
import api from '../services/api';

const BarberProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    specialties: [],
    bio: '',
    photo: null,
    workingHours: {
      monday: { start: '08:00', end: '18:00', active: true },
      tuesday: { start: '08:00', end: '18:00', active: true },
      wednesday: { start: '08:00', end: '18:00', active: true },
      thursday: { start: '08:00', end: '18:00', active: true },
      friday: { start: '08:00', end: '18:00', active: true },
      saturday: { start: '08:00', end: '17:00', active: true },
      sunday: { start: '08:00', end: '17:00', active: false }
    }
  });

  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
    loadServices();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/barbershop/profile');
      if (response.data.barberProfile) {
        setProfile(response.data.barberProfile);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const response = await api.get('/barbershop/services');
      setAvailableServices(response.data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setProfile(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: field === 'active' ? value : value
        }
      }
    }));
  };

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A foto deve ter menos de 5MB');
        return;
      }
      setProfile(prev => ({
        ...prev,
        photo: file
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Upload da foto se houver
      let photoUrl = null;
      if (profile.photo && profile.photo instanceof File) {
        const formData = new FormData();
        formData.append('image', profile.photo);
        formData.append('type', 'barber-photo');
        
        const uploadResponse = await api.post('/barbershop/upload-image', formData);
        photoUrl = uploadResponse.data.imageUrl;
      }

      // Salvar perfil
      const profileData = {
        ...profile,
        photo: photoUrl || profile.photo,
        services: selectedServices
      };

      await api.put('/barbershop/barber-profile', profileData);

      toast.success('Perfil salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

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
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure suas informações pessoais e horários de trabalho
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Pessoais */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados Básicos */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações Pessoais
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biografia
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Conte um pouco sobre você e sua experiência..."
                />
              </div>
            </div>

            {/* Foto */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Foto do Perfil
              </h2>
              
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  {profile.photo ? (
                    <img
                      src={profile.photo instanceof File ? URL.createObjectURL(profile.photo) : profile.photo}
                      alt="Foto do perfil"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Escolher Foto
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG até 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Serviços */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Scissors className="h-5 w-5 mr-2" />
                Meus Serviços
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableServices.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-500">R$ {service.price}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Horários de Trabalho */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Horários de Trabalho
            </h2>
            
            <div className="space-y-3">
              {daysOfWeek.map((day) => (
                <div key={day.key} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.workingHours[day.key].active}
                        onChange={(e) => handleWorkingHoursChange(day.key, 'active', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {day.label}
                      </span>
                    </label>
                  </div>
                  
                  {profile.workingHours[day.key].active && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Início</label>
                        <input
                          type="time"
                          value={profile.workingHours[day.key].start}
                          onChange={(e) => handleWorkingHoursChange(day.key, 'start', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Fim</label>
                        <input
                          type="time"
                          value={profile.workingHours[day.key].end}
                          onChange={(e) => handleWorkingHoursChange(day.key, 'end', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Perfil
              </>
            )}
          </button>
        </div>
      </div>
    </BarbershopLayout>
  );
};

export default BarberProfile; 