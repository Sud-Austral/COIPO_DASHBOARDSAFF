"""
INFORME DE GESTIÓN - SOLICITUDES FORESTALES SANCIONADAS
========================================================
Genera el informe de gestión periódico de la Unidad de Fiscalización Forestal (SAF/CONAF),
consolidando solicitudes resueltas bajo tres marcos normativos:

  - DL 701   : Decreto Ley 701 (plantaciones forestales y fomento)
  - Ley 20.283: Recuperación del bosque nativo y fomento forestal
  - DS 490   : Decreto Supremo 490 (control de productos forestales)

El informe mide volumen de resoluciones, superficies aprobadas, bonificaciones
emitidas y cumplimiento de plazos legales por región y año.
"""

import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

# =============================================================================
# 1. REGLAS DE NEGOCIO: PLAZOS LEGALES Y TERRITORIOS
# =============================================================================

# Plazos máximos de resolución según normativa vigente.
# Formato: (días, tipo_conteo)  —  None = trámite sin plazo obligatorio.
# Días hábiles excluyen sábados, domingos y festivos (np.busday_count).
# Días corridos cuentan días calendario desde ingreso a resolución.
PLAZOS_LEGALES = {
    # DL 701 ─────────────────────────────────────────────────────────────────
    'AVISO 701':        (None, 'sin_plazo'),   # Aviso de ejecución: sólo registro
    'PM Y NM DL 701':  (120,  'corridos'),     # Planes y normas de manejo: 120 días corridos
    'OTROS 701':       (60,   'corridos'),     # Otros trámites DL 701: 60 días corridos
    # Ley 20.283 ──────────────────────────────────────────────────────────────
    'AVISO E INFORME BN':          (60,  'habiles'),  # Avisos de inicio/postergación e informes anuales
    'BONOS BN':                    (90,  'habiles'),  # Bonificaciones art. 22: 90 días hábiles
    'OTROS BN':                    (60,  'habiles'),  # Otros trámites bosque nativo
    'PM, NM, PTFX y ASC LEY 20.283': (90, 'habiles'),# Planes de manejo, normas y autorizaciones simples
    # DS 490 ──────────────────────────────────────────────────────────────────
    'DS 490': (None, 'sin_plazo'),             # Guías y declaraciones: no tienen plazo legal
}

# Mapeo nombre largo de región → código romano oficial (Ley 19.175).
# Regiones sin presencia forestal relevante (I, II, XV) se incluyen por completitud.
REGION_MAP = {
    'DE ARICA Y PARINACOTA':                  'XV',
    'TARAPACA':                               'I',
    'ANTOFAGASTA':                            'II',
    'DE ATACAMA':                             'III',
    'DE COQUIMBO':                            'IV',
    'DE VALPARAISO':                          'V',
    "DEL LIBERTADOR BERNARDO O'HIGGINS":      'VI',
    'DEL MAULE':                              'VII',
    'DE ÑUBLE':                               'XVI',
    'DEL BIO-BIO':                            'VIII',
    'DE LA ARAUCANIA':                        'IX',
    'DE LOS RIOS':                            'XIV',
    'DE LOS LAGOS':                           'X',
    'DE AYSEN DEL GRAL. C. IBANEZ DEL C.':   'XI',
    'DE MAGALLANES Y ANTARTICA CHILENA':      'XII',
    'METROPOLITANA DE SANTIAGO':              'RM',
}

# Orden sur-norte habitual en informes CONAF (macro-zona sur primero).
REGIONES_INFORME = ['III', 'IV', 'V', 'VI', 'VII', 'XVI', 'VIII', 'IX', 'XIV', 'X', 'XI', 'XII', 'RM']

# =============================================================================
# 2. CARGA Y ESTANDARIZACIÓN DE DATOS
# =============================================================================

def limpiar_numero_chileno(val):
    """Convierte formato numérico chileno (1.234,56) a float Python (1234.56)."""
    if pd.isnull(val):
        return 0.0
    s = str(val).replace('.', '').replace(',', '.')
    if s.startswith('.'):
        s = '0' + s
    try:
        return float(s)
    except ValueError:
        return 0.0


