import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Send, ArrowLeft, Scissors, Clock, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    
    // Simular envio do formulário
    setTimeout(() => {
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200">
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Header */}
      <header className="glass-effect sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Scissors className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Cortta
              </h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_20%)]"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-black text-blue-800 mb-6">
              Entre em Contato
            </h1>
            <p className="text-xl text-blue-700 mb-8 max-w-3xl mx-auto">
              Tem alguma dúvida, sugestão ou precisa de ajuda? Estamos aqui para você!
            </p>
          </div>
        </div>
      </div>

      {/* Contact Content */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Informações de Contato */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Informações de Contato
                </h2>
                <p className="text-gray-600 mb-8">
                  Escolha a forma mais conveniente para entrar em contato conosco. 
                  Nossa equipe está sempre pronta para ajudar!
                </p>
              </div>

              {/* Cards de Contato */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Telefone</h3>
                      <p className="text-gray-600 text-lg font-semibold">(11) 99999-9999</p>
                      <p className="text-gray-500 text-sm">Segunda a Sexta, 8h às 18h</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">WhatsApp</h3>
                      <p className="text-gray-600 text-lg font-semibold">(11) 99999-9999</p>
                      <p className="text-gray-500 text-sm">Resposta em até 1 hora</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Email</h3>
                      <p className="text-gray-600 text-lg font-semibold">contato@cortta.com</p>
                      <p className="text-gray-500 text-sm">Resposta em até 24 horas</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Horário de Atendimento</h3>
                      <p className="text-gray-600">Segunda a Sexta: 8h às 18h</p>
                      <p className="text-gray-600">Sábado: 9h às 14h</p>
                      <p className="text-gray-500 text-sm">Exceto feriados</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Rápido */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Perguntas Frequentes</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">Como cadastrar minha barbearia?</p>
                    <p className="text-blue-100 text-sm">Clique em "CONHEÇA GRÁTIS" na página inicial e preencha o formulário.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Quanto tempo leva a aprovação?</p>
                    <p className="text-blue-100 text-sm">O processo de verificação leva até 12 horas.</p>
                  </div>
                  <div>
                    <p className="font-semibold">A plataforma é gratuita?</p>
                    <p className="text-blue-100 text-sm">Sim! O cadastro e uso básico são totalmente gratuitos.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulário de Contato */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Envie sua Mensagem
                </h2>
                <p className="text-gray-600">
                  Preencha o formulário abaixo e entraremos em contato o mais breve possível.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assunto
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Qual o motivo do contato?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Descreva sua dúvida, sugestão ou solicitação..."
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Scissors className="h-8 w-8 text-blue-400 mr-3" />
            <span className="text-2xl font-black text-blue-400">
              Cortta
            </span>
          </div>
          <p className="text-gray-400 mb-6">
            A plataforma que conecta clientes às melhores barbearias
          </p>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-gray-500">
              &copy; 2024 Cortta. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact; 