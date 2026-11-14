-- ============================================================
-- CoinTribe - Seed masivo (35+ usuarios + relaciones)
-- Compatible con PostgreSQL (Neon / Supabase)
-- ============================================================
-- Instrucciones:
-- 1. Crea el proyecto en Neon y copia la connection string.
-- 2. Abre el SQL Editor de Neon (o Supabase).
-- 3. Pega y ejecuta este script completo.
-- 4. Verifica con: SELECT COUNT(*) FROM users;
-- ============================================================

BEGIN;

-- Opcional: limpiar datos previos (descomenta si quieres empezar de cero)
/*
TRUNCATE TABLE 
  user_achievements, 
  user_challenges, 
  posts, 
  users, 
  courses, 
  challenges, 
  achievements, 
  coins 
RESTART IDENTITY CASCADE;
*/

-- ============================================================
-- 1. DATOS BASE
-- ============================================================

-- Cursos
INSERT INTO courses (titulo, tema, descripcion, progreso, total_lecciones, created_at, updated_at)
SELECT v.titulo, v.tema, v.descripcion, v.progreso, v.total_lecciones, NOW(), NOW()
FROM (VALUES
  ('Presupuesto personal', 'Bases', 'Organiza tu sueldo con el método 50/30/20 y deja de llegar justo a fin de mes.', 0, 4),
  ('Fondo de emergencia', 'Bases', 'Arma el colchón que te protege de un imprevisto sin recurrir a deudas.', 0, 4),
  ('Deudas inteligentes', 'Deudas', 'Aprende a priorizar y pagar deudas de forma estratégica.', 0, 3),
  ('Primeros pasos en inversión', 'Inversión', 'Fondos indexados y hábitos para invertir a largo plazo.', 0, 5)
) AS v(titulo, tema, descripcion, progreso, total_lecciones)
WHERE NOT EXISTS (SELECT 1 FROM courses LIMIT 1);

-- Retos
INSERT INTO challenges (titulo, descripcion, meta_ahorro, duracion_dias, activo, created_at, updated_at)
SELECT v.titulo, v.descripcion, v.meta_ahorro, v.duracion_dias, v.activo, NOW(), NOW()
FROM (VALUES
  ('Ahorra $50.000 esta semana', 'Guarda al menos $50.000 en 7 días evitando gastos hormiga.', 50000.0, 7, true),
  ('Mes sin delivery', 'Cocina en casa durante 30 días y ahorra lo que gastarías en domicilio.', 150000.0, 30, true),
  ('Fondo de emergencia inicial', 'Reúne el equivalente a un mes de gastos básicos.', 800000.0, 90, true),
  ('Ahorra $100.000 en 15 días', 'Meta intermedia para fortalecer el hábito de ahorro.', 100000.0, 15, true),
  ('Reto 52 semanas', 'Versión adaptada: ahorra cantidades crecientes cada semana.', 300000.0, 52, true)
) AS v(titulo, descripcion, meta_ahorro, duracion_dias, activo)
WHERE NOT EXISTS (SELECT 1 FROM challenges LIMIT 1);

-- Logros
INSERT INTO achievements (codigo, icono, nombre, pista, ahorro_minimo, lecciones_minimas, retos_minimos, created_at, updated_at)
SELECT v.codigo, v.icono, v.nombre, v.pista, v.ahorro_minimo, v.lecciones_minimas, v.retos_minimos, NOW(), NOW()
FROM (VALUES
  ('primer-deposito', '🪙', 'Primer depósito', 'Registra tu primer depósito', 1.0, NULL::int, NULL::int),
  ('mitad-meta', '🌱', 'Vas por la mitad', 'Llega al 50% de tu meta del mes', 250000.0, NULL, NULL),
  ('tres-retos', '🤝', 'Tribu activa', 'Únete a tres retos', NULL, NULL, 3),
  ('meta-cumplida', '🏆', 'Meta del mes', 'Completa el 100% de tu meta', 500000.0, NULL, NULL),
  ('estudiante', '📚', 'Estudiante constante', 'Completa al menos 5 lecciones', NULL, 5, NULL),
  ('ahorrador-pro', '💎', 'Ahorrador Pro', 'Supera los $1.000.000 ahorrados', 1000000.0, NULL, NULL),
  ('nivel-5', '⭐', 'Nivel 5 alcanzado', 'Llega al nivel 5', NULL, NULL, NULL)
) AS v(codigo, icono, nombre, pista, ahorro_minimo, lecciones_minimas, retos_minimos)
WHERE NOT EXISTS (SELECT 1 FROM achievements LIMIT 1);

