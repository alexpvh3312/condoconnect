import * as React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if ((this as any).state.hasError) {
      const error = (this as any).state.error;
      let errorDetails = null;
      let suggestions: string[] = [
        "Tente recarregar a página.",
        "Verifique sua conexão com a internet.",
        "Limpe o cache do seu navegador."
      ];
      let errorNickname = "Erro Inesperado";

      try {
        if (error && error.message) {
          // Try to parse if it's a JSON error from handleFirestoreError
          if (error.message.startsWith('{') && error.message.endsWith('}')) {
            errorDetails = JSON.parse(error.message);
            
            if (errorDetails.error?.includes('permission-denied') || errorDetails.error?.includes('Missing or insufficient permissions')) {
              errorNickname = "Acesso Negado";
              suggestions = [
                "Verifique se você está logado com a conta correta.",
                "Seu cargo (Morador/Síndico) pode não ter permissão para esta ação.",
                "Tente sair e entrar novamente no aplicativo.",
                "Contate o síndico se o problema persistir."
              ];
            } else if (errorDetails.error?.includes('offline')) {
              errorNickname = "Sem Conexão";
              suggestions = [
                "Verifique seu Wi-Fi ou dados móveis.",
                "O servidor pode estar temporariamente indisponível.",
                "Tente novamente em alguns instantes."
              ];
            } else if (errorDetails.error?.includes('quota-exceeded')) {
              errorNickname = "Limite Excedido";
              suggestions = [
                "O sistema atingiu o limite de uso diário gratuito.",
                "Tente novamente amanhã.",
                "Contate o suporte técnico."
              ];
            }
          }
        }
      } catch (e) {
        // Fallback if parsing fails
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-slate-100">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{errorNickname}</h1>
            <p className="text-slate-500 mb-8 text-sm">
              Encontramos um obstáculo técnico. Veja abaixo como podemos resolver:
            </p>

            <div className="text-left mb-8 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Sugestões:</h3>
              <ul className="space-y-2">
                {suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="flex-shrink-0 w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-100">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <div className="mb-8 text-left">
                <details className="group">
                  <summary className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 transition-colors list-none flex items-center gap-1">
                    <span className="group-open:rotate-90 transition-transform">▶</span> Detalhes Técnicos
                  </summary>
                  <div className="mt-2 bg-slate-900 rounded-xl p-4 overflow-auto max-h-40">
                    <pre className="text-[10px] font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                      {errorDetails ? JSON.stringify(errorDetails, null, 2) : error.message}
                    </pre>
                  </div>
                </details>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => window.location.href = '/'}
                className="bg-slate-100 text-slate-600 font-bold py-3 px-4 rounded-xl hover:bg-slate-200 transition-all text-sm"
              >
                Início
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 text-sm"
              >
                Recarregar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
