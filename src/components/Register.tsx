import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building, Hash, Lock, ArrowLeft } from 'lucide-react';

interface RegisterProps {
  onBackToLogin: () => void;
  onRegisterSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onBackToLogin, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    email: '',
    phone: '',
    block: '',
    apartment: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate registration
    console.log('Registering user:', formData);
    onRegisterSuccess();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden"
      >
        <div className="bg-condo-primary p-8 text-white text-center">
          <h1 className="text-2xl font-bold">CondoConnect</h1>
          <p className="text-emerald-100 mt-2">Cadastro de Morador</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome Completo */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <User size={16} className="text-condo-primary" />
                Nome Completo
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Seu nome completo"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-condo-primary/20 focus:border-condo-primary transition-all"
              />
            </div>

            {/* CPF */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Hash size={16} className="text-condo-primary" />
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                required
                value={formData.cpf}
                onChange={handleChange}
                placeholder="Apenas números"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-condo-primary/20 focus:border-condo-primary transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Mail size={16} className="text-condo-primary" />
                E-mail
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-condo-primary/20 focus:border-condo-primary transition-all"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Phone size={16} className="text-condo-primary" />
                Telefone
              </label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-condo-primary/20 focus:border-condo-primary transition-all"
              />
            </div>

            {/* Bloco */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Building size={16} className="text-condo-primary" />
                Bloco
              </label>
              <select
                name="block"
                required
                value={formData.block}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-condo-primary/20 focus:border-condo-primary transition-all"
              >
                <option value="">Selecione</option>
                <option value="A">Bloco A</option>
                <option value="B">Bloco B</option>
                <option value="C">Bloco C</option>
              </select>
            </div>

            {/* Apartamento */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Hash size={16} className="text-condo-primary" />
                Apartamento
              </label>
              <input
                type="text"
                name="apartment"
                required
                value={formData.apartment}
                onChange={handleChange}
                placeholder="Ex: 201"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-condo-primary/20 focus:border-condo-primary transition-all"
              />
            </div>

            {/* Senha */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Lock size={16} className="text-condo-primary" />
                Senha
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-condo-primary/20 focus:border-condo-primary transition-all"
              />
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Lock size={16} className="text-condo-primary" />
                Confirmar Senha
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-condo-primary/20 focus:border-condo-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-condo-primary text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-condo-primary/20 mt-4"
          >
            Finalizar Cadastro
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-condo-primary transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Já tem uma conta? Fazer login
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
