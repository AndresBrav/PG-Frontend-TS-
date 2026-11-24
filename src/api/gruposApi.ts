import { api, configConToken } from './http';
import type {
    EjercicioAbierto,
    EjercicioGrupo,
    EntregaGrupo,
    EstudianteGrupo,
    CasoPruebaGrupo,
    GrupoEstudiante,
    GrupoProfesor,
    RankingGrupo,
    TemarioGrupo,
} from '../types/dominio';

/**
 * Cliente del módulo de grupos. El token va en Authorization tal cual
 * (sin Bearer). Profesor: /profesor/*; estudiante: /estudiante/*.
 */

// ===================== PROFESOR: GRUPOS =====================

export const crearGrupo = async (
    clave: string,
    nombre: string,
): Promise<GrupoProfesor> => {
    const { data } = await api.post<GrupoProfesor>(
        '/profesor/grupos',
        { nombre },
        configConToken(clave),
    );
    return data;
};

export const listarMisGruposProfesor = async (
    clave: string,
): Promise<GrupoProfesor[]> => {
    const { data } = await api.get<GrupoProfesor[]>(
        '/profesor/grupos',
        configConToken(clave),
    );
    return data;
};

export const obtenerGrupoProfesor = async (
    clave: string,
    grupoId: number | string,
): Promise<(GrupoProfesor & { estudiantes: EstudianteGrupo[] }) | null> => {
    const { data } = await api.get<
        GrupoProfesor & { estudiantes: EstudianteGrupo[] }
    >(`/profesor/grupos/${grupoId}`, configConToken(clave));
    return data;
};

export type EstadoInscripcionSIS =
    | 'agregado'
    | 'ya_inscrito'
    | 'no_encontrado'
    | 'no_es_estudiante';

export interface ResultadoInscripcionSIS {
    codigo: string;
    estado: EstadoInscripcionSIS;
}

export const agregarEstudiantesPorCodigo = async (
    clave: string,
    grupoId: number | string,
    codigos: string[],
): Promise<ResultadoInscripcionSIS[]> => {
    const { data } = await api.post<{ resultados: ResultadoInscripcionSIS[] }>(
        `/profesor/grupos/${grupoId}/estudiantes`,
        { codigos },
        configConToken(clave),
    );
    return data.resultados;
};

export const eliminarGrupo = async (
    clave: string,
    grupoId: number | string,
): Promise<void> => {
    await api.delete(`/profesor/grupos/${grupoId}`, configConToken(clave));
};

// ===================== PROFESOR: TEMARIOS =====================

export const listarTemariosGrupo = async (
    clave: string,
    grupoId: number | string,
): Promise<TemarioGrupo[]> => {
    const { data } = await api.get<TemarioGrupo[]>(
        `/profesor/grupos/${grupoId}/temarios`,
        configConToken(clave),
    );
    return data;
};

export const crearTemarioGrupo = async (
    clave: string,
    grupoId: number | string,
    nombre: string,
): Promise<TemarioGrupo> => {
    const { data } = await api.post<TemarioGrupo>(
        `/profesor/grupos/${grupoId}/temarios`,
        { nombre },
        configConToken(clave),
    );
    return data;
};

export const renombrarTemarioGrupo = async (
    clave: string,
    temarioId: number | string,
    nombre: string,
): Promise<void> => {
    await api.put(
        `/profesor/temarios/${temarioId}`,
        { nombre },
        configConToken(clave),
    );
};

export const eliminarTemarioGrupo = async (
    clave: string,
    temarioId: number | string,
): Promise<void> => {
    await api.delete(`/profesor/temarios/${temarioId}`, configConToken(clave));
};

// ===================== PROFESOR: EJERCICIOS =====================

export interface DatosNuevoEjercicio {
    temario_id: number;
    titulo: string;
    enunciado: string;
    tipo: 'diagrama' | 'pseudocodigo';
    puntos: number;
    fecha_limite?: string | null;
    casos_prueba?: CasoPruebaGrupo[];
}

export const crearEjercicioGrupo = async (
    clave: string,
    grupoId: number | string,
    datos: DatosNuevoEjercicio,
): Promise<EjercicioGrupo> => {
    const { data } = await api.post<EjercicioGrupo>(
        `/profesor/grupos/${grupoId}/ejercicios`,
        datos,
        configConToken(clave),
    );
    return data;
};

export const listarEjerciciosGrupoProfesor = async (
    clave: string,
    grupoId: number | string,
): Promise<EjercicioGrupo[]> => {
    const { data } = await api.get<EjercicioGrupo[]>(
        `/profesor/grupos/${grupoId}/ejercicios`,
        configConToken(clave),
    );
    return data;
};

export const listarEjerciciosGrupoAdmin = async (
    clave: string,
    grupoId: number | string,
): Promise<EjercicioGrupo[]> => {
    const { data } = await api.get<EjercicioGrupo[]>(
        `/admin/grupos/${grupoId}/ejercicios`,
        configConToken(clave),
    );
    return data;
};

export const eliminarEjercicioGrupo = async (
    clave: string,
    ejercicioId: number | string,
): Promise<void> => {
    await api.delete(
        `/profesor/ejercicios/${ejercicioId}`,
        configConToken(clave),
    );
};

