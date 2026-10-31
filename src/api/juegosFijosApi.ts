import { api, configConToken } from './http';

export interface EstadoJuegoFijoResponse {
    juego_id: number;
    completado: boolean;
    puntos: number;
    estado_juego: string | null;
    ultima_actividad: string | null;
}

export const obtenerEstadoJuegoApi = async (
    clave: string,
    juegoId: number | string,
): Promise<EstadoJuegoFijoResponse | null> => {
    try {
        const response = await api.get<EstadoJuegoFijoResponse>(
            `/juegos/estado/${juegoId}`,
            configConToken(clave),
        );
        return response.data;
    } catch (error) {
        console.error('Error al obtener estado del juego fijo:', error);
        return null;
    }
};

export const guardarEstadoJuegoApi = async (
    clave: string,
    juegoId: number | string,
    estadoJuego: any,
): Promise<boolean> => {
    try {
        await api.put(
            `/juegos/guardarEstado/${juegoId}`,
            { estado_juego: estadoJuego },
            configConToken(clave),
        );
        return true;
    } catch (error) {
        console.error('Error al guardar estado del juego fijo:', error);
        return false;
    }
};

export const reiniciarEstadoJuegoApi = async (
    clave: string,
    juegoId: number | string,
): Promise<boolean> => {
    try {
        await api.put(
            `/juegos/reiniciarEstado/${juegoId}`,
            {},
            configConToken(clave),
        );
        return true;
    } catch (error) {
        console.error('Error al reiniciar estado del juego fijo:', error);
        return false;
    }
};
