-- ============================================================
-- CoinTribe - DDL Schema para PostgreSQL (Neon / Render)
-- ============================================================

-- 1. Logros
CREATE TABLE IF NOT EXISTS achievements (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(255) NOT NULL UNIQUE,
    icono VARCHAR(255),
    nombre VARCHAR(255) NOT NULL,
    pista VARCHAR(255),
    ahorro_minimo DOUBLE PRECISION,
    lecciones_minimas INTEGER,
    retos_minimos INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 2. Retos de ahorro
CREATE TABLE IF NOT EXISTS challenges (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion VARCHAR(1000),
    meta_ahorro DOUBLE PRECISION,
    duracion_dias INTEGER,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 3. Criptomonedas / Monedas de referencia
CREATE TABLE IF NOT EXISTS coins (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    symbol VARCHAR(255),
    price DOUBLE PRECISION,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 4. Cursos
CREATE TABLE IF NOT EXISTS courses (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    tema VARCHAR(255),
    descripcion VARCHAR(1000),
    progreso INTEGER DEFAULT 0,
    total_lecciones INTEGER DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 5. Usuarios
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nivel INTEGER DEFAULT 1,
    ahorro DOUBLE PRECISION DEFAULT 0.0,
    meta DOUBLE PRECISION DEFAULT 500000.0,
    lecciones_completadas INTEGER DEFAULT 0,
    retos_aceptados INTEGER DEFAULT 0,
    fecha_registro TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 6. Publicaciones del foro/comunidad
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    autor VARCHAR(255) NOT NULL,
    etiqueta VARCHAR(255),
    titulo VARCHAR(255) NOT NULL,
    cuerpo VARCHAR(2000) NOT NULL,
    likes INTEGER DEFAULT 0,
    fecha TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 7. Relación Usuario <-> Logro
CREATE TABLE IF NOT EXISTS user_achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id BIGINT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    fecha_desbloqueo TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

-- 8. Relación Usuario <-> Reto
CREATE TABLE IF NOT EXISTS user_challenges (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id BIGINT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    ahorro_acumulado DOUBLE PRECISION DEFAULT 0.0,
    fecha_union TIMESTAMP,
    completado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT unique_user_challenge UNIQUE (user_id, challenge_id)
);

