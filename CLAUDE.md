# CLAUDE.md — COIPO_DASHBOARDSAFF

## ¿Qué es este proyecto?
Aplicación React profesional para el seguimiento de resoluciones forestales, cumplimiento de plazos y análisis territorial. - **Framework**: Vite + React 18 + TypeScript - **Estilos**: TailwindCSS (Arquitectura basada en utilidades y diseño premium)

---

## Comandos de Referencia Rápida
- **Iniciar servidor de desarrollo:** `npm run dev`
- **Compilar para producción:** `npm run build`
- **Ejecutar pruebas (Tests):** `npm test`
- **Lint / Formateo:** `npm run lint`

## Tecnología y Stack
- **Frontend:** React / Node.js (Vite: True, TS: True, React: True)

## Guía de Estilo y Convenciones
- **Idioma del código:** Inglés para infraestructura, nombres de variables y funciones. Español para comentarios de negocio e interfaz de usuario.
- **Frontend JavaScript/TypeScript:** Estilo `camelCase` para variables y funciones, `PascalCase` para componentes React y tipos. Cumplir con ESLint/Prettier.
- **Trazabilidad:** Cada cambio debe rastrearse directamente a un requerimiento o corrección solicitada.


## Directrices de Desarrollo (Claude Code)

### 1. Pensar antes de Codificar
- **No asumas:** Si hay ambigüedad o múltiples interpretaciones, pregunta antes de codificar.
- **Simplifica:** Elige el camino más simple y limpio. Evita la sobreingeniería y abstracciones innecesarias.

### 2. Cambios Quirúrgicos
- Modifica únicamente las líneas necesarias para cumplir el objetivo.
- No realices refactorizaciones no solicitadas en código adyacente.
- Respeta estrictamente el formato y estilo del archivo existente.

### 3. Ejecución Orientada a Objetivos
- Define el criterio de éxito para cada cambio.
- Comprueba que tus modificaciones no introduzcan errores de compilación o de linting.
