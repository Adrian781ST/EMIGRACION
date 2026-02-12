-- E-Migrante Database Schema for Supabase (PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('MIGRANTE', 'ENTIDAD', 'GERENCIA')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table: entidades
CREATE TABLE IF NOT EXISTS entidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    tipo TEXT NOT NULL CHECK (tipo IN ('SALUD', 'EDUCACION', 'LEGAL', 'VIVIENDA', 'EMPLEO', 'ALIMENTACION', 'OTROS')),
    direccion TEXT,
    telefono TEXT,
    email TEXT,
    habilitado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table: servicios_entidad
CREATE TABLE IF NOT EXISTS servicios_entidad (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entidad_id UUID REFERENCES entidades(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    tipo TEXT NOT NULL CHECK (tipo IN ('SALUD', 'EDUCACION', 'LEGAL', 'VIVIENDA', 'EMPLEO', 'ALIMENTACION', 'OTROS')),
    habilitado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table: emergencias
CREATE TABLE IF NOT EXISTS emergencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    entidad_id UUID REFERENCES entidades(id) ON DELETE SET NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('SALUD', 'LEGAL', 'VIVIENDA', 'ALIMENTACION', 'EMPLEO', 'OTROS')),
    descripcion TEXT NOT NULL,
    direccion TEXT,
    estado TEXT DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'ATENDIDA', 'CANCELADA')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table: calificaciones
CREATE TABLE IF NOT EXISTS calificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entidad_id UUID REFERENCES entidades(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table: novedades
CREATE TABLE IF NOT EXISTS novedades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('INFORMACION', 'ALERTA', 'EVENTO')),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios_entidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE calificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE novedades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usuarios
CREATE POLICY "Users can view all usuarios" ON usuarios FOR SELECT USING (true);
CREATE POLICY "Users can insert their own data" ON usuarios FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own data" ON usuarios FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for entidades
CREATE POLICY "Anyone can view enabled entidades" ON entidades FOR SELECT USING (habilitado = true);
CREATE POLICY "Entidades can insert own data" ON entidades FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Entidades can update own data" ON entidades FOR UPDATE USING (auth.uid() = usuario_id);

-- RLS Policies for servicios_entidad
CREATE POLICY "Anyone can view enabled servicios" ON servicios_entidad FOR SELECT USING (habilitado = true);
CREATE POLICY "Entidades can manage own servicios" ON servicios_entidad FOR ALL USING (
    EXISTS (SELECT 1 FROM entidades WHERE id = servicios_entidad.entidad_id AND usuario_id = auth.uid())
);

-- RLS Policies for emergencias
CREATE POLICY "Users can view own emergencias" ON emergencias FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Entidades can view all emergencias" ON emergencias FOR SELECT USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo = 'ENTIDAD')
);
CREATE POLICY "Gerencia can view all emergencias" ON emergencias FOR SELECT USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo = 'GERENCIA')
);
CREATE POLICY "Users can insert own emergencias" ON emergencias FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Entidades can update emergencias" ON emergencias FOR UPDATE USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo = 'ENTIDAD')
);

-- RLS Policies for calificaciones
CREATE POLICY "Anyone can view calificaciones" ON calificaciones FOR SELECT USING (true);
CREATE POLICY "Users can insert own calificaciones" ON calificaciones FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Gerencia can manage all calificaciones" ON calificaciones FOR ALL USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo = 'GERENCIA')
);

-- RLS Policies for novedades
CREATE POLICY "Anyone can view active novedades" ON novedades FOR SELECT USING (activa = true);
CREATE POLICY "Gerencia can manage novedades" ON novedades FOR ALL USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo = 'GERENCIA')
);

-- Function to automatically create usuario record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, nombre, email, tipo)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'tipo', 'MIGRANTE')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entidades_tipo ON entidades(tipo);
CREATE INDEX IF NOT EXISTS idx_emergencias_usuario ON emergencias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_emergencias_estado ON emergencias(estado);
CREATE INDEX IF NOT EXISTS idx_calificaciones_entidad ON calificaciones(entidad_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_usuario ON calificaciones(usuario_id);
