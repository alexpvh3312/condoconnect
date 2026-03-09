import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Home, Shield, Save, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, updateDoc, handleFirestoreError, OperationType } from '../firebase';

export default function ProfileSetup() {
  const { user, profile } = useAuth();
  const [nome, setNome] = useState('');
  const [unidade, setUnidade] = useState('');
  const [cargo, setCargo] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setNome(profile.nome || '');
      setUnidade(profile.unidade || '');
      setCargo(profile.cargo || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        nome,
        unidade,
        cargo,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      setError('Erro ao salvar as alterações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Meu Cadastro</h2>
        <p className="text-slate-500">Mantenha suas informações atualizadas para facilitar a comunicação no condomínio.</p>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="bg-condo-primary p-8 text-white flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <User size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold">{profile?.nome || 'Morador'}</h3>
            <p className="text-white/70 text-sm">{profile?.cargo || profile?.email}</p>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              <Shield size={12} />
              {profile?.role === 'sindico' ? 'Administrador / Síndico' : 'Morador'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                <User size={14} /> Nome Completo
              </label>
              <input 
                type="text" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo" 
                className="input-field"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                <Home size={14} /> Unidade / Apartamento
              </label>
              <input 
                type="text" 
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                placeholder="Ex: Bloco A, Apto 101" 
                className="input-field"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1 italic">Use o formato: Bloco [X], Apto [Y]</p>
            </div>
          </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                <Shield size={14} /> Cargo / Função
              </label>
              <input 
                type="text" 
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ex: Desenvolvedor / Administrador" 
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                <Mail size={14} /> E-mail (Somente Leitura)
              </label>
            <input 
              type="email" 
              value={profile?.email || ''} 
              disabled 
              className="input-field bg-slate-50 text-slate-400 cursor-not-allowed"
            />
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save size={18} />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100"
              >
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">Perfil atualizado com sucesso!</span>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100"
              >
                <AlertCircle size={18} />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200">
        <h4 className="font-bold text-slate-700 text-sm mb-2 flex items-center gap-2">
          <Info size={16} className="text-condo-primary" />
          Privacidade e Segurança
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          Seus dados são utilizados exclusivamente para identificação dentro do condomínio. 
          O síndico e a administração têm acesso a estas informações para fins de gestão e segurança.
        </p>
      </div>
    </div>
  );
}
