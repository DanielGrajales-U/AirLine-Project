import { 
  Pais, 
  Departamento, 
  Ciudad, 
  Cliente, 
  Vuelo, 
  EstadoReserva, 
  Reserva, 
  HistorialEstadoReserva, 
  Tiquete, 
  PaqueteTuristico, 
  ReservaPaquete, 
  Usuario 
} from '../types';

import {
  INITIAL_PAISES,
  INITIAL_DEPARTAMENTOS,
  INITIAL_CIUDADES,
  INITIAL_ESTADOS_RESERVA,
  INITIAL_CLIENTES,
  INITIAL_VUELOS,
  INITIAL_PAQUETES_TURISTICOS,
  INITIAL_RESERVAS,
  INITIAL_TIQUETES,
  INITIAL_RESERVA_PAQUETES,
  INITIAL_HISTORIAL_ESTADOS,
  INITIAL_USUARIOS
} from './mockData';

// DB Keys as defined in relational style
const KEYS = {
  PAISES: 'db_paises',
  DEPARTAMENTOS: 'db_departamentos',
  CIUDADES: 'db_ciudades',
  ESTADOS_RESERVA: 'db_estados_reserva',
  CLIENTES: 'db_clientes',
  VUELOS: 'db_vuelos',
  PAQUETES_TURISTICOS: 'db_paquetes_turisticos',
  RESERVAS: 'db_reservas',
  TIQUETES: 'db_tiquetes',
  RESERVA_PAQUETES: 'db_reserva_paquetes',
  HISTORIAL_ESTADOS: 'db_historial_estados',
  USUARIOS: 'db_usuarios'
};

// Singleton relational storage coordinator
class LocalDatabase {
  constructor() {
    this.init();
  }

