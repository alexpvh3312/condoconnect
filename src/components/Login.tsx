import { Building2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1920" 
          alt="Condominium" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-condo-secondary/80 backdrop-blur-[2px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-condo-primary text-white mb-4 shadow-xl shadow-condo-primary/30">
            <Building2 size={32} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">CondoConnect</h1>
          <p className="text-white/70">Seu condomínio na palma da mão</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Bem-vindo de volta!</h2>
              <p className="text-slate-500 text-sm">Acesse sua conta para gerenciar seu condomínio</p>
            </div>

            <button 
              onClick={login}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-3 px-4 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Entrar com Google
            </button>

            <p className="text-xs text-center text-slate-400 px-4">
              Ao entrar, você concorda com nossos termos de serviço e política de privacidade.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs uppercase tracking-widest font-bold">
              <ShieldCheck size={14} />
              Acesso Seguro via Firebase
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-white/40 text-sm">
          Residencial Verde Vida &copy; 2026
        </p>
      </motion.div>
    </div>
  );
}
