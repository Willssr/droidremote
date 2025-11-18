import React, { useState, useEffect, useRef } from 'react';
import { PermissionStep, CommandLog } from '../types';
import PermissionCard from './PermissionCard';
import LogConsole from './LogConsole';
import { Wifi, Smartphone, Lock, EyeOff } from 'lucide-react';

const INITIAL_STEPS: PermissionStep[] = [
  {
    id: 'accessibility',
    title: 'Acessibilidade',
    description: 'Necessário para simular toques e gestos remotamente.',
    required: true,
    granted: false,
    iconName: 'Accessibility'
  },
  {
    id: 'overlay',
    title: 'Sobreposição a outros apps',
    description: 'Permite desenhar indicadores de toque na tela.',
    required: true,
    granted: false,
    iconName: 'Layers'
  },
  {
    id: 'projection',
    title: 'Captura de Tela (MediaProjection)',
    description: 'Permite transmitir o conteúdo da tela para o operador.',
    required: true,
    granted: false,
    iconName: 'Cast'
  },
  {
    id: 'service',
    title: 'Serviço em Segundo Plano',
    description: 'Mantém a conexão ativa mesmo com o app minimizado.',
    required: true,
    granted: false,
    iconName: 'Wifi'
  }
];

interface HostViewProps {
  logs: CommandLog[];
  onStreamReady: (stream: MediaStream) => void;
}

const HostView: React.FC<HostViewProps> = ({ logs, onStreamReady }) => {
  const [steps, setSteps] = useState<PermissionStep[]>(INITIAL_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleGrant = async (id: string) => {
    if (id === 'projection') {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        onStreamReady(stream);
        setIsStreaming(true);
        
        // Handle stream stop from browser UI
        stream.getVideoTracks()[0].onended = () => {
          setIsStreaming(false);
          alert("A transmissão de tela foi encerrada pelo sistema.");
        };

      } catch (err) {
        console.error("Failed to get display media", err);
        alert("A permissão de captura de tela foi negada.");
        return; // Don't proceed if failed
      }
    }

    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, granted: true } : step
    ));

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsSetupComplete(true);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full max-h-full">
      {/* Left Panel: Configuration & Status */}
      <div className="bg-droid-800/50 rounded-2xl p-6 border border-slate-700 flex flex-col overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            <Smartphone className="mr-3 text-blue-500" />
            Android Host Simulator
          </h2>
          <p className="text-slate-400 text-sm">
            Configure as permissões necessárias para iniciar o servidor de acesso remoto.
          </p>
        </div>

        <div className="flex-1">
          {steps.map((step, idx) => (
            <PermissionCard 
              key={step.id} 
              step={step} 
              onGrant={handleGrant}
              active={idx === currentStepIndex}
            />
          ))}
        </div>

        {isSetupComplete && (
          <div className="mt-6 p-4 bg-emerald-900/30 border border-emerald-500/30 rounded-xl animate-pulse">
            <div className="flex items-center text-emerald-400 mb-2">
              <Wifi className="w-5 h-5 mr-2" />
              <span className="font-semibold">Servidor Ativo</span>
            </div>
            <p className="text-sm text-emerald-200/70">
              Aguardando conexão do operador. ID: #Sim-8821
            </p>
          </div>
        )}
      </div>

      {/* Right Panel: Preview & Logs */}
      <div className="flex flex-col space-y-6">
        {/* Screen Preview (Local) */}
        <div className="bg-black rounded-2xl border border-slate-700 aspect-video relative overflow-hidden flex items-center justify-center">
          {isStreaming ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center p-6">
              <div className="inline-flex p-4 rounded-full bg-slate-800 mb-4">
                <EyeOff className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-slate-400 font-medium">Captura Inativa</h3>
              <p className="text-slate-600 text-sm mt-2">Complete as permissões para iniciar o preview.</p>
            </div>
          )}
          
          {/* Security Badge */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full flex items-center border border-slate-700">
             <Lock className="w-3 h-3 text-emerald-500 mr-2" />
             <span className="text-xs text-slate-300">End-to-End Encrypted</span>
          </div>
        </div>

        {/* Logs */}
        <div className="flex-1 min-h-0">
           <LogConsole logs={logs} />
        </div>
      </div>
    </div>
  );
};

export default HostView;