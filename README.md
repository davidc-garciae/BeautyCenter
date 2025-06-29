# 💄 Centro de Belleza - Sistema de Agendamiento de Citas

[🇪🇸 Español](#espanol) | [🌐 English](#english)

# Español

<!-- =======================
     ESPAÑOL (por defecto)
     ======================= -->

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791?style=for-the-badge&logo=postgresql) ![Auth0](https://img.shields.io/badge/Auth0-Authentication-EB5424?style=for-the-badge&logo=auth0&logoColor=white)

Sistema integral de gestión y agendamiento de citas para centros de belleza y spa. Diseñado para optimizar la administración de servicios, clientes, personal y horarios con una interfaz moderna y funcional.

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Modelo de Datos](#-modelo-de-datos)
- [Flujo de Usuarios](#-flujo-de-usuarios)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso del Sistema](#-uso-del-sistema)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## ✨ Características Principales

### 🎯 **Gestión Integral**

- **Agendamiento de Citas**: Sistema completo de reservas con calendario interactivo
- **Gestión de Clientes**: CRUD completo con historial de citas y datos personales
- **Catálogo de Servicios**: Servicios organizados por categorías con precios y duraciones
- **Control de Personal**: Asignación de empleados y horarios de trabajo

### 🔐 **Sistema de Autenticación**

- **Autenticación Segura**: Implementada con NextAuth.js
- **Roles de Usuario**: ADMIN, USER y STAFF con permisos específicos
- **Protección de Rutas**: Acceso controlado según roles

### 📊 **Dashboard Inteligente**

- **Métricas en Tiempo Real**: Ingresos, nuevos clientes, citas completadas
- **Calendario Visual**: Vista de citas con código de colores por categoría
- **Reportes**: Análisis de rendimiento y estadísticas del negocio

### 🎨 **Interfaz de Usuario**

- **Diseño Moderno**: UI/UX optimizada con Tailwind CSS y shadcn/ui
- **Responsivo**: Adaptado para desktop, tablet y móvil
- **Accesible**: Cumple estándares de accesibilidad web

## 🏗️ Arquitectura del Sistema

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js App] --> B[React Components]
        B --> C[shadcn/ui Components]
        C --> D[Tailwind CSS]
    end

    subgraph "Authentication Layer"
        E[NextAuth.js] --> F[Session Management]
        F --> G[Role-based Access]
    end

    subgraph "API Layer"
        H[API Routes] --> I[Business Logic]
        I --> J[Data Validation]
        J --> K[Prisma ORM]
    end

    subgraph "Database Layer"
        L[(PostgreSQL)]
        K --> L
    end

    subgraph "External Services"
        M[Calendar Integration]
        N[Email Notifications]
    end

    A --> E
    A --> H
    H --> M
    H --> N

    style A fill:#0070f3
    style E fill:#f9f
    style H fill:#0891b2
    style L fill:#336791
```

## 🗃️ Modelo de Datos

```mermaid
erDiagram
    User {
        string id PK
        string name
        string email UK
        enum role
        boolean enabled
        datetime createdAt
    }

    Customer {
        string id PK
        string firstName
        string lastName
        string email UK
        string phone
        string address
        date dateOfBirth
        text notes
        string createdBy FK
    }

    ServiceCategory {
        string id PK
        string name
        string description
        string color
        boolean enabled
    }

    Service {
        string id PK
        string name
        text description
        int duration
        decimal price
        string color
        string categoryId FK
        string createdBy FK
    }

    Appointment {
        string id PK
        datetime startTime
        datetime endTime
        enum status
        string customerId FK
        string serviceId FK
        string staffId FK
        string userId FK
        text notes
        decimal price
    }

    WorkingHours {
        string id PK
        int dayOfWeek
        string startTime
        string endTime
        string staffId FK
    }

    User ||--o{ Customer : creates
    User ||--o{ Service : creates
    User ||--o{ Appointment : manages
    User ||--o{ Appointment : "assigned as staff"
    User ||--o{ WorkingHours : "has schedule"

    Customer ||--o{ Appointment : books
    Service ||--o{ Appointment : "is booked for"
    ServiceCategory ||--o{ Service : contains
```

## 👥 Flujo de Usuarios

```mermaid
flowchart TD
    A[Usuario Accede al Sistema] --> B{¿Autenticado?}
    B -->|No| C[Login/Registro]
    B -->|Sí| D{¿Qué Rol?}

    C --> D

    D -->|ADMIN| E[Dashboard Completo]
    D -->|USER| F[Dashboard Básico]
    D -->|STAFF| G[Vista de Empleado]

    E --> H[Gestión de Usuarios]
    E --> I[Gestión de Clientes]
    E --> J[Gestión de Servicios]
    E --> K[Gestión de Categorías]
    E --> L[Agendamiento de Citas]
    E --> M[Reportes y Métricas]

    F --> I
    F --> J
    F --> L
    F --> N[Ver Calendario]

    G --> O[Ver Citas Asignadas]
    G --> P[Actualizar Estado de Citas]
    G --> N

    L --> Q[Seleccionar Cliente]
    Q --> R[Elegir Servicio]
    R --> S[Seleccionar Fecha/Hora]
    S --> T[Asignar Personal]
    T --> U[Confirmar Cita]

    style E fill:#e1f5fe
    style F fill:#f3e5f5
    style G fill:#e8f5e8
    style U fill:#4caf50
```

## 🛠️ Tecnologías Utilizadas

### **Frontend**

- **[Next.js 15.3.2](https://nextjs.org/)** - Framework de React con SSR/SSG
- **[React 19](https://reactjs.org/)** - Biblioteca de interfaz de usuario
- **[TypeScript 5](https://www.typescriptlang.org/)** - Superset tipado de JavaScript
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Framework de utilidades CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI modernos y accesibles

### **Backend & Base de Datos**

- **[Prisma 5.19](https://www.prisma.io/)** - ORM de próxima generación
- **[PostgreSQL](https://www.postgresql.org/)** - Base de datos relacional robusta
- **[NextAuth.js 4.24](https://next-auth.js.org/)** - Autenticación completa para Next.js

### **Librerías Especializadas**

- **[React Big Calendar](https://github.com/jquense/react-big-calendar)** - Componente de calendario interactivo
- **[React Hook Form](https://react-hook-form.com/)** - Manejo eficiente de formularios
- **[Zod](https://zod.dev/)** - Validación de esquemas TypeScript-first
- **[date-fns](https://date-fns.org/)** - Utilidades modernas para fechas
- **[Lucide React](https://lucide.dev/)** - Iconos SVG modulares

### **Herramientas de Desarrollo**

- **[pnpm](https://pnpm.io/)** - Gestor de paquetes rápido y eficiente
- **[ESLint](https://eslint.org/)** - Linter para JavaScript/TypeScript
- **[Turbopack](https://turbo.build/pack)** - Bundler ultrarrápido para desarrollo

## 🚀 Instalación

### Prerrequisitos

- **Node.js** 18.17 o superior
- **pnpm** 8.0 o superior
- **PostgreSQL** 13 o superior

### Pasos de Instalación

1. **Clona el repositorio**

```bash
git clone https://github.com/davidc-garciae/BeautyCenter.git
cd BeautyCenter
```

2. **Instala las dependencias**

```bash
pnpm install
```

3. **Configura las variables de entorno**

```bash
cp .env.example .env.local
```

4. **Configura la base de datos**

```bash
# Genera el cliente de Prisma
pnpm prisma generate

# Ejecuta las migraciones
pnpm prisma db push

# Opcional: Llena la base de datos con datos de ejemplo (ver prisma/README_SEED.md)
# pnpm run db:seed
```

5. **Inicia el servidor de desarrollo**

```bash
pnpm dev
```

El servidor estará disponible en [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuración

### Variables de Entorno Requeridas

```env
NEXTAUTH_SECRET="tu-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
AUTH0_DOMAIN="tu-dominio.auth0.com"
AUTH0_CLIENT_ID="tu-auth0-client-id"
AUTH0_CLIENT_SECRET="tu-auth0-client-secret"
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/centro_belleza"
```

### Configuración de Base de Datos

1. **Crea la base de datos PostgreSQL**

```sql
CREATE DATABASE centro_belleza;
```

2. **Aplica las migraciones**

```bash
pnpm prisma migrate dev
```

3. **Verifica la conexión**

```bash
pnpm prisma studio
```

## 📱 Uso del Sistema

### **👥 Usuarios de Prueba**

Para probar la aplicación, puedes usar estas credenciales predefinidas:

#### **🔑 Usuario Administrador**

- **Email:** `admin@admin.com`
- **Contraseña:** `Admin123`
- **Permisos:** Acceso completo al sistema (crear, editar, eliminar)

#### **🔑 Usuario Estándar**

- **Email:** `user@user.com`
- **Contraseña:** `User1234`
- **Permisos:** Gestión de citas, servicios y categorías (sin administración de usuarios)

---

### **Administrador (ADMIN)**

- ✅ Acceso completo a todas las funcionalidades
- ✅ Gestión de usuarios, clientes, servicios y categorías
- ✅ Visualización de métricas y reportes
- ✅ Configuración del sistema

### **Usuario (USER)**

- ✅ Gestión de clientes y servicios
- ✅ Agendamiento y seguimiento de citas
- ✅ Acceso al calendario de citas
- ❌ No puede gestionar usuarios ni categorías

### **Personal (STAFF)**

- ✅ Ver citas asignadas
- ✅ Actualizar estado de citas
- ✅ Acceso al calendario personal
- ❌ Funcionalidades administrativas limitadas

### Flujo de Trabajo Típico

1. **Administrador configura el sistema**

   - Crea categorías de servicios (Cabello, Uñas, Facial, etc.)
   - Define servicios con precios y duraciones
   - Registra personal y asigna horarios

2. **Usuario gestiona clientes**

   - Registra nuevos clientes con datos completos
   - Mantiene historial de servicios por cliente

3. **Agendamiento de citas**

   - Selecciona cliente y servicio
   - Elige fecha/hora disponible
   - Asigna personal especializado
   - Confirma la reserva

4. **Seguimiento y control**
   - Dashboard con métricas actualizadas
   - Calendario visual de todas las citas
   - Estados de citas en tiempo real

## 📁 Estructura del Proyecto

```
centro-belleza/
├── 📂 prisma/              # Configuración de base de datos
│   ├── migrations/         # Migraciones de BD
│   ├── schema.prisma      # Esquema de datos
│   └── seed.ts            # Datos iniciales
├── 📂 public/             # Archivos estáticos
├── 📂 src/
│   ├── 📂 components/     # Componentes React organizados por Atomic Design
│   │   ├── atoms/         # Componentes básicos
│   │   ├── molecules/     # Componentes compuestos
│   │   ├── organisms/     # Componentes complejos
│   │   ├── templates/     # Plantillas de página
│   │   └── ui/            # Componentes shadcn/ui
│   ├── 📂 pages/          # Páginas de Next.js
│   │   ├── admin/         # Panel administrativo
│   │   ├── api/           # API Routes
│   │   └── _app.tsx       # Aplicación principal
│   ├── 📂 styles/         # Estilos globales
│   ├── 📂 lib/            # Utilidades y configuraciones
│   ├── 📂 hooks/          # Custom React Hooks
│   └── 📂 config/         # Configuraciones del sistema
├── 📂 types/              # Definiciones de tipos TypeScript
├── package.json           # Dependencias y scripts
├── tailwind.config.js     # Configuración de Tailwind
├── tsconfig.json          # Configuración de TypeScript
└── README.md              # Este archivo
```

## 📜 Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Inicia servidor de desarrollo con Turbopack
pnpm build            # Construye la aplicación para producción
pnpm start            # Inicia servidor de producción
pnpm lint             # Ejecuta ESLint para revisar código

# Base de datos
pnpm prisma studio    # Abre Prisma Studio (interfaz visual de BD)
pnpm prisma generate  # Genera cliente de Prisma
pnpm prisma migrate   # Ejecuta migraciones pendientes
pnpm run db:seed      # Llena la BD con datos de ejemplo

# Utilidades
pnpm type-check       # Verifica tipos de TypeScript
pnpm format           # Formatea código con Prettier
```

## 🎨 Personalización

### Tema y Colores

El sistema utiliza un sistema de variables CSS para fácil personalización:

```css
/* styles/globals.css */
:root {
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  /* ... más variables */
}
```

### Componentes UI

Todos los componentes UI están basados en shadcn/ui y pueden personalizarse:

```bash
# Agregar nuevos componentes
npx shadcn-ui@latest add [component-name]

# Personalizar componentes existentes
# Edita archivos en src/components/ui/
```

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor sigue estos pasos:

1. **Fork el proyecto**
2. **Crea una rama para tu feature** (`git checkout -b feature/AmazingFeature`)
3. **Commit tus cambios** (`git commit -m 'Add some AmazingFeature'`)
4. **Push a la rama** (`git push origin feature/AmazingFeature`)
5. **Abre un Pull Request**

### Guías de Contribución

- Sigue las convenciones de código establecidas
- Incluye tests para nuevas funcionalidades
- Actualiza la documentación cuando sea necesario
- Usa commits descriptivos siguiendo [Conventional Commits](https://www.conventionalcommits.org/)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

**Desarrollado con ❤️ para centros de belleza modernos**

¿Preguntas o sugerencias? [Abre un issue](https://github.com/tu-usuario/centro-belleza/issues)

---

# 💄 Beauty Center - Appointment Scheduling System

[🇪🇸 Español](#espanol) | [🌐 English](#english)

# English

<!-- =======================
     ENGLISH VERSION
     ======================= -->

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791?style=for-the-badge&logo=postgresql) ![Auth0](https://img.shields.io/badge/Auth0-Authentication-EB5424?style=for-the-badge&logo=auth0&logoColor=white)

Comprehensive management and appointment scheduling system for beauty centers and spas. Designed to optimize the administration of services, clients, staff, and schedules with a modern and functional interface.

## 📋 Table of Contents

- [Main Features](#-main-features)
- [System Architecture](#-system-architecture)
- [Data Model](#-data-model)
- [User Flow](#-user-flow)
- [Technologies Used](#-technologies-used)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [System Usage](#-system-usage)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Main Features

### 🎯 **Comprehensive Management**

- **Appointment Scheduling**: Complete booking system with interactive calendar
- **Client Management**: Full CRUD with appointment history and personal data
- **Service Catalog**: Services organized by categories with prices and durations
- **Staff Control**: Employee assignment and working hours

### 🔐 **Authentication System**

- **Secure Authentication**: Implemented with NextAuth.js
- **User Roles**: ADMIN, USER, and STAFF with specific permissions
- **Route Protection**: Access controlled by roles

### 📊 **Smart Dashboard**

- **Real-Time Metrics**: Revenue, new clients, completed appointments
- **Visual Calendar**: Appointment view with color codes by category
- **Reports**: Business performance and statistics

### 🎨 **User Interface**

- **Modern Design**: Optimized UI/UX with Tailwind CSS and shadcn/ui
- **Responsive**: Adapted for desktop, tablet, and mobile
- **Accessible**: Meets web accessibility standards

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js App] --> B[React Components]
        B --> C[shadcn/ui Components]
        C --> D[Tailwind CSS]
    end
    subgraph "Authentication Layer"
        E[NextAuth.js] --> F[Session Management]
        F --> G[Role-based Access]
    end
    subgraph "API Layer"
        H[API Routes] --> I[Business Logic]
        I --> J[Data Validation]
        J --> K[Prisma ORM]
    end
    subgraph "Database Layer"
        L[(PostgreSQL)]
        K --> L
    end
    subgraph "External Services"
        M[Calendar Integration]
        N[Email Notifications]
    end
    A --> E
    A --> H
    H --> M
    H --> N
    style A fill:#0070f3
    style E fill:#f9f
    style H fill:#0891b2
    style L fill:#336791
```

## 🗃️ Data Model

```mermaid
erDiagram
    User {
        string id PK
        string name
        string email UK
        enum role
        boolean enabled
        datetime createdAt
    }
    Customer {
        string id PK
        string firstName
        string lastName
        string email UK
        string phone
        string address
        date dateOfBirth
        text notes
        string createdBy FK
    }
    ServiceCategory {
        string id PK
        string name
        string description
        string color
        boolean enabled
    }
    Service {
        string id PK
        string name
        text description
        int duration
        decimal price
        string color
        string categoryId FK
        string createdBy FK
    }
    Appointment {
        string id PK
        datetime startTime
        datetime endTime
        enum status
        string customerId FK
        string serviceId FK
        string staffId FK
        string userId FK
        text notes
        decimal price
    }
    WorkingHours {
        string id PK
        int dayOfWeek
        string startTime
        string endTime
        string staffId FK
    }
    User ||--o{ Customer : creates
    User ||--o{ Service : creates
    User ||--o{ Appointment : manages
    User ||--o{ Appointment : "assigned as staff"
    User ||--o{ WorkingHours : "has schedule"
    Customer ||--o{ Appointment : books
    Service ||--o{ Appointment : "is booked for"
    ServiceCategory ||--o{ Service : contains
```

## 👥 User Flow

```mermaid
flowchart TD
    A[User Accesses System] --> B{Authenticated?}
    B -->|No| C[Login/Register]
    B -->|Yes| D{Role?}
    C --> D
    D -->|ADMIN| E[Full Dashboard]
    D -->|USER| F[Basic Dashboard]
    D -->|STAFF| G[Staff View]
    E --> H[User Management]
    E --> I[Client Management]
    E --> J[Service Management]
    E --> K[Category Management]
    E --> L[Appointment Scheduling]
    E --> M[Reports & Metrics]
    F --> I
    F --> J
    F --> L
    F --> N[View Calendar]
    G --> O[View Assigned Appointments]
    G --> P[Update Appointment Status]
    G --> N
    L --> Q[Select Client]
    Q --> R[Choose Service]
    R --> S[Select Date/Time]
    S --> T[Assign Staff]
    T --> U[Confirm Appointment]
    style E fill:#e1f5fe
    style F fill:#f3e5f5
    style G fill:#e8f5e8
    style U fill:#4caf50
```

## 🛠️ Technologies Used

### **Frontend**

- **[Next.js 15.3.2](https://nextjs.org/)** - React framework with SSR/SSG
- **[React 19](https://reactjs.org/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Typed superset of JavaScript
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Modern, accessible UI components

### **Backend & Database**

- **[Prisma 5.19](https://www.prisma.io/)** - Next-gen ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Robust relational database
- **[NextAuth.js 4.24](https://next-auth.js.org/)** - Full authentication for Next.js

### **Specialized Libraries**

- **[React Big Calendar](https://github.com/jquense/react-big-calendar)** - Interactive calendar component
- **[React Hook Form](https://react-hook-form.com/)** - Efficient form handling
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation
- **[date-fns](https://date-fns.org/)** - Modern date utilities
- **[Lucide React](https://lucide.dev/)** - Modular SVG icons

### **Development Tools**

- **[pnpm](https://pnpm.io/)** - Fast, efficient package manager
- **[ESLint](https://eslint.org/)** - Linter for JavaScript/TypeScript
- **[Turbopack](https://turbo.build/pack)** - Ultra-fast dev bundler

## 🚀 Installation

### Prerequisites

- **Node.js** 18.17 or higher
- **pnpm** 8.0 or higher
- **PostgreSQL** 13 or higher

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/davidc-garciae/BeautyCenter.git
cd BeautyCenter
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure environment variables**

```bash
cp .env.example .env.local
```

4. **Set up the database**

```bash
# Generate Prisma client
pnpm prisma generate
# Run migrations
pnpm prisma db push
# (Optional) Seed the database
pnpm run db:seed
```

5. **Start the development server**

```bash
pnpm dev
```

The server will be available at [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### Required Environment Variables

```env
NEXTAUTH_SECRET="tu-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
AUTH0_DOMAIN="tu-dominio.auth0.com"
AUTH0_CLIENT_ID="tu-auth0-client-id"
AUTH0_CLIENT_SECRET="tu-auth0-client-secret"
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/centro_belleza"
```

### Database Setup

1. **Create the PostgreSQL database**

```sql
CREATE DATABASE centro_belleza;
```

2. **Apply migrations**

```bash
pnpm prisma migrate dev
```

3. **Check the connection**

```bash
pnpm prisma studio
```

## 📱 System Usage

### **👥 Test Users**

To test the application, you can use these predefined credentials:

#### **🔑 Administrator User**

- **Email:** `admin@admin.com`
- **Password:** `Admin123`
- **Permissions:** Full system access (create, edit, delete)

#### **🔑 Standard User**

- **Email:** `user@user.com`
- **Password:** `User1234`
- **Permissions:** Appointment, service, and category management (no user administration)

---

### **Administrator (ADMIN)**

- ✅ Full access to all features
- ✅ User, client, service, and category management
- ✅ Metrics and reports
- ✅ System configuration

### **User (USER)**

- ✅ Client and service management
- ✅ Appointment scheduling and tracking
- ✅ Access to appointment calendar
- ❌ Cannot manage users or categories

### **Staff (STAFF)**

- ✅ View assigned appointments
- ✅ Update appointment status
- ✅ Access to personal calendar
- ❌ Limited administrative features

### Typical Workflow

1. **Admin configures the system**
   - Creates service categories (Hair, Nails, Facial, etc.)
   - Defines services with prices and durations
   - Registers staff and assigns schedules
2. **User manages clients**
   - Registers new clients with full data
   - Maintains service history per client
3. **Appointment scheduling**
   - Selects client and service
   - Chooses available date/time
   - Assigns specialized staff
   - Confirms the booking
4. **Monitoring and control**
   - Dashboard with updated metrics
   - Visual calendar of all appointments
   - Real-time appointment statuses

## 📁 Project Structure

```
beauty-center/
├── prisma/              # Database config
│   ├── migrations/      # DB migrations
│   ├── schema.prisma    # Data schema
│   └── seed.ts          # Seed data
├── public/              # Static files
├── src/
│   ├── components/      # React components (Atomic Design)
│   │   ├── atoms/       # Basic components
│   │   ├── molecules/   # Compound components
│   │   ├── organisms/   # Complex components
│   │   ├── templates/   # Page templates
│   │   └── ui/          # shadcn/ui components
│   ├── pages/           # Next.js pages
│   │   ├── admin/       # Admin panel
│   │   ├── api/         # API routes
│   │   └── _app.tsx     # Main app
│   ├── styles/          # Global styles
│   ├── lib/             # Utilities and config
│   ├── hooks/           # Custom React hooks
│   └── config/          # System config
├── types/               # TypeScript types
├── package.json         # Dependencies & scripts
├── tailwind.config.js   # Tailwind config
├── tsconfig.json        # TypeScript config
└── README.md            # This file
```

## 📜 Available Scripts

```bash
# Development
pnpm dev              # Start dev server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm prisma studio    # Open Prisma Studio (DB UI)
pnpm prisma generate  # Generate Prisma client
pnpm prisma migrate   # Run pending migrations
pnpm run db:seed      # Seed the DB

# Utilities
pnpm type-check       # TypeScript type check
pnpm format           # Format code with Prettier
```

## 🎨 Customization

### Theme & Colors

The system uses CSS variables for easy customization:

```css
/* styles/globals.css */
:root {
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  /* ... more variables */
}
```

### UI Components

All UI components are based on shadcn/ui and can be customized:

```bash
# Add new components
npx shadcn-ui@latest add [component-name]
# Customize existing components
# Edit files in src/components/ui/
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the project**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Contribution Guidelines

- Follow established code conventions
- Include tests for new features
- Update documentation as needed
- Use descriptive commits following [Conventional Commits](https://www.conventionalcommits.org/)

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Developed with ❤️ for modern beauty centers**

Questions or suggestions? [Open an issue](https://github.com/your-user/beauty-center/issues)
