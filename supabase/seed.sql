-- Seed data for E-Migrante (Supabase)

-- Insert sample entidades
INSERT INTO entidades (id, usuario_id, nombre, descripcion, tipo, direccion, telefono, email, habilitado) VALUES
('11111111-1111-1111-1111-111111111111', NULL, 'Hospital Central', 'Hospital público con atención de urgencias para migrantes', 'SALUD', 'Carrera 10 #15-20', '555-0101', 'hospital@ejemplo.com', true),
('22222222-2222-2222-2222-222222222222', NULL, 'Universidad Nacional', 'Programas de integración educativa para migrantes', 'EDUCACION', 'Calle 45 #10-25', '555-0202', 'universidad@ejemplo.com', true),
('33333333-3333-3333-3333-333333333333', NULL, 'Consultoría Legal Migratoria', 'Asesoría legal en trámites de migración', 'LEGAL', 'Carrera 7 #50-15', '555-0303', 'legal@ejemplo.com', true),
('44444444-4444-4444-4444-444444444444', NULL, 'Fundación Esperanza', 'Albergue temporal y alimentación para migrantes', 'VIVIENDA', 'Calle 30 #5-40', '555-0404', 'fundacion@ejemplo.com', true),
('55555555-5555-5555-5555-555555555555', NULL, 'Agencia de Empleo Migrante', 'Conexión laboral para migrantes', 'EMPLEO', 'Carrera 15 #20-30', '555-0505', 'empleo@ejemplo.com', true),
('66666666-6666-6666-6666-666666666666', NULL, 'Banco de Alimentos', 'Distribución de alimentos a población migrante', 'ALIMENTACION', 'Calle 60 #10-10', '555-0606', 'alimentos@ejemplo.com', true),
('77777777-7777-7777-7777-777777777777', NULL, 'Centro de Atención Integral', 'Servicios múltiples para migrantes', 'OTROS', 'Carrera 5 #15-50', '555-0707', 'centro@ejemplo.com', true);

-- Insert sample servicios
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

-- Insert sample calificaciones
INSERT INTO calificaciones (entidad_id, usuario_id, calificacion, comentario) VALUES
('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 5, 'Excelente atención en urgencias, muy agradecidos.'),
('11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', 4, 'Buen servicio, solo esperé un poco en espera.'),
('22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', 5, 'Los cursos de español son muy buenos.'),
('33333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888', 4, 'Me ayudaron con mi visa de protección.'),
('44444444-4444-4444-4444-444444444444', '99999999-9999-9999-9999-999999999999', 5, 'El albergue me salvó cuando llegué sin recursos.');

-- Insert sample novedades
INSERT INTO novedades (titulo, contenido, tipo, activa) VALUES
('Registro para Permiso Temporal de Permanencia', 'Se abre el período de registro para el nuevo PPT. Acude a las entidades legales para más información.', 'INFORMACION', true),
('Alerta: Servicios de Salud para Migrantes', 'Recordamos que los servicios de urgencias están disponibles para todos los migrantes.', 'ALERTA', true),
('Feria de Empleo Migrante', 'Próximamente se realizará una feria de empleo para migrantes. Inscríbete en la agencia de empleo.', 'EVENTO', true),
('Nuevos Cursos de Español', 'Inscríbete en los nuevos ciclos de cursos de español para migrantes.', 'INFORMACION', true);

-- Note: User accounts will be created automatically through Supabase Auth
-- You can create test users through the Supabase Dashboard or the signup flow
