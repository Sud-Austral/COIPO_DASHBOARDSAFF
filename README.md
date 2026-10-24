# Dashboard SAF - Fiscalización Forestal CONAF

Aplicación React profesional para el seguimiento de resoluciones forestales, cumplimiento de plazos y análisis territorial.

## Stack Tecnológico

- **Framework**: Vite + React 18 + TypeScript
- **Estilos**: TailwindCSS (Arquitectura basada en utilidades y diseño premium)
- **Navegación**: React Router v6
- **Estado Global**: Zustand (Persistencia en LocalStorage para filtros compartidos)
- **Data Fetching**: TanStack Query (Capa de datos abstracta, lista para backend)
- **Gráficos**: Recharts (Migración de SVGs manuales a componentes interactivos)
- **Iconografía**: Lucide React
- **Reportes**: React-to-Print (Exportación PDF con layout editorial)

## Arquitectura

La aplicación sigue una arquitectura modular por dominios funcionales:

```
src/
  app/            # Configuración global, Router, Layouts y Store
  features/       # Módulos de negocio (Executive, Control, Territorial)
  shared/         # Componentes UI reutilizables, Hooks y Tipos
  mocks/          # Lógica de simulación de datos (determinista)
```

### Decisiones Técnicas

1.  **Filtros Globales**: El `useFilterStore` (Zustand) sincroniza automáticamente el Año, Región y Marco entre todas las vistas. Si cambias de año en el Header, se refleja tanto en el informe como en el mapa.
2.  **Abstracción de API**: `useResoluciones` centraliza la carga de datos. Actualmente lee del generador `mulberry32` (mock), pero cambiarlo a un backend real solo requiere actualizar la función `fetchResoluciones` en `shared/api/resoluciones.ts`.
3.  **Vistas Especializadas**:
    - `/informe`: Diseño sobrio, tipografía serif (Fraunces), enfocado en la presentación gerencial.
    - `/control`: Interfaz densa "cockpit" para operación diaria y búsqueda rápida.
    - `/territorios`: Uso de rankings, sparklines y rutas dinámicas (`/territorios/:codigo`) para el drill-down regional.

## Instalación y Ejecución

Requiere Node.js (el workflow de CI usa Node 20). No hay pruebas automatizadas ni configuración de ESLint en el repo (VERIFICADO: `package.json` no define `test` y no incluye `eslint` entre sus dependencias, por lo que `npm run lint` hoy no funciona).

```bash
npm install
npm run dev      # servidor de desarrollo de Vite
npm run build    # tsc && vite build -> dist/
npm run preview  # sirve dist/
```

No ejecuté estos comandos para esta actualización de documentación.

## Despliegue

Push a `main` -> `.github/workflows/deploy-pages.yml` (Node 20, `npm install`, `npm run build`) publica `dist/` en GitHub Pages. `vite.config.ts` fija `base: '/COIPO_DASHBOARDSAFF/'` y el router usa ese valor como `basename`; si se cambia el nombre del repo hay que actualizar ambos. `.github/workflows/readme.yml` regenera documentación con el flujo de la flota COIPO.

## Datos: hoy son simulados

VERIFICADO: `useResoluciones` (`src/shared/api/resoluciones.ts`) devuelve `genDataset()` de `src/mocks/data.ts` tras una demora artificial de 400 ms (semilla fija 42). No hay backend, ni variables de entorno de datos, ni autenticación.

`notebook/intento1.py` **no es un backend FastAPI**: es un guion de pandas (limpieza de números chilenos, clasificación por grupo, cálculo de fuera de plazo con días hábiles y exportación a Excel). No está conectado a la aplicación web ni declara sus dependencias.

## Siguiente paso: conectar una fuente real

1.  Reemplazar `fetchResoluciones` en `src/shared/api/resoluciones.ts` por una llamada a la API real (la fuente y su dueño están pendientes de confirmar por el equipo).
2.  Asegurar que el JSON coincida con la interfaz `Resolucion` de `src/shared/types/index.ts`.
3.  Si la API está en otro origen, habilitar CORS en ella.

## Documentos

[`CLAUDE.md`](CLAUDE.md) · [`insumos/00-PROBLEMA.md`](insumos/00-PROBLEMA.md) · [`insumos/01-SOLUCION.md`](insumos/01-SOLUCION.md)

---
*Desarrollado para la Subgerencia de Administración y Fiscalización - CONAF.*