-- Coins
INSERT INTO coins (name, symbol, price, created_at, updated_at)
SELECT v.name, v.symbol, v.price, NOW(), NOW()
FROM (VALUES
  ('Bitcoin', 'BTC', 65000.0),
  ('Ethereum', 'ETH', 3500.0),
  ('Solana', 'SOL', 145.0),
  ('Cardano', 'ADA', 0.45)
) AS v(name, symbol, price)
WHERE NOT EXISTS (SELECT 1 FROM coins LIMIT 1);

-- ============================================================
-- 2. USUARIOS (35 registros)
-- ============================================================

INSERT INTO users (
  nombre, email, password, nivel, ahorro, meta,
  lecciones_completadas, retos_aceptados, fecha_registro, activo,
  created_at, updated_at
)
SELECT v.nombre, v.email, v.password, v.nivel, v.ahorro, v.meta,
       v.lecciones_completadas, v.retos_aceptados, v.fecha_registro, v.activo,
       NOW(), NOW()
FROM (VALUES
  ('Juan Pérez',          'admin@cointribe.com',      '123456', 3,  320000.0,  500000.0,  9, 4, NOW() - INTERVAL '60 days',  true),
  ('Ana López',           'ana.lopez@email.com',      '123456', 2,  185000.0,  400000.0,  6, 2, NOW() - INTERVAL '45 days',  true),
  ('Carlos Ramírez',      'carlos.ramirez@email.com', '123456', 4,  720000.0,  800000.0, 12, 5, NOW() - INTERVAL '90 days',  true),
  ('María González',      'maria.gonzalez@email.com', '123456', 1,   45000.0,  300000.0,  2, 1, NOW() - INTERVAL '15 days',  true),
  ('Diego Vargas',        'diego.vargas@email.com',   '123456', 5, 1250000.0, 1000000.0, 18, 7, NOW() - INTERVAL '120 days', true),
  ('Laura Mendoza',       'laura.mendoza@email.com',  '123456', 2,  210000.0,  500000.0,  5, 3, NOW() - INTERVAL '30 days',  true),
  ('Andrés Castillo',     'andres.castillo@email.com','123456', 3,  480000.0,  600000.0,  8, 4, NOW() - INTERVAL '55 days',  true),
  ('Sofía Herrera',       'sofia.herrera@email.com',  '123456', 1,   28000.0,  250000.0,  1, 0, NOW() - INTERVAL '8 days',   true),
  ('Javier Rojas',        'javier.rojas@email.com',   '123456', 4,  890000.0,  900000.0, 14, 6, NOW() - INTERVAL '75 days',  true),
  ('Camila Torres',       'camila.torres@email.com',  '123456', 2,  155000.0,  400000.0,  4, 2, NOW() - INTERVAL '22 days',  true),
  ('Felipe Soto',         'felipe.soto@email.com',    '123456', 3,  340000.0,  500000.0,  7, 3, NOW() - INTERVAL '40 days',  true),
  ('Valentina Díaz',      'valentina.diaz@email.com', '123456', 1,   67000.0,  350000.0,  3, 1, NOW() - INTERVAL '12 days',  true),
  ('Sebastián Morales',   'sebastian.morales@email.com','123456',5,1450000.0, 1200000.0, 20, 8, NOW() - INTERVAL '150 days', true),
  ('Isabella Castro',     'isabella.castro@email.com','123456', 2,  195000.0,  450000.0,  5, 2, NOW() - INTERVAL '28 days',  true),
  ('Mateo Jiménez',       'mateo.jimenez@email.com',  '123456', 3,  410000.0,  550000.0,  9, 4, NOW() - INTERVAL '50 days',  true),
  ('Lucía Paredes',       'lucia.paredes@email.com',  '123456', 1,   32000.0,  200000.0,  0, 1, NOW() - INTERVAL '5 days',   true),
  ('Nicolás Bravo',       'nicolas.bravo@email.com',  '123456', 4,  780000.0,  850000.0, 13, 5, NOW() - INTERVAL '85 days',  true),
  ('Gabriela Núñez',      'gabriela.nunez@email.com', '123456', 2,  142000.0,  380000.0,  4, 2, NOW() - INTERVAL '18 days',  true),
  ('Daniel Ortega',       'daniel.ortega@email.com',  '123456', 3,  295000.0,  500000.0,  6, 3, NOW() - INTERVAL '35 days',  true),
  ('Paula Vega',          'paula.vega@email.com',     '123456', 1,   51000.0,  300000.0,  2, 0, NOW() - INTERVAL '10 days',  true),
  ('Ricardo Peña',        'ricardo.pena@email.com',   '123456', 4,  920000.0,  950000.0, 15, 6, NOW() - INTERVAL '100 days', true),
  ('Elena Fuentes',       'elena.fuentes@email.com',  '123456', 2,  178000.0,  420000.0,  5, 3, NOW() - INTERVAL '25 days',  true),
  ('Tomás Silva',         'tomas.silva@email.com',    '123456', 3,  365000.0,  520000.0,  8, 4, NOW() - INTERVAL '48 days',  true),
  ('Mariana Ríos',        'mariana.rios@email.com',   '123456', 1,   39000.0,  280000.0,  1, 1, NOW() - INTERVAL '7 days',   true),
  ('Álvaro Méndez',       'alvaro.mendez@email.com',  '123456', 5, 1680000.0, 1500000.0, 22, 9, NOW() - INTERVAL '180 days', true),
  ('Carolina Espinoza',   'carolina.espinoza@email.com','123456',2, 225000.0,  480000.0,  6, 2, NOW() - INTERVAL '32 days',  true),
  ('Hugo Salazar',        'hugo.salazar@email.com',   '123456', 3,  455000.0,  600000.0, 10, 5, NOW() - INTERVAL '60 days',  true),
  ('Fernanda Cordero',    'fernanda.cordero@email.com','123456',1,   74000.0,  320000.0,  3, 1, NOW() - INTERVAL '14 days',  true),
  ('Emilio Navarro',      'emilio.navarro@email.com', '123456', 4,  810000.0,  880000.0, 14, 6, NOW() - INTERVAL '95 days',  true),
  ('Alejandra Ponce',     'alejandra.ponce@email.com','123456', 2,  168000.0,  400000.0,  4, 2, NOW() - INTERVAL '20 days',  true),
  ('Martín Guerrero',     'martin.guerrero@email.com','123456', 3,  390000.0,  550000.0,  7, 3, NOW() - INTERVAL '42 days',  true),
  ('Natalia Araya',       'natalia.araya@email.com',  '123456', 1,   22000.0,  250000.0,  0, 0, NOW() - INTERVAL '3 days',   true),
  ('Pablo Contreras',     'pablo.contreras@email.com','123456', 4,  670000.0,  750000.0, 11, 5, NOW() - INTERVAL '70 days',  true),
  ('Renata Villalobos',   'renata.villalobos@email.com','123456',2, 205000.0,  450000.0,  5, 3, NOW() - INTERVAL '27 days',  true),
  ('Ignacio Benítez',     'ignacio.benitez@email.com','123456', 3,  430000.0,  580000.0,  9, 4, NOW() - INTERVAL '52 days',  true)
) AS v(nombre, email, password, nivel, ahorro, meta, lecciones_completadas, retos_aceptados, fecha_registro, activo)
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.email = v.email
);

