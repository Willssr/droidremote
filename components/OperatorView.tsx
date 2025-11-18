import React, { useRef, useEffect, useState } from 'react';
import { CommandLog } from '../types';
import { MousePointer2, Zap, AlertTriangle, RefreshCw, Bot, Keyboard } from 'lucide-react';
import { analyzeScreenFrame } from '../services/geminiService';

interface OperatorViewProps {
  stream: MediaStream | null;
  onSendCommand: (cmd: Omit<CommandLog, 'id' | 'timestamp'>) => void;
}

const OperatorView: React.FC<OperatorViewProps> = ({ stream, onSendCommand }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    
    // Calculate percentage for resolution independence
    const xPct = ((x / rect.width) * 100).toFixed(1);
    const yPct = ((y / rect.height) * 100).toFixed(1);

    onSendCommand({
      type: 'CLICK',
      details: `Touch event at (${x}, ${y}) [${xPct}%, ${yPct}%]`
    });

    // Visual feedback dot
    const dot = document.createElement('div');
    dot.className = 'absolute w-4 h-4 bg-white/50 rounded-full border border-blue-500 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ping';
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    e.currentTarget.appendChild(dot);
    setTimeout(() => dot.remove(), 500);
  };

  const handleKeyPress = (key: string) => {
    onSendCommand({
      type: 'KEY',
      details: `Key Event: ${key}`
    });
  };

  const triggerGeminiAnalysis = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsAIAnalyzing(true);
    setAiSuggestion("Analyzing screen context...");

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Match canvas size to video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/png').split(',')[1]; // Remove data:image/png;base64 prefix
        
        const analysis = await analyzeScreenFrame(
          base64, 
          "Describe what is on this Android screen. If there are error dialogs, explain how to fix them. Be concise, act like a tech support assistant."
        );
        setAiSuggestion(analysis);
      }
    } catch (err) {
      setAiSuggestion("Failed to capture screen for analysis.");
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  if (!stream) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-700 rounded-2xl">
        <RefreshCw className="w-12 h-12 mb-4 animate-spin" />
        <h2 className="text-xl font-semibold">Waiting for Host...</h2>
        <p className="text-sm mt-2 max-w-md text-center">
          Please enable screen sharing on the Host Simulator to begin the remote session.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Main Viewport */}
      <div className="lg:col-span-2 flex flex-col">
        <div className="bg-black rounded-t-xl p-2 flex items-center justify-between border border-slate-700 border-b-0">
           <div className="flex items-center space-x-2">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             <span className="text-xs font-mono text-slate-300">LIVE - 30ms LATENCY</span>
           </div>
           <span className="text-xs text-slate-500">1920x1080</span>
        </div>
        
        <div 
          className="relative bg-black border border-slate-700 flex-1 flex items-center justify-center overflow-hidden cursor-crosshair group"
          onClick={handleVideoClick}
        >
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            onLoadedMetadata={() => setVideoReady(true)}
            className="max-w-full max-h-full object-contain"
          />
          {!videoReady && <div className="text-white">Loading Stream...</div>}
          
          {/* Overlay controls hint */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Click to send touch event
          </div>
        </div>

        {/* Quick Actions Toolbar */}
        <div className="bg-droid-800 p-4 rounded-b-xl border border-slate-700 border-t-0 flex items-center justify-center space-x-4">
           <button onClick={() => handleKeyPress('HOME')} className="p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors" title="Home">
              <div className="w-4 h-4 rounded-full border-2 border-white/70" />
           </button>
           <button onClick={() => handleKeyPress('BACK')} className="p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors" title="Back">
              <div className="w-4 h-4 border-l-2 border-b-2 border-white/70 transform rotate-45 ml-1" />
           </button>
           <button onClick={() => handleKeyPress('RECENTS')} className="p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors" title="Recents">
              <div className="w-4 h-4 border-2 border-white/70 rounded-sm" />
           </button>
        </div>
      </div>

      {/* Sidebar: Tools & AI */}
      <div className="flex flex-col space-y-6">
        {/* Virtual Keyboard / Shortcuts */}
        <div className="bg-droid-800 rounded-xl p-4 border border-slate-700">
           <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center">
             <Keyboard className="w-4 h-4 mr-2" /> Macros
           </h3>
           <div className="grid grid-cols-2 gap-2">
             <button onClick={() => handleKeyPress('VOL_UP')} className="px-3 py-2 bg-slate-700 rounded text-xs hover:bg-slate-600">Vol +</button>
             <button onClick={() => handleKeyPress('VOL_DOWN')} className="px-3 py-2 bg-slate-700 rounded text-xs hover:bg-slate-600">Vol -</button>
             <button onClick={() => handleKeyPress('POWER')} className="px-3 py-2 bg-red-900/50 text-red-300 rounded text-xs hover:bg-red-900/70">Power</button>
             <button onClick={() => handleKeyPress('SCREENSHOT')} className="px-3 py-2 bg-slate-700 rounded text-xs hover:bg-slate-600">Print</button>
           </div>
        </div>

        {/* Gemini AI Assistant */}
        <div className="bg-gradient-to-b from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-500/30 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-blue-300 flex items-center">
              <Bot className="w-4 h-4 mr-2" /> Gemini Assistant
            </h3>
            <button 
              onClick={triggerGeminiAnalysis}
              disabled={isAIAnalyzing}
              className="text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-3 py-1 rounded transition-colors"
            >
              {isAIAnalyzing ? 'Thinking...' : 'Analyze Screen'}
            </button>
          </div>
          
          <div className="flex-1 bg-black/40 rounded-lg p-3 text-sm text-slate-300 overflow-y-auto border border-white/5">
            {aiSuggestion ? (
              <p className="whitespace-pre-wrap leading-relaxed">{aiSuggestion}</p>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center">
                <Zap className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-xs">Click "Analyze Screen" to let Gemini identify errors or translate content.</p>
              </div>
            )}
          </div>
          
          {/* Hidden canvas for screen capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default OperatorView;