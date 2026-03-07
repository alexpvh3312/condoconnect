import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ClipboardList, 
  CalendarCheck, 
  Vote, 
  Megaphone, 
  CheckCircle2, 
  XCircle, 
  Send,
  ArrowLeft,
  BarChart3,
  UserPlus
} from 'lucide-react';
import { db, collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDocs, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface Request {
  id: string;
  resident: string;
  unit: string;
  type: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function ManagerDashboard({ onBack }: { onBack?: () => void }) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    confirmedReservations: 0,
    activeVotes: 0,
    registeredResidents: 0
  });
  const [notice, setNotice] = useState('');
  const [isNoticePublished, setIsNoticePublished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch pending requests
    const qRequests = query(collection(db, 'solicitacoes'), where('status', '==', 'pending'));
    const unsubscribeRequests = onSnapshot(qRequests, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        resident: doc.data().userName,
        unit: doc.data().userUnit,
        type: doc.data().categoria,
        date: new Date(doc.data().dataCriacao).toLocaleDateString('pt-BR'),
        status: doc.data().status
      })) as Request[];
      setRequests(items);
      setStats(prev => ({ ...prev, pendingRequests: items.length }));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'solicitacoes');
    });

    // Fetch other stats (simple counts for now)
    const fetchStats = async () => {
      try {
        const reservationsSnap = await getDocs(query(collection(db, 'reservas'), where('status', '==', 'confirmada')));
        const votesSnap = await getDocs(query(collection(db, 'votacoes'), where('ativa', '==', true)));
        const usersSnap = await getDocs(collection(db, 'users'));

        setStats(prev => ({
          ...prev,
          confirmedReservations: reservationsSnap.size,
          activeVotes: votesSnap.size,
          registeredResidents: usersSnap.size
        }));
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();

    return () => unsubscribeRequests();
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const docRef = doc(db, 'solicitacoes', id);
      await updateDoc(docRef, { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `solicitacoes/${id}`);
    }
  };

  const handlePublishNotice = async () => {
    if (notice.trim() && profile) {
      try {
        await addDoc(collection(db, 'avisos'), {
          conteudo: notice,
          data: new Date().toISOString(),
          autor: profile.nome
        });
        setIsNoticePublished(true);
        setTimeout(() => {
          setIsNoticePublished(false);
          setNotice('');
        }, 3000);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'avisos');
      }
    }
  };

  const statsDisplay = [
    { label: 'Solicitações Pendentes', value: stats.pendingRequests, icon: <ClipboardList className="text-emerald-600" />, color: 'bg-emerald-50' },
    { label: 'Reservas Confirmadas', value: stats.confirmedReservations, icon: <CalendarCheck className="text-blue-600" />, color: 'bg-blue-50' },
    { label: 'Votação Ativa', value: stats.activeVotes, icon: <Vote className="text-amber-600" />, color: 'bg-amber-50' },
    { label: 'Moradores Cadastrados', value: stats.registeredResidents, icon: <Users className="text-indigo-600" />, color: 'bg-indigo-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-emerald-900 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onBack ? onBack() : navigate('/')}
              className="p-2 hover:bg-emerald-800 rounded-full transition-colors"
              title="Voltar ao Mural"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold tracking-tight">CondoConnect <span className="font-light opacity-80">| Painel do Síndico</span></h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#" className="hover:text-emerald-200 transition-colors">Gerenciar Moradores</a>
            <a href="#" className="hover:text-emerald-200 transition-colors">Relatórios</a>
            <button 
              onClick={() => onBack ? onBack() : navigate('/')}
              className="bg-emerald-800 px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Voltar ao Mural
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Painel de Controle</h2>
            <p className="text-slate-500">Residencial Verde Vida - Gestão Administrativa</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <BarChart3 size={16} />
              Exportar Relatório
            </button>
            <button className="flex items-center gap-2 bg-emerald-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm">
              <UserPlus size={16} />
              Novo Morador
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {statsDisplay.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center"
            >
              <div className={`p-2 md:p-3 ${stat.color} rounded-xl mb-3 md:mb-4`}>
                {stat.icon}
              </div>
              <span className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">{stat.value}</span>
              <span className="text-[10px] md:text-sm text-slate-500 font-medium uppercase tracking-tight">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Requests Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-bottom border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList size={20} className="text-emerald-600" />
                  Solicitações Pendentes
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] md:text-xs uppercase tracking-wider">
                      <th className="px-4 md:px-6 py-3 md:py-4 font-semibold">Morador</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 font-semibold">Unidade</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 font-semibold">Tipo</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 font-semibold">Data</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 font-semibold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600 mx-auto"></div>
                        </td>
                      </tr>
                    ) : requests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                          Nenhuma solicitação pendente no momento.
                        </td>
                      </tr>
                    ) : (
                      requests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50 transition-colors text-xs md:text-sm">
                          <td className="px-4 md:px-6 py-3 md:py-4">
                            <div className="font-medium text-slate-800">{req.resident}</div>
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-slate-600">{req.unit}</td>
                          <td className="px-4 md:px-6 py-3 md:py-4">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                              {req.type}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-slate-500">{req.date}</td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                            <div className="flex justify-end gap-1 md:gap-2">
                              <button 
                                onClick={() => handleAction(req.id, 'approved')}
                                className="p-1.5 md:p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Aprovar"
                              >
                                <CheckCircle2 size={16} className="md:w-[18px] md:h-[18px]" />
                              </button>
                              <button 
                                onClick={() => handleAction(req.id, 'rejected')}
                                className="p-1.5 md:p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Rejeitar"
                              >
                                <XCircle size={16} className="md:w-[18px] md:h-[18px]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Publish Notice Form */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Megaphone size={20} className="text-emerald-600" />
                Publicar Aviso no Mural
              </h3>
              <div className="space-y-4">
                <textarea
                  value={notice}
                  onChange={(e) => setNotice(e.target.value)}
                  placeholder="Digite o aviso que deseja publicar para todos os moradores..."
                  className="w-full min-h-[150px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none text-slate-700"
                />
                <button
                  onClick={handlePublishNotice}
                  disabled={!notice.trim() || isNoticePublished}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                    isNoticePublished 
                      ? 'bg-emerald-100 text-emerald-700 cursor-default' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                  }`}
                >
                  {isNoticePublished ? (
                    <>
                      <CheckCircle2 size={20} />
                      Publicado com Sucesso!
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Publicar Aviso
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-emerald-900 p-6 rounded-2xl text-white shadow-lg space-y-4">
              <h4 className="font-bold">Ações Rápidas</h4>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-medium transition-colors text-center">
                  Gerar Boleto Coletivo
                </button>
                <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-medium transition-colors text-center">
                  Agendar Assembleia
                </button>
                <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-medium transition-colors text-center">
                  Bloquear Espaço
                </button>
                <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-medium transition-colors text-center">
                  Configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
