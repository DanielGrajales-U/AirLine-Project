export interface Pais {
  id_pais: number;
  nombre: string;
}

export interface Departamento {
  id_departamento: number;
  nombre: string;
  id_pais: number;
}

export interface Ciudad {
  id_ciudad: number;
  nombre: string;
  id_departamento: number;
}

export interface Cliente {
  id_cliente: string; // Cédula o pasaporte
  nombre: string;
  apellidos: string;
  email: string;
  direccion: string;
  id_ciudad: number;
  telefono_principal: string;
  telefono_alterno?: string;
}

export interface Vuelo {
  cod_vuelo: string;
  id_ciudad_origen: number;
  id_ciudad_destino: number;
  fecha_hora_salida: string;
  fecha_hora_llegada: string;
  capacidad_total: number;
  precio_base: number;
  estado: 'Programado' | 'Abordando' | 'En vuelo' | 'Finalizado' | 'Cancelado';
}

export interface EstadoReserva {
  id_estado: number;
  nombre_estado: 'Reservada' | 'Confirmada' | 'Cancelada' | 'Expirada';
}

export interface Reserva {
  id_reserva: number;
  fecha_hora_reserva: string;
  valor_total: number;
  id_cliente: string;
  cod_vuelo: string;
  id_estado: number;
  causa_cancelacion?: string;
}

export interface HistorialEstadoReserva {
  id_historial: number;
  id_reserva: number;
  id_estado: number;
  fecha_hora_cambio: string;
}

export interface Tiquete {
  id_tiquete: number;
  numero_asiento: string;
  clase: 'Económica' | 'Ejecutiva' | 'Primera clase';
  precio_final: number;
  id_reserva: number;
}

export interface PaqueteTuristico {
  id_paquete: number;
  nombre: string;
  descripcion: string;
  sector_destino: string;
  precio: number;
  estado: 'Disponible' | 'No disponible';
}

export interface ReservaPaquete {
  id_reserva: number;
  id_paquete: number;
}

export interface Usuario {
  id_usuario: number;
  email: string;
  contrasena_hash: string;
  rol: 'SuperAdmin' | 'Agente' | 'Cliente';
  id_cliente?: string;
}

export type UserRole = 'SuperAdmin' | 'Agente' | 'Cliente';
