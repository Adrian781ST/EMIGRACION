# DON MIGRANTE - Plataforma para Migrantes

Plataforma web desarrollada en React + Supabase para conectar migrantes con servicios y oportunidades en Colombia.

## 🚀 Despliegue Rápido

### Opción 1: Netlify (Recomendado para Frontend)

1. **Crear cuenta en Netlify** (si no tienes una)

2. **Importar el repositorio**:
   - Ve a [Netlify Dashboard](https://app.netlify.com)
   - Click en "Add new site" → "Import an existing project"
   - Conecta tu cuenta de GitHub y selecciona este repositorio

3. **Configurar variables de entorno**:
   - En Netlify, ve a Site settings → Environment variables
   - Agrega las siguientes variables:
     ```
     VITE_SUPABASE_URL=https://xivrcjdgpcqqnxvuqamg.supabase.co
     VITE_SUPABASE_ANON_KEY=sb_publishable__sv2u4mVAItUhTcANSnfsg_2vIeQgRg
     ```

4. **Configurar build**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click en "Deploy site"

### Opción 2: Azure Static Web Apps

1. **Crear Azure Static Web App**:
   - Ve a [Azure Portal](https://portal.azure.com)
   - Busca "Static Web Apps" y crea uno nuevo
   - Selecciona tu suscripción y grupo de recursos

2. **Configurar con GitHub**:
   - En la creación, selecciona "GitHub" como fuente
   - Autoriza Azure a acceder a tu repositorio
   - Selecciona la rama "main"

3. **Configurar build**:
   - App location: (vacío)
   - Api location: (vacío)
   - App artifact location: `dist`

4. **Agregar variables de entorno**:
   - Ve a Configuration → Environment variables
   - Agrega las mismas variables que en Netlify

## 🗄️ Configuración de Base de Datos (Supabase)

### Si ya tienes el proyecto Supabase configurado:

Las credenciales ya están proporcionadas:
- **URL**: `https://xivrcjdgpcqqnxvuqamg.supabase.co`
- **Anon Key**: `sb_publishable__sv2u4mVAItUhTcANSnfsg_2vIeQgRg`

### Si necesitas crear un nuevo proyecto Supabase:

1. **Crear proyecto**:
   - Ve a [Supabase](https://supabase.com)
   - Crea una cuenta y un nuevo proyecto

2. **Ejecutar schema**:
   - Ve a SQL Editor en Supabase
   - Copia el contenido de `supabase/schema.sql`
   - Ejecuta el SQL

3. **Ejecutar seed**:
   - Copia el contenido de `supabase/seed.sql`
   - Ejecuta el SQL para datos de prueba

4. **Actualizar credenciales**:
   - Actualiza `.env` con tus nuevas credenciales
   - Actualiza las variables de entorno en tu plataforma de despliegue

## 📦 Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/Adrian781ST/DON-MIGRANTE.git
cd DON-MIGRANTE

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus credenciales de Supabase
# VITE_SUPABASE_URL=tu-url
# VITE_SUPABASE_ANON_KEY=tu-key

# Iniciar servidor de desarrollo
npm run dev
```

## 👥 Tipos de Usuario

- **Migrante**: Puede reportar emergencias, ver entidades y evaluar servicios
- **Entidad**: Puede atender emergencias, gestionar servicios y ver evaluaciones
- **Gerencia**: Puede administrar usuarios, ver reportes y publicar novedades

## 🔐 Cuentas de Prueba

Después de ejecutar el seed, puedes crear cuentas de prueba a través del formulario de registro, o usar las credenciales proporcionadas en la documentación del proyecto.

## 📁 Estructura del Proyecto

```
DON MIGRANTE/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── context/        # Contextos de React (Auth)
│   ├── pages/          # Páginas de la aplicación
│   │   ├── migrante/   # Dashboard de migrantes
│   │   ├── entidad/    # Dashboard de entidades
│   │   └── gerencia/   # Dashboard de gerencia
│   ├── lib/           # Configuración de Supabase
│   └── App.jsx        # Componente principal
├── supabase/
│   ├── schema.sql     # Esquema de base de datos
│   └── seed.sql       # Datos de ejemplo
├── .env.example       # Variables de entorno ejemplo
└── staticwebapp.config.json  # Configuración Azure
```

## 🛠️ Tecnologías

- **Frontend**: React 18 + Vite
- **Estilos**: TailwindCSS
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Despliegue**: Netlify / Azure Static Web Apps

## 📝 Licencia

Este proyecto es parte del curso de Arquitectura de Software.
