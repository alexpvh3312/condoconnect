import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Building2, User, Mail, Image as ImageIcon, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { db, doc, getDoc, setDoc, storage, ref, uploadBytes, getDownloadURL, handleFirestoreError, OperationType } from '../firebase';

interface CondoConfig {
  nome: string;
  administrador: string;
  emailSuporte: string;
  logoURL?: string;
}

export default function AdminSettings() {
  const [config, setConfig] = useState<CondoConfig>({
    nome: '',
    administrador: '',
    emailSuporte: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const docRef = doc(db, 'configuracoes', 'condominio');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig(docSnap.data() as CondoConfig);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'configuracoes/condominio');
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      let logoURL = config.logoURL;

      // Upload Logo if selected
      if (logoFile) {
        const logoRef = ref(storage, `logos/${config.nome || 'condo'}-logo.png`);
        await uploadBytes(logoRef, logoFile);
        logoURL = await getDownloadURL(logoRef);
      }

      // Upload PDF if selected (as a new document)
      if (pdfFile) {
        const pdfRef = ref(storage, `documentos/${config.nome || 'condo'}-${pdfFile.name}`);
        await uploadBytes(pdfRef, pdfFile);
        const pdfURL = await getDownloadURL(pdfRef);
        
        // Add to documentos collection
        const docRef = doc(db, 'documentos', pdfFile.name);
        await setDoc(docRef, {
          nome: pdfFile.name,
          url: pdfURL,
          condominio: config.nome,
          // Adding these for compatibility with existing Documents component
          titulo: pdfFile.name,
          categoria: 'Configurações',
          data: new Date().toISOString().split('T')[0],
          descricao: 'Documento enviado via configurações do administrador'
        });
      }

      // Save Condo Config
      await setDoc(doc(db, 'configuracoes', 'condominio'), {
        ...config,
        logoURL
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'config/condo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-condo-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Configurações do Condomínio</h2>
        <p className="text-slate-500">Gerencie as informações básicas e documentos do administrador.</p>
      </header>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSave}
        className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Building2 size={16} className="text-condo-primary" />
              Nome do Condomínio
            </label>
            <input
              type="text"
              value={config.nome}
              onChange={(e) => setConfig({ ...config, nome: e.target.value })}
              placeholder="Ex: Residencial Verde Vida"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-condo-primary focus:ring-2 focus:ring-condo-primary/20 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <User size={16} className="text-condo-primary" />
              Nome do Administrador
            </label>
            <input
              type="text"
              value={config.administrador}
              onChange={(e) => setConfig({ ...config, administrador: e.target.value })}
              placeholder="Ex: João Silva"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-condo-primary focus:ring-2 focus:ring-condo-primary/20 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Mail size={16} className="text-condo-primary" />
              E-mail de Suporte
            </label>
            <input
              type="email"
              value={config.emailSuporte}
              onChange={(e) => setConfig({ ...config, emailSuporte: e.target.value })}
              placeholder="Ex: suporte@condominio.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-condo-primary focus:ring-2 focus:ring-condo-primary/20 outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <ImageIcon size={16} className="text-condo-primary" />
                Logo do Condomínio
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="logo-upload"
                />
                <label 
                  htmlFor="logo-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  {logoFile ? (
                    <span className="text-sm font-medium text-condo-primary">{logoFile.name}</span>
                  ) : config.logoURL ? (
                    <img src={config.logoURL} alt="Logo" className="h-20 object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <>
                      <ImageIcon className="text-slate-400 mb-2" size={24} />
                      <span className="text-xs text-slate-500">Clique para alterar</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FileText size={16} className="text-condo-primary" />
                Adicionar PDF (Documentos)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="pdf-upload"
                />
                <label 
                  htmlFor="pdf-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  {pdfFile ? (
                    <span className="text-sm font-medium text-condo-primary">{pdfFile.name}</span>
                  ) : (
                    <>
                      <FileText className="text-slate-400 mb-2" size={24} />
                      <span className="text-xs text-slate-500">Selecionar PDF</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all ${
              success ? 'bg-emerald-500' : 'bg-condo-primary hover:bg-condo-primary/90'
            } disabled:opacity-70`}
          >
            {saving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : success ? (
              <CheckCircle2 size={20} />
            ) : (
              <Save size={20} />
            )}
            {saving ? 'Salvando...' : success ? 'Configurações Salvas!' : 'SALVAR CONFIGURAÇÕES'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
