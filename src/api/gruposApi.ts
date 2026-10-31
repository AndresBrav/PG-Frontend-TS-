import { api, configConToken } from './http';
import type {
    GrupoCreado,
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
