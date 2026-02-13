-- E-Migrante Database Setup - Copia todo esto y pégalo en SQL Editor de Supabase

-- 1. CREAR EXTENSIÓN UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREAR TABLAS
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS entidades CASCADE;
DROP TABLE IF EXISTS servicios_entidad CASCADE;
DROP TABLE IF EXISTS emergencias CASCADE;
DROP TABLE IF EXISTS calificaciones CASCADE;
DROP TABLE IF EXISTS novedades CASCADE;

CREATE TABLE usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('MIGRANTE', 'ENTIDAD', 'GERENCIA')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE entidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    nombre TEXT NOT NULL,
    codigo_institucion TEXT UNIQUE,
    descripcion TEXT,
    tipo TEXT NOT NULL CHECK (tipo IN ('SALUD', 'EDUCACION', 'LEGAL', 'VIVIENDA', 'EMPLEO', 'ALIMENTACION', 'OTROS')),
    direccion TEXT,
    telefono TEXT,
    email TEXT,
    website TEXT,
    habilitado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE servicios_entidad (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entidad_id UUID REFERENCES entidades(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    tipo TEXT NOT NULL CHECK (tipo IN ('SALUD', 'EDUCACION', 'LEGAL', 'VIVIENDA', 'EMPLEO', 'ALIMENTACION', 'OTROS')),
    habilitado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE emergencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    entidad_id UUID REFERENCES entidades(id) ON DELETE SET NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('SALUD', 'LEGAL', 'VIVIENDA', 'ALIMENTACION', 'EMPLEO', 'OTROS')),
    descripcion TEXT NOT NULL,
    direccion TEXT,
    estado TEXT DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'ASIGNADA', 'ATENDIDA', 'CANCELADA')),
    prioridad TEXT DEFAULT 'NORMAL' CHECK (prioridad IN ('BAJA', 'NORMAL', 'ALTA', 'URGENTE')),
    seguimiento TEXT,
    fecha_asignacion TIMESTAMP WITH TIME ZONE,
    fecha_atencion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE calificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entidad_id UUID REFERENCES entidades(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE novedades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('INFORMACION', 'ALERTA', 'EVENTO')),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. HABILITAR RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios_entidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE calificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE novedades ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS RLS
CREATE POLICY "Users can view all usuarios" ON usuarios FOR SELECT USING (true);
CREATE POLICY "Users can insert their own data" ON usuarios FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own data" ON usuarios FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view enabled entidades" ON entidades FOR SELECT USING (habilitado = true);
CREATE POLICY "Entidades can insert own data" ON entidades FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Entidades can update own data" ON entidades FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Anyone can view enabled servicios" ON servicios_entidad FOR SELECT USING (habilitado = true);
CREATE POLICY "Entidades can manage own servicios" ON servicios_entidad FOR ALL USING (
    EXISTS (SELECT 1 FROM entidades WHERE id = servicios_entidad.entidad_id AND usuario_id = auth.uid())
);

CREATE POLICY "Users can view own emergencias" ON emergencias FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Entidades can view all emergencias" ON emergencias FOR SELECT USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo = 'ENTIDAD')
);
CREATE POLICY "Gerencia can view all emergencias" ON emergencias FOR SELECT USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo = 'GERENCIA')
);
CREATE POLICY "Users can insert own emergencias" ON emergencias FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Entidades can update assigned emergencias" ON emergencias FOR UPDATE USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo = 'ENTIDAD')
);
CREATE POLICY "Gerencia can manage all emergencias" ON emergencias FOR ALL USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo = 'GERENCIA')
);

CREATE POLICY "Users can view own calificaciones" ON calificaciones FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Entidades can view their calificaciones" ON calificaciones FOR SELECT USING (
    EXISTS (SELECT 1 FROM entidades WHERE id = calificaciones.entidad_id AND usuario_id = auth.uid())
);
CREATE POLICY "Gerencia can view all calificaciones" ON calificaciones FOR SELECT USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo = 'GERENCIA')
);
CREATE POLICY "Users can insert own calificaciones" ON calificaciones FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Gerencia can manage all calificaciones" ON calificaciones FOR ALL USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo = 'GERENCIA')
);

CREATE POLICY "Anyone can view active novedades" ON novedades FOR SELECT USING (activa = true);
CREATE POLICY "Gerencia can manage novedades" ON novedades FOR ALL USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo = 'GERENCIA')
);