def clasificar_grupo(tipo_solicitud):
    """
    Asigna cada tipo de solicitud a su grupo normativo.

    La clasificación determina:
      - El marco legal aplicable (DL 701, Ley 20.283, DS 490)
      - El plazo de resolución exigible
      - El cuadro del informe en que aparece

    Regla de prioridad: se evalúa en orden; el primero que coincide gana.
    Los trámites no reconocidos caen en 'OTROS BN' (bosque nativo residual).
    """
    t = str(tipo_solicitud).upper()

    # ── DL 701: Plantaciones forestales ──────────────────────────────────────
    if 'AVISO DE EJECUCION DE FAENAS' in t:
        return 'AVISO 701'
    if any(x in t for x in [
        'PLAN DE MANEJO PLANTACIONES', 'NORMA DE MANEJO EUCALIPTUS',
        'NORMA DE MANEJO PINO INSIGNE', 'NORMA DE MANEJO DE PREVENCION'
    ]):
        return 'PM Y NM DL 701'
    if any(x in t for x in [
        'CALIFICACION DE TERRENOS', 'DECLARACION DE BOSQUE DE PROTECCION',
        'DESAFECTACION', 'MODIFICACION DE PLAN'
    ]):
        return 'OTROS 701'

    # ── Ley 20.283: Bosque nativo ─────────────────────────────────────────────
    if any(x in t for x in ['AVISO DE INICIO', 'AVISO DE POSTERGACION', 'INFORME ANUAL']):
        return 'AVISO E INFORME BN'
    if 'ARTICULO' in t and '22' in t:
        # Art. 22 Ley 20.283: bonificación por recuperación de bosque nativo
        return 'BONOS BN'
    if any(x in t for x in [
        'PLAN DE MANEJO FORESTAL DE BOSQUE NATIVO', 'AUTORIZACION SIMPLE',
        'NORMA DE MANEJO', 'PLAN DE TRABAJO', 'PLAN DE CORRECCION',
        'NORMA RORACO', 'NORMA DE MANEJO APLICABLE',
        'NORMA DE MANEJO LENGA', 'NORMA DE MANEJO ROBLE'
    ]):
        return 'PM, NM, PTFX y ASC LEY 20.283'

    # ── DS 490: Control de productos forestales ───────────────────────────────
    if any(x in t for x in [
        'DECLARACION DE EXISTENCIAS', 'GUIA DE LIBRE TRANSITO',
        'MARCAJE DE PRODUCTOS', 'GUIA ESPECIAL', 'PLAN DE EXTRACCION'
    ]):
        return 'DS 490'

    return 'OTROS BN'


def cargar_datos():
    """Lee el archivo de solicitudes sancionadas (CSV plano para desarrollo)."""
    return pd.read_csv(r"../data/data.csv")


def estandarizar(df):
    """
    Normaliza el DataFrame crudo hacia el esquema interno del informe.

    Pasos:
      1. Renombra columnas al esquema estándar.
      2. Normaliza regiones al código romano.
      3. Parsea todas las fechas relevantes.
      4. Limpia superficies y montos (formato numérico chileno).
      5. Clasifica cada solicitud en su grupo normativo.
      6. Calcula tiempos de tramitación desagregados:
           Dias_IT      = duración del informe técnico (analista)
           Dias_IL      = duración del informe legal (abogado)
           Dias_Visado  = tiempo entre fin informe legal y resolución final
           Dias_Tramite = duración total (ingreso → resolución)
    """
    col_map = {
        'Region Of':              'Region',
        'Tipo Solicitud Compl':   'Tipo_Solicitud',
        'Super.Aprobada':         'Sup_Aprobada',
        'Fec.Ingreso':            'Fecha_Ingreso',
        'Fec.Resolucion':         'Fecha_Resolucion',
        'Nro.Resolucion':         'Nro_Resolucion',
        'Analista':               'Analista',
        'Abogado':                'Abogado',
        'Fec_inicio_IT_Analista': 'Inicio_IT',
        'Fec_termino_IT_Analista':'Fin_IT',
        'Fec_inicio_IL_Abogado':  'Inicio_IL',
        'Fec_termino_IL_Abogado': 'Fin_IL',
        'Monto $':                'Monto_Aprobado',
    }
    df = df.rename(columns={k: v for k, v in col_map.items() if k in df.columns})

    cols_utiles = [
        'Region', 'Tipo_Solicitud', 'Sup_Aprobada',
        'Fecha_Ingreso', 'Fecha_Resolucion', 'Nro_Resolucion',
        'Analista', 'Abogado',
        'Inicio_IT', 'Fin_IT', 'Inicio_IL', 'Fin_IL',
        'Monto_Aprobado',
    ]
    df = df[[c for c in cols_utiles if c in df.columns]]

    df['Region'] = df['Region'].str.strip().str.upper().map(REGION_MAP).fillna(df['Region'])

    for col in ['Fecha_Ingreso', 'Fecha_Resolucion', 'Inicio_IT', 'Fin_IT', 'Inicio_IL', 'Fin_IL']:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce', dayfirst=True)

    df['Año'] = df['Fecha_Resolucion'].dt.year

    df['Sup_Aprobada']   = df['Sup_Aprobada'].apply(limpiar_numero_chileno)
    df['Monto_Aprobado'] = df['Monto_Aprobado'].apply(limpiar_numero_chileno)

    df['Grupo'] = df['Tipo_Solicitud'].apply(clasificar_grupo)

    df['Dias_Tramite'] = (df['Fecha_Resolucion'] - df['Fecha_Ingreso']).dt.days.clip(lower=0)
    df['Dias_IT']      = (df['Fin_IT']  - df['Inicio_IT']).dt.days.clip(lower=0)
    df['Dias_IL']      = (df['Fin_IL']  - df['Inicio_IL']).dt.days.clip(lower=0)
    df['Dias_Visado']  = (df['Fecha_Resolucion'] - df['Fin_IL']).dt.days.clip(lower=0)

    return df

