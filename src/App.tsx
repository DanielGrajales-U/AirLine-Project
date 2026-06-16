import { useState, useMemo, FormEvent } from 'react';
import { 
  Plane, 
  ShieldAlert, 
  UserSquare2, 
  Key, 
  Database, 
  LogOut, 
  User, 
  Search, 
  BarChart4, 
  Settings, 
  HelpCircle,
  FileCode2,
  Calendar,
  Layers,
  Lock,
  Compass,
  ArrowRight
} from 'lucide-react';
import dbService from './db/localDatabase';
import { Usuario, Cliente } from './types';
import SupabaseModal from './components/SupabaseModal';
import { isSupabaseConfigured } from './db/supabaseClient';

// Core content panel views
import AdminVuelos from './components/AdminVuelos';
import AdminClientes from './components/AdminClientes';
import AdminOtros from './components/AdminOtros';
import Reportes from './components/Reportes';
import ClienteReservas from './components/ClienteReservas';
import AgenteReservas from './components/AgenteReservas';

export default function App() {
  const [session, setSession] = useState<Usuario | null>(() => {
    // Start with SuperAdmin preloaded for simple academic evaluation
    return null;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [dbStateTrigger, setDbStateTrigger] = useState(0);

  // Login variables
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Self signup variables
  const [showSignup, setShowSignup] = useState(false);
  const [regId, setRegId] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regApellidos, setRegApellidos] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDireccion, setRegDireccion] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regError, setRegError] = useState('');

  const currentClientData = useMemo<Cliente | null>(() => {
    if (!session || session.rol !== 'Cliente' || !session.id_cliente) return null;
    return dbService.getClientes().find(c => c.id_cliente === session.id_cliente) || null;
  }, [session]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim() || !loginPass) {
      setLoginError('Complete todos los campos del login.');
      return;
    }
    const user = dbService.authenticate(loginEmail.trim().toLowerCase(), loginPass);
    if (user) {
      setSession(user);
      // Default views
      if (user.rol === 'Cliente') setActiveTab('cliente-portal');
      else if (user.rol === 'Agente') setActiveTab('operativo');
      else setActiveTab('dashboard');
    } else {
      setLoginError('Credenciales incorrectas. Verifique los presets académicos abajo.');
    }
  };

  const handleSignup = (e: FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regId.trim() || !regNombre.trim() || !regApellidos.trim() || !regEmail.trim() || !regDireccion.trim() || !regTelefono.trim() || !regPass.trim()) {
      setRegError('Complete todos los campos obligatorios.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setRegError('El email no tiene un formato válido.');
      return;
    }

    // 1. Create client
    const resCli = dbService.createCliente({
      id_cliente: regId.trim(),
      nombre: regNombre.trim(),
      apellidos: regApellidos.trim(),
      email: regEmail.trim().toLowerCase(),
      direccion: regDireccion.trim(),
      id_ciudad: 1, // Cali defaulted
      telefono_principal: regTelefono.trim()
    });

    if (!resCli.success) {
      setRegError(resCli.message);
      return;
    }

    // 2. Create actual associated authentication system-user
    const resUser = dbService.registrarUsuario(regEmail.trim().toLowerCase(), regPass, regId.trim());
    if (resUser.success && resUser.user) {
      setSession(resUser.user);
      setActiveTab('cliente-portal');
      setShowSignup(false);
      alert('¡Cuenta creada correctamente en la base de datos nacional! Has iniciado sesión.');
    } else {
      setRegError(resUser.message);
    }
  };

  const dbConnectionActive = useMemo(() => {
    return isSupabaseConfigured();
  }, [dbStateTrigger]);

  const handleLogout = () => {
    setSession(null);
    setLoginEmail('');
    setLoginPass('');
    setLoginError('');
  };

  // Direct fast login helpers during professor evaluation click
  const fastLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPass(pass);
    const user = dbService.authenticate(email, pass);
    if (user) {
      setSession(user);
      if (user.rol === 'Cliente') setActiveTab('cliente-portal');
      else if (user.rol === 'Agente') setActiveTab('operativo');
      else setActiveTab('dashboard');
    }
  };

  // Render content according to the active Tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* KPI Cards overlay */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
              <div className="p-6 bg-slate-900 text-white rounded-2xl relative overflow-hidden shadow-xs">
                <span className="text-[10px] bg-sky-400 text-slate-900 font-bold px-2 py-0.5 rounded-full uppercase">Flota Aérea</span>
                <p className="mt-4 text-2xl font-bold font-serif">{dbService.getVuelos().length} Rutas Listas</p>
                <p className="text-xs text-slate-400 mt-1">Vuelos nacionales e internacionales programados</p>
                <Plane className="absolute w-24 h-24 text-slate-800 -right-4 -bottom-4 translate-x-2 translate-y-2 opacity-50" />
              </div>

              <div className="p-6 bg-white border border-slate-150 rounded-2xl shadow-xs">
                <span className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-full uppercase">Demographics</span>
                <p className="mt-4 text-2xl font-bold text-slate-900 font-serif">{dbService.getClientes().length} Clientes Activos</p>
                <p className="text-xs text-slate-400 mt-1">Con validación de formato REGEX y llaves primarias</p>
              </div>

              <div className="p-6 bg-indigo-950 text-indigo-100 rounded-2xl shadow-xs relative overflow-hidden">
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded-full uppercase">Ingresos Estimados</span>
                <p className="mt-4 text-2xl font-serif font-bold text-white">
                  ${dbService.getReservas().filter(r => r.id_estado === 2).reduce((sum, r) => sum + r.valor_total, 0).toLocaleString('es-CO')}
                </p>
                <p className="text-xs text-indigo-300 mt-1">En reservas bajo estado Confirmado</p>
              </div>
            </div>

            {/* Quick action boxes */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 space-y-4">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Acceso Rápido a Requisitos de Entrega</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-white p-4 rounded-xl border border-slate-120 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">SQL DDL Integridad</span>
                    <p className="text-slate-500 leading-relaxed">Script con llaves foráneas, primarias, checks y triggers automáticos de auditoría para Supabase.</p>
                  </div>
                  <button 
                    onClick={() => {
                      // Trigger file view or instruct
                      alert("El archivo SQL físico está en /docs/schema.sql listo para copiar al editor de Supabase.");
                    }}
                    className="mt-3 text-indigo-650 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Ver instrucciones <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-120 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Mecanismo de Auditoría</span>
                    <p className="text-slate-500 leading-relaxed">Cada creación o alteración de estado de tiquetes dispara una actualización histórica visible de forma descriptiva.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('reportes')}
                    className="mt-3 text-indigo-650 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Auditar Logs <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-120 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Reportes Comerciales</span>
                    <p className="text-slate-500 leading-relaxed">Visualiza gráficos de ingresos mensuales por destino, clientes frecuentes y tiempos promedios reales de cobros.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('reportes')}
                    className="mt-3 text-indigo-650 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Examinar BI <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'vuelos':
        return <AdminVuelos />;
      case 'clientes':
        return <AdminClientes />;
      case 'geografía':
        return <AdminOtros />;
      case 'reportes':
        return <Reportes />;
      case 'operativo':
        return <AgenteReservas />;
      case 'cliente-portal':
        return currentClientData ? (
          <ClienteReservas currentClient={currentClientData} />
        ) : (
          <div className="bg-rose-50 text-rose-800 p-4 rounded-xl border border-rose-200 text-xs">
            Su usuario no posee una cédula de cliente asociada. Modifique el rol a SuperAdmin o Agente para operar.
          </div>
        );
      default:
        return <div className="text-xs text-slate-400">Seleccione una pestaña en el menú lateral.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col min-w-[320px]">
      
      {/* 🚀 NOT LOGGED IN SHELL */}
      {!session ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 py-12 md:py-20 max-w-5xl mx-auto w-full">
          {/* Logo brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
              <Plane className="w-8 h-8 -rotate-45" />
            </div>
            <div>
              <h1 className="font-serif font-black text-2xl tracking-tight text-slate-900 leading-none">Aerounivalle</h1>
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mt-1">Reserva y Gestión de Vuelos</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-150 shadow-2xl overflow-hidden w-full max-w-4xl grid grid-cols-1 md:grid-cols-2">
            
            {/* Visual Column */}
            <div className="bg-slate-950 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="space-y-4 relative z-10">
                <span className="text-[10px] bg-white/10 text-white font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-white/10">
                  Bases de Datos 2026-I
                </span>
                <h2 className="font-serif text-3xl font-bold leading-tight">Proyecto Integrador de Control de Vuelos y Reservaciones</h2>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Un sistema diseñado bajo los principios de consistencia de transacciones, triggers automáticos de PostgreSQL, cascades e integridad relacional. Listo para conectar con mesas de trabajo Supabase.
                </p>
              </div>

              {/* Quick instructions & developer credentials */}
              <div className="pt-8 relative z-10 space-y-3 border-t border-white/10 text-xs">
                <span className="font-bold text-sky-400 flex items-center gap-1.5 uppercase text-[10px]">
                  <Key className="w-3.5 h-3.5" /> Fast Track - Perfiles de Evaluación (Click para Login)
                </span>
                
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => fastLogin('admin@aerolinea.com', 'admin123')}
                    className="bg-white/5 hover:bg-white/15 border border-white/10 text-left p-2 rounded-xl transition-all flex justify-between items-center text-[11px] cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-white">1. Súper Administrador</p>
                      <p className="text-slate-400 font-mono text-[9px] mt-0.5">admin@aerolinea.com (pass: admin123)</p>
                    </div>
                    <span className="text-[9px] bg-indigo-500/30 text-indigo-200 font-bold px-2 py-0.5 rounded">CRUD Completo</span>
                  </button>

                  <button 
                    onClick={() => fastLogin('agente@aerolinea.com', 'agente123')}
                    className="bg-white/5 hover:bg-white/15 border border-white/10 text-left p-2 rounded-xl transition-all flex justify-between items-center text-[11px] cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-white">2. Agente de Aerolínea</p>
                      <p className="text-slate-400 font-mono text-[9px] mt-0.5">agente@aerolinea.com (pass: agente123)</p>
                    </div>
                    <span className="text-[9px] bg-slate-100/10 text-white font-bold px-2 py-0.5 rounded">Control Ventas</span>
                  </button>

                  <button 
                    onClick={() => fastLogin('luis23luis33@gmail.com', 'luis123')}
                    className="bg-white/5 hover:bg-white/15 border border-white/10 text-left p-2 rounded-xl transition-all flex justify-between items-center text-[11px] cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-white">3. Cliente Pasajero (Luis David)</p>
                      <p className="text-slate-400 font-mono text-[9px] mt-0.5">luis23luis33@gmail.com (pass: luis123)</p>
                    </div>
                    <span className="text-[9px] bg-emerald-500/30 text-emerald-300 font-bold px-2 py-0.5 rounded">Reservar Sillas</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Forms Column */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              {!showSignup ? (
                // NORMAL LOGIN
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-serif text-xl font-bold text-slate-900">Ingreso de Personal o Pasajeros</h3>
                    <p className="text-xs text-slate-400">Escriba sus credenciales de base de datos registradas.</p>
                  </div>

                  {loginError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[11px] p-2.5 rounded-lg flex items-start gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Correo Electrónico</label>
                      <input
                        type="email"
                        required
                        placeholder="admin@aerolinea.com o pasajero@correo.com"
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-950 font-mono"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Contraseña de acceso</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-950 font-mono"
                        value={loginPass}
                        onChange={e => setLoginPass(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    Iniciar Sesión
                  </button>

                  <div className="pt-4 border-t border-slate-100 text-center">
                    <p className="text-slate-400 text-xs">¿Eres un nuevo pasajero?{' '}</p>
                    <button
                      type="button"
                      onClick={() => { setShowSignup(true); setRegError(''); }}
                      className="text-xs text-indigo-600 font-bold hover:underline mt-1.5 cursor-pointer"
                    >
                      Regístrate como Cliente
                    </button>
                  </div>
                </form>
              ) : (
                // SELF-SIGNUP CLIENT FORM
                <form onSubmit={handleSignup} className="space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-slate-900">Registro Autónomo de Clientes</h3>
                    <p className="text-[10px] text-slate-400">Tus datos se vincularán inmediatamente en las tablas relacionales.</p>
                  </div>

                  {regError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[10px] p-2 rounded-lg flex items-start gap-1">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Identificación (Cédula o pasaporte)</label>
                      <input
                        type="text"
                        required
                        placeholder="Cédula"
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 font-mono"
                        value={regId}
                        onChange={e => setRegId(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Nombres</label>
                        <input
                          type="text"
                          required
                          placeholder="Felipe"
                          className="w-full text-xs p-2 rounded-lg border border-slate-200"
                          value={regNombre}
                          onChange={e => setRegNombre(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Apellidos</label>
                        <input
                          type="text"
                          required
                          placeholder="Mendoza"
                          className="w-full text-xs p-2 rounded-lg border border-slate-200"
                          value={regApellidos}
                          onChange={e => setRegApellidos(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Correo Electrónico (Para login)</label>
                      <input
                        type="email"
                        required
                        placeholder="ejemplo@servidor.com"
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 font-mono"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Dirección física</label>
                        <input
                          type="text"
                          required
                          placeholder="Carrera 4 #10-15"
                          className="w-full text-xs p-2 rounded-lg border border-slate-200"
                          value={regDireccion}
                          onChange={e => setRegDireccion(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Teléfono Principal</label>
                        <input
                          type="tel"
                          required
                          placeholder="Celular"
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 font-mono"
                          value={regTelefono}
                          onChange={e => setRegTelefono(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Contraseña</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 font-mono"
                        value={regPass}
                        onChange={e => setRegPass(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-900 hover:bg-indigo-805 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer"
                    >
                      Registrarme
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSignup(false)}
                      className="bg-slate-50 border border-slate-200 text-slate-500 font-bold text-xs py-2 px-3 rounded-xl cursor-pointer"
                    >
                      Regresar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : (

        // 🟢 AUTHENTICATED REALM SHELL
        <div className="flex-1 flex flex-col md:flex-row">
          
          {/* NAVIGATION SIDEBAR */}
          <aside className="w-full md:w-64 bg-slate-950 text-slate-300 p-6 flex flex-col justify-between border-r border-slate-900">
            <div className="space-y-6">
              {/* Sidebar Header Brand */}
              <div className="flex items-center gap-2.5 border-b border-white/5 pb-5">
                <div className="p-2 bg-white text-slate-950 rounded-xl">
                  <Plane className="w-5 h-5 -rotate-45" />
                </div>
                <div>
                  <h2 className="font-serif font-black text-white text-sm">Aerounivalle</h2>
                  <span className="text-[9px] text-slate-500 font-mono font-bold uppercase block tracking-wider">Mesa de reservas</span>
                </div>
              </div>

              {/* Connected details */}
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">Operario Conectado:</span>
                <span className="text-xs font-bold text-slate-100 block truncate mt-0.5">{session.email}</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase mt-1.5 inline-block ${
                  session.rol === 'SuperAdmin' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                  session.rol === 'Agente' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  🛡️ {session.rol === 'SuperAdmin' ? 'Super Administrador' : session.rol === 'Agente' ? 'Agente Comercial' : 'Pasajero Titular'}
                </span>
              </div>

              {/* NAVIGATION LIST */}
              <nav className="space-y-1 block select-none">
                <span className="text-[9px] uppercase tracking-wider text-slate-600 font-bold block px-2 mb-2">Panel de Control</span>
                
                {/* 1. SUPER ADMIN TABS */}
                {session.rol === 'SuperAdmin' && (
                  <>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`w-full text-left text-xs font-bold py-2.5 px-3 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                        activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow' : 'hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Inicio KPIs
                    </button>
                    <button
                      onClick={() => setActiveTab('vuelos')}
                      className={`w-full text-left text-xs font-bold py-2.5 px-3 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                        activeTab === 'vuelos' ? 'bg-white text-slate-900 shadow' : 'hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <Plane className="w-3.5 h-3.5" />
                      Gestionar Vuelos (CRUD)
                    </button>
                    <button
                      onClick={() => setActiveTab('clientes')}
                      className={`w-full text-left text-xs font-bold py-2.5 px-3 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                        activeTab === 'clientes' ? 'bg-white text-slate-900 shadow' : 'hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <UserSquare2 className="w-3.5 h-3.5" />
                      Gestionar Clientes (CRUD)
                    </button>
                    <button
                      onClick={() => setActiveTab('geografía')}
                      className={`w-full text-left text-xs font-bold py-2.5 px-3 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                        activeTab === 'geografía' ? 'bg-white text-slate-900 shadow' : 'hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Paquetes & Geografía
                    </button>
                    <button
                      onClick={() => setActiveTab('reportes')}
                      className={`w-full text-left text-xs font-bold py-2.5 px-3 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                        activeTab === 'reportes' ? 'bg-white text-slate-900 shadow' : 'hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <BarChart4 className="w-3.5 h-3.5" />
                      BI & Reportes de Entrega
                    </button>
                  </>
                )}

                {/* 2. AGENT TABS */}
                {session.rol === 'Agente' && (
                  <>
                    <button
                      onClick={() => setActiveTab('operativo')}
                      className={`w-full text-left text-xs font-bold py-2.5 px-3 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                        activeTab === 'operativo' ? 'bg-white text-slate-900 shadow' : 'hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Asignar Reservas & Sillas
                    </button>
                    <button
                      onClick={() => setActiveTab('reportes')}
                      className={`w-full text-left text-xs font-bold py-2.5 px-3 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                        activeTab === 'reportes' ? 'bg-white text-slate-900 shadow' : 'hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <BarChart4 className="w-3.5 h-3.5" />
                      Visualizar Reportes
                    </button>
                  </>
                )}

                {/* 3. CLIENT TABS */}
                {session.rol === 'Cliente' && (
                  <>
                    <button
                      onClick={() => setActiveTab('cliente-portal')}
                      className={`w-full text-left text-xs font-bold py-2.5 px-3 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                        activeTab === 'cliente-portal' ? 'bg-white text-slate-900 shadow' : 'hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5" />
                      Mi Portal de Reservas
                    </button>
                  </>
                )}
              </nav>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-3">
              <button
                onClick={handleLogout}
                className="w-full text-left text-xs hover:text-white flex items-center gap-2 text-slate-500 font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                Cerrar Sesión (Signout)
              </button>
              <p className="text-[9px] text-slate-600 font-mono text-center">Aerounivalle DB Project v1.0</p>
            </div>
          </aside>

          {/* MASTER CONTENT SHELL */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* TOP BAR BRAND STATUS */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs bg-slate-100 text-slate-800 font-mono px-2 py-0.5 rounded">
                  2026-06-14 UTC
                </span>
                <span className="text-slate-300 font-light">|</span>
                <span className="text-xs text-slate-600 capitalize">
                  Conectado como <strong className="text-slate-800">{session.rol}</strong>
                </span>
              </div>

              {/* Database Configurator details */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-150 text-xs">
                  <span className={`w-2 h-2 rounded-full ${dbConnectionActive ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500 animate-pulse'}`} />
                  <span className="text-slate-600 font-medium text-[11px]">
                    {dbConnectionActive ? 'Supabase conectado' : 'Operando en LocalStorage síncrona'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSupabaseModalOpen(true)}
                  className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  title="Configurar Supabase"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Conexión DB API
                </button>
              </div>
            </header>

            {/* LIVE DATA CONTAINER VIEW */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto">
              {renderTabContent()}
            </div>
          </main>
        </div>
      )}

      {/* SQL & CONFIG UTILITIES DRAWER / MODAL */}
      <SupabaseModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
        onConfigChanged={() => setDbStateTrigger(prev => prev + 1)}
      />
    </div>
  );
}
