import React, { useState, useMemo } from 'react';
import dbService from '../db/localDatabase';
import { Cliente, Ciudad } from '../types';
import { Plus, Edit2, Trash2, Search, X, Check, Eye, HelpCircle } from 'lucide-react';

export default function AdminClientes() {
  const [clientes, setClientes] = useState<Cliente[]>(() => dbService.getClientes());
  const [ciudades] = useState<Ciudad[]>(() => dbService.getCiudades());
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fields
  const [idCliente, setIdCliente] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudadId, setCiudadId] = useState<number>(1);
  const [telPrincipal, setTelPrincipal] = useState('');
  const [telAlterno, setTelAlterno] = useState('');

  const refetch = () => {
    setClientes(dbService.getClientes());
  };

  const filteredClientes = useMemo(() => {
    if (!searchQuery.substring(0, 50).trim()) return clientes;
    const query = searchQuery.toLowerCase();
    return clientes.filter(c => 
      c.id_cliente.includes(query) ||
      c.nombre.toLowerCase().includes(query) ||
      c.apellidos.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query)
    );
  }, [clientes, searchQuery]);

  const openRegisterModal = () => {
    setIsEditing(false);
    setErrorMsg('');
    setSuccessMsg('');
    setIdCliente('');
    setNombre('');
    setApellidos('');
    setEmail('');
    setDireccion('');
    setCiudadId(ciudades[0]?.id_ciudad || 1);
    setTelPrincipal('');
    setTelAlterno('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Cliente) => {
    setIsEditing(true);
    setErrorMsg('');
    setSuccessMsg('');
    setIdCliente(c.id_cliente);
    setNombre(c.nombre);
    setApellidos(c.apellidos);
    setEmail(c.email);
    setDireccion(c.direccion);
    setCiudadId(c.id_ciudad);
    setTelPrincipal(c.telefono_principal);
    setTelAlterno(c.telefono_alterno || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Check basic validations matching CHECK constraints in schema.sql
    if (!idCliente.trim()) {
      setErrorMsg('Debe especificar la Cédula/Pasaporte del titular.');
      return;
    }
    if (!nombre.trim() || !apellidos.trim()) {
      setErrorMsg('Nombres y Apellidos son obligatorios.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('El formato del Email no es válido.');
      return;
    }
    if (!telPrincipal.trim()) {
      setErrorMsg('El teléfono principal es requerido.');
      return;
    }

    if (isEditing) {
      const ok = dbService.updateCliente(idCliente, {
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        email: email.trim().toLowerCase(),
        direccion: direccion.trim(),
        id_ciudad: ciudadId,
        telefono_principal: telPrincipal.trim(),
        telefono_alterno: telAlterno.trim() || undefined
      });
      if (ok) {
        setSuccessMsg('Cliente modificado correctamente.');
        refetch();
        setTimeout(() => setIsModalOpen(false), 900);
      } else {
        setErrorMsg('Error al guardar datos del cliente.');
      }
    } else {
      const res = dbService.createCliente({
        id_cliente: idCliente.trim(),
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        email: email.trim().toLowerCase(),
        direccion: direccion.trim(),
        id_ciudad: ciudadId,
        telefono_principal: telPrincipal.trim(),
        telefono_alterno: telAlterno.trim() || undefined
      });

      if (res.success) {
        setSuccessMsg(res.message);
        // Automatically register standard password access for this user
        dbService.registrarUsuario(email.trim().toLowerCase(), 'usuario123', idCliente.trim());
        refetch();
        setTimeout(() => setIsModalOpen(false), 1000);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  const handleDelete = (id: string) => {
    const confirmMessage = `⚠️ RESTRECCIÓN DE INTEGRIDAD REFERENCIAL ⚠️\n\n¿Estás seguro de que deseas eliminar este cliente (ID: ${id})?\n\nAl eliminar este cliente se GENERARÁ UN ELIMINADO EN CASCADA:\n- Se borrarán todas sus reservas asociadas.\n- Se cancelarán sus tiquetes de vuelo asignados.\n- Se borrará su usuario de acceso.\n\nEsta simulación sigue exactamente el modelo relacional descrito en los documentos.`;
    
    if (window.confirm(confirmMessage)) {
      const res = dbService.deleteCliente(id);
      alert(res.message);
      refetch();
    }
  };

  const getCiudadNombre = (id: number) => {
    return ciudades.find(c => c.id_ciudad === id)?.nombre || `ID: ${id}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-800" />
            Directorio Nacional de Clientes
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">Gestión de pasajeros afiliados, datos demográficos de residencia, y validadores de acceso.</p>
        </div>

        <div className="flex w-full md:w-auto items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1 md:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 pointer-events-none">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Buscar por cédula, nombre..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={openRegisterModal}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Ver y Añadir
          </button>
        </div>
      </div>

      {/* Info Warning */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-[11px] text-amber-800 leading-relaxed flex items-start gap-4">
        <HelpCircle className="w-5 h-5 mt-0.5 text-amber-600 shrink-0" />
        <div>
          <span className="font-bold">Reglas de Restricciones del Modelo de Datos (Constraints):</span>
          <p className="mt-1">
            Cada cliente agregado genera automáticamente un usuario en la tabla <strong>USUARIO</strong>. Su correo electrónico debe ser único. El sistema valida automáticamente las restricciones de integridad y cascadas cuando se elimina una identificación asociada a tiquetes o reservas activas.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-xs">
        <table className="w-full text-xs text-left text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Identificación</th>
              <th className="py-3 px-4">Nombres</th>
              <th className="py-3 px-4">Apellidos</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Dirección</th>
              <th className="py-3 px-4">Ciudad Residencia</th>
              <th className="py-3 px-4">Contacto Principal</th>
              <th className="py-3 px-4 text-center">Operaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClientes.length > 0 ? (
              filteredClientes.map(c => (
                <tr key={c.id_cliente} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.id_cliente}</td>
                  <td className="py-3 px-4">{c.nombre}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{c.apellidos}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{c.email}</td>
                  <td className="py-3 px-4 text-slate-500">{c.direccion}</td>
                  <td className="py-3 px-4">{getCiudadNombre(c.id_ciudad)}</td>
                  <td className="py-3 px-4 font-semibold">{c.telefono_principal}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
                        title="Modificar Datos"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id_cliente)}
                        className="p-1 hover:bg-rose-50 rounded text-rose-400 hover:text-rose-600 transition-all cursor-pointer"
                        title="Eliminación Síncrona"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                  No se encontraron clientes que coincidan con la búsqueda.
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
                <Search className="w-4 h-4 text-indigo-400" />
                {isEditing ? 'Modificar Registro de Pasajero' : 'Garantizar Registro de Pasajero'}
              </span>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1 hover:bg-white/10 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
              {/* FEEDBACK STATE */}
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-center gap-2">
                  <span className="font-bold">Error:</span>
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Identificación (Cédula o Pasaporte)</label>
                <input
                  type="text"
                  disabled={isEditing}
                  placeholder="Ej. Cédula 111222333"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono disabled:bg-slate-50"
                  value={idCliente}
                  onChange={e => setIdCliente(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nombres del Cliente</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombres"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Apellidos del Cliente</label>
                  <input
                    type="text"
                    required
                    placeholder="Apellidos"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    value={apellidos}
                    onChange={e => setApellidos(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Correo Electrónico (único)</label>
                  <input
                    type="email"
                    required
                    placeholder="correo@servidor.com"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Ciudad Residencia</label>
                  <select
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer bg-white text-slate-700"
                    value={ciudadId}
                    onChange={e => setCiudadId(Number(e.target.value))}
                  >
                    {ciudades.map(c => (
                      <option key={c.id_ciudad} value={c.id_ciudad}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Dirección de Vivienda</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Calle 10 # 25-30"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Teléfono Principal</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 3157778844"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                    value={telPrincipal}
                    onChange={e => setTelPrincipal(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Teléfono Alternativo (Opcional)</label>
                  <input
                    type="tel"
                    placeholder="Ej. 3101112233"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                    value={telAlterno}
                    onChange={e => setTelAlterno(e.target.value)}
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
                  {isEditing ? 'Actualizar Pasajero' : 'Confirmar Pasajero'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