  private get<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, data: T) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  public init(forceReset = false) {
    if (forceReset) {
      localStorage.clear();
    }
    this.get<Pais[]>(KEYS.PAISES, INITIAL_PAISES);
    this.get<Departamento[]>(KEYS.DEPARTAMENTOS, INITIAL_DEPARTAMENTOS);
    this.get<Ciudad[]>(KEYS.CIUDADES, INITIAL_CIUDADES);
    this.get<EstadoReserva[]>(KEYS.ESTADOS_RESERVA, INITIAL_ESTADOS_RESERVA);
    this.get<Cliente[]>(KEYS.CLIENTES, INITIAL_CLIENTES);
    this.get<Vuelo[]>(KEYS.VUELOS, INITIAL_VUELOS);
    this.get<PaqueteTuristico[]>(KEYS.PAQUETES_TURISTICOS, INITIAL_PAQUETES_TURISTICOS);
    this.get<Reserva[]>(KEYS.RESERVAS, INITIAL_RESERVAS);
    this.get<Tiquete[]>(KEYS.TIQUETES, INITIAL_TIQUETES);
    this.get<ReservaPaquete[]>(KEYS.RESERVA_PAQUETES, INITIAL_RESERVA_PAQUETES);
    this.get<HistorialEstadoReserva[]>(KEYS.HISTORIAL_ESTADOS, INITIAL_HISTORIAL_ESTADOS);
    this.get<Usuario[]>(KEYS.USUARIOS, INITIAL_USUARIOS);
  }

  // ==========================================
  // TABLE GETTERS (Queries)
  // ==========================================
  public getPaises(): Pais[] { return this.get<Pais[]>(KEYS.PAISES, []); }
  public getDepartamentos(): Departamento[] { return this.get<Departamento[]>(KEYS.DEPARTAMENTOS, []); }
  public getCiudades(): Ciudad[] { return this.get<Ciudad[]>(KEYS.CIUDADES, []); }
  public getEstadosReserva(): EstadoReserva[] { return this.get<EstadoReserva[]>(KEYS.ESTADOS_RESERVA, []); }
  public getClientes(): Cliente[] { return this.get<Cliente[]>(KEYS.CLIENTES, []); }
  public getVuelos(): Vuelo[] { return this.get<Vuelo[]>(KEYS.VUELOS, []); }
  public getPaquetesTuristicos(): PaqueteTuristico[] { return this.get<PaqueteTuristico[]>(KEYS.PAQUETES_TURISTICOS, []); }
  public getReservas(): Reserva[] { return this.get<Reserva[]>(KEYS.RESERVAS, []); }
  public getTiquetes(): Tiquete[] { return this.get<Tiquete[]>(KEYS.TIQUETES, []); }
  public getReservaPaquetes(): ReservaPaquete[] { return this.get<ReservaPaquete[]>(KEYS.RESERVA_PAQUETES, []); }
  public getHistorialEstados(): HistorialEstadoReserva[] { return this.get<HistorialEstadoReserva[]>(KEYS.HISTORIAL_ESTADOS, []); }
  public getUsuarios(): Usuario[] { return this.get<Usuario[]>(KEYS.USUARIOS, []); }

  // ==========================================
  // COUNTRY CRUD
  // ==========================================
  public createPais(nombre: string): Pais {
    const list = this.getPaises();
    const id = list.length > 0 ? Math.max(...list.map(p => p.id_pais)) + 1 : 1;
    const item: Pais = { id_pais: id, nombre };
    list.push(item);
    this.set(KEYS.PAISES, list);
    return item;
  }

  public updatePais(id: number, nombre: string): boolean {
    const list = this.getPaises();
    const idx = list.findIndex(p => p.id_pais === id);
    if (idx === -1) return false;
    list[idx].nombre = nombre;
    this.set(KEYS.PAISES, list);
    return true;
  }

  public deletePais(id: number): { success: boolean; message: string } {
    // Check foreign keys in DEPARTAMENTO
    const deps = this.getDepartamentos().filter(d => d.id_pais === id);
    if (deps.length > 0) {
      return { success: false, message: 'No se puede eliminar: Existen departamentos asignados a este país.' };
    }
    const list = this.getPaises().filter(p => p.id_pais !== id);
    this.set(KEYS.PAISES, list);
    return { success: true, message: 'País eliminado con éxito.' };
  }

  // ==========================================
  // DEPARTAMENTO CRUD
  // ==========================================
  public createDepartamento(nombre: string, id_pais: number): Departamento {
    const list = this.getDepartamentos();
    const id = list.length > 0 ? Math.max(...list.map(d => d.id_departamento)) + 1 : 1;
    const item: Departamento = { id_departamento: id, nombre, id_pais };
    list.push(item);
    this.set(KEYS.DEPARTAMENTOS, list);
    return item;
  }

  public updateDepartamento(id: number, nombre: string, id_pais: number): boolean {
    const list = this.getDepartamentos();
    const idx = list.findIndex(d => d.id_departamento === id);
    if (idx === -1) return false;
    list[idx] = { id_departamento: id, nombre, id_pais };
    this.set(KEYS.DEPARTAMENTOS, list);
    return true;
  }

  public deleteDepartamento(id: number): { success: boolean; message: string } {
    // Check foreign keys in CIUDAD
    const cities = this.getCiudades().filter(c => c.id_departamento === id);
    if (cities.length > 0) {
      return { success: false, message: 'No se puede eliminar: Existen ciudades asociadas a este departamento.' };
    }
    const list = this.getDepartamentos().filter(d => d.id_departamento !== id);
    this.set(KEYS.DEPARTAMENTOS, list);
    return { success: true, message: 'Departamento eliminado con éxito.' };
  }

  // ==========================================
  // CIUDAD CRUD
  // ==========================================
  public createCiudad(nombre: string, id_departamento: number): Ciudad {
    const list = this.getCiudades();
    const id = list.length > 0 ? Math.max(...list.map(c => c.id_ciudad)) + 1 : 1;
    const item: Ciudad = { id_ciudad: id, nombre, id_departamento };
    list.push(item);
    this.set(KEYS.CIUDADES, list);
    return item;
  }

  public updateCiudad(id: number, nombre: string, id_departamento: number): boolean {
    const list = this.getCiudades();
    const idx = list.findIndex(c => c.id_ciudad === id);
    if (idx === -1) return false;
    list[idx] = { id_ciudad: id, nombre, id_departamento };
    this.set(KEYS.CIUDADES, list);
    return true;
  }

  public deleteCiudad(id: number): { success: boolean; message: string } {
    // Check references in CLIENTE or VUELO
    const clients = this.getClientes().filter(c => c.id_ciudad === id);
    if (clients.length > 0) {
      return { success: false, message: 'No se puede eliminar: Existen clientes residentes en esta ciudad.' };
    }
    const flights = this.getVuelos().filter(v => v.id_ciudad_origen === id || v.id_ciudad_destino === id);
    if (flights.length > 0) {
      return { success: false, message: 'No se puede eliminar: Existen vuelos con origen o destino en esta ciudad.' };
    }
    const list = this.getCiudades().filter(c => c.id_ciudad !== id);
    this.set(KEYS.CIUDADES, list);
    return { success: true, message: 'Ciudad eliminada con éxito.' };
  }

  // ==========================================
  // CLIENTE CRUD
  // ==========================================
  public createCliente(client: Cliente): { success: boolean; message: string; data?: Cliente } {
    const list = this.getClientes();
    if (list.some(c => c.id_cliente === client.id_cliente)) {
      return { success: false, message: 'Error: Ya existe un cliente con esta Identificación.' };
    }
    if (list.some(c => c.email.toLowerCase() === client.email.toLowerCase())) {
      return { success: false, message: 'Error: El correo electrónico ya está registrado.' };
    }
    list.push(client);
    this.set(KEYS.CLIENTES, list);
    return { success: true, message: 'Cliente registrado con éxito.', data: client };
  }

  public updateCliente(id: string, updated: Partial<Cliente>): boolean {
    const list = this.getClientes();
    const idx = list.findIndex(c => c.id_cliente === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...updated };
    this.set(KEYS.CLIENTES, list);
    return true;
  }

  public deleteCliente(id: string): { success: boolean; message: string } {
    // Cascades or blocks based on reservation. If client has bookings, they can be deleted on cascade or blocked.
    // In actual PDF schema: "CLIENTE REFERENCES RESERVA CASCADE", so we will cascade-delete the client's reservations as well!
    const res = this.getReservas().filter(r => r.id_cliente === id);
    if (res.length > 0) {
      // Perform manual cascade delete
      const reservationIds = res.map(r => r.id_reserva);
      
      // 1. Delete associated tiquetes
      const tiquetes = this.getTiquetes().filter(t => !reservationIds.includes(t.id_reserva));
      this.set(KEYS.TIQUETES, tiquetes);

      // 2. Delete intermediate packages
      const rp = this.getReservaPaquetes().filter(p => !reservationIds.includes(p.id_reserva));
      this.set(KEYS.RESERVA_PAQUETES, rp);

      // 3. Delete histories
      const hist = this.getHistorialEstados().filter(h => !reservationIds.includes(h.id_reserva));
      this.set(KEYS.HISTORIAL_ESTADOS, hist);

      // 4. Delete bookings
      const bookingsRemaining = this.getReservas().filter(r => r.id_cliente !== id);
      this.set(KEYS.RESERVAS, bookingsRemaining);
    }
    
    // Also delete associated system Usuario
    const remainingUsers = this.getUsuarios().filter(u => u.id_cliente !== id);
    this.set(KEYS.USUARIOS, remainingUsers);

    const list = this.getClientes().filter(c => c.id_cliente !== id);
    this.set(KEYS.CLIENTES, list);
    return { success: true, message: 'Cliente y sus registros asociados (Reservaciones, Tiquetes, Usuario) eliminados de forma síncrona en cascada.' };
  }

  // ==========================================
  // VUELO CRUD
  // ==========================================
  public createVuelo(flight: Vuelo): { success: boolean; message: string } {
    const list = this.getVuelos();
    if (list.some(v => v.cod_vuelo.toUpperCase() === flight.cod_vuelo.toUpperCase())) {
      return { success: false, message: 'Error: El código de vuelo ya existe.' };
    }
    if (flight.id_ciudad_origen === flight.id_ciudad_destino) {
      return { success: false, message: 'Error: La ciudad origen y destino deben ser diferentes.' };
    }
    if (new Date(flight.fecha_hora_llegada) <= new Date(flight.fecha_hora_salida)) {
      return { success: false, message: 'Error: La fecha de llegada debe ser posterior a la de salida.' };
    }
    list.push(flight);
    this.set(KEYS.VUELOS, list);
    return { success: true, message: 'Vuelo creado con éxito.' };
  }

  public updateVuelo(cod: string, updated: Partial<Vuelo>): boolean {
    const list = this.getVuelos();
    const idx = list.findIndex(v => v.cod_vuelo === cod);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...updated } as Vuelo;
    this.set(KEYS.VUELOS, list);
    return true;
  }

  public deleteVuelo(cod: string): { success: boolean; message: string } {
    // Check if flight has reservations
    const count = this.getReservas().filter(r => r.cod_vuelo === cod).length;
    if (count > 0) {
      return { success: false, message: `No se puede eliminar: Existen ${count} reserva(s) activas asociadas a este vuelo.` };
    }
    const list = this.getVuelos().filter(v => v.cod_vuelo !== cod);
    this.set(KEYS.VUELOS, list);
    return { success: true, message: 'Vuelo eliminado con éxito.' };
  }

  // ==========================================
  // PAQUETE TURISTICO CRUD
  // ==========================================
  public createPaquete(paq: PaqueteTuristico): PaqueteTuristico {
    const list = this.getPaquetesTuristicos();
    const id = list.length > 0 ? Math.max(...list.map(p => p.id_paquete)) + 1 : 1;
    const item = { ...paq, id_paquete: id };
    list.push(item);
    this.set(KEYS.PAQUETES_TURISTICOS, list);
    return item;
  }

  public updatePaquete(id: number, updated: Partial<PaqueteTuristico>): boolean {
    const list = this.getPaquetesTuristicos();
    const idx = list.findIndex(p => p.id_paquete === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...updated } as PaqueteTuristico;
    this.set(KEYS.PAQUETES_TURISTICOS, list);
    return true;
  }

  public deletePaquete(id: number): { success: boolean; message: string } {
    // Check if intermediate table references it
    const count = this.getReservaPaquetes().filter(p => p.id_paquete === id).length;
    if (count > 0) {
      return { success: false, message: `No se puede eliminar: El paquete está contratado en ${count} reserva(s).` };
    }
    const list = this.getPaquetesTuristicos().filter(v => v.id_paquete !== id);
    this.set(KEYS.PAQUETES_TURISTICOS, list);
    return { success: true, message: 'Paquete turístico eliminado con éxito.' };
  }

  // ==========================================
  // RESERVA CRUD (with auto trigger for history & total pricing calculation)
  // ==========================================
  public createReserva(
    id_cliente: string, 
    cod_vuelo: string, 
    tiquetesData: { numero_asiento: string; clase: 'Económica' | 'Ejecutiva' | 'Primera clase'; precio_final: number }[],
    paquetesIds: number[]
  ): { success: boolean; message: string; data?: Reserva } {
    
    const flights = this.getVuelos();
    const flight = flights.find(f => f.cod_vuelo === cod_vuelo);
    if (!flight) return { success: false, message: 'Error: El vuelo no existe.' };

    // Check flight capacity bounds
    const existingReservationsForFlight = this.getReservas().filter(r => r.cod_vuelo === cod_vuelo && r.id_estado !== 3); // excluding cancelled
    const takenSeatsCount = this.getTiquetes().filter(t => 
      existingReservationsForFlight.some(r => r.id_reserva === t.id_reserva)
    ).length;

    if (takenSeatsCount + tiquetesData.length > flight.capacidad_total) {
      return { success: false, message: `Error: No hay suficientes asientos disponibles. Quedan ${flight.capacidad_total - takenSeatsCount} asientos.` };
    }

    // Build the Reserva object
    const bookingList = this.getReservas();
    const nextBookingId = bookingList.length > 0 ? Math.max(...bookingList.map(r => r.id_reserva)) + 1 : 1;

    // Calculate total cost
    const tiquetesSum = tiquetesData.reduce((acc, t) => acc + t.precio_final, 0);
    const packagesSum = this.getPaquetesTuristicos()
      .filter(p => paquetesIds.includes(p.id_paquete))
      .reduce((acc, p) => acc + p.precio, 0);
    
    const valor_total = tiquetesSum + packagesSum;

    const newBooking: Reserva = {
      id_reserva: nextBookingId,
      fecha_hora_reserva: new Date().toISOString(),
      valor_total: valor_total,
      id_cliente,
      cod_vuelo,
      id_estado: 1 // Default: 'Reservada'
    };

    // Save Reservation
    bookingList.push(newBooking);
    this.set(KEYS.RESERVAS, bookingList);

    // Save Tickets (Associated with reservation)
    const tiquetesList = this.getTiquetes();
    let currentTicketId = tiquetesList.length > 0 ? Math.max(...tiquetesList.map(t => t.id_tiquete)) : 0;

    tiquetesData.forEach(tick => {
      currentTicketId++;
      tiquetesList.push({
        id_tiquete: currentTicketId,
        numero_asiento: tick.numero_asiento,
        clase: tick.clase,
        precio_final: tick.precio_final,
        id_reserva: nextBookingId
      });
    });
    this.set(KEYS.TIQUETES, tiquetesList);

    // Save tour packages attachments
    const intermediateList = this.getReservaPaquetes();
    paquetesIds.forEach(pId => {
      intermediateList.push({
        id_reserva: nextBookingId,
        id_paquete: pId
      });
    });
    this.set(KEYS.RESERVA_PAQUETES, intermediateList);

    // AUTOMATIC TRIGGER: Add record to HISTORIAL_ESTADO_RESERVA
    this.logEstadoChange(nextBookingId, 1);

    return { 
      success: true, 
      message: `Reserva #${nextBookingId} creada exitosamente con ${tiquetesData.length} tiquete(s).`, 
      data: newBooking 
    };
  }

  public updateEstadoReserva(id_reserva: number, nuevo_estado_id: number, causa_cancelacion?: string): boolean {
    const list = this.getReservas();
    const idx = list.findIndex(r => r.id_reserva === id_reserva);
    if (idx === -1) return false;

    const old_estado = list[idx].id_estado;
    if (old_estado === nuevo_estado_id) return true; // No changes

    list[idx].id_estado = nuevo_estado_id;
    if (causa_cancelacion !== undefined) {
      list[idx].causa_cancelacion = causa_cancelacion;
    }

    this.set(KEYS.RESERVAS, list);

    // TRIGGER ACTIONS
    this.logEstadoChange(id_reserva, nuevo_estado_id);
    return true;
  }

  public deleteReserva(id_reserva: number): boolean {
    const list = this.getReservas().filter(r => r.id_reserva !== id_reserva);
    this.set(KEYS.RESERVAS, list);

    // Cascade delete dependents
    const tiquetes = this.getTiquetes().filter(t => t.id_reserva !== id_reserva);
    this.set(KEYS.TIQUETES, tiquetes);

    const rp = this.getReservaPaquetes().filter(p => p.id_reserva !== id_reserva);
    this.set(KEYS.RESERVA_PAQUETES, rp);

    const hist = this.getHistorialEstados().filter(h => h.id_reserva !== id_reserva);
    this.set(KEYS.HISTORIAL_ESTADOS, hist);

    return true;
  }

  private logEstadoChange(id_reserva: number, id_estado: number) {
    const hist = this.getHistorialEstados();
    const nextId = hist.length > 0 ? Math.max(...hist.map(h => h.id_historial)) + 1 : 1;
    hist.push({
      id_historial: nextId,
      id_reserva,
      id_estado,
      fecha_hora_cambio: new Date().toISOString()
    });
    this.set(KEYS.HISTORIAL_ESTADOS, hist);
  }

  // ==========================================
  // TIQUETE CRUD
  // ==========================================
  public getTiquetesDeReserva(id_reserva: number): Tiquete[] {
    return this.getTiquetes().filter(t => t.id_reserva === id_reserva);
  }

  public createTiquete(tiquete: Tiquete): Tiquete {
    const list = this.getTiquetes();
    const id = list.length > 0 ? Math.max(...list.map(t => t.id_tiquete)) + 1 : 1;
    const item = { ...tiquete, id_tiquete: id };
    list.push(item);
    this.set(KEYS.TIQUETES, list);
    return item;
  }

  public updateTiquete(id: number, updated: Partial<Tiquete>): boolean {
    const list = this.getTiquetes();
    const idx = list.findIndex(t => t.id_tiquete === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...updated } as Tiquete;
    this.set(KEYS.TIQUETES, list);
    return true;
  }

  public deleteTiquete(id: number): boolean {
    const list = this.getTiquetes().filter(t => t.id_tiquete !== id);
    this.set(KEYS.TIQUETES, list);
    return true;
  }

  // ==========================================
  // AUTHENTICATION & USERS
  // ==========================================
  public registrarUsuario(email: string, contrasena: string, id_cliente?: string): { success: boolean; message: string; user?: Usuario } {
    const list = this.getUsuarios();
    if (list.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Usuario ya registrado con este email.' };
    }
    const nextId = list.length > 0 ? Math.max(...list.map(u => u.id_usuario)) + 1 : 1;
    const item: Usuario = {
      id_usuario: nextId,
      email,
      contrasena_hash: contrasena, // For university project demonstration
      rol: id_cliente ? 'Cliente' : 'Agente',
      id_cliente
    };
    list.push(item);
    this.set(KEYS.USUARIOS, list);
    return { success: true, message: 'Usuario registrado con éxito', user: item };
  }

  public authenticate(email: string, contrasena: string): Usuario | null {
    const list = this.getUsuarios();
    const user = list.find(u => u.email.toLowerCase() === email.toLowerCase() && u.contrasena_hash === contrasena);
    return user || null;
  }

  // ==========================================
  // 📈 REPORT GENERATORS (SQL equivalent algorithms)
  // ==========================================

  /**
   * REPORT 1: Ingresos mensuales por destino
   * Combina Reservas de Estado "Confirmada" (id_estado = 2), asocia con el vuelo y la ciudad destino
   */
  public reportIngresosMensualesPorDestino(): { destino: string; mes: string; ingresos: number }[] {
    const confirmadas = this.getReservas().filter(r => r.id_estado === 2);
    const vuelos = this.getVuelos();
    const ciudades = this.getCiudades();
    
    const countsMap: { [key: string]: number } = {};

    confirmadas.forEach(reserva => {
      const vuelo = vuelos.find(v => v.cod_vuelo === reserva.cod_vuelo);
      if (!vuelo) return;

      const ciudadDestino = ciudades.find(c => c.id_ciudad === vuelo.id_ciudad_destino);
      if (!ciudadDestino) return;

      const fecha = new Date(reserva.fecha_hora_reserva);
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const mesKey = `${year}-${month}`; // e.g. "2026-06"

      const groupKey = `${ciudadDestino.nombre}||${mesKey}`;
      countsMap[groupKey] = (countsMap[groupKey] || 0) + Number(reserva.valor_total);
    });

    return Object.entries(countsMap).map(([key, value]) => {
      const [destino, mes] = key.split('||');
      return { destino, mes, ingresos: value };
    }).sort((a, b) => b.ingresos - a.ingresos);
  }

  /**
   * REPORT 2: Número de reservas por vuelo y mes
   */
  public reportReservasPorVueloYMes(): { cod_vuelo: string; mes: string; cantidad: number }[] {
    const reservas = this.getReservas();
    const groupMap: { [key: string]: number } = {};

    reservas.forEach(r => {
      const fecha = new Date(r.fecha_hora_reserva);
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const mesKey = `${year}-${month}`;

      const groupKey = `${r.cod_vuelo}||${mesKey}`;
      groupMap[groupKey] = (groupMap[groupKey] || 0) + 1;
    });

    return Object.entries(groupMap).map(([key, value]) => {
      const [cod_vuelo, mes] = key.split('||');
      return { cod_vuelo, mes, cantidad: value };
    }).sort((a, b) => a.mes.localeCompare(b.mes));
  }

  /**
   * REPORT 3: Clientes frecuentes
   * Clientes con mayor número de reservas en periodo determinado (Default: todo el año 2026)
   */
  public reportClientesFrecuentes(fechaInicio?: string, fechaFin?: string): { id_cliente: string; nombre_completo: string; cantidad_reservas: number; total_invertido: number }[] {
    const reservas = this.getReservas();
    const clientes = this.getClientes();

    const start = fechaInicio ? new Date(fechaInicio) : new Date('2026-01-01');
    const end = fechaFin ? new Date(fechaFin) : new Date('2026-12-31T23:59:59');

    const clientStats: { [id: string]: { reservaciones: number; invertido: number } } = {};

    reservas.forEach(res => {
      const date = new Date(res.fecha_hora_reserva);
      if (date >= start && date <= end) {
        if (!clientStats[res.id_cliente]) {
          clientStats[res.id_cliente] = { reservaciones: 0, invertido: 0 };
        }
        clientStats[res.id_cliente].reservaciones++;
        if (res.id_estado === 2) { // Confirmadas sumen inversion
          clientStats[res.id_cliente].invertido += Number(res.valor_total);
        }
      }
    });

    return Object.entries(clientStats).map(([id_cliente, stats]) => {
      const cli = clientes.find(c => c.id_cliente === id_cliente);
      const nombre = cli ? `${cli.nombre} ${cli.apellidos}` : id_cliente;
      return {
        id_cliente,
        nombre_completo: nombre,
        cantidad_reservas: stats.reservaciones,
        total_invertido: stats.invertido
      };
    }).sort((a, b) => b.cantidad_reservas - a.cantidad_reservas);
  }

  /**
   * REPORT 4: Listado de vuelos y geolocalización por país, departamento y ciudad de destino
   */
  public reportVuelosPorDestinosFiltro(): { cod_vuelo: string; origen: string; destino: string; departamento: string; pais: string; fecha_hora_salida: string; precio_base: number; estado: string }[] {
    const vuelos = this.getVuelos();
    const ciudades = this.getCiudades();
    const departamentos = this.getDepartamentos();
    const paises = this.getPaises();

    return vuelos.map(v => {
      const cOrigen = ciudades.find(c => c.id_ciudad === v.id_ciudad_origen)?.nombre || 'Desconocido';
      const cDest = ciudades.find(c => c.id_ciudad === v.id_ciudad_destino);
      const destName = cDest?.nombre || 'Desconocido';
      
      const dept = departamentos.find(d => d.id_departamento === cDest?.id_departamento);
      const deptName = dept?.nombre || 'Desconocido';

      const pais = paises.find(p => p.id_pais === dept?.id_pais);
      const paisName = pais?.nombre || 'Desconocido';

      return {
        cod_vuelo: v.cod_vuelo,
        origen: cOrigen,
        destino: destName,
        departamento: deptName,
        pais: paisName,
        fecha_hora_salida: v.fecha_hora_salida,
        precio_base: v.precio_base,
        estado: v.estado
      };
    });
  }

  /**
   * REPORT 5: Destinos más vendidos por sector geográfico
   */
  public reportDestinosMasVendidosPorSector(): { sector: string; cantidad_ventas: number }[] {
    const confirmadas = this.getReservas().filter(r => r.id_estado === 2);
    const vuelos = this.getVuelos();
    const ciudades = this.getCiudades();
    const departamentos = this.getDepartamentos();
    const paises = this.getPaises();

    const stats: { [sector: string]: number } = {};

    confirmadas.forEach(booking => {
      const flight = vuelos.find(v => v.cod_vuelo === booking.cod_vuelo);
      if (!flight) return;

      const cDest = ciudades.find(c => c.id_ciudad === flight.id_ciudad_destino);
      const dep = departamentos.find(d => d.id_departamento === cDest?.id_departamento);
      const pais = paises.find(p => p.id_pais === dep?.id_pais);
      const sector = pais ? pais.nombre : 'Internacional';

      stats[sector] = (stats[sector] || 0) + 1;
    });

    return Object.entries(stats).map(([sector, count]) => ({
      sector,
      cantidad_ventas: count
    })).sort((a, b) => b.cantidad_ventas - a.cantidad_ventas);
  }

  /**
   * REPORT 6: Reservas canceladas y su causa
   */
  public reportReservasCanceladasYCausa(): { id_reserva: number; cliente: string; vuelo: string; fecha_reserva: string; causa: string; valor_perdido: number }[] {
    const reservas = this.getReservas().filter(r => r.id_estado === 3);
    const clientes = this.getClientes();

    return reservas.map(res => {
      const cli = clientes.find(c => c.id_cliente === res.id_cliente);
      const cliName = cli ? `${cli.nombre} ${cli.apellidos}` : res.id_cliente;

      return {
        id_reserva: res.id_reserva,
        cliente: cliName,
        vuelo: res.cod_vuelo,
        fecha_reserva: res.fecha_hora_reserva,
        causa: res.causa_cancelacion || 'Causa no especificada por el operario.',
        valor_perdido: Number(res.valor_total)
      };
    });
  }

  /**
   * REPORT 7: Tiempo promedio entre reserva (id_estado = 1) y confirmación (id_estado = 2)
   */
  public reportTiempoPromedioConfirmacion(): { promedioMinutos: number; cantidadReservasAnalizadas: number } {
    const historial = this.getHistorialEstados();
    const reservas = this.getReservas();
    
    let totalDiferenciaMilisegundos = 0;
    let contador = 0;

    reservas.forEach(res => {
      const histDeReserva = historial.filter(h => h.id_reserva === res.id_reserva);
      const hCreacion = histDeReserva.find(h => h.id_estado === 1);
      const hConfirmación = histDeReserva.find(h => h.id_estado === 2);

      if (hCreacion && hConfirmación) {
        const tCreacion = new Date(hCreacion.fecha_hora_cambio).getTime();
        const tConfirmacion = new Date(hConfirmación.fecha_hora_cambio).getTime();

        if (tConfirmacion >= tCreacion) {
          totalDiferenciaMilisegundos += (tConfirmacion - tCreacion);
          contador++;
        }
      }
    });

    const promedioMins = contador > 0 ? Math.round((totalDiferenciaMilisegundos / (1000 * 60)) / contador) : 0;
    return {
      promedioMinutos: promedioMins,
      cantidadReservasAnalizadas: contador
    };
  }
}

export const dbService = new LocalDatabase();
export default dbService;
