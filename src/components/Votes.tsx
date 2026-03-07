import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Vote, CheckCircle2, XCircle, Clock, Award, Users, BarChart3 } from 'lucide-react';
import { db, collection, query, onSnapshot, updateDoc, doc, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface Votacao {
  id: string;
  titulo: string;
  descricao: string;
  opcoes: string[];
  votos: Record<string, string>;
  ativa: boolean;
  dataCriacao: string;
}

export default function Votes() {
  const { user } = useAuth();
  const [activeVotes, setActiveVotes] = useState<Votacao[]>([]);
  const [closedVotes, setClosedVotes] = useState<Votacao[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isVoted, setIsVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'votacoes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allVotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Votacao[];

      setActiveVotes(allVotes.filter(v => v.ativa));
      setClosedVotes(allVotes.filter(v => !v.ativa));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'votacoes');
    });

    return unsubscribe;
  }, []);

  const handleVote = async (votacaoId: string) => {
    const option = selectedOptions[votacaoId];
    if (option && user) {
      try {
        const docRef = doc(db, 'votacoes', votacaoId);
        await updateDoc(docRef, {
          [`votos.${user.uid}`]: option
        });
        setIsVoted(true);
        setTimeout(() => setIsVoted(false), 3000);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `votacoes/${votacaoId}`);
      }
    }
  };

  const getResults = (vote: Votacao) => {
    const total = Object.keys(vote.votos || {}).length;
    if (total === 0) return vote.opcoes.map(opt => ({ opt, percent: 0 }));
    
    const counts: Record<string, number> = {};
    Object.values(vote.votos).forEach(opt => {
      counts[opt] = (counts[opt] || 0) + 1;
    });

    return vote.opcoes.map(opt => ({
      opt,
      percent: Math.round(((counts[opt] || 0) / total) * 100)
    }));
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Votações do Condomínio</h2>
        <p className="text-slate-500">Participe das decisões importantes do nosso Residencial Verde Vida.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Active Votes */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-condo-primary"></div>
            </div>
          ) : activeVotes.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center">
              <p className="text-slate-500">Nenhuma votação ativa no momento.</p>
            </div>
          ) : (
            activeVotes.map((vote) => {
              const hasVoted = user && vote.votos && vote.votos[user.uid];
              return (
                <section key={vote.id} className="bg-white p-8 rounded-3xl border-l-4 border-condo-primary shadow-xl relative overflow-hidden">
                  {isVoted && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6"
                    >
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 size={32} />
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">Voto Confirmado!</h4>
                      <p className="text-slate-500 text-sm">Obrigado por participar da democracia do nosso condomínio.</p>
                    </motion.div>
                  )}

                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-condo-primary text-white text-[10px] font-bold uppercase tracking-wider rounded">Ativa</span>
                        <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                          <Clock size={12} />
                          Votação em andamento
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">{vote.titulo}</h3>
                      <p className="text-slate-500 text-sm mt-1">{vote.descricao}</p>
                    </div>
                    <div className="w-12 h-12 bg-condo-accent/30 rounded-2xl flex items-center justify-center text-condo-primary">
                      <Users size={24} />
                    </div>
                  </div>

                  {hasVoted ? (
                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-6">
                      <p className="text-emerald-800 font-bold flex items-center gap-2">
                        <CheckCircle2 size={20} />
                        Você já votou nesta assembleia.
                      </p>
                      <p className="text-emerald-600 text-sm mt-1">Seu voto: <span className="font-bold">{vote.votos[user!.uid]}</span></p>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-8">
                      {vote.opcoes.map((option) => (
                        <button
                          key={option}
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [vote.id]: option }))}
                          className={`
                            w-full p-5 rounded-2xl border text-left transition-all flex items-center gap-4
                            ${selectedOptions[vote.id] === option 
                              ? 'bg-condo-accent/20 border-condo-primary ring-1 ring-condo-primary' 
                              : 'bg-slate-50 border-slate-100 hover:border-condo-primary/30 hover:bg-white'}
                          `}
                        >
                          <div className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                            ${selectedOptions[vote.id] === option ? 'border-condo-primary bg-condo-primary' : 'border-slate-300'}
                          `}>
                            {selectedOptions[vote.id] === option && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{option}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {!hasVoted && (
                    <button 
                      onClick={() => handleVote(vote.id)}
                      disabled={!selectedOptions[vote.id]}
                      className={`btn-primary flex items-center justify-center gap-2 ${!selectedOptions[vote.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Vote size={20} />
                      Confirmar Voto
                    </button>
                  )}
                </section>
              );
            })
          )}

          {/* Closed Votes */}
          {closedVotes.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 size={20} className="text-condo-primary" />
                Votações Encerradas
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {closedVotes.map((vote) => {
                  const results = getResults(vote);
                  const winner = results.reduce((prev, current) => (prev.percent > current.percent) ? prev : current);
                  
                  return (
                    <div key={vote.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <h4 className="font-bold text-slate-800 mb-4 leading-tight">{vote.titulo}</h4>
                      <div className="space-y-3">
                        {results.map(res => (
                          <div key={res.opt}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-slate-600">{res.opt}</span>
                              <span className="text-xs font-bold text-slate-900">{res.percent}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${res.opt === winner.opt ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                style={{ width: `${res.percent}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Resultado Final</div>
                        <div className="text-xs font-bold text-emerald-600">{winner.opt}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <section className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-condo-accent">
              <Award size={24} />
            </div>
            <h3 className="text-xl font-bold mb-4">Por que votar?</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Sua participação é fundamental para a valorização do nosso patrimônio e para a melhoria da qualidade de vida de todos os moradores.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-xs text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-condo-primary mt-1.5" />
                Decisões transparentes
              </li>
              <li className="flex items-start gap-3 text-xs text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-condo-primary mt-1.5" />
                Gestão participativa
              </li>
              <li className="flex items-start gap-3 text-xs text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-condo-primary mt-1.5" />
                Melhorias estruturais
              </li>
            </ul>
          </section>

          <div className="bg-condo-accent/30 p-6 rounded-2xl border border-condo-primary/10">
            <h4 className="font-bold text-condo-secondary text-sm mb-2">Quórum Necessário</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Para eleições de síndico, é necessário o quórum mínimo de 50% dos moradores adimplentes para validade em primeira chamada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
