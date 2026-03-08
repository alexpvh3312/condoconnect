import { useState, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Bell, Calendar, User, LogOut, Plus, Info, MapPin, LayoutDashboard, MessageSquare, Vote, ShieldCheck, Menu, X, FileText, Settings, Globe } from 'lucide-react';
import Reservations from './Reservations';
import Requests from './Requests';
import Votes from './Votes';
import Documents from './Documents';
import ManagerDashboard from './ManagerDashboard';
import ProfileSetup from './ProfileSetup';
import HostingGuide from './HostingGuide';
import AdminSettings from './AdminSettings';
import { useAuth } from '../contexts/AuthContext';
import { db, collection, doc, query, orderBy, onSnapshot, handleFirestoreError, OperationType } from '../firebase';

interface Notice {
  id: string;
  title: string;
  date: string;
  author: string;
  content: string;
  type: 'notice' | 'reservation';
  apartment?: string;
}

type Tab = 'inicio' | 'reservas' | 'solicitacoes' | 'votacoes' | 'documentos' | 'sindico' | 'cadastro' | 'hospedagem' | 'configuracoes';

export default function Dashboard({ tab }: { tab: Tab }) {
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [condoName, setCondoName] = useState('Residencial Verde Vida');
  const [condoConfig, setCondoConfig] = useState<any>(null);

  useEffect(() => {
    const condoDoc = doc(db, 'configuracoes', 'condominio');
    const unsubscribe = onSnapshot(condoDoc, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setCondoName(data.nome);
        setCondoConfig(data);
        document.title = `${data.nome} - Seu condomínio na palma da mão`;
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'avisos'), orderBy('data', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        title: "Aviso do Síndico",
        date: new Date(doc.data().data).toLocaleDateString('pt-BR'),
        author: doc.data().autor,
        content: doc.data().conteudo,
        type: 'notice'
      })) as Notice[];
      setNotices(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'avisos');
    });

    return unsubscribe;
  }, []);

  const handleTabChange = (newTab: Tab) => {
    navigate(newTab === 'inicio' ? '/' : `/${newTab}`);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (tab) {
      case 'reservas':
        return <Reservations />;
      case 'solicitacoes':
        return <Requests />;
      case 'votacoes':
        return <Votes />;
      case 'documentos':
        return <Documents />;
      case 'sindico':
        return <ManagerDashboard onBack={() => navigate('/')} />;
      case 'cadastro':
        return <ProfileSetup />;
      case 'hospedagem':
        return <HostingGuide />;
      case 'configuracoes':
        return <AdminSettings />;
      case 'inicio':
      default:
        return (
          <>
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-10">
              <div>
                <div className="flex items-center gap-2 text-condo-primary font-medium mb-1">
                  <MapPin size={16} />
                  <span className="text-xs md:text-sm uppercase tracking-wider">{condoName}</span>
                </div>
                <h2 className="text-xl md:text-3xl font-bold text-slate-900">Início</h2>
              </div>
              
              <button 
                onClick={() => handleTabChange('solicitacoes')}
                className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 py-3 md:py-2"
              >
                <Plus size={20} />
                Nova Solicitação
              </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-condo-primary"></div>
                  </div>
                ) : notices.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
                    <p className="text-slate-500">Nenhum aviso no momento.</p>
                  </div>
                ) : (
                  notices.map((notice, index) => (
                    <motion.div
                      key={notice.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-5 md:p-6 rounded-2xl border ${
                        notice.type === 'reservation' 
                          ? 'bg-condo-accent/20 border-condo-primary/20' 
                          : 'bg-white border-slate-100 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {notice.type === 'reservation' ? (
                              <span className="px-2 py-0.5 bg-condo-primary text-white text-[10px] font-bold uppercase tracking-wider rounded">Reserva</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded">Aviso</span>
                            )}
                            <span className="text-xs text-slate-400 font-medium">{notice.date}</span>
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-slate-900">{notice.title}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                          {notice.type === 'reservation' ? <Calendar size={20} /> : <Info size={20} />}
                        </div>
                      </div>
                      
                      <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-4">
                        {notice.content}
                      </p>
                      
                      {notice.title.includes("Eleições") && (
                        <button 
                          onClick={() => handleTabChange('votacoes')}
                          className="mb-4 text-sm font-bold text-condo-primary hover:underline flex items-center gap-1"
                        >
                          Acessar Votações
                          <Plus size={14} className="rotate-45" />
                        </button>
                      )}
                      
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-condo-primary/10 flex items-center justify-center text-condo-primary">
                            <User size={12} />
                          </div>
                          <span className="text-xs md:text-sm font-medium text-slate-700">{notice.author}</span>
                        </div>
                        {notice.apartment && (
                          <span className="text-[10px] md:text-xs font-semibold text-condo-primary bg-condo-primary/5 px-2 py-1 rounded-md">
                            {notice.apartment}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-condo-primary" />
                    Próximos Eventos
                  </h4>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Mar</span>
                        <span className="text-lg font-bold text-condo-primary leading-none">20</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Início das Eleições</p>
                        <p className="text-xs text-slate-500">Assembleia Virtual</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Abr</span>
                        <span className="text-lg font-bold text-condo-primary leading-none">05</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Manutenção Elevadores</p>
                        <p className="text-xs text-slate-500">Torre A e B</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-condo-secondary p-6 rounded-2xl text-white">
                  <h4 className="font-bold mb-2">Precisa de ajuda?</h4>
                  <p className="text-white/70 text-sm mb-4">
                    Entre em contato com a administração diretamente pelo app.
                  </p>
                  <div id="info-admin" className="space-y-2 mb-4">
                    <p className="text-xs flex items-center gap-2">
                      <User size={12} className="text-condo-primary" />
                      <span className="font-medium">Síndico:</span> <span id="admin-nome">{condoConfig?.administrador || 'João Silva'}</span>
                    </p>
                    <p className="text-xs flex items-center gap-2">
                      <MessageSquare size={12} className="text-condo-primary" />
                      <span className="font-medium">E-mail:</span> <span id="suporte-email">{condoConfig?.emailSuporte || 'suporte@condominio.com'}</span>
                    </p>
                  </div>
                  <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-colors">
                    Falar com Síndico
                  </button>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-condo-primary rounded-lg flex items-center justify-center text-white overflow-hidden">
                {condoConfig?.logoURL ? (
                  <img id="logo-condominio" src={condoConfig.logoURL} alt="Logo do Condomínio" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Bell size={18} />
                )}
              </div>
              <span id="nome-condominio-header" className="font-display font-bold text-lg md:text-xl text-condo-secondary">{condoName}</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              <NavButton active={tab === 'inicio'} onClick={() => handleTabChange('inicio')} icon={<LayoutDashboard size={18} />} label="Início" />
              <NavButton active={tab === 'reservas'} onClick={() => handleTabChange('reservas')} icon={<Calendar size={18} />} label="Reservas" />
              <NavButton active={tab === 'solicitacoes'} onClick={() => handleTabChange('solicitacoes')} icon={<MessageSquare size={18} />} label="Solicitações" />
              <NavButton active={tab === 'votacoes'} onClick={() => handleTabChange('votacoes')} icon={<Vote size={18} />} label="Votações" />
              {isAdmin && <NavButton active={tab === 'sindico'} onClick={() => handleTabChange('sindico')} icon={<ShieldCheck size={18} />} label="Painel do Síndico" />}
              {isAdmin && <NavButton active={tab === 'configuracoes'} onClick={() => handleTabChange('configuracoes')} icon={<Settings size={18} />} label="Configurações" />}
              <NavButton active={tab === 'documentos'} onClick={() => handleTabChange('documentos')} icon={<FileText size={18} />} label="Documentos" />
              {isAdmin && <NavButton active={tab === 'hospedagem'} onClick={() => handleTabChange('hospedagem')} icon={<Globe size={18} />} label="Hospedagem" />}
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              <button 
                onClick={() => handleTabChange('cadastro')}
                className={`p-2 transition-colors ${tab === 'cadastro' ? 'text-condo-primary' : 'text-slate-500 hover:text-condo-primary'}`}
              >
                <User size={20} />
              </button>
              <button 
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-500 transition-colors"
              >
                <LogOut size={20} />
              </button>
              {/* Hamburger Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                <MobileNavButton active={tab === 'inicio'} onClick={() => handleTabChange('inicio')} icon={<LayoutDashboard size={20} />} label="Início" />
                <MobileNavButton active={tab === 'reservas'} onClick={() => handleTabChange('reservas')} icon={<Calendar size={20} />} label="Reservas" />
                <MobileNavButton active={tab === 'solicitacoes'} onClick={() => handleTabChange('solicitacoes')} icon={<MessageSquare size={20} />} label="Solicitações" />
                <MobileNavButton active={tab === 'votacoes'} onClick={() => handleTabChange('votacoes')} icon={<Vote size={20} />} label="Votações" />
                {isAdmin && <MobileNavButton active={tab === 'sindico'} onClick={() => handleTabChange('sindico')} icon={<ShieldCheck size={20} />} label="Painel do Síndico" />}
                {isAdmin && <MobileNavButton active={tab === 'configuracoes'} onClick={() => handleTabChange('configuracoes')} icon={<Settings size={20} />} label="Configurações" />}
                <MobileNavButton active={tab === 'documentos'} onClick={() => handleTabChange('documentos')} icon={<FileText size={20} />} label="Documentos" />
                <MobileNavButton active={tab === 'cadastro'} onClick={() => handleTabChange('cadastro')} icon={<Settings size={20} />} label="Meu Cadastro" />
                {isAdmin && <MobileNavButton active={tab === 'hospedagem'} onClick={() => handleTabChange('hospedagem')} icon={<Globe size={20} />} label="Hospedagem" />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        {renderContent()}
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium text-sm
        ${active ? 'bg-condo-primary/10 text-condo-primary' : 'text-slate-500 hover:bg-slate-50'}
      `}
    >
      {icon}
      <span>{label}</span>
      {active && <motion.div layoutId="active-pill" className="absolute bottom-0 left-0 right-0 h-0.5 bg-condo-primary" />}
    </button>
  );
}

function MobileNavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center gap-4 p-4 rounded-xl transition-all font-bold text-base
        ${active ? 'bg-condo-primary text-white shadow-lg shadow-condo-primary/20' : 'text-slate-600 hover:bg-slate-50'}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
