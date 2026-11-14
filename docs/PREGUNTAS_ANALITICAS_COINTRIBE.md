# 15 Preguntas Analíticas adaptadas a CoinTribe

**Proyecto:** CoinTribe — Educación financiera personal con gamificación  
**Fuente:** Banco de Preguntas Analíticas CESDE (Gustavo Montoya Escobar)  
**Datos:** Usuarios, ahorro, metas, niveles, lecciones, retos, logros y posts generados con el seed masivo.

Cada pregunta sigue la fórmula: **Pregunta + Cálculo + Visualización + Interpretación**.

---

## BLOQUE 01 — Tendencias en el tiempo

### 1. Evolución de registros de usuarios
**Pregunta:** ¿Cómo evolucionó la cantidad de usuarios nuevos durante los últimos meses según su `fecha_registro`?  
**Cálculo:** Agrupar por mes (`DATE_TRUNC('month', fecha_registro)`), contar usuarios.  
**Visualización:** Gráfica de líneas (eje X = mes, eje Y = cantidad de usuarios).  
**Interpretación esperada:** Identificar el mes con mayor crecimiento de la tribu.

```sql
SELECT 
  DATE_TRUNC('month', fecha_registro) AS mes,
  COUNT(*) AS usuarios_nuevos
FROM users
WHERE activo = true
GROUP BY 1
ORDER BY 1;
```

### 2. Comportamiento del ahorro acumulado por mes de registro
**Pregunta:** ¿Cómo se comporta el ahorro total de los usuarios según el mes en que se registraron?  
**Cálculo:** Sumar `ahorro` agrupado por mes de `fecha_registro`.  
**Visualización:** Gráfica de barras o líneas temporales.  
**Interpretación:** Observar si los usuarios más antiguos tienen mayor ahorro acumulado.

```sql
SELECT 
  DATE_TRUNC('month', fecha_registro) AS mes_registro,
  ROUND(SUM(ahorro)::numeric, 0) AS ahorro_total,
  ROUND(AVG(ahorro)::numeric, 0) AS ahorro_promedio
FROM users
GROUP BY 1
ORDER BY 1;
```

---

## BLOQUE 02 — Participación y composición

### 3. Distribución de usuarios por nivel
**Pregunta:** ¿Cuál es la participación de cada nivel (`nivel`) dentro de la comunidad?  
**Cálculo:** Contar usuarios por nivel y calcular porcentaje.  
**Visualización:** Gráfica de dona o torta.  
**Interpretación:** Identificar qué nivel concentra la mayor cantidad de usuarios.

```sql
SELECT 
  nivel,
  COUNT(*) AS cantidad,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS porcentaje
FROM users
WHERE activo = true
GROUP BY nivel
ORDER BY nivel;
```

### 4. Participación de logros desbloqueados
**Pregunta:** ¿Qué porcentaje de desbloqueos corresponde a cada logro?  
**Cálculo:** Contar registros en `user_achievements` por `achievement_id` / código.  
**Visualización:** Gráfica de dona.  
**Interpretación:** Ver cuáles logros son más fáciles o más difíciles de obtener.

```sql
SELECT 
  a.codigo,
  a.nombre,
  COUNT(ua.id) AS desbloqueos,
  ROUND(COUNT(ua.id) * 100.0 / SUM(COUNT(ua.id)) OVER (), 1) AS porcentaje
FROM user_achievements ua
JOIN achievements a ON a.id = ua.achievement_id
GROUP BY a.id, a.codigo, a.nombre
ORDER BY desbloqueos DESC;
```

### 5. Distribución de retos aceptados
**Pregunta:** ¿Cómo se distribuyen los usuarios según la cantidad de retos que han aceptado?  
**Cálculo:** Agrupar por rangos de `retos_aceptados` (0, 1-2, 3-4, 5+).  
**Visualización:** Gráfica de barras o dona.  
**Interpretación:** Evaluar el nivel de engagement con los retos.

```sql
SELECT 
  CASE 
    WHEN retos_aceptados = 0 THEN '0 retos'
    WHEN retos_aceptados BETWEEN 1 AND 2 THEN '1-2 retos'
    WHEN retos_aceptados BETWEEN 3 AND 4 THEN '3-4 retos'
    ELSE '5 o más retos'
  END AS rango_retos,
  COUNT(*) AS usuarios
FROM users
GROUP BY 1
ORDER BY MIN(retos_aceptados);
```

