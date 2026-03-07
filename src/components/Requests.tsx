import { useState, FormEvent, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lightbulb, Droplets, Shield, HelpCircle, MapPin, AlignLeft, Send, CheckCircle2, Clock, History } from 'lucide-react';
import { db, collection, addDoc, query, where, orderBy, onSnapshot, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface RequestItem {
  id: string;
  titulo: string;
  status: 'Pendente' | 'Em Análise' | 'Concluído';
  data: string;
  descricao: string;
  unidade: string;
}

const CATEGORIES = [
  { id: 'luz', label: 'Luz Queimada', icon: <Lightbulb size={24} />, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'vazamento', label: 'Vazamento', icon: <Droplets size={24} />, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'portaria', label: 'Portaria', icon: <Shield size={24} />, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'outro', label: 'Outro Problema', icon: <HelpCircle size={24} />, color: 'text-slate-500', bg: 'bg-slate-50' },
];

export default function Requests() {
  const { user, profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [history, setHistory] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'solicitacoes'),
      where('moradorId', '==', user.uid),
      orderBy('data', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RequestItem[];
      setHistory(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'solicitacoes');
    });

    return unsubscribe;
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    if (selectedCategory && location && description) {
      try {
        const categoryLabel = CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Outro';
        await addDoc(collection(db, 'solicitacoes'), {
          titulo: `${categoryLabel} - ${location}`,
          descricao: description,
          status: 'Pendente',
          data: new Date().toISOString(),
          moradorId: user.uid,
          moradorNome: profile.nome,
          unidade: profile.unidade || 'Não informada'
        });

        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setSelectedCategory(null);
          setLocation('');
          setDescription('');
        }, 3000);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'solicitacoes');
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-3xl font-bold text-slate-900">Solicitações e Ocorrências</h2>
        <p className="text-sm md:text-base text-slate-500">Relate problemas ou faça solicitações diretamente para a administração.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Categories */}
          <section>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">
              Selecione o tipo de ocorrência
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    p-4 md:p-6 rounded-2xl md:rounded-3xl border transition-all flex flex-col items-center text-center gap-2 md:gap-3
                    ${selectedCategory === cat.id 
                      ? 'bg-condo-primary border-condo-primary text-white shadow-lg shadow-condo-primary/30 scale-105' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-condo-primary/30 hover:bg-slate-50 shadow-sm'}
                  `}
                >
                  <div className={`
                    w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center
                    ${selectedCategory === cat.id ? 'bg-white/20 text-white' : `${cat.bg} ${cat.color}`}
                  `}>
                    {cat.icon}
                  </div>
                  <span className="text-[10px] md:text-xs font-bold leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Form */}
          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl relative overflow-hidden">
            {isSubmitted && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Solicitação Enviada!</h4>
                <p className="text-slate-500 text-sm">Recebemos seu relato e a equipe técnica será notificada em breve.</p>
              </motion.div>
            )}

            <h3 className="text-xl font-bold text-slate-900 mb-6">Nova Solicitação</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  <MapPin size={14} /> Local do Problema
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Corredor 2º andar Bloco B, Apto 305" 
                  className="input-field"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  <AlignLeft size={14} /> Descrição Detalhada
                </label>
                <textarea 
                  placeholder="Explique o problema ou solicitação com detalhes..." 
                  className="input-field min-h-[120px] resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={!selectedCategory}
                  className={`btn-primary w-full flex items-center justify-center gap-2 ${!selectedCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Send size={18} />
                  Enviar Solicitação
                </button>
                {!selectedCategory && (
                  <p className="text-center text-[10px] text-red-400 mt-2 font-bold uppercase tracking-widest">Selecione um tipo acima</p>
                )}
              </div>
            </form>
          </section>
        </div>

        {/* History Sidebar */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <History size={20} className="text-condo-primary" />
              Seu Histórico
            </h3>
            
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-condo-primary"></div>
                </div>
              ) : history.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-4">Nenhuma solicitação encontrada.</p>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-sm font-bold text-slate-800 mb-2">{item.titulo}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {item.status === 'Concluído' ? (
                          <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] uppercase">
                            <CheckCircle2 size={12} />
                            Concluído
                          </div>
                        ) : item.status === 'Em Análise' ? (
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-[10px] uppercase">
                            <Clock size={12} />
                            Em Análise
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-blue-500 font-bold text-[10px] uppercase">
                            <Clock size={12} />
                            Pendente
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(item.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-500 line-clamp-2">{item.descricao}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <div className="bg-condo-accent/30 p-6 rounded-2xl border border-condo-primary/10">
            <h4 className="font-bold text-condo-secondary text-sm mb-2">Prazos de Atendimento</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ocorrências críticas são atendidas em até 4h. Outras solicitações têm prazo médio de 48h úteis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
