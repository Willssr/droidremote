import React from 'react';
import { Shield, Cast, Accessibility, Wifi, Layers, CheckCircle, XCircle } from 'lucide-react';
import { PermissionStep } from '../types';

interface PermissionCardProps {
  step: PermissionStep;
  onGrant: (id: string) => void;
  active: boolean;
}

const PermissionCard: React.FC<PermissionCardProps> = ({ step, onGrant, active }) => {
  const getIcon = () => {
    switch (step.iconName) {
      case 'Shield': return <Shield className="w-6 h-6" />;
      case 'Cast': return <Cast className="w-6 h-6" />;
      case 'Accessibility': return <Accessibility className="w-6 h-6" />;
      case 'Wifi': return <Wifi className="w-6 h-6" />;
      case 'Layers': return <Layers className="w-6 h-6" />;
      default: return <Shield className="w-6 h-6" />;
    }
  };

  return (
    <div className={`
      relative p-4 rounded-xl border transition-all duration-300 mb-4
      ${step.granted 
        ? 'bg-emerald-900/20 border-emerald-500/50' 
        : active 
          ? 'bg-droid-800 border-blue-500 ring-1 ring-blue-500 shadow-lg shadow-blue-500/20' 
          : 'bg-droid-800/50 border-slate-700 opacity-60 grayscale'}
    `}>
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-lg ${step.granted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
          {getIcon()}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{step.title}</h3>
          <p className="text-sm text-slate-400 mt-1">{step.description}</p>
          
          {!step.granted && active && (
            <button
              onClick={() => onGrant(step.id)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors flex items-center"
            >
              <Shield className="w-4 h-4 mr-2" />
              Permitir Acesso
            </button>
          )}
        </div>

        <div className="mt-1">
          {step.granted ? (
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-slate-600" />
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionCard;