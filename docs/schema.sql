-- ====================================================================
-- ARCHIVO: schema.sql
-- DESCRIPCIÓN: Estructura de base de datos DDL para la gestión de 
--              reservas y venta de servicios de una aerolínea.
-- MOTOR: PostgreSQL (Compatible con Supabase)
-- PROYECTO: Bases de Datos 2026-I
-- ====================================================================

-- 1. Deshabilitar RLS temporalmente o definirlo para facilitar la importación.
-- Nota: En Supabase, las tablas creadas en el editor de SQL tendrán RLS desactivado por defecto
-- a menos que se habilite explícitamente.

-- Eliminar tablas si existen en orden de dependencia inverso
DROP TABLE IF EXISTS "USUARIO" CASCADE;
DROP TABLE IF EXISTS "RESERVA_PAQUETE" CASCADE;
DROP TABLE IF EXISTS "PAQUETE_TURISTICO" CASCADE;
DROP TABLE IF EXISTS "TIQUETE" CASCADE;
DROP TABLE IF EXISTS "HISTORIAL_ESTADO_RESERVA" CASCADE;
DROP TABLE IF EXISTS "RESERVA" CASCADE;
DROP TABLE IF EXISTS "ESTADO_RESERVA" CASCADE;
DROP TABLE IF EXISTS "VUELO" CASCADE;
DROP TABLE IF EXISTS "CLIENTE" CASCADE;
DROP TABLE IF EXISTS "CIUDAD" CASCADE;
DROP TABLE IF EXISTS "DEPARTAMENTO" CASCADE;
DROP TABLE IF EXISTS "PAIS" CASCADE;

-- ====================================================================
-- CREACIÓN DE TABLAS
-- ====================================================================

-- TABLA: PAIS
CREATE TABLE "PAIS" (
    "id_pais" SERIAL PRIMARY KEY,
    "nombre" VARCHAR(100) NOT NULL UNIQUE
);

-- TABLA: DEPARTAMENTO
CREATE TABLE "DEPARTAMENTO" (
    "id_departamento" SERIAL PRIMARY KEY,
    "nombre" VARCHAR(100) NOT NULL,
    "id_pais" INTEGER NOT NULL REFERENCES "PAIS"("id_pais") ON DELETE RESTRICT
);

-- TABLA: CIUDAD
CREATE TABLE "CIUDAD" (
    "id_ciudad" SERIAL PRIMARY KEY,
    "nombre" VARCHAR(100) NOT NULL,
    "id_departamento" INTEGER NOT NULL REFERENCES "DEPARTAMENTO"("id_departamento") ON DELETE RESTRICT
);

