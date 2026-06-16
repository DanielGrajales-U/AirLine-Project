# Guía de Configuración de Base de Datos - Supabase

Este proyecto universitario de **Bases de Datos 2026-I** titulado **"Gestión de Reservas y Venta de Servicios de una Aerolínea"** está integrado con **Supabase** y provee un simulador local inteligente que permite al profesor y estudiantes probar el sistema de inmediato en cualquier navegador sin configuraciones previas coercitivas.

A continuación, se detallan los pasos para cargar la estructura relacional directamente en tu propia instancia de Supabase en menos de 5 minutos.

---

## 🚀 Pasos para la Configuración en Supabase

### Paso 1: Crear un proyecto en Supabase
1. Ingresa a [supabase.com](https://supabase.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"New Project"** (Nuevo Proyecto).
3. Ingresa los detalles:
   - **Name**: Reserva de Aerolínea
   - **Database Password**: *Escribe una contraseña segura* (y recuérdala).
   - **Region**: Selecciona la más cercana (ej. South America - São Paulo o US East).
4. Espera de 1 a 2 minutos a que el servidor de base de datos se configure.

### Paso 2: Ejecutar el Script de la Base de Datos (DDL y Seed)
1. En el menú lateral izquierdo de tu proyecto en Supabase, ingresa en la sección **"SQL Editor"** (Editor SQL).
2. Haz clic en **"New Query"** (Nueva Consulta).
3. Abre el archivo localizado en `/docs/schema.sql` de este proyecto, copia todo su contenido y pégalo en el editor de Supabase.
4. Presiona el botón verde **"Run"** (o usa Ctrl+Enter).
5. Deberás ver un mensaje de éxito: `Success. No rows returned` y las tablas se habrán creado, poblado con datos semilla reales de vuelos, tiquetes, clientes y estados, y el disparador automático (`trg_historial_reserva`) estará activo.

---

## 📊 Modelo Relacional Mapeado

El script SQL implementa con total fidelidad las 12 entidades especificadas, asegurando integridad referencial estricta:

1. **PAIS** (Países de operación)
2. **DEPARTAMENTO** (Departamentos / Estados por país)
3. **CIUDAD** (Ciudades asociadas a departamentos)
4. **CLIENTE** (Registro detallado de datos, validación de formato de email)
5. **VUELO** (Códigos únicos de vuelo con restricciones de capacidad, precios y fechas coherentes)
6. **ESTADO_RESERVA** (`Reservada`, `Confirmada`, `Cancelada`, `Expirada`)
7. **RESERVA** (Fecha, valor consolidado, cliente, vuelo y estado actual)
8. **HISTORIAL_ESTADO_RESERVA** (Historial automático actualizado mediante **Triggers**)
9. **TIQUETE** (Asientos, clases: `Económica`, `Ejecutiva`, `Primera clase`, precios)
10. **PAQUETE_TURISTICO** (Servicios opcionales según el destino: `Alojamiento`, `Transporte`, etc.)
11. **RESERVA_PAQUETE** (Tabla intermedia de cardinalidad N:M)
12. **USUARIO** (Credenciales cifradas/simples con roles: `SuperAdmin`, `Agente`, `Cliente`)

---

## 🔒 Políticas de Seguridad & Integridad

### Disparadores (Triggers)
El disparador `trg_historial_reserva` en PostgreSQL automatiza que cada vez que una reserva se crea o cambia de estado, se inserta una nueva fila en `HISTORIAL_ESTADO_RESERVA` con la marca de tiempo `CURRENT_TIMESTAMP`. ¡Esto garantiza auditoría precisa!

### Restricciones de Integridad (Check Constraints)
- **Formato de email**: `CHECK ("email" ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$')`
- **Valores positivos**: Capacidad de pasajeros, precios de base, precios finales y valor de reservas deben ser estrictamente positivos/mayores a cero.
- **Dominios válidos**: Estados de vuelo, tiquete y reserva restringidos mediante cláusulas `IN` para evitar basura de datos.

---

## ⚙️ Conectando la Aplicación a tu Supabase en Tiempo Real

Esta aplicación incluye un panel de control interactivo para cambiar del **Modo Demo con Persistencia Local (LocalStorage)** al **Modo Supabase en Tiempo Real**.

Para conectar tu Supabase, simplemente haz clic en el botón de **"Conexión Supabase"** en la barra superior de la aplicación e ingresa:

1. **SUPABASE_URL**: Se encuentra en Supabase en *Project Settings (Icono de engranaje) -> API -> Project URL*.
2. **SUPABASE_ANON_KEY**: Se encuentra en el mismo sitio anterior, bajo *Project API keys -> anon public*.

Al guardar la configuración, la aplicación apuntará directamente a tus tablas remotas permitiendo realizar todas las consultas y reportes en vivo.
