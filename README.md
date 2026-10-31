# CoinTribe

API backend de **educación financiera personal** con gamificación y comunidad.

> **Sello CoinTribe:** aprende, ahorra y avanza en tribu. Cada pequeño hábito cuenta cuando lo conviertes en progreso.

Proyecto **académico / educativo**. Las contraseñas y credenciales se muestran en texto plano a propósito (sin hashing complejo ni secretos ocultos).

---

## Tabla de contenidos

1. [Idea del proyecto](#idea-del-proyecto)
2. [Stack tecnológico](#stack-tecnológico)
3. [Estructura del repositorio](#estructura-del-repositorio)
4. [Credenciales (todo en claro)](#credenciales-todo-en-claro)
5. [Cómo ejecutar en local](#cómo-ejecutar-en-local)
6. [Datos de ejemplo (seed)](#datos-de-ejemplo-seed)
7. [Endpoints — CRUD completo](#endpoints--crud-completo)
8. [Ejemplos de requests (JSON)](#ejemplos-de-requests-json)
9. [Reglas de negocio](#reglas-de-negocio)
10. [Despliegue en Render](#despliegue-en-render)
11. [Neon / PostgreSQL (producción)](#neon--postgresql-producción)
12. [Equipo y contacto](#equipo-y-contacto)

---

## Idea del proyecto

CoinTribe ayuda a mejorar hábitos de dinero mediante:

- Cursos cortos de finanzas personales
- Retos de ahorro con metas y logros
- Panel de progreso de ahorro
- Comunidad (foro) para dudas y experiencias
- Perfil con estadísticas y logros desbloqueables

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Lenguaje | Java 25 (LTS) |
| Framework | Spring Boot 4.x |
| Persistencia | Spring Data JPA + Hibernate |
| Base de datos local | H2 en memoria |
| Base de datos producción | PostgreSQL (Neon o Render) |
| Build | Maven (wrapper `./mvnw`) |
| API | REST + JSON |
| CORS | Abierto (`*`) para desarrollo |

---

## Estructura del repositorio

```
CoinTribe/
├── README.md                 ← Este archivo
├── .gitignore
├── .neon                     ← Enlace a proyecto Neon (opcional)
├── neon.ts                   ← Config Neon CLI (opcional)
├── package.json              ← Mínimo para Neon CLI
└── backend/                  ← Aplicación Spring Boot
    ├── pom.xml
    ├── mvnw / mvnw.cmd
    └── src/main/java/com/cointribe/backend/
        ├── BackendApplication.java
        ├── config/DataInitializer.java   ← Seed de datos
        ├── controllers/                  ← REST
        ├── services/                     ← Reglas de negocio
        ├── models/                       ← Entidades JPA
        ├── repositories/                 ← Spring Data
        └── exceptions/                   ← BusinessException + handler
```

Entidades principales: `User`, `Course`, `Challenge`, `UserChallenge`, `Post`, `Achievement`, `UserAchievement`, `Coin`.

---

## Credenciales (todo en claro)

### Usuario de prueba (seed al arrancar)

| Campo | Valor |
|-------|--------|
| Nombre | Admin CoinTribe |
| Email | `admin@cointribe.com` |
| Contraseña | `123456` |
| Nivel | 1 |
| Ahorro inicial | 0 |
| Meta | 500000 |

Login de ejemplo:

```http
POST http://localhost:8080/api/users/login
Content-Type: application/json

{
  "email": "admin@cointribe.com",
  "password": "123456"
}
```

### Base de datos H2 (local)

| Campo | Valor |
|-------|--------|
| URL JDBC | `jdbc:h2:mem:cointribedb` |
| Usuario | `sa` |
| Contraseña | *(vacía)* |
| Consola web | http://localhost:8080/h2-console |
| Driver | `org.h2.Driver` |

En la consola H2 usa la misma JDBC URL, usuario `sa` y contraseña en blanco.

### Servidor local

| Campo | Valor |
|-------|--------|
| Puerto | `8080` |
| Base URL API | http://localhost:8080 |
| Context path | `/` (raíz) |

### Notas de seguridad (proyecto educativo)

- Las contraseñas se guardan **en texto plano** (sin BCrypt).
- No hay JWT ni sesiones formales: el “login” solo valida email/password y devuelve el usuario.
- CORS está abierto a cualquier origen.
- En un entorno real habría que hashear passwords, usar HTTPS y restringir CORS.

---

## Cómo ejecutar en local

### Requisitos

- Java 25 o superior
- Acceso a internet la primera vez (Maven descarga dependencias)

### Pasos

```bash
cd backend
./mvnw spring-boot:run
```

En Windows:

```bash
cd backend
mvnw.cmd spring-boot:run
```

Al arrancar:

1. Se crea la BD H2 en memoria.
2. Hibernate crea/actualiza tablas (`ddl-auto=update`).
3. `DataInitializer` inserta admin, cursos, retos, posts, logros y coins de ejemplo.

- Aplicación web: **http://localhost:8080/**
- API: **http://localhost:8080/api**
- H2 Console: **http://localhost:8080/h2-console**

La interfaz está incluida en `backend/src/main/resources/static` y Spring Boot la sirve junto con la API. Abre la aplicación desde `http://localhost:8080/` (no desde el archivo `index.html`) para que las solicitudes del frontend lleguen al mismo servidor y origen.

Para empaquetar JAR:

```bash
./mvnw clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

---

## Datos de ejemplo (seed)

Al iniciar (si la BD está vacía) se cargan:

**Cursos**

- Finanzas básicas (tema: Ahorro)
- Presupuesto personal (tema: Presupuesto)
- Introducción a la inversión (tema: Inversión)

**Retos**

- Ahorra $50.000 en 7 días (meta 50000, 7 días)
- Sin delivery 14 días (meta 100000, 14 días)
- Fondo de emergencia inicial (meta 800000, 90 días)

**Posts** de comunidad (Marta, Diego, Luisa) sobre presupuesto, ahorro e inversión.

**Logros**

| Código | Nombre | Condición orientativa |
|--------|--------|------------------------|
| `primer-deposito` | Primer depósito | Ahorro ≥ 1 |
| `mitad-meta` | Vas por la mitad | Ahorro ≥ 250000 |
| `tres-retos` | Tribu activa | ≥ 3 retos aceptados |
| `meta-cumplida` | Meta del mes | Ahorro ≥ 500000 |
| `estudiante` | Estudiante constante | ≥ 5 lecciones |

**Coins de ejemplo:** Bitcoin (BTC), Ethereum (ETH).

---

## Endpoints — CRUD completo

Base: `http://localhost:8080`

Los cuerpos JSON de escritura se reciben mediante DTOs tipados en `backend/src/main/java/com/cointribe/backend/dto`.
Los nombres de propiedades y ejemplos de esta documentación corresponden a esos DTOs; las validaciones de negocio
se mantienen en los servicios.

### Usuarios `/api/users`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users` | Listar todos |
| GET | `/api/users/{id}` | Obtener por ID |
| POST | `/api/users/register` | Registrar |
| POST | `/api/users/login` | Login |
| PUT | `/api/users/{id}` | Actualizar (nombre, email, meta, nivel) |
| PUT | `/api/users/{id}/profile` | Actualizar perfil (nombre, meta) |
| PUT | `/api/users/{id}/password` | Cambiar contraseña |
| POST | `/api/users/{id}/ahorro` | Sumar ahorro |
| PUT | `/api/users/{id}/deactivate` | Desactivar (soft-delete) |
| PUT | `/api/users/{id}/activate` | Reactivar |
| DELETE | `/api/users/{id}` | Eliminar físico |

### Cursos `/api/courses`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/courses` | Listar |
| GET | `/api/courses/{id}` | Por ID |
| GET | `/api/courses/tema/{tema}` | Filtrar por tema |
| POST | `/api/courses` | Crear |
| PUT | `/api/courses/{id}` | Actualizar |
| PUT | `/api/courses/{id}/progress` | Progreso 0–100 (solo avanzar) |
| POST | `/api/courses/complete-lesson` | Marcar lecciones completadas |
| DELETE | `/api/courses/{id}` | Eliminar |

### Retos `/api/challenges`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/challenges` | Solo activos |
| GET | `/api/challenges/all` | Todos |
| GET | `/api/challenges/{id}` | Por ID |
| GET | `/api/challenges/user/{userId}` | Retos de un usuario |
| POST | `/api/challenges` | Crear |
| PUT | `/api/challenges/{id}` | Actualizar |
| POST | `/api/challenges/{id}/join` | Unirse |
| POST | `/api/challenges/{id}/deposit` | Depositar en el reto |
| DELETE | `/api/challenges/{id}` | Eliminar |

### Publicaciones `/api/posts`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/posts` | Listar |
| GET | `/api/posts/{id}` | Por ID |
| POST | `/api/posts` | Crear |
| PUT | `/api/posts/{id}` | Actualizar |
| POST | `/api/posts/{id}/like` | Like (1 por usuario) |
| DELETE | `/api/posts/{id}` | Eliminar |

### Logros `/api/achievements`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/achievements` | Listar |
| GET | `/api/achievements/{id}` | Por ID |
| GET | `/api/achievements/user/{userId}` | Logros de un usuario |
| POST | `/api/achievements` | Crear |
| PUT | `/api/achievements/{id}` | Actualizar |
| DELETE | `/api/achievements/{id}` | Eliminar |

### Coins `/api/coins`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/coins` | Listar |
| GET | `/api/coins/{id}` | Por ID |
| POST | `/api/coins` | Crear |
| PUT | `/api/coins/{id}` | Actualizar |
| DELETE | `/api/coins/{id}` | Eliminar |

---

## Ejemplos de requests (JSON)

### Registrar usuario

```http
POST /api/users/register
Content-Type: application/json

{
  "nombre": "Ana Pérez",
  "email": "ana@ejemplo.com",
  "password": "123456"
}
```

### Login

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "admin@cointribe.com",
  "password": "123456"
}
```

### Sumar ahorro

```http
POST /api/users/1/ahorro
Content-Type: application/json

{
  "monto": 25000
}
```

### Crear curso

```http
POST /api/courses
Content-Type: application/json

{
  "titulo": "Deudas inteligentes",
  "tema": "Deuda",
  "descripcion": "Cómo priorizar y pagar deudas",
  "totalLecciones": 6
}
```

### Unirse a un reto y depositar

```http
POST /api/challenges/1/join
Content-Type: application/json

{ "userId": 1 }
```

```http
POST /api/challenges/1/deposit
Content-Type: application/json

{
  "userId": 1,
  "monto": 10000
}
```

### Crear publicación y like

```http
POST /api/posts
Content-Type: application/json

{
  "autor": "Ana Pérez",
  "etiqueta": "Ahorro",
  "titulo": "Mi primer mes ahorrando",
  "cuerpo": "Logré guardar 50 mil solo evitando compras impulsivas."
}
```

```http
POST /api/posts/1/like
Content-Type: application/json

{ "userId": 1 }
```

---

## Reglas de negocio

1. **Email único** al registrar (`UserService.registerUser`).
2. **Contraseña ≥ 6 caracteres** y email con formato válido; al cambiar, la nueva debe ser distinta de la actual.
3. **No unirse dos veces** al mismo reto (`ChallengeService.joinChallenge`).
4. **Depósito en reto > 0** y no puede superar la meta del reto.
5. **Progreso de curso entre 0 y 100**; no se permite retroceder.
6. **Un solo like** por usuario y publicación.

Además, `AchievementService` evalúa ahorro, lecciones y retos y desbloquea logros automáticamente.

Errores de negocio devuelven respuesta controlada vía `BusinessException` + `GlobalExceptionHandler`.

---

## Despliegue en Render

### Qué necesitas

1. Cuenta en [Render](https://render.com)
2. Repo en **GitHub** con este código
3. Base **PostgreSQL** (Neon o Postgres de Render)
4. Variables de entorno (ver abajo)

### Crear Web Service

| Campo | Valor sugerido |
|-------|----------------|
| Type | Web Service |
| Repository | Tu repo GitHub |
| Root Directory | `backend` |
| Runtime | Java |
| Build Command | `./mvnw clean package -DskipTests` |
| Start Command | `java -jar target/backend-0.0.1-SNAPSHOT.jar` |
| Plan | Free / Starter |

### Variables de entorno en Render (ejemplo educativo)

```text
PORT=10000
SPRING_DATASOURCE_URL=jdbc:postgresql://HOST:5432/neondb?sslmode=require
SPRING_DATASOURCE_USERNAME=neondb_owner
SPRING_DATASOURCE_PASSWORD=tu_password_de_neon_o_render
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
```

> **Estado del código:** ya incluye driver PostgreSQL, `server.port=${PORT:8080}` y variables de entorno.
> En local sigue usando H2 sin configuración extra. En Render solo pega la URL de Postgres.

También hay:
- `render.yaml` (Blueprint opcional)
- `backend/Dockerfile` (opcional)
- `.env.example` (plantilla de variables)

---

## Neon / PostgreSQL (producción)

Proyecto Neon de referencia (ya enlazado en `.neon` si usaste el CLI):

| Campo | Valor de ejemplo |
|-------|------------------|
| Org ID | `org-sparkling-scene-35011291` |
| Project ID | `wispy-bar-53349298` |
| Branch | `production` |

Tras `neon login` y `neon deploy` / `neon env pull` obtienes algo como:

```text
DATABASE_URL=postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

Para JDBC de Spring:

```text
jdbc:postgresql://ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

Usuario y password son los de la connection string de Neon.

Consola SQL: dashboard de Neon → SQL Editor.

---

## Configuración actual (`application.properties`)

Por defecto **H2 local**. En producción define variables de entorno (ver `.env.example` y sección Render).

```properties
server.port=${PORT:8080}
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:h2:mem:cointribedb}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:sa}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:}
spring.datasource.driver-class-name=${SPRING_DATASOURCE_DRIVER_CLASS_NAME:org.h2.Driver}
spring.jpa.database-platform=${SPRING_JPA_DATABASE_PLATFORM:org.hibernate.dialect.H2Dialect}
spring.jpa.hibernate.ddl-auto=${SPRING_JPA_HIBERNATE_DDL_AUTO:update}
```


---

## Equipo y contacto

- Equipo actual: **3 integrantes**
- Mantenimiento: **sebastianCardona** · `scardona12345678@cesde.net`

---

## Licencia / uso

Proyecto educativo. Puedes clonar, modificar y desplegar libremente con fines de aprendizaje.