# =============================================================================
# 3. CUMPLIMIENTO DE PLAZOS LEGALES
# =============================================================================

def calcular_fuera_plazo(df):
    """
    Determina si cada solicitud fue resuelta dentro del plazo legal.

    - Para plazos en días corridos usa Dias_Tramite (ya calculado).
    - Para plazos en días hábiles recalcula con np.busday_count
      (excluye fines de semana; no incluye festivos chilenos por limitación
       de la librería estándar — mejora pendiente con biblioteca holidays).
    - Solicitudes sin plazo legal (DS 490, AVISO 701) quedan excluidas
      del análisis de cumplimiento (Fuera_Plazo = 0).
    """
    def dias_habiles(start, end):
        if pd.isnull(start) or pd.isnull(end):
            return np.nan
        return np.busday_count(start.date(), end.date())

    df['Dias_Efectivo'] = df.apply(
        lambda r: r['Dias_Tramite']
        if PLAZOS_LEGALES.get(r['Grupo'], (None, ''))[1] == 'corridos'
        else dias_habiles(r['Fecha_Ingreso'], r['Fecha_Resolucion']),
        axis=1,
    )
    df['Plazo_Dias'] = df['Grupo'].map(lambda g: PLAZOS_LEGALES.get(g, (None, ''))[0])
    df['Fuera_Plazo'] = np.where(
        df['Plazo_Dias'].notna() & (df['Dias_Efectivo'] > df['Plazo_Dias']), 1, 0
    )
    return df

# =============================================================================
# 4. CUADROS DEL INFORME DE GESTIÓN
# =============================================================================

