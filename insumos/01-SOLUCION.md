# Solucion, leida desde el codigo

## Que hace el sistema

[INFERIDO] Permite consultar resoluciones y ver indicadores calculados sobre
ellas: hay una capa dedicada a obtener resoluciones
[src/shared/api/resoluciones.ts] y dos ganchos que calculan indicadores y
agregados [src/shared/hooks/useKpis.ts], [src/shared/hooks/useAggregates.ts].

[INFERIDO] Permite mirar el mismo conjunto desde tres angulos distintos: una
vista de informe [src/features/executive/pages/InformePage.tsx], una vista de
control [src/features/control/pages/ControlPage.tsx] y una vista territorial con
detalle por unidad [src/features/territorial/pages/TerritorialPage.tsx],
[src/features/territorial/pages/RegionDetailPage.tsx]. La navegacion entre ellas
esta declarada en un enrutador propio [src/app/router.tsx].

[INFERIDO] Permite filtrar de forma compartida entre vistas: hay un almacen de
filtros [src/app/store/useFilterStore.ts] y controles de seleccion reutilizables
[src/shared/components/ui/Select.tsx].

[INFERIDO] Permite leer los resultados como grafico y como tabla: hay componentes
de graficos [src/shared/components/Charts.tsx] y una tabla de datos
[src/shared/components/DataTable.tsx], apoyados en una libreria de graficos
declarada [package.json:20]. Hay tambien componentes que representan estado y
avance [src/shared/components/StatusVisuals.tsx].

[INFERIDO] Fuera de la aplicacion web hay un tratamiento de datos que estandariza
la entrada, clasifica por grupo, calcula lo que esta fuera de plazo contando dias
habiles y exporta un informe [notebook/intento1.py], usando librerias de
manipulacion de datos declaradas por importacion [notebook/intento1.py:15],
[notebook/intento1.py:16]. **No hay evidencia de que ese tratamiento y la
aplicacion web esten conectados**: la extraccion de rutas de API devolvio cero
resultados.

## De donde salen los datos

Esta es la parte mas importante de este documento y hay que decirla sin adornos.

[INFERIDO] Los datos que muestra la aplicacion web salen de una carpeta de datos
simulados del propio repositorio [src/mocks/data.ts], [src/mocks/constants.ts]. No
hay ninguna fuente externa consumida: la extraccion de rutas de API devolvio cero
resultados, la de tablas de base de datos tambien, y la unica variable de entorno
detectada es la ruta base de publicacion [src/app/router.tsx:6], que no es un
origen de datos.

[INFERIDO] La aplicacion esta preparada para que ese origen se reemplace: la
obtencion de resoluciones esta aislada en un solo archivo
[src/shared/api/resoluciones.ts]. Preparada no es conectada.

[PENDIENTE] Quien es dueno de la fuente real de resoluciones, en que sistema vive
y con que periodicidad se actualiza. Nada de eso esta en el repositorio.

[PENDIENTE] De donde lee sus datos el tratamiento fuera de la aplicacion web
[notebook/intento1.py]. Hay una funcion de carga, pero la evidencia no dice
contra que.

## Roles: quien ve que

[INFERIDO] **No hay control de acceso en este repositorio.** No hay guard,
decorador ni tabla de permisos; la extraccion de rutas de API devolvio cero
resultados, y el analisis de senales de capacidad, que recorre categorias de
forma exhaustiva, solo reporto dos para este repositorio y ninguna es de
autenticacion. Las tres vistas son alcanzables por la misma navegacion
[src/app/router.tsx], sin distincion.

[INFERIDO] Los unicos nombres de perfil que existen son datos, no permisos:
`ANALISTAS` y `ABOGADOS` [src/mocks/constants.ts]. Ninguna ruta los usa para
restringir nada.

[PENDIENTE] Quien deberia poder ver cada vista. Es una decision de negocio y hoy
no esta escrita en ninguna parte del codigo.

## Que NO hace

Ausencias afirmables, porque el analizador busco esas categorias de forma
exhaustiva y devolvio vacio:

- [INFERIDO] No existe ningun endpoint declarado: la extraccion de rutas de API
  devolvio cero resultados. No hay servidor propio en este repositorio.
- [INFERIDO] No existe ninguna tabla de base de datos declarada: la extraccion de
  tablas devolvio cero resultados. No hay persistencia.
- [INFERIDO] No hay dependencias de Python declaradas en ningun manifiesto: el
  listado viene vacio, pese a que existe un archivo Python en el repositorio
  [notebook/intento1.py]. Ese guion no tiene sus dependencias declaradas.
- [INFERIDO] Solo hay una variable de entorno leida por el codigo
  [src/app/router.tsx:6]: no hay configuracion de conexion a ningun sistema
  externo.

## Iteraciones

[INFERIDO] Hay publicacion automatizada del sitio [.github/workflows/deploy-pages.yml]
y automatizacion de documentacion [.github/workflows/readme.yml]. No hay
CHANGELOG ni migraciones numeradas. El nombre del archivo del tratamiento de
datos sugiere un primer intento, pero un nombre de archivo no es una historia de
versiones: [PENDIENTE] cuantas iteraciones hubo y cual es la vigente.

## Lo que este borrador no pudo describir

- El contenido real de las tres vistas: se sabe que existen y como se llaman sus
  componentes, no que decision permite tomar cada una.
- La relacion entre el tratamiento de datos [notebook/intento1.py] y la
  aplicacion web. Hoy la evidencia no muestra ningun punto de contacto.
- El significado de negocio de `GRUPOS` y de la agrupacion por marco
  [src/mocks/constants.ts].
