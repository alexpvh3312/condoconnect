import { motion } from 'motion/react';
import { Globe, Server, Database, CheckCircle2, AlertCircle, Info, ExternalLink, ShieldCheck } from 'lucide-react';

export default function HostingGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Guia de Hospedagem e Configuração</h2>
        <p className="text-slate-500 italic">CondoConnect v1.0 - Desenvolvido por Apsilva Assessoria</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Step 1: Build */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Server size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">1. Preparação dos Arquivos</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Para hospedar o sistema, você deve primeiro gerar a versão de produção.
          </p>
          <div className="bg-slate-900 p-4 rounded-xl font-mono text-xs text-emerald-400">
            npm run build
          </div>
          <p className="text-xs text-slate-500">
            Isso criará uma pasta <code className="bg-slate-100 px-1 rounded text-condo-primary font-bold">dist/</code> com todos os arquivos otimizados.
          </p>
        </div>

        {/* Step 2: Upload */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <Globe size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">2. Upload para o Host</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Faça o upload do conteúdo da pasta <code className="font-bold">dist/</code> para o seu servidor.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 size={14} className="text-emerald-500" />
              GitHub Pages / Netlify (Grátis)
            </li>
            <li className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 size={14} className="text-emerald-500" />
              HostGator / Locaweb (Profissional)
            </li>
          </ul>
          <p className="text-xs text-slate-500 italic">
            Certifique-se de configurar o redirecionamento de rotas (SPA) no seu servidor.
          </p>
        </div>

        {/* Step 3: Database */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
            <Database size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">3. Banco de Dados (Firebase)</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            O sistema utiliza o Firebase como backend. Você já possui um banco configurado.
          </p>
          <div className="flex flex-col gap-2">
            <a 
              href="https://console.firebase.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary flex items-center justify-center gap-2 py-2 text-xs"
            >
              <ExternalLink size={14} />
              Acessar Console Firebase
            </a>
          </div>
        </div>

        {/* Step 4: Security */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">4. Segurança e Regras</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            As regras de segurança (Firestore Rules) já foram implantadas.
          </p>
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-[10px] text-indigo-700 font-medium">
              <Info size={12} className="inline mr-1" />
              Lembre-se de adicionar o domínio do seu site na lista de domínios autorizados no Firebase Auth.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-4">Pronto para o Lançamento?</h3>
          <p className="text-white/60 mb-8 max-w-xl">
            Siga os passos acima para colocar o CondoConnect no ar. Se precisar de suporte técnico adicional, entre em contato com a Apsilva Assessoria.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all">
              Baixar Documentação PDF
            </button>
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all">
              Suporte via WhatsApp
            </button>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 opacity-10">
          <Globe size={300} />
        </div>
      </div>
    </div>
  );
}
