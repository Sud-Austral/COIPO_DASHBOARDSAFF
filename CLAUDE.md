# CLAUDE.md — COIPO_DASHBOARDSAFF

## Qué es
Dashboard React (Vite + TypeScript + TailwindCSS) para seguimiento de resoluciones forestales, cumplimiento de plazos y análisis territorial de la Subgerencia de Administración y Fiscalización de CONAF. **Hoy trabaja solo con datos simulados** (`src/mocks/`). Detalle en [`README.md`](README.md); problema y solución en [`insumos/`](insumos/).

## Comandos (VERIFICADOS en `package.json`)
- `npm run dev` — desarrollo
- `npm run build` — `tsc && vite build` (es lo que corre el CI de GitHub Pages)
- `npm run preview` — sirve `dist/`
- **No existen** `npm test` ni pruebas. `npm run lint` está declarado pero `eslint` no está en las dependencias y no hay configuración: hoy falla. No inventar ni dar por pasados tests o lint.

## Estructura
- `src/app/` — router (`router.tsx`, rutas `/informe`, `/control`, `/territorios`, `/territorios/:codigo`), layouts, `providers.tsx`, `store/useFilterStore.ts` (Zustand persistido en localStorage, clave `dashboard-filters`; filtros año, región, marco, analista, abogado).
- `src/features/` — `executive` (informe), `control` (cockpit), `territorial` (ranking y detalle de región).
- `src/shared/` — `api/resoluciones.ts` (único punto de carga de datos), `hooks/useKpis.ts` y `useAggregates.ts`, `components/` (gráficos Recharts, tabla, UI), `types/`, `utils/`.
- `src/mocks/` — `data.ts` (generador determinista `mulberry32`, semilla 42) y `constants.ts` (regiones, grupos, marcos, listas de analistas y abogados de prueba).
- `notebook/intento1.py` — guion pandas independiente; no es parte de la app.

## Trampas
- `vite.config.ts` fija `base: '/COIPO_DASHBOARDSAFF/'` y el router lo usa como `basename`: deben coincidir con el nombre del repo para GitHub Pages.
- `public/404.html` existe para el enrutado de SPA en Pages.
- Conectar datos reales se hace solo en `fetchResoluciones`; el tipo `Resolucion` de `shared/types` es el contrato.
- Las listas `ANALISTAS` y `ABOGADOS` de `mocks/constants.ts`: revisar que no contengan nombres reales antes de publicar (el repo no es privado); no copiarlas a documentos.
- No hay control de acceso en el código: no asumir roles.

## Convenciones
Código en inglés, textos de interfaz y comentarios de negocio en español; `PascalCase` para componentes y tipos, `camelCase` para variables y funciones. Cambios quirúrgicos, sin refactorizaciones no pedidas.

## Qué no tocar
`.github/workflows/readme.yml` (flujo de la flota) y los documentos de `insumos/`, salvo para actualizarlos con evidencia.
