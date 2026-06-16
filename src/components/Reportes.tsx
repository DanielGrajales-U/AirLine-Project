import React, { useState, useMemo } from 'react';
import dbService from '../db/localDatabase';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  History, 
  Clock, 
  AlertTriangle,
  Plane,
  Grid,
  TrendingUp,
  Award
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

export default function Reportes() {
  const [activeSubTab, setActiveSubTab] = useState<'comercial' | 'cobertura' | 'operacion' | 'canceladas'>('comercial');

  // Load live DB analytical calculations
  const ingresosData = useMemo(() => dbService.reportIngresosMensualesPorDestino(), []);
  const reservasVueloMesNoMapped = useMemo(() => dbService.reportReservasPorVueloYMes(), []);
  const clientesFrecuentes = useMemo(() => dbService.reportClientesFrecuentes(), []);
  const vuelosDestinos = useMemo(() => dbService.reportVuelosPorDestinosFiltro(), []);
  const sectorDestinos = useMemo(() => dbService.reportDestinosMasVendidosPorSector(), []);
  const cancelaciones = useMemo(() => dbService.reportReservasCanceladasYCausa(), []);
  const tiempoPromedio = useMemo(() => dbService.reportTiempoPromedioConfirmacion(), []);

  // Filter States for Coverage Flight List
  const [filterPais, setFilterPais] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterCity, setFilterCity] = useState('');

  // Extract unique filter lists
  const paisesUnicos = useMemo(() => Array.from(new Set(vuelosDestinos.map(v => v.pais))), [vuelosDestinos]);
  const deptsUnicos = useMemo(() => Array.from(new Set(vuelosDestinos.map(v => v.departamento))), [vuelosDestinos]);
  const ciudadesUnicas = useMemo(() => Array.from(new Set(vuelosDestinos.map(v => v.destino))), [vuelosDestinos]);

  const filteredVuelos = useMemo(() => {
    return vuelosDestinos.filter(v => {
      return (
        (!filterPais || v.pais === filterPais) &&
        (!filterDept || v.departamento === filterDept) &&
        (!filterCity || v.destino === filterCity)
      );
    });
  }, [vuelosDestinos, filterPais, filterDept, filterCity]);

  // Color arrays for Recharts Pie
  const COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];

  // Map data to simpler keys for easier charting
  const formattedIngresos = useMemo(() => {
    return ingresosData.map(item => ({
      name: `${item.destino} (${item.mes})`,
      Ingresos: item.ingresos
    }));
  }, [ingresosData]);

  const formattedReservasMes = useMemo(() => {
    return reservasVueloMesNoMapped.map(item => ({
      VueloMes: `${item.cod_vuelo} [${item.mes}]`,
      Reservas: item.cantidad
    }));
  }, [reservasVueloMesNoMapped]);

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Ingresos Confirmados</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">
              ${ingresosData.reduce((acc, i) => acc + i.ingresos, 0).toLocaleString('es-CO')}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">Suma total de carritos consolidados en reservas confirmadas</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Clientes con Registros</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{clientesFrecuentes.length}</span>
            <p className="text-[10px] text-slate-400 mt-1">Pasajeros registrados en la base de datos nacional</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Tiempo Prom. Confirmar</span>
            <Clock className="w-5 h-5 text-violet-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{tiempoPromedio.promedioMinutos} min</span>
            <p className="text-[10px] text-slate-400 mt-1">
              Promedio calculado entre {tiempoPromedio.cantidadReservasAnalizadas} reservas pagadas
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs font-sans">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Reservas Canceladas</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{cancelaciones.length}</span>
            <p className="text-[10px] text-slate-400 mt-1">Con causas de anulación e impagos registrados</p>
          </div>
        </div>
      </div>

      {/* Navigation for report categories */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('comercial')}
          className={`py-3 px-5 text-xs font-bold leading-none border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'comercial'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Reportes Comerciales
        </button>
        <button
          onClick={() => setActiveSubTab('cobertura')}
          className={`py-3 px-5 text-xs font-bold leading-none border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'cobertura'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Destinos e Infraestructura
        </button>
        <button
          onClick={() => setActiveSubTab('operacion')}
          className={`py-3 px-5 text-xs font-bold leading-none border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'operacion'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Plane className="w-3.5 h-3.5" />
          Operación de Vuelo y Frecuencias
        </button>
        <button
          onClick={() => setActiveSubTab('canceladas')}
          className={`py-3 px-5 text-xs font-bold leading-none border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'canceladas'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Reservas Canceladas y Causa
        </button>
      </div>

      {/* Report 1: tabs-based details container */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-xs">
        {activeSubTab === 'comercial' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-slate-700" />
                Ingresos Mensuales Consolidados por Destino
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Visualización agrupada de ingresos netos mensuales considerando únicamente boletos y paquetes turísticos de reservas confirmadas.
              </p>
            </div>

            <div className="h-72 w-full">
              {formattedIngresos.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formattedIngresos}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tickFormater={(v: any) => `$${v / 1000}k`} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString('es-CO')}`, 'Ingresos']} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="Ingresos" fill="#0f172a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No hay ventas confirmadas asentadas para graficar ingresos.
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-slate-700" />
                Tabla de Clientes Frecuentes y Lealtad
              </h3>
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Identificación</th>
                      <th className="py-3 px-4">Nombre Completo</th>
                      <th className="py-3 px-4 text-center">Cantidad Reservas</th>
                      <th className="py-3 px-4 text-right">Inversión Estimada</th>
                      <th className="py-3 px-4 text-center">Nivel de Lealtad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientesFrecuentes.length > 0 ? (
                      clientesFrecuentes.map((cf, idx) => (
                        <tr key={cf.id_cliente} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-mono">{cf.id_cliente}</td>
                          <td className="py-3 px-4 font-medium text-slate-900">{cf.nombre_completo}</td>
                          <td className="py-3 px-4 text-center font-bold">{cf.cantidad_reservas}</td>
                          <td className="py-3 px-4 text-right font-medium text-slate-900">
                            ${cf.total_invertido.toLocaleString('es-CO')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              idx === 0 
                                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                : cf.cantidad_reservas >= 2 
                                  ? 'bg-slate-100 text-slate-800' 
                                  : 'bg-slate-100 text-slate-500'
                            }`}>
                              {idx === 0 ? '🏆 Elite Premium' : cf.cantidad_reservas >= 2 ? 'Viajero Frecuente' : 'Básico'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400">No se registran transacciones.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'cobertura' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-slate-700" />
                  Listado de Cobertura Geográfica y Destinos de Vuelo
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Inventario físico de rutas enlazando Países, Departamentos y Ciudades de aterrizaje.
                </p>
              </div>

              {/* Advanced Filter Widgets */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <select
                  value={filterPais}
                  onChange={e => setFilterPais(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-[11px] p-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="">Filtrar País</option>
                  {paisesUnicos.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                <select
                  value={filterDept}
                  onChange={e => setFilterDept(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-[11px] p-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="">Filtrar Estado/Dept</option>
                  {deptsUnicos.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <select
                  value={filterCity}
                  onChange={e => setFilterCity(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-[11px] p-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="">Filtrar Ciudad</option>
                  {ciudadesUnicas.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {(filterPais || filterDept || filterCity) && (
                  <button 
                    onClick={() => { setFilterPais(''); setFilterDept(''); setFilterCity(''); }}
                    className="text-[10px] text-rose-600 font-bold hover:underline px-2 cursor-pointer"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Coverage list */}
              <div className="md:col-span-2 overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Cod Vuelo</th>
                      <th className="py-3 px-4">Origen</th>
                      <th className="py-3 px-4">Ciudad Destino</th>
                      <th className="py-3 px-4">Departamento/Estado</th>
                      <th className="py-3 px-4">País</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVuelos.length > 0 ? (
                      filteredVuelos.map(v => (
                        <tr key={v.cod_vuelo} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900 font-mono">{v.cod_vuelo}</td>
                          <td className="py-3 px-4">{v.origen}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{v.destino}</td>
                          <td className="py-3 px-4 text-slate-500">{v.departamento}</td>
                          <td className="py-3 px-4 text-slate-500">{v.pais}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              v.estado === 'Programado' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                              v.estado === 'Finalizado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              v.estado === 'Cancelado' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {v.estado}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-slate-400">No hay vuelos de cobertura para el filtro seleccionado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bestselling graphic pie */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Mercado de Ventas por Sector Geográfico</h4>
                  <p className="text-[10px] text-slate-400">Distribución porcentual de tiquetes expedidos por país/sector.</p>
                </div>

                <div className="h-44 w-full my-3 flex items-center justify-center">
                  {sectorDestinos.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sectorDestinos}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={55}
                          fill="#8884d8"
                          dataKey="cantidad_ventas"
                          nameKey="sector"
                        >
                          {sectorDestinos.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-[11px] text-slate-400">Esperando reservas activas...</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {sectorDestinos.map((item, index) => (
                    <div key={item.sector} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                        />
                        <span className="font-medium text-slate-700">{item.sector}</span>
                      </div>
                      <span className="font-bold text-slate-900">{item.cantidad_ventas} reservas</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'operacion' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plane className="w-5 h-5 text-slate-700" />
                Frecuencia y Número de Reservas por Vuelo y por Mes
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Monitorea el volumen de demanda por código de aeronave programada para identificar rutas con mayor tracción operativa.
              </p>
            </div>

            <div className="h-72 w-full">
              {formattedReservasMes.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formattedReservasMes}>
                    <defs>
                      <linearGradient id="colorReservas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="VueloMes" tick={{ fontSize: 9, fill: '#64748b' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="Reservas" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorReservas)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No se registran vuelos con reservas en curso.
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'canceladas' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Auditoría Especial: Log de Reservas Canceladas y Causales
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Historial crítico descriptivo que especifica las justificaciones de retracto o cancelaciones del sistema técnico.
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">ID Reserva</th>
                    <th className="py-3 px-4">Pasajero Titular</th>
                    <th className="py-3 px-4">Cod Vuelo</th>
                    <th className="py-3 px-4">Fecha Transacción</th>
                    <th className="py-3 px-4">Causa de Cancelación registrada en el Sistema</th>
                    <th className="py-3 px-4 text-right">Monto Pérdida ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cancelaciones.length > 0 ? (
                    cancelaciones.map(c => (
                      <tr key={c.id_reserva} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">#{c.id_reserva}</td>
                        <td className="py-3 px-4 font-medium">{c.cliente}</td>
                        <td className="py-3 px-4 font-mono">{c.vuelo}</td>
                        <td className="py-3 px-4 text-slate-500">{new Date(c.fecha_reserva).toLocaleString('es-CO', { dateStyle: 'short' })}</td>
                        <td className="py-3 px-4 text-rose-700 font-medium italic border-l-2 border-rose-300 pl-3">
                          "{c.causa}"
                        </td>
                        <td className="py-3 px-4 text-right font-bold font-mono text-slate-900">
                          ${c.valor_perdido.toLocaleString('es-CO')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">Perfecto: No hay reservas canceladas reportadas en la base de datos nacional.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
