import { api, configConToken } from './http';
import type {
    DatosCrearProfesor,
    EstadisticasAdmin,
    EstudianteAdmin,
    GrupoAdmin,
    ProfesorAdmin,
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

export const listarProfesoresAdmin = async (
    clave: string,
): Promise<ProfesorAdmin[]> => {
    const { data } = await api.get<ProfesorAdmin[]>(
        '/admin/profesores',
        configConToken(clave),
    );
    return data;
};

export const crearProfesorAdmin = async (
    clave: string,
    datos: DatosCrearProfesor,
): Promise<{ id: number; codigo: string; username: string; rol: string }> => {
    const { data } = await api.post(
        '/admin/profesores',
        datos,
        configConToken(clave),
    );
    return data;
};

export const listarGruposAdmin = async (
    clave: string,
): Promise<GrupoAdmin[]> => {
    const { data } = await api.get<GrupoAdmin[]>(
        '/admin/grupos',
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