def generar_tablas(df):
    """
    Produce los ocho cuadros del informe de gestión SAF.

    Cuadros generados
    -----------------
    c1  Cuadro 3.1-A  Resoluciones DL 701 por año, región y tipo
    c2  Cuadro 3.1-B  Resoluciones Ley 20.283 por año, región y tipo
    c3  Cuadro 3.2    Bonificaciones art. 22 emitidas (N°, sup., monto)
    c4  Cuadro 3.3-A  Superficie aprobada DL 701 (ha) por año y región
    c5  Cuadro 3.3-B  Superficie aprobada Ley 20.283 (ha) por año y región
    c6  Cuadro 3.4    Cumplimiento de plazos legales (dentro/fuera %)
    c7  Cuadro 3.5    Tiempos promedio de tramitación por tipo de solicitud
    res Resumen Ejecutivo  KPIs consolidados del período
    """
    años = sorted(df['Año'].dropna().unique().astype(int))

    # ── Grupos por marco normativo ────────────────────────────────────────────
    grupos_701 = ['AVISO 701', 'PM Y NM DL 701', 'OTROS 701']
    grupos_bn  = ['AVISO E INFORME BN', 'PM, NM, PTFX y ASC LEY 20.283', 'BONOS BN', 'OTROS BN']

    # c1: Volumen de resoluciones DL 701
    c1 = (df[df['Grupo'].isin(grupos_701)]
          .pivot_table(index=['Año', 'Region'], columns='Grupo',
                       values='Nro_Resolucion', aggfunc='count', fill_value=0))
    c1['TOTAL'] = c1.sum(axis=1)

    # c2: Volumen de resoluciones Ley 20.283 (bosque nativo)
    c2 = (df[df['Grupo'].isin(grupos_bn)]
          .pivot_table(index=['Año', 'Region'], columns='Grupo',
                       values='Nro_Resolucion', aggfunc='count', fill_value=0))
    c2['TOTAL'] = c2.sum(axis=1)

    # c3: Bonificaciones art. 22 — N° de instrumentos, superficie y monto ($)
    df_bonos = df[df['Grupo'] == 'BONOS BN']
    c3 = (df_bonos
          .groupby(['Año', 'Tipo_Solicitud', 'Region'])
          .agg(
              N_Instrumentos  =('Nro_Resolucion',  'count'),
              Sup_Aprobada_ha =('Sup_Aprobada',    'sum'),
              Monto_Bonos_CLP =('Monto_Aprobado',  'sum'),
          )
          .reset_index())

    # c4: Superficie aprobada (ha) DL 701
    c4 = (df[df['Grupo'].isin(grupos_701)]
          .pivot_table(index=['Año', 'Region'], columns='Grupo',
                       values='Sup_Aprobada', aggfunc='sum', fill_value=0))
    c4['Total_ha'] = c4.sum(axis=1)

    # c5: Superficie aprobada (ha) Ley 20.283
    c5 = (df[df['Grupo'].isin(grupos_bn)]
          .pivot_table(index=['Año', 'Region'], columns='Grupo',
                       values='Sup_Aprobada', aggfunc='sum', fill_value=0))
    c5['Total_ha'] = c5.sum(axis=1)

    # c6: Cumplimiento de plazos legales (sólo grupos con plazo definido)
    df_con_plazo = df[df['Plazo_Dias'].notna()].copy()
    c6 = df_con_plazo.groupby(['Año', 'Region']).agg(
        Dentro_Plazo=('Fuera_Plazo', lambda x: (x == 0).sum()),
        Fuera_Plazo =('Fuera_Plazo', 'sum'),
        Total       =('Fuera_Plazo', 'count'),
    )
    c6['% Cumplimiento'] = (c6['Dentro_Plazo'] / c6['Total'] * 100).round(1)
    c6['% Incumplimiento'] = (c6['Fuera_Plazo'] / c6['Total'] * 100).round(1)

    # c7: Tiempos promedio de tramitación (días) por tipo de solicitud
    cols_tiempos = ['Dias_IT', 'Dias_IL', 'Dias_Visado', 'Dias_Tramite']
    c7 = df.groupby(['Año', 'Tipo_Solicitud'])[cols_tiempos].mean().round(0)
    c7['N_Solicitudes'] = df.groupby(['Año', 'Tipo_Solicitud']).size()
    c7.columns = ['Prom_Dias_IT', 'Prom_Dias_IL', 'Prom_Dias_Visado', 'Prom_Dias_Tramite', 'N_Solicitudes']

    # Resumen ejecutivo — KPIs del período
    total_con_plazo = c6['Total'].sum()
    pct_fuera = (
        f"{c6['Fuera_Plazo'].sum() / total_con_plazo * 100:.1f}%"
        if total_con_plazo > 0 else "0.0%"
    )
    resumen = {
        'Período cubierto':          ', '.join(str(a) for a in años),
        'Total solicitudes resueltas': len(df),
        '  DL 701 (plantaciones)':   len(df[df['Grupo'].str.contains('701')]),
        '  Ley 20.283 (bosque nativo)': len(df[df['Grupo'].str.contains('BN|20.283', regex=True)]),
        '  DS 490 (control productos)': len(df[df['Grupo'] == 'DS 490']),
        'Bonificaciones art. 22 emitidas': len(df_bonos),
        'Monto total bonos ($)':     f"${df_bonos['Monto_Aprobado'].sum():,.0f}".replace(',', '.'),
        'Superficie total aprobada (ha)': f"{df['Sup_Aprobada'].sum():,.1f}".replace(',', '.'),
        'Analistas con resoluciones':  df['Analista'].dropna().nunique(),
        'Abogados con resoluciones':   df['Abogado'].dropna().nunique(),
        'Incumplimiento de plazos (%)': pct_fuera,
    }

    return resumen, c1, c2, c3, c4, c5, c6, c7

# =============================================================================
# 5. EXPORTACIÓN A EXCEL
# =============================================================================

def exportar_informe(df, ruta_salida='Informe_Gestion.xlsx'):
    """Ejecuta el pipeline completo y escribe el informe en Excel."""
    df_proc = estandarizar(df)
    df_proc = calcular_fuera_plazo(df_proc)
    resumen, c1, c2, c3, c4, c5, c6, c7 = generar_tablas(df_proc)

    with pd.ExcelWriter(ruta_salida, engine='openpyxl') as writer:
        pd.DataFrame([resumen]).T.to_excel(
            writer, sheet_name='1_Resumen_Ejecutivo', header=False)
        c1.to_excel(writer, sheet_name='2_C3.1A_Resoluciones_DL701')
        c2.to_excel(writer, sheet_name='3_C3.1B_Resoluciones_Ley20283')
        c3.to_excel(writer, sheet_name='4_C3.2_Bonificaciones')
        c4.to_excel(writer, sheet_name='5_C3.3A_Superficie_DL701')
        c5.to_excel(writer, sheet_name='6_C3.3B_Superficie_Ley20283')
        c6.to_excel(writer, sheet_name='7_C3.4_Cumplimiento_Plazos')
        c7.to_excel(writer, sheet_name='8_C3.5_Tiempos_Tramitacion')

    print(f"Informe generado: '{ruta_salida}'")

# =============================================================================
# ENTRADA PRINCIPAL
# =============================================================================

if __name__ == "__main__":
    df_raw = cargar_datos()
    print(f"Registros cargados: {len(df_raw):,}")
    exportar_informe(df_raw)
