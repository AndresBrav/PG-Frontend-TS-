import { api, configConToken } from './http';
import type { MiProgreso } from '../types/dominio';

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
