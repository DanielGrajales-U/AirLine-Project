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

export const INITIAL_PAISES: Pais[] = [
  { id_pais: 1, nombre: 'Colombia' },
  { id_pais: 2, nombre: 'Estados Unidos' },
  { id_pais: 3, nombre: 'España' },
  { id_pais: 4, nombre: 'México' }
];

export const INITIAL_DEPARTAMENTOS: Departamento[] = [
  { id_departamento: 1, nombre: 'Valle del Cauca', id_pais: 1 },
  { id_departamento: 2, nombre: 'Antioquia', id_pais: 1 },
  { id_departamento: 3, nombre: 'Bogotá D.C.', id_pais: 1 },
  { id_departamento: 4, nombre: 'Florida', id_pais: 2 },
  { id_departamento: 5, nombre: 'Madrid', id_pais: 3 },
  { id_departamento: 6, nombre: 'Quintana Roo', id_pais: 4 }
];

export const INITIAL_CIUDADES: Ciudad[] = [
  { id_ciudad: 1, nombre: 'Cali', id_departamento: 1 },
  { id_ciudad: 2, nombre: 'Tuluá', id_departamento: 1 },
  { id_ciudad: 3, nombre: 'Medellín', id_departamento: 2 },
  { id_ciudad: 4, nombre: 'Bogotá', id_departamento: 3 },
  { id_ciudad: 5, nombre: 'Miami', id_departamento: 4 },
  { id_ciudad: 6, nombre: 'Madrid', id_departamento: 5 },
  { id_ciudad: 7, nombre: 'Cancún', id_departamento: 6 }
];

export const INITIAL_ESTADOS_RESERVA: EstadoReserva[] = [
  { id_estado: 1, nombre_estado: 'Reservada' },
  { id_estado: 2, nombre_estado: 'Confirmada' },
  { id_estado: 3, nombre_estado: 'Cancelada' },
  { id_estado: 4, nombre_estado: 'Expirada' }
];

export const INITIAL_CLIENTES: Cliente[] = [
  { 
    id_cliente: '111222333', 
    nombre: 'Luis David', 
    apellidos: 'Mendoza', 
    email: 'luis23luis33@gmail.com', 
    direccion: 'Calle 10 # 25-30', 
    id_ciudad: 2, 
    telefono_principal: '3157778844', 
    telefono_alterno: '3109998877' 
  },
  { 
    id_cliente: '222333444', 
    nombre: 'Manuela', 
    apellidos: 'Guerrero Llanos', 
    email: 'manuela.guerrero@univalle.edu.co', 
    direccion: 'Av Pasoancho # 56-11', 
    id_ciudad: 1, 
    telefono_principal: '3218889922' 
  },
  { 
    id_cliente: '333444555', 
    nombre: 'David', 
    apellidos: 'Lopez Restrepo', 
    email: 'david.lopez@univalle.edu.co', 
    direccion: 'Carrera 4 # 12-45', 
    id_ciudad: 2, 
    telefono_principal: '3124445566', 
    telefono_alterno: '3151112233' 
  },
  { 
    id_cliente: '444555666', 
    nombre: 'Daniel', 
    apellidos: 'Grajales', 
    email: 'daniel.grajales@univalle.edu.co', 
    direccion: 'Calle 5 # 80-20', 
    id_ciudad: 3, 
    telefono_principal: '3167771122' 
  }
];

export const INITIAL_VUELOS: Vuelo[] = [
  { 
    cod_vuelo: 'AV9240', 
    id_ciudad_origen: 1, 
    id_ciudad_destino: 4, 
    fecha_hora_salida: '2026-06-20T08:00:00', 
    fecha_hora_llegada: '2026-06-20T09:00:00', 
    capacidad_total: 150, 
    precio_base: 250000, 
    estado: 'Programado' 
  },
  { 
    cod_vuelo: 'AV4100', 
    id_ciudad_origen: 4, 
    id_ciudad_destino: 5, 
    fecha_hora_salida: '2026-06-22T14:30:00', 
    fecha_hora_llegada: '2026-06-22T18:30:00', 
    capacidad_total: 180, 
    precio_base: 1200000, 
    estado: 'Programado' 
  },
  { 
    cod_vuelo: 'LA2045', 
    id_ciudad_origen: 3, 
    id_ciudad_destino: 1, 
    fecha_hora_salida: '2026-06-18T10:15:00', 
    fecha_hora_llegada: '2026-06-18T11:15:00', 
    capacidad_total: 120, 
    precio_base: 180000, 
    estado: 'Programado' 
  },
  { 
    cod_vuelo: 'IB6501', 
    id_ciudad_origen: 4, 
    id_ciudad_destino: 6, 
    fecha_hora_salida: '2026-06-25T19:00:00', 
    fecha_hora_llegada: '2026-06-26T11:00:00', 
    capacidad_total: 250, 
    precio_base: 3200000, 
    estado: 'Programado' 
  },
  { 
    cod_vuelo: 'AA2411', 
    id_ciudad_origen: 1, 
    id_ciudad_destino: 7, 
    fecha_hora_salida: '2026-07-02T06:10:00', 
    fecha_hora_llegada: '2026-07-02T10:15:00', 
    capacidad_total: 160, 
    precio_base: 950000, 
    estado: 'Programado' 
  },
  { 
    cod_vuelo: 'AV1023', 
    id_ciudad_origen: 2, 
    id_ciudad_destino: 4, 
    fecha_hora_salida: '2026-06-14T07:00:00', 
    fecha_hora_llegada: '2026-06-14T08:00:00', 
    capacidad_total: 80, 
    precio_base: 210000, 
    estado: 'Finalizado' 
  }
];

