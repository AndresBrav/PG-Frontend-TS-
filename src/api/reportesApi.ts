import { api, configConToken } from './http';
import type {
    ReporteEstudiante,
    ReporteGrupo,
    Rol,
} from '../types/dominio';

export const obtenerMiProgreso = async (
    clave: string,
): Promise<ReporteEstudiante> => {
    const { data } = await api.get<ReporteEstudiante>(
        '/estudiante/progreso',
        configConToken(clave),
    );
    return data;
};

export const obtenerReporteGrupo = async (
    clave: string,
    grupoId: number,
    rol: Rol,
    desde?: string,
    hasta?: string,
): Promise<ReporteGrupo> => {
    const ruta =
        rol === 'admin'
            ? `/admin/grupos/${grupoId}/reporte`
            : `/profesor/grupos/${grupoId}/reporte`;

    const { data } = await api.get<ReporteGrupo>(ruta, {
        ...configConToken(clave),
        params: { desde, hasta },
    });

    return data;
};

export const obtenerReporteEstudiante = async (
    clave: string,
    estudianteId: number,
    rol: Rol,
): Promise<ReporteEstudiante> => {
    const ruta =
        rol === 'admin'
            ? `/admin/estudiantes/${estudianteId}/reporte`
            : `/profesor/estudiantes/${estudianteId}/reporte`;

    const { data } = await api.get<ReporteEstudiante>(
        ruta,
        configConToken(clave),
    );

    return data;
};
