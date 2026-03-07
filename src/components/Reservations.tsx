import { useState, FormEvent, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, User, Home, CheckCircle2, Info } from 'lucide-react';
import { db, collection, addDoc, query, onSnapshot, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface ReservationItem {
  id: string;
  area: string;
  data: string;
  horario: string;
  moradorId: string;
}

export default function Reservations() {
  const { user, profile } = useAuth();
  const [selectedSpace, setSelectedSpace] = useState('Churrasqueira 1');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    time: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [allReservations, setAllReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = 2; // Março (0-indexed: 2)
  const currentYear = 2026;

  useEffect(() => {
    const q = query(collection(db, 'reservas'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReservationItem[];
      setAllReservations(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reservas');
    });

    return unsubscribe;
  }, []);

  const reservedDays = allReservations
    .filter(res => res.area === selectedSpace && new Date(res.data).getMonth() === currentMonth)
    .map(res => new Date(res.data).getDate());

  const handleDayClick = (day: number) => {
    if (!reservedDays.includes(day)) {
      setSelectedDay(day);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !selectedDay) return;

    try {
      const date = new Date(currentYear, currentMonth, selectedDay).toISOString();
      await addDoc(collection(db, 'reservas'), {
        area: selectedSpace,
        data: date,
        horario: formData.time,
        moradorId: user.uid,
        moradorNome: profile.nome,
        unidade: profile.unidade || 'Não informada'
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setSelectedDay(null);
        setFormData({ time: '' });
      }, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reservas');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-3xl font-bold text-slate-900">Reservar Espaço Comum</h2>
        <p className="text-sm md:text-base text-slate-500">Selecione o local e a data desejada para sua reserva.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Space Selection */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
              Escolha o espaço
            </label>
            <select 
              value={selectedSpace}
              onChange={(e) => {
                setSelectedSpace(e.target.value);
                setSelectedDay(null);
              }}
              className="input-field appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
            >
              <option value="Churrasqueira 1">Churrasqueira 1</option>
              <option value="Churrasqueira 2">Churrasqueira 2</option>
              <option value="Área da Piscina">Área da Piscina</option>
              <option value="Salão de Festas">Salão de Festas</option>
            </select>
          </section>

          {/* Calendar */}
          <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Março de 2026</h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-condo-accent border border-condo-primary/20"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Disponível</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Ocupado</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-condo-primary"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="text-center py-2 text-xs font-bold text-slate-400 uppercase">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 md:gap-2">
                  {[...Array(3)].map((_, i) => <div key={`empty-${i}`} className="aspect-square"></div>)}
                  
                  {[...Array(31)].map((_, i) => {
                    const day = i + 1;
                    const isReserved = reservedDays.includes(day);
                    const isSelected = selectedDay === day;
     
                    return (
                      <button
                        key={day}
                        disabled={isReserved}
                        onClick={() => handleDayClick(day)}
                        className={`
                          aspect-square rounded-lg md:rounded-xl flex items-center justify-center text-xs md:text-sm font-bold transition-all
                          ${isReserved ? 'bg-red-50 text-red-300 cursor-not-allowed' : 'hover:bg-condo-accent hover:text-condo-primary'}
                          ${isSelected ? 'bg-condo-primary text-white shadow-lg shadow-condo-primary/30 scale-105' : 'text-slate-600'}
                          ${!isReserved && !isSelected ? 'bg-slate-50 border border-slate-100' : ''}
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>

        {/* Form */}
        <div className="space-y-6">
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
                <h4 className="text-xl font-bold text-slate-900 mb-2">Reserva Confirmada!</h4>
                <p className="text-slate-500 text-sm">Sua solicitação foi enviada com sucesso para a administração.</p>
              </motion.div>
            )}

            <h3 className="text-xl font-bold text-slate-900 mb-6">Finalizar Reserva</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  <User size={14} /> Nome
                </label>
                <input 
                  type="text" 
                  className="input-field bg-slate-50 cursor-not-allowed"
                  value={profile?.nome || ''}
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  <Home size={14} /> Unidade
                </label>
                <input 
                  type="text" 
                  className="input-field bg-slate-50 cursor-not-allowed"
                  value={profile?.unidade || 'Não informada'}
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  <Clock size={14} /> Horário de Uso
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: 14h às 20h" 
                  className="input-field"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  required
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={!selectedDay}
                  className={`btn-primary w-full ${!selectedDay ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Confirmar Reserva
                </button>
                {!selectedDay && (
                  <p className="text-center text-[10px] text-red-400 mt-2 font-bold uppercase">Selecione uma data no calendário</p>
                )}
              </div>
            </form>
          </section>

          <div className="bg-slate-900 p-6 rounded-2xl text-white">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <Info size={18} className="text-condo-accent" />
              Regras de Uso
            </h4>
            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
              <li>Cancelamentos com 24h de antecedência.</li>
              <li>Limpeza do local é responsabilidade do morador.</li>
              <li>Respeite o horário de silêncio após as 22h.</li>
              <li>Multa em caso de danos ao patrimônio.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