-- ============================================================
-- 3. USER_CHALLENGES
-- ============================================================

INSERT INTO user_challenges (user_id, challenge_id, ahorro_acumulado, fecha_union, completado, created_at, updated_at)
SELECT 
  u.id,
  c.id,
  CASE 
    WHEN u.nivel >= 4 THEN ROUND((c.meta_ahorro * 0.85)::numeric, 0)
    WHEN u.nivel = 3  THEN ROUND((c.meta_ahorro * 0.55)::numeric, 0)
    WHEN u.nivel = 2  THEN ROUND((c.meta_ahorro * 0.30)::numeric, 0)
    ELSE ROUND((c.meta_ahorro * 0.12)::numeric, 0)
  END,
  u.fecha_registro + INTERVAL '3 days',
  CASE WHEN u.nivel >= 4 AND c.id <= 3 THEN true ELSE false END,
  NOW(),
  NOW()
FROM users u
CROSS JOIN challenges c
WHERE u.email <> 'admin@cointribe.com'
  AND (
       (u.nivel >= 4 AND c.id <= 4)
    OR (u.nivel = 3  AND c.id <= 3)
    OR (u.nivel = 2  AND c.id <= 2)
    OR (u.nivel = 1  AND c.id = 1)
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. USER_ACHIEVEMENTS
-- ============================================================

INSERT INTO user_achievements (user_id, achievement_id, fecha_desbloqueo, created_at, updated_at)
SELECT 
  u.id,
  a.id,
  u.fecha_registro + INTERVAL '7 days',
  NOW(),
  NOW()
FROM users u
JOIN achievements a ON (
     (a.codigo = 'primer-deposito' AND u.ahorro >= 1)
  OR (a.codigo = 'mitad-meta'      AND u.ahorro >= 250000)
  OR (a.codigo = 'tres-retos'      AND u.retos_aceptados >= 3)
  OR (a.codigo = 'meta-cumplida'   AND u.ahorro >= 500000)
  OR (a.codigo = 'estudiante'      AND u.lecciones_completadas >= 5)
  OR (a.codigo = 'ahorrador-pro'   AND u.ahorro >= 1000000)
  OR (a.codigo = 'nivel-5'         AND u.nivel >= 5)
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. POSTS DE COMUNIDAD
-- ============================================================

INSERT INTO posts (autor, etiqueta, titulo, cuerpo, likes, fecha, created_at, updated_at)
SELECT v.autor, v.etiqueta, v.titulo, v.cuerpo, v.likes, v.fecha, NOW(), NOW()
FROM (VALUES
  ('Ana López',        'Presupuesto', '¿Apps para controlar gastos hormiga?', 
   'Estoy usando una hoja de cálculo, pero siento que se me escapan muchos gastos chiquitos. ¿Qué app recomiendan?', 
   18, NOW() - INTERVAL '10 days'),
  ('Carlos Ramírez',   'Ahorro',      'Completé el reto de $50.000', 
   'Lo logré evitando delivery y café de fuera. La clave fue cocinar el domingo para toda la semana.', 
   31, NOW() - INTERVAL '8 days'),
  ('Diego Vargas',     'Inversión',   'Fondos indexados para principiantes', 
   'Después de completar el curso de inversión empecé con un fondo indexado global. Muy recomendado.', 
   27, NOW() - INTERVAL '15 days'),
  ('Laura Mendoza',    'Deudas',      'Método bola de nieve vs avalancha', 
   'Estoy pagando mis deudas con el método bola de nieve y me motiva mucho ver cómo desaparecen las más pequeñas.', 
   14, NOW() - INTERVAL '6 days'),
  ('Sofía Herrera',    'Pregunta',    '¿Cuánto debería tener de fondo de emergencia?', 
   'Vivo sola y mi gasto mensual es de unos $1.200.000. ¿3 meses o 6 meses es lo ideal?', 
   22, NOW() - INTERVAL '4 days'),
  ('Javier Rojas',     'Ahorro',      'Reto mes sin delivery - día 18', 
   'Ya voy más de la mitad. He ahorrado cerca de $180.000. ¡Se puede!', 
   19, NOW() - INTERVAL '3 days'),
  ('Valentina Díaz',   'Bases',       'Empecé el curso de presupuesto', 
   'El método 50/30/20 me está ayudando muchísimo a ordenar mis finanzas. Gracias comunidad!', 
   11, NOW() - INTERVAL '2 days'),
  ('Sebastián Morales','Inversión',   'DCA vs lump sum', 
   'Después de leer bastante me decidí por DCA mensualmente. Menos estrés y resultados consistentes.', 
   25, NOW() - INTERVAL '12 days'),
  ('Camila Torres',    'Pregunta',    '¿Cómo motivarse cuando el ahorro avanza lento?', 
   'Llevo 3 semanas y siento que no avanzo. ¿Algún tip de la tribu?', 
   16, NOW() - INTERVAL '1 day'),
  ('Álvaro Méndez',    'Logros',      '¡Logré el logro Ahorrador Pro!', 
   'Superé el millón ahorrado. No fue de la noche a la mañana, pero cada hábito pequeño suma.', 
   42, NOW() - INTERVAL '20 days')
) AS v(autor, etiqueta, titulo, cuerpo, likes, fecha)
WHERE NOT EXISTS (SELECT 1 FROM posts LIMIT 1);

COMMIT;

-- ============================================================
-- VERIFICACIÓN RÁPIDA
-- ============================================================
-- SELECT COUNT(*) AS total_usuarios FROM users;
-- SELECT nivel, COUNT(*) FROM users GROUP BY nivel ORDER BY nivel;
-- SELECT COUNT(*) AS total_user_challenges FROM user_challenges;
-- SELECT COUNT(*) AS total_user_achievements FROM user_achievements;
-- SELECT COUNT(*) AS total_posts FROM posts;
