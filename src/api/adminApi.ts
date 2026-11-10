import { api, configConToken } from './http';
import type {
    EstadisticasAdmin,
    EstudianteAdmin,
} from '../types/dominio';

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
