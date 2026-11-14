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
7. [Seed masivo + 15 preguntas analíticas](#seed-masivo--15-preguntas-analíticas)
8. [Endpoints — CRUD completo](#endpoints--crud-completo)
9. [Ejemplos de requests (JSON)](#ejemplos-de-requests-json)
10. [Reglas de negocio](#reglas-de-negocio)
11. [Despliegue (Neon + Render / Vercel)](#despliegue-neon--render--vercel)
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
| Lenguaje | Java 21 (LTS) |
| Framework | Spring Boot 4.x |
| Persistencia | Spring Data JPA + Hibernate |
| Base de datos local | H2 en memoria |
| Base de datos producción | PostgreSQL (Neon o Render) |
| Build | Maven (wrapper `./mvnw`) |
| API | REST + JSON |
| Documentación de API | OpenAPI 3 / Swagger UI |
| CORS | Abierto (`*`) para desarrollo |

---

## Estructura del repositorio

```
CoinTribe/
├── README.md                 ← Este archivo
├── .gitignore
├── .env.example
├── docs/
│   └── PREGUNTAS_ANALITICAS_COINTRIBE.md   ← 15 preguntas adaptadas + SQL
├── sql/
│   └── seed_masivo.sql                     ← 35 usuarios + relaciones
├── postman/
├── render.yaml
└── backend/                  ← Aplicación Spring Boot
    ├── pom.xml
    ├── mvnw / mvnw.cmd
    └── src/main/java/com/cointribe/backend/
        ├── BackendApplication.java
        ├── config/DataInitializer.java   ← Seed básico (local H2)
        ├── controllers/                  ← REST
        ├── services/                     ← Reglas de negocio
        ├── models/                       ← Entidades JPA
        ├── repositories/                 ← Spring Data
        └── exceptions/
```

Entidades principales: `User`, `Course`, `Challenge`, `UserChallenge`, `Post`, `Achievement`, `UserAchievement`, `Coin`.

---

## Credenciales (todo en claro)

### Usuario de prueba (seed al arrancar)

| Campo | Valor |
|-------|--------|
| Nombre | Juan Pérez |
| Email | `admin@cointribe.com` |
| Contraseña | `123456` |
| Nivel | 3 |
| Ahorro inicial | 320000 |
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
La consola viene desactivada; para usarla en local arranca con `SPRING_H2_CONSOLE_ENABLED=true`.

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

- Java 21 o superior
- Acceso a internet la primera vez (el Maven Wrapper descarga Maven y las dependencias; no necesitas instalar Maven globalmente)

### Pasos

```bash
cd backend
./mvnw spring-boot:run
```

En Windows:

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

En VS Code también puedes iniciar el backend con **Terminal > Run Task > CoinTribe: Start backend**. Para depurarlo, selecciona **CoinTribe Backend** en Run and Debug y presiona F5. Ambas opciones usan el Maven Wrapper incluido, por lo que no requieren que `mvn` esté instalado en Windows.

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

- Presupuesto personal (tema: Bases)
- Fondo de emergencia (tema: Bases)
- Deudas inteligentes (tema: Deudas)
- Primeros pasos en inversión (tema: Inversión)

**Retos**

- Ahorra $50.000 esta semana (meta 50000, 7 días)
- Mes sin delivery (meta 150000, 30 días)
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
Los nombres de propiedades y ejemplos de esta documentación corresponden a esos DTOs. Bean Validation comprueba
los datos de entrada en la API y los servicios conservan las reglas de negocio.

La documentación interactiva está disponible en **http://localhost:8080/swagger-ui/index.html** y el documento
OpenAPI en **http://localhost:8080/v3/api-docs**. Las entidades heredan de `BaseEntity`, que centraliza el ID
y las marcas de auditoría `createdAt` y `updatedAt`.

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
Los recursos inexistentes responden HTTP 404 mediante `RecursoNoEncontradoException`, y los errores de Bean
Validation responden HTTP 400 con detalles por campo.

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
SPRING_DATASOURCE_USERNAME=tu_usuario
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

## Seed masivo + 15 preguntas analíticas

Para el análisis de datos del proyecto (banco de preguntas CESDE) se incluye:

| Archivo | Descripción |
|---------|-------------|
| `sql/seed_masivo.sql` | Script SQL listo para Neon/Supabase con **35 usuarios**, retos, logros, posts y relaciones |
| `docs/PREGUNTAS_ANALITICAS_COINTRIBE.md` | **15 preguntas analíticas** adaptadas a CoinTribe (tendencias, composición, promedios, rankings, distribuciones, relaciones y reporte final) |

### Cómo cargar los datos en Neon

1. Crea un proyecto en [Neon](https://neon.tech) y copia la connection string.
2. Abre el **SQL Editor** de Neon.
3. Pega y ejecuta el contenido de `sql/seed_masivo.sql`.
4. Verifica:

```sql
SELECT COUNT(*) FROM users;                    -- debe ser >= 35
SELECT nivel, COUNT(*) FROM users GROUP BY nivel ORDER BY nivel;
SELECT COUNT(*) FROM user_challenges;
SELECT COUNT(*) FROM user_achievements;
```

### Las 15 preguntas (resumen)

1. Evolución de usuarios nuevos por mes  
2. Ahorro total/promedio según mes de registro  
3. Distribución de usuarios por nivel (dona)  
4. Participación de cada logro desbloqueado  
5. Distribución por cantidad de retos aceptados  
6. Ahorro promedio por nivel  
7. % de avance hacia la meta por nivel  
8. Top 10 usuarios con mayor ahorro  
9. Retos más populares  
10. Usuarios con más logros  
11. Distribución del ahorro (histogramas por rangos)  
12. Distribución de lecciones completadas  
13. Relación nivel vs ahorro (scatter)  
14. Relación lecciones vs retos aceptados  
15. KPIs generales + 3 hallazgos + recomendación  

Cada pregunta incluye el **SQL de cálculo** y el tipo de gráfica recomendada. Ver el documento completo en `docs/PREGUNTAS_ANALITICAS_COINTRIBE.md`.

---

## Despliegue (Neon + Render / Vercel)

### 1. Base de datos (Neon)

La base de datos PostgreSQL está creada en **Neon**:
- **Connection string:** `postgresql://USUARIO:PASSWORD@HOST/neondb?sslmode=require` (se obtiene en el panel de Neon; **no la subas al repositorio**)
- **Tablas:** Definidas en `sql/schema.sql` (creadas y validadas con 8 tablas principales).
- **Datos iniciales:** Cargados mediante `sql/seed_masivo.sql` (35 usuarios, retos, logros, cursos, publicaciones y relaciones).

### 2. Backend (Render — Requerido para Spring Boot)

El backend de CoinTribe está desarrollado en **Java 21 (LTS) con Spring Boot 4.x**.  
> ⚠️ **Importante sobre Vercel vs Render:**  
> **Vercel NO ejecuta aplicaciones Java / Spring Boot.** Vercel es una plataforma serverless orientada a frontend (Next.js, HTML/JS) y funciones Node/Python.  
> Por esta razón, el backend del API **debe alojarse en Render** (o Railway / Docker).

#### Despliegue en Render (1 Clic con Blueprint):
1. Ve a [dashboard.render.com](https://dashboard.render.com) > **New +** > **Blueprint**.
2. Conecta el repositorio: `https://github.com/alejandro8377/CoinTribe-Final`.
3. Render detectará automáticamente `render.yaml` y preconfigurará el servicio web con Java y las credenciales de Neon.
4. O si lo creas manualmente como **Web Service**:
   - **Root Directory:** `backend`
   - **Environment:** `Java`
   - **Build Command:** `chmod +x mvnw && ./mvnw clean package -DskipTests`
   - **Start Command:** `java -jar target/backend-0.0.1-SNAPSHOT.jar`
   - **Health Check Path:** `/api/users`
   - **Variables de entorno:**
     ```
     SPRING_DATASOURCE_URL=jdbc:postgresql://HOST/neondb?sslmode=require
     SPRING_DATASOURCE_USERNAME=tu_usuario
     SPRING_DATASOURCE_PASSWORD=tu_password_de_neon
     SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
     SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
     SPRING_JPA_HIBERNATE_DDL_AUTO=update
     SPRING_JPA_SHOW_SQL=false
     ```

### 3. Frontend en Vercel (Opcional / Desacoplado)

- **Opción A (Recomendada y más simple):** Render ya sirve tanto la API `/api/*` como el frontend estático completo de forma automática en una sola URL.
- **Opción B (Frontend en Vercel + Backend en Render):**
  1. Conecta el repositorio a [Vercel](https://vercel.com).
  2. El archivo `vercel.json` incluido ya está configurado para publicar la carpeta `backend/src/main/resources/static` y redirigir las peticiones de `/api/*` al backend en Render.
  3. En `vercel.json`, actualiza la URL de destino de Render con la que te asigne Render al crear el backend.

### 4. Variables locales (`.env`)

El archivo `.env.example` y `application.properties` ya vienen preconfigurados con la base de datos de Neon. Para arrancar en local:
```bash
cd backend
./mvnw.cmd spring-boot:run
```

---

## Equipo y contacto

- Equipo actual: **3 integrantes**
- Mantenimiento: **sebastianCardona** · `scardona12345678@cesde.net`

---

## Licencia / uso

Proyecto educativo. Puedes clonar, modificar y desplegar libremente con fines de aprendizaje.
