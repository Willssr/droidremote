import React, { useState, useCallback } from 'react';
import { UserRole, CommandLog } from './types';
import HostView from './components/HostView';
import OperatorView from './components/OperatorView';
import { Smartphone, Monitor, ArrowRightLeft } from 'lucide-react';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.NONE);
  const [logs, setLogs] = useState<CommandLog[]>([]);
  
  // In a real app, this stream would be sent via WebRTC peer connection.
  // Here, we lift the state to share it locally for the simulation.
  const [sharedStream, setSharedStream] = useState<MediaStream | null>(null);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
  };

  const addLog = useCallback((type: CommandLog['type'], details: string) => {
    const newLog: CommandLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type,
      details
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  const handleOperatorCommand = (cmd: Omit<CommandLog, 'id' | 'timestamp'>) => {
    addLog(cmd.type, cmd.details);
  };

  return (
    <div className="min-h-screen bg-droid-900 text-slate-200 flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 bg-droid-800 border-b border-slate-700 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-emerald-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ArrowRightLeft className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">Droid<span className="text-blue-400">Remote</span></span>
        </div>
        
        {role !== UserRole.NONE && (
          <button 
            onClick={() => setRole(UserRole.NONE)}
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors border border-slate-600 px-3 py-1 rounded-full"
          >
            Sair da Sessão
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 h-[calc(100vh-4rem)] overflow-hidden">
        {role === UserRole.NONE ? (
          // Landing / Role Selection
          <div className="h-full flex flex-col items-center justify-center space-y-12 animate-fade-in">
            <div className="text-center space-y-4 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Suporte Remoto <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Descomplicado</span>
              </h1>
              <p className="text-slate-400 text-lg">
                Simulador de acesso remoto seguro para Android. Escolha seu papel para começar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
              <button 
                onClick={() => handleRoleSelect(UserRole.HOST)}
                className="group relative bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-emerald-500 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
                <Smartphone className="w-12 h-12 text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white mb-2">Sou o Host (Cliente)</h3>
                <p className="text-slate-400">Simula o dispositivo Android. Você concederá permissões e compartilhará a tela.</p>
              </button>

              <button 
                onClick={() => handleRoleSelect(UserRole.OPERATOR)}
                className="group relative bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 text-left"
              >
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
                <Monitor className="w-12 h-12 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white mb-2">Sou o Operador</h3>
                <p className="text-slate-400">Visualize a tela remota, envie comandos e use IA para diagnóstico.</p>
              </button>
            </div>
          </div>
        ) : role === UserRole.HOST ? (
          <HostView 
            logs={logs} 
            onStreamReady={setSharedStream}
          />
        ) : (
          <OperatorView 
            stream={sharedStream}
            onSendCommand={handleOperatorCommand}
          />
        )}
      </main>
    </div>
  );
};

export default App;