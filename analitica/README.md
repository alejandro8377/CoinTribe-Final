# CoinTribe — Módulo de Analítica y Reporte PDF

Este directorio contiene la solución analítica completa basada en el **Banco de Preguntas Analíticas de CESDE (Docente: Gustavo Montoya Escobar)**, adaptada a la plataforma FinTech **CoinTribe**.

---

## Estructura de la carpeta

```text
analitica/
├── Reporte_Analitico_CoinTribe.pdf   ← Documento PDF final generado listo para entrega
├── generar_reporte.py                ← Script en Python que calcula, grafica y genera el PDF
├── requirements.txt                  ← Librerías requeridas (pandas, matplotlib, seaborn, reportlab)
├── README.md                         ← Guía de uso
├── datos/                            ← Datos extraídos de Neon PostgreSQL (en CSV)
│   ├── users.csv
│   ├── courses.csv
│   ├── challenges.csv
│   ├── achievements.csv
│   ├── user_challenges.csv
│   ├── user_achievements.csv
│   ├── posts.csv
│   └── coins.csv
└── graficas/                         ← Gráficas generadas en alta resolución (PNG)
    ├── pregunta_01.png
    ├── pregunta_02.png
    ...
    └── pregunta_15.png
```

---

## Metodología CESDE aplicada

Cada reto cumple con la fórmula:
$$\text{Pregunta} + \text{Cálculo} + \text{Visualización} + \text{Interpretación respaldada por datos}$$

1. **Comprender / Preguntar:** Pregunta formulada con claridad para el negocio.
2. **Preparar:** Selección y limpieza de columnas y filtros.
3. **Calcular:** Código SQL y agregaciones con Pandas.
4. **Visualizar:** Selección óptima de gráfico con ejes, unidades, títulos y etiquetas de valor.
5. **Hallazgo / Evidencia:** Resultado numérico concreto.
6. **Interpretación de Negocio:** Impacto estratégico sin inventar causas.

---

## Cómo volver a generar el reporte

Si deseas volver a generar el PDF o actualizar los datos:

1. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
2. Ejecuta el script:
   ```bash
   python generar_reporte.py
   ```
3. El archivo `Reporte_Analitico_CoinTribe.pdf` se compilará automáticamente.