-- TABLA: CLIENTE
CREATE TABLE "CLIENTE" (
    "id_cliente" VARCHAR(20) PRIMARY KEY, -- Cédula o pasaporte
    "nombre" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL UNIQUE,
    "direccion" TEXT NOT NULL,
    "id_ciudad" INTEGER NOT NULL REFERENCES "CIUDAD"("id_ciudad") ON DELETE RESTRICT,
    "telefono_principal" VARCHAR(20) NOT NULL,
    "telefono_alterno" VARCHAR(20),
    CONSTRAINT "chk_email_cliente" CHECK ("email" ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$')
);

-- TABLA: VUELO
CREATE TABLE "VUELO" (
    "cod_vuelo" VARCHAR(10) PRIMARY KEY,
    "id_ciudad_origen" INTEGER NOT NULL REFERENCES "CIUDAD"("id_ciudad") ON DELETE RESTRICT,
    "id_ciudad_destino" INTEGER NOT NULL REFERENCES "CIUDAD"("id_ciudad") ON DELETE RESTRICT,
    "fecha_hora_salida" TIMESTAMP NOT NULL,
    "fecha_hora_llegada" TIMESTAMP NOT NULL,
    "capacidad_total" INTEGER NOT NULL CHECK ("capacidad_total" > 0),
    "precio_base" NUMERIC(12,2) NOT NULL CHECK ("precio_base" >= 0),
    "estado" VARCHAR(15) NOT NULL,
    CONSTRAINT "chk_estado_vuelo" CHECK ("estado" IN ('Programado', 'Abordando', 'En vuelo', 'Finalizado', 'Cancelado')),
    CONSTRAINT "chk_fechas_vuelo" CHECK ("fecha_hora_llegada" > "fecha_hora_salida")
);

-- TABLA: ESTADO_RESERVA
CREATE TABLE "ESTADO_RESERVA" (
    "id_estado" SERIAL PRIMARY KEY,
    "nombre_estado" VARCHAR(20) NOT NULL UNIQUE,
    CONSTRAINT "chk_nombre_estado" CHECK ("nombre_estado" IN ('Reservada', 'Confirmada', 'Cancelada', 'Expirada'))
);

-- TABLA: RESERVA
CREATE TABLE "RESERVA" (
    "id_reserva" SERIAL PRIMARY KEY,
    "fecha_hora_reserva" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valor_total" NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK ("valor_total" >= 0),
    "id_cliente" VARCHAR(20) NOT NULL REFERENCES "CLIENTE"("id_cliente") ON DELETE CASCADE,
    "cod_vuelo" VARCHAR(10) NOT NULL REFERENCES "VUELO"("cod_vuelo") ON DELETE RESTRICT,
    "id_estado" INTEGER NOT NULL REFERENCES "ESTADO_RESERVA"("id_estado") ON DELETE RESTRICT,
    "causa_cancelacion" TEXT -- Campo adicional útil para reportes de causas de cancelación
);

-- TABLA: HISTORIAL_ESTADO_RESERVA
CREATE TABLE "HISTORIAL_ESTADO_RESERVA" (
    "id_historial" SERIAL PRIMARY KEY,
    "id_reserva" INTEGER NOT NULL REFERENCES "RESERVA"("id_reserva") ON DELETE CASCADE,
    "id_estado" INTEGER NOT NULL REFERENCES "ESTADO_RESERVA"("id_estado") ON DELETE RESTRICT,
    "fecha_hora_cambio" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TABLA: TIQUETE
CREATE TABLE "TIQUETE" (
    "id_tiquete" SERIAL PRIMARY KEY,
    "numero_asiento" VARCHAR(5) NOT NULL,
    "clase" VARCHAR(15) NOT NULL,
    "precio_final" NUMERIC(12,2) NOT NULL CHECK ("precio_final" >= 0),
    "id_reserva" INTEGER NOT NULL REFERENCES "RESERVA"("id_reserva") ON DELETE CASCADE,
    CONSTRAINT "chk_clase_tiquete" CHECK ("clase" IN ('Económica', 'Ejecutiva', 'Primera clase'))
);

-- TABLA: PAQUETE_TURISTICO
CREATE TABLE "PAQUETE_TURISTICO" (
    "id_paquete" SERIAL PRIMARY KEY,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "sector_destino" VARCHAR(150) NOT NULL, -- Destino aplicable (e.g. Caribe, Andino, etc.)
    "precio" NUMERIC(12,2) NOT NULL CHECK ("precio" >= 0),
    "estado" VARCHAR(15) NOT NULL,
    CONSTRAINT "chk_estado_paquete" CHECK ("estado" IN ('Disponible', 'No disponible'))
);

-- TABLA INTERMEDIA: RESERVA_PAQUETE
CREATE TABLE "RESERVA_PAQUETE" (
    "id_reserva" INTEGER REFERENCES "RESERVA"("id_reserva") ON DELETE CASCADE,
    "id_paquete" INTEGER REFERENCES "PAQUETE_TURISTICO"("id_paquete") ON DELETE RESTRICT,
    PRIMARY KEY ("id_reserva", "id_paquete")
);

-- TABLA: USUARIO
CREATE TABLE "USUARIO" (
    "id_usuario" SERIAL PRIMARY KEY,
    "email" VARCHAR(150) NOT NULL UNIQUE,
    "contrasena_hash" VARCHAR(255) NOT NULL, -- bcrypt/MD5 o texto simple en entorno educativo
    "rol" VARCHAR(20) NOT NULL,
    "id_cliente" VARCHAR(20) REFERENCES "CLIENTE"("id_cliente") ON DELETE CASCADE,
    CONSTRAINT "chk_rol_usuario" CHECK ("rol" IN ('SuperAdmin', 'Agente', 'Cliente')),
    CONSTRAINT "chk_email_usuario" CHECK ("email" ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$')
);


-- ====================================================================
-- TRIGGER AUTOMÁTICO PARA EL HISTORIAL DE ESTADOS DE RESERVA
-- ====================================================================

-- Función desencadenadora para registrar cambios en el historial de forma automática
CREATE OR REPLACE FUNCTION registrar_cambio_estado()
RETURNS TRIGGER AS $$
BEGIN
    -- Cuando se inserta o actualiza el id_estado de la reserva
    IF (TG_OP = 'INSERT') THEN
         INSERT INTO "HISTORIAL_ESTADO_RESERVA" ("id_reserva", "id_estado", "fecha_hora_cambio")
         VALUES (NEW."id_reserva", NEW."id_estado", CURRENT_TIMESTAMP);
    ELSIF (TG_OP = 'UPDATE') THEN
         IF (OLD."id_estado" IS DISTINCT FROM NEW."id_estado") THEN
             INSERT INTO "HISTORIAL_ESTADO_RESERVA" ("id_reserva", "id_estado", "fecha_hora_cambio")
             VALUES (NEW."id_reserva", NEW."id_estado", CURRENT_TIMESTAMP);
         END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Asignar Trigger a la tabla RESERVA
CREATE TRIGGER trg_historial_reserva
AFTER INSERT OR UPDATE ON "RESERVA"
FOR EACH ROW
EXECUTE FUNCTION registrar_cambio_estado();


-- ====================================================================
-- INSERCIÓN DE DATOS DE PRUEBA (SEED DATA)
-- ====================================================================

-- Datos Base: Países
INSERT INTO "PAIS" ("id_pais", "nombre") VALUES
(1, 'Colombia'),
(2, 'Estados Unidos'),
(3, 'España'),
(4, 'México')
ON CONFLICT ("id_pais") DO NOTHING;

-- Datos Base: Departamentos
INSERT INTO "DEPARTAMENTO" ("id_departamento", "nombre", "id_pais") VALUES
(1, 'Valle del Cauca', 1),
(2, 'Antioquia', 1),
(3, 'Bogotá D.C.', 1),
(4, 'Florida', 2),
(5, 'Madrid', 3),
(6, 'Quintana Roo', 4)
ON CONFLICT ("id_departamento") DO NOTHING;

-- Datos Base: Ciudades
INSERT INTO "CIUDAD" ("id_ciudad", "nombre", "id_departamento") VALUES
(1, 'Cali', 1),
(2, 'Tuluá', 1),
(3, 'Medellín', 2),
(4, 'Bogotá', 3),
(5, 'Miami', 4),
(6, 'Madrid', 5),
(7, 'Cancún', 6)
ON CONFLICT ("id_ciudad") DO NOTHING;

-- Datos Base: Estados de Reserva
INSERT INTO "ESTADO_RESERVA" ("id_estado", "nombre_estado") VALUES
(1, 'Reservada'),
(2, 'Confirmada'),
(3, 'Cancelada'),
(4, 'Expirada')
ON CONFLICT ("id_estado") DO NOTHING;

-- Datos Base: Clientes iniciales
INSERT INTO "CLIENTE" ("id_cliente", "nombre", "apellidos", "email", "direccion", "id_ciudad", "telefono_principal", "telefono_alterno") VALUES
('111222333', 'Luis David', 'Mendoza', 'luis23luis33@gmail.com', 'Calle 10 # 25-30', 2, '3157778844', '3109998877'),
('222333444', 'Manuela', 'Guerrero Llanos', 'manuela.guerrero@univalle.edu.co', 'Av Pasoancho # 56-11', 1, '3218889922', NULL),
('333444555', 'David', 'Lopez Restrepo', 'david.lopez@univalle.edu.co', 'Carrera 4 # 12-45', 2, '3124445566', '3151112233'),
('444555666', 'Daniel', 'Grajales', 'daniel.grajales@univalle.edu.co', 'Calle 5 # 80-20', 3, '3167771122', NULL)
ON CONFLICT ("id_cliente") DO NOTHING;

-- Datos Base: Vuelos
INSERT INTO "VUELO" ("cod_vuelo", "id_ciudad_origen", "id_ciudad_destino", "fecha_hora_salida", "fecha_hora_llegada", "capacidad_total", "precio_base", "estado") VALUES
('AV9240', 1, 4, '2026-06-20 08:00:00', '2026-06-20 09:00:00', 150, 250000.00, 'Programado'),
('AV4100', 4, 5, '2026-06-22 14:30:00', '2026-06-22 18:30:00', 180, 1200000.00, 'Programado'),
('LA2045', 3, 1, '2026-06-18 10:15:00', '2026-06-18 11:15:00', 120, 180000.00, 'Programado'),
('IB6501', 4, 6, '2026-06-25 19:00:00', '2026-06-26 11:00:00', 250, 320000.00, 'Programado'),
('AA2411', 1, 7, '2026-07-02 06:10:00', '2026-07-02 10:15:00', 160, 950000.00, 'Programado'),
('AV1023', 2, 4, '2026-06-14 07:00:00', '2026-06-14 08:00:00', 80, 210000.00, 'Finalizado')
ON CONFLICT ("cod_vuelo") DO NOTHING;

-- Datos Base: Paquetes Turísticos
INSERT INTO "PAQUETE_TURISTICO" ("id_paquete", "nombre", "descripcion", "sector_destino", "precio", "estado") VALUES
(1, 'Plan Sol y Playa Cancún', 'Hotel All-Inclusive 4 noches + traslados + tour a Chichén Itzá', 'Cancún', 1800000.00, 'Disponible'),
(2, 'Escapada Miami Mágica', 'Alojamiento en South Beach 3 noches + cuponera de descuento en compras', 'Miami', 1500000.00, 'Disponible'),
(3, 'Madrid Histórico', 'Hotel boutique 3 noches + tarjeta de metro ilimitada + tour gastronómico de tapas', 'Madrid', 2100000.00, 'Disponible'),
(4, 'Tarde de Compras Bogotá', 'Alojamiento en Parque de la 93 por 2 noches + desayuno buffet', 'Bogotá', 550000.00, 'Disponible')
ON CONFLICT ("id_paquete") DO NOTHING;

-- Datos Base: Reservas de Prueba
-- Nota: El trigger registrará automáticamente estas reservas en HISTORIAL_ESTADO_RESERVA
INSERT INTO "RESERVA" ("id_reserva", "fecha_hora_reserva", "valor_total", "id_cliente", "cod_vuelo", "id_estado", "causa_cancelacion") VALUES
(1, '2026-06-01 10:30:00', 250000.00, '111222333', 'AV9240', 2, NULL),
(2, '2026-06-02 15:45:00', 3000000.00, '222333444', 'AV4100', 2, NULL),
(3, '2026-06-10 09:15:00', 180000.00, '333444555', 'LA2045', 1, NULL),
(4, '2026-06-12 11:30:00', 1130000.00, '111222333', 'AV9240', 3, 'Cambio de planes personales. El cliente solicitó reembolso de tiquete clase económica.')
ON CONFLICT ("id_reserva") DO NOTHING;

-- Datos Base: Tiquetes Asociados
INSERT INTO "TIQUETE" ("id_tiquete", "numero_asiento", "clase", "precio_final", "id_reserva") VALUES
(1, '12A', 'Económica', 250000.00, 1),
(2, '1A', 'Primera clase', 1500000.00, 2),
(3, '1B', 'Primera clase', 1500000.00, 2),
(4, '15C', 'Económica', 180000.00, 3)
ON CONFLICT ("id_tiquete") DO NOTHING;

-- Datos Base: Asociación de Paquetes con Reserva
INSERT INTO "RESERVA_PAQUETE" ("id_reserva", "id_paquete") VALUES
(2, 2)
ON CONFLICT DO NOTHING;

-- Datos Base: Usuarios del Sistema (Para las credenciales y roles)
-- Nota: contraseñas de demostración en texto plano para el proyecto académico.
-- En producción, se usarían algoritmos hash robustos en Supabase Auth o un backend seguro.
INSERT INTO "USUARIO" ("id_usuario", "email", "contrasena_hash", "rol", "id_cliente") VALUES
(1, 'admin@aerolinea.com', 'admin123', 'SuperAdmin', NULL),
(2, 'agente@aerolinea.com', 'agente123', 'Agente', NULL),
(3, 'luis23luis33@gmail.com', 'luis123', 'Cliente', '111222333'),
(4, 'manuela@aerolinea.com', 'manuela123', 'Cliente', '222333444')
ON CONFLICT ("id_usuario") DO NOTHING;

-- Ajustar secuencias de SERIAL para evitar conflictos de id duplicado al hacer inserts en el futuro
SELECT setval(pg_get_serial_sequence('"PAIS"', 'id_pais'), coalesce(max("id_pais"), 1)) FROM "PAIS";
SELECT setval(pg_get_serial_sequence('"DEPARTAMENTO"', 'id_departamento'), coalesce(max("id_departamento"), 1)) FROM "DEPARTAMENTO";
SELECT setval(pg_get_serial_sequence('"CIUDAD"', 'id_ciudad'), coalesce(max("id_ciudad"), 1)) FROM "CIUDAD";
SELECT setval(pg_get_serial_sequence('"ESTADO_RESERVA"', 'id_estado'), coalesce(max("id_estado"), 1)) FROM "ESTADO_RESERVA";
SELECT setval(pg_get_serial_sequence('"RESERVA"', 'id_reserva'), coalesce(max("id_reserva"), 1)) FROM "RESERVA";
SELECT setval(pg_get_serial_sequence('"HISTORIAL_ESTADO_RESERVA"', 'id_historial'), coalesce(max("id_historial"), 1)) FROM "HISTORIAL_ESTADO_RESERVA";
SELECT setval(pg_get_serial_sequence('"TIQUETE"', 'id_tiquete'), coalesce(max("id_tiquete"), 1)) FROM "TIQUETE";
SELECT setval(pg_get_serial_sequence('"PAQUETE_TURISTICO"', 'id_paquete'), coalesce(max("id_paquete"), 1)) FROM "PAQUETE_TURISTICO";
SELECT setval(pg_get_serial_sequence('"USUARIO"', 'id_usuario'), coalesce(max("id_usuario"), 1)) FROM "USUARIO";
