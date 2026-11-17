import { api, configConToken } from './http';
import type {
    EstadisticasAdmin,
    EstudianteAdmin,
    GrupoAdmin,
} from '../types/dominio';

export const listarGruposAdmin = async (
    clave: string,
): Promise<GrupoAdmin[]> => {
    const { data } = await api.get<GrupoAdmin[]>(
        '/admin/grupos',
        configConToken(clave),
    );
    return data;
};

export const obtenerEstadisticasAdmin = async (
    clave: string,
): Promise<EstadisticasAdmin> => {
    const { data } = await api.get<EstadisticasAdmin>(
        '/admin/estadisticas',
        configConToken(clave),
    );
    return data;
};

export const listarEstudiantesAdmin = async (
    clave: string,
): Promise<EstudianteAdmin[]> => {
    const { data } = await api.get<EstudianteAdmin[]>(
        '/admin/estudiantes',
        configConToken(clave),
    );
    return data;
};
