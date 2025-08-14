import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone, CheckCircle, ArrowLeft, Download, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import toast from 'react-hot-toast';

const AppointmentConfirmation = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const appointmentData = location.state?.appointment;
  
  const [barbershop, setBarbershop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBarbershopData = async () => {
      try {
        const response = await api.get(`/barbershop/${slug}`);
        setBarbershop(response.data);
      } catch (error) {
        console.error('Erro ao carregar dados da barbearia:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadBarbershopData();
    }
  }, [slug]);

  const handleBackToBooking = () => {
    navigate(`/b/${slug}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Agendamento - ${barbershop?.name}`,
          text: `Meu agendamento: ${appointmentData?.service?.name} em ${format(new Date(appointmentData?.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  const handleDownload = () => {
    // Criar um PDF simples ou imagem para download
    const content = `
      AGENDAMENTO CONFIRMADO
      
      Barbearia: ${barbershop?.name}
      Serviço: ${appointmentData?.service?.name}
      Data: ${format(new Date(appointmentData?.date), "dd/MM/yyyy", { locale: ptBR })}
      Horário: ${format(new Date(appointmentData?.date), "HH:mm", { locale: ptBR })}
      Cliente: ${appointmentData?.client?.name}
      Telefone: ${appointmentData?.client?.phone}
      Valor: R$ ${parseFloat(appointmentData?.service?.price).toFixed(2)}
      
      Endereço: ${barbershop?.address}
      Telefone: ${barbershop?.phone}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agendamento-${format(new Date(appointmentData?.date), "dd-MM-yyyy", { locale: ptBR })}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Comprovante baixado com sucesso!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!appointmentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <CheckCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dados não encontrados</h1>
          <p className="text-gray-600 mb-4">Não foi possível encontrar os dados do agendamento.</p>
          <button
            onClick={handleBackToBooking}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao Agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToBooking}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Compartilhar</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Baixar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Card de Confirmação */}
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</h1>
            <p className="text-gray-600">Seu horário foi reservado com sucesso</p>
          </div>

          {/* Detalhes do Agendamento */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalhes do Agendamento</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data e Horário</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(appointmentData.date), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Serviço</p>
                  <p className="font-medium text-gray-900">{appointmentData.service?.name}</p>
                  <p className="text-sm text-gray-600">{appointmentData.service?.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-green-600">R$</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valor</p>
                  <p className="font-semibold text-lg text-gray-900">
                    R$ {parseFloat(appointmentData.service?.price).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Cliente */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Seus Dados</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-medium text-gray-900">{appointmentData.client?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <p className="font-medium text-gray-900">{appointmentData.client?.phone}</p>
              </div>
              {appointmentData.client?.email && (
                <div>
                  <p className="text-sm text-gray-500">E-mail</p>
                  <p className="font-medium text-gray-900">{appointmentData.client?.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Informações da Barbearia */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações da Barbearia</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-600">{barbershop?.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{barbershop?.name}</p>
                  <p className="text-sm text-gray-600">{barbershop?.description}</p>
                </div>
              </div>

              {barbershop?.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{barbershop.address}</span>
                </div>
              )}

              {barbershop?.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <a 
                    href={`https://wa.me/55${barbershop.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    {barbershop.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Informações Importantes */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Informações Importantes</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Chegue com 10 minutos de antecedência</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Em caso de cancelamento, avise com antecedência</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Você receberá uma confirmação por WhatsApp</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Guarde este comprovante para consulta</span>
              </li>
            </ul>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={handleBackToBooking}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Fazer Novo Agendamento
            </button>
            <button
              onClick={() => navigate(`/consulta/${appointmentData.client?.phone}`)}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Consultar Meus Agendamentos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation; 