---

## BLOQUE 03 — Promedios

### 6. Ahorro promedio por nivel
**Pregunta:** ¿Cuál es el ahorro promedio de los usuarios según su nivel?  
**Cálculo:** `AVG(ahorro)` agrupado por `nivel`.  
**Visualización:** Gráfica de barras comparativas.  
**Interpretación:** Verificar si a mayor nivel corresponde mayor ahorro promedio.

```sql
SELECT 
  nivel,
  COUNT(*) AS usuarios,
  ROUND(AVG(ahorro)::numeric, 0) AS ahorro_promedio,
  ROUND(AVG(meta)::numeric, 0) AS meta_promedio
FROM users
WHERE activo = true
GROUP BY nivel
ORDER BY nivel;
```

### 7. Porcentaje de avance hacia la meta
**Pregunta:** ¿Cuál es el porcentaje promedio de avance hacia la meta de ahorro por nivel?  
**Cálculo:** `AVG(ahorro / meta * 100)` por nivel.  
**Visualización:** Barras horizontales.  
**Interpretación:** Identificar qué niveles están más cerca de cumplir su meta.

```sql
SELECT 
  nivel,
  ROUND(AVG(ahorro / NULLIF(meta, 0) * 100)::numeric, 1) AS porcentaje_promedio_meta
FROM users
WHERE activo = true AND meta > 0
GROUP BY nivel
ORDER BY nivel;
```

---

## BLOQUE 04 — Máximos, mínimos y rankings

### 8. Top 10 usuarios con mayor ahorro
**Pregunta:** ¿Cuáles son los 10 usuarios con mayor ahorro acumulado?  
**Cálculo:** Ordenar por `ahorro` DESC y limitar a 10.  
**Visualización:** Barras horizontales (Top N).  
**Interpretación:** Destacar a los miembros más destacados de la tribu.

```sql
SELECT 
  nombre,
  nivel,
  ROUND(ahorro::numeric, 0) AS ahorro,
  ROUND(meta::numeric, 0) AS meta,
  ROUND((ahorro / NULLIF(meta, 0) * 100)::numeric, 1) AS pct_meta
FROM users
WHERE activo = true
ORDER BY ahorro DESC
LIMIT 10;
```

### 9. Retos más populares
**Pregunta:** ¿Cuáles son los retos con mayor cantidad de participantes?  
**Cálculo:** Contar en `user_challenges` por `challenge_id`.  
**Visualización:** Barras ordenadas.  
**Interpretación:** Identificar qué retos generan más engagement.

```sql
SELECT 
  c.titulo,
  c.meta_ahorro,
  c.duracion_dias,
  COUNT(uc.id) AS participantes,
  COUNT(uc.id) FILTER (WHERE uc.completado = true) AS completados
FROM challenges c
LEFT JOIN user_challenges uc ON uc.challenge_id = c.id
GROUP BY c.id, c.titulo, c.meta_ahorro, c.duracion_dias
ORDER BY participantes DESC;
```

### 10. Usuarios con más logros desbloqueados
**Pregunta:** ¿Qué usuarios han desbloqueado más logros?  
**Cálculo:** Contar `user_achievements` por usuario (Top 10).  
**Visualización:** Barras horizontales.  
**Interpretación:** Reconocer a los usuarios más completos de la plataforma.

```sql
SELECT 
  u.nombre,
  u.nivel,
  COUNT(ua.id) AS logros_desbloqueados
FROM users u
LEFT JOIN user_achievements ua ON ua.user_id = u.id
GROUP BY u.id, u.nombre, u.nivel
ORDER BY logros_desbloqueados DESC
LIMIT 10;
```

---

## BLOQUE 06 — Distribuciones

### 11. Distribución del ahorro
**Pregunta:** ¿Cómo se distribuyen los valores de ahorro de los usuarios?  
**Cálculo:** Agrupar en rangos (0-100k, 100k-300k, 300k-500k, 500k-1M, >1M).  
**Visualización:** Histograma / barras.  
**Interpretación:** Ver si la mayoría tiene ahorros bajos, medios o altos.

```sql
SELECT 
  CASE 
    WHEN ahorro < 100000 THEN '0 - 100k'
    WHEN ahorro < 300000 THEN '100k - 300k'
    WHEN ahorro < 500000 THEN '300k - 500k'
    WHEN ahorro < 1000000 THEN '500k - 1M'
    ELSE 'Más de 1M'
  END AS rango_ahorro,
  COUNT(*) AS usuarios
FROM users
WHERE activo = true
GROUP BY 1
ORDER BY MIN(ahorro);
```

