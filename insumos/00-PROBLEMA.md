# Problema, reconstruido desde el codigo

## Advertencia sobre la cadena de inferencia

Este documento se escribio hacia atras: se leyo lo construido y desde ahi se
dedujo que problema pudo haberlo originado. La cadena es debil y va explicita.
Cada afirmacion lleva su cita o su marca.

## Que problema se estaba resolviendo

[INFERIDO] El sistema presenta y agrupa resoluciones: hay una capa dedicada a
traerlas [src/shared/api/resoluciones.ts] y ganchos que calculan indicadores y
agregados sobre ellas [src/shared/hooks/useKpis.ts],
[src/shared/hooks/useAggregates.ts]. Si se construyo eso, entonces probablemente
habia un problema con tener a la vista el estado de las resoluciones. Esa es toda
la inferencia, y es una hipotesis.

[INFERIDO] El problema tenia una dimension de plazos, no solo de conteo: en el
tratamiento de datos hay una funcion que calcula lo que esta fuera de plazo y
otra que cuenta dias habiles [notebook/intento1.py]. Contar dias habiles solo se
programa cuando el plazo importa.

[INFERIDO] El problema tenia una dimension territorial: hay una vista por
territorio y otra de detalle por unidad territorial
[src/features/territorial/pages/TerritorialPage.tsx],
[src/features/territorial/pages/RegionDetailPage.tsx], y una lista de regiones
entre las constantes [src/mocks/constants.ts].

[INFERIDO] Habia mas de un publico para la misma informacion: existen tres
vistas separadas sobre el mismo dato, una de informe
[src/features/executive/pages/InformePage.tsx], una de control
[src/features/control/pages/ControlPage.tsx] y una territorial
[src/features/territorial/pages/TerritorialPage.tsx]. Que cada una corresponda a
un publico distinto es hipotesis; que sean tres vistas distintas, no.

[INFERIDO] Se esperaba sacar el resultado del sistema en papel o en documento:
esta declarada una dependencia de impresion [package.json:19]. Que exista la
dependencia no prueba que la funcionalidad este terminada.

## Quien sufre el problema

Con precision: **no hay guard, decorador, middleware de autorizacion ni tabla de
permisos en este repositorio**. La extraccion de rutas de API devolvio cero
resultados y la de tablas de base de datos tambien. No hay ningun rol impuesto
por codigo.

[INFERIDO] Si aparecen dos nombres de perfil como constantes de datos, no como
control de acceso: dos listas llamadas `ANALISTAS` y `ABOGADOS`
[src/mocks/constants.ts]. Eso sugiere que en el dominio hay al menos esos dos
perfiles asociados a una resolucion. Que sean los usuarios del sistema, o solo
atributos del dato, es [PENDIENTE].

[INFERIDO] Hay una tercera agrupacion del dominio, `GRUPOS`
[src/mocks/constants.ts], y una clasificacion por grupo en el tratamiento de
datos [notebook/intento1.py]. Que significa cada grupo es [PENDIENTE].

## Cuantas personas son

[PENDIENTE] Sin excepcion. Las listas de perfiles que hay en el repositorio estan
en una carpeta de datos simulados [src/mocks/constants.ts]: no son un dato de
dotacion y no se pueden contar como tal.

## Como lo resolvian antes

[INFERIDO] Hubo un tratamiento previo de datos fuera de la aplicacion web: existe
un guion de analisis que carga datos, los estandariza, limpia numeros en formato
local, arma tablas y exporta un informe [notebook/intento1.py], apoyado en
librerias de manipulacion de datos [notebook/intento1.py:15],
[notebook/intento1.py:16]. La existencia de una funcion de limpieza de numeros y
de otra de estandarizacion es indicio de que la entrada venia desordenada; de
donde venia y quien la mantenia es [PENDIENTE].

[PENDIENTE] Quien mantenia esa fuente, con que periodicidad y cuanto tardaba. El
codigo no lo dice.

## Que pasa si no se hace nada

[PENDIENTE] Sin excepcion. El codigo no responde esta pregunta y no se deduce de
que el sistema exista.

## Volumen

[PENDIENTE] No hay indices, paginacion, particiones ni tipos de columna que den
un orden de magnitud: la extraccion de tablas de base de datos devolvio cero
resultados y no hay esquema de datos en el repositorio.

[INFERIDO] El unico indicio de escala es que la interfaz esta pensada para
filtrar antes de mirar: hay un almacen de filtros compartido
[src/app/store/useFilterStore.ts] y una lista de anios entre las constantes
[src/mocks/constants.ts]. Un sistema que necesita filtros por anio y por
territorio suele estar mirando mas registros de los que caben en una pantalla.
La cifra sigue siendo [PENDIENTE].

## Quien decide que esta terminado

[PENDIENTE] Sin excepcion.

## Datos personales y normativa

[VERIFICAR] Dos constantes del repositorio se llaman `ANALISTAS` y `ABOGADOS`
[src/mocks/constants.ts]. Si contienen nombres de personas, aunque sean de
prueba, hay que revisarlo antes de dar el repositorio por publicable. No se
transcribe ningun valor en este documento. Ojo con el contexto: la evidencia
declara que este repositorio no es privado.

[VERIFICAR] Un sistema que registra plazos incumplidos por territorio y por
perfil puede tener implicancias de responsabilidad administrativa. No se cita
ninguna norma aca porque no corresponde deducirla del codigo; lo cierra Fiscalia
o Auditoria.
