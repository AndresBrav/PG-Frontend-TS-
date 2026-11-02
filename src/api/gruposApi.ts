import { api, configConToken } from './http';
import type {
    DatosCrearEjercicioGrupo,
    DetalleSolucionesGrupo,
    EjercicioGrupoEstudiante,
    EjercicioGrupoProfesor,
    EstudianteRankingGrupo,
    GrupoCreado,
    GrupoDetalle,
    GrupoEstudiante,
    GrupoProfesor,
} from '../types/dominio';

export const listarMisGrupos = async (
    clave: string,
): Promise<GrupoEstudiante[]> => {
    const { data } = await api.get<GrupoEstudiante[]>(
        '/estudiante/grupos',
        configConToken(clave),
    );
    return data;
};

export const unirseAGrupo = async (
    clave: string,
    codigo: string,
): Promise<GrupoCreado> => {
    const { data } = await api.post<GrupoCreado>(
        '/estudiante/grupos/unirse',
        { codigo },
        configConToken(clave),
    );
    return data;
};

export const salirDeGrupo = async (
    clave: string,
    grupoId: number,
): Promise<void> => {
    await api.delete(
        `/estudiante/grupos/${grupoId}`,
        configConToken(clave),
    );
};

export const listarGruposProfesor = async (
    clave: string,
): Promise<GrupoProfesor[]> => {
    const { data } = await api.get<GrupoProfesor[]>(
        '/profesor/grupos',
        configConToken(clave),
    );
    return data;
};

export const crearGrupo = async (
    clave: string,
    nombre: string,
): Promise<GrupoCreado> => {
    const { data } = await api.post<GrupoCreado>(
        '/profesor/grupos',
        { nombre },
        configConToken(clave),
    );
    return data;
};

export const eliminarGrupo = async (
    clave: string,
    grupoId: number,
): Promise<void> => {
    await api.delete(
        `/profesor/grupos/${grupoId}`,
        configConToken(clave),
    );
};

export const obtenerDetalleGrupo = async (
    clave: string,
    grupoId: number,
): Promise<GrupoDetalle> => {
    const { data } = await api.get<GrupoDetalle>(
        `/profesor/grupos/${grupoId}`,
        configConToken(clave),
    );
    return data;
};

// -------------------------------------------------------------
// Ejercicios de Grupo (Profesor)
// -------------------------------------------------------------

export const listarEjerciciosGrupoProfesor = async (
    clave: string,
    grupoId: number,
): Promise<EjercicioGrupoProfesor[]> => {
    const { data } = await api.get<EjercicioGrupoProfesor[]>(
        `/profesor/grupos/${grupoId}/ejercicios`,
        configConToken(clave),
    );
    return data;
};

export const crearEjercicioGrupo = async (
    clave: string,
    grupoId: number,
    datos: DatosCrearEjercicioGrupo,
): Promise<EjercicioGrupoProfesor> => {
    const { data } = await api.post<EjercicioGrupoProfesor>(
        `/profesor/grupos/${grupoId}/ejercicios`,
        datos,
        configConToken(clave),
    );
    return data;
};

export const eliminarEjercicioGrupo = async (
    clave: string,
    ejercicioId: number,
): Promise<void> => {
    await api.delete(
        `/profesor/ejercicios/${ejercicioId}`,
        configConToken(clave),
    );
};

export const listarSolucionesEjercicio = async (
    clave: string,
    ejercicioId: number,
    estudianteId?: number,
): Promise<DetalleSolucionesGrupo> => {
    const query = estudianteId ? `?estudianteId=${estudianteId}` : '';
    const { data } = await api.get<DetalleSolucionesGrupo>(
        `/profesor/ejercicios/${ejercicioId}/soluciones${query}`,
        configConToken(clave),
    );
    return data;
};

export const calificarEntrega = async (
    clave: string,
    ejercicioId: number,
    estudianteId: number,
    puntos: number,
): Promise<{ message: string }> => {
    const { data } = await api.put<{ message: string }>(
        `/profesor/ejercicios/${ejercicioId}/calificar/${estudianteId}`,
        { puntos },
        configConToken(clave),
    );
    return data;
};

// -------------------------------------------------------------
// Ejercicios de Grupo (Estudiante)
// -------------------------------------------------------------

export const listarEjerciciosGrupoEstudiante = async (
    clave: string,
    grupoId: number,
): Promise<EjercicioGrupoEstudiante[]> => {
    const { data } = await api.get<EjercicioGrupoEstudiante[]>(
        `/estudiante/grupos/${grupoId}/ejercicios`,
        configConToken(clave),
    );
    return data;
};

export const obtenerEjercicioEstudiante = async (
    clave: string,
    grupoId: number,
    ejercicioId: number,
): Promise<EjercicioGrupoEstudiante> => {
    const { data } = await api.get<EjercicioGrupoEstudiante>(
        `/estudiante/grupos/${grupoId}/ejercicios/${ejercicioId}`,
        configConToken(clave),
    );
    return data;
};

export const guardarEstadoEjercicioEstudiante = async (
    clave: string,
    grupoId: number,
    ejercicioId: number,
    estadoTablero: any,
): Promise<void> => {
    await api.put(
        `/estudiante/grupos/${grupoId}/ejercicios/${ejercicioId}/estado`,
        { estado_tablero: estadoTablero },
        configConToken(clave),
    );
};

export const entregarEjercicioEstudiante = async (
    clave: string,
    grupoId: number,
    ejercicioId: number,
    estadoTablero: any,
): Promise<void> => {
    await api.post(
        `/estudiante/grupos/${grupoId}/ejercicios/${ejercicioId}/completar`,
        { estado_tablero: estadoTablero },
        configConToken(clave),
    );
};

export const obtenerRankingGrupo = async (
    clave: string,
    grupoId: number,
    esProfesor: boolean,
): Promise<EstudianteRankingGrupo[]> => {
    const prefijo = esProfesor ? '/profesor' : '/estudiante';
    const { data } = await api.get<EstudianteRankingGrupo[]>(
        `${prefijo}/grupos/${grupoId}/ranking`,
        configConToken(clave),
    );
    return data;
};