### 12. Distribución de lecciones completadas
**Pregunta:** ¿En qué rangos se concentran las lecciones completadas por los usuarios?  
**Cálculo:** Rangos de `lecciones_completadas`.  
**Visualización:** Histograma.  
**Interpretación:** Evaluar el progreso educativo de la comunidad.

```sql
SELECT 
  CASE 
    WHEN lecciones_completadas = 0 THEN '0 lecciones'
    WHEN lecciones_completadas BETWEEN 1 AND 4 THEN '1-4'
    WHEN lecciones_completadas BETWEEN 5 AND 9 THEN '5-9'
    WHEN lecciones_completadas BETWEEN 10 AND 14 THEN '10-14'
    ELSE '15 o más'
  END AS rango_lecciones,
  COUNT(*) AS usuarios
FROM users
GROUP BY 1
ORDER BY MIN(lecciones_completadas);
```

---

## BLOQUE 07 — Relaciones entre variables

### 13. Relación nivel vs ahorro
**Pregunta:** ¿Existe relación entre el nivel del usuario y su ahorro acumulado?  
**Cálculo:** Dispersión de `nivel` (X) vs `ahorro` (Y).  
**Visualización:** Gráfica de dispersión (scatter).  
**Interpretación:** Describir el patrón (positiva, negativa o inexistente). No afirmar causalidad.

```sql
SELECT nivel, ROUND(ahorro::numeric, 0) AS ahorro, nombre
FROM users
WHERE activo = true
ORDER BY nivel, ahorro;
```

### 14. Relación lecciones completadas vs retos aceptados
**Pregunta:** ¿Los usuarios que completan más lecciones también aceptan más retos?  
**Cálculo:** Dispersión `lecciones_completadas` vs `retos_aceptados`.  
**Visualización:** Scatter plot.  
**Interpretación:** Observar si hay correlación entre aprendizaje y participación en retos.

```sql
SELECT 
  lecciones_completadas,
  retos_aceptados,
  nombre,
  nivel
FROM users
WHERE activo = true
ORDER BY lecciones_completadas, retos_aceptados;
```

---

## BLOQUE 09 — Preguntas para reporte final

### 15. Situación general de CoinTribe (KPI + hallazgos)
**Pregunta:** ¿Cuál es la situación general de la comunidad CoinTribe con los datos actuales?  
**Cálculo / KPI sugeridos:**
- Total de usuarios activos
- Ahorro total de la tribu
- Ahorro promedio
- Nivel más frecuente
- Reto más popular
- Logro más desbloqueado
- Porcentaje de usuarios que superaron el 50% de su meta

**Visualizaciones recomendadas:**
1. Dona de distribución por nivel
2. Barras del Top 5 usuarios por ahorro
3. Barras de participación en retos

**Interpretación:** Redactar 3 hallazgos concretos y 1 recomendación basada solo en los datos.

```sql
-- KPIs principales
SELECT 
  COUNT(*) FILTER (WHERE activo) AS usuarios_activos,
  ROUND(SUM(ahorro)::numeric, 0) AS ahorro_total_tribu,
  ROUND(AVG(ahorro)::numeric, 0) AS ahorro_promedio,
  ROUND(AVG(ahorro / NULLIF(meta, 0) * 100)::numeric, 1) AS pct_promedio_meta,
  COUNT(*) FILTER (WHERE ahorro >= meta * 0.5) AS usuarios_mitad_meta,
  COUNT(*) FILTER (WHERE ahorro >= meta) AS usuarios_meta_cumplida
FROM users;
```

---

## Cómo usar este banco

1. Ejecuta el seed SQL (`sql/seed_masivo.sql`) en Neon / Supabase.
2. Responde cada pregunta siguiendo: **Pregunta → Cálculo → Gráfico → Interpretación**.
3. Usa herramientas como:
   - Supabase SQL Editor + Charts
   - Metabase / Grafana conectado a Neon
   - Python (pandas + matplotlib/seaborn/plotly)
   - Google Looker Studio o Power BI

**Regla de oro del banco original:**  
> Una buena gráfica no decora: responde una pregunta. Una buena interpretación no repite los números: explica por qué son importantes.
