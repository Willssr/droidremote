import React, { useEffect, useRef } from 'react';
import { CommandLog } from '../types';
import { Terminal } from 'lucide-react';

interface LogConsoleProps {
  logs: CommandLog[];
}

const LogConsole: React.FC<LogConsoleProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-black/80 rounded-lg border border-slate-700 overflow-hidden font-mono text-xs">
      <div className="bg-slate-800 p-2 px-4 border-b border-slate-700 flex items-center space-x-2">
        <Terminal className="w-4 h-4 text-slate-400" />
        <span className="text-slate-400 font-semibold">System Logs / Accessibility Service</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {logs.length === 0 && (
          <div className="text-slate-600 italic">Aguardando conexão do controlador...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex space-x-2">
            <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span className={`
              ${log.type === 'CLICK' ? 'text-cyber-green' : ''}
              ${log.type === 'SCROLL' ? 'text-cyber-yellow' : ''}
              ${log.type === 'KEY' ? 'text-blue-400' : ''}
              ${log.type === 'SYSTEM' ? 'text-purple-400' : ''}
            `}>
              {log.type}:
            </span>
            <span className="text-slate-300">{log.details}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default LogConsole;