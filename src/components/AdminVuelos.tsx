import React, { useState, useMemo } from 'react';
import dbService from '../db/localDatabase';
import { Vuelo, Ciudad } from '../types';
import { Plus, Edit2, Trash2, ShieldAlert, Plane, Info, X, Check } from 'lucide-react';

export default function AdminVuelos() {
  const [vuelos, setVuelos] = useState<Vuelo[]>(() => dbService.getVuelos());
  const [ciudades] = useState<Ciudad[]>(() => dbService.getCiudades());

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customError, setCustomError] = useState('');
  const [customSuccess, setCustomSuccess] = useState('');

  // Fields
  const [codVuelo, setCodVuelo] = useState('');
  const [origenId, setOrigenId] = useState<number>(0);
  const [destinoId, setDestinoId] = useState<number>(0);
  const [salida, setSalida] = useState('');
  const [llegada, setLlegada] = useState('');
  const [capacidad, setCapacidad] = useState<number>(150);
  const [precio, setPrecio] = useState<number>(300000);
  const [estado, setEstado] = useState<'Programado' | 'Abordando' | 'En vuelo' | 'Finalizado' | 'Cancelado'>('Programado');

  const refetch = () => {
    setVuelos(dbService.getVuelos());
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCustomError('');
    setCustomSuccess('');
    setCodVuelo('');
    setOrigenId(ciudades[0]?.id_ciudad || 0);
    setDestinoId(ciudades[1]?.id_ciudad || 0);
    setSalida('');
    setLlegada('');
    setCapacidad(150);
    setPrecio(300000);
    setEstado('Programado');
    setIsModalOpen(true);
  };

  const openEditModal = (v: Vuelo) => {
    setIsEditing(true);
    setCustomError('');
    setCustomSuccess('');
    setCodVuelo(v.cod_vuelo);
    setOrigenId(v.id_ciudad_origen);
    setDestinoId(v.id_ciudad_destino);
    // Format to datetime-local friendly format
    setSalida(v.fecha_hora_salida.substring(0, 16));
    setLlegada(v.fecha_hora_llegada.substring(0, 16));
    setCapacidad(v.capacidad_total);
    setPrecio(v.precio_base);
    setEstado(v.estado);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');
    setCustomSuccess('');

    if (!codVuelo.trim()) {
      setCustomError('Debe ingresar un código de vuelo único.');
      return;
    }
    if (origenId === destinoId) {
      setCustomError('La ciudad origen y la ciudad destino no pueden ser iguales.');
      return;
    }
    if (new Date(llegada) <= new Date(salida)) {
      setCustomError('La fecha de llegada debe ser estrictamente posterior a la fecha de salida.');
      return;
    }
    if (capacidad <= 0) {
      setCustomError('La capacidad del avión debe ser un entero positivo mayor a cero.');
      return;
    }
    if (precio < 0) {
      setCustomError('El precio base debe ser mayor o igual a cero.');
      return;
    }

    if (isEditing) {
      // Update flight
      const ok = dbService.updateVuelo(codVuelo, {
        id_ciudad_origen: origenId,
        id_ciudad_destino: destinoId,
        fecha_hora_salida: new Date(salida).toISOString(),
        fecha_hora_llegada: new Date(llegada).toISOString(),
        capacidad_total: capacidad,
        precio_base: precio,
        estado: estado
      });
      if (ok) {
        setCustomSuccess('Vuelo modificado correctamente en la base de datos.');
        refetch();
        setTimeout(() => setIsModalOpen(false), 1000);
      } else {
        setCustomError('Ocurrió un error al intentar guardar los cambios.');
      }
    } else {
      // Register new flight
      const res = dbService.createVuelo({
        cod_vuelo: codVuelo.trim().toUpperCase(),
        id_ciudad_origen: origenId,
        id_ciudad_destino: destinoId,
        fecha_hora_salida: new Date(salida).toISOString(),
        fecha_hora_llegada: new Date(llegada).toISOString(),
        capacidad_total: capacidad,
        precio_base: precio,
        estado: estado
      });

      if (res.success) {
        setCustomSuccess(res.message);
        refetch();
        setTimeout(() => setIsModalOpen(false), 1000);
      } else {
        setCustomError(res.message);
      }
    }
  };

  const handleDelete = (cod: string) => {
    if (window.confirm(`¿Está seguro de eliminar el vuelo ${cod}? Esta acción alterará permanentemente las llaves referencias.`)) {
      const res = dbService.deleteVuelo(cod);
      alert(res.message);
      if (res.success) {
        refetch();
      }
    }
  };

  // Helper arrays/maps to extract city names
  const cityMap = useMemo(() => {
    const m: { [id: number]: string } = {};
    ciudades.forEach(c => {
      m[c.id_ciudad] = c.nombre;
    });
    return m;
  }, [ciudades]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Plane className="w-5 h-5 text-slate-800" />
            Catálogo y Gestión de Vuelos
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">Define vuelos nacionales e internacionales con tarifas y capacidades de flota.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Registrar Vuelo
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-xs">
        <table className="w-full text-xs text-left text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Cod Vuelo</th>
              <th className="py-3 px-4">Origen</th>
              <th className="py-3 px-4">Destino</th>
              <th className="py-3 px-4">Salida</th>
              <th className="py-3 px-4">Llegada</th>
              <th className="py-3 px-4 text-center">Capacidad</th>
              <th className="py-3 px-4 text-right">Precio Base ($)</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-center">Operaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vuelos.length > 0 ? (
              vuelos.map(v => (
                <tr key={v.cod_vuelo} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{v.cod_vuelo}</td>
                  <td className="py-3 px-4">{cityMap[v.id_ciudad_origen] || `ID: ${v.id_ciudad_origen}`}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{cityMap[v.id_ciudad_destino] || `ID: ${v.id_ciudad_destino}`}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(v.fecha_hora_salida).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(v.fecha_hora_llegada).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-4 text-center font-bold">{v.capacidad_total} pax</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                    ${Number(v.precio_base).toLocaleString('es-CO')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      v.estado === 'Programado' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                      v.estado === 'Abordando' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      v.estado === 'En vuelo' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      v.estado === 'Finalizado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {v.estado}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => openEditModal(v)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
                        title="Modificar Vuelo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.cod_vuelo)}
                        className="p-1 hover:bg-rose-50 rounded text-rose-400 hover:text-rose-600 transition-all cursor-pointer"
                        title="Eliminar Vuelo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 font-sans">
                  No hay programaciones de vuelo registradas. Haz clic en "Registrar Vuelo" para agregar uno.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-lg w-full overflow-hidden shadow-xl flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                <Plane className="w-4 h-4 text-sky-400" />
                {isEditing ? 'Formulario de Modificación' : 'Formulario de Registro'}
              </span>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1 hover:bg-white/10 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
              {/* Alert Feedback */}
              {customError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{customError}</span>
                </div>
              )}
              {customSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{customSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Código de Vuelo</label>
                  <input
                    type="text"
                    disabled={isEditing}
                    placeholder="Ej. AV4100"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 uppercase font-mono disabled:bg-slate-100"
                    value={codVuelo}
                    onChange={e => setCodVuelo(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Estado de Operación</label>
                  <select
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer bg-white"
                    value={estado}
                    onChange={e => setEstado(e.target.value as any)}
                  >
                    <option value="Programado">Programado</option>
                    <option value="Abordando">Abordando</option>
                    <option value="En vuelo">En vuelo</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Ciudad Origen</label>
                  <select
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer bg-white"
                    value={origenId}
                    onChange={e => setOrigenId(Number(e.target.value))}
                  >
                    {ciudades.map(c => (
                      <option key={c.id_ciudad} value={c.id_ciudad}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Ciudad Destino</label>
                  <select
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer bg-white"
                    value={destinoId}
                    onChange={e => setDestinoId(Number(e.target.value))}
                  >
                    {ciudades.map(c => (
                      <option key={c.id_ciudad} value={c.id_ciudad}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Fecha/Hora Salida</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    value={salida}
                    onChange={e => setSalida(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Fecha/Hora Llegada</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    value={llegada}
                    onChange={e => setLlegada(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Capacidad Total (Pax)</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                    value={capacidad}
                    onChange={e => setCapacidad(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Precio Base Tiquete ($)</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                    value={precio}
                    onChange={e => setPrecio(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-xs py-2.5 rounded-xl border border-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-xl shadow-sm cursor-pointer"
                >
                  {isEditing ? 'Guardar Cambios' : 'Crear Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
