import React, { useState, useMemo } from 'react';
import dbService from '../db/localDatabase';
import { Vuelo, Cliente, Reserva, Tiquete, PaqueteTuristico, Ciudad, HistorialEstadoReserva } from '../types';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  User, 
  History, 
  Compass, 
  Map, 
  Briefcase,
  Ticket
} from 'lucide-react';

interface ClienteReservasProps {
  currentClient: Cliente;
}

export default function ClienteReservas({ currentClient }: ClienteReservasProps) {
  const [activeTab, setActiveTab] = useState<'nueva' | 'historial' | 'perfil'>('nueva');

  // Datastore loads
  const [vuelos] = useState<Vuelo[]>(() => dbService.getVuelos());
  const [ciudades] = useState<Ciudad[]>(() => dbService.getCiudades());
  const [paquetes] = useState<PaqueteTuristico[]>(() => dbService.getPaquetesTuristicos().filter(p => p.estado === 'Disponible'));
  const [reservas, setReservas] = useState<Reserva[]>(() => 
    dbService.getReservas().filter(r => r.id_cliente === currentClient.id_cliente)
  );
  const [allTiquetes, setAllTiquetes] = useState<Tiquete[]>(() => dbService.getTiquetes());
  const [allHistorial, setAllHistorial] = useState<HistorialEstadoReserva[]>(() => dbService.getHistorialEstados());

  const refreshMyData = () => {
    setReservas(dbService.getReservas().filter(r => r.id_cliente === currentClient.id_cliente));
    setAllTiquetes(dbService.getTiquetes());
    setAllHistorial(dbService.getHistorialEstados());
  };

  // ==========================================
  // NEW BOOKING WIZARD PROCESS STATE
  // ==========================================
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedVuelo, setSelectedVuelo] = useState<Vuelo | null>(null);

  // Seat variables
  const [ticketCount, setTicketCount] = useState(1);
  const [passengerDetails, setPassengerDetails] = useState<{ asiento: string; clase: 'Económica' | 'Ejecutiva' | 'Primera clase' }[]>([
    { asiento: '12A', clase: 'Económica' }
  ]);

  // Packages attachments
  const [selectedPaquetesIds, setSelectedPaquetesIds] = useState<number[]>([]);

  // Feedback states
  const [errorBooking, setErrorBooking] = useState('');
  const [successBooking, setSuccessBooking] = useState('');

  // Cancel form popup variables
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [causaCancelacion, setCausaCancelacion] = useState('');

  // Helpers maps
  const cityMap = useMemo(() => {
    const m: { [id: number]: string } = {};
    ciudades.forEach(c => { m[c.id_ciudad] = c.nombre; });
    return m;
  }, [ciudades]);

  // Handle passenger ticket inputs updates
  const handleTicketDetailsChange = (index: number, field: 'asiento' | 'clase', value: string) => {
    const updated = [...passengerDetails];
    if (field === 'asiento') {
      updated[index].asiento = value.toUpperCase();
    } else {
      updated[index].clase = value as any;
    }
    setPassengerDetails(updated);
  };

  const handleTicketCountChange = (count: number) => {
    setTicketCount(count);
    const updated = Array.from({ length: count }, (_, idx) => {
      if (passengerDetails[idx]) return passengerDetails[idx];
      const defaultAsientos = ['12A', '12B', '12C', '14A', '15F', '1A', '2B'];
      return {
        asiento: defaultAsientos[idx] || `${12 + idx}K`,
        clase: 'Económica' as const
      };
    });
    setPassengerDetails(updated);
  };

  const currentEstimatedPrice = useMemo(() => {
    if (!selectedVuelo) return 0;
    const base = selectedVuelo.precio_base;
    let sum = 0;
    passengerDetails.forEach(p => {
      if (p.clase === 'Económica') sum += base;
      else if (p.clase === 'Ejecutiva') sum += base * 1.5;
      else if (p.clase === 'Primera clase') sum += base * 2.2;
    });

    const packagesSum = paquetes
      .filter(p => selectedPaquetesIds.includes(p.id_paquete))
      .reduce((acc, p) => acc + p.precio, 0);

    return sum + packagesSum;
  }, [selectedVuelo, passengerDetails, selectedPaquetesIds, paquetes]);

  const handleSelectVuelo = (v: Vuelo) => {
    setSelectedVuelo(v);
    setWizardStep(2);
    // Reset seats
    setPassengerDetails([{ asiento: '12A', clase: 'Económica' }]);
    setTicketCount(1);
    setSelectedPaquetesIds([]);
    setErrorBooking('');
    setSuccessBooking('');
  };

  const handleCreateBooking = () => {
    if (!selectedVuelo) return;
    setErrorBooking('');
    setSuccessBooking('');

    // Precalculate pricing details for tickets
    const tiquetesData = passengerDetails.map(p => {
      let finalPrice = selectedVuelo.precio_base;
      if (p.clase === 'Ejecutiva') finalPrice *= 1.5;
      else if (p.clase === 'Primera clase') finalPrice *= 2.2;
      return {
        numero_asiento: p.asiento,
        clase: p.clase,
        precio_final: finalPrice
      };
    });

    const valResult = dbService.createReserva(
      currentClient.id_cliente,
      selectedVuelo.cod_vuelo,
      tiquetesData,
      selectedPaquetesIds
    );

    if (valResult.success) {
      setSuccessBooking(valResult.message);
      refreshMyData();
      // Go to history tab
      setTimeout(() => {
        setWizardStep(1);
        setSelectedVuelo(null);
        setActiveTab('historial');
      }, 1500);
    } else {
      setErrorBooking(valResult.message);
    }
  };

  // Cancel reservation
  const initCancelBooking = (bookingId: number) => {
    setCancellingBookingId(bookingId);
    setCausaCancelacion('');
  };

  const handleConfirmCancelBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingBookingId) return;

    if (!causaCancelacion.substring(0, 300).trim()) {
      alert('Especifique una causa válida de cancelación.');
      return;
    }

    // Update reservation state to "Cancelada" (id_estado = 3)
    dbService.updateEstadoReserva(cancellingBookingId, 3, causaCancelacion.trim());
    refreshMyData();
    setCancellingBookingId(null);
    alert('Reserva Cancelada con éxito. Se ha registrado la causa en el historial de eventos.');
  };

  return (
    <div className="space-y-6">
      {/* Client Subnavigation tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('nueva')}
          className={`py-3 px-5 text-xs font-bold leading-none border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'nueva'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Nueva Reserva de Vuelo
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          className={`py-3 px-5 text-xs font-bold leading-none border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'historial'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Mi Historial de Reservas ({reservas.length})
        </button>
        <button
          onClick={() => setActiveTab('perfil')}
          className={`py-3 px-5 text-xs font-bold leading-none border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'perfil'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Mi Perfil de Pasajero
        </button>
      </div>

      {activeTab === 'nueva' && (
        <div className="space-y-6">
          {wizardStep === 1 ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                <Plane className="w-5 h-5 text-slate-700 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Pistas de vuelo disponibles</h3>
                  <p className="text-[10px] text-slate-500">Seleccione una de las siguientes naves registradas para proceder con la asignación de tiquetes.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vuelos.filter(v => v.estado === 'Programado' || v.estado === 'Abordando').map(v => (
                  <div key={v.cod_vuelo} className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs hover:border-slate-900 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                          {v.cod_vuelo}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Tarifa Base: ${v.precio_base.toLocaleString('es-CO')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-3">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Origen</p>
                          <p className="font-serif font-bold text-slate-900 text-base">{cityMap[v.id_ciudad_origen]}</p>
                        </div>
                        <Plane className="w-4 h-4 text-slate-300" />
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Destino</p>
                          <p className="font-serif font-bold text-slate-900 text-base">{cityMap[v.id_ciudad_destino]}</p>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-slate-500">
                        <div className="flex justify-between">
                          <span>Salida:</span>
                          <span className="font-medium text-slate-800">
                            {new Date(v.fecha_hora_salida).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Aterrizaje:</span>
                          <span className="font-medium text-slate-800">
                            {new Date(v.fecha_hora_llegada).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectVuelo(v)}
                      className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer"
                    >
                      Reservar Este Vuelo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Wizard steps details */}
              <div className="lg:col-span-2 space-y-6">
                {/* WIZARD HEADER */}
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-900 text-white font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {wizardStep}
                    </span>
                    <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      {wizardStep === 2 ? 'Especificar Tiquetes y Asientos' : 'Servicios de Hospedaje Opcionales'}
                    </span>
                  </div>
                  <button
                    onClick={() => setWizardStep(1)}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-800 cursor-pointer"
                  >
                    Volver a Vuelos
                  </button>
                </div>

                {wizardStep === 2 && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">¿Cuántos tiquetes desea reservar?</label>
                      <select
                        className="bg-slate-50 border border-slate-200 text-sm p-3 rounded-lg focus:outline-none w-32 font-bold cursor-pointer"
                        value={ticketCount}
                        onChange={e => handleTicketCountChange(Number(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Tiquete{n > 1 ? 's' : ''}</option>)}
                      </select>
                    </div>

                    <div className="space-y-4">
                      {passengerDetails.map((p, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                            <Ticket className="w-4 h-4 text-slate-400" /> Tiquete #{idx + 1}
                          </span>

                          <div>
                            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Clase del Asiento</label>
                            <select
                              className="bg-white border border-slate-200 text-xs p-2 rounded-lg cursor-pointer w-full focus:outline-none"
                              value={p.clase}
                              onChange={e => handleTicketDetailsChange(idx, 'clase', e.target.value)}
                            >
                              <option value="Económica">Económica (Tarifa base)</option>
                              <option value="Ejecutiva">Ejecutiva (1.5x Base)</option>
                              <option value="Primera clase">Primera clase (2.2x Base)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Número de Asiento</label>
                            <input
                              type="text"
                              maxLength={5}
                              placeholder="Ej. 12A"
                              className="bg-white border border-slate-200 text-xs p-2 rounded-lg w-full text-center uppercase font-mono"
                              value={p.asiento}
                              onChange={e => handleTicketDetailsChange(idx, 'asiento', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setWizardStep(3)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                    >
                      Continuar a Paquetes Turísticos
                    </button>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">Adquirir Paquetes Turísticos Adicionales para tu Destino</h4>
                      <p className="text-slate-400 text-xs">Ahorra hasta un 25% reservando hotel, traslados o tours en conjunto con tu tiquete.</p>
                    </div>

                    <div className="space-y-3">
                      {paquetes.map(p => {
                        const active = selectedPaquetesIds.includes(p.id_paquete);
                        return (
                          <div 
                            key={p.id_paquete} 
                            onClick={() => {
                              setSelectedPaquetesIds(prev => 
                                prev.includes(p.id_paquete) 
                                  ? prev.filter(id => id !== p.id_paquete) 
                                  : [...prev, p.id_paquete]
                              );
                            }}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                              active ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-150 bg-slate-50/50 hover:bg-slate-50'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={active} 
                              readOnly 
                              className="mt-1 shrink-0 accent-indigo-600" 
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h5 className="font-bold text-xs text-slate-900">{p.nombre}</h5>
                                <span className="font-mono font-bold text-xs text-indigo-600">
                                  ${p.precio.toLocaleString('es-CO')}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1">{p.descripcion}</p>
                              <span className="text-[9px] bg-slate-250 text-slate-600 px-2 py-0.5 rounded mt-2 inline-block">
                                Sector: {p.sector_destino}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setWizardStep(2)}
                        className="flex-1 bg-slate-55 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                      >
                        Atrás
                      </button>
                      <button
                        onClick={handleCreateBooking}
                        className="flex-1 bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
                      >
                        Confirmar y Finalizar Reserva
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ESTIMATED CART SIDEBAR */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between h-fit space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">
                    Resumen de Compra
                  </h4>

                  {selectedVuelo && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Ruta de Vuelo ({selectedVuelo.cod_vuelo})</p>
                        <p className="text-sm font-bold text-slate-800">
                          {cityMap[selectedVuelo.id_ciudad_origen]} a {cityMap[selectedVuelo.id_ciudad_destino]}
                        </p>
                      </div>

                      <div className="text-xs text-slate-500 space-y-1 bg-white p-3 rounded-xl border border-slate-100">
                        <div className="flex justify-between">
                          <span>N° Tiquetes:</span>
                          <span className="font-bold text-slate-800">{ticketCount}</span>
                        </div>
                        {passengerDetails.map((p, idx) => (
                          <div key={idx} className="flex justify-between text-[10px] pl-2 border-l border-slate-200">
                            <span>Silla {p.asiento}:</span>
                            <span>{p.clase}</span>
                          </div>
                        ))}
                      </div>

                      {selectedPaquetesIds.length > 0 && (
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase mb-1">Paquetes Turísticos Adicionales</p>
                          <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-100">
                            {paquetes.filter(p => selectedPaquetesIds.includes(p.id_paquete)).map(p => (
                              <div key={p.id_paquete} className="flex justify-between text-[10px]">
                                <span className="truncate max-w-[120px]">{p.nombre}</span>
                                <span className="font-bold">${p.precio.toLocaleString('es-CO')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Valor Total Estimado:</span>
                    <span className="text-xl font-bold font-mono text-indigo-700">
                      ${currentEstimatedPrice.toLocaleString('es-CO')}
                    </span>
                  </div>

                  {errorBooking && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[10px] p-2.5 rounded-lg mb-2 flex items-start gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{errorBooking}</span>
                    </div>
                  )}

                  {successBooking && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] p-2.5 rounded-lg mb-2 flex items-start gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{successBooking}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'historial' && (
        <div className="space-y-4">
          {reservas.length > 0 ? (
            <div className="space-y-4">
              {reservas.map(r => {
                const tiquetesIds = allTiquetes.filter(t => t.id_reserva === r.id_reserva);
                const histories = allHistorial.filter(h => h.id_reserva === r.id_reserva);
                
                return (
                  <div key={r.id_reserva} className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all">
                    {/* Header bar reservation */}
                    <div className="bg-slate-900 text-white p-4 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-xs uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded">
                          Reserva #{r.id_reserva}
                        </span>
                        <span className="text-slate-400 text-xs">
                          Fecha: {new Date(r.fecha_hora_reserva).toLocaleString('es-CO')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                          r.id_estado === 1 ? 'bg-sky-500 text-white' :
                          r.id_estado === 2 ? 'bg-emerald-500 text-white' :
                          r.id_estado === 3 ? 'bg-rose-600 text-white' :
                          'bg-slate-500 text-white'
                        }`}>
                          {r.id_estado === 1 ? 'Reservada' :
                           r.id_estado === 2 ? 'Confirmada (Pagada)' :
                           r.id_estado === 3 ? 'Cancelada' : 'Expirada'}
                        </span>

                        {r.id_estado === 1 && (
                          <button
                            onClick={() => initCancelBooking(r.id_reserva)}
                            className="bg-transparent hover:bg-white/10 border border-white/20 text-rose-300 hover:text-white font-bold text-[10px] py-1 px-2.5 rounded cursor-pointer transition-colors"
                          >
                            Retractarse / Cancelar
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content reservation */}
                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Información del Vuelo ({r.cod_vuelo})</span>
                        <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-1 text-xs">
                          <p className="font-bold text-slate-800">
                            {cityMap[vuelos.find(v => v.cod_vuelo === r.cod_vuelo)?.id_ciudad_origen || 0]} a{' '}
                            {cityMap[vuelos.find(v => v.cod_vuelo === r.cod_vuelo)?.id_ciudad_destino || 0]}
                          </p>
                          <p className="text-slate-500">
                            Salida: {new Date(vuelos.find(v => v.cod_vuelo === r.cod_vuelo)?.fecha_hora_salida || '').toLocaleString('es-CO')}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Tiquetes expedidos ({tiquetesIds.length})</span>
                        <div className="space-y-1.5 max-h-24 overflow-y-auto">
                          {tiquetesIds.map(t => (
                            <div key={t.id_tiquete} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg">
                              <span className="font-semibold font-mono">Asiento: {t.numero_asiento}</span>
                              <span className="font-medium text-slate-500">{t.clase}</span>
                              <span className="font-bold text-slate-900">${t.precio_final.toLocaleString('es-CO')}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Billing de Transacción</span>
                          <span className="text-xl font-bold font-mono text-slate-900 block mt-1">
                            ${Number(r.valor_total).toLocaleString('es-CO')}
                          </span>
                        </div>

                        {/* Audit state log updates */}
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Log de Auditoría (Postgres Trigger)</span>
                          <div className="text-[10px] space-y-1 text-slate-500 max-h-20 overflow-y-auto border-l-2 border-slate-200 pl-2">
                            {histories.map(h => (
                              <div key={h.id_historial}>
                                ⏱️ {h.id_estado === 1 ? 'Creada' : h.id_estado === 2 ? 'Verificada' : h.id_estado === 3 ? 'Anulada' : 'Caducada'} el{' '}
                                {new Date(h.fecha_hora_cambio).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Show cancelled reasons if available */}
                    {r.causa_cancelacion && (
                      <div className="bg-rose-50/50 p-3.5 border-t border-rose-100 text-[11px] text-rose-850 italic">
                        <strong>Motivo registrado de anulación:</strong> "{r.causa_cancelacion}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-8 text-center rounded-2xl border border-slate-100 text-slate-400 text-xs">
              Usted no posee compras o reservaciones activas registradas en su cédula ({currentClient.id_cliente}).
            </div>
          )}
        </div>
      )}

      {activeTab === 'perfil' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 border-r border-slate-100 pr-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center text-lg font-bold">
              {currentClient.nombre.substring(0, 1)}{currentClient.apellidos.substring(0, 1)}
            </div>
            <h4 className="font-serif font-bold text-slate-900 text-base mt-3">{currentClient.nombre} {currentClient.apellidos}</h4>
            <span className="text-xs bg-slate-150 text-slate-600 px-2 py-0.5 rounded-full mt-1.5 font-bold">Pasajero {currentClient.id_cliente}</span>
            <p className="text-[11px] text-slate-400 mt-2">Status: Cliente Registrado en Univalle Base de Datos</p>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Detalles Demográficos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Identificación (PK CC)</span>
                <span className="font-bold text-slate-900">{currentClient.id_cliente}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Email Unico</span>
                <span className="font-bold text-slate-900">{currentClient.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Ciudad Residencia</span>
                <span className="font-bold text-slate-900">{cityMap[currentClient.id_ciudad] || 'Cali'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Contacto Directo</span>
                <span className="font-bold text-slate-900">{currentClient.telefono_principal}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Dirección Física</span>
                <span className="font-bold text-slate-900">{currentClient.direccion}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL POPUP */}
      {cancellingBookingId !== null && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-45">
          <div className="bg-white rounded-2xl border border-rose-100 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-rose-600 text-white p-4 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Cancelación de Reserva #{cancellingBookingId}
            </div>

            <form onSubmit={handleConfirmCancelBooking} className="p-5 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Cada reserva cancelada requiere ingresar una justificación síncrona que será auditada por el personal administrativo.
              </p>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Escriba el Motivo de Cancelación
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ej. Cambio de planes personales de salud. El cliente solicita devolución según las políticas comerciales."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                  value={causaCancelacion}
                  onChange={e => setCausaCancelacion(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCancellingBookingId(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 rounded-xl cursor-pointer"
                >
                  Regresar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 rounded-xl cursor-pointer"
                >
                  Efectuar Cancelación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
