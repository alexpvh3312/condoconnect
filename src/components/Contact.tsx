import { motion } from 'motion/react';
import { Mail, Phone, MessageSquare, Clock, MapPin, Send } from 'lucide-react';
import React, { useState } from 'react';

export default function Contact() {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setMessage('');
      }, 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Contato com a Administração</h2>
        <p className="text-slate-500">Estamos aqui para ajudar. Escolha o melhor canal para falar conosco.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <Phone size={24} />
          </div>
          <h3 className="font-bold text-slate-800">Telefone</h3>
          <p className="text-sm text-slate-500">(69) 3221-0000</p>
          <p className="text-[10px] text-slate-400 uppercase font-bold">Ramal Portaria: 901</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Mail size={24} />
          </div>
          <h3 className="font-bold text-slate-800">E-mail</h3>
          <p className="text-sm text-slate-500">adm@condoconnect.com</p>
          <p className="text-[10px] text-slate-400 uppercase font-bold">Resposta em até 24h</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <Clock size={24} />
          </div>
          <h3 className="font-bold text-slate-800">Horário</h3>
          <p className="text-sm text-slate-500">Segunda a Sexta</p>
          <p className="text-[10px] text-slate-400 uppercase font-bold">08:00 às 18:00</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl relative overflow-hidden">
          {sent && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <Send size={32} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Mensagem Enviada!</h4>
              <p className="text-slate-500 text-sm">O síndico responderá sua mensagem em breve.</p>
            </motion.div>
          )}

          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MessageSquare size={20} className="text-emerald-600" />
            Mensagem Direta
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Sua Mensagem</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Como podemos ajudar hoje?"
                className="input-field min-h-[150px] resize-none"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              <Send size={18} />
              Enviar para o Síndico
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-emerald-400" />
              Localização
            </h3>
            <div className="space-y-4">
              <p className="text-slate-400 text-sm leading-relaxed">
                Residencial Verde Vida<br />
                Av. das Palmeiras, 1234<br />
                Bairro Jardim Botânico<br />
                Porto Velho - RO
              </p>
              <div className="aspect-video bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center text-slate-500 text-xs italic">
                Mapa do Condomínio
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
            <h4 className="font-bold text-emerald-900 text-sm mb-2">Plantão de Dúvidas</h4>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Todas as quartas-feiras, das 19h às 20h, o síndico realiza um plantão presencial na sala da administração para tirar dúvidas dos moradores.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
