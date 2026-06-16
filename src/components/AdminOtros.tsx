import React, { useState } from 'react';
import dbService from '../db/localDatabase';
import { PaqueteTuristico, Pais, Departamento, Ciudad } from '../types';
import { Plus, Edit2, Trash2, MapPin, Sparkles, Building2, Globe, HelpCircle } from 'lucide-react';

export default function AdminOtros() {
  const [activeSegment, setActiveSegment] = useState<'paquetes' | 'geografia'>('paquetes');

  // Load lists
  const [paquetes, setPaquetes] = useState<PaqueteTuristico[]>(() => dbService.getPaquetesTuristicos());
  const [paises, setPaises] = useState<Pais[]>(() => dbService.getPaises());
  const [departamentos, setDepartamentos] = useState<Departamento[]>(() => dbService.getDepartamentos());
  const [ciudades, setCiudades] = useState<Ciudad[]>(() => dbService.getCiudades());

  // Package Form States
  const [paqNombre, setPaqNombre] = useState('');
  const [paqDesc, setPaqDesc] = useState('');
  const [paqSector, setPaqSector] = useState('Cancún');
  const [paqPrecio, setPaqPrecio] = useState<number>(800000);
  const [paqEstado, setPaqEstado] = useState<'Disponible' | 'No disponible'>('Disponible');
  const [editingPaqId, setEditingPaqId] = useState<number | null>(null);

  // Geo Forms States
  const [newPaisName, setNewPaisName] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptPaisId, setNewDeptPaisId] = useState<number>(paises[0]?.id_pais || 1);
  const [newCityName, setNewCityName] = useState('');
  const [newCityDeptId, setNewCityDeptId] = useState<number>(departamentos[0]?.id_departamento || 1);

  // Refetch database contents
  const refetchAll = () => {
    setPaquetes(dbService.getPaquetesTuristicos());
    setPaises(dbService.getPaises());
    setDepartamentos(dbService.getDepartamentos());
    setCiudades(dbService.getCiudades());
  };

  // ==========================================
  // PAQUETES CRUD HANDLERS
  // ==========================================
  const handleSavePaquete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paqNombre.trim()) return;

    if (editingPaqId !== null) {
      dbService.updatePaquete(editingPaqId, {
        nombre: paqNombre.trim(),
        descripcion: paqDesc.trim(),
        sector_destino: paqSector.trim(),
        precio: paqPrecio,
        estado: paqEstado
      });
      setEditingPaqId(null);
    } else {
      dbService.createPaquete({
        id_paquete: 0, // Assigned by database engine
        nombre: paqNombre.trim(),
        descripcion: paqDesc.trim(),
        sector_destino: paqSector.trim(),
        precio: paqPrecio,
        estado: paqEstado
      });
    }

    // Clear form
    setPaqNombre('');
    setPaqDesc('');
    setPaqSector('Cancún');
    setPaqPrecio(800000);
    setPaqEstado('Disponible');
    refetchAll();
  };

  const handleEditPaquete = (p: PaqueteTuristico) => {
    setEditingPaqId(p.id_paquete);
    setPaqNombre(p.nombre);
    setPaqDesc(p.descripcion);
    setPaqSector(p.sector_destino);
    setPaqPrecio(p.precio);
    setPaqEstado(p.estado);
  };

  const handleDeletePaquete = (id: number) => {
    if (window.confirm('¿Desea eliminar este paquete turístico del catálogo?')) {
      const res = dbService.deletePaquete(id);
      alert(res.message);
      refetchAll();
    }
  };

  // ==========================================
  // GEOGRAPHY CREATIONS
  // ==========================================
  const handleAddPais = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaisName.trim()) return;
    dbService.createPais(newPaisName.trim());
    setNewPaisName('');
    refetchAll();
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    dbService.createDepartamento(newDeptName.trim(), newDeptPaisId);
    setNewDeptName('');
    refetchAll();
  };

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    dbService.createCiudad(newCityName.trim(), newCityDeptId);
    setNewCityName('');
    refetchAll();
  };

  // ==========================================
  // GEOGRAPHY DELETIONS (Checking foreign integrity constraints)
  // ==========================================
  const handleDeletePais = (id: number) => {
    const res = dbService.deletePais(id);
    alert(res.message);
    if (res.success) refetchAll();
  };

  const handleDeleteDept = (id: number) => {
    const res = dbService.deleteDepartamento(id);
    alert(res.message);
    if (res.success) refetchAll();
  };

  const handleDeleteCity = (id: number) => {
    const res = dbService.deleteCiudad(id);
    alert(res.message);
    if (res.success) refetchAll();
  };

  return (
    <div className="space-y-6">
      {/* Segment Selector tabs */}
      <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100 max-w-sm">
        <button
          onClick={() => setActiveSegment('paquetes')}
          className={`flex-1 text-center font-bold text-xs py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSegment === 'paquetes'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Paquetes de Hospedaje
        </button>
        <button
          onClick={() => setActiveSegment('geografia')}
          className={`flex-1 text-center font-bold text-xs py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSegment === 'geografia'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Países / Estados / Ciudades
        </button>
      </div>

      {activeSegment === 'paquetes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Write form */}
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl h-fit">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-slate-600" />
              {editingPaqId ? 'Modificar Paquete Turístico' : 'Ingresar Paquete Turístico'}
            </h4>
            <form onSubmit={handleSavePaquete} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Plan Sol y Playa Cancún"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  value={paqNombre}
                  onChange={e => setPaqNombre(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Descripción del Plan</label>
                <textarea
                  rows={3}
                  placeholder="Ej. Hotel All-Inclusive 4 noches + traslados + tours..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white resize-none"
                  value={paqDesc}
                  onChange={e => setPaqDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Destino Aplicable</label>
                  <select
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white cursor-pointer"
                    value={paqSector}
                    onChange={e => setPaqSector(e.target.value)}
                  >
                    <option value="Cancún">Cancún</option>
                    <option value="Miami">Miami</option>
                    <option value="Madrid">Madrid</option>
                    <option value="Bogotá">Bogotá</option>
                    <option value="Cali">Cali</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Precio Compra ($)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono bg-white"
                    value={paqPrecio}
                    onChange={e => setPaqPrecio(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Disponibilidad</label>
                <select
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white cursor-pointer font-semibold text-slate-705"
                  value={paqEstado}
                  onChange={e => setPaqEstado(e.target.value as any)}
                >
                  <option value="Disponible">🟢 Disponible</option>
                  <option value="No disponible">🔴 No disponible</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-lg transition-all cursor-pointer shadow-xs"
                >
                  {editingPaqId ? 'Guardar Cambios' : 'Adicionar Paquete'}
                </button>
                {editingPaqId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPaqId(null);
                      setPaqNombre('');
                      setPaqDesc('');
                      setPaqSector('Cancún');
                      setPaqPrecio(800000);
                      setPaqEstado('Disponible');
                    }}
                    className="bg-white border border-slate-200 text-slate-400 hover:text-slate-600 font-bold text-xs py-2.5 px-3 rounded-lg transition-all cursor-pointer"
                  >
                    Salir
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List packages */}
          <div className="lg:col-span-2 space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-xs">
              <table className="w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Cod</th>
                    <th className="py-3 px-4">Nombre Comercial</th>
                    <th className="py-3 px-4">Destino Sector</th>
                    <th className="py-3 px-4 text-right">Tarifa ($)</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paquetes.length > 0 ? (
                    paquetes.map(p => (
                      <tr key={p.id_paquete} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400">#{p.id_paquete}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">{p.nombre}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{p.descripcion}</p>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{p.sector_destino}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          ${Number(p.precio).toLocaleString('es-CO')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            p.estado === 'Disponible' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {p.estado}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => handleEditPaquete(p)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePaquete(p.id_paquete)}
                              className="p-1 hover:bg-rose-50 rounded text-rose-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">Catálogo vacío.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSegment === 'geografia' && (
        <div className="space-y-6">
          {/* Quick instructions alerts on constraints */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <p>
              <strong>Integridad Referencial Estricta:</strong> El modelo relacional prohíbe eliminar un País si este posee departamentos asociados, o un Departamento si este posee ciudades registradas. Esta jerarquía garantiza la sanidad del software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PAISES GRID */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  Agregar País
                </h4>
                <form onSubmit={handleAddPais} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ej. Brasil"
                    className="flex-1 bg-white border border-slate-200 rounded-lg text-xs p-2 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    value={newPaisName}
                    onChange={e => setNewPaisName(e.target.value)}
                  />
                  <button type="submit" className="bg-slate-900 text-white font-bold p-2 text-xs rounded-lg cursor-pointer hover:bg-slate-800">
                    +
                  </button>
                </form>
              </div>

              <div className="rounded-xl border border-slate-100 p-2 bg-white max-h-64 overflow-y-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 block mb-1">Países Registrados</span>
                <div className="divide-y divide-slate-50">
                  {paises.map(p => (
                    <div key={p.id_pais} className="py-2 px-2 flex justify-between items-center text-xs text-slate-700">
                      <span className="font-medium">{p.nombre}</span>
                      <button 
                        onClick={() => handleDeletePais(p.id_pais)} 
                        className="p-1 text-slate-300 hover:text-rose-600 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DEPARTAMENTOS GRID */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  Agregar Estado/Dept
                </h4>
                <form onSubmit={handleAddDept} className="space-y-2">
                  <select
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none bg-white cursor-pointer"
                    value={newDeptPaisId}
                    onChange={e => setNewDeptPaisId(Number(e.target.value))}
                  >
                    {paises.map(p => <option key={p.id_pais} value={p.id_pais}>{p.nombre}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Ej. São Paulo"
                      className="flex-1 bg-white border border-slate-200 rounded-lg text-xs p-2 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      value={newDeptName}
                      onChange={e => setNewDeptName(e.target.value)}
                    />
                    <button type="submit" className="bg-slate-900 text-white font-bold p-2 text-xs rounded-lg cursor-pointer hover:bg-slate-800">
                      +
                    </button>
                  </div>
                </form>
              </div>

              <div className="rounded-xl border border-slate-100 p-2 bg-white max-h-64 overflow-y-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 block mb-1">Departamentos Registrados</span>
                <div className="divide-y divide-slate-50">
                  {departamentos.map(d => {
                    const paisNombre = paises.find(p => p.id_pais === d.id_pais)?.nombre || 'Desconocido';
                    return (
                      <div key={d.id_departamento} className="py-2 px-2 flex justify-between items-center text-xs text-slate-700">
                        <div>
                          <p className="font-medium text-slate-800">{d.nombre}</p>
                          <p className="text-[10px] text-slate-400">{paisNombre}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteDept(d.id_departamento)} 
                          className="p-1 text-slate-300 hover:text-rose-600 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CIUDADES GRID */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Agregar Ciudad
                </h4>
                <form onSubmit={handleAddCity} className="space-y-2">
                  <select
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none bg-white cursor-pointer"
                    value={newCityDeptId}
                    onChange={e => setNewCityDeptId(Number(e.target.value))}
                  >
                    {departamentos.map(d => <option key={d.id_departamento} value={d.id_departamento}>{d.nombre}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Ej. Tuluá"
                      className="flex-1 bg-white border border-slate-200 rounded-lg text-xs p-2 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      value={newCityName}
                      onChange={e => setNewCityName(e.target.value)}
                    />
                    <button type="submit" className="bg-slate-900 text-white font-bold p-2 text-xs rounded-lg cursor-pointer hover:bg-slate-800">
                      +
                    </button>
                  </div>
                </form>
              </div>

              <div className="rounded-xl border border-slate-100 p-2 bg-white max-h-64 overflow-y-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 block mb-1">Ciudades Registradas</span>
                <div className="divide-y divide-slate-50">
                  {ciudades.map(c => {
                    const deptNombre = departamentos.find(d => d.id_departamento === c.id_departamento)?.nombre || 'Desconocido';
                    return (
                      <div key={c.id_ciudad} className="py-2 px-2 flex justify-between items-center text-xs text-slate-700">
                        <div>
                          <p className="font-medium text-slate-800">{c.nombre}</p>
                          <p className="text-[10px] text-slate-400">{deptNombre}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteCity(c.id_ciudad)} 
                          className="p-1 text-slate-300 hover:text-rose-600 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
