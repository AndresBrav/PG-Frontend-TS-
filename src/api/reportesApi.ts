import { api, configConToken } from './http';
import type { MiProgreso, ReporteGrupo, Rol } from '../types/dominio';

export const obtenerReporteGrupo = async (
    clave: string,
    grupoId: number | string,
    rol: Extract<Rol, 'profesor' | 'admin'>,
): Promise<ReporteGrupo> => {
    const base = rol === 'admin' ? '/admin' : '/profesor';
    const { data } = await api.get<ReporteGrupo>(
        `${base}/grupos/${grupoId}/reporte`,
        configConToken(clave),
    );
    return data;
};

/** Progreso propio del usuario autenticado (fijos + IA) para el dashboard. */
export const obtenerMiProgreso = async (
    clave: string,
): Promise<MiProgreso> => {
    const { data } = await api.get<MiProgreso>(
        '/usuarios/me/progreso',
        configConToken(clave),
    );
    return data;
};