-- 5. FUNCIÓN Y TRIGGER PARA CREAR PERFIL AUTOMÁTICAMENTE
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. CREAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_entidades_tipo ON entidades(tipo);
CREATE INDEX IF NOT EXISTS idx_emergencias_usuario ON emergencias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_emergencias_estado ON emergencias(estado);
CREATE INDEX IF NOT EXISTS idx_calificaciones_entidad ON calificaciones(entidad_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_usuario ON calificaciones(usuario_id);

-- 7. INSERTAR DATOS DE PRUEBA (ENTIDADES)
INSERT INTO entidades (id, usuario_id, nombre, codigo_institucion, descripcion, tipo, direccion, telefono, email, website, habilitado) VALUES
('11111111-1111-1111-1111-111111111111', NULL, 'Hospital Central', 'SAL-2024-0001', 'Hospital público con atención de urgencias para migrantes', 'SALUD', 'Carrera 10 #15-20', '555-0101', 'hospital@ejemplo.com', 'https://hospitalcentral.gov.co', true),
('22222222-2222-2222-2222-222222222222', NULL, 'Universidad Nacional', 'EDU-2024-0002', 'Programas de integración educativa para migrantes', 'EDUCACION', 'Calle 45 #10-25', '555-0202', 'universidad@ejemplo.com', 'https://un.edu.co', true),
('33333333-3333-3333-3333-333333333333', NULL, 'Consultoría Legal Migratoria', 'LEG-2024-0003', 'Asesoría legal en trámites de migración', 'LEGAL', 'Carrera 7 #50-15', '555-0303', 'legal@ejemplo.com', 'https://legalmigratoria.com.co', true),
('44444444-4444-4444-4444-444444444444', NULL, 'Fundación Esperanza', 'VIV-2024-0004', 'Albergue temporal y alimentación para migrantes', 'VIVIENDA', 'Calle 30 #5-40', '555-0404', 'fundacion@ejemplo.com', 'https://fundacionesperanza.org', true),
('55555555-5555-5555-5555-555555555555', NULL, 'Agencia de Empleo Migrante', 'EMP-2024-0005', 'Conexión laboral para migrantes', 'EMPLEO', 'Carrera 15 #20-30', '555-0505', 'empleo@ejemplo.com', 'https://empleomigrante.gov.co', true),
('66666666-6666-6666-6666-666666666666', NULL, 'Banco de Alimentos', 'ALI-2024-0006', 'Distribución de alimentos a población migrante', 'ALIMENTACION', 'Calle 60 #10-10', '555-0606', 'alimentos@ejemplo.com', 'https://bancodealimentos.org.co', true),
('77777777-7777-7777-7777-777777777777', NULL, 'Centro de Atención Integral', 'OTR-2024-0007', 'Servicios múltiples para migrantes', 'OTROS', 'Carrera 5 #15-50', '555-0707', 'centro@ejemplo.com', 'https://centroatencional.gob.co', true);

-- 8. INSERTAR SERVICIOS DE ENTIDADES
INSERT INTO servicios_entidad (entidad_id, nombre, descripcion, tipo, habilitado) VALUES
('11111111-1111-1111-1111-111111111111', 'Urgencias 24 horas', 'Atención de urgencias médicas', 'SALUD', true),
('11111111-1111-1111-1111-111111111111', 'Consultas generales', 'Medicina general y especialidades', 'SALUD', true),
('22222222-2222-2222-2222-222222222222', 'Cursos de español', 'Clases de español para migrantes', 'EDUCACION', true),
('22222222-2222-2222-2222-222222222222', 'Validación de estudios', 'Proceso de validación de títulos', 'EDUCACION', true),
('33333333-3333-3333-3333-333333333333', 'Trámite de visa', 'Asesoría para visa de protección', 'LEGAL', true),
('33333333-3333-3333-3333-333333333333', 'Regularización', 'Proceso de regularización migratoria', 'LEGAL', true),
('44444444-4444-4444-4444-444444444444', 'Albergue temporal', 'Alojamiento temporal hasta 30 días', 'VIVIENDA', true),
('44444444-4444-4444-4444-444444444444', 'Asesoría habitacional', 'Orientación para vivienda permanente', 'VIVIENDA', true),
('55555555-5555-5555-5555-555555555555', 'Bolsa de empleo', 'Publicación de ofertas laborales', 'EMPLEO', true),
('55555555-5555-5555-5555-555555555555', 'Capacitación laboral', 'Talleres de habilidades laborales', 'EMPLEO', true);

-- 9. INSERTAR NOVEDADES
INSERT INTO novedades (titulo, contenido, tipo, activa) VALUES
('Registro para Permiso Temporal de Permanencia', 'Se abre el período de registro para el nuevo PPT. Acude a las entidades legales para más información.', 'INFORMACION', true),
('Alerta: Servicios de Salud para Migrantes', 'Recordamos que los servicios de urgencias están disponibles para todos los migrantes.', 'ALERTA', true),
('Feria de Empleo Migrante', 'Próximamente se realizará una feria de empleo para migrantes. Inscríbete en la agencia de empleo.', 'EVENTO', true),
('Nuevos Cursos de Español', 'Inscríbete en los nuevos ciclos de cursos de español para migrantes.', 'INFORMACION', true);

-- 10. CREAR PERFILES PARA USUARIOS EXISTENTES (SI LOS HAY)
-- Esta parte crea perfiles para usuarios que ya se registraron antes del trigger
DO $$
DECLARE
    u RECORD;
BEGIN
    FOR u IN SELECT * FROM auth.users WHERE NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.users.id) LOOP
        INSERT INTO public.usuarios (id, nombre, email, tipo)
        VALUES (
            u.id,
            COALESCE(u.raw_user_meta_data->>'nombre', u.email),
            u.email,
            COALESCE(u.raw_user_meta_data->>'tipo', 'MIGRANTE')
        );
    END LOOP;
END $$;

-- VERIFICAR
SELECT 'Usuarios creados:' AS mensaje, COUNT(*) AS total FROM public.usuarios;
SELECT 'Entidades creadas:' AS mensaje, COUNT(*) AS total FROM entidades;
SELECT 'Novedades creadas:' AS mensaje, COUNT(*) AS total FROM novedades;

-- Fin del script
