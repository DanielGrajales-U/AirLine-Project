import React, { useState, useMemo } from 'react';
import dbService from '../db/localDatabase';
import { Reserva, Cliente, Vuelo, Tiquete, HistorialEstadoReserva } from '../types';
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Plane, 
  HelpCircle, 
  Clock, 
  Edit, 
  Check, 
  X, 
  ShieldAlert, 
  Info,
  DollarSign,
  Ticket
} from 'lucide-react';

export default function AgenteReservas() {
  const [activeFilter, setActiveFilter] = useState<number | 0>(0); // 0 = Todas

  const [reservas, setReservas] = useState<Reserva[]>(() => dbService.getReservas());
  const [clientes] = useState<Cliente[]>(() => dbService.getClientes());
  const [vuelos] = useState<Vuelo[]>(() => dbService.getVuelos());
  const [allTiquetes, setAllTiquetes] = useState<Tiquete[]>(() => dbService.getTiquetes());
  const [allHistorial, setAllHistorial] = useState<HistorialEstadoReserva[]>(() => dbService.getHistorialEstados());

  // Form states
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [editStatus, setEditStatus] = useState<number>(1);
  const [causa, setCausa] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Seat change states
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [seatTicketId, setSeatTicketId] = useState<number | null>(null);
  const [seatValue, setSeatValue] = useState('');

  const refetch = () => {
    setReservas(dbService.getReservas());
    setAllTiquetes(dbService.getTiquetes());
    setAllHistorial(dbService.getHistorialEstados());
  };

  const getClientLabel = (id: string) => {
    const cli = clientes.find(c => c.id_cliente === id);
    return cli ? `${cli.nombre} ${cli.apellidos} (${id})` : id;
  };

  const getFlightLabel = (cod: string) => {
    const v = vuelos.find(f => f.cod_vuelo === cod);
    return v ? `${cod} (${v.estado})` : cod;
  };

  const filteredReservas = useMemo(() => {
    if (activeFilter === 0) return reservas;
    return reservas.filter(r => r.id_estado === activeFilter);
  }, [reservas, activeFilter]);

  const openStatusModal = (r: Reserva) => {
    setSelectedReserva(r);
    setEditStatus(r.id_estado);
    setCausa(r.causa_cancelacion || '');
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReserva) return;

    if (editStatus === 3 && !causa.substring(0, 300).trim()) {
      alert('Debe justificar la cancelación de la reserva.');
      return;
    }

    dbService.updateEstadoReserva(selectedReserva.id_reserva, editStatus, editStatus === 3 ? causa.trim() : undefined);
    refetch();
    setIsStatusModalOpen(false);
    alert(`Estado de la reserva #${selectedReserva.id_reserva} modificado correctamente.`);
  };

  const openSeatModal = (tId: number, currentSeat: string) => {
    setSeatTicketId(tId);
    setSeatValue(currentSeat);
    setIsSeatModalOpen(true);
  };

  const handleSaveSeat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seatTicketId) return;

    if (!seatValue.trim()) {
      alert('Asiento no puede estar vacío');
      return;
    }

    dbService.updateTiquete(seatTicketId, { numero_asiento: seatValue.toUpperCase().trim() });
    refetch();
    setIsSeatModalOpen(false);
    alert('Asiento reprogramado exitosamente.');
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-800" />
            Consola Operativa de reservas de Aerolínea
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">Control centralizado de tiquetes asignados, depósitos, anulaciones por impago y confirmaciones de check-in.</p>
        </div>

        {/* Quick Filters */}
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button 
            onClick={() => setActiveFilter(0)}
            className={`py-1.5 px-3 rounded cursor-pointer ${activeFilter === 0 ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
          >
            Todas
          </button>
          <button 
            onClick={() => setActiveFilter(1)}
            className={`py-1.5 px-3 rounded cursor-pointer ${activeFilter === 1 ? 'bg-sky-550 bg-sky-100 text-sky-800' : 'text-slate-500'}`}
          >
            Reservadas
          </button>
          <button 
            onClick={() => setActiveFilter(2)}
            className={`py-1.5 px-3 rounded cursor-pointer ${activeFilter === 2 ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500'}`}
          >
            Confirmadas
          </button>
          <button 
            onClick={() => setActiveFilter(3)}
            className={`py-1.5 px-3 rounded cursor-pointer ${activeFilter === 3 ? 'bg-rose-100 text-rose-800' : 'text-slate-500'}`}
          >
            Canceladas
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-xs">
        <table className="w-full text-xs text-left text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Reserva ID</th>
              <th className="py-3 px-4">Titular de Cuenta / Pasajero</th>
              <th className="py-3 px-4">Vuelo Cod</th>
              <th className="py-3 px-4 text-center">Tiquetes & Sillas Asignadas</th>
              <th className="py-3 px-4 text-right">Monto Factura ($)</th>
              <th className="py-3 px-4 text-center">Fecha Reserva</th>
              <th className="py-3 px-4 text-center">Estado actual</th>
              <th className="py-3 px-4 text-center">Asistencias</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReservas.length > 0 ? (
              filteredReservas.map(r => {
                const myTiquetes = allTiquetes.filter(t => t.id_reserva === r.id_reserva);
                return (
                  <tr key={r.id_reserva} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">#{r.id_reserva}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{getClientLabel(r.id_cliente)}</td>
                    <td className="py-3 px-4 font-mono font-bold">{getFlightLabel(r.cod_vuelo)}</td>
                    
                    <td className="py-3 px-4">
                      {/* Ticket seats modifier */}
                      <div className="flex flex-wrap gap-1 justify-center">
                        {myTiquetes.map(t => (
                          <button
                            key={t.id_tiquete}
                            onClick={() => openSeatModal(t.id_tiquete, t.numero_asiento)}
                            className="bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-[10px] font-mono text-slate-800 font-bold flex items-center gap-1 cursor-pointer transition-colors border border-slate-150"
                            title="Haz clic para reasignar este asiento"
                          >
                            <Ticket className="w-2.5 h-2.5 text-slate-400" />
                            {t.numero_asiento} (Edit)
                          </button>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      ${Number(r.valor_total).toLocaleString('es-CO')}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">
                      {new Date(r.fecha_hora_reserva).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        r.id_estado === 1 ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                        r.id_estado === 2 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        r.id_estado === 3 ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-slate-100 text-slate-650'
                      }`}>
                        {r.id_estado === 1 ? 'Reservada' :
                         r.id_estado === 2 ? 'Confirmada (Pagada)' :
                         r.id_estado === 3 ? 'Cancelada' : 'Expirada'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openStatusModal(r)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] py-1 px-2.5 rounded shadow-xs cursor-pointer transition-all inline-flex items-center gap-1"
                      >
                        <Edit className="w-2.5 h-2.5" /> Cambiar Estado
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                  No hay reservas encontradas para el filtro seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* STATUS CHANGER MODAL */}
      {isStatusModalOpen && selectedReserva && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full overflow-hidden shadow-xl flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-400" />
                Cambiar Estado de Reserva #{selectedReserva.id_reserva}
              </span>
              <button 
                onClick={() => setIsStatusModalOpen(false)} 
                className="p-1 hover:bg-white/10 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nombre del Estado</label>
                <select
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-950 bg-white cursor-pointer font-bold"
                  value={editStatus}
                  onChange={e => setEditStatus(Number(e.target.value))}
                >
                  <option value={1}>🔵 Reservada</option>
                  <option value={2}>🟢 Confirmada (Pago Conciliado)</option>
                  <option value={3}>🔴 Cancelada</option>
                  <option value={4}>⚫ Expirada</option>
                </select>
              </div>

              {editStatus === 3 && (
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Justificación de la Cancelación (Causa)</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Escriba aquí la razón. Ej. Desistimiento o problemas de conectividad con la pasarela bancaria..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                    value={causa}
                    onChange={e => setCausa(e.target.value)}
                  />
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs py-2.5 rounded-xl border border-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs cursor-pointer"
                >
                  Confirmar Cambio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEAT MODIFIER MODAL */}
      {isSeatModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-sm w-full overflow-hidden shadow-xl flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center font-bold text-xs uppercase tracking-widest">
              <span>✈️ Reasignación de Asiento</span>
              <button onClick={() => setIsSeatModalOpen(false)} className="cursor-pointer font-bold font-mono">X</button>
            </div>

            <form onSubmit={handleSaveSeat} className="p-5 space-y-3">
              <p className="text-[11px] text-slate-500">Asigne un identificador de cabina de avión válido de 3 caracteres máximo (Ej: 1A, 25F, 12C).</p>
              
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Número de Asiento</label>
                <input
                  type="text"
                  maxLength={5}
                  required
                  placeholder="Ej: 1B"
                  className="w-full text-sm font-bold p-2.5 rounded-lg border border-slate-200 text-center uppercase font-mono bg-slate-50"
                  value={seatValue}
                  onChange={e => setSeatValue(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSeatModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 font-bold text-xs py-2 rounded-lg cursor-pointer text-slate-705"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-lg cursor-pointer"
                >
                  Garantizar Silla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
