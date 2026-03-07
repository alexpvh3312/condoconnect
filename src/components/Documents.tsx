import { FileText, Phone, Download, ExternalLink, ShieldAlert, Siren, HeartPulse, UserCog } from 'lucide-react';
import { motion } from 'motion/react';
import { ReactNode, useState, useEffect } from 'react';
import { db, collection, onSnapshot, handleFirestoreError, OperationType } from '../firebase';

interface Document {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  url: string;
}

interface EmergencyContact {
  id: number;
  name: string;
  number: string;
  icon: ReactNode;
  color: string;
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 1,
    name: "Bombeiros",
    number: "193",
    icon: <Siren size={24} />,
    color: "bg-red-500"
  },
  {
    id: 2,
    name: "Polícia Militar",
    number: "190",
    icon: <ShieldAlert size={24} />,
    color: "bg-blue-600"
  },
  {
    id: 3,
    name: "Samu",
    number: "192",
    icon: <HeartPulse size={24} />,
    color: "bg-red-600"
  },
  {
    id: 4,
    name: "Zelador do Condomínio",
    number: "(69) 99999-9999",
    icon: <UserCog size={24} />,
    color: "bg-emerald-600"
  },
  {
    id: 5,
    name: "Síndico",
    number: "(69) 98888-8888",
    icon: <UserCog size={24} />,
    color: "bg-slate-700"
  }
];

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'documentos'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];
      setDocuments(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'documentos');
    });

    return unsubscribe;
  }, []);

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-10">
      <header className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Documentos e Emergências</h2>
        <p className="text-slate-500">Acesse arquivos importantes e contatos de suporte rápido.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Documents Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="text-condo-primary" size={24} />
            <h3 className="text-xl font-bold text-slate-800">Documentos do Condomínio</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-condo-primary"></div>
              </div>
            ) : documents.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
                <p className="text-slate-500">Nenhum documento disponível no momento.</p>
              </div>
            ) : (
              documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-condo-primary/30 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-condo-primary/10 group-hover:text-condo-primary transition-colors">
                      <FileText size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{doc.categoria}</span>
                      <h4 className="font-bold text-slate-800 group-hover:text-condo-primary transition-colors">{doc.titulo}</h4>
                      <p className="text-xs text-slate-500">{doc.descricao}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownload(doc.url)}
                    className="p-2 text-slate-400 hover:text-condo-primary hover:bg-slate-50 rounded-lg transition-all"
                  >
                    <Download size={20} />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Emergency Contacts Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="text-red-500" size={24} />
            <h3 className="text-xl font-bold text-slate-800">Contatos de Emergência</h3>
          </div>

          <div className="space-y-3">
            {EMERGENCY_CONTACTS.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${contact.color} text-white flex items-center justify-center shadow-lg shadow-current/20`}>
                    {contact.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{contact.name}</h4>
                    <p className="text-condo-primary font-mono font-bold">{contact.number}</p>
                  </div>
                </div>
                <button className="p-2 bg-slate-50 text-slate-400 hover:text-condo-primary hover:bg-condo-primary/10 rounded-xl transition-all">
                  <ExternalLink size={18} />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold mb-2">Segurança 24h</h4>
              <p className="text-white/60 text-xs mb-4">A portaria está disponível 24 horas por dia para qualquer ocorrência.</p>
              <button className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl text-sm flex items-center justify-center gap-2">
                <Phone size={16} />
                Ligar para Portaria
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <ShieldAlert size={120} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