export const listarSolucionesEjercicio = async (
    clave: string,
    ejercicioId: number | string,
): Promise<EntregaGrupo[]> => {
    const { data } = await api.get<EntregaGrupo[]>(
        `/profesor/ejercicios/${ejercicioId}/soluciones`,
        configConToken(clave),
    );
    return data;
};

export const listarSolucionesEjercicioAdmin = async (
    clave: string,
    grupoId: number | string,
    ejercicioId: number | string,
): Promise<EntregaGrupo[]> => {
    const { data } = await api.get<EntregaGrupo[]>(
        `/admin/grupos/${grupoId}/ejercicios/${ejercicioId}/soluciones`,
        configConToken(clave),
    );
    return data;
};

/** Califica la entrega de UN estudiante en UN ejercicio (puntos 0-100
 * + comentario). Afecta solo al par (ejercicio, estudiante). */
export const calificarEntregaGrupo = async (
    clave: string,
    ejercicioId: number | string,
    estudianteId: number,
    puntosProfesor: number,
    comentario: string | null,
): Promise<void> => {
    await api.put(
        `/profesor/ejercicios/${ejercicioId}/calificar/${estudianteId}`,
        { puntos_profesor: puntosProfesor, comentario },
        configConToken(clave),
    );
};

// ===================== RANKING (ambos roles) =====================

export const obtenerRankingGrupo = async (
    clave: string,
    grupoId: number | string,
): Promise<RankingGrupo> => {
    const { data } = await api.get<RankingGrupo>(
        `/profesor/grupos/${grupoId}/ranking`,
        configConToken(clave),
    );
    return data;
};

export const obtenerRankingGrupoAdmin = async (
    clave: string,
    grupoId: number | string,
): Promise<RankingGrupo> => {
    const { data } = await api.get<RankingGrupo>(
        `/admin/grupos/${grupoId}/ranking`,
        configConToken(clave),
    );
    return data;
};

export const obtenerRankingGrupoEstudiante = async (
    clave: string,
    grupoId: number | string,
): Promise<RankingGrupo> => {
    const { data } = await api.get<RankingGrupo>(
        `/estudiante/grupos/${grupoId}/ranking`,
        configConToken(clave),
    );
    return data;
};

// ===================== ESTUDIANTE =====================

export const unirseAGrupo = async (
    clave: string,
    codigo: string,
): Promise<GrupoEstudiante> => {
    const { data } = await api.post<GrupoEstudiante>(
        '/estudiante/grupos/unirse',
        { codigo },
        configConToken(clave),
    );
    return data;
};

export const listarMisGruposEstudiante = async (
    clave: string,
): Promise<GrupoEstudiante[]> => {
    const { data } = await api.get<GrupoEstudiante[]>(
        '/estudiante/grupos',
        configConToken(clave),
    );
    return data;
};

export const salirDeGrupo = async (
    clave: string,
    grupoId: number | string,
): Promise<void> => {
    await api.delete(`/estudiante/grupos/${grupoId}`, configConToken(clave));
};

export const listarTemariosGrupoEstudiante = async (
    clave: string,
    grupoId: number | string,
): Promise<TemarioGrupo[]> => {
    const { data } = await api.get<TemarioGrupo[]>(
        `/estudiante/grupos/${grupoId}/temarios`,
        configConToken(clave),
    );
    return data;
};

export const listarEjerciciosGrupoEstudiante = async (
    clave: string,
    grupoId: number | string,
): Promise<EjercicioGrupo[]> => {
    const { data } = await api.get<EjercicioGrupo[]>(
        `/estudiante/grupos/${grupoId}/ejercicios`,
        configConToken(clave),
    );
    return data;
};

export const abrirEjercicioGrupo = async (
    clave: string,
    grupoId: number | string,
    ejercicioId: number | string,
): Promise<EjercicioAbierto> => {
    const { data } = await api.get<EjercicioAbierto>(
        `/estudiante/grupos/${grupoId}/ejercicios/${ejercicioId}`,
        configConToken(clave),
    );
    return data;
};

export const guardarEstadoEjercicioGrupo = async (
    clave: string,
    grupoId: number | string,
    ejercicioId: number | string,
    estadoTablero: string,
): Promise<void> => {
    await api.put(
        `/estudiante/grupos/${grupoId}/ejercicios/${ejercicioId}/estado`,
        { estado_tablero: estadoTablero },
        configConToken(clave),
    );
};

/** Entrega el ejercicio (puntos solo la primera vez). */
export const completarEjercicioGrupo = async (
    clave: string,
    grupoId: number | string,
    ejercicioId: number | string,
    estadoTablero: string | null,
    resultadoCasosPrueba: EntregaGrupo['resultado_casos_prueba'] = null,
): Promise<{ completado: boolean; puntosGanados: number; puntos: number }> => {
    const { data } = await api.post<{
        completado: boolean;
        puntosGanados: number;
        puntos: number;
    }>(
        `/estudiante/grupos/${grupoId}/ejercicios/${ejercicioId}/completar`,
        {
            estado_tablero: estadoTablero,
            resultado_casos_prueba: resultadoCasosPrueba,
        },
        configConToken(clave),
    );
    return data;
};