export const INITIAL_PAQUETES_TURISTICOS: PaqueteTuristico[] = [
  { 
    id_paquete: 1, 
    nombre: 'Plan Sol y Playa Cancún', 
    descripcion: 'Hotel All-Inclusive 4 noches + traslados + tour a Chichén Itzá', 
    sector_destino: 'Cancún', 
    precio: 1800000, 
    estado: 'Disponible' 
  },
  { 
    id_paquete: 2, 
    nombre: 'Escapada Miami Mágica', 
    descripcion: 'Alojamiento en South Beach 3 noches + cuponera de descuento en compras', 
    sector_destino: 'Miami', 
    precio: 1500000, 
    estado: 'Disponible' 
  },
  { 
    id_paquete: 3, 
    nombre: 'Madrid Histórico', 
    descripcion: 'Hotel boutique 3 noches + tarjeta de metro ilimitada + tour gastronómico de tapas', 
    sector_destino: 'Madrid', 
    precio: 2100000, 
    estado: 'Disponible' 
  },
  { 
    id_paquete: 4, 
    nombre: 'Tarde de Compras Bogotá', 
    descripcion: 'Alojamiento en Parque de la 93 por 2 noches + desayuno buffet', 
    sector_destino: 'Bogotá', 
    precio: 550000, 
    estado: 'Disponible' 
  }
];

export const INITIAL_RESERVAS: Reserva[] = [
  { 
    id_reserva: 1, 
    fecha_hora_reserva: '2026-06-01T10:30:00', 
    valor_total: 250000, 
    id_cliente: '111222333', 
    cod_vuelo: 'AV9240', 
    id_estado: 2 // Confirmada
  },
  { 
    id_reserva: 2, 
    fecha_hora_reserva: '2026-06-02T15:45:00', 
    valor_total: 4500000, // 2 tiquetes de 1.5M + 1 paquete Miami de 1.5M = 4.5M
    id_cliente: '222333444', 
    cod_vuelo: 'AV4100', 
    id_estado: 2 // Confirmada
  },
  { 
    id_reserva: 3, 
    fecha_hora_reserva: '2026-06-10T09:15:00', 
    valor_total: 180000, 
    id_cliente: '333444555', 
    cod_vuelo: 'LA2045', 
    id_estado: 1 // Reservada
  },
  { 
    id_reserva: 4, 
    fecha_hora_reserva: '2026-06-12T11:30:00', 
    valor_total: 250000, 
    id_cliente: '111222333', 
    cod_vuelo: 'AV9240', 
    id_estado: 3, // Cancelada
    causa_cancelacion: 'Cambio de planes personales. El cliente solicitó reembolso de tiquete clase económica.'
  }
];

export const INITIAL_TIQUETES: Tiquete[] = [
  { id_tiquete: 1, numero_asiento: '12A', clase: 'Económica', precio_final: 250000, id_reserva: 1 },
  { id_tiquete: 2, numero_asiento: '1A', clase: 'Primera clase', precio_final: 1500000, id_reserva: 2 },
  { id_tiquete: 3, numero_asiento: '1B', clase: 'Primera clase', precio_final: 1500000, id_reserva: 2 },
  { id_tiquete: 4, numero_asiento: '15C', clase: 'Económica', precio_final: 180000, id_reserva: 3 }
];

export const INITIAL_RESERVA_PAQUETES: ReservaPaquete[] = [
  { id_reserva: 2, id_paquete: 2 } // Reserva 2 tiene el paquete 2 (Miami)
];

export const INITIAL_HISTORIAL_ESTADOS: HistorialEstadoReserva[] = [
  // Reserva 1
  { id_historial: 1, id_reserva: 1, id_estado: 1, fecha_hora_cambio: '2026-06-01T10:30:00' },
  { id_historial: 2, id_reserva: 1, id_estado: 2, fecha_hora_cambio: '2026-06-01T10:45:00' }, // Se confirmo 15 mins despues
  // Reserva 2
  { id_historial: 3, id_reserva: 2, id_estado: 1, fecha_hora_cambio: '2026-06-02T15:45:00' },
  { id_historial: 4, id_reserva: 2, id_estado: 2, fecha_hora_cambio: '2026-06-02T16:15:00' }, // Se confirmo 30 mins despues
  // Reserva 3
  { id_historial: 5, id_reserva: 3, id_estado: 1, fecha_hora_cambio: '2026-06-10T09:15:00' },
  // Reserva 4
  { id_historial: 6, id_reserva: 4, id_estado: 1, fecha_hora_cambio: '2026-06-12T11:30:00' },
  { id_historial: 7, id_reserva: 4, id_estado: 3, fecha_hora_cambio: '2026-06-13T10:00:00' } // Cancelada al dia siguiente
];

export const INITIAL_USUARIOS: Usuario[] = [
  { id_usuario: 1, email: 'admin@aerolinea.com', contrasena_hash: 'admin123', rol: 'SuperAdmin' },
  { id_usuario: 2, email: 'agente@aerolinea.com', contrasena_hash: 'agente123', rol: 'Agente' },
  { id_usuario: 3, email: 'luis23luis33@gmail.com', contrasena_hash: 'luis123', rol: 'Cliente', id_cliente: '111222333' },
  { id_usuario: 4, email: 'manuela@aerolinea.com', contrasena_hash: 'manuela123', rol: 'Cliente', id_cliente: '222333444' }
];
