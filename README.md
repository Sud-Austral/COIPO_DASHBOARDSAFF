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

### Deciciones Técnicas

1.  **Filtros Globales**: El `useFilterStore` (Zustand) sincroniza automáticamente el Año, Región y Marco entre todas las vistas. Si cambias de año en el Header, se refleja tanto en el informe como en el mapa.
2.  **Abstracción de API**: `useResoluciones` centraliza la carga de datos. Actualmente lee del generador `mulberry32` (mock), pero cambiarlo a un backend real (FastAPI) solo requiere actualizar la función `fetchResoluciones` en `shared/api/resoluciones.ts`.
3.  **Vistas Especializadas**:
    - `/informe`: Diseño sobrio, tipografía serif (Fraunces), enfocado en la presentación gerencial.
    - `/control`: Interfaz densa "cockpit" para operación diaria y búsqueda rápida.
    - `/territorios`: Uso de rankings, sparklines y rutas dinámicas (`/territorios/:codigo`) para el drill-down regional.

## Instalación y Ejecución

Debido a que este entorno no dispone de Node.js instalado globalmente, se han generado todos los archivos listos para ser utilizados. Para iniciar localmente en un entorno con Node:

```bash
npm install
npm run dev
```

## Siguiente Paso: Conexión al Backend Real

Para conectar con el archivo `intento1.py` (FastAPI), debe:

1.  Habilitar CORS en el backend de Python.
2.  Actualizar la URL en `src/shared/api/resoluciones.ts`:
    ```typescript
    const fetchResoluciones = async () => {
      const res = await fetch('https://su-backend.railway.app/api/resoluciones');
      return res.json();
    };
    ```
3.  Asegurarse de que el JSON del backend coincida con la interfaz `Resolucion` definida en `src/shared/types/index.ts`.

---
*Desarrollado para la Subgerencia de Administración y Fiscalización - CONAF.*
