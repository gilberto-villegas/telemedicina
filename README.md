# 🏥 Telemedicina Venezuela

> Plataforma integral de atención médica a distancia que conecta pacientes y médicos a través de consultas virtuales en tiempo real, gestionando citas, historiales clínicos y videollamadas de forma segura y eficiente.

---

## 📋 Tabla de Contenido

- [Concepto del Proyecto](#-concepto-del-proyecto)
- [Stack Tecnológico](#-stack-tecnológico)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación Local (Laragon)](#-instalación-local-laragon)
- [Variables de Entorno](#-variables-de-entorno)
- [Base de Datos](#-base-de-datos)
- [Frontend (Vite + React)](#-frontend-vite--react)
- [Comandos Útiles](#-comandos-útiles)
- [Estructura del Proyecto](#-estructura-del-proyecto)

---

## 💡 Concepto del Proyecto

**Telemedicina Venezuela** es una plataforma web diseñada para facilitar el acceso a servicios de salud de forma remota. Permite a los pacientes registrarse, buscar médicos por especialidad, agendar citas, acceder a videollamadas con profesionales de salud y consultar su historial médico, todo desde un entorno seguro y moderno.

Los médicos cuentan con su propio panel para gestionar su agenda, atender consultas en línea, emitir recetas digitales y hacer seguimiento a sus pacientes. La plataforma fue diseñada pensando en la realidad del sistema de salud venezolano, priorizando la accesibilidad y la facilidad de uso.

### Funcionalidades Principales

- 🔐 Autenticación segura con Laravel Sanctum (tokens de sesión)
- 👨‍⚕️ Panel de médicos: agenda, citas, historial de pacientes
- 🧑‍💼 Panel de pacientes: citas, videollamadas, historial clínico
- 📹 Videollamadas en tiempo real integradas (Jitsi Meet / Socket.IO)
- 📲 Notificaciones en tiempo real con Firebase y Queues de Redis
- 📅 Sistema de agendamiento de citas con validación de disponibilidad
- 🔔 Sistema de notificaciones push y por correo electrónico

---

## 🛠 Stack Tecnológico

| Capa            | Tecnología               | Versión        |
|-----------------|--------------------------|----------------|
| **Backend**     | PHP                      | `^8.2 / 8.3`   |
| **Framework**   | Laravel                  | `^11.0`        |
| **Auth**        | Laravel Sanctum           | `^4.0`         |
| **Frontend**    | React                    | `^19.x`        |
| **Build Tool**  | Vite                     | `^5.4`         |
| **Lenguaje FE** | TypeScript               | `^5.x`         |
| **Estilos**     | Tailwind CSS             | `^3.4`         |
| **HTTP Client** | Axios                    | `^1.x`         |
| **Formularios** | React Hook Form + Zod    | `^7.x / ^4.x`  |
| **Estado**      | Zustand                  | `^5.x`         |
| **Queries**     | TanStack React Query     | `^5.x`         |
| **Base de datos**| MySQL                  | `5.7 / 8.0`    |
| **Cache/Queue** | Redis                    | `6+`           |
| **Realtime**    | Socket.IO Client         | `^4.x`         |
| **Push Notif.** | Firebase SDK             | `^12.x`        |
| **UI Icons**    | Lucide React             | `^0.5x`        |
| **UI Primitivos**| Radix UI               | `^1-2.x`       |
| **Contenedor**  | Docker                   | `Latest`       |
| **Entorno Dev** | Laragon                  | `6.x`          |
| **Node.js**     | Node.js                  | `>=18.x`       |
| **Gestor paquetes PHP** | Composer       | `^2.x`         |
| **Gestor paquetes JS** | npm            | `>=9.x`        |

---

## ✅ Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas:

- **Laragon** `6.x` o superior → [laragon.org](https://laragon.org)
  - PHP `8.2` o `8.3` habilitado
  - MySQL `8.0` habilitado
  - Apache / Nginx habilitado
- **Composer** `2.x` → [getcomposer.org](https://getcomposer.org)
- **Node.js** `18.x` o superior → [nodejs.org](https://nodejs.org)
- **npm** `9.x` o superior (incluido con Node.js)
- **Redis** (puede usarse via Docker o `Laragon extras`)
- **Git** → [git-scm.com](https://git-scm.com)

---

## 🚀 Instalación Local (Laragon)

Sigue estos pasos en orden para levantar el proyecto en tu máquina local.

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/telemedicina.git
cd telemedicina
```

> 💡 Si usas Laragon, clona el proyecto dentro de `C:\laragon\www\telemedicina`.

---

### 2. Instalar dependencias de PHP

```bash
composer install
```

Este comando descarga todas las dependencias del backend definidas en `composer.json`.

---

### 3. Configurar el archivo de entorno

```bash
cp .env.example .env
```

Luego edita el archivo `.env` con tus credenciales locales. Ver sección [Variables de Entorno](#-variables-de-entorno).

---

### 4. Generar la clave de la aplicación

```bash
php artisan key:generate
```

---

### 5. Configurar la base de datos

Crea la base de datos en MySQL (desde phpMyAdmin o la terminal de Laragon):

```sql
CREATE DATABASE telemedicina CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Luego ejecuta las migraciones y los seeders:

```bash
# Ejecutar migraciones
php artisan migrate

# Ejecutar seeders (datos de prueba)
php artisan db:seed
```

O si deseas hacer todo de una vez (⚠️ borra la base de datos primero):

```bash
php artisan migrate:fresh --seed
```

---

### 6. Generar el enlace de almacenamiento

```bash
php artisan storage:link
```

---

### 7. Instalar dependencias de JavaScript

```bash
npm install
```

---

### 8. Compilar los assets del frontend

**Para desarrollo (con hot reload):**

```bash
npm run dev
```

**Para producción:**

```bash
npm run build
```

---

### 9. Iniciar el servidor local

Con Laragon, el sitio estará disponible automáticamente en:

```
http://telemedicina.test
```

Si prefieres usar el servidor embebido de Artisan:

```bash
php artisan serve
```

Disponible en: `http://localhost:8000`

---

### 10. (Opcional) Iniciar el worker de colas

Si el proyecto usa notificaciones o tareas en segundo plano:

```bash
php artisan queue:work
```

---

## 🔧 Variables de Entorno

Edita el archivo `.env` con los siguientes valores mínimos para el entorno local:

```env
APP_NAME="Telemedicina Venezuela"
APP_ENV=local
APP_KEY=                        # Se genera con: php artisan key:generate
APP_DEBUG=true
APP_URL=http://telemedicina.test

# Base de datos
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=telemedicina
DB_USERNAME=root
DB_PASSWORD=

# Redis (si está disponible localmente)
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

CACHE_DRIVER=redis              # Cambia a "file" si no tienes Redis
QUEUE_CONNECTION=redis          # Cambia a "sync" si no tienes Redis
SESSION_DRIVER=redis            # Cambia a "file" si no tienes Redis

# Correo (usa Mailtrap para desarrollo)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS=noreply@telemedicina.com
MAIL_FROM_NAME="${APP_NAME}"

# Sanctum
SANCTUM_STATEFUL_DOMAINS=telemedicina.test,localhost:8000
```

---

## 🗄 Base de Datos

| Parámetro    | Valor por defecto       |
|--------------|-------------------------|
| Motor        | MySQL 8.0               |
| Base de datos| `telemedicina`          |
| Host local   | `127.0.0.1`             |
| Puerto       | `3306`                  |
| Usuario      | `root` (Laragon default)|
| Contraseña   | *(vacía en Laragon)*    |

### Comandos de migración

```bash
# Ver estado de las migraciones
php artisan migrate:status

# Ejecutar migraciones pendientes
php artisan migrate

# Revertir última migración
php artisan migrate:rollback

# Reiniciar base de datos completamente con seeders
php artisan migrate:fresh --seed
```

---

## ⚡ Frontend (Vite + React)

El frontend está construido con **React 19 + TypeScript** integrado en Laravel mediante `laravel-vite-plugin`.

### Estructura del frontend

```
resources/
├── css/
│   └── app.css          # Estilos globales (Tailwind CSS)
└── js/
    ├── app.tsx          # Punto de entrada React
    ├── components/      # Componentes reutilizables
    ├── pages/           # Vistas / páginas
    ├── hooks/           # Custom hooks
    ├── store/           # Estado global (Zustand)
    └── types/           # Tipos TypeScript
```

### Comandos del frontend

```bash
# Modo desarrollo con hot reload
npm run dev

# Construir para producción
npm run build
```

---

## 📦 Comandos Útiles

```bash
# Limpiar cachés de Laravel
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Regenerar cachés para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ver todas las rutas registradas
php artisan route:list

# Acceder al REPL de Laravel
php artisan tinker

# Ejecutar tests
php artisan test

# Iniciar worker de colas
php artisan queue:work --tries=3

# Ver logs en tiempo real
tail -f storage/logs/laravel.log   # Linux/Mac
Get-Content storage/logs/laravel.log -Wait  # PowerShell
```

---

## 📁 Estructura del Proyecto

```
telemedicina/
├── app/
│   ├── Http/
│   │   ├── Controllers/     # Controladores de la API
│   │   └── Middleware/      # Middlewares personalizados
│   ├── Models/              # Modelos Eloquent
│   └── Services/            # Lógica de negocio
├── database/
│   ├── migrations/          # Migraciones de la BD
│   └── seeders/             # Datos de prueba
├── resources/
│   ├── css/                 # Estilos (Tailwind)
│   ├── js/                  # Frontend React/TypeScript
│   └── views/               # Blade templates
├── routes/
│   ├── api.php              # Rutas de la API
│   └── web.php              # Rutas web
├── public/                  # Archivos públicos
├── storage/                 # Archivos generados / logs
├── .env.example             # Plantilla de configuración
├── composer.json            # Dependencias PHP
├── package.json             # Dependencias JS
├── vite.config.mjs          # Configuración de Vite
├── tailwind.config.js       # Configuración de Tailwind
└── Dockerfile               # Imagen Docker del backend
```

---

## 🐳 Docker (Opcional)

Si prefieres usar Docker en lugar de Laragon:

```bash
# Construir la imagen
docker build -t telemedicina .

# Iniciar el contenedor
docker run -p 8000:8000 --env-file .env telemedicina
```

La aplicación estará disponible en `http://localhost:8000`.

---

## 📄 Licencia

Este proyecto es de uso **propietario**. Todos los derechos reservados.

---

<p align="center">
  Desarrollado con ❤️ para el sistema de salud venezolano
</p>
