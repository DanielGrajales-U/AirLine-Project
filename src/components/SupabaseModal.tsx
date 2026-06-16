import React, { useState } from 'react';
import { Database, Wifi, CheckCircle, HelpCircle, X, Key, Globe } from 'lucide-react';
import { getSupabaseConfig, isSupabaseConfigured } from '../db/supabaseClient';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export default function SupabaseModal({ isOpen, onClose, onConfigChanged }: SupabaseModalProps) {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.key);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && anonKey) {
      localStorage.setItem('supabase_url', url.trim());
      localStorage.setItem('supabase_anon_key', anonKey.trim());
    } else {
      localStorage.removeItem('supabase_url');
      localStorage.removeItem('supabase_anon_key');
    }
    setSaved(true);
    onConfigChanged();
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_anon_key');
    setUrl('');
    setAnonKey('');
    onConfigChanged();
    onClose();
  };

  const active = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Database className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-lg tracking-tight">Conector de Base de Datos</h3>
              <p className="text-xs text-slate-400">Vincula tu proyecto con Supabase Cloud</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {active ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-emerald-900 font-semibold text-sm">Supabase Conectado</h4>
                <p className="text-emerald-700 text-xs mt-0.5">
                  La aplicación está lista para interactuar con tus tablas remotas creadas por el script SQL de la carpeta <code className="bg-emerald-100/60 px-1 py-0.5 rounded font-mono text-[10px]">/docs/schema.sql</code>.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <Wifi className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-blue-900 font-semibold text-sm">Modo Demo Local Activo</h4>
                <p className="text-blue-700 text-xs mt-0.5">
                  Operando en base de datos relacional simulada con persistencia síncrona en <code className="font-serif">localStorage</code>. Ideal para evaluar el 100% de los requisitos académicos inmediatamente.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                SUPABASE_URL
              </label>
              <input
                type="url"
                required={!!anonKey}
                placeholder="https://tu-proyecto.supabase.co"
                className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                SUPABASE_ANON_KEY
              </label>
              <textarea
                required={!!url}
                rows={3}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono resize-none leading-relaxed"
                value={anonKey}
                onChange={e => setAnonKey(e.target.value)}
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {saved ? (
                  <>
                    <CheckCircle className="w-4 h-4" /> ¡Guardado y Reiniciado!
                  </>
                ) : (
                  'Guardar Ajustes de API'
                )}
              </button>

              {active && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs py-2.5 px-4 rounded-xl border border-rose-200 transition-all cursor-pointer"
                >
                  Desconectar Supabase
                </button>
              )}
            </div>
          </form>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-slate-500 text-[11px] leading-relaxed space-y-1">
            <p className="font-bold text-slate-700 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> ¿Cómo obtengo estos valores?
            </p>
            <p>1. Ve a tu panel de control en <strong>supabase.com</strong></p>
            <p>2. En Settings &gt; API, copia el <strong>Project URL</strong> y la clave <strong>anon public</strong> de tu proyecto.</p>
            <p>3. Pégalos aquí arriba para vincular en directo la app con tu base de datos remota PostgreSQL.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